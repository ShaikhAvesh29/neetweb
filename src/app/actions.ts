"use server";

import { createClient } from "@supabase/supabase-js";

export async function submitBooking(data: {
  name: string;
  gender: string;
  is_nri: boolean;
  neet_score: number;
  email: string;
  phone: string;
  city?: string;
  user_id?: string;
  password?: string;
  redirectTo?: string;
}) {
  const supabaseUrl = "https://rsmkyutyppipcfrjnsjt.supabase.co";
  const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbWt5dXR5cHBpcGNmcmpuc2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTk2MTUsImV4cCI6MjA5OTI5NTYxNX0.YTAcTG9FVKkxlGM7EPl5GecAg7KyAGTJRVqlD7hT5NY";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
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
        console.error("EXACT BACKEND AUTH ERROR:", authError);
        return { success: false, message: authError.message };
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
      console.error("EXACT BACKEND ERROR:", supabaseError);
      return { success: false, message: supabaseError.message };
    }

    if (!result?.success) {
      return { success: false, message: result?.message || "Booking failed." };
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

    return { success: true, batch_number: result.batch_number };
  } catch (error: any) {
    console.error("EXACT BACKEND ERROR:", error);
    return { success: false, message: error.message || "Server Error" };
  }
}

// -----------------------------------------------------------------------------
// PROFILE & PASSWORD ACTIONS (Native Supabase Auth)
// -----------------------------------------------------------------------------

export async function updateProfileAction(userId: string, data: { name: string; phone: string; neet_score: number }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rsmkyutyppipcfrjnsjt.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbWt5dXR5cHBpcGNmcmpuc2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTk2MTUsImV4cCI6MjA5OTI5NTYxNX0.YTAcTG9FVKkxlGM7EPl5GecAg7KyAGTJRVqlD7hT5NY";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      name: data.name,
      phone: data.phone,
      neet_score: data.neet_score,
      updated_at: new Date().toISOString()
    });

  if (error) {
    return { success: false, message: error.message };
  }
  return { success: true, message: "Profile updated successfully." };
}

export async function changePasswordAction(email: string, currentPassword: string, newPassword: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rsmkyutyppipcfrjnsjt.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbWt5dXR5cHBpcGNmcmpuc2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTk2MTUsImV4cCI6MjA5OTI5NTYxNX0.YTAcTG9FVKkxlGM7EPl5GecAg7KyAGTJRVqlD7hT5NY";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Verify Current Password by signing in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (signInError) {
    return { success: false, message: "Incorrect current password." };
  }

  // 2. Update the Password (native limit applies for any confirmation emails if enabled in Supabase)
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { success: false, message: updateError.message };
  }

  await supabase.auth.signOut();
  return { success: true, message: "Password changed successfully!" };
}

// -----------------------------------------------------------------------------
// TRANSACTIONAL EMAILS (Nodemailer)
// -----------------------------------------------------------------------------
import nodemailer from "nodemailer";

export async function sendCounsellingTicket(userId: string, email: string, booking: any) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rsmkyutyppipcfrjnsjt.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbWt5dXR5cHBpcGNmcmpuc2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTk2MTUsImV4cCI6MjA5OTI5NTYxNX0.YTAcTG9FVKkxlGM7EPl5GecAg7KyAGTJRVqlD7hT5NY";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Check strict lifetime limit
  const { count, error: countError } = await supabase
    .from("email_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("email_type", "counselling_ticket");

  if (countError) {
    return { success: false, message: "Error verifying email limit." };
  }

  // If already sent once, return the flag
  if (count !== null && count >= 1) {
    return { success: false, already_sent: true, message: "Ticket already emailed." };
  }

  // 2. Send email via Nodemailer (Gmail App Password)
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Format the Sunday date nicely if available
    const batchDateStr = booking.batch_date
      ? new Date(booking.batch_date).toLocaleDateString("en-IN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : `Batch ${booking.batch_number}`;

    await transporter.sendMail({
      from: `"Siddqia Trust" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ Booking Confirmed — Batch ${booking.batch_number} | Siddqia Trust`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Booking Confirmed</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:#18181b;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
          <p style="color:#a1a1aa;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px;">Siddqia Trust</p>
          <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:0;">Booking Confirmed ✓</h1>
          <p style="color:#71717a;font-size:14px;margin:8px 0 0;">NEET UG Counselling Session</p>
        </td></tr>
        <!-- Ticket body -->
        <tr><td style="background:#ffffff;padding:36px 40px;">
          <p style="color:#3f3f46;font-size:15px;line-height:1.6;margin:0 0 28px;">Dear <strong style="color:#18181b;">${booking.name}</strong>,<br>Your slot has been successfully reserved. Here are your session details:</p>
          <!-- Details grid -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;">
            <tr style="background:#fafafa;">
              <td style="padding:14px 20px;border-bottom:1px solid #e4e4e7;width:40%;">
                <p style="margin:0;font-size:11px;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Batch</p>
                <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#18181b;">Batch ${booking.batch_number}</p>
              </td>
              <td style="padding:14px 20px;border-bottom:1px solid #e4e4e7;">
                <p style="margin:0;font-size:11px;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Session Date</p>
                <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#18181b;">${batchDateStr}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px;border-bottom:1px solid #e4e4e7;">
                <p style="margin:0;font-size:11px;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Time</p>
                <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#18181b;">10:00 AM – 1:00 PM</p>
              </td>
              <td style="padding:14px 20px;border-bottom:1px solid #e4e4e7;">
                <p style="margin:0;font-size:11px;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">NEET Score</p>
                <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#18181b;">${booking.neet_score}</p>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding:14px 20px;">
                <p style="margin:0;font-size:11px;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Venue</p>
                <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#18181b;">Siddiqui Masjid, Mumbra, Thane, Maharashtra</p>
              </td>
            </tr>
          </table>
          <!-- CTA -->
          <div style="margin:28px 0;text-align:center;">
            <a href="https://neetweb.vercel.app/dashboard" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;">View My Ticket →</a>
          </div>
          <!-- Note -->
          <div style="background:#fafafa;border:1px solid #e4e4e7;border-radius:10px;padding:16px 20px;">
            <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">
              📋 <strong style="color:#3f3f46;">Please bring:</strong> Your NEET hall ticket, Aadhaar card, and any category certificates (if applicable).<br>
              ⏰ <strong style="color:#3f3f46;">Arrive 15 minutes early</strong> to complete entry formalities.
            </p>
          </div>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#fafafa;border:1px solid #e4e4e7;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;">Organised by <strong>Siddqia Trust</strong> · Mumbra, Thane, Maharashtra</p>
          <p style="margin:6px 0 0;font-size:12px;color:#a1a1aa;">Questions? Email <a href="mailto:aveshshaikh290307@gmail.com" style="color:#71717a;">aveshshaikh290307@gmail.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
      `,
    });
  } catch (err: any) {
    console.error("Nodemailer error:", err);
    return { success: false, message: "Failed to send confirmation email." };
  }

  // 3. Log the successful send
  const { error: insertError } = await supabase
    .from("email_logs")
    .insert([{ user_id: userId, email, email_type: "counselling_ticket" }]);

  if (insertError) {
    console.error("Failed to log email send:", insertError);
  }

  return { success: true, message: "Digital ticket sent successfully!" };
}
