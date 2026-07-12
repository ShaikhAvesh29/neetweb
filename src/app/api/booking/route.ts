import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize on the server
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const { data: result, error: supabaseError } = await supabase.rpc("assign_booking", {
      p_name: data.name,
      p_gender: data.gender,
      p_is_nri: data.is_nri,
      p_neet_score: data.neet_score,
      p_email: data.email,
      p_phone: data.phone,
    });

    if (supabaseError) {
      return NextResponse.json({ success: false, message: supabaseError.message }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, batch_number: result.batch_number });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
