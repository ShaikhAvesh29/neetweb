"use client";
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket, BookOpen, GraduationCap, Globe2, BarChart3,
  LogOut, Menu, Stethoscope, ChevronRight, Loader2,
  Home, HeadphonesIcon, Mail, Phone, Award, Users, Star, User, Send, AlertCircle, CheckCircle2
} from "lucide-react";
import { sendCounsellingTicket } from "@/app/actions";

// ─── Sidebar items ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "home",     label: "Home",                icon: Home },
  { id: "ticket",   label: "My Ticket",           icon: Ticket },
  { id: "process",  label: "Counselling Process", icon: BookOpen },
  { id: "colleges", label: "Top Colleges",        icon: GraduationCap },
  { id: "nri",      label: "NRI Quota Info",      icon: Globe2 },
  { id: "quota",    label: "State vs AIQ",        icon: BarChart3 },
  { id: "helpdesk", label: "Help Desk",           icon: HeadphonesIcon },
  { id: "profile",  label: "My Profile",          icon: User },
];

// ─── My Ticket ────────────────────────────────────────────────────────────────
function MyTicket({ booking, user }: { booking: any, user: any }) {
  const [isEmailing, setIsEmailing] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "success" | "error" | "blocked">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const handleEmailTicket = async () => {
    setIsEmailing(true);
    setEmailStatus("idle");
    const response = await sendCounsellingTicket(user.id, user.email, booking);
    
    if (response.already_sent) {
      setEmailStatus("blocked");
      setStatusMessage("This ticket has already been emailed to you. If you need manual assistance logging in or re-verifying your ticket, please contact Avesh Shaikh directly.");
    } else if (response.success) {
      setEmailStatus("success");
      setStatusMessage(response.message);
    } else {
      setEmailStatus("error");
      setStatusMessage(response.message || "Failed to send ticket.");
    }
    setIsEmailing(false);
  };

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Ticket className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-4" />
        <p className="text-zinc-600 dark:text-zinc-400 font-semibold">No booking found</p>
        <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">Your ticket will appear here after booking.</p>
      </div>
    );
  }
  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 text-center">Your Ticket</h2>
      
      {emailStatus === "blocked" && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed">{statusMessage}</p>
        </div>
      )}
      {emailStatus === "success" && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          <p className="text-sm font-medium leading-relaxed">{statusMessage}</p>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-zinc-200 dark:border-zinc-800">
        {/* Header stripe */}
        <div className="bg-zinc-900 dark:bg-zinc-100 px-6 py-5 text-white dark:text-zinc-900 text-center relative">
          <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-zinc-100 dark:bg-zinc-950 rounded-full border border-zinc-200 dark:border-zinc-800" />
          <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-zinc-100 dark:bg-zinc-950 rounded-full border border-zinc-200 dark:border-zinc-800" />
          <p className="text-xs tracking-widest text-zinc-400 dark:text-zinc-500 uppercase font-semibold mb-1">Boarding Pass</p>
          <p className="text-2xl font-bold">Batch {booking.batch_number}</p>
        </div>
        {/* Details */}
        <div className="px-6 pt-7 pb-5 space-y-4 border-b-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-bold">Passenger</p>
            <p className="text-zinc-900 dark:text-zinc-100 font-bold text-lg mt-0.5">{booking.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-bold">City</p>
              <p className="text-zinc-800 dark:text-zinc-200 font-semibold mt-0.5">{booking.city || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-bold">NEET Score</p>
              <p className="text-zinc-800 dark:text-zinc-200 font-semibold mt-0.5">{booking.neet_score}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-bold">Time</p>
              <p className="text-zinc-800 dark:text-zinc-200 font-semibold mt-0.5">10:00 AM</p>
            </div>
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-bold">To</p>
              <p className="text-zinc-800 dark:text-zinc-200 font-semibold mt-0.5">1:00 PM</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-bold">Venue</p>
            <p className="text-zinc-800 dark:text-zinc-200 font-semibold mt-0.5 text-sm leading-snug">
              Siddiqui Masjid, Mumbra, Thane, Maharashtra
            </p>
          </div>
        </div>
        <div className="px-6 py-4 text-center bg-zinc-50 dark:bg-zinc-900/50">
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono tracking-widest">
            {booking.phone}–{booking.batch_number}
          </p>
        </div>
      </div>
      <p className="text-zinc-400 dark:text-zinc-500 text-xs text-center mt-4 leading-relaxed mb-6">
        Please arrive 15 minutes early. Bring your hall ticket and a valid ID proof.
      </p>

      <button
        onClick={handleEmailTicket}
        disabled={isEmailing || emailStatus === "success" || emailStatus === "blocked"}
        className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3.5 rounded-xl font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        {isEmailing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4" />
            {emailStatus === "success" ? "Sent Successfully" : "Email My Ticket"}
          </>
        )}
      </button>
    </div>
  );
}

