// src/pages/Landing.jsx
import React, { useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [message, setMessage] = useState("");

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `https://file-manager-frontend-swart.vercel.app/profile-setup`,
      },
    });
    if (error) setMessage(error.message);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="w-full bg-white shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">📂 File Manager</h1>
        <button
          onClick={() => setShowLogin(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center flex-grow px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
          Manage Your Files Effortlessly 🚀
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-6">
          A secure and easy-to-use file manager where you can upload, share, and
          organize your documents. Sign in to get started!
        </p>
        <button
          onClick={() => setShowLogin(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
        >
          Get Started
        </button>
      </section>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>
            <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 p-3 rounded-lg hover:bg-gray-100 transition"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Sign in with Google
            </button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <hr className="flex-grow border-gray-300" />
              <span className="px-2 text-gray-500">or</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            {/* Email Login */}
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
              >
                Continue with Email
              </button>
            </form>

            {message && (
              <p className="text-center text-sm text-red-500 mt-4">{message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
