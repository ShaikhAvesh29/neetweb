"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { submitBooking } from "@/app/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Please select a valid gender",
  }),
  city: z.string().min(2, "City must be at least 2 characters"),
  is_nri: z.enum(["yes", "no"], {
    message: "Please select a valid NRI status",
  }),
  neet_score: z.number().min(0).max(720, "NEET score must be between 0 and 720"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof formSchema>;

const STEPS = [
  { title: "Personal Info", fields: ["name", "gender", "city"] },
  { title: "Academic Info", fields: ["neet_score", "is_nri"] },
  { title: "Contact & Password", fields: ["email", "phone", "password"] },
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const inputClasses =
    "w-full bg-white border border-transparent focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 text-zinc-900 placeholder:text-zinc-400 rounded-2xl px-5 py-4 outline-none transition-all shadow-sm text-sm";
  const labelClasses = "block text-sm font-semibold text-zinc-700 mb-2 ml-1";
  const errorClasses = "text-red-500 text-xs mt-1.5 ml-1 font-medium";

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const nextStep = async () => {
    const fields = STEPS[step - 1].fields as (keyof FormData)[];
    const valid = await trigger(fields);
    if (valid) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitBooking({
        name: data.name,
        gender: data.gender,
        is_nri: data.is_nri === "yes",
        neet_score: data.neet_score,
        email: data.email,
        phone: data.phone,
        city: data.city,
        password: data.password,
        redirectTo: `${window.location.origin}/auth/verified`,
      });

      if (!result.success) {
        setError(result.message || "Booking failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      router.push("/auth/verify");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-100 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Siddqia Trust</h1>
          <p className="text-zinc-500 text-sm mt-1">Create your account &amp; book your slot</p>
        </div>

        {/* Card */}
        <div className="p-8 bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/80">

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold tracking-tight text-zinc-800">
                {STEPS[step - 1].title}
              </h2>
              <span className="text-sm font-semibold px-3 py-1 bg-zinc-200/50 text-zinc-600 rounded-full">
                Step {step} of {STEPS.length}
              </span>
            </div>
            <div className="w-full bg-zinc-200/50 h-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-zinc-800 rounded-full"
                initial={{ width: "33%" }}
                animate={{ width: `${(step / STEPS.length) * 100}%` }}
                transition={{ ease: "easeInOut", duration: 0.3 }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="min-h-[240px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {/* Step 1 */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="space-y-5">
                  <div>
                    <label className={labelClasses}>Full Name</label>
                    <input {...register("name")} placeholder="e.g. Aqdas" className={inputClasses} />
                    {errors.name && <p className={errorClasses}>{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className={labelClasses}>Gender</label>
                    <select {...register("gender")} className={inputClasses} defaultValue="">
                      <option value="" disabled>Select gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                    {errors.gender && <p className={errorClasses}>{errors.gender.message}</p>}
                  </div>
                  <div>
                    <label className={labelClasses}>City / Location</label>
                    <input {...register("city")} placeholder="e.g. Mumbai" className={inputClasses} />
                    {errors.city && <p className={errorClasses}>{errors.city.message}</p>}
                  </div>
                </motion.div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="space-y-5">
                  <div>
                    <label className={labelClasses}>NEET Score</label>
                    <input type="number" {...register("neet_score", { valueAsNumber: true })} placeholder="e.g. 650" className={inputClasses} />
                    {errors.neet_score && <p className={errorClasses}>{errors.neet_score.message}</p>}
                  </div>
                  <div>
                    <label className={labelClasses}>NRI Status</label>
                    <select {...register("is_nri")} className={inputClasses} defaultValue="">
                      <option value="" disabled>Are you an NRI?</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                    {errors.is_nri && <p className={errorClasses}>{errors.is_nri.message}</p>}
                  </div>
                </motion.div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="space-y-5">
                  <div>
                    <label className={labelClasses}>Email Address</label>
                    <input type="email" {...register("email")} placeholder="you@example.com" className={inputClasses} />
                    {errors.email && <p className={errorClasses}>{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className={labelClasses}>Phone Number</label>
                    <input type="tel" {...register("phone")} placeholder="10-digit number" className={inputClasses} />
                    {errors.phone && <p className={errorClasses}>{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className={labelClasses}>Password</label>
                    <input type="password" {...register("password")} placeholder="Min. 8 characters" className={inputClasses} />
                    {errors.password && <p className={errorClasses}>{errors.password.message}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium">
                {error}
              </motion.div>
            )}

            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <button type="button" onClick={prevStep} className="flex-1 py-4 px-4 rounded-2xl font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 transition-colors flex items-center justify-center shadow-sm">
                  <ArrowLeft className="w-5 h-5 mr-2" /> Back
                </button>
              )}
              {step < STEPS.length ? (
                <button type="button" onClick={nextStep} className="flex-1 py-4 px-4 rounded-2xl font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors flex items-center justify-center shadow-lg shadow-zinc-900/20">
                  Next <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="flex-1 py-4 px-4 rounded-2xl font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors flex items-center justify-center shadow-lg shadow-zinc-900/20 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account & Book"}
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-5">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-zinc-800 hover:text-zinc-900 font-semibold underline underline-offset-2 transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
