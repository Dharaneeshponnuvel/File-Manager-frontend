import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

useEffect(() => {
  const getUserAndSync = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { id, email, user_metadata } = user;
      await supabase.from("users").upsert({
        id,
        email,
        full_name: user_metadata.full_name,
        
      });
    }
  };

  getUserAndSync();
}, []);
