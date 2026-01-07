# modules to import
from dotenv import dotenv_values
# request is sinlgular and its to get data from requests
from flask import Flask, request, jsonify, redirect
from urllib.parse import urlencode
# pay attention, requests is plural and it is a library to make http requests
import requests
# import database functions
from server.db import save_invoice, get_invoices, save_tokens, get_tokens

# standard python libraries
import hmac
import base64
import hashlib

config = dotenv_values(".env")

app = Flask(__name__)

# oauth storing word token
# verify token
# fetch data from xero

# store invoice data in mongodb database




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
    print(config)
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
            tenant_id = event.get("tenantId")
            print("Tenant Id:", tenant_id)

            # GET request to the resource URL to fetch the actual invoice data for the correct tenant
            access_token, _ = get_tokens()
            headers = {"Authorization": "Bearer " + access_token, "accept": "application/json", "xero-tenant-id": tenant_id}

            try:
                invoices_request_response = requests.get(event.get("resourceUrl"), headers=headers)
                invoice_data = invoices_request_response.json()
                print("Invoice data fetched from Xero API:", invoice_data)

                # save the invoice data to the database
                save_invoice(invoice_data)
            except Exception as e:
                print(f"An error occurred while fetching invoice data: {e}")


    return {"message": "Xero Webhook received and new invoice added to the database"}

@app.get("/auth/login")
def redirect_to_xero_login():
    # these are the values needed in the URL query parameters to redirect to Xero login page and request authorization
    url_params_dict = {
    "response_type": "code",
    "client_id": config.get("XERO_CLIENT_ID"),
    "redirect_uri": "http://localhost:8000/callback",
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
    "redirect_uri": "http://localhost:8000/callback"
    }
    # make the post request to exchange the authorisation code for access token and refresh token
    token_request_response = requests.post(url, headers=headers, data=request_body)
    access_token = token_request_response.json().get("access_token")
    refresh_token = token_request_response.json().get("refresh_token")

    # store the tokens in the TaxStar database for persisency
    save_tokens(access_token, refresh_token)


    
    # use the access token to get the connections (tenants) associated with this Xero app
    headers = {"Authorization": "Bearer " + access_token, "Content-Type": "application/json"}
    connections_request_response = requests.get("https://api.xero.com/connections", headers=headers)
    connections = connections_request_response.json()

    return jsonify({"message": "Callback received", "authorisation_code": authorisation_code, "access_token": access_token, "connections": connections})
    

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
    
