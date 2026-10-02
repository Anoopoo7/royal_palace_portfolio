import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRoomAvailability } from "@/lib/db/booking-service";

const AvailabilityQuerySchema = z.object({
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid check-in date format (YYYY-MM-DD)"),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid check-out date format (YYYY-MM-DD)"),
  guests: z.coerce.number().min(1).default(1),
  rooms: z.coerce.number().min(1).default(1),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = AvailabilityQuerySchema.safeParse({
      checkIn: searchParams.get("checkIn"),
      checkOut: searchParams.get("checkOut"),
      guests: searchParams.get("guests") || 1,
      rooms: searchParams.get("rooms") || 1,
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { checkIn, checkOut, guests, rooms } = parseResult.data;

    if (new Date(checkOut) <= new Date(checkIn)) {
      return NextResponse.json(
        { error: "Check-out date must be strictly after check-in date" },
        { status: 400 }
      );
    }

    const { availableRooms, requestedNights } = await checkRoomAvailability(
      checkIn,
      checkOut,
      guests,
      rooms
    );

    return NextResponse.json({
      success: true,
      checkIn,
      checkOut,
      guests,
      roomsCount: rooms,
      requestedNights,
      availableCount: availableRooms.length,
      rooms: availableRooms,
    });
  } catch (error: unknown) {
    console.error("Availability API error:", error);
    return NextResponse.json(
      { error: "Failed to check room availability" },
      { status: 500 }
    );
  }
}
