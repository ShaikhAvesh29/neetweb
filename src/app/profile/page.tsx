"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProfileForm from "./ProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ProfileData {
  name: string;
  phone: string;
  neet_score: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }
      
      const currentUser = session.user;
      setUser(currentUser);

      // Fetch profile data
      const { data, error } = await supabase
        .from("profiles")
        .select("name, phone, neet_score")
        .eq("id", currentUser.id)
        .single();

      if (!error && data && (data.name || data.phone || data.neet_score)) {
        setProfileData(data);
      } else {
        // Fallback to bookings table which has all the signup info
        const { data: bookingData } = await supabase.from("bookings").select("name, phone, neet_score").eq("user_id", currentUser.id).single();
        
        setProfileData({
          name: data?.name || bookingData?.name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "",
          phone: data?.phone || bookingData?.phone || currentUser.user_metadata?.phone || "",
          neet_score: data?.neet_score || bookingData?.neet_score || 0,
        });
      }
      setLoading(false);
    };

    fetchUserAndProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-zinc-100 dark:bg-zinc-950 relative overflow-hidden flex flex-col items-center py-12">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/50 dark:bg-blue-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/50 dark:bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-4xl"
      >
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm font-medium transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Account Settings
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Manage your profile information and security preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Form */}
          <ProfileForm userId={user?.id} initialData={profileData} />

          {/* Change Password Form */}
          <ChangePasswordForm email={user?.email} />
        </div>
      </motion.div>
    </main>
  );
}
