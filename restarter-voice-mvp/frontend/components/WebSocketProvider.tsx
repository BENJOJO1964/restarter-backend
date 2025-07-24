import React, { createContext, useContext, useEffect, useRef } from 'react';

const WSContext = createContext<WebSocket|null>(null);

export function useWS() {
  return useContext(WSContext);
}

export default function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const wsRef = useRef<WebSocket|null>(null);
  useEffect(() => {
    wsRef.current = new WebSocket('wss://restarter-backend-6e9s.onrender.com');
    return () => wsRef.current?.close();
  }, []);
  return <WSContext.Provider value={wsRef.current}>{children}</WSContext.Provider>;
}
