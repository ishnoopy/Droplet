// PROVIDERS ARE MOUNTED WHEN APPLICATION STARTS.
// WE PUT THE SOCKET CONNECTION IN A PROVIDER SO THAT WE MAINTAIN THE CONNECTION EVEN WHEN WE SWITCH PAGES.

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { WEBSOCKET_URL } from "../config/env";
import { SocketContext } from "./socket-context";

type StringServerMessage = {
  type: "clients" | "error" | "files-length" | "message";
  value: Array<string> | string | number;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {

    const socketRef = useRef<WebSocket>(null);
    const [clients, setClients] = useState<Array<string>>([])
    const [filesLength, setFilesLength] = useState<number>(0);
    const [filesData, setFilesData] = useState<Array<Uint8Array | null>>([]);

    // Establish Socket Connection
    useEffect(() => {
        socketRef.current = new WebSocket(WEBSOCKET_URL);

        socketRef.current.onopen = () => {
            console.log("SOCKET CONNECTION ESTABLISHED ✅");
        }

        socketRef.current.onmessage = (event) => {
          if (typeof event.data === "string") {
            const serverMessage: StringServerMessage = JSON.parse(event.data);
            if (serverMessage?.type === "clients") {
              setClients(serverMessage?.value as Array<string>);
            }
            if (serverMessage?.type === "error") {
              toast(serverMessage?.value);
            }
            if (serverMessage?.type === "files-length") {
              setFilesLength(Number(serverMessage?.value));
            }
            if (serverMessage?.type === "message") {
              toast(serverMessage?.value);
            }
          }

          // We do not know if the web browser is sending a blob or an array buffer, so we need to check both. We do not control the web browser, so we need to handle both cases.
          else if (event.data instanceof Blob) {
            const blob = event.data;
            blob.arrayBuffer().then((buffer) => {
              console.log("FILE DATA RECEIVED ✅");
              console.log("🚀 ~ SocketProvider.tsx:40 ~ SocketProvider ~ fileData:", buffer)
              setFilesData((prevFiles) => [...prevFiles, new Uint8Array(buffer)]);
              toast("File received ✅");
            })
          }

         else if (event.data instanceof ArrayBuffer) {
            const buffer = event.data;
            console.log("FILE DATA RECEIVED ✅");
            console.log("🚀 ~ SocketProvider.tsx:40 ~ SocketProvider ~ fileData:", buffer)
            setFilesData((prevFiles) => [...prevFiles, new Uint8Array(buffer)]);
            toast("File received ✅");
          }

          else  {
            console.warn(`Unknown websocket payload: ${event.data}`)
          }

        }

        return () => {
            socketRef.current?.close()
        }

    }, [])


    return (
        <SocketContext.Provider value={{socketRef, clients, setClients, filesLength, setFilesLength, filesData, setFilesData}}>
            {children}
        </SocketContext.Provider>
    )
}



