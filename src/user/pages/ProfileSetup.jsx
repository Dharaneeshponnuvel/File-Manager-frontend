// src/pages/ProfileSetup.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";

export default function ProfileSetup() {
  const navigate = useNavigate();

  useEffect(() => {
    const setupProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(userError || "No user");
        navigate("/login");
        return;
      }

      // ✅ Always upsert user
      const { error: dbError } = await supabase.from("users").upsert([
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || "",
          avatar_url: user.user_metadata?.avatar_url || "",
        },
      ]);

      if (dbError) {
        console.error("DB insert/upsert error:", dbError);
      }

      // ✅ Get and store token for backend
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        localStorage.setItem("token", sessionData.session.access_token);
      }

      navigate("/dashboard");
    };

    setupProfile();
  }, [navigate]);

  return <p>Setting up your profile...</p>;
}
