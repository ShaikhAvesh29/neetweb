import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendCounsellingTicket } from "@/app/actions";

// Initialize on the server
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    let finalUserId = data.user_id;

    if (data.password) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: data.redirectTo,
          data: { name: data.name },
        },
      });

      if (authError) {
        return NextResponse.json({ success: false, message: authError.message }, { status: 400 });
      }

      finalUserId = authData.user?.id;
    }

    const { data: result, error: supabaseError } = await supabase.rpc("assign_booking", {
      p_name: data.name,
      p_gender: data.gender,
      p_is_nri: data.is_nri,
      p_neet_score: data.neet_score,
      p_email: data.email,
      p_phone: data.phone,
      p_city: data.city ?? null,
      p_user_id: finalUserId ?? null,
    });

    if (supabaseError) {
      return NextResponse.json({ success: false, message: supabaseError.message }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    if (finalUserId) {
      await sendCounsellingTicket(finalUserId, data.email, {
        batch_number: result.batch_number,
        name: data.name,
        city: data.city,
        neet_score: data.neet_score,
        phone: data.phone,
      });
    }

    return NextResponse.json({ success: true, batch_number: result.batch_number });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
  }
}
