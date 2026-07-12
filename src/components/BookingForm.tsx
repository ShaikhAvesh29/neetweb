"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, ArrowLeft, QrCode, Download, CheckCircle2 } from "lucide-react";
import html2canvas from "html2canvas";
import { submitBooking } from "@/app/actions";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.enum(["Male", "Female", "Other"]),
  is_nri: z.enum(["yes", "no"]),
  neet_score: z.number().min(0).max(720, "NEET score must be between 0 and 720"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

type FormData = z.infer<typeof formSchema>;

export default function BookingForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<{ batch_number: number } | null>(null);
  
  const ticketRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    if (step === 1) fieldsToValidate = ["name", "gender"];
    if (step === 2) fieldsToValidate = ["neet_score", "is_nri"];

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    setStep((s) => s - 1);
  };

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
      });

      if (!result.success) {
        setError(result.message || "Failed to submit booking.");
        setIsSubmitting(false);
        return;
      }

      setBookingResult({ batch_number: result.batch_number });
      setIsSubmitting(false);
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  const downloadTicket = async () => {
    if (!ticketRef.current) return;
    const canvas = await html2canvas(ticketRef.current, { scale: 2 });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `booking-ticket-${getValues("name").replace(/\s+/g, '-')}.png`;
    link.click();
  };

  // Glassmorphism aesthetic classes
  const inputClasses =
    "w-full bg-white border border-transparent focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100 text-zinc-900 placeholder:text-zinc-400 rounded-2xl px-5 py-4 outline-none transition-all shadow-sm";
  const labelClasses = "block text-sm font-semibold text-zinc-700 mb-2 ml-1";
  const errorClasses = "text-red-500 text-sm mt-1.5 ml-1 font-medium";

  return (
    <div className="w-full max-w-md mx-auto relative z-10">
      <div className="p-8 bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/80">
        
        {step < 4 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-800">
                Book Session
              </h2>
              <span className="text-sm font-semibold px-3 py-1 bg-zinc-200/50 text-zinc-600 rounded-full">
                Step {step} of 3
              </span>
            </div>
            <div className="w-full bg-zinc-200/50 h-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-zinc-800 rounded-full"
                initial={{ width: "33%" }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ ease: "easeInOut", duration: 0.3 }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="min-h-[240px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <label className={labelClasses}>Full Name</label>
                  <input
                    {...register("name")}
                    placeholder="e.g. John Doe"
                    className={inputClasses}
                  />
                  {errors.name && <p className={errorClasses}>{errors.name.message}</p>}
                </div>

                <div>
                  <label className={labelClasses}>Gender</label>
                  <select {...register("gender")} className={inputClasses} defaultValue="">
                    <option value="" disabled>Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className={errorClasses}>{errors.gender.message}</p>}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <label className={labelClasses}>NEET Score</label>
                  <input
                    type="number"
                    {...register("neet_score", { valueAsNumber: true })}
                    placeholder="e.g. 650"
                    className={inputClasses}
                  />
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

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <label className={labelClasses}>Email Address</label>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="you@example.com"
                    className={inputClasses}
                  />
                  {errors.email && <p className={errorClasses}>{errors.email.message}</p>}
                </div>

                <div>
                  <label className={labelClasses}>Phone Number</label>
                  <input
                    type="tel"
                    {...register("phone")}
                    placeholder="10-digit number"
                    className={inputClasses}
                  />
                  {errors.phone && <p className={errorClasses}>{errors.phone.message}</p>}
                </div>
              </motion.div>
            )}

            {step === 4 && bookingResult && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
              >
                <div className="mb-4 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                  <h3 className="text-xl font-bold text-zinc-900">Booking Confirmed!</h3>
                  <p className="text-zinc-500 text-sm mt-1">Here is your digital ticket.</p>
                </div>

                {/* The Ticket UI */}
                <div 
                  ref={ticketRef}
                  className="w-full bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden relative mb-6"
                >
                  <div className="bg-zinc-900 p-6 text-white text-center rounded-t-3xl relative">
                    {/* decorative circles for ticket look */}
                    <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-zinc-100 rounded-full"></div>
                    <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-zinc-100 rounded-full"></div>
                    <h4 className="text-sm font-semibold tracking-widest text-zinc-400 uppercase">Boarding Pass</h4>
                    <p className="text-2xl font-bold mt-1">Batch {bookingResult.batch_number}</p>
                  </div>
                  
                  <div className="p-6 pt-8 space-y-5 bg-white border-b-2 border-dashed border-zinc-200">
                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase">Passenger</p>
                      <p className="text-lg font-bold text-zinc-800">{getValues("name")}</p>
                    </div>
                    
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs font-semibold text-zinc-400 uppercase">Time</p>
                        <p className="text-base font-bold text-zinc-800">10:00 AM</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-zinc-400 uppercase">To</p>
                        <p className="text-base font-bold text-zinc-800">1:00 PM</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-zinc-400 uppercase">Venue</p>
                      <p className="text-sm font-bold text-zinc-800 leading-tight">
                        Siddiqui Masjid,<br/>Mumbra, Thane
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-6 flex flex-col items-center justify-center">
                    <QrCode className="w-24 h-24 text-zinc-800 opacity-80" strokeWidth={1} />
                    <p className="text-[10px] font-mono text-zinc-400 mt-2 tracking-widest">
                      {getValues("phone")}-{bookingResult.batch_number}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={downloadTicket}
                  className="w-full py-4 px-4 rounded-2xl font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors flex items-center justify-center shadow-lg shadow-zinc-900/20"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Ticket
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && step < 4 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium"
            >
              {error}
            </motion.div>
          )}

          {step < 4 && (
            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-4 px-4 rounded-2xl font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 transition-colors flex items-center justify-center shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 py-4 px-4 rounded-2xl font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors flex items-center justify-center shadow-lg shadow-zinc-900/20"
                >
                  Next
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="flex-1 py-4 px-4 rounded-2xl font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors flex items-center justify-center shadow-lg shadow-zinc-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
