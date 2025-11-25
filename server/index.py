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
        files: list[dict] = []  # List of objects: { "metadata": ..., "bytes": ... }
        files_length: int = 0 # Number of files to send

        while True:
            message = await ws.receive()

            # The following sequence of events happens:
            # 1. receive recipient
            # 2. receive files-length
            # 3. receive meta-data
            # 4. receive file bytes
            # 5. send files to recipient
            # 6. send confirmation to sender
            # 7. repeat

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

                        if message_text.get('type') == "meta-data":
                            files.append({"metadata": message_text.get("value"), "bytes": None})
                            continue

                    except json.JSONDecodeError:
                        await ws.send_text(json.dumps({"type": "error", "value": "Invalid JSON"}))
                        break

                elif message.get('bytes') is not None:
                    if files_length > 0:

                        files[-1]["bytes"] = message.get('bytes') # Set the bytes of the last file in the list as we expect that metadata are received before bytes
                        if files_length == len(files):

                            recipient_connection = CLIENTS.get(recipient)
                            if recipient_connection is None:
                                await ws.send_text(json.dumps({"type": "error", "value": "Recipient not found"}))
                                continue

                            # Send files length to the recipient
                            await recipient_connection.send_text(json.dumps({"type": "files-length", "value": files_length}))

                            for file in files:
                                if file.get("metadata") is not None:
                                    await recipient_connection.send_text(json.dumps({"type": "meta-data", "value": file.get("metadata")}))
                                if file.get("bytes") is not None:
                                    await recipient_connection.send_bytes(file.get("bytes"))

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
