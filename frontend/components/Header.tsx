/////////////////////
// IMPORTS SECTION //
/////////////////////
import Link from "next/link"


//////////////////////////
// COMPONENT DEFINITION //
//////////////////////////
export default function Header() {

  // JSX SECTION //
  return (
    <header className="bg-[#2196F3] text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          BOOKNOW
        </Link>
        <nav>
          <ul className="flex space-x-8">
            <li>
              <Link href="/" className="hover:underline">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/bookings/create" className="hover:underline">
                Create Booking
              </Link>
            </li>
            <li>
              <Link href="/bookings" className="hover:underline">
                Bookings
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
