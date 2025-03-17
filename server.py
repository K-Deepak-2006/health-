import subprocess
import time

def run_server(command):
    return subprocess.Popen(command, shell=True)

if __name__ == "__main__":
    # Start FastAPI servers on different ports
    process1 = run_server("uvicorn feature1_fastapi:app --host 0.0.0.0 --port 8000")
    time.sleep(2)  # Give some time for the first server to start
    process2 = run_server("uvicorn chatbot:app --host 0.0.0.0 --port 8001")

    try:
        process1.wait()
        process2.wait()
    except KeyboardInterrupt:
        print("Shutting down servers...")
        process1.terminate()
        process2.terminate()
