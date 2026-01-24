"use client";
import React, { useState } from "react";
import {
  Music,
  Guitar,
  Star,
  Mic2, // Hip-Hop/Singing
  Zap, // Electrical/Electronic
  Heart, // R&B/Romantic
  Disc, // Indie/Record
  Leaf, // Folk/Nature
  CloudSun, // Reggae/Chill (using sun/cloud as proxy or similar)
  // For specialized icons we might need generic fallbacks or specific lucide matches:
  Piano, // Classical? No Piano in standard set? Use Music or similar
  Speaker,
  Settings,
  Coffee, // Relaxed
  Target, // Focused
  Play,
  Check,
} from "lucide-react";
// Using standard icons for best match
import {
  PiGuitarFill,
  PiMicrophoneStageFill,
  PiPianoKeysFill,
  PiSaxophoneFill,
} from "lucide-react"; // Wait, standard lucide doesn't have Pi/Fill prefixes usually.
// Let's stick to standard Lucide icons that are definitely available.
// Rock: Guitar
// Pop: Star
// Jazz: Ticket? Wind? Let's use simple Music or Wind if available.
// Classical: Music
// Hip-Hop: Mic2
// Electronic: Zap
// Country: Sunset? (No CowboyHat). Maybe MapPin? Let's use Guitar or Music.
// R&B: Heart
// Indie: Disc
// Folk: Leaf
// Reggae: Music (or something rhythmical)
// Blues: Guitar

// Step 2 Moods:
// Energetic: Zap
// Relaxed: Coffee (Sofa not in lucide?) -> Use Coffee or Sunset
// Romantic: Heart
// Focused: Target

const GUEST_MODE_GRADIENT =
  "bg-gradient-to-br from-secondary-500 to-primary-900"; // Teal (Secondary) to Deep Indigo (Primary)

