import { NextResponse } from "next/server";
import { z } from "zod";
import { createReservation } from "@/lib/db/booking-service";

const CreateBookingSchema = z.object({
  roomSlug: z.string().min(1, "Room choice is required"),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid check-in date (YYYY-MM-DD)"),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid check-out date (YYYY-MM-DD)"),
  guests: z.number().min(1, "At least 1 guest required"),
  roomsCount: z.number().min(1).default(1),
  guestName: z.string().min(2, "Name is required"),
  guestEmail: z.string().email("Valid email is required"),
  guestPhone: z.string().min(8, "Valid phone number is required"),
  specialRequests: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = CreateBookingSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const reservation = await createReservation(parseResult.data);

    return NextResponse.json({
      success: true,
      bookingReference: reservation.bookingReference,
      reservation,
    });
  } catch (error: unknown) {
    console.error("Create booking error:", error);
    const message = error instanceof Error ? error.message : "Failed to create reservation";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
