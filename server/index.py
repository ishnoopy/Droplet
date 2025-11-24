import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

# Store all connected clients
CLIENTS: dict[str, WebSocket] = {}

async def broadcast_clients():
    # broadcast the ips to all clients when there is a new connection
    for cid, ws in CLIENTS.items():
        # Exclude current client in the clients list as we only need the other client's ip
        other_clients = [c for c in CLIENTS.keys() if c != cid]
        await ws.send_text(json.dumps({
            "type": "clients",
            "value": other_clients
        }))


@app.websocket("/ws")
async def listen(ws: WebSocket):
    client_id = f"{ws.client.host}:{ws.client.port}"

    try:
        await ws.accept()
        CLIENTS[client_id] = ws

        # Broadcast updated client list excluding your own
        await broadcast_clients()

        recipient: str | None = None
        files: list[bytes] = []
        files_length: int = 0 # Number of files to send

        while True:
            message = await ws.receive()

            # The following sequence of events happens:
            # 1. receive recipient
            # 2. receive files-length
            # 3. receive file bytes
            # 4. send files to recipient
            # 5. send confirmation to sender
            # 6. repeat

            if message.get("type") == "websocket.receive":
                if message.get("text") is not None:
                    try:
                        message_text = json.loads(message.get('text')) # message.get('text') is a JSON string
                        if message_text.get('type') == "recipient":
                            recipient = message_text.get("value") # Recipient IP:PORT
                            continue

                        if message_text.get('type') == "files-length":
                            files_length = int(message_text.get("value"))
                            files = []
                            continue

                    except json.JSONDecodeError:
                        await ws.send_text(json.dumps({"type": "error", "value": "Invalid JSON"}))
                        break

                elif message.get('bytes') is not None:
                    if files_length > 0:

                        files.append(message.get('bytes'))
                        if files_length == len(files):

                            recipient_connection = CLIENTS[recipient]
                            # Send files length to the recipient
                            await recipient_connection.send_text(json.dumps({"type": "files-length", "value": files_length}))

                            for file in files:
                                await recipient_connection.send_bytes(file)

                            # Reset variables
                            files = []
                            files_length = 0
                            recipient = None # Reset recipient
                            await ws.send_text(json.dumps({"type": "message", "value": "OK"})) # Send confirmation to sender
                            continue
            continue # Continue receiving messages

    except WebSocketDisconnect:
        print("Client disconnected")

    finally:
        CLIENTS.pop(client_id, None)
        await broadcast_clients()
