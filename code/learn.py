import csv
import json

def main():

    # Open json file
    myjson = []
    with open("../data/data.json", "r") as data:
        myjson += json.loads(data.read())["data"]

    print myjson[0]

        
    # Write to 'pins.csv'. Remember to write a header.
    with open("viztwo_data.csv", "wb") as f:
        writer = csv.writer(f)
        writer.writerow(["Category", "Event Name", "Gender", "Age", "Marital Status", "Session ID", "Device", "Amount", "Client Time", "City", "State", "Latitude", "Longitude", "Zip Code"])
        
        for entry in myjson:
            if "amount" in entry:
                amount = entry["amount"]
            else:
                amount = ""
            city = entry["location"]["city"]
            state = entry["location"]["state"]
            lat = entry["location"]["latitude"]
            lon = entry["location"]["longitude"]
            zipcode = entry["location"]["zip_code"]
            writer.writerow([entry["category"].encode("utf-8"),
                            entry["event_name"].encode("utf-8"),
                            entry["gender"].encode("utf-8"),
                            entry["age"].encode("utf-8"),
                            entry["marital_status"].encode("utf-8"),
                            entry["session_id"].encode("utf-8"),
                            entry["device"].encode("utf-8"),
                            amount,
                            str(entry["client_time"]).encode("utf-8"),
                            city.encode("utf-8"),
                            state.encode("utf-8"),
                            str(lat).encode("utf-8"),
                            str(lon).encode("utf-8"),
                            zipcode.encode("utf-8")])

if __name__ == "__main__":
    main()
 
