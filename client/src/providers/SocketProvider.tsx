// PROVIDERS ARE MOUNTED WHEN APPLICATION STARTS.
// WE PUT THE SOCKET CONNECTION IN A PROVIDER SO THAT WE MAINTAIN THE CONNECTION EVEN WHEN WE SWITCH PAGES.

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { WEBSOCKET_URL } from "../config/env";
import { SocketContext } from "./socket-context";

type StringServerMessage = {
  type: "clients" | "error" | "files-length" | "message" | "meta-data";
  value: Array<string> | string | number | MetaData;
}

export type MetaData = {
  fileName: string;
  fileSize: number;
  fileType: string;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {

    const socketRef = useRef<WebSocket>(null);
    const [clients, setClients] = useState<Array<string>>([])
    const [filesLength, setFilesLength] = useState<number>(0);
    const [filesData, setFilesData] = useState<Array<{ metadata: MetaData | null, bytes: Uint8Array | null }>>([]);

    useEffect(() => {
      console.log("🚀 ~ SocketProvider.tsx:27 ~ useEffect ~ filesData:", filesData)
    }, [filesData])

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
              toast(serverMessage?.value as string);
            }
            if (serverMessage?.type === "files-length") {
              setFilesLength(Number(serverMessage?.value));
            }
            if (serverMessage?.type === "meta-data") {
              console.log("🚀 ~ SocketProvider.tsx:48 ~ SocketProvider ~ serverMessage?.value:", JSON.parse(serverMessage?.value as string) as MetaData)
              setFilesData((prevFiles) => [...prevFiles, { metadata: JSON.parse(serverMessage?.value as string) as MetaData, bytes: null }]);
            }
            if (serverMessage?.type === "message") {
              toast(serverMessage?.value as string);
            }
          }

          // We do not know if the web browser is sending a blob or an array buffer, so we need to check both. We do not control the web browser, so we need to handle both cases.
          else if (event.data instanceof Blob) {
            const blob = event.data;
            blob.arrayBuffer().then((buffer) => {
              console.log("FILE DATA RECEIVED ✅");

              setFilesData((prevFiles) => {
                const updatedFiles = [...prevFiles];

                const fileWithMetadata = updatedFiles.find((file) => file.metadata !== null && file.bytes === null);
                if (fileWithMetadata) {
                  fileWithMetadata.bytes = new Uint8Array(buffer);
                }

                return updatedFiles;

              })
              toast("File received ✅");
            })
          }

         else if (event.data instanceof ArrayBuffer) {
            const buffer = event.data;
            console.log("FILE DATA RECEIVED ✅");
            setFilesData((prevFiles) => {
              const updatedFiles = [...prevFiles];
              const fileWithMetadata = updatedFiles.find((file) => file.metadata !== null && file.bytes === null);
              if (fileWithMetadata) {
                fileWithMetadata.bytes = new Uint8Array(buffer);
              }
              return updatedFiles;
            })
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



