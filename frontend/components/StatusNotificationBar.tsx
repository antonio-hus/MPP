"use client";

/////////////////////
// IMPORTS SECTION //
/////////////////////
import { useState, useEffect } from "react";
import { WifiOff, ServerOff } from "lucide-react";
import { checkServerStatus } from "@/utils/api";

//////////////////////////
// COMPONENT DEFINITION //
//////////////////////////
export default function NetworkStatusNotificationBar() {
  const [networkDown, setNetworkDown] = useState<boolean>(false);
  const [serverDown, setServerDown] = useState<boolean>(false);

  useEffect(() => {

    // Check direct network status on mount
    const online = navigator.onLine;
    console.log(online)
    setNetworkDown(!online);

    // If network is online, perform a server health check
    if (online) {
      checkServerStatus();
    }

    // Listen for network status changes
    const handleNetworkChange = (event: CustomEvent) => {
      const isNetworkDown = event.detail.networkDown;
      setNetworkDown(isNetworkDown);

      // If network becomes online, immediately re-check server status
      if (!isNetworkDown) {
        checkServerStatus();
      }
    };

    // Listen for server status changes
    const handleServerChange = (event: CustomEvent) => {
      setServerDown(event.detail.serverDown);
    };

    window.addEventListener("networkStatusChange", handleNetworkChange as EventListener);
    window.addEventListener("serverStatusChange", handleServerChange as EventListener);

    return () => {
      window.removeEventListener("networkStatusChange", handleNetworkChange as EventListener);
      window.removeEventListener("serverStatusChange", handleServerChange as EventListener);
    };
  }, []);

  if (!networkDown && !serverDown) return null;

  return (
    <div className="sticky top-0 z-50 w-full bg-yellow-300 p-2 flex items-center justify-center">
      {networkDown ? (
        <>
          <WifiOff className="mr-2 text-xl" />
          <span>Network is down. Operating in local cache mode.</span>
        </>
      ) : serverDown ? (
        <>
          <ServerOff className="mr-2 text-xl" />
          <span>Server is down. Operating in local cache mode.</span>
        </>
      ) : null}
    </div>
  );
}
