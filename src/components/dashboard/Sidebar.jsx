import React from "react";

export default function Sidebar({ user }) {
  return (
    <div className="w-64 bg-surface border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
            <i className="fas fa-music text-white text-sm"></i>
          </div>
          <span className="text-xl font-bold text-white">Lobby & Lounge</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <a
            href="#"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium"
          >
            <i className="fas fa-headphones w-5"></i>
            <span>Channels</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <i className="fas fa-calendar w-5"></i>
            <span>Schedules</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <i className="fas fa-search w-5"></i>
            <span>Search</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <i className="fas fa-list w-5"></i>
            <span>My Playlists</span>
          </a>
          <a
            href="#"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <i className="fas fa-cog w-5"></i>
            <span>Settings</span>
          </a>
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
            <i className="fas fa-user text-white"></i>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">
              {user?.name || user?.email || "User"}
            </p>
            <p className="text-xs text-gray-400">Premium Trial</p>
          </div>
        </div>
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <i className="fas fa-question-circle"></i>
            <span>Help Center</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-envelope"></i>
            <span>support@lobbylounge.com</span>
          </div>
          <a
            href="/account/logout"
            className="flex items-center space-x-2 hover:text-gray-300 transition-colors"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Sign Out</span>
          </a>
        </div>
      </div>
    </div>
  );
}
