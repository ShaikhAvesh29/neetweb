import { Mail } from "lucide-react";
import Link from "next/link";

export default function VerifyPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-100 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />

      <div className="z-10 w-full max-w-md">
        <div className="p-8 bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/80 text-center">
          <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8 text-zinc-700" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Check your email</h1>
          <p className="text-zinc-500 text-sm leading-relaxed mb-8">
            We sent a verification link to your email address. Click the link to verify your account and access your dashboard.
          </p>

          <div className="bg-zinc-50 rounded-2xl p-5 text-left space-y-3 border border-zinc-100 mb-6">
            {[
              "Open your email inbox",
              "Find an email from Siddqia Trust",
              'Click the "Confirm your email" button',
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="text-zinc-700 text-sm">{step}</p>
              </div>
            ))}
          </div>

          <p className="text-zinc-400 text-xs">
            Already verified?{" "}
            <Link href="/auth/login" className="text-zinc-700 hover:text-zinc-900 font-semibold underline underline-offset-2 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
