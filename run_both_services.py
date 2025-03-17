import subprocess
import sys
import os
import time
import signal
import logging
import threading
import webbrowser

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger("service_runner")

# Ensure we're in the correct directory
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)
logger.info(f"Working directory: {os.getcwd()}")

# Define the services
services = [
    {
        "name": "Symptom Analyzer API",
        "command": ["uvicorn", "feature1_fastapi:app", "--host", "0.0.0.0", "--port", "8000"],
        "url": "http://localhost:8000/health",
        "process": None
    },
    {
        "name": "Health Assistant API",
        "command": ["uvicorn", "chatbot:app", "--host", "0.0.0.0", "--port", "8001"],
        "url": "http://localhost:8001/health",
        "process": None
    }
]

# Flag to track if we should continue running
running = True

def run_service(service):
    """Run a service in a subprocess and capture its output"""
    try:
        logger.info(f"Starting {service['name']} on {service['url']}...")
        
        # Create the process
        process = subprocess.Popen(
            service["command"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,  # Line buffered
            universal_newlines=True
        )
        
        service["process"] = process
        logger.info(f"✅ {service['name']} started with PID {process.pid}")
        
        # Read and log output in real-time
        while running and process.poll() is None:
            # Read stdout
            stdout_line = process.stdout.readline()
            if stdout_line:
                print(f"[{service['name']}] {stdout_line.strip()}")
            
            # Read stderr
            stderr_line = process.stderr.readline()
            if stderr_line:
                print(f"[{service['name']} ERROR] {stderr_line.strip()}")
        
        # Process has ended
        if process.poll() is not None:
            logger.warning(f"⚠️ {service['name']} exited with code {process.returncode}")
            
            # Read any remaining output
            remaining_stdout, remaining_stderr = process.communicate()
            if remaining_stdout:
                print(f"[{service['name']}] {remaining_stdout.strip()}")
            if remaining_stderr:
                print(f"[{service['name']} ERROR] {remaining_stderr.strip()}")
    
    except Exception as e:
        logger.error(f"❌ Error running {service['name']}: {str(e)}")

def stop_services():
    """Stop all running services"""
    global running
    running = False
    
    logger.info("Stopping all services...")
    for service in services:
        if service["process"] is not None and service["process"].poll() is None:
            try:
                logger.info(f"Stopping {service['name']} (PID {service['process'].pid})...")
                
                # Try to terminate gracefully
                if sys.platform == 'win32':
                    # Windows
                    service["process"].terminate()
                else:
                    # Unix-like
                    os.kill(service["process"].pid, signal.SIGTERM)
                
                # Wait for it to terminate (with timeout)
                try:
                    service["process"].wait(timeout=5)
                    logger.info(f"✅ {service['name']} stopped")
                except subprocess.TimeoutExpired:
                    # Force kill if it doesn't terminate
                    logger.warning(f"⚠️ {service['name']} not responding, force killing...")
                    if sys.platform == 'win32':
                        # Windows
                        service["process"].kill()
                    else:
                        # Unix-like
                        os.kill(service["process"].pid, signal.SIGKILL)
                    logger.info(f"✅ {service['name']} forcefully stopped")
            
            except Exception as e:
                logger.error(f"❌ Error stopping {service['name']}: {str(e)}")

def check_service_health(url, name, max_retries=30, retry_interval=1):
    """Check if a service is healthy by making requests to its health endpoint"""
    import requests
    
    for i in range(max_retries):
        try:
            response = requests.get(url, timeout=1)
            if response.status_code == 200:
                logger.info(f"✅ {name} is healthy and responding")
                return True
        except requests.exceptions.RequestException:
            pass
        
        # Only log every few attempts to avoid spam
        if i % 5 == 0:
            logger.info(f"⏳ Waiting for {name} to become available... ({i+1}/{max_retries})")
        
        time.sleep(retry_interval)
    
    logger.error(f"❌ {name} failed to become healthy after {max_retries} attempts")
    return False

def open_frontend():
    """Open the frontend in the default web browser"""
    frontend_url = "http://localhost:5173"  # Default Vite dev server URL
    logger.info(f"Opening frontend at {frontend_url}")
    webbrowser.open(frontend_url)

def main():
    """Main function to run all services"""
    try:
        logger.info("=" * 60)
        logger.info("Starting TZ_Hackathon Health Assistant Services")
        logger.info("=" * 60)
        
        # Create threads for each service
        threads = []
        for service in services:
            thread = threading.Thread(target=run_service, args=(service,))
            thread.daemon = True  # Thread will exit when main thread exits
            threads.append(thread)
            thread.start()
        
        # Wait for services to start up
        logger.info("Waiting for services to become healthy...")
        all_healthy = True
        for service in services:
            if not check_service_health(service["url"], service["name"]):
                all_healthy = False
        
        if all_healthy:
            logger.info("=" * 60)
            logger.info("✅ All services are running!")
            logger.info("=" * 60)
            logger.info("📋 Service URLs:")
            logger.info(f"   - Symptom Analyzer API: http://localhost:8000")
            logger.info(f"   - Health Assistant API: http://localhost:8001")
            logger.info(f"   - Frontend (if running): http://localhost:5173")
            logger.info("=" * 60)
            
            # Ask if user wants to open the frontend
            response = input("Would you like to open the frontend in your browser? (y/n): ")
            if response.lower() in ['y', 'yes']:
                open_frontend()
            
            logger.info("Press Ctrl+C to stop all services")
            
            # Keep the main thread alive
            while True:
                time.sleep(1)
        else:
            logger.error("❌ Some services failed to start properly")
            stop_services()
            return 1
            
    except KeyboardInterrupt:
        logger.info("\nKeyboard interrupt received. Shutting down...")
    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}")
    finally:
        stop_services()
        logger.info("Goodbye!")
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 