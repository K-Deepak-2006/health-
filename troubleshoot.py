import os
import sys
import socket
import subprocess
import time
import requests
import platform

def check_file_exists(filename):
    """Check if a file exists"""
    exists = os.path.isfile(filename)
    status = "✅" if exists else "❌"
    print(f"{status} File {filename}: {'Found' if exists else 'Not found'}")
    return exists

def check_port_available(port):
    """Check if a port is available"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        result = s.connect_ex(('localhost', port))
        is_available = result != 0
        status = "✅" if is_available else "❌"
        print(f"{status} Port {port}: {'Available' if is_available else 'In use'}")
        return is_available

def check_port_in_use(port):
    """Check if a port is in use and by which process"""
    is_available = check_port_available(port)
    if not is_available:
        # Try to find which process is using the port
        if platform.system() == "Windows":
            try:
                # Windows
                result = subprocess.run(
                    f"netstat -ano | findstr :{port}", 
                    shell=True, 
                    capture_output=True, 
                    text=True
                )
                if result.stdout:
                    print(f"   Process using port {port}:")
                    for line in result.stdout.splitlines():
                        print(f"   {line.strip()}")
            except:
                pass
        else:
            try:
                # Unix/Linux/Mac
                result = subprocess.run(
                    f"lsof -i :{port}", 
                    shell=True, 
                    capture_output=True, 
                    text=True
                )
                if result.stdout:
                    print(f"   Process using port {port}:")
                    for line in result.stdout.splitlines():
                        print(f"   {line.strip()}")
            except:
                pass

def check_server_health(port, endpoint="/health"):
    """Check if a server is healthy by making a request to its health endpoint"""
    url = f"http://localhost:{port}{endpoint}"
    try:
        response = requests.get(url, timeout=1)
        is_healthy = response.status_code == 200
        status = "✅" if is_healthy else "❌"
        print(f"{status} Server on port {port}: {'Healthy' if is_healthy else 'Unhealthy'} (Status code: {response.status_code})")
        return is_healthy
    except requests.exceptions.ConnectionError:
        print(f"❌ Server on port {port}: Not responding (Connection refused)")
        return False
    except Exception as e:
        print(f"❌ Server on port {port}: Error - {str(e)}")
        return False

def check_python_packages():
    """Check if required Python packages are installed"""
    packages = ["fastapi", "uvicorn", "google.generativeai", "requests"]
    all_installed = True
    
    for package in packages:
        try:
            if package == "google.generativeai":
                import google.generativeai
                installed = True
            else:
                __import__(package)
                installed = True
        except ImportError:
            installed = False
            all_installed = False
        
        status = "✅" if installed else "❌"
        print(f"{status} Package {package}: {'Installed' if installed else 'Not installed'}")
    
    return all_installed

def main():
    """Main function to run all checks"""
    print("=" * 80)
    print("TZ_Hackathon Troubleshooting Tool")
    print("=" * 80)
    print(f"System: {platform.system()} {platform.release()}")
    print(f"Python: {sys.version}")
    print(f"Working directory: {os.getcwd()}")
    print("=" * 80)
    
    # Check if required files exist
    print("\nChecking required files:")
    files_exist = True
    files_exist &= check_file_exists("feature1_fastapi.py")
    files_exist &= check_file_exists("chatbot.py")
    files_exist &= check_file_exists("server_manager.py")
    
    # Check if required Python packages are installed
    print("\nChecking required Python packages:")
    packages_installed = check_python_packages()
    
    # Check if ports are available
    print("\nChecking ports:")
    port_8000_available = check_port_available(8000)
    port_8001_available = check_port_available(8001)
    
    if not port_8000_available or not port_8001_available:
        print("\nChecking which processes are using the ports:")
        if not port_8000_available:
            check_port_in_use(8000)
        if not port_8001_available:
            check_port_in_use(8001)
    
    # Check server health
    print("\nChecking server health:")
    server_8000_healthy = check_server_health(8000)
    server_8001_healthy = check_server_health(8001)
    
    # Print summary
    print("\n" + "=" * 80)
    print("Troubleshooting Summary:")
    print("=" * 80)
    
    if not files_exist:
        print("❌ Some required files are missing. Please make sure all files are in the correct location.")
    
    if not packages_installed:
        print("❌ Some required Python packages are missing. Please install them using:")
        print("   pip install fastapi uvicorn google-generativeai requests")
    
    if not port_8000_available or not port_8001_available:
        print("❌ Some ports are already in use. Please stop the processes using these ports or use different ports.")
    
    if not server_8000_healthy or not server_8001_healthy:
        print("❌ Some servers are not responding. Please check if they are running correctly.")
    
    if files_exist and packages_installed and port_8000_available and port_8001_available:
        print("✅ All checks passed. You should be able to start the servers without issues.")
        print("   Run 'python server_manager.py' to start the servers.")
    else:
        print("\nRecommended actions:")
        if not files_exist:
            print("1. Make sure all required files are in the correct location.")
        if not packages_installed:
            print("2. Install the missing Python packages.")
        if not port_8000_available or not port_8001_available:
            print("3. Stop the processes using ports 8000 and 8001, or modify the code to use different ports.")
    
    print("\nFor more detailed troubleshooting, check the server output when running 'python server_manager.py'.")
    print("=" * 80)

if __name__ == "__main__":
    main() 