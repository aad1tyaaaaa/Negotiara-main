"use client";

import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function useSocket(sessionId?: string, token?: string) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        const s = io(SOCKET_URL, {
            auth: { token: token || "" },
        });

        s.on("connect", () => {
            setConnected(true);
            if (sessionId) {
                s.emit("join_session", { sessionId });
                s.emit("start_playback", { sessionId });
            }
        });

        s.on("disconnect", () => {
            setConnected(false);
        });

        s.on("negotiation_update", (data) => {
            setMessages((prev) => [...prev, data]);
        });

        setSocket(s);

        return () => {
            s.disconnect();
        };
    }, [sessionId]);

    const emit = useCallback((event: string, data: any) => {
        socket?.emit(event, data);
    }, [socket]);

    return { socket, connected, emit, messages, setMessages };
}
