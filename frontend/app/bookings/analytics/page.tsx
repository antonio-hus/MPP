"use client";

/////////////////////
// IMPORTS SECTION //
/////////////////////
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { fetchBookings } from "@/utils/api/bookings-api";
import type { Booking } from "@/utils/types/bookings-type";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NetworkStatusNotificationBar from "@/components/StatusNotificationBar";


/////////////////////
//   CHART SETUP   //
/////////////////////
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

//////////////////////////
// COMPONENT DEFINITION //
//////////////////////////
export default function AnalyticsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchBookings(0, 100000);
        setBookings(data.results);
      } catch (err) {
        console.error("Error fetching analytics data", err);
      }
    };

    loadData();
  }, []);

  // Global stats computed from bookings dataset
  const totalBookingsCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.state === "PENDING").length;
  const confirmedCount = bookings.filter((b) => b.state === "CONFIRMED").length;
  const cancelledCount = bookings.filter((b) => b.state === "CANCELLED").length;
  const completedCount = bookings.filter((b) => b.state === "COMPLETED").length;

  // Pie Chart: Booking State Distribution
  const stateCounts = bookings.reduce((acc, b) => {
    acc[b.state] = (acc[b.state] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const pieData = {
    labels: Object.keys(stateCounts),
    datasets: [
      {
        data: Object.values(stateCounts),
        backgroundColor: ["#FBBF24", "#34D399", "#F87171", "#60A5FA"],
      },
    ],
  };

  // Bar & Line Chart: Daily Booking Counts (grouped by startDate)
  const dailyCounts: { [key: string]: number } = {};
  bookings.forEach((b) => {
    dailyCounts[b.startDate] = (dailyCounts[b.startDate] || 0) + 1;
  });
  const sortedDates = Object.keys(dailyCounts).sort();
  const barData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Bookings per Day",
        data: sortedDates.map((date) => dailyCounts[date]),
        backgroundColor: "#60A5FA",
      },
    ],
  };
  const lineData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Bookings Trend",
        data: sortedDates.map((date) => dailyCounts[date]),
        borderColor: "#34D399",
        backgroundColor: "rgba(52, 211, 153, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NetworkStatusNotificationBar />
      <Header />
      <div className="container mx-auto py-8 px-4">
        <h2 className="text-xl font-bold mb-4">Analytics</h2>

        {/* Global Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="p-4 text-center">
            <CardTitle className="text-xl font-bold">{totalBookingsCount}</CardTitle>
            <CardContent>Total Bookings</CardContent>
          </Card>
          <Card className="p-4 text-center">
            <CardTitle className="text-xl font-bold">{pendingCount}</CardTitle>
            <CardContent>Pending</CardContent>
          </Card>
          <Card className="p-4 text-center">
            <CardTitle className="text-xl font-bold">{confirmedCount}</CardTitle>
            <CardContent>Confirmed</CardContent>
          </Card>
          <Card className="p-4 text-center">
            <CardTitle className="text-xl font-bold">{cancelledCount}</CardTitle>
            <CardContent>Cancelled</CardContent>
          </Card>
          <Card className="p-4 text-center">
            <CardTitle className="text-xl font-bold">{completedCount}</CardTitle>
            <CardContent>Completed</CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Booking State Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Pie data={pieData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Daily Bookings (Bar Chart)</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar data={barData} options={{ responsive: true }} />
            </CardContent>
          </Card>
        </div>
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Daily Bookings Trend (Line Chart)</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={lineData} options={{ responsive: true }} />
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
