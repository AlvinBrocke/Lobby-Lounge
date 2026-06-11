"use client";

import React from "react";

export const AuthBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-gradient-to-br from-secondary-500 to-primary-900">
      {/* Premium animated gradients */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div
        className="absolute top-0 -right-4 w-72 h-72 bg-tunify-blue rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
        style={{ animationDelay: "4s" }}
      />

      {/* Large ambient glows for depth */}
      <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-primary-900/30 to-tunify-blue/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-tr from-secondary-900/30 to-tunify-dark-blue/20 rounded-full blur-[100px]" />

      {/* Noise Texture Overlay for that 'Premium' feel */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Typography Overlay */}
      <div className="absolute bottom-[5%] left-[5%] opacity-10 select-none">
        <h2 className="text-[12vw] font-display font-bold leading-none text-white whitespace-nowrap tracking-tighter">
          Sound Meets
        </h2>
      </div>
    </div>
  );
};
