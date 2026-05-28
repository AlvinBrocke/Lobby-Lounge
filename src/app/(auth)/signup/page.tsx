"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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
      router.push("/signup/onboarding?step=3");
    }, 1000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-background">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500">
        <Card className="border-none shadow-2xl bg-black/40 backdrop-blur-xl text-white">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <Link href="/">
                <img
                  src="/images/L&L Main Logo.png"
                  alt="Lobby & Lounge Logo"
                  className="h-10 w-auto brightness-0 invert"
                />
              </Link>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Create your account
            </CardTitle>
            <CardDescription className="text-gray-400 font-medium pt-1">
              Start your 14-day free business trial
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-primary-500 h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-primary-500 h-12 rounded-xl"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center font-medium animate-pulse">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-white text-black hover:bg-gray-200 font-bold rounded-xl transition-all shadow-xl shadow-white/5 mt-4"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="bg- px-3 text-white">Or</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10 h-12 rounded-xl"
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: { redirectTo: "/signup/onboarding?step=3" },
                  });
                }}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
              </Button>
              <Button
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10 h-12 rounded-xl"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 18 18">
                  <path d="M11.833 3.51c.367-1.16.035-2.28-.755-3.097a3.007 3.007 0 0 0-3.009-.64 2.822 2.822 0 0 0-2.202 2.766 2.89 2.89 0 0 0 3.037 3.03c1.071 0 2.298-.826 2.929-2.059Zm-1.637 4.197c-1.332 0-2.585.807-3.328.807-.738 0-1.844-.764-2.883-.746-1.365.02-2.625.795-3.328 2.016-.279.48-.44 1.157-.44 2.146 0 2.21 1.63 4.249 3.25 4.249.774 0 1.488-.52 2.261-.52.753 0 1.405.52 2.259.52 1.558 0 2.868-1.845 3.328-3.024-1.637-.622-2.311-2.146-2.311-3.693 0-1.32.744-2.593 1.836-3.235-.553-.872-1.46-1.428-2.644-1.52Z" />
                </svg>
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center pt-2">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-white hover:underline font-bold"
              >
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
