/////////////////////
// IMPORTS SECTION //
/////////////////////
import type { Booking } from "@/utils/types";
import {
  resetBookings,
  fetchBookings,
  fetchBookingById,
  createBookingApi,
  updateBookingApi,
  deleteBookingApi,
  searchBookings
} from "@/utils/mocks/api_mock";


/////////////////////
// TESTING SECTION //
/////////////////////
describe("API Mocks - Booking", () => {

  // Reset the in-memory storage before each test //
  beforeEach(() => {
    resetBookings();
  });

  const validBookingData: Omit<Booking, "id"> = {
    customerName: "Ion Popescu",
    customerEmail: "ion@example.com",
    customerPhone: "0712345678",
    startDate: "2025-04-01",
    endDate: "2025-04-05",
    state: "PENDING",
  };

  // =====================================================
  // Tests for createBookingApi (including data validation)
  // =====================================================
  describe("createBookingApi", () => {
    test("should create a booking with valid data", async () => {
      const booking = await createBookingApi(validBookingData);
      expect(booking).toHaveProperty("id");
      expect(booking.customerName).toBe(validBookingData.customerName);
    });

    test("should throw error for invalid customerName (empty string)", async () => {
      const invalidData = { ...validBookingData, customerName: "" };
      await expect(createBookingApi(invalidData)).rejects.toThrow("Invalid customerName");
    });

    test("should throw error for too long customerName", async () => {
      const longName = "A".repeat(128);
      const invalidData = { ...validBookingData, customerName: longName };
      await expect(createBookingApi(invalidData)).rejects.toThrow("Invalid customerName");
    });

    test("should throw error for invalid customerEmail (missing @)", async () => {
      const invalidData = { ...validBookingData, customerEmail: "invalidemail.com" };
      await expect(createBookingApi(invalidData)).rejects.toThrow("Invalid customerEmail");
    });

    test("should throw error for too long customerEmail", async () => {
      const longEmail = "a".repeat(128) + "@exemplu.com";
      const invalidData = { ...validBookingData, customerEmail: longEmail };
      await expect(createBookingApi(invalidData)).rejects.toThrow("Invalid customerEmail");
    });

    test("should throw error for invalid customerPhone (empty string)", async () => {
      const invalidData = { ...validBookingData, customerPhone: "" };
      await expect(createBookingApi(invalidData)).rejects.toThrow("Invalid customerPhone");
    });

    test("should throw error for too long customerPhone", async () => {
      const longPhone = "0".repeat(21);
      const invalidData = { ...validBookingData, customerPhone: longPhone };
      await expect(createBookingApi(invalidData)).rejects.toThrow("Invalid customerPhone");
    });

    test("should throw error for invalid startDate format", async () => {
      const invalidData = { ...validBookingData, startDate: "04-01-2025" };
      await expect(createBookingApi(invalidData)).rejects.toThrow("Invalid startDate");
    });

    test("should throw error for invalid endDate format", async () => {
      const invalidData = { ...validBookingData, endDate: "04-05-2025" };
      await expect(createBookingApi(invalidData)).rejects.toThrow("Invalid endDate");
    });

    test("should throw error when startDate is after endDate", async () => {
      const invalidData = { ...validBookingData, startDate: "2025-04-10", endDate: "2025-04-05" };
      await expect(createBookingApi(invalidData)).rejects.toThrow("Invalid dates");
    });

    test("should throw error for invalid state", async () => {
      const invalidData = { ...validBookingData, state: "INVALID_STATE" as any };
      await expect(createBookingApi(invalidData)).rejects.toThrow("Invalid state");
    });
  });

  // =====================================================
  // Tests for fetchBookingById
  // =====================================================
  describe("fetchBookingById", () => {
    test("should fetch a booking by valid ID", async () => {
      const createdBooking = await createBookingApi(validBookingData);
      const fetchedBooking = await fetchBookingById(createdBooking.id);
      expect(fetchedBooking).toEqual(createdBooking);
    });

    test("should throw error when booking is not found", async () => {
      await expect(fetchBookingById("nonexistent")).rejects.toThrow("Booking not found");
    });
  });

  // =====================================================
  // Tests for updateBookingApi
  // =====================================================
  describe("updateBookingApi", () => {
    test("should update a booking with valid data", async () => {
      const createdBooking = await createBookingApi(validBookingData);
      const updatedData = { ...validBookingData, customerName: "Ana Ionescu" };
      const updatedBooking = await updateBookingApi(createdBooking.id, updatedData);
      expect(updatedBooking.customerName).toBe("Ana Ionescu");
      expect(updatedBooking.id).toBe(createdBooking.id);
    });

    test("should throw error when updating a non-existent booking", async () => {
      await expect(updateBookingApi("nonexistent", validBookingData)).rejects.toThrow("Booking not found");
    });

    test("should throw error when update data is invalid (startDate after endDate)", async () => {
      const createdBooking = await createBookingApi(validBookingData);
      const invalidUpdateData = { ...validBookingData, startDate: "2025-04-10", endDate: "2025-04-05" };
      await expect(updateBookingApi(createdBooking.id, invalidUpdateData)).rejects.toThrow("Invalid dates");
    });
  });

  // =====================================================
  // Tests for deleteBookingApi
  // =====================================================
  describe("deleteBookingApi", () => {
    test("should delete a booking successfully", async () => {
      const createdBooking = await createBookingApi(validBookingData);
      await deleteBookingApi(createdBooking.id);
      await expect(fetchBookingById(createdBooking.id)).rejects.toThrow("Booking not found");
    });

    test("should do nothing if booking does not exist", async () => {
      // Deleting a non-existent booking should leave storage unchanged
      await deleteBookingApi("nonexistent");
      const allBookings = await fetchBookings();
      expect(allBookings).toHaveLength(0);
    });
  });

  // =====================================================
  // Tests for fetchBookings
  // =====================================================
  describe("fetchBookings", () => {
    test("should fetch all bookings", async () => {
      // Initially, no bookings should exist.
      let allBookings = await fetchBookings();
      expect(allBookings).toHaveLength(0);

      // Create two bookings.
      await createBookingApi(validBookingData);
      await createBookingApi({ ...validBookingData, customerName: "Mihai Georgescu", customerPhone: "0723456789", customerEmail: "mihai@example.com" });
      allBookings = await fetchBookings();
      expect(allBookings).toHaveLength(2);
    });
  });

  // =====================================================
  // Tests for searchBookings (every possible filter option)
  // =====================================================
  describe("searchBookings", () => {
    beforeEach(async () => {
      resetBookings();
      // Create multiple bookings for search tests
      await createBookingApi(validBookingData); // Ion Popescu, PENDING
      await createBookingApi({
        customerName: "Ana Ionescu",
        customerEmail: "ana@example.com",
        customerPhone: "0734567890",
        startDate: "2025-05-01",
        endDate: "2025-05-03",
        state: "CONFIRMED",
      });
      await createBookingApi({
        customerName: "Mihai Georgescu",
        customerEmail: "mihai@example.com",
        customerPhone: "0745678901",
        startDate: "2025-06-01",
        endDate: "2025-06-05",
        state: "CANCELLED",
      });
      await createBookingApi({
        customerName: "Elena Radu",
        customerEmail: "elena@example.com",
        customerPhone: "0756789012",
        startDate: "2025-07-01",
        endDate: "2025-07-04",
        state: "COMPLETED",
      });
    });

    test("should return all bookings when no filter is applied", async () => {
      const results = await searchBookings({});
      expect(results).toHaveLength(4);
    });

    test("should filter by name (case-insensitive, partial match)", async () => {
      const results = await searchBookings({ name: "ana" });
      expect(results).toHaveLength(1);
      expect(results[0].customerName).toBe("Ana Ionescu");
    });

    test("should filter by email (case-insensitive)", async () => {
      const results = await searchBookings({ email: "MIHAI@example.com" });
      expect(results).toHaveLength(1);
      expect(results[0].customerEmail).toBe("mihai@example.com");
    });

    test("should filter by phone", async () => {
      const results = await searchBookings({ phone: "0712345678" });
      expect(results).toHaveLength(1);
      expect(results[0].customerPhone).toBe("0712345678");
    });

    test("should filter by start_date", async () => {
      const results = await searchBookings({ start_date: "2025-06-01" });
      expect(results).toHaveLength(1);
      expect(results[0].startDate).toBe("2025-06-01");
    });

    test("should filter by end_date", async () => {
      const results = await searchBookings({ end_date: "2025-04-05" });
      expect(results).toHaveLength(1);
      expect(results[0].endDate).toBe("2025-04-05");
    });

    test("should filter by state", async () => {
      const results = await searchBookings({ state: "COMPLETED" });
      expect(results).toHaveLength(1);
      expect(results[0].state).toBe("COMPLETED");
    });

    test("should filter by multiple criteria (name and state)", async () => {
      const results = await searchBookings({ name: "mihai", state: "CANCELLED" });
      expect(results).toHaveLength(1);
      expect(results[0].customerName).toBe("Mihai Georgescu");
    });

    test("should return an empty array if no booking matches filter", async () => {
      const results = await searchBookings({ name: "Nonexistent" });
      expect(results).toHaveLength(0);
    });

    test("should combine all filters correctly", async () => {
      const results = await searchBookings({
        name: "elena",
        email: "elena@example.com",
        phone: "0756789012",
        start_date: "2025-07-01",
        end_date: "2025-07-04",
        state: "COMPLETED",
      });
      expect(results).toHaveLength(1);
      expect(results[0].customerName).toBe("Elena Radu");
    });
  });
});
