import subprocess
import sys
from typing import List
import time
import signal
import os
import socket
import requests
from datetime import datetime

class ServerManager:
    def __init__(self, base_port: int = 8000):
        self.base_port = base_port
        self.processes: List[subprocess.Popen] = []
        
    def check_port_available(self, port: int) -> bool:
        """Check if a port is available"""
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(('localhost', port)) != 0
        
    def add_server(self, module_name: str, port: int) -> None:
        """Start a new FastAPI server process"""
        # Check if port is available
        if not self.check_port_available(port):
            print(f"WARNING: Port {port} is already in use. The server may not start correctly.")
        
        cmd = [
            sys.executable, "-m", "uvicorn",
            f"{module_name}:app",
            "--reload",
            "--port", str(port),
            "--host", "0.0.0.0"
        ]
        
        print(f"Starting server {module_name} on port {port}...")
        print(f"Command: {' '.join(cmd)}")
        
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,  # Line buffered
            universal_newlines=True
        )
        self.processes.append((process, module_name, port))
        print(f"Started server {module_name} on port {port}")
        
    def stop_all(self) -> None:
        """Stop all running server processes"""
        print("Stopping all servers...")
        for process, module_name, port in self.processes:
            print(f"Stopping {module_name} on port {port}...")
            process.terminate()
        
        # Wait for processes to terminate
        for process, module_name, port in self.processes:
            try:
                process.wait(timeout=5)
                print(f"Stopped {module_name} on port {port}")
            except subprocess.TimeoutExpired:
                print(f"Process {module_name} didn't terminate gracefully, forcing...")
                process.kill()
                process.wait()
                print(f"Forcefully stopped {module_name} on port {port}")
            
        self.processes = []
        print("All servers stopped")
        
    def check_server_health(self, port: int, endpoint: str = "/health") -> bool:
        """Check if a server is healthy by making a request to its health endpoint"""
        url = f"http://localhost:{port}{endpoint}"
        try:
            response = requests.get(url, timeout=1)
            return response.status_code == 200
        except:
            return False
        
    def monitor_output(self) -> None:
        """Monitor and print output from all processes"""
        # Wait a bit for servers to start
        print("Waiting for servers to start...")
        time.sleep(2)
        
        # Check server health
        all_healthy = True
        for _, module_name, port in self.processes:
            if self.check_server_health(port):
                print(f"✅ {module_name} on port {port} is healthy")
            else:
                print(f"❌ {module_name} on port {port} is not responding to health checks")
                all_healthy = False
        
        if not all_healthy:
            print("\nWARNING: Some servers are not responding to health checks.")
            print("The application may not work correctly.")
            print("Check the server output below for error messages.")
            print("\nTroubleshooting tips:")
            print("1. Make sure no other applications are using ports 8000 and 8001")
            print("2. Check if the server modules (feature1_fastapi.py and chatbot.py) exist and are correctly formatted")
            print("3. Check for any error messages in the output below")
        
        print("\nServer output:")
        print("=" * 80)
        
        while self.processes:
            for i, (process, module_name, port) in enumerate(self.processes[:]):
                # Check if process is still running
                if process.poll() is not None:
                    print(f"Process {module_name} exited with code {process.returncode}")
                    self.processes.pop(i)
                    continue
                
                # Read output
                stdout_line = process.stdout.readline()
                if stdout_line:
                    timestamp = datetime.now().strftime("%H:%M:%S")
                    print(f"[{timestamp}] [{module_name}] {stdout_line.strip()}")
                
                stderr_line = process.stderr.readline()
                if stderr_line:
                    timestamp = datetime.now().strftime("%H:%M:%S")
                    print(f"[{timestamp}] [{module_name} ERROR] {stderr_line.strip()}")
            
            # Small sleep to prevent CPU hogging
            time.sleep(0.1)
            
        print("All processes have exited.")

def signal_handler(sig, frame):
    """Handle Ctrl+C to gracefully shut down all servers"""
    print("\nShutting down all servers...")
    manager.stop_all()
    sys.exit(0)

if __name__ == "__main__":
    # Set the current working directory to the script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    print(f"Working directory: {os.getcwd()}")
    
    # Check if the required files exist
    required_files = ["feature1_fastapi.py", "chatbot.py"]
    missing_files = [f for f in required_files if not os.path.isfile(f)]
    if missing_files:
        print(f"ERROR: The following required files are missing: {', '.join(missing_files)}")
        print("Please make sure these files exist in the current directory.")
        sys.exit(1)
    
    # List of your FastAPI modules
    servers = [
        "feature1_fastapi",  # Symptom Analyzer API on port 8000
        "chatbot"            # Health Assistant API on port 8001
    ]
    
    manager = ServerManager(base_port=8000)
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        # Start all servers with incrementing ports
        for i, server in enumerate(servers):
            port = manager.base_port + i
            manager.add_server(server, port)
            
        print("\nAll servers are running. Press Ctrl+C to stop all servers.")
        print("\nAPI Endpoints:")
        print(f"- Symptom Analyzer API: http://localhost:8000")
        print(f"- Health Assistant API: http://localhost:8001")
        
        # Monitor server output
        manager.monitor_output()
            
    except Exception as e:
        print(f"Error: {e}")
        manager.stop_all()
        sys.exit(1) 