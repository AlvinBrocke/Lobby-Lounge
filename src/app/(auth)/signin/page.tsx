"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Music, Loader2, Mail, Lock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Navigation } from "@/components/landing/Navigation";
import { AuthBackground } from "@/components/auth/AuthBackground";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Mock login for development
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);

    // const supabase = createClient();
    // const { error: authError } = await supabase.auth.signInWithPassword({
    //   email,
    //   password,
    // });

    // if (authError) {
    //   setError(
    //     authError.message ||
    //       "Failed to sign in. Please check your credentials.",
    //   );
    //   setLoading(false);
    // } else {
    //   router.push("/dashboard");
    // }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-[480px]">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <Link href="/">
              <div className="flex items-center mb-8 justify-center ">
                <img
                  src="/images/L&L Main Logo.png"
                  alt="Lobby & Lounge Logo"
                  className="h-10 w-auto"
                />
              </div>
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-500 font-medium">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Email Address
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
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs text-[#00388D] font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00388D] hover:bg-[#002B6D] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#00388D]/20 transition-all flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>

            <div className="relative pt-2">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm font-medium">
                <span className="bg-white px-4 text-gray-400">
                  Or sign in with
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
                    options: { redirectTo: "/dashboard" },
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
            </div>

            <div className="text-center text-sm font-medium">
              <span className="text-gray-400">Don't have an account? </span>
              <Link href="/signup" className="text-[#00388D] hover:underline">
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
