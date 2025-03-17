import os
import sys
import subprocess
import time

def main():
    """Start the Symptom Analyzer API service"""
    print("Starting Symptom Analyzer API service...")
    
    # Ensure we're in the correct directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    print(f"Working directory: {os.getcwd()}")
    
    # Start the service
    cmd = ["uvicorn", "feature1_fastapi:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    print(f"Running command: {' '.join(cmd)}")
    
    try:
        # Run the service
        process = subprocess.Popen(cmd)
        
        # Wait for the service to start
        print("Waiting for service to start...")
        time.sleep(2)
        
        # Print instructions
        print("\n" + "=" * 60)
        print("Symptom Analyzer API is running!")
        print("=" * 60)
        print("API URL: http://localhost:8000")
        print("Health check: http://localhost:8000/health")
        print("Analyze endpoint: http://localhost:8000/analyze (POST)")
        print("=" * 60)
        print("Press Ctrl+C to stop the service")
        
        # Keep the script running
        process.wait()
        
    except KeyboardInterrupt:
        print("\nStopping service...")
        process.terminate()
        process.wait(timeout=5)
        print("Service stopped")
    except Exception as e:
        print(f"Error: {str(e)}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 