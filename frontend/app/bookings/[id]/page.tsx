"use client";

/////////////////////
// IMPORTS SECTION //
/////////////////////
import React, {use, useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchBookingById, updateBookingApi, deleteBookingApi } from "@/utils/api/bookings-api";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Booking } from "@/utils/types/bookings-type";
import NetworkStatusNotificationBar from "@/components/StatusNotificationBar";
import {isOnline, updateServerStatus} from "@/utils/api/health-reporting-api";


//////////////////////////
// COMPONENT DEFINITION //
//////////////////////////
export default function EditBookingPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {

  // CONSTANTS SECTION //
  const resolvedParams = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    startDate: "",
    endDate: "",
    state: "PENDING",
  });


  // HOOKS //
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await fetchBookingById(resolvedParams.id);
        setBooking(data);
        setFormData({
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          startDate: data.startDate,
          endDate: data.endDate,
          state: data.state,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load booking");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooking();
  }, [resolvedParams.id]);

  useEffect(() => {
    const checkServer = async () => {
      const online = isOnline();
      updateServerStatus(!online);

      window.dispatchEvent(new CustomEvent("serverStatusChange", { detail: { serverDown: !online } }));
    };

    // Check every 5 seconds
    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);


  // HANDLERS //
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    setIsSaving(true);
    setError(null);

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      setError("Start date must be before the end date.");
      setIsSaving(false);
      return;
    }

    try {
      await updateBookingApi(booking.id, formData);
      router.push("/bookings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update booking");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!booking) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteBookingApi(booking.id);
      setIsDeleteDialogOpen(false);
      router.push("/bookings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete booking");
      setIsDeleting(false);
    }
  };


  // JSX SECTION //
  /// PLACEHOLDER CONTENT ///
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading booking details...</span>
        </div>
      </div>
    );
  }

  /// ERROR HANDLING CONTENT ///
  if (!booking && !isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Booking not found</AlertDescription>
        </Alert>
        <Link href="/bookings">
          <Button className="mt-4">Back to Bookings</Button>
        </Link>
      </div>
    );
  }

  /// ACTUAL CONTENT ///
  return (
    <div>
      <NetworkStatusNotificationBar/>
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center mb-4">
          <Link href="/bookings" className="text-center hover:underline">
            Cancel and Go Back
          </Link>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="bg-[#2196F3] text-white py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Modify Booking</h1>
          </div>

          <form onSubmit={handleUpdate} className="p-6 space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                disabled={isSaving || isDeleting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={handleChange}
                required
                disabled={isSaving || isDeleting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Customer Phone</Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                required
                disabled={isSaving || isDeleting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
                disabled={isSaving || isDeleting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
                disabled={isSaving || isDeleting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Booking State</Label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                disabled={isSaving || isDeleting}
                className="border rounded p-2 w-full"
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 bg-[#FF9800] hover:bg-[#F57C00] text-white"
                disabled={isSaving || isDeleting}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Modify Now"
                )}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isSaving || isDeleting}
              >
                Delete
              </Button>
            </div>
          </form>
        </div>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure you want to delete this booking?</DialogTitle>
              <DialogDescription>This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
}
