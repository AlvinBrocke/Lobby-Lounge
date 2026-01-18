"use client";
import React from "react";

function MainComponent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    country: "",
    businessType: "",
    subscriptionPlan: "",
    genres: [],
    mood: "",
    energyLevel: 50,
  });
  const [loading, setLoading] = useState(false);

  const totalSteps = 3;

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/create-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          email: formData.email,
          country: formData.country,
          businessType: formData.businessType,
          subscriptionPlan: formData.subscriptionPlan,
          genres: formData.genres,
          mood: formData.mood,
          energyLevel: formData.energyLevel,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Profile created successfully, redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        console.error("Profile creation failed:", result.error);
        alert("Failed to create profile: " + result.error);
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const businessTypes = [
    "Restaurant",
    "Cafe",
    "Retail Store",
    "Office",
    "Hotel",
    "Spa/Wellness",
    "Gym/Fitness",
    "Other",
  ];

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Other",
  ];

  const musicGenres = [
    "Jazz",
    "Classical",
    "Ambient",
    "Pop",
    "Rock",
    "Electronic",
    "Folk",
    "World Music",
    "Instrumental",
    "Acoustic",
  ];

  const moods = [
    "Relaxing",
    "Energetic",
    "Professional",
    "Cozy",
    "Upbeat",
    "Sophisticated",
  ];

  const toggleGenre = (genre) => {
    const currentGenres = formData.genres;
    if (currentGenres.includes(genre)) {
      updateFormData(
        "genres",
        currentGenres.filter((g) => g !== genre)
      );
    } else {
      updateFormData("genres", [...currentGenres, genre]);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.businessName &&
          formData.email &&
          formData.country &&
          formData.businessType
        );
      case 2:
        return formData.subscriptionPlan;
      case 3:
        return formData.genres.length > 0 && formData.mood;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-music text-white text-lg"></i>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Lobby & Lounge
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    step <= currentStep
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-all duration-300 ${
                      step < currentStep
                        ? "bg-gradient-to-r from-purple-600 to-blue-600"
                        : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentStep === 1 && "Business Details"}
                {currentStep === 2 && "Choose Your Plan"}
                {currentStep === 3 && "Music Preferences"}
              </h2>
              <p className="text-gray-600 mt-2">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Step 1: Business Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Tell us about your business
                </h3>
                <p className="text-gray-600 text-lg">
                  Help us customize the perfect music experience for your space
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={(e) =>
                      updateFormData("businessName", e.target.value)
                    }
                    placeholder="Enter your business name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Country *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={(e) => updateFormData("country", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select your country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Business Type *
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={(e) =>
                      updateFormData("businessType", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Subscription Plan */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Choose your plan
                </h3>
                <p className="text-gray-600 text-lg">
                  Start with our free trial or select a plan that fits your
                  needs
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Free Trial */}
                <div
                  onClick={() => updateFormData("subscriptionPlan", "trial")}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    formData.subscriptionPlan === "trial"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-gift text-white text-2xl"></i>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">
                      14-Day Free Trial
                    </h4>
                    <p className="text-4xl font-bold text-purple-600 mb-4">
                      $0
                    </p>
                    <ul className="text-left space-y-2 text-gray-600">
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        Full access to all playlists
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        Smart scheduling
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        No commitment
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Paid Plan */}
                <div
                  onClick={() => updateFormData("subscriptionPlan", "premium")}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 relative ${
                    formData.subscriptionPlan === "premium"
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-crown text-white text-2xl"></i>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">
                      Premium Plan
                    </h4>
                    <p className="text-4xl font-bold text-purple-600 mb-1">
                      $29
                    </p>
                    <p className="text-gray-500 mb-4">per month</p>
                    <ul className="text-left space-y-2 text-gray-600">
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        Everything in trial
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        Priority support
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        Advanced analytics
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Music Preferences */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Customize your music
                </h3>
                <p className="text-gray-600 text-lg">
                  Select your preferred genres, mood, and energy level
                </p>
              </div>

              {/* Genres */}
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-gray-900">
                  Preferred Genres *
                </h4>
                <p className="text-gray-600">Select all that apply</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {musicGenres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                        formData.genres.includes(genre)
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-purple-300 text-gray-700"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-gray-900">
                  Overall Mood *
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {moods.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => updateFormData("mood", mood)}
                      className={`px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.mood === mood
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-purple-300 text-gray-700"
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Level */}
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-gray-900">
                  Energy Level
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Calm</span>
                    <span>Energetic</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.energyLevel}
                    onChange={(e) =>
                      updateFormData("energyLevel", parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="text-center text-purple-600 font-semibold">
                    {formData.energyLevel}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentStep === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isStepValid()
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transform hover:scale-105"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Next Step
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid() || loading}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isStepValid() && !loading
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transform hover:scale-105"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Setting up...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <i className="fas fa-check ml-2"></i>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(to right, #9333ea, #3b82f6);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(to right, #9333ea, #3b82f6);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}

export default MainComponent;