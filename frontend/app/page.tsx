/////////////////////
// IMPORTS SECTION //
/////////////////////
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NetworkStatusNotificationBar from "@/components/StatusNotificationBar";


//////////////////////////
// COMPONENT DEFINITION //
//////////////////////////
export default function Home() {

  // JSX SECTION //
  return (
    <div className="flex flex-col min-h-screen">
      <NetworkStatusNotificationBar/>
      <Header />
      <main className="flex-1 container mx-auto flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-3xl font-bold mb-6">Booking Management System</h1>
        <div className="grid gap-4 md:grid-cols-4 w-full max-w-2xl">
          <Link href="/bookings/create" className="w-full">
            <Button className="w-full h-24 text-lg bg-[#2196F3] hover:bg-[#1976D2]">
              Create Booking
            </Button>
          </Link>
          <Link href="/bookings" className="w-full">
            <Button className="w-full h-24 text-lg bg-[#2196F3] hover:bg-[#1976D2]">
              View Bookings
            </Button>
          </Link>
          <Link href="/bookings/analytics" className="w-full">
            <Button className="w-full h-24 text-lg bg-[#2196F3] hover:bg-[#1976D2]">
              View Analytics
            </Button>
          </Link>
          <Link href="/files" className="w-full">
            <Button className="w-full h-24 text-lg bg-[#2196F3] hover:bg-[#1976D2]">
              Manage Files
            </Button>
          </Link>
        </div>
      </main>
      <Footer className="sticky bottom-0" />
    </div>
  );
}