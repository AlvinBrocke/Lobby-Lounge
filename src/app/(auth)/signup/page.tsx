"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Music,
  Loader2,
  Mail,
  Lock,
  Building2,
  ChevronDown,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await authClient.signUp.email({
      email,
      password,
      name: businessName, // Using business name as the user name for Better Auth
      callbackURL: "/onboarding",
    });

    if (authError) {
      setError(authError.message || "Failed to sign up. Please try again.");
      setLoading(false);
    } else {
      router.push("/onboarding");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Graphic Elements (Mocking the image's aesthetic) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#0891B2]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#0D9488]/10 rounded-full blur-[120px]" />

        {/* Mock background text shown in the image */}
        <div className="absolute bottom-[10%] left-[5%] opacity-10 select-none">
          <h2 className="text-[12vw] font-bold leading-none text-white whitespace-nowrap">
            Sound Meets
          </h2>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[480px]">
        {/* Header/Logo */}
        <div className="flex items-center space-x-2 mb-8 justify-center lg:justify-start">
          <div className="w-10 h-10 bg-[#00388D] rounded flex items-center justify-center">
            <Music className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#00388D]">
            Lobby & Lounge
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-500 font-medium">Set up your free trial</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Business Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Enter your business name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00388D]/20 focus:border-[#00388D] transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

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

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">
                Business Type
              </label>
              <div className="relative">
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#00388D]/20 focus:border-[#00388D] transition-all"
                >
                  <option value="" disabled>
                    Select your business type
                  </option>
                  <option value="hotel">Hotel / Hospitality</option>
                  <option value="restaurant">Restaurant / Bar</option>
                  <option value="retail">Retail Store</option>
                  <option value="office">Office Space</option>
                  <option value="fitness">Fitness Studio</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>
              </div>
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
                onClick={() => authClient.signIn.social({ provider: "google" })}
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
              <Link href="/login" className="text-[#00388D] hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
