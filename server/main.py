# modules to import
import os
from dotenv import dotenv_values
# request is sinlgular and its to get data from requests
from flask import Flask, request, jsonify, redirect
from urllib.parse import urlencode
# pay attention, requests is plural and it is a library to make http requests
import requests
# import database functions
from db import get_all_tenants, save_invoice, get_invoices, save_tokens_data, get_tokens

# standard python libraries
import hmac
import base64
import hashlib

# CORS for cross origin requests
from flask_cors import CORS


# Load from .env file locally, fall back to system environment on Heroku
if os.path.exists(".env"):
    config = dotenv_values(".env")
else:
    config = dict(os.environ)


app = Flask(__name__)
# access to invoices and tenants
CORS(app, resources={r"/invoices/*": {"origins": "http://localhost:3000"}, 
                     r"/tenants": {"origins": "http://localhost:3000"},
                     r"/auth/*": {"origins": "http://localhost:3000"}})


# host using github education domain




def verify_signature():
    # body is asynchronous in FastAPI
    payload = request.data
    header_signature = request.headers.get("x-xero-Signature")

    webhook_key = config.get("XERO_WEBHOOK_KEY")

    """ 
    
    process to check if the request is from Xero:
    1. Hash the payload using HMACSHA256 with webhook signing key
        hashed_payload = HMACSHA256(payload,webhook_key)
    2. Base64 encode the hashed payload
        computed_result = Base64(hashed_payload)
    3. Compare the computed_result with the signature in the header
        if they are equal then the request is from Xero
    
    reference: Xero's webhook documentation
    
    """

    # hmac.new parameters: key: bytes, message: bytes, digestmod: callable
    # webhook_key is a string so needs to be encoded into bytes first
    # HMACSHA256 using hashlib.sha256
    hashed_payload = hmac.new(webhook_key.encode(),payload,hashlib.sha256)

    # b64encode parameters: bytes-like object
    # hmac.new() returns a HMAC object --> call .digest() to get the byte-like object
    # .b64encode() returns bytes object --> decode to get string
    computed_signature = base64.b64encode(hashed_payload.digest()).decode()

    # standard way to compare signatures
    return hmac.compare_digest(computed_signature, header_signature)





@app.get("/")
def root():
    return jsonify({"message": "Hello World flask app is running!"})

@app.post("/webhooks/xero")
def xero_webhook():
    if not verify_signature():
        return (jsonify({"error": "body signature does not match header signature"}), 401)
        # raise HTTPException(status_code=401, detail="body signature does not match header signature")
    print("Xero Webhook received and verified")

    payload_dict = request.json
    print("Request payload json:", payload_dict)

    all_events = payload_dict.get("events", [])
    for event in all_events:
        # filter to get only INVOICE events
        if event.get("eventCategory") == "INVOICE":
            # UPDATE or CREATE event
            print("Event type:", event.get("eventType"))
            # the URL containing the actual information for this event
            print("Resource URL:", event.get("resourceUrl"))
            # date and time of the event
            print("Date time:", event.get("eventDateUtc"))
            # Id of the tenant
            print("Tenant Id:", event.get("tenantId", "Not provided"))

            # GET request to the resource URL to fetch the actual invoice data for the correct tenant
            access_token, refresh_token= get_tokens()
            tenant_id = event.get("tenantId", "")
            headers = {"Authorization": "Bearer " + access_token, "accept": "application/json", "xero-tenant-id": tenant_id}

            try:
                invoices_request_response = requests.get(event.get("resourceUrl"), headers=headers)

                if invoices_request_response.status_code == 401:
                    print("Access token expired, Access token is being refreshed")
                    # get new access token, which also updates the tokens in the database
                    access_token = refresh_access_token(refresh_token)
                    # update the headers with the new access token
                    headers["Authorization"] = "Bearer " + access_token
                    # retry the GET request to fetch invoice data
                    invoices_request_response = requests.get(event.get("resourceUrl"), headers=headers)
                
                # the response wraps the invoice data in an "Invoices" array, which is why the invoices field has to be first called
                invoice_data = invoices_request_response.json()["Invoices"][0]
                # add tenant_id to the invoice data for filterting later
                invoice_data["tenantId"] = tenant_id

                print("Invoice data fetched from Xero API:", invoice_data)

                # save the invoice data to the database
                save_invoice(invoice_data)
            except Exception as e:
                print(f"An error occurred while fetching invoice data: {e}")


    return {"message": "Xero Webhook received and new invoice added to the database"}





