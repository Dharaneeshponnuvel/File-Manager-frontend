import React, { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../../supabase/supabaseClient";

export default function FolderUpload() {
  const [files, setFiles] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const backendURL = process.env.REACT_APP_BACKEND_URL; // ✅ from .env

  // ✅ Get user from localStorage or Supabase session
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      supabase.auth.getUser().then(({ data, error }) => {
        if (!error && data.user) {
          const userData = {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || "No Name",
            email: data.user.email,
          };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        }
      });
    }
  }, []);

  const handleFolderSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    if (selectedFiles.length > 0) {
      const relativePath = selectedFiles[0].webkitRelativePath;
      const folder = relativePath.split("/")[0];
      setFolderName(folder);
    }
  };

  const handleUpload = async () => {
    if (!files.length) {
      alert("Please select a folder first");
      return;
    }
    if (!user?.id) {
      alert("No user logged in. Please login first.");
      return;
    }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("folderName", folderName);
    formData.append("userId", user.id); // ✅ use logged-in user's ID

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await axios.post(
        `${backendURL}/api/folder/upload-folder`, // ✅ dynamic URL
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
          },
        }
      );

      alert("Upload successful!");
      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return <div className="p-4">Loading user info...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Upload Folder to AWS S3 + Supabase</h2>
      <p>
        Logged in as: <strong>{user.name}</strong> ({user.email})
      </p>

      <input
        type="file"
        webkitdirectory="true"
        directory=""
        multiple
        onChange={handleFolderSelect}
      />

      {files.length > 0 && (
        <div>
          <p>📂 Folder: {folderName}</p>
          <p>📄 {files.length} files selected</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          background: uploading ? "#ccc" : "#4CAF50",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        {uploading ? `Uploading... ${progress}%` : "Upload Folder"}
      </button>
    </div>
  );
}
