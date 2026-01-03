from pymongo import MongoClient
from dotenv import dotenv_values


try:
    # start example code here
    config = dotenv_values(".env")
    mongodb_uri = config.get("MONGODB_URI")
    client = MongoClient(mongodb_uri)

    # end example code here

    client.admin.command("ping")
    print("Connected successfully")
    database = client["TaxStar-Dev-Cluster"]

    invoices_collection = database["fruits"]

    # print all documents in the collection
    print("All documents in the collection:")
    fruits = list(invoices_collection.find({}))
    print(fruits)
    results = invoices_collection.find({ "color": "yellow" })
    print("Documents with color yellow:")
    for fruit in results:
        print(fruit)

    client.close()

except Exception as e:
    raise Exception(
        "The following error occurred: ", e)
