// src/pages/Login.jsx
import React, { useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function Login() {
  const [message, setMessage] = useState("");

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/profile-setup`,
      },
    });
    if (error) setMessage(error.message);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Sign In</h2>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 p-2 rounded hover:bg-gray-100"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>

        {message && (
          <p className="text-center text-sm text-red-500">{message}</p>
        )}
      </div>
    </div>
  );
}
