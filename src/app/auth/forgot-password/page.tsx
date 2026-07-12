"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClasses =
    "w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500 focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-2xl px-5 py-4 outline-none transition-all shadow-sm text-sm";
  const labelClasses = "block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 ml-1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setIsSubmitting(false);
      return;
    }

    setSent(true);
    setIsSubmitting(false);
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
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Reset your password</p>
        </div>

        <div className="p-8 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/80 dark:border-zinc-700/50">
          {!sent ? (
            <>
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Forgot Password?</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={labelClasses}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClasses}
                  />
                </div>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-800 font-medium"
                  >
                    {error}
                  </motion.div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-4 rounded-2xl font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center shadow-lg shadow-zinc-900/20 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Mail className="w-5 h-5 mr-2" /> Send Reset Link</>}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Email Sent!</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                We sent a password reset link to <span className="font-semibold text-zinc-800 dark:text-zinc-200">{email}</span>.
                Check your inbox and click the link.
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-5">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
