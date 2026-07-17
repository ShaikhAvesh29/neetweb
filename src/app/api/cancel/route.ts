import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rsmkyutyppipcfrjnsjt.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbWt5dXR5cHBpcGNmcmpuc2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTk2MTUsImV4cCI6MjA5OTI5NTYxNX0.YTAcTG9FVKkxlGM7EPl5GecAg7KyAGTJRVqlD7hT5NY";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, userId } = body;

    if (!bookingId || !userId) {
      return NextResponse.json({ success: false, message: "Missing bookingId or userId." }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Call the cancel_and_promote RPC
    const { data, error } = await supabase.rpc("cancel_and_promote", {
      p_booking_id: bookingId,
      p_user_id: userId,
    });

    if (error) {
      console.error("cancel_and_promote RPC error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, message: "Cancellation failed — no result returned." }, { status: 500 });
    }

    const result = data[0];
    if (result.status === "ERROR") {
      return NextResponse.json({ success: false, message: result.message }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      message: result.message,
    });
  } catch (err: any) {
    console.error("Cancel route error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
