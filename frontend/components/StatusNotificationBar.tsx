"use client";

/////////////////////
// IMPORTS SECTION //
/////////////////////
import { useState, useEffect } from "react";
import { WifiOff, ServerOff } from "lucide-react";
import { syncLocalOperations } from "@/utils/api/bookings-api";
import { checkServerStatus } from "@/utils/api/health-reporting-api";
import {syncLocalHotels} from "@/utils/api/hotels-api";
import {syncLocalRooms} from "@/utils/api/rooms-api";


//////////////////////////
// COMPONENT DEFINITION //
//////////////////////////
export default function NetworkStatusNotificationBar() {
  const [networkDown, setNetworkDown] = useState(false);
  const [serverDown, setServerDown] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Check direct network status on mount
    const online = navigator.onLine;
    setNetworkDown(!online);

    // If network is online, perform a server health check
    if (online) {
      checkServerStatus();
    }

    // Listen for network status changes
    const handleNetworkChange = (event: CustomEvent) => {
      const isNetworkDown = event.detail.networkDown;
      const wasNetworkDown = networkDown;
      setNetworkDown(isNetworkDown);

      // If network becomes online, immediately re-check server status
      // and sync local operations if we were previously offline
      if (!isNetworkDown && wasNetworkDown) {
        checkServerStatus();
        handleSync();
      }
    };

    // Listen for server status changes
    const handleServerChange = (event: CustomEvent) => {
      const isServerDown = event.detail.serverDown;
      const wasServerDown = serverDown;
      setServerDown(isServerDown);

      // If server becomes online and was previously down, sync local operations
      if (!isServerDown && wasServerDown) {
        handleSync();
      }
    };

    // Function to handle syncing local operations
    const handleSync = async () => {
      if (!networkDown && !serverDown) {
        setSyncing(true);
        try {
          await syncLocalOperations();
          await syncLocalHotels();
          await syncLocalRooms();
        } catch (error) {
          console.error("Failed to sync local operations:", error);
        } finally {
          setSyncing(false);
        }
      }
    };

    window.addEventListener("networkStatusChange", handleNetworkChange as EventListener);
    window.addEventListener("serverStatusChange", handleServerChange as EventListener);

    return () => {
      window.removeEventListener("networkStatusChange", handleNetworkChange as EventListener);
      window.removeEventListener("serverStatusChange", handleServerChange as EventListener);
    };
  }, [networkDown, serverDown]);

  if (!networkDown && !serverDown && !syncing) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-2 bg-amber-100 border-t border-amber-300 text-amber-800 flex items-center justify-center space-x-2">
      {networkDown ? (
        <>
          <WifiOff size={16} />
          <span>Network is down. Operating in local cache mode.</span>
        </>
      ) : serverDown ? (
        <>
          <ServerOff size={16} />
          <span>Server is down. Operating in local cache mode.</span>
        </>
      ) : syncing ? (
        <span>Syncing local changes with server...</span>
      ) : null}
    </div>
  );
}