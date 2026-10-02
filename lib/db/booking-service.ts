import "server-only";
import clientPromise, { isMongoConfigured } from "./mongodb";
import { ObjectId } from "mongodb";

export interface DbRoom {
  _id?: ObjectId;
  slug: string;
  name: string;
  roomType: string;
  capacity: number;
  totalQuantity: number;
  basePricePerNight: number;
  active: boolean;
  amenities: string[];
}

export interface DbReservation {
  _id?: ObjectId;
  bookingReference: string;
  roomSlug: string;
  roomName: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
  roomsCount: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  totalAmount: number;
  status: "confirmed" | "pending" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "partially_paid";
  createdAt: string;
  specialRequests?: string;
}

// Fallback in-memory store when MongoDB is not connected
const IN_MEMORY_ROOMS: DbRoom[] = [
  {
    slug: "royal-cliff-suite",
    name: "Royal Cliff Suite",
    roomType: "Suite",
    capacity: 2,
    totalQuantity: 3,
    basePricePerNight: 14500,
    active: true,
    amenities: ["Ocean View Balcony", "Plunge Pool", "King Bed", "Kerala Teak Finishes", "Breakfast Included"],
  },
  {
    slug: "heritage-heritage-villa",
    name: "Heritage Teak Villa",
    roomType: "Villa",
    capacity: 4,
    totalQuantity: 2,
    basePricePerNight: 22000,
    active: true,
    amenities: ["Private Courtyard", "Outdoor Rain Shower", "2 King Suites", "Personal Butler", "Ocean Sunrise View"],
  },
  {
    slug: "palace-garden-room",
    name: "Palace Garden Sanctuary",
    roomType: "Sanctuary",
    capacity: 2,
    totalQuantity: 4,
    basePricePerNight: 9800,
    active: true,
    amenities: ["Garden Veranda", "Daybed", "Espresso Bar", "Ensuite Bath", "Tropical Garden View"],
  },
];

const IN_MEMORY_RESERVATIONS: DbReservation[] = [
  {
    bookingReference: "RP-884920",
    roomSlug: "royal-cliff-suite",
    roomName: "Royal Cliff Suite",
    checkIn: "2026-10-15",
    checkOut: "2026-10-18",
    guests: 2,
    roomsCount: 1,
    guestName: "Eleanor Vance",
    guestEmail: "eleanor@example.com",
    guestPhone: "+91 98765 00001",
    totalAmount: 43500,
    status: "confirmed",
    paymentStatus: "paid",
    createdAt: new Date().toISOString(),
  },
];

export async function checkRoomAvailability(
  checkIn: string,
  checkOut: string,
  guests: number = 1,
  roomsCount: number = 1
): Promise<{ availableRooms: DbRoom[]; requestedNights: number }> {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
  const requestedNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  if (!isMongoConfigured || !clientPromise) {
    // Fallback logic
    const available = IN_MEMORY_ROOMS.filter((room) => {
      if (room.capacity < guests) return false;
      const bookedCount = IN_MEMORY_RESERVATIONS.filter((res) => {
        if (res.roomSlug !== room.slug || res.status === "cancelled") return false;
        // Overlap logic: existingCheckIn < requestedCheckOut AND existingCheckOut > requestedCheckIn
        return res.checkIn < checkOut && res.checkOut > checkIn;
      }).reduce((acc, r) => acc + r.roomsCount, 0);

      return room.totalQuantity - bookedCount >= roomsCount;
    });

    return { availableRooms: available, requestedNights };
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME || "royal_palace");
  const roomsCol = db.collection<DbRoom>("rooms");
  const reservationsCol = db.collection<DbReservation>("reservations");

  const allRooms = await roomsCol.find({ active: true, capacity: { $gte: guests } }).toArray();

  const overlappingReservations = await reservationsCol
    .find({
      status: { $ne: "cancelled" },
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn },
    })
    .toArray();

  const roomBookedCounts: Record<string, number> = {};
  for (const res of overlappingReservations) {
    roomBookedCounts[res.roomSlug] = (roomBookedCounts[res.roomSlug] || 0) + res.roomsCount;
  }

  const availableRooms = allRooms.filter((room) => {
    const booked = roomBookedCounts[room.slug] || 0;
    return room.totalQuantity - booked >= roomsCount;
  });

  return { availableRooms, requestedNights };
}

export async function createReservation(data: {
  roomSlug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomsCount?: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
}): Promise<DbReservation> {
  const roomsCount = data.roomsCount || 1;

  // Server-side recheck availability before creating reservation
  const { availableRooms, requestedNights } = await checkRoomAvailability(
    data.checkIn,
    data.checkOut,
    data.guests,
    roomsCount
  );

  const targetRoom = availableRooms.find((r) => r.slug === data.roomSlug);
  if (!targetRoom) {
    throw new Error("Selected room is no longer available for the chosen dates.");
  }

  const bookingReference = `RP-${Math.floor(100000 + Math.random() * 900000)}`;
  const totalAmount = targetRoom.basePricePerNight * requestedNights * roomsCount;

  const reservation: DbReservation = {
    bookingReference,
    roomSlug: targetRoom.slug,
    roomName: targetRoom.name,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guests: data.guests,
    roomsCount,
    guestName: data.guestName,
    guestEmail: data.guestEmail,
    guestPhone: data.guestPhone,
    totalAmount,
    status: "confirmed",
    paymentStatus: "unpaid",
    createdAt: new Date().toISOString(),
    specialRequests: data.specialRequests,
  };

  if (!isMongoConfigured || !clientPromise) {
    IN_MEMORY_RESERVATIONS.push(reservation);
    return reservation;
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME || "royal_palace");
  const result = await db.collection("reservations").insertOne(reservation);
  return { ...reservation, _id: result.insertedId };
}

export async function getReservationByReference(ref: string): Promise<DbReservation | null> {
  if (!isMongoConfigured || !clientPromise) {
    return IN_MEMORY_RESERVATIONS.find((r) => r.bookingReference === ref) || null;
  }
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME || "royal_palace");
  return (await db.collection<DbReservation>("reservations").findOne({ bookingReference: ref })) || null;
}
