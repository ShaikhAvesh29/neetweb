"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, UserPlus, LogIn } from "lucide-react";

export default function AuthLanding() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-100 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-3 drop-shadow-sm">
            Siddqia Trust
          </h1>
          <p className="text-zinc-500 font-medium">
            Secure your spot for the NEET Counselling Session.
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-4">
          <Link href="/auth/signup" className="group block">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-zinc-900 flex items-center justify-center shrink-0">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-zinc-900 font-bold text-base">New here?</p>
                    <p className="text-zinc-500 text-sm mt-0.5">Create an account &amp; book your slot</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
              </div>
            </motion.div>
          </Link>

          <Link href="/auth/login" className="group block">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/70 backdrop-blur-2xl border border-white/80 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-zinc-200 flex items-center justify-center shrink-0">
                    <LogIn className="w-5 h-5 text-zinc-700" />
                  </div>
                  <div>
                    <p className="text-zinc-900 font-bold text-base">Already have an account?</p>
                    <p className="text-zinc-500 text-sm mt-0.5">Sign in to access your dashboard</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
              </div>
            </motion.div>
          </Link>
        </div>


      </motion.div>
    </main>
  );
}
