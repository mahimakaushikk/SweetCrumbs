import subprocess
import re
import time
import urllib.request
import sys

def run_tunnel():
    print("Starting Cloudflare resilient tunnel manager...")
    while True:
        cmd = ['cloudflared.exe', 'tunnel', '--url', 'http://localhost:3000']
        try:
            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )
        except Exception as e:
            print(f"Failed to launch cloudflared: {e}")
            time.sleep(5)
            continue

        tunnel_url = None
        start_time = time.time()

        # Read output line by line until tunnel URL is found
        while time.time() - start_time < 30:
            line = proc.stdout.readline()
            if not line and proc.poll() is not None:
                break
            if line:
                sys.stdout.write(line)
                sys.stdout.flush()
                m = re.search(r'https://[a-zA-Z0-9-]+\.trycloudflare\.com', line)
                if m:
                    tunnel_url = m.group(0)
                    break

        if tunnel_url:
            print(f"\n==========================================")
            print(f"ACTIVE LIVE TUNNEL URL: {tunnel_url}")
            print(f"==========================================\n")
            with open("live_url.txt", "w", encoding="utf-8") as f:
                f.write(tunnel_url.strip())

            # Keep-alive loop: ping every 20 seconds to prevent idle timeout
            consecutive_failures = 0
            while proc.poll() is None:
                time.sleep(20)
                try:
                    req = urllib.request.Request(tunnel_url, headers={'User-Agent': 'KeepAlive/1.0'})
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        if resp.status == 200:
                            consecutive_failures = 0
                            # Success ping
                except Exception as e:
                    consecutive_failures += 1
                    print(f"Keepalive ping warning ({consecutive_failures}): {e}")
                    if consecutive_failures >= 3:
                        print("Tunnel unreachable 3 times in a row. Restarting tunnel...")
                        break
        else:
            print("Failed to obtain tunnel URL in 30s. Restarting...")

        try:
            proc.terminate()
            proc.wait(timeout=5)
        except Exception:
            try:
                proc.kill()
            except Exception:
                pass

        time.sleep(3)

if __name__ == '__main__':
    run_tunnel()
