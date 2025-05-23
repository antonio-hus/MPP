/////////////////////
// IMPORTS SECTION //
/////////////////////
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {AuthProvider} from "@/components/AuthProvider";


///////////////////////
// CONSTANTS SECTION //
///////////////////////
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookNow - Hotel Booking App",
  description: "Sample booking application created for MPP Class by Antonio Hus 924/1",
};


//////////////////////////
// COMPONENT DEFINITION //
//////////////////////////
export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {

  // JSX SECTION //
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
