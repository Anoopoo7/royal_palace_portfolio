import "server-only";
import clientPromise, { isMongoConfigured } from "@/lib/db/mongodb";
import type { Collection, Db } from "mongodb";
import type { BookingAuditLog } from "./types";

const DB_NAME = () => process.env.MONGODB_DB_NAME || "royal_palace_homestay_test";
const AUDIT_COLLECTION = "bookingAuditLogs";

async function getAuditCollection(db?: Db): Promise<Collection<BookingAuditLog>> {
  if (!isMongoConfigured || !clientPromise) {
    throw new Error("MongoDB is not configured");
  }
  const targetDb = db ?? (await clientPromise).db(DB_NAME());
  return targetDb.collection<BookingAuditLog>(AUDIT_COLLECTION);
}

/**
 * Ensures indexes for the audit log collection.
 */
export async function ensureAuditIndexes(): Promise<void> {
  if (!isMongoConfigured || !clientPromise) return;
  try {
    const col = await getAuditCollection();
    await col.createIndex({ bookingId: 1 });
    await col.createIndex({ timestamp: -1 });
    await col.createIndex({ action: 1 });
  } catch {
    // Already exists
  }
}

/**
 * Records an immutable audit log entry.
 */
export async function logBookingAudit(entry: Omit<BookingAuditLog, "timestamp">): Promise<void> {
  if (!isMongoConfigured || !clientPromise) return;
  try {
    const col = await getAuditCollection();
    await col.insertOne({
      ...entry,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[logBookingAudit] Failed to record audit log:", error);
  }
}

/**
 * Retrieves audit logs for a given bookingId.
 */
export async function getBookingAuditLogs(bookingId: string): Promise<BookingAuditLog[]> {
  if (!isMongoConfigured || !clientPromise) return [];
  try {
    const col = await getAuditCollection();
    return col.find({ bookingId }).sort({ timestamp: -1 }).toArray();
  } catch (error) {
    console.error("[getBookingAuditLogs] Failed to fetch audit logs:", error);
    return [];
  }
}
