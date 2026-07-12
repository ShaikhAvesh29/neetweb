import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export async function GET(req: Request) {
  // 1. Verify Vercel Cron Secret for security
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rsmkyutyppipcfrjnsjt.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbWt5dXR5cHBpcGNmcmpuc2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTk2MTUsImV4cCI6MjA5OTI5NTYxNX0.YTAcTG9FVKkxlGM7EPl5GecAg7KyAGTJRVqlD7hT5NY";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 2. Fetch all bookings (assuming one global event date for now)
    // If you add a session_date column, you can filter here: .eq('session_date', tomorrow)
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .not('user_id', 'is', null);

    if (bookingsError || !bookings) {
      console.error("Failed to fetch bookings:", bookingsError);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    // 3. Fetch all users who have already received the reminder
    const { data: emailLogs, error: emailLogsError } = await supabase
      .from('email_logs')
      .select('user_id')
      .eq('email_type', 'counselling_reminder');

    if (emailLogsError) {
      console.error("Failed to fetch email logs:", emailLogsError);
      return NextResponse.json({ error: 'Failed to fetch email logs' }, { status: 500 });
    }

    const usersWhoReceivedReminder = new Set(emailLogs.map(log => log.user_id));

    // 4. Filter to get users who need the reminder
    const usersToRemind = bookings.filter(b => !usersWhoReceivedReminder.has(b.user_id));

    if (usersToRemind.length === 0) {
      return NextResponse.json({ message: 'No reminders to send.' }, { status: 200 });
    }

    // 5. Initialize Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let sentCount = 0;
    let failedCount = 0;

    // 6. Loop and send
    for (const booking of usersToRemind) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: booking.email,
          subject: "Reminder: Your NEET Counselling Session is Tomorrow!",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px; background: #fafafa;">
              <h2 style="color: #18181b; text-align: center;">Session Reminder</h2>
              <p style="color: #52525b; text-align: center;">Hi ${booking.name}, this is a quick reminder that your NEET Counselling Session is tomorrow!</p>
              <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #e4e4e7;">
                <p><strong>Batch:</strong> ${booking.batch_number || 'N/A'}</p>
                <p><strong>Time:</strong> 10:00 AM to 1:00 PM</p>
                <p><strong>Venue:</strong> Siddiqui Masjid, Mumbra, Thane, Maharashtra</p>
              </div>
              <p style="text-align: center; font-size: 12px; color: #a1a1aa; margin-top: 20px;">
                Please arrive 15 minutes early and bring your physical documents. We look forward to seeing you!
              </p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);

        // 7. Log success
        await supabase
          .from("email_logs")
          .insert([{ user_id: booking.user_id, email: booking.email, email_type: "counselling_reminder" }]);
        
        sentCount++;
      } catch (err) {
        console.error(`Failed to send to ${booking.email}:`, err);
        failedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sent ${sentCount} reminders. Failed: ${failedCount}` 
    }, { status: 200 });

  } catch (err: any) {
    console.error("Cron route error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
