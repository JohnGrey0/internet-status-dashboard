import time
import speedtest
import json
import requests

def check_internet_connection():
    try:
        url="https://www.google.com"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        print("Got response from {url}".format(url=url))
        return True
    except requests.RequestException:
        print("Failed to get response from {url}".format(url=url))
        return False

def run_speed_test():
    try:
        st = speedtest.Speedtest(secure=True)
        st.get_best_server()
        download_speed = st.download() / 1_000_000  # Convert to Mbps
        upload_speed = st.upload() / 1_000_000  # Convert to Mbps
        print("Speedtest down: {down}, upload: {up}".format(down=download_speed, up=upload_speed))
        return download_speed, upload_speed
    except Exception as e:
        print(f"Error during speed test: {e}")
        return 0, 0

def save_results_to_json(results):
    try:
        with open("speed_test_results.json", "w") as file:
            json.dump(results, file)
    except Exception as e:
        print(f"Error saving results to JSON: {e}")

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
            internet_status = "Available"
            if download_speed == 0 or upload_speed == 0:
                internet_status = "Unavailable"
            new_result = {
                "timestamp": timestamp,
                "download_speed": download_speed,
                "upload_speed": upload_speed,
                "internet_status": internet_status
            }
        else:
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
