import requests
import json
import sys

def test_analyze_endpoint():
    """Test the /analyze endpoint directly"""
    url = "http://localhost:8000/analyze"
    data = {
        "text": "I have a headache and fever",
        "api_key": "AIzaSyCQcAZpBJi2ox3FZB1zXHGvYhDH8VGepL0"
    }
    headers = {"Content-Type": "application/json"}
    
    print(f"Testing POST {url} with data: {json.dumps(data)}")
    
    try:
        response = requests.post(url, json=data, headers=headers, timeout=10)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            print("Success! Response:")
            print(json.dumps(response.json(), indent=2))
            return 0
        else:
            print(f"Failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return 1
    except requests.exceptions.ConnectionError:
        print(f"Connection error: Could not connect to {url}")
        print("Make sure the FastAPI service is running on port 8000")
        return 1
    except Exception as e:
        print(f"Error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(test_analyze_endpoint()) 