// ─── Home / Counsellor Info ───────────────────────────────────────────────────
const HomeSection = (
  <div className="max-w-2xl">
    {/* Welcome banner */}
    <div className="bg-zinc-900 dark:bg-zinc-100 rounded-2xl p-6 mb-6 text-white dark:text-zinc-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 dark:bg-zinc-900/5 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 dark:bg-zinc-900/5 rounded-full translate-y-1/2 -translate-x-1/4" />
      <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium mb-1 relative z-10">Welcome to</p>
      <h1 className="text-2xl font-bold mb-1 relative z-10">Siddqia Trust</h1>
      <p className="text-zinc-400 dark:text-zinc-500 text-sm relative z-10">NEET UG Counselling Session</p>
    </div>

    {/* Counsellor card */}
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm mb-5">
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center shrink-0">
          <Stethoscope className="w-8 h-8 text-zinc-700 dark:text-zinc-300" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Muzaffar Sir</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">Lead NEET Counsellor — Siddqia Trust</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-semibold">
              <Star className="w-3 h-3" /> 15+ Years Experience
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-semibold">
              <Award className="w-3 h-3" /> UG &amp; PG Expert
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800">
        <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
          With over <span className="font-bold text-zinc-900 dark:text-zinc-100">15 years</span> of dedicated experience spanning 
          <span className="font-bold text-zinc-900 dark:text-zinc-100"> decades</span> in both <span className="font-bold text-zinc-900 dark:text-zinc-100">UG and PG NEET counselling</span>, 
          Muzaffar Sir has guided and counselled more than{" "}
          <span className="font-bold text-zinc-900 dark:text-zinc-100">50,000 students</span> in securing admissions to top medical colleges 
          across India. His expert guidance covers AIQ, State Quota, NRI Quota, and management seats in both government 
          and private medical colleges.
        </p>
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-4 mb-5">
      {[
        { icon: Users, value: "50,000+", label: "Students Counselled" },
        { icon: Award, value: "15+ Years", label: "UG & PG Experience" },
        { icon: Star, value: "Decades", label: "Of Trusted Service" },
      ].map((s) => (
        <div key={s.label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-center shadow-sm">
          <s.icon className="w-5 h-5 text-zinc-500 dark:text-zinc-400 mx-auto mb-2" />
          <p className="text-zinc-900 dark:text-zinc-100 font-bold text-base leading-none">{s.value}</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1 leading-snug">{s.label}</p>
        </div>
      ))}
    </div>

    {/* Organised by */}
    <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-center">
      <p className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider font-bold mb-1">Organised by</p>
      <p className="text-zinc-900 dark:text-zinc-100 font-bold text-lg">Siddqia Trust</p>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Committed to guiding the next generation of medical professionals</p>
    </div>
  </div>
);

// ─── Help Desk ────────────────────────────────────────────────────────────────
const HelpDeskSection = (
  <div className="max-w-2xl">
    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Help Desk</h2>
    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Have questions? We&apos;re here to help you.</p>

    {/* Main contact card */}
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm mb-5">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shrink-0">
          <HeadphonesIcon className="w-6 h-6 text-white dark:text-zinc-900" />
        </div>
        <div>
          <h3 className="text-zinc-900 dark:text-zinc-100 font-bold">Contact Support</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">We typically respond within 24 hours</p>
        </div>
      </div>

      <div className="space-y-4">
        <a
          href="mailto:aveshshaikh290307@gmail.com"
          className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-white dark:text-zinc-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Email Us</p>
            <p className="text-zinc-900 dark:text-zinc-100 font-bold text-sm group-hover:underline underline-offset-2 truncate">
              aveshshaikh290307@gmail.com
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
        </a>
      </div>
    </div>

    {/* FAQ */}
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-zinc-900 dark:text-zinc-100 font-bold mb-4">Frequently Asked Questions</h3>
      <div className="space-y-4">
        {[
          {
            q: "When will I receive my session details?",
            a: "Session details including exact date, time and venue will be shared via email 48 hours before the session.",
          },
          {
            q: "Can I reschedule my booking?",
            a: "Rescheduling is subject to availability. Please email us at least 3 days before your booked session.",
          },
          {
            q: "What documents should I bring?",
            a: "Bring your NEET scorecard, hall ticket, Aadhaar card, and any category certificates (if applicable).",
          },
          {
            q: "Is this session for both UG and PG aspirants?",
            a: "No, this session is exclusively for NEET UG aspirants.",
          },
        ].map((item) => (
          <div key={item.q} className="pb-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0">
            <p className="text-zinc-900 dark:text-zinc-100 font-semibold text-sm mb-1">{item.q}</p>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Info Sections ────────────────────────────────────────────────────────────
const INFO_SECTIONS: Record<string, React.ReactNode> = {
  home: HomeSection,
  helpdesk: HelpDeskSection,
  process: (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">NEET Counselling Process</h2>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">How the MCC counselling rounds work step-by-step.</p>
      <div className="space-y-4">
        {[
          { step: "01", title: "Registration & Fee Payment", desc: "Register on the MCC portal and pay the refundable security deposit (₹10,000 for general, ₹5,000 for SC/ST/OBC)." },
          { step: "02", title: "Choice Filling & Locking", desc: "Fill and lock your preferred medical colleges and courses in order of priority. You can change choices until the locking deadline." },
          { step: "03", title: "Seat Allotment", desc: "MCC processes your choices based on merit (NEET rank), category, and availability. Results are published online." },
          { step: "04", title: "Reporting to College", desc: "If allotted, report to the college within the specified window with original documents for verification." },
          { step: "05", title: "Upgrade / Stray Vacancy", desc: "If not satisfied, wait for Round 2 or the Stray Vacancy round for last-minute seat allocation." },
        ].map((item) => (
          <div key={item.step} className="flex gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <span className="text-3xl font-black text-zinc-100 shrink-0 leading-none w-10">{item.step}</span>
            <div>
              <p className="text-zinc-900 dark:text-zinc-100 font-bold text-sm">{item.title}</p>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  colleges: (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Top Government Medical Colleges</h2>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Best MBBS colleges under AIQ (All India Quota) ranked by NIRF.</p>
      <div className="space-y-3">
        {[
          { rank: "1", name: "AIIMS New Delhi", city: "New Delhi", seats: "107", cutoff: "50–100" },
          { rank: "2", name: "JIPMER Puducherry", city: "Puducherry", seats: "150", cutoff: "100–300" },
          { rank: "3", name: "Maulana Azad Medical College", city: "New Delhi", seats: "250", cutoff: "300–700" },
          { rank: "4", name: "Lady Hardinge Medical College", city: "New Delhi", seats: "200", cutoff: "400–1000" },
          { rank: "5", name: "Grant Medical College", city: "Mumbai", seats: "150", cutoff: "1000–3000" },
          { rank: "6", name: "Seth GS Medical College", city: "Mumbai", seats: "200", cutoff: "2000–5000" },
          { rank: "7", name: "BJ Medical College", city: "Pune", seats: "250", cutoff: "3000–8000" },
          { rank: "8", name: "Government Medical College Nagpur", city: "Nagpur", seats: "150", cutoff: "5000–15000" },
        ].map((c) => (
          <div key={c.rank} className="flex items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 py-4 shadow-sm">
            <span className="text-zinc-300 dark:text-zinc-600 font-black text-sm w-5 shrink-0">#{c.rank}</span>
            <div className="flex-1 min-w-0">
              <p className="text-zinc-900 dark:text-zinc-100 font-bold text-sm truncate">{c.name}</p>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5">{c.city}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-zinc-900 dark:text-zinc-100 text-xs font-bold">Rank {c.cutoff}</p>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs">{c.seats} seats</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  nri: (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">NRI Quota Information</h2>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Everything you need to know about NRI/Management quota seats.</p>
      <div className="grid gap-4">
        {[
          { title: "What is NRI Quota?", desc: "15% of seats in private medical colleges are reserved for NRI/NRI-sponsored candidates. These seats have higher fees but lower NEET cutoffs." },
          { title: "Who is Eligible?", desc: "Indian nationals residing abroad (NRI), Persons of Indian Origin (PIO), and Overseas Citizenship of India (OCI) holders. Sponsored candidates must provide a sponsoring NRI relative's proof." },
          { title: "Fee Structure", desc: "NRI quota fees range from ₹15–25 lakhs/year in private colleges, compared to ₹25,000–1 lakh/year in government colleges under AIQ." },
          { title: "Documents Required", desc: "Passport copy, Visa/Residence permit, Proof of NRI status (Employment/Bank documents abroad), NEET scorecard, Sponsorship letter (if applicable)." },
          { title: "Counselling Process", desc: "NRI quota counselling is conducted by the respective state governments or by the individual colleges. It is separate from the MCC's AIQ counselling." },
        ].map((item) => (
          <div key={item.title} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <p className="text-zinc-900 dark:text-zinc-100 font-bold text-sm mb-1.5">{item.title}</p>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  ),
  quota: (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">State Quota vs All India Quota (AIQ)</h2>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">Understanding the two main counselling pools for MBBS admissions.</p>
      <div className="grid grid-cols-1 gap-4 mb-5">
        <div className="bg-zinc-900 dark:bg-zinc-100 rounded-2xl p-6 text-white dark:text-zinc-900">
          <h3 className="font-bold text-base mb-4">All India Quota (AIQ) — 15%</h3>
          <ul className="space-y-2">
            {[
              "15% of government college seats",
              "Conducted by MCC (Medical Counselling Committee)",
              "Open to students from ALL states",
              "Higher competition — national level",
              "Includes AIIMS, JIPMER, central universities",
              "4 rounds: R1, R2, Mop-up, Stray Vacancy",
            ].map((pt) => (
              <li key={pt} className="flex items-start gap-2 text-zinc-300 dark:text-zinc-600 text-sm">
                <ChevronRight className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5" /> {pt}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-zinc-900 dark:text-zinc-100 font-bold text-base mb-4">State Quota — 85%</h3>
          <ul className="space-y-2">
            {[
              "85% of government college seats",
              "Conducted by State Counselling Authority",
              "Only for domicile/resident students of that state",
              "Lower competition — state level only",
              "Separate registration on state portal required",
              "Lower cutoffs than AIQ for same colleges",
            ].map((pt) => (
              <li key={pt} className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400 text-sm">
                <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5" /> {pt}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
        <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
          <span className="text-zinc-900 dark:text-zinc-100 font-bold">💡 Strategy tip:</span> Register for BOTH AIQ (MCC) and your state counselling simultaneously.
          Accept a seat from whichever gives you a better college. You can withdraw from one after confirming the other (before the deadline).
        </p>
      </div>
    </div>
  ),
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/auth"); return; }
      setUser(session.user);
      const { data } = await supabase
        .from("bookings").select("*").eq("user_id", session.user.id).single();
      setBooking(data || null);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-400 dark:text-zinc-500 animate-spin" />
      </div>
    );
  }

  const renderContent = () => {
    if (activeSection === "ticket") return <MyTicket booking={booking} user={user} />;
    return INFO_SECTIONS[activeSection] || INFO_SECTIONS["home"];
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 h-screen w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800
        flex flex-col z-30 transition-transform duration-300 ease-in-out shadow-sm
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Brand */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white dark:text-zinc-900" />
            </div>
            <div>
              <p className="text-zinc-900 dark:text-zinc-100 font-bold text-sm leading-none">Siddqia Trust</p>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">NEET Counselling</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 mx-3 mt-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
          <p className="text-zinc-800 dark:text-zinc-200 text-xs font-bold truncate">{user?.user_metadata?.name || "Student"}</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs truncate mt-0.5">{user?.email}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "profile") {
                    router.push("/profile");
                  } else {
                    setActiveSection(item.id); 
                    setSidebarOpen(false);
                  }
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/20"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:bg-zinc-950"
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-10 lg:hidden bg-white dark:bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white dark:text-zinc-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <p className="text-zinc-900 dark:text-zinc-100 font-bold text-sm">
            {NAV_ITEMS.find((n) => n.id === activeSection)?.label}
          </p>
          <div className="w-9" />
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto bg-zinc-100 dark:bg-zinc-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
