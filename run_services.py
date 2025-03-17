import subprocess
import sys
import os
import time
import signal
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("service_runner")

# List of services to run
services = [
    {
        "name": "Symptom Analyzer API",
        "command": ["uvicorn", "feature1_fastapi:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        "process": None
    },
    {
        "name": "Health Assistant API",
        "command": ["uvicorn", "chatbot:app", "--host", "0.0.0.0", "--port", "8001", "--reload"],
        "process": None
    }
]

def start_services():
    """Start all services"""
    for service in services:
        try:
            logger.info(f"Starting {service['name']}...")
            
            # Start the process
            process = subprocess.Popen(
                service["command"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            service["process"] = process
            logger.info(f"{service['name']} started with PID {process.pid}")
            
            # Give it a moment to start
            time.sleep(1)
            
            # Check if it's still running
            if process.poll() is not None:
                logger.error(f"{service['name']} failed to start. Return code: {process.returncode}")
                stderr_output = process.stderr.read()
                logger.error(f"Error output: {stderr_output}")
                service["process"] = None
            
        except Exception as e:
            logger.error(f"Error starting {service['name']}: {str(e)}")

def stop_services():
    """Stop all running services"""
    for service in services:
        if service["process"] is not None:
            try:
                logger.info(f"Stopping {service['name']} (PID {service['process'].pid})...")
                
                # Try to terminate gracefully first
                if sys.platform == 'win32':
                    # Windows
                    service["process"].terminate()
                else:
                    # Unix-like
                    os.killpg(os.getpgid(service["process"].pid), signal.SIGTERM)
                
                # Wait for it to terminate
                service["process"].wait(timeout=5)
                logger.info(f"{service['name']} stopped")
                
            except subprocess.TimeoutExpired:
                logger.warning(f"{service['name']} did not terminate gracefully, forcing...")
                
                if sys.platform == 'win32':
                    # Windows
                    service["process"].kill()
                else:
                    # Unix-like
                    os.killpg(os.getpgid(service["process"].pid), signal.SIGKILL)
                
                logger.info(f"{service['name']} forcefully stopped")
                
            except Exception as e:
                logger.error(f"Error stopping {service['name']}: {str(e)}")
            
            service["process"] = None

def monitor_services():
    """Monitor services and restart if they crash"""
    try:
        while True:
            for service in services:
                if service["process"] is not None and service["process"].poll() is not None:
                    logger.warning(f"{service['name']} has stopped unexpectedly. Restarting...")
                    
                    # Start the process again
                    process = subprocess.Popen(
                        service["command"],
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True
                    )
                    
                    service["process"] = process
                    logger.info(f"{service['name']} restarted with PID {process.pid}")
            
            # Check every 5 seconds
            time.sleep(5)
            
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received. Stopping services...")
        stop_services()

if __name__ == "__main__":
    try:
        logger.info("Starting all services...")
        start_services()
        
        logger.info("All services started. Press Ctrl+C to stop.")
        monitor_services()
        
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received. Stopping services...")
        stop_services()
        
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        stop_services()
        
    finally:
        logger.info("Exiting...") 