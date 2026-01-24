"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Music, Loader2, Mail, Lock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Navigation } from "@/components/landing/Navigation";
import { AuthBackground } from "@/components/auth/AuthBackground";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Mock signup for development
    setTimeout(() => {
      router.push("/onboarding?step=3");
    }, 1000);

    // const supabase = createClient();
    // const { error: authError } = await supabase.auth.signUp({
    //   email,
    //   password,
    // });

    // if (authError) {
    //   setError(authError.message || "Failed to sign up. Please try again.");
    //   setLoading(false);
    // } else {
    //   router.push("/onboarding?step=3");
    // }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Graphic Elements (Mocking the image's aesthetic) */}
      <AuthBackground />

      <div className="relative z-10 w-full max-w-[480px]">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="flex items-center mb-8 justify-center ">
              <Link href="/">
                <img
                  src="/images/L&L Main Logo.png"
                  alt="Lobby & Lounge Logo"
                  className="h-10 w-auto"
                />
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-500 font-medium">Set up your free trial</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00388D]/20 focus:border-[#00388D] transition-all placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00388D]/20 focus:border-[#00388D] transition-all placeholder:text-gray-400"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center font-medium">
                {error}
              </p>
            )}

            <div className="relative pt-2">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm font-medium">
                <span className="bg-white px-4 text-gray-400">
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                className="flex w-full items-center justify-center space-x-3 rounded-xl border border-gray-300 px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: { redirectTo: "/onboarding?step=3" },
                  });
                }}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span className="font-semibold text-gray-700">
                  Continue with Google
                </span>
              </button>
              <button
                type="button"
                className="flex w-full items-center justify-center space-x-3 rounded-xl border border-gray-300 px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 18 18">
                  <path
                    d="M11.833 3.51c.367-1.16.035-2.28-.755-3.097a3.007 3.007 0 0 0-3.009-.64 2.822 2.822 0 0 0-2.202 2.766 2.89 2.89 0 0 0 3.037 3.03c1.071 0 2.298-.826 2.929-2.059Zm-1.637 4.197c-1.332 0-2.585.807-3.328.807-.738 0-1.844-.764-2.883-.746-1.365.02-2.625.795-3.328 2.016-.279.48-.44 1.157-.44 2.146 0 2.21 1.63 4.249 3.25 4.249.774 0 1.488-.52 2.261-.52.753 0 1.405.52 2.259.52 1.558 0 2.868-1.845 3.328-3.024-1.637-.622-2.311-2.146-2.311-3.693 0-1.32.744-2.593 1.836-3.235-.553-.872-1.46-1.428-2.644-1.52Z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span className="font-semibold text-gray-700">
                  Continue with Apple
                </span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00388D] hover:bg-[#002B6D] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#00388D]/20 transition-all flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Continue to Music Preferences"
              )}
            </button>

            <div className="text-center text-sm font-medium">
              <span className="text-gray-400">Already have an account? </span>
              <Link href="/signin" className="text-[#00388D] hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
