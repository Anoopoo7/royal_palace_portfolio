#!/usr/bin/env node
/**
 * Seed Script: Populate 90 days of daily pricing
 *
 * Usage:
 *   node scripts/seed-pricing.mjs
 *
 * Requires:
 *   - MONGODB_URI and MONGODB_DB_NAME in .env
 *
 * Pricing tiers (configurable below):
 *   - Weekdays (Mon-Thu): ₹12,000
 *   - Weekends (Fri-Sun): ₹15,000
 *   - Holidays / peak season: overridden manually
 */

import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env manually (no dotenv required — just parse it)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
let envContent = "";
try {
  envContent = readFileSync(envPath, "utf8");
} catch {
  console.log("No .env file found, using process.env");
}
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim();
  if (!process.env[key]) process.env[key] = val;
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "royal_palace_homestay_test";

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set. Please set it in .env");
  process.exit(1);
}

// ── Date helpers (no import from TS source — pure JS) ──────────────────────────

function todayStr() {
  const now = new Date();
  return fmtDate(now);
}

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return fmtDate(dt);
}

function isWeekend(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const dow = dt.getDay(); // 0=Sun, 6=Sat
  return dow === 0 || dow === 5 || dow === 6; // Fri, Sat, Sun as "peak"
}

// ── Pricing tiers ──────────────────────────────────────────────────────────────
// Customize these to your real rates
const WEEKDAY_PRICE = 12000;
const WEEKEND_PRICE = 15000;
const DAYS_AHEAD = 90;

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log("✅ Connected to MongoDB");

  const db = client.db(MONGODB_DB_NAME);
  const col = db.collection("dailyRates");

  // Ensure unique index
  await col.createIndex({ date: 1 }, { unique: true });

  const today = todayStr();
  const ops = [];
  const now = new Date().toISOString();

  for (let i = 0; i < DAYS_AHEAD; i++) {
    const date = addDays(today, i);
    const price = isWeekend(date) ? WEEKEND_PRICE : WEEKDAY_PRICE;
    ops.push({
      updateOne: {
        filter: { date },
        update: {
          $set: { price, currency: "INR", updatedAt: now },
          $setOnInsert: { createdAt: now },
        },
        upsert: true,
      },
    });
  }

  const result = await col.bulkWrite(ops, { ordered: false });
  console.log(
    `✅ Seeded ${DAYS_AHEAD} days of pricing.`
  );
  console.log(
    `   Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`
  );
  console.log(
    `   Weekdays → ₹${WEEKDAY_PRICE.toLocaleString("en-IN")}, Weekends (Fri-Sun) → ₹${WEEKEND_PRICE.toLocaleString("en-IN")}`
  );

  await client.close();
  console.log("✅ Done. Calendar is ready.");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
