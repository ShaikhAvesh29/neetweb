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
}) {
  const supabaseUrl = "https://rsmkyutyppipcfrjnsjt.supabase.co";
  const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbWt5dXR5cHBpcGNmcmpuc2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTk2MTUsImV4cCI6MjA5OTI5NTYxNX0.YTAcTG9FVKkxlGM7EPl5GecAg7KyAGTJRVqlD7hT5NY";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data: result, error: supabaseError } = await supabase.rpc("assign_booking", {
      p_name: data.name,
      p_gender: data.gender,
      p_is_nri: data.is_nri,
      p_neet_score: data.neet_score,
      p_email: data.email,
      p_phone: data.phone,
      p_city: data.city ?? null,
      p_user_id: data.user_id ?? null,
    });

    if (supabaseError) {
      console.error("EXACT BACKEND ERROR:", supabaseError);
      return { success: false, message: supabaseError.message };
    }

    if (!result?.success) {
      return { success: false, message: result?.message || "Booking failed." };
    }

    if (data.user_id) {
      await sendCounsellingTicket(data.user_id, data.email, {
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

  // 2. Send email via Nodemailer
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your NEET Counselling Digital Ticket - Siddqia Trust",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px; background: #fafafa;">
          <h2 style="color: #18181b; text-align: center;">Boarding Pass - Batch ${booking.batch_number}</h2>
          <p style="color: #52525b; text-align: center;">Here is your digital ticket for the counselling session.</p>
          <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #e4e4e7;">
            <p><strong>Passenger:</strong> ${booking.name}</p>
            <p><strong>City:</strong> ${booking.city || "—"}</p>
            <p><strong>NEET Score:</strong> ${booking.neet_score}</p>
            <p><strong>Time:</strong> 10:00 AM to 1:00 PM</p>
            <p><strong>Venue:</strong> Siddiqui Masjid, Mumbra, Thane, Maharashtra</p>
          </div>
          <p style="text-align: center; font-size: 12px; color: #a1a1aa; margin-top: 20px;">
            Please arrive 15 minutes early. Bring your hall ticket and a valid ID proof.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (err: any) {
    console.error("Nodemailer error:", err);
    return { success: false, message: "Failed to send email via SMTP." };
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
