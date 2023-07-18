import time
import speedtest
import json
import requests

def check_internet_connection():
    try:
        response = requests.get("https://www.google.com", timeout=5)
        response.raise_for_status()
        return True
    except requests.RequestException:
        return False

def run_speed_test():
    st = speedtest.Speedtest(secure=True)
    st.get_best_server()
    download_speed = st.download() / 1_000_000  # Convert to Mbps
    upload_speed = st.upload() / 1_000_000  # Convert to Mbps
    return download_speed, upload_speed

def save_results_to_json(results):
    with open("speed_test_results.json", "w") as file:
        json.dump(results, file)

def main():
    try:
        with open("speed_test_results.json", "r") as file:
            results = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        results = []

    while True:
        internet_available = check_internet_connection()
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")

        if internet_available:
            download_speed, upload_speed = run_speed_test()

            new_result = {
                "timestamp": timestamp,
                "download_speed": download_speed,
                "upload_speed": upload_speed,
                "internet_status": "Available"
            }
        else:
            # print("No internet connection.")
            new_result = {
                "timestamp": timestamp,
                "download_speed": 0,
                "upload_speed": 0,
                "internet_status": "Unavailable"
            }

        results.append(new_result)
        save_results_to_json(results)
        time.sleep(5*60)


if __name__ == "__main__":
    main()
