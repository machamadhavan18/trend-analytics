import os
import sys
import subprocess
import time
import webbrowser
import socket

def get_lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        try:
            return socket.gethostbyname(socket.gethostname())
        except Exception:
            return "127.0.0.1"

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")
    lan_ip = get_lan_ip()

    print("=" * 72)
    print(" REAL TIME SOCIAL MEDIA TREND PREDICTION AND DIFFUSION ANALYTICS")
    print(" Enterprise Research & Intelligence Platform (Module 6 AI Insights)")
    print("=" * 72)

    # 1. Start Flask Backend
    print(f"\n[1/2] Starting Flask Backend on 0.0.0.0:5000 (LAN: http://{lan_ip}:5000)...")
    backend_process = subprocess.Popen(
        [sys.executable, "app.py"],
        cwd=backend_dir,
        shell=False
    )

    time.sleep(2)

    # 2. Start Vite React Frontend
    print(f"[2/2] Starting React Vite Frontend (LAN: http://{lan_ip}:5173)...")
    frontend_process = subprocess.Popen(
        ["npm.cmd", "run", "dev"],
        cwd=frontend_dir,
        shell=False
    )

    print("\n" + "=" * 72)
    print(" 🚀 SYSTEM RUNNING & NETWORK EXPOSED")
    print("=" * 72)
    print(f" • Local Access (This PC):        http://localhost:5173")
    print(f" • Network Access (Other Laptops): http://{lan_ip}:5173")
    print(f" • Backend API:                    http://{lan_ip}:5000/api/status")
    print("-" * 72)
    print(f" NOTE FOR OTHER LAPTOPS/DEVICES ON SAME WI-FI:")
    print(f" Type  http://{lan_ip}:5173  in the browser on the other machine.")
    print(" (Do NOT type 'localhost' on the other machine — use the IP above!)")
    print(" Press Ctrl+C in this terminal to terminate all services.")
    print("=" * 72 + "\n")

    try:
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\nTerminating server processes...")
        backend_process.terminate()
        frontend_process.terminate()
        print("Shutdown complete.")

if __name__ == "__main__":
    main()
