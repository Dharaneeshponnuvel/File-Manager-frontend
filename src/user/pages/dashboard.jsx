import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const FILE_LIMIT_GB = 15;
const GB_IN_BYTES = 1024 * 1024 * 1024;
const COLORS = ["#6366f1", "#22c55e", "#facc15", "#ef4444", "#a855f7"];

function categorizeFile(fileName) {
  if (!fileName) return "Others";
  const ext = fileName.split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) return "Images";
  if (["zip", "rar", "7z"].includes(ext)) return "Zip";
  return "Others";
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usageData, setUsageData] = useState([]);

  // Load user
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

  // Fetch files and folders
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);

      // ✅ Files
      const { data: fileData } = await supabase
        .from("files")
        .select("id, file_name, size, created_at, file_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // ✅ Folders (just count)
      const { data: folderData } = await supabase
        .from("folder")
        .select("id")
        .eq("user_id", user.id);

      setFiles(fileData || []);
      setFolders(folderData || []);

      // ✅ Usage calculation
      let usage = { Images: 0, Zip: 0, Others: 0 };

      (fileData || []).forEach((file) => {
        const cat = categorizeFile(file.file_name);
        usage[cat] += file.size || 0;
      });

      const totalUsedBytes = usage.Images + usage.Zip + usage.Others;
      const remainingBytes = Math.max(0, FILE_LIMIT_GB * GB_IN_BYTES - totalUsedBytes);

      // ✅ Folders excluded from graph
      setUsageData([
        { name: "Images", value: usage.Images / GB_IN_BYTES },
        { name: "Zip", value: usage.Zip / GB_IN_BYTES },
        { name: "Others", value: usage.Others / GB_IN_BYTES },
        { name: "Remaining Space", value: remainingBytes / GB_IN_BYTES },
      ]);

      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (!user) return <div className="p-4 text-center text-lg">Loading user info...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">📂 File Manager</h1>
        <div className="text-sm text-gray-700">
          {user.name} <span className="text-gray-400">({user.email})</span>
        </div>
      </nav>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Welcome */}
        <h2 className="text-2xl font-semibold mb-6">Welcome back, {user.name} 👋</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500">Files</p>
            <h3 className="text-2xl font-bold">{files.length}</h3>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500">Folders</p>
            <h3 className="text-2xl font-bold">{folders.length}</h3>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500">Storage Used</p>
            <h3 className="text-2xl font-bold">
              {usageData
                .filter((d) => d.name !== "Remaining Space")
                .reduce((acc, d) => acc + d.value, 0)
                .toFixed(2)}{" "}
              GB
            </h3>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Storage Usage (15 GB limit)</h3>
          {loading ? (
            <p>Loading usage data...</p>
          ) : (
            <div className="flex justify-center">
              <PieChart width={500} height={350}>
                <Pie
                  data={usageData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(1)}%`
                  }
                >
                  {usageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => `${value.toFixed(2)} GB`} />
                <Legend />
              </PieChart>
            </div>
          )}
        </div>

        {/* 📋 File Details Table */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">File Details</h3>
          {loading ? (
            <p>Loading files...</p>
          ) : files.length === 0 ? (
            <p>No files uploaded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="p-3 text-left">S.No</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Upload Date</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, index) => (
                    <tr key={file.id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">{file.file_name}</td>
                      <td className="p-3">
                        {new Date(file.created_at).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          View / Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
