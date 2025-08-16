// src/user/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase/supabaseClient";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [usage, setUsage] = useState({ Images: 0, Zip: 0, Others: 0, Folders: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    // ✅ Fetch files
    const { data: fileData, error: fileError } = await supabase
      .from("files")
      .select("id, file_name, file_url, created_at, size, file_type")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fileError) console.error(fileError);
    setFiles(fileData || []);

    // ✅ Fetch folders
    const { data: folderData, error: folderError } = await supabase
      .from("folder")
      .select("id, folder_name, folder_url, uploaded_at")
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false });

    if (folderError) console.error(folderError);
    setFolders(folderData || []);

    // ✅ Merge uploads (files + folders)
    const merged = [
      ...(fileData || []).map((f) => ({
        id: f.id,
        type: "file",
        displayName: f.file_name,
        date: f.created_at,
        size: f.size,
        fileType: f.file_type,
        url: f.file_url,
      })),
      ...(folderData || []).map((f) => ({
        id: f.id,
        type: "folder",
        displayName: f.folder_name,
        date: f.uploaded_at,
        url: f.folder_url,
      })),
    ];
    setUploads(merged);

    // ✅ Calculate usage
    let usageStats = { Images: 0, Zip: 0, Others: 0, Folders: folderData?.length || 0 };

    (fileData || []).forEach((file) => {
      if (file.file_type?.includes("image")) usageStats.Images += file.size;
      else if (file.file_type?.includes("zip")) usageStats.Zip += file.size;
      else usageStats.Others += file.size;
    });

    setUsage(usageStats);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-500">Images</p>
          <h3 className="text-2xl font-bold">{(usage.Images / 1024 / 1024).toFixed(2)} MB</h3>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-500">Zip Files</p>
          <h3 className="text-2xl font-bold">{(usage.Zip / 1024 / 1024).toFixed(2)} MB</h3>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-500">Others</p>
          <h3 className="text-2xl font-bold">{(usage.Others / 1024 / 1024).toFixed(2)} MB</h3>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-500">Folders</p>
          <h3 className="text-2xl font-bold">{usage.Folders}</h3>
        </div>
      </div>

      {/* Recent Uploads */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Uploads</h2>
        <ul className="divide-y divide-gray-200">
          {uploads.map((item) => (
            <li key={item.id} className="py-3 flex justify-between items-center">
              <span>
                {item.type === "folder" ? "📁" : "📄"} {item.displayName}
              </span>
              <span className="text-sm text-gray-500">{new Date(item.date).toLocaleString()}</span>
            </li>
          ))}
        </ul>
        {uploads.length === 0 && <p className="text-gray-400 text-center">No uploads yet.</p>}
      </div>
    </div>
  );
}
