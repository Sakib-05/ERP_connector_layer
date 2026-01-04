from pymongo import MongoClient
from dotenv import dotenv_values


# MongoDB URI from .env file and setup client to get database
config = dotenv_values(".env")
mongodb_uri = config.get("MONGODB_URI")
client = MongoClient(mongodb_uri)

# save access and refresh tokens to the database for persisency and not having to do OAuth flow every time
def save_tokens(access_token, refresh_token=None):
    try:
        database = client["TaxStar-Dev-Cluster"]
        tokens_collection = database["tokens"]

        # insert token if not present, else update existing access token
        access_token_document = tokens_collection.find_one({"_id": "access"})
        if access_token_document:
            tokens_collection.update_one({"_id": "access"}, {"$set": {"access_token": access_token}})
        else:
            tokens_collection.insert_one({"_id": "access", "access_token": access_token})
        
        # insert refresh token if not present, else update existing refresh token
        if refresh_token is not None:
            refresh_token_document = tokens_collection.find_one({"_id": "refresh"})
            if refresh_token_document:
                tokens_collection.update_one({"_id": "refresh"}, {"$set": {"refresh_token": refresh_token}})
            else:
                tokens_collection.insert_one({"_id": "refresh", "refresh_token": refresh_token})
    
    except Exception as e:
        print(f"An error occurred while saving tokens: {e}")

# fetch access and refresh tokens from the database
def get_tokens():
    try:
        database = client["TaxStar-Dev-Cluster"]
        tokens_collection = database["tokens"]
        access_token_document = tokens_collection.find_one({"_id": "access"})
        access_token = access_token_document["access_token"] if access_token_document else None
      
        refresh_token_document = tokens_collection.find_one({"_id": "refresh"})
        refresh_token = refresh_token_document["refresh_token"] if refresh_token_document else None

        # return tuple of access and refresh tokens
        return access_token, refresh_token
    
    except Exception as e:
        print(f"An error occurred while getting tokens: {e}")


# save invoice data to the database by passing invoice json object
def save_invoice(invoice_data):
    try:
        database = client["TaxStar-Dev-Cluster"]
        invoices_collection = database["invoices"]
        invoices_collection.insert_one(invoice_data)
    except Exception as e:
        print(f"An error occurred while saving invoice: {e}")

# fetch all invoices from the database
def get_invoices():
    try:
        database = client["TaxStar-Dev-Cluster"]
        invoices_collection = database["invoices"]
        invoices = list(invoices_collection.find())
        return invoices
    
    except Exception as e:
        print(f"An error occurred while fetching invoices: {e}")
        return []