function MainComponent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedMood, setSelectedMood] = useState("");
  const [preferences, setPreferences] = useState({
    tempo: "Medium",
    volume: "Medium",
    allowExplicit: false,
    timeBased: true,
  });

  const totalSteps = 3;

  const genres = [
    { id: "rock", name: "Rock", icon: Guitar },
    { id: "pop", name: "Pop", icon: Star },
    { id: "jazz", name: "Jazz", icon: Music }, // Fallback
    { id: "classical", name: "Classical", icon: Music },
    { id: "hiphop", name: "Hip-Hop", icon: Mic2 },
    { id: "electronic", name: "Electronic", icon: Zap },
    { id: "country", name: "Country", icon: Music },
    { id: "rnb", name: "R&B", icon: Heart },
    { id: "indie", name: "Indie", icon: Disc },
    { id: "folk", name: "Folk", icon: Leaf },
    { id: "reggae", name: "Reggae", icon: Music },
    { id: "blues", name: "Blues", icon: Guitar },
  ];

  const moods = [
    { id: "energetic", name: "Energetic", icon: Zap },
    { id: "relaxed", name: "Relaxed", icon: Coffee }, // Sofa proxy
    { id: "romantic", name: "Romantic", icon: Heart },
    { id: "focused", name: "Focused", icon: Target },
  ];

  const toggleGenre = (id) => {
    if (selectedGenres.includes(id)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== id));
    } else {
      setSelectedGenres([...selectedGenres, id]);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    // Navigate to dashboard
    window.location.href = "/dashboard";
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden font-sans text-white ${GUEST_MODE_GRADIENT} selection:bg-teal-400 selection:text-blue-900`}
    >
      {/* Background Floating Music Notes (Decorations) */}
      <Music className="absolute top-10 left-10 w-12 h-12 text-white/5 animate-pulse" />
      <Music
        className="absolute bottom-20 right-20 w-16 h-16 text-white/5 animate-bounce"
        style={{ animationDuration: "3s" }}
      />
      <Disc
        className="absolute top-1/3 right-10 w-8 h-8 text-white/5 animate-spin"
        style={{ animationDuration: "10s" }}
      />
      <Music className="absolute bottom-10 left-1/4 w-10 h-10 text-white/5 animate-pulse" />

      {/* Header Badge */}
      <div className="absolute top-6 left-6">
        <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white border border-white/10">
          Guest Mode
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col min-h-screen">
        {/* Stepper */}
        <div className="flex justify-center items-center mb-16">
          {[1, 2, 3].map((step, idx) => (
            <React.Fragment key={step}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  step === currentStep
                    ? "bg-white text-blue-900 shadow-lg scale-110"
                    : step < currentStep
                      ? "bg-teal-400 text-blue-900"
                      : "bg-white/10 text-white/50 border border-white/10"
                }`}
              >
                {step}
              </div>
              {idx < 2 && (
                <div
                  className={`w-16 h-0.5 mx-2 rounded-full transition-all duration-300 ${
                    step < currentStep ? "bg-teal-400" : "bg-white/10"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Step 1: Genres */}
          {currentStep === 1 && (
            <>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-sm">
                Choose Your Genres
              </h1>
              <p className="text-lg text-white/80 mb-12">
                Select the music genres that match your venue's atmosphere
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 aspect-[4/3] ${
                      selectedGenres.includes(genre.id)
                        ? "bg-white/20 border-white shadow-xl shadow-black/5" // Selected: Glassy white fill
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30"
                    }`}
                  >
                    <genre.icon
                      className={`w-8 h-8 mb-3 transition-transform duration-300 group-hover:scale-110 ${
                        selectedGenres.includes(genre.id)
                          ? "text-white"
                          : "text-white"
                      }`}
                    />
                    <span className="font-semibold">{genre.name}</span>

                    {/* Checkmark badge if selected (Optional, but good for UX) */}
                    {/* Screenshot doesn't show checkmark overlay, just border style, so relying on border. */}
                  </button>
                ))}
              </div>

              <div className="mt-8 text-white/60 text-sm font-medium">
                {selectedGenres.length} genres selected
              </div>
            </>
          )}

          {/* Step 2: Mood */}
          {currentStep === 2 && (
            <>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-sm">
                Set the Mood
              </h1>
              <p className="text-lg text-white/80 mb-12">
                Choose the overall mood for your music
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`group flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all duration-200 aspect-square ${
                      selectedMood === mood.id
                        ? "bg-white/20 border-white shadow-xl shadow-black/5"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30"
                    }`}
                  >
                    <mood.icon className="w-10 h-10 mb-4" />
                    <span className="text-lg font-semibold">{mood.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 3: Final Preferences */}
          {currentStep === 3 && (
            <>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-sm">
                Final Preferences
              </h1>
              <p className="text-lg text-white/80 mb-12">
                Customize your music playback settings
              </p>

              <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl">
                {/* Tempo */}
                <div className="mb-8 text-left">
                  <label className="block text-white/90 font-semibold mb-3">
                    Tempo
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-black/20 p-1 rounded-xl">
                    {["Slow", "Medium", "Fast"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          setPreferences({ ...preferences, tempo: opt })
                        }
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          preferences.tempo === opt
                            ? "bg-white text-blue-900 shadow-sm"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volume */}
                <div className="mb-8 text-left">
                  <label className="block text-white/90 font-semibold mb-3">
                    Volume
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-black/20 p-1 rounded-xl">
                    {["Low", "Medium", "High"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          setPreferences({ ...preferences, volume: opt })
                        }
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          preferences.volume === opt
                            ? "bg-white text-blue-900 shadow-sm"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 font-semibold">
                      Allow Explicit Content
                    </span>
                    <button
                      onClick={() =>
                        setPreferences((p) => ({
                          ...p,
                          allowExplicit: !p.allowExplicit,
                        }))
                      }
                      className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative ${
                        preferences.allowExplicit
                          ? "bg-teal-400"
                          : "bg-black/30"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                          preferences.allowExplicit
                            ? "translate-x-6"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white/90 font-semibold">
                      Time-based Settings
                    </span>
                    <button
                      onClick={() =>
                        setPreferences((p) => ({
                          ...p,
                          timeBased: !p.timeBased,
                        }))
                      }
                      className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative ${
                        preferences.timeBased ? "bg-teal-400" : "bg-black/30"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                          preferences.timeBased
                            ? "translate-x-6"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="w-full flex justify-between items-center mt-auto pt-8">
          <button
            onClick={prevStep}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 border border-white/20 hover:bg-white/10 ${
              currentStep === 1
                ? "opacity-0 pointer-events-none"
                : "opacity-100"
            }`}
          >
            Back
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              className="bg-white text-blue-900 px-8 py-2.5 rounded-lg font-bold shadow-lg shadow-black/10 hover:bg-gray-100 hover:scale-105 transition-all"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-white text-blue-900 px-8 py-2.5 rounded-lg font-bold shadow-lg shadow-black/10 hover:bg-gray-100 hover:scale-105 transition-all"
            >
              Start Exploring
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