# function to get new access token when previous one expires
def refresh_access_token(refresh_token):
    # authorization header with client id and client secret
    header = {"authorization" : "Basic "+ base64.b64encode((config.get("XERO_CLIENT_ID")+":" + config.get("XERO_CLIENT_SECRET")).encode()).decode()}

    # request body parameters
    request_body = {
        "grant_type": "refresh_token",
        "refresh_token" : refresh_token
    }

    # POST to the token endpoint
    token_request_response = requests.post("https://identity.xero.com/connect/token", headers=header, data=request_body)
    access_token = token_request_response.json().get("access_token")
    refresh_token = token_request_response.json().get("refresh_token")
    # store the new pair of tokens in the database
    save_tokens_data(access_token, refresh_token, get_all_tenants())

    # return the new access token
    return access_token


@app.get("/auth/login")
def redirect_to_xero_login():
    # these are the values needed in the URL query parameters to redirect to Xero login page and request authorization
    url_params_dict = {
        "response_type": "code",
        "client_id": config.get("XERO_CLIENT_ID"),
        "redirect_uri": "https://evening-thicket-01409-436e1b971897.herokuapp.com/callback",
        # scope - refresh token for offline access and read access to accounting API
        "scope": "offline_access accounting.transactions.read",
        "state": "123"
    }
    query_string = urlencode(url_params_dict)
    # redirect to Xero login page with the query parameters
    return redirect(f"https://login.xero.com/identity/connect/authorize?{query_string}")

@app.get("/callback")
def callback():
    # get the authorization code from the query parameters, from the http get request. Store it in the config dictionary
    authorisation_code = request.args.get("code")
    config["AUTH_CODE"] = authorisation_code

    # URL from Xero to exchange the authorisation code for access token and refresh token
    url = "https://identity.xero.com/connect/token"
    # Xero requires the request to have Basic Auth with client id and client secret
    headers = {"authorization" : "Basic "+ base64.b64encode((config.get("XERO_CLIENT_ID")+":" + config.get("XERO_CLIENT_SECRET")).encode()).decode()}
    # request body parameters
    request_body = {
        "grant_type": "authorization_code",
        "code" : authorisation_code,
        "redirect_uri": "https://evening-thicket-01409-436e1b971897.herokuapp.com/callback"
    }
    # make the post request to exchange the authorisation code for access token and refresh token
    token_request_response = requests.post(url, headers=headers, data=request_body)
    access_token = token_request_response.json().get("access_token")
    refresh_token = token_request_response.json().get("refresh_token")
    
    # use the access token to get the connections (tenants) associated with this Xero app
    headers = {"Authorization": "Bearer " + access_token, "Content-Type": "application/json"}
    connections_request_response = requests.get("https://api.xero.com/connections", headers=headers)
    connections = connections_request_response.json()

    # only store the tenantId, tenantName and tenantType
    tenants_list = [
        {
            "tenantId": connection.get("tenantId"),
            "tenantName": connection.get("tenantName"),
            "tenantType": connection.get("tenantType")
        }
        for connection in connections
    ]

    # store the tokens in the TaxStar database for persisency
    save_tokens_data(access_token, refresh_token, tenants_list)

    # redirect to the frontend myTenants page after successful authentication, but at the moment is is not complete
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    return redirect(f"{frontend_url}/myTenants")

# endpoint to get all connected tenants from the database
@app.get("/tenants")
def get_tenants():
    connected_tenants = get_all_tenants()
    return jsonify(connected_tenants)

# endpoint to check if user need to do authentication or not

@app.get("/auth/check")
def check_authentication():
    # get_tokens() returns (access_token, refresh_token) or (None, None)
    access_token, refresh_token = get_tokens()
    if access_token and refresh_token:
        return jsonify({"authenticated": True})
    else:
        return jsonify({"authenticated": False})


# endpoint to get all invoices for a specific tenant from the database
@app.get("/invoices/<tenant_id>")
def fetch_invoices(tenant_id):
    if not tenant_id:
        return jsonify({"error": "tenantId required"}), 400
    
    # on mongoDB invoices have the attribute tenantId
    filtered_invoices = [invoice for invoice in get_invoices() if invoice["tenantId"] == tenant_id]
    return jsonify(filtered_invoices)

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    app.run(host="0.0.0.0", port=port, debug=False)
    
