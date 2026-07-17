import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rsmkyutyppipcfrjnsjt.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbWt5dXR5cHBpcGNmcmpuc2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTk2MTUsImV4cCI6MjA5OTI5NTYxNX0.YTAcTG9FVKkxlGM7EPl5GecAg7KyAGTJRVqlD7hT5NY";
const HMAC_KEY = process.env.TICKET_HMAC_KEY || "siddqia-trust-secret-key-2024";

async function verifyHmac(payload: string, receivedHmac: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(HMAC_KEY);
    const messageData = encoder.encode(payload);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const hmacBytes = Uint8Array.from(atob(receivedHmac), (c) => c.charCodeAt(0));
    return await crypto.subtle.verify("HMAC", cryptoKey, hmacBytes, messageData);
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false, error: "Missing token" }, { status: 400 });
  }

  let payload: any;
  try {
    const decoded = atob(token);
    payload = JSON.parse(decoded);
  } catch {
    return NextResponse.json({ valid: false, error: "Invalid token format" }, { status: 400 });
  }

  const { bookingId, userId, batchNumber, hmac } = payload;

  if (!bookingId || !userId || !hmac) {
    return NextResponse.json({ valid: false, error: "Malformed token payload" }, { status: 400 });
  }

  // Reconstruct the message that was signed (without the hmac field)
  const message = JSON.stringify({ bookingId, userId, batchNumber });
  const isValid = await verifyHmac(message, hmac);

  if (!isValid) {
    return NextResponse.json({ valid: false, error: "Invalid signature — ticket may be forged" }, { status: 401 });
  }

  // Fetch booking details from Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabase
    .from("bookings")
    .select("id, name, email, phone, neet_score, batch_number, city, gender, created_at")
    .eq("id", bookingId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return NextResponse.json({ valid: false, error: "Booking not found in database" }, { status: 404 });
  }

  return NextResponse.json({
    valid: true,
    booking: {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      neet_score: data.neet_score,
      batch_number: data.batch_number,
      city: data.city,
      gender: data.gender,
    },
  });
}
