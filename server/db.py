import os
from pymongo import MongoClient
from dotenv import dotenv_values


# MongoDB URI from .env file and setup client to get database
if os.path.exists(".env"):
    config = dotenv_values(".env")
else:
    config = dict(os.environ)

mongodb_uri = config.get("MONGODB_URI")
client = MongoClient(mongodb_uri)

# save access and refresh tokens to the database for persisency and not having to do OAuth flow every time
def save_tokens_data(access_token, refresh_token, connected_tenants):
    try:
        database = client["TaxStar-database"]
        tokens_collection = database["tokens"]

        update_data = {
            "access_token": access_token,
            "refresh_token": refresh_token
        }
        if connected_tenants and len(connected_tenants) > 0:
            update_data["connected_tenants"] = connected_tenants
        
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
            
            # return the tokens
            return access_token, refresh_token
        else:
            print("No tokens found in the database.")
            return None, None
    
    except Exception as e:
        print(f"An error occurred while getting tokens: {e}")

# fetch all connected tenants from the database
def get_all_tenants():
    try:
        database = client["TaxStar-database"]
        tokens_collection = database["tokens"]
        saved_tokens_data = tokens_collection.find_one({"_id": "xero_auth_tokens"})

        if saved_tokens_data:
            connected_tenants = saved_tokens_data.get("connected_tenants", [])
            return connected_tenants
        else:
            print("No tokens found in the database.")
            return []
    
    except Exception as e:
        print(f"An error occurred while fetching tenants: {e}")
        return []

# save invoice data to the database by passing invoice json object
def save_invoice(invoice_data):
    try:
        database = client["TaxStar-database"]
        invoices_collection = database["invoices"]

        invoice_id = invoice_data.get("InvoiceID")

        # make sure InvoiceID exists to not save corrupted data
        if not invoice_id:
            print("ERROR: Invoice missing InvoiceID, cannot save")
            return 

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
        # Convert ObjectId to string for JSON serialization
        for invoice in invoices:
            invoice["_id"] = str(invoice["_id"])
        return invoices
    
    except Exception as e:
        print(f"An error occurred while fetching invoices: {e}")
        return []

# check if user aleady exists
def check_user_login_data(userData):
    try:
        database = client["TaxStar-database"]
        users_collection = database["users"]
        user = users_collection.find_one({"email": userData.get("email") , "password": userData.get("password")})
        return user is not None
    
    except Exception as e:
        print(f"An error occurred while checking user existence: {e}")
        return False


# add new user to the database with username and password
def add_user(userData):
    try:
        database = client["TaxStar-database"]
        users_collection = database["users"]
        users_collection.insert_one(userData)
    
    except Exception as e:
        print(f"An error occurred while adding user: {e}")