# Droplet 🪣

A peer-to-peer file sharing application built with FastAPI (WebSocket server) and React (Vite client). Share files seamlessly between connected clients on the same network.

## 📋 Prerequisites

- **Python 3.13+** (for server)
- **Node.js** and **pnpm** (for client)
- All devices must be on the same network

## 🐳 Run Everything with Docker Compose

1. **Set up client env vars**
   - Create `client/.env` with the same values described in [Client Setup & Operation](#-client-setup--operation).
2. **Expose your LAN IP in compose file**
   - Update the `client` and `server` `ports` entries in `docker-compose.yml` so `192.168.1.2` matches your machine's local IP.
3. **Build & start**
   - From the project root run:

     ```bash
     docker compose up --build
     ```

4. **Access the apps**
   - Client: `http://YOUR_LOCAL_IP:5173`
   - Server WebSocket endpoint: `ws://YOUR_LOCAL_IP:8000/ws`

> ⚙️ Prefer to develop locally? The dev instructions below remain exactly the same—use them whenever you need hot reload or faster iteration.

## 🚀 Server Setup & Operation

### 1. Navigate to Server Directory

```bash
cd server
```

### 2. Create Virtual Environment (if not already created)

```bash
python3 -m venv venv
```

### 3. Activate Virtual Environment

**macOS/Linux:**

```bash
source venv/bin/activate
```

**Windows:**

```bash
venv\Scripts\activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Run the Server

**Important:** You need to expose the server's IP address so clients can connect. Use your machine's local IP address (not `localhost` or `127.0.0.1`).

**Find your local IP:**

- **macOS/Linux:** `ipconfig getifaddr en0`
- **Windows:** `ipconfig`

**Run with exposed IP (replace `YOUR_LOCAL_IP` with your actual IP):**

```bash
uvicorn index:app --host YOUR_LOCAL_IP --port 8000
```

**Example:**

```bash
uvicorn index:app --host 192.168.1.2 --port 8000
```

The server will be accessible at `ws://YOUR_LOCAL_IP:8000/ws`

## 💻 Client Setup & Operation

### 1. Navigate to Client Directory

```bash
cd client
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://YOUR_SERVER_IP:8000
VITE_WEBSOCKET_URL=ws://YOUR_SERVER_IP:8000/ws
```

**Replace `YOUR_SERVER_IP` with the same IP address you used to start the server.**

**Example:**

```env
VITE_API_URL=http://192.168.1.100:8000
VITE_WEBSOCKET_URL=ws://192.168.1.100:8000/ws
```

### 4. Run the Client

**Important:** Use the `dev:host` script to expose the client's host IP. This allows the server to properly identify and route files to your client.

```bash
pnpm run dev:host
```

The client will be accessible at `http://YOUR_LOCAL_IP:5173` (or the port shown in the terminal).

### 5. Access the Application

Open your browser and navigate to:

- `http://YOUR_LOCAL_IP:5173` (from other devices on the network)
- Or `http://localhost:5173` (from the same machine)

## 🔑 Key Points

### Why IP Configuration Matters

1. **Server IP Exposure:** The server must be accessible via your local network IP (not `localhost`) so that other devices can connect to it.

2. **Client Host IP:** The client must run with `--host` flag (`dev:host` script) so that:
   - The server can identify your client by its IP:PORT combination
   - Other clients can see and connect to your client
   - File routing works correctly between clients

### How It Works

1. **Connection:** Clients connect to the WebSocket server using the server's IP address
2. **Discovery:** The server tracks all connected clients by their `IP:PORT` combination
3. **File Sharing:**
   - Select files and a recipient client
   - Files are sent through the server to the target client
   - The recipient receives a notification and can download the files

## 🛠️ Development

### Server Development

```bash
# Run with auto-reload
uvicorn index:app --host YOUR_LOCAL_IP --port 8000 --reload
```

### Client Development

```bash
# Standard dev mode (localhost only)
pnpm run dev

# Host mode (exposed to network) - REQUIRED for file sharing
pnpm run dev:host
```

## 📝 Notes

- All devices must be on the same local network
- Firewall settings may need to allow connections on ports 8000 (server) and 5173 (client)
- The server identifies clients by their `IP:PORT` combination
- Files are transferred through the server as an intermediary

## 🐛 Troubleshooting

### Client can't connect to server

- Verify the server is running with the correct IP address
- Check that `VITE_WEBSOCKET_URL` in `.env` matches the server IP
- Ensure both devices are on the same network
- Check firewall settings

### Files not being received

- Ensure the client is running with `pnpm run dev:host` (not `pnpm run dev`)
- Verify the server can see your client's IP in the connected clients list
- Check browser console for WebSocket connection errors

### Server not accessible

- Verify you're using your local network IP (not `127.0.0.1`)
- Check firewall allows connections on port 8000
- Ensure the server is running with `--host YOUR_LOCAL_IP`
