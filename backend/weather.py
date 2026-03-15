import requests
import json

API_KEY = "2ea43430f5e20d5cb576000851d9ebdc"

LAT = 13.0827
LON = 80.2707

LAMBDA_URL = "https://rhujnvypykkdxgkm5vtobx4iuu0celdh.lambda-url.us-east-1.on.aws/"

url = f"https://api.openweathermap.org/data/2.5/forecast?lat={LAT}&lon={LON}&appid={API_KEY}&units=metric"

response = requests.get(url)

data = response.json()

rain_series = []

for entry in data["list"][:10]:   # next ~30 hours
    rain = 0

    if "rain" in entry and "3h" in entry["rain"]:
        rain = entry["rain"]["3h"]

    rain_series.append(rain)

payload = {
    "rain_series": rain_series
}

res = requests.post(
    LAMBDA_URL,
    json=payload
)

print("Rain series sent:", rain_series)
print("Lambda response:", res.text)