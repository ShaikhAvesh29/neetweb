"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function VerifiedPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-100 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />

      <div className="z-10 text-center">
        <div className="w-20 h-20 bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Email Verified!</h1>
        <p className="text-zinc-500 text-sm mb-6">Taking you to your dashboard...</p>
        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin mx-auto" />
      </div>
    </main>
  );
}
