import Link from "next/link"
import { Building, Calendar, FileText, HomeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/header"
import Footer from "@/components/Footer"
import NetworkStatusNotificationBar from "@/components/StatusNotificationBar"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <NetworkStatusNotificationBar />
      <Header />
      <main className="flex-1 container mx-auto p-6">
        <h1 className="text-3xl font-bold mt-6 mb-6 text-center">Booking Management System</h1>
        <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
          Manage all your bookings, hotels, rooms, and files in one place with our comprehensive booking management
          system.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Bookings Card */}
          <Card className="border-t-4 border-t-[#2196F3]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#2196F3]" />
                Bookings
              </CardTitle>
              <CardDescription>Manage all your booking operations</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild variant="outline" className="justify-start">
                <Link href="/bookings">All Bookings</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/bookings/create">Create Booking</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/bookings/analytics">Analytics</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Hotels Card */}
          <Card className="border-t-4 border-t-[#2196F3]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-[#2196F3]" />
                Hotels
              </CardTitle>
              <CardDescription>Manage your hotels</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild variant="outline" className="justify-start">
                <Link href="/hotels">All Hotels</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/hotels/create">Create Hotel</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Rooms Card */}
          <Card className="border-t-4 border-t-[#2196F3]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HomeIcon className="h-5 w-5 text-[#2196F3]" />
                Rooms
              </CardTitle>
              <CardDescription>Manage your rooms</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild variant="outline" className="justify-start">
                <Link href="/rooms">All Rooms</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/rooms/create">Create Room</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Files Card */}
          <Card className="border-t-4 border-t-[#2196F3]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#2196F3]" />
                Files
              </CardTitle>
              <CardDescription>Manage your documents and files</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="justify-start w-full">
                <Link href="/files">Manage Files</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer className="sticky bottom-0" />
    </div>
  )
}
