"use client";

/////////////////////
// IMPORTS SECTION //
/////////////////////
import { useEffect, useState, useCallback, useRef } from "react";
import type { Booking } from "../types/bookings-type";

///////////////////////
// WEBSOCKET SECTION //
///////////////////////


function useBookingUpdates(onBookingUpdate: (booking: Booking) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const socketRef = useRef<WebSocket | null>(null);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 3000;

  // Cleanup function to close the WebSocket properly
  const closeSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.onclose = null;
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  const setupSocket = useCallback(() => {
    closeSocket(); // Make sure to close any existing socket

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.hostname;
    const wsUrl = `${protocol}://localhost:8001/ws/bookings/`;
    const socket = new WebSocket(wsUrl);

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected ✅");
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.new_booking) {
          console.log("New booking received:", data.new_booking);
          onBookingUpdate(data.new_booking);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onclose = (event) => {
      console.warn(`WebSocket closed: ${event.code} - ${event.reason}`);
      setIsConnected(false);

      // Reconnect if not a normal closure and we haven't exceeded attempts
      if (event.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          console.log(`Reconnecting (${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
          reconnectAttemptsRef.current += 1;
          setupSocket();
        }, RECONNECT_INTERVAL);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket encountered an error:", error);
    };
  }, [closeSocket, onBookingUpdate]);

  useEffect(() => {
    setupSocket();

    // Cleanup on unmount
    return () => {
      closeSocket();
    };
  }, [setupSocket, closeSocket]);

  return { isConnected };
}

export default useBookingUpdates;