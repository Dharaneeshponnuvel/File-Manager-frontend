import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/supabaseClient";
import LoadingScreen from "./LoadingScreen";

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

      await supabase.from("users").upsert([
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || "",
          avatar_url: user.user_metadata?.avatar_url || "",
        },
      ]);

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        localStorage.setItem("token", sessionData.session.access_token);
      }

      navigate("/dashboard");
    };

    setupProfile();
  }, [navigate]);

  return <LoadingScreen message="Setting up your profile..." />;
}
