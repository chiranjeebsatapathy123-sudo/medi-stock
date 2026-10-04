import requests

base_url = "http://localhost:8080/api"
session = requests.Session()

# 1. Login
resp = session.post(f"{base_url}/auth/login", json={
    "email": "admin@medistock.com",
    "password": "admin123"
})
if resp.status_code == 200:
    token = resp.json().get("token")
    session.headers.update({"Authorization": f"Bearer {token}"})
    print("Login successful.")
else:
    print("Login failed:", resp.status_code, resp.text)
    exit(1)

# 2. Test Logistics Overview
resp = session.get(f"{base_url}/logistics/overview")
print("Logistics Overview:", resp.status_code)
if resp.status_code == 200:
    print(resp.json())

# 3. Create Shipment
resp = session.post(f"{base_url}/logistics/shipments", json={
    "shipmentNumber": "SHIP-TEST-1234",
    "originId": "LOC-CENTRAL",
    "destinationId": "LOC-ICU",
    "status": "PENDING",
    "priority": "HIGH",
    "temperatureMin": 2.0,
    "temperatureMax": 8.0
})
print("Create Shipment:", resp.status_code)
if resp.status_code == 200:
    shipment_id = resp.json().get("id")
    print("Created Shipment ID:", shipment_id)

    # 4. Update Shipment Status
    resp = session.put(f"{base_url}/logistics/shipments/{shipment_id}/status", json={"status": "IN_TRANSIT"})
    print("Update Shipment:", resp.status_code)

# 5. Test Facility Overview
resp = session.get(f"{base_url}/facility/overview")
print("Facility Overview:", resp.status_code)
