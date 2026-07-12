"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { motion } from "framer-motion";
import { updateProfileAction } from "@/app/actions";

interface ProfileData {
  name: string;
  phone: string;
  neet_score: number;
}

export default function ProfileForm({
  userId,
  initialData,
}: {
  userId: string;
  initialData: ProfileData | null;
}) {
  const [formData, setFormData] = useState<ProfileData>({
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    neet_score: initialData?.neet_score || 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const inputClasses =
    "w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500 focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-2xl px-5 py-4 outline-none transition-all shadow-sm text-sm";
  const labelClasses = "block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 ml-1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const res = await updateProfileAction(userId, formData);

    if (res.success) {
      setMessage({ type: "success", text: res.message || "Profile updated." });
    } else {
      setMessage({ type: "error", text: res.message || "Failed to update profile." });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-8 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/80 dark:border-zinc-700/50">
      <h2 className="text-xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 mb-6">
        Personal Information
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClasses}>Full Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>Phone Number</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 98765 43210"
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>NEET Score</label>
          <input
            type="number"
            required
            value={formData.neet_score}
            onChange={(e) =>
              setFormData({ ...formData, neet_score: parseInt(e.target.value) || 0 })
            }
            placeholder="720"
            className={inputClasses}
          />
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl text-sm border font-medium ${
              message.type === "error"
                ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800"
                : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-4 rounded-2xl font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center shadow-lg shadow-zinc-900/20 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" /> Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}
