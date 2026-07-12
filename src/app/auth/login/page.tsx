"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, LogIn } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const inputClasses =
    "w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500 focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-2xl px-5 py-4 outline-none transition-all shadow-sm text-sm";
  const labelClasses = "block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 ml-1";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(authError.message); setIsSubmitting(false); return; }
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-100 dark:bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/50 dark:bg-blue-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/50 dark:bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Siddqia Trust</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Welcome back — sign in to your dashboard</p>
        </div>

        <div className="p-8 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/80 dark:border-zinc-700/50">
          <h2 className="text-xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 mb-6">Sign In</h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className={labelClasses}>Email Address</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" className={inputClasses}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`${labelClasses} mb-0`}>Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password" className={inputClasses}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-800 font-medium"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit" disabled={isSubmitting}
              className="w-full py-4 px-4 rounded-2xl font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center shadow-lg shadow-zinc-900/20 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn className="w-5 h-5 mr-2" /> Sign In</>}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 font-semibold underline underline-offset-2 transition-colors">
            Sign up
          </Link>
        </p>
        <p className="text-center mt-2">
          <Link href="/auth" className="text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 text-xs transition-colors">
            ← Back
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
