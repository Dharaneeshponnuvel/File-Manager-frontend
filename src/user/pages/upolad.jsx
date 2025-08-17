import React, { useState } from "react";
import { supabase } from "../../supabase/supabaseClient"; // adjust path if needed


export default function UploadFile() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);

  // Handle file select
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setProgress(0);
  };
const backendURL = process.env.REACT_APP_BACKEND_URL; 

  // Get token helper
  const getToken = async () => {
    let token = localStorage.getItem("token");
    if (!token) {
      const session = await supabase.auth.getSession();
      token = session.data.session?.access_token;
      if (token) {
        localStorage.setItem("token", token);
      }
    }
    return token;
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file");
      return;
    }

    const token = await getToken();
    if (!token) {
      setMessage("⚠️ Not logged in");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
     xhr.open("POST",  `${backendURL}/api/upload`);

      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 201) {
          const data = JSON.parse(xhr.responseText);
          setMessage(`✅ File uploaded successfully: ${data.file_url}`);
        } else {
          setMessage(`❌ Upload failed: ${xhr.statusText}`);
        }
        setProgress(0);
      };

      xhr.onerror = () => {
        setMessage("❌ Network error during upload");
        setProgress(0);
      };

      xhr.send(formData);
    } catch (err) {
      console.error(err);
      setMessage(`❌ ${err.message}`);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Upload File</h2>

        <input
          type="file"
          onChange={handleFileChange}
          className="w-full border p-2 rounded"
        />

        {file && <p className="text-sm text-gray-600">Selected: {file.name}</p>}

        <button
          onClick={handleUpload}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Upload
        </button>

        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {message && (
          <p className="text-center text-sm mt-2 text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}
