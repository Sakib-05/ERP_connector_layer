from pymongo import MongoClient
from dotenv import dotenv_values


# MongoDB URI from .env file and setup client to get database
config = dotenv_values(".env")
mongodb_uri = config.get("MONGODB_URI")
client = MongoClient(mongodb_uri)

# save access and refresh tokens to the database for persisency and not having to do OAuth flow every time
def save_tokens_data(access_token, refresh_token, tenant_id = None):
    try:
        database = client["TaxStar-database"]
        tokens_collection = database["tokens"]

        update_data = {
            "access_token": access_token,
            "refresh_token": refresh_token
        }
        if tenant_id:
            update_data["tenant_id"] = tenant_id
        
        tokens_collection.update_one({"_id": "xero_auth_tokens"}, {"$set": update_data}, upsert=True)

        
    
    except Exception as e:
        print(f"An error occurred while saving tokens: {e}")

# fetch access and refresh tokens from the database
def get_tokens():
    try:
        database = client["TaxStar-database"]
        tokens_collection = database["tokens"]
        saved_tokens_data = tokens_collection.find_one({"_id": "xero_auth_tokens"})

        if saved_tokens_data:
            access_token = saved_tokens_data["access_token"]
            refresh_token = saved_tokens_data["refresh_token"]
            tenant_id = saved_tokens_data.get("tenant_id")
            # return the tokens
            return access_token, refresh_token, tenant_id
        else:
            print("No tokens found in the database.")
            return None, None, None
    
    except Exception as e:
        print(f"An error occurred while getting tokens: {e}")


# save invoice data to the database by passing invoice json object
def save_invoice(invoice_data):
    try:
        database = client["TaxStar-database"]
        invoices_collection = database["invoices"]

        invoice_id = invoice_data.get("InvoiceID")
        # update existing invoice if InvoiceID exists, else insert new invoice
        invoices_collection.replace_one({"InvoiceID": invoice_id}, invoice_data, upsert=True)

    except Exception as e:
        print(f"An error occurred while saving invoice: {e}")

# fetch all invoices from the database
def get_invoices():
    try:
        database = client["TaxStar-database"]
        invoices_collection = database["invoices"]
        invoices = list(invoices_collection.find())
        return invoices
    
    except Exception as e:
        print(f"An error occurred while fetching invoices: {e}")
        return []

