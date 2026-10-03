/**
 * Royal Palace — Daily Pricing Service
 * MongoDB collection: "dailyRates"
 * Unique index on: date
 */
import "server-only";
import clientPromise, { isMongoConfigured } from "@/lib/db/mongodb";
import type { Db, Collection } from "mongodb";
import type { DailyRate } from "./types";
import { isValidDateStr, dateRange } from "./dates";

const DB_NAME = () => process.env.MONGODB_DB_NAME || "royal_palace_homestay_test";
const COLLECTION = "dailyRates";

async function getRatesCollection(): Promise<Collection<DailyRate>> {
  if (!isMongoConfigured || !clientPromise) {
    throw new Error("MongoDB is not configured");
  }
  const client = await clientPromise;
  const db: Db = client.db(DB_NAME());
  return db.collection<DailyRate>(COLLECTION);
}

/**
 * Ensures indexes exist. Call once at startup or on first use.
 * Safe to call multiple times (MongoDB ignores duplicate index creation).
 */
export async function ensurePricingIndexes(): Promise<void> {
  if (!isMongoConfigured || !clientPromise) return;
  try {
    const col = await getRatesCollection();
    await col.createIndex({ date: 1 }, { unique: true });
  } catch {
    // Index already exists — fine
  }
}

/**
 * Fetch all daily rates in a date range [from, to] inclusive.
 */
export async function getRatesForRange(from: string, to: string): Promise<DailyRate[]> {
  const col = await getRatesCollection();
  return col
    .find({ date: { $gte: from, $lte: to } })
    .sort({ date: 1 })
    .toArray();
}

/**
 * Fetch rates for a specific set of dates.
 */
export async function getRatesForDates(dates: string[]): Promise<Map<string, DailyRate>> {
  if (dates.length === 0) return new Map();
  const col = await getRatesCollection();
  const results = await col.find({ date: { $in: dates } }).toArray();
  const map = new Map<string, DailyRate>();
  for (const r of results) map.set(r.date, r);
  return map;
}

/**
 * Upsert a single daily rate.
 */
export async function setDailyRate(date: string, price: number): Promise<DailyRate> {
  if (!isValidDateStr(date)) throw new Error(`Invalid date: ${date}`);
  if (price <= 0 || !Number.isFinite(price)) throw new Error("Price must be a positive number");

  const col = await getRatesCollection();
  const now = new Date().toISOString();
  const doc: DailyRate = {
    date,
    price: Math.round(price), // ensure integer INR
    currency: "INR",
    createdAt: now,
    updatedAt: now,
  };

  await col.updateOne(
    { date },
    {
      $set: { price: doc.price, currency: doc.currency, updatedAt: now },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );

  return doc;
}

/**
 * Bulk upsert rates for all dates in [from, to] inclusive.
 */
export async function bulkSetDailyRates(
  from: string,
  to: string,
  price: number
): Promise<{ updated: number; dates: string[] }> {
  if (!isValidDateStr(from) || !isValidDateStr(to)) throw new Error("Invalid date range");
  if (from > to) throw new Error("from must be <= to");
  if (price <= 0 || !Number.isFinite(price)) throw new Error("Price must be a positive number");

  const dates = dateRange(from, to);
  if (dates.length > 365) throw new Error("Bulk range cannot exceed 365 days");

  const col = await getRatesCollection();
  const now = new Date().toISOString();
  const roundedPrice = Math.round(price);

  const ops = dates.map((date) => ({
    updateOne: {
      filter: { date },
      update: {
        $set: { price: roundedPrice, currency: "INR" as const, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      upsert: true,
    },
  }));

  await col.bulkWrite(ops, { ordered: false });
  return { updated: dates.length, dates };
}

/**
 * Delete a daily rate (makes that date have no configured price).
 */
export async function deleteDailyRate(date: string): Promise<boolean> {
  const col = await getRatesCollection();
  const result = await col.deleteOne({ date });
  return result.deletedCount > 0;
}
