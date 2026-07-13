"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Download, Loader2 } from "lucide-react";
import Papa from "papaparse";

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) {
        fetchBookings();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchBookings();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setAuthError(error.message);
  };

  const fetchBookings = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("batch_number", { ascending: true })
      .order("created_at", { ascending: true });
    
    if (data) setBookings(data);
    setFetching(false);
  };

  const exportCSV = () => {
    const csv = Papa.unparse(bookings);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "bookings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="w-8 h-8 animate-spin text-black/20" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-sm border border-black/5">
          <h1 className="text-2xl font-bold mb-6 text-black">Admin Login</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black/70 mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/5 border border-transparent focus:border-black/20 rounded-xl px-4 py-3 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black/70 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/5 border border-transparent focus:border-black/20 rounded-xl px-4 py-3 outline-none"
              />
            </div>
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-medium text-white bg-black hover:bg-black/80 transition-colors"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Group by batch
  const groupedBookings = bookings.reduce((acc, curr) => {
    if (!acc[curr.batch_number]) acc[curr.batch_number] = [];
    acc[curr.batch_number].push(curr);
    return acc;
  }, {} as Record<number, any[]>);

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-8 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black mb-2">
              Bookings Dashboard
            </h1>
            <p className="text-black/60">
              Manage all student registrations.
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center px-4 py-2 bg-white border border-black/10 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>

        {fetching ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-black/20" />
          </div>
        ) : Object.keys(groupedBookings).length === 0 ? (
          <div className="text-center py-20 text-black/40">
            No bookings found.
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedBookings).map(([batch, items]) => (
              <div key={batch}>
                <h2 className="text-lg font-semibold mb-4 px-2 text-black/80">Batch {batch}</h2>
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-black/5 text-black/60 font-medium">
                        <tr>
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4">Gender</th>
                          <th className="px-6 py-4">NRI</th>
                          <th className="px-6 py-4">NEET Score</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {(items as any[]).map((b) => (
                          <tr key={b.id} className="hover:bg-black/[0.02] transition-colors">
                            <td className="px-6 py-4 font-medium text-black">{b.name}</td>
                            <td className="px-6 py-4 text-black/70">{b.gender}</td>
                            <td className="px-6 py-4 text-black/70">{b.is_nri ? "Yes" : "No"}</td>
                            <td className="px-6 py-4 text-black/70">{b.neet_score}</td>
                            <td className="px-6 py-4 text-black/70">{b.email}</td>
                            <td className="px-6 py-4 text-black/70">{b.phone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
