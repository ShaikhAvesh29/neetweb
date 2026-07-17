"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Download, Loader2, FileText } from "lucide-react";
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

  const exportBatchPDF = async (batchNumber: number, students: any[]) => {
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(24, 24, 27);
      doc.rect(0, 0, W, 40, "F");
      doc.setTextColor(161, 161, 170);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("SIDDQIA TRUST · NEET UG COUNSELLING", W / 2, 16, { align: "center" });
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text(`BATCH ${batchNumber} — ATTENDANCE REPORT`, W / 2, 28, { align: "center" });
      doc.setTextColor(161, 161, 170);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${new Date().toLocaleString("en-IN")} · Total Students: ${students.length}`, W / 2, 36, { align: "center" });

      // Table
      autoTable(doc, {
        startY: 50,
        head: [["#", "Name", "Gender", "City", "NEET Score", "Phone", "NRI", "Check-In ✓"]],
        body: students.map((s, i) => [
          String(i + 1),
          s.name || "—",
          s.gender || "—",
          s.city || "—",
          String(s.neet_score || "—"),
          s.phone || "—",
          s.is_nri ? "Yes" : "No",
          "",  // Manual check-in column
        ]),
        headStyles: {
          fillColor: [24, 24, 27],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8.5,
          textColor: [39, 39, 42],
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 42 },
          2: { cellWidth: 18 },
          3: { cellWidth: 25 },
          4: { cellWidth: 24, halign: "center" },
          5: { cellWidth: 30 },
          6: { cellWidth: 14, halign: "center" },
          7: { cellWidth: 18, halign: "center" },
        },
        margin: { left: 10, right: 10 },
      });

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(161, 161, 170);
        doc.text(
          `Siddqia Trust · Mumbra, Thane, Maharashtra · Page ${i} of ${pageCount}`,
          W / 2,
          doc.internal.pageSize.getHeight() - 6,
          { align: "center" }
        );
      }

      doc.save(`siddqia-batch${batchNumber}-attendance.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
    }
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
                <div className="flex items-center justify-between mb-4 px-2">
                  <div>
                    <h2 className="text-lg font-semibold text-black/80">Batch {batch}</h2>
                    <p className="text-sm text-black/40 mt-0.5">{(items as any[]).length} students</p>
                  </div>
                  <button
                    id={`download-pdf-batch-${batch}`}
                    onClick={() => exportBatchPDF(Number(batch), items as any[])}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors shadow-sm"
                  >
                    <FileText className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
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
