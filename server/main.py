# modules to import
from fastapi import FastAPI, Request, HTTPException
from dotenv import dotenv_values

# standard python libraries
import hmac
import base64
import hashlib

config = dotenv_values(".env")

app = FastAPI()

async def verify_signature(request: Request):
    # body is asynchronous in FastAPI
    payload = await request.body()
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
    return {"message": "Hello World"}

@app.post("/webhooks/xero")
async def xero_webhook(request: Request):
    if not await verify_signature(request):
        raise HTTPException(status_code=401, detail="body signature does not match header signature")
    print("Xero Webhook received and verified")

    payload = await request.json()
    print("Request payload json:", payload)

    all_events = payload.get("events", [])
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
            print("Tenant Id:", event.get("tenantId"))

    return {"message": "Xero Webhook received and verified"}

        
    

