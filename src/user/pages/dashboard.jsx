import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const FILE_LIMIT_GB = 15;
const GB_IN_BYTES = 1024 * 1024 * 1024;
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#d0ed57", "#a4de6c"];

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
  const [allUploads, setAllUploads] = useState([]);
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

      const { data: fileData, error: fileError } = await supabase
        .from("files")
        .select("id, file_name, file_url, created_at, size")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const { data: folderData, error: folderError } = await supabase
        .from("folder")
        .select("id, folder_name, file_name, file_url, created_at, size")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fileError) console.error("Error fetching files:", fileError);
      if (folderError) console.error("Error fetching folders:", folderError);

      setFiles(fileData || []);
      setFolders(folderData || []);

      // Merge for combined display
      const combined = [
        ...(fileData || []).map((f) => ({
          id: f.id,
          type: "file",
          displayName: f.file_name,
          date: f.created_at,
          url: f.file_url,
        })),
        ...(folderData || []).map((f) => ({
          id: f.id,
          type: "folder",
          displayName: `${f.folder_name} / ${f.file_name}`,
          date: f.created_at,
          url: f.file_url,
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      setAllUploads(combined);

      // Calculate usage
      let usage = { Images: 0, Zip: 0, Others: 0, Folders: 0 };
      (fileData || []).forEach((file) => {
        const cat = categorizeFile(file.file_name);
        usage[cat] += file.size || 0;
      });
      (folderData || []).forEach((folderFile) => {
        usage.Folders += folderFile.size || 0;
      });

      const totalUsedBytes = usage.Images + usage.Zip + usage.Others + usage.Folders;
      const remainingBytes = Math.max(0, FILE_LIMIT_GB * GB_IN_BYTES - totalUsedBytes);

      setUsageData([
        { name: "Images", value: usage.Images / GB_IN_BYTES },
        { name: "Zip", value: usage.Zip / GB_IN_BYTES },
        { name: "Others", value: usage.Others / GB_IN_BYTES },
        { name: "Folders", value: usage.Folders / GB_IN_BYTES },
        { name: "Remaining Space", value: remainingBytes / GB_IN_BYTES },
      ]);

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (!user) return <div className="p-4">Loading user info...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-6xl">
        <h1 className="text-2xl font-bold mb-4">Welcome to Dashboard</h1>
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>

        {/* Storage Pie Chart */}
        <div className="my-6">
          <h2 className="text-xl font-semibold mb-4">Storage Usage (15 GB limit)</h2>
          {loading ? (
            <p>Loading usage data...</p>
          ) : usageData.length === 0 ? (
            <p>No usage data available.</p>
          ) : (
            <PieChart width={500} height={350}>
              <Pie
                data={usageData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {usageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(2)} GB`} />
              <Legend />
            </PieChart>
          )}
        </div>

        {/* Combined Uploads Table */}
        <hr className="my-6" />
        <h2 className="text-xl font-semibold mb-4">All Uploads</h2>
        {loading && <p>Loading uploads...</p>}
        {!loading && allUploads.length === 0 && <p>No uploads yet.</p>}
        {!loading && allUploads.length > 0 && (
          <table className="min-w-full border border-gray-300 mb-6">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3 border border-gray-300">Type</th>
                <th className="p-3 border border-gray-300">Name</th>
                <th className="p-3 border border-gray-300">Upload Date</th>
                <th className="p-3 border border-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {allUploads.map((item) => (
                <tr key={item.id} className="hover:bg-gray-100">
                  <td className="p-3 border border-gray-300 capitalize">{item.type}</td>
                  <td className="p-3 border border-gray-300">{item.displayName}</td>
                  <td className="p-3 border border-gray-300">{new Date(item.date).toLocaleString()}</td>
                  <td className="p-3 border border-gray-300">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View / Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
