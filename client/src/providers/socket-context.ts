import { createContext, useContext, type RefObject } from "react";
import type { MetaData } from "./SocketProvider";

// To support hot reloading, we must separate stateful components from functional components.
type SocketContextType = {
    socketRef: RefObject<WebSocket | null>;
    clients: Array<string>;
    setClients: (v: Array<string>) => void;
    filesLength: number;
    setFilesLength: (v: number) => void;
    filesData: Array<{ metadata: MetaData | null, bytes: Uint8Array | null }>;
    setFilesData: (v: Array<{ metadata: MetaData | null, bytes: Uint8Array | null }>) => void;
};

export const SocketContext = createContext<SocketContextType | null>(null);

export function useSocketContext() {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error("useSocketContext must be used inside SocketProvider")
    return ctx;
}
