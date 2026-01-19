"use client";

import React, { useState } from "react";

export default function LandingPage() {
  const [showFeatures, setShowFeatures] = useState(false);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage:
          "url(https://ucarecdn.com/8541a0b4-a838-444c-ba88-56cac2d45c07/-/format/auto/)",
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#093637",
      }}
    >
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img
                src="https://ucarecdn.com/300c73da-4f9d-41af-a43e-c31517f00ed4/-/format/auto/"
                alt="Lobby & Lounge"
                className="h-12 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/account/signin"
                className="text-[#093637] hover:text-[#44A08D] font-medium transition-colors"
              >
                Sign In
              </a>
              <a
                href="/account/signup"
                className="bg-gradient-to-r from-[#4ECDC4] to-[#44A08D] text-white px-6 py-2 rounded-lg font-medium hover:from-[#44A08D] hover:to-[#093637] transition-all duration-200 shadow-lg"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Perfect Music for
            <span className="block text-[#4ECDC4]">Small Business</span>
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Transform your business atmosphere with curated playlists designed
            for professional environments. From cafes to offices, create the
            perfect ambiance for your customers and team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/account/signup"
              className="bg-white text-[#093637] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/90 transition-all duration-200 transform hover:scale-105 shadow-xl"
            >
              Start 14-Day Free Trial
            </a>
            <button
              onClick={() => setShowFeatures(!showFeatures)}
              className="text-white font-semibold text-lg hover:text-[#4ECDC4] transition-colors flex items-center space-x-2"
            >
              <span>Learn More</span>
              <i
                className={`fas fa-chevron-${
                  showFeatures ? "up" : "down"
                } transition-transform`}
              ></i>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {showFeatures && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-[#4ECDC4] to-[#44A08D] rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-calendar-alt text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-[#093637] mb-4">
                Smart Scheduling
              </h3>
              <p className="text-gray-700">
                Set different playlists for different times of day and days of
                the week. Perfect for matching your business rhythm.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-[#44A08D] to-[#093637] rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-sliders-h text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-[#093637] mb-4">
                Curated Playlists
              </h3>
              <p className="text-gray-700">
                Choose from professionally curated playlists designed for
                business environments. From ambient to energetic, find your
                perfect sound.
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow border border-white/20">
              <div className="w-12 h-12 bg-gradient-to-r from-[#4ECDC4] to-[#093637] rounded-lg flex items-center justify-center mb-6">
                <i className="fas fa-building text-white text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-[#093637] mb-4">
                Business Focused
              </h3>
              <p className="text-gray-700">
                Designed specifically for B2B use. No explicit content,
                appropriate volume levels, and music that enhances your brand
                experience.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-white/10 backdrop-blur-sm py-16 border-y border-white/20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Business Atmosphere?
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of businesses creating the perfect ambiance with
            Lobby & Lounge
          </p>
          <a
            href="/account/signup"
            className="bg-white text-[#093637] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/90 transition-all duration-200 transform hover:scale-105 inline-block shadow-xl"
          >
            Start Your Free Trial Today
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#093637] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img
                src="https://ucarecdn.com/300c73da-4f9d-41af-a43e-c31517f00ed4/-/format/auto/"
                alt="Lobby & Lounge"
                className="h-8 w-auto brightness-0 invert"
              />
            </div>
            <div className="text-white/70">
              © 2025 Lobby & Lounge. Perfect music for your business.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
