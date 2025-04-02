"use client";
import { useEffect, useState, useCallback } from "react";
import type { Booking } from "./types";

function useBookingUpdates(onBookingUpdate: (booking: Booking) => void) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 3000;

  // Setup WebSocket connection
  const setupSocket = useCallback(() => {
    const newSocket = new WebSocket("ws://localhost:8000/ws/bookings/");

    newSocket.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnected(true);
      setReconnectAttempts(0);
    };

    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle different message types
        if (data.new_booking) {
          onBookingUpdate(data.new_booking);
        } else if (data.updated_booking) {
          onBookingUpdate(data.updated_booking);
        } else if (data.deleted_booking_id) {
          // If we need to handle deletions, we could call a separate callback here
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    newSocket.onclose = (event) => {
      console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
      setIsConnected(false);

      // Attempt to reconnect if not a normal closure
      if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          console.log(`Attempting to reconnect (${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
          setReconnectAttempts(prev => prev + 1);
          setupSocket();
        }, RECONNECT_INTERVAL);
      }
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(newSocket);

    return newSocket;
  }, [onBookingUpdate, reconnectAttempts]);

  // Initial setup and cleanup
  useEffect(() => {
    const newSocket = setupSocket();

    return () => {
      if (newSocket.readyState === WebSocket.OPEN ||
          newSocket.readyState === WebSocket.CONNECTING) {
        newSocket.close();
      }
    };
  }, [setupSocket]);

  return {
    isConnected,
    reconnectAttempts
  };
}

export default useBookingUpdates;