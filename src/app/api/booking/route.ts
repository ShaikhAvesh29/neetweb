import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rsmkyutyppipcfrjnsjt.supabase.co";
// Service role key required for admin.createUser — set this in your .env.local as SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!SUPABASE_SERVICE_KEY) {
      return NextResponse.json({ success: false, message: "Server configuration error: missing service key." }, { status: 500 });
    }

    // Use service role client for admin operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Handle user registration securely on the server side
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      user_metadata: { name: body.name },
    });

    if (authError) {
      return NextResponse.json({ success: false, message: authError.message }, { status: 400 });
    }

    // 2. Invoke the dynamic waterfall allocation function
    const { data: allocationResult, error: rpcError } = await supabase
      .rpc("secure_calendar_waterfall_allocation", { user_uuid: authData.user.id });

    if (rpcError || !allocationResult || allocationResult.length === 0) {
      // Rollback safety: delete the orphaned auth user if allocation completely fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ success: false, message: "Allocation engine error." }, { status: 500 });
    }

    const currentBooking = allocationResult[0];

    return NextResponse.json({
      success: true,
      message: "Slot successfully reserved!",
      details: {
        batchId: currentBooking.assigned_batch_id,
        scheduledDate: currentBooking.assigned_date,
      },
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
