import requests
import sys
import time
import os

def test_endpoint(url, method="GET", data=None, headers=None):
    """Test an endpoint and return the response"""
    print(f"Testing {method} {url}...")
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=5)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=5)
        else:
            print(f"Unsupported method: {method}")
            return None
        
        print(f"Status code: {response.status_code}")
        if response.status_code == 200:
            print("✅ Success!")
            try:
                return response.json()
            except:
                return response.text
        else:
            print(f"❌ Failed with status code {response.status_code}")
            try:
                print(f"Response: {response.text}")
            except:
                pass
            return None
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection error: Could not connect to {url}")
        return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def main():
    """Test the FastAPI services"""
    print("=" * 60)
    print("Testing FastAPI Services")
    print("=" * 60)
    
    # Test Symptom Analyzer API
    print("\n1. Testing Symptom Analyzer API (Port 8000)")
    print("-" * 60)
    
    # Test health endpoint
    health_response = test_endpoint("http://localhost:8000/health")
    
    # Test analyze endpoint
    if health_response:
        analyze_data = {
            "text": "I have a headache and fever",
            "api_key": "AIzaSyCQcAZpBJi2ox3FZB1zXHGvYhDH8VGepL0"
        }
        analyze_headers = {"Content-Type": "application/json"}
        analyze_response = test_endpoint(
            "http://localhost:8000/analyze", 
            method="POST", 
            data=analyze_data, 
            headers=analyze_headers
        )
    
    # Test Health Assistant API
    print("\n2. Testing Health Assistant API (Port 8001)")
    print("-" * 60)
    
    # Test health endpoint
    health_response = test_endpoint("http://localhost:8001/health")
    
    # Test chat endpoint
    if health_response:
        chat_data = {
            "message": "Hello, I have a question about headaches",
            "api_key": "AIzaSyCQcAZpBJi2ox3FZB1zXHGvYhDH8VGepL0"
        }
        chat_headers = {"Content-Type": "application/json"}
        chat_response = test_endpoint(
            "http://localhost:8001/chat", 
            method="POST", 
            data=chat_data, 
            headers=chat_headers
        )
    
    print("\n" + "=" * 60)
    print("Test Complete")
    print("=" * 60)

if __name__ == "__main__":
    main() 