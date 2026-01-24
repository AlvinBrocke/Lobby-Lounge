"use client";
import React, { useState, useEffect } from "react";

// Mock user hook for development
const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setUser({
        name: "Alvin",
        email: "alvin@lobbylounge.com",
        plan: "premium_trial",
      });
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return { data: user, loading };
};

function MainComponent() {
  const { data: user, loading } = useUser();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/signin";
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Sample playlist data
  const playlist = {
    id: "morning-calm",
    name: "Morning Calm",
    description:
      "Start your day with peaceful, ambient sounds that create a serene atmosphere perfect for cafes, offices, and retail spaces during morning hours.",
    coverArt: "/api/placeholder/400/400",
    duration: "2h 15m",
    totalTracks: 32,
    category: "Ambient & Chill",
    createdBy: "Lobby & Lounge",
    lastUpdated: "2 days ago",
    plays: 1247,
    tags: ["Ambient", "Peaceful", "Morning", "Instrumental"],
    tracks: [
      {
        id: 1,
        title: "Gentle Dawn",
        artist: "Ambient Collective",
        album: "Morning Light",
        duration: "4:23",
        bpm: 72,
        key: "C Major",
        energy: 3,
        mood: "Peaceful",
        preview: "/api/preview/1",
      },
      {
        id: 2,
        title: "Soft Breeze",
        artist: "Nature Sounds",
        album: "Elements",
        duration: "3:45",
        bpm: 68,
        key: "G Major",
        energy: 2,
        mood: "Calm",
        preview: "/api/preview/2",
      },
      {
        id: 3,
        title: "Morning Mist",
        artist: "Ethereal Waves",
        album: "Atmospheric",
        duration: "5:12",
        bpm: 75,
        key: "F Major",
        energy: 3,
        mood: "Serene",
        preview: "/api/preview/3",
      },
      {
        id: 4,
        title: "Quiet Reflection",
        artist: "Meditation Masters",
        album: "Inner Peace",
        duration: "4:56",
        bpm: 65,
        key: "D Minor",
        energy: 2,
        mood: "Contemplative",
        preview: "/api/preview/4",
      },
      {
        id: 5,
        title: "Sunrise Harmony",
        artist: "Ambient Collective",
        album: "Morning Light",
        duration: "3:34",
        bpm: 70,
        key: "A Major",
        energy: 4,
        mood: "Uplifting",
        preview: "/api/preview/5",
      },
      {
        id: 6,
        title: "Peaceful Waters",
        artist: "Nature Sounds",
        album: "Elements",
        duration: "4:18",
        bpm: 62,
        key: "E Major",
        energy: 2,
        mood: "Tranquil",
        preview: "/api/preview/6",
      },
      {
        id: 7,
        title: "Floating Clouds",
        artist: "Sky Dreamers",
        album: "Above",
        duration: "5:45",
        bpm: 73,
        key: "B♭ Major",
        energy: 3,
        mood: "Dreamy",
        preview: "/api/preview/7",
      },
      {
        id: 8,
        title: "Gentle Rain",
        artist: "Weather Sounds",
        album: "Natural Ambience",
        duration: "6:12",
        bpm: 60,
        key: "C Minor",
        energy: 2,
        mood: "Soothing",
        preview: "/api/preview/8",
      },
    ],
  };

  const toggleFavorite = (trackId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(trackId)) {
      newFavorites.delete(trackId);
    } else {
      newFavorites.add(trackId);
    }
    setFavorites(newFavorites);
  };

  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getEnergyColor = (energy) => {
    if (energy <= 2) return "text-blue-600 bg-blue-100";
    if (energy <= 3) return "text-green-600 bg-green-100";
    return "text-orange-600 bg-orange-100";
  };

  const getEnergyLabel = (energy) => {
    if (energy <= 2) return "Low";
    if (energy <= 3) return "Medium";
    return "High";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-music text-white text-lg"></i>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Lobby & Lounge
              </h1>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    Premium Trial
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white"></i>
                </div>
                <a
                  href="/account/logout"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <a
            href="/dashboard"
            className="hover:text-purple-600 transition-colors"
          >
            Dashboard
          </a>
          <i className="fas fa-chevron-right text-xs"></i>
          <span className="text-gray-400">{playlist.category}</span>
          <i className="fas fa-chevron-right text-xs"></i>
          <span className="text-purple-600 font-medium">{playlist.name}</span>
        </nav>

        {/* Playlist Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cover Art */}
            <div className="flex-shrink-0">
              <div className="w-64 h-64 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                <i className="fas fa-music text-white text-6xl"></i>
              </div>
            </div>

            {/* Playlist Info */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-4">
                {playlist.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {playlist.name}
              </h2>

              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                {playlist.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {playlist.totalTracks}
                  </p>
                  <p className="text-sm text-gray-600">Tracks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {playlist.duration}
                  </p>
                  <p className="text-sm text-gray-600">Duration</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {playlist.plays}
                  </p>
                  <p className="text-sm text-gray-600">Plays</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {playlist.lastUpdated}
                  </p>
                  <p className="text-sm text-gray-600">Updated</p>
                </div>
              </div>

              {/* Play Controls */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlayPause}
                  className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <i
                    className={`fas fa-${
                      isPlaying ? "pause" : "play"
                    } text-xl ${!isPlaying ? "ml-1" : ""}`}
                  ></i>
                </button>
                <button className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                  <i className="fas fa-random"></i>
                </button>
                <button className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                  <i className="fas fa-redo"></i>
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <i className="fas fa-cog"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Playlist Settings
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="75"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crossfade
                </label>
                <input
                  type="range"
                  min="0"
                  max="12"
                  defaultValue="3"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-play
                </label>
                <div className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm text-gray-600">
                    Enable auto-play
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Track Listing */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">Track Listing</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {playlist.tracks.map((track, index) => (
              <div
                key={track.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  currentTrack?.id === track.id ? "bg-purple-50" : ""
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Track Number / Play Button */}
                  <div className="w-12 flex-shrink-0">
                    {currentTrack?.id === track.id && isPlaying ? (
                      <button
                        onClick={togglePlayPause}
                        className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors"
                      >
                        <i className="fas fa-pause"></i>
                      </button>
                    ) : (
                      <button
                        onClick={() => playTrack(track)}
                        className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-purple-600 hover:text-white transition-all group"
                      >
                        <span className="group-hover:hidden text-sm font-medium">
                          {index + 1}
                        </span>
                        <i className="fas fa-play hidden group-hover:block ml-0.5"></i>
                      </button>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                          {track.title}
                        </h4>
                        <p className="text-gray-600 truncate">
                          {track.artist} • {track.album}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                        {/* Track Metadata */}
                        <div className="hidden lg:flex items-center space-x-3 text-sm text-gray-500">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getEnergyColor(
                              track.energy,
                            )}`}
                          >
                            {getEnergyLabel(track.energy)}
                          </span>
                          <span>{track.bpm} BPM</span>
                          <span>{track.key}</span>
                          <span className="text-purple-600 font-medium">
                            {track.mood}
                          </span>
                        </div>

                        {/* Duration */}
                        <span className="text-gray-500 font-medium">
                          {track.duration}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleFavorite(track.id)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              favorites.has(track.id)
                                ? "text-red-600 hover:text-red-700"
                                : "text-gray-400 hover:text-red-600"
                            }`}
                          >
                            <i
                              className={`fas fa-heart ${
                                favorites.has(track.id) ? "" : "far"
                              }`}
                            ></i>
                          </button>
                          <button
                            onClick={() =>
                              setSelectedTrack(
                                selectedTrack === track.id ? null : track.id,
                              )
                            }
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <i className="fas fa-ellipsis-h"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Track Details */}
                    {selectedTrack === track.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">
                              BPM:
                            </span>
                            <span className="ml-2 text-gray-600">
                              {track.bpm}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Key:
                            </span>
                            <span className="ml-2 text-gray-600">
                              {track.key}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Energy:
                            </span>
                            <span
                              className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getEnergyColor(
                                track.energy,
                              )}`}
                            >
                              {getEnergyLabel(track.energy)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Mood:
                            </span>
                            <span className="ml-2 text-purple-600 font-medium">
                              {track.mood}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-4">
                          <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                            <i className="fas fa-play mr-1"></i>
                            Preview
                          </button>
                          <button className="text-gray-600 hover:text-gray-700 font-medium text-sm">
                            <i className="fas fa-user mr-1"></i>
                            Artist Info
                          </button>
                          <button className="text-gray-600 hover:text-gray-700 font-medium text-sm">
                            <i className="fas fa-plus mr-1"></i>
                            Add to Queue
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Playing Track */}
        {currentTrack && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-music text-white"></i>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {currentTrack.title}
                  </p>
                  <p className="text-sm text-gray-600">{currentTrack.artist}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors">
                  <i className="fas fa-step-backward"></i>
                </button>
                <button
                  onClick={togglePlayPause}
                  className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors"
                >
                  <i
                    className={`fas fa-${isPlaying ? "pause" : "play"} ${
                      !isPlaying ? "ml-0.5" : ""
                    }`}
                  ></i>
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors">
                  <i className="fas fa-step-forward"></i>
                </button>
              </div>

              <div className="hidden md:flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {currentTrack.duration}
                </span>
                <button
                  onClick={() => toggleFavorite(currentTrack.id)}
                  className={`transition-colors ${
                    favorites.has(currentTrack.id)
                      ? "text-red-600 hover:text-red-700"
                      : "text-gray-400 hover:text-red-600"
                  }`}
                >
                  <i
                    className={`fas fa-heart ${
                      favorites.has(currentTrack.id) ? "" : "far"
                    }`}
                  ></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainComponent;
