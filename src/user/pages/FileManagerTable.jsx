import React, { useEffect, useState } from "react";
import axios from "axios";

export default function FileManagerTable() {
  const [items, setItems] = useState([]);
  const [expandedFolder, setExpandedFolder] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editType, setEditType] = useState("");
  const [newName, setNewName] = useState("");

  const backendURL = process.env.REACT_APP_BACKEND_URL; // ✅ from .env
  const API_EDIT = `${backendURL}/api/edit`;
  const API_SHARE = `${backendURL}/api/share`;

  // Fetch folders + files
  const fetchItems = async () => {
    try {
      const [folderRes, fileRes] = await Promise.all([
        axios.get(`${API_EDIT}/folders`),
        axios.get(`${API_EDIT}/files`),
      ]);

      const folders = folderRes.data.map((folder) => ({
        ...folder,
        type: "folder",
        files: fileRes.data.filter((file) => file.folder_id === folder.id),
      }));

      const looseFiles = fileRes.data
        .filter((file) => !file.folder_id)
        .map((file) => ({ ...file, type: "files" }));

      setItems([...folders, ...looseFiles]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const toggleFolder = (folderId) => {
    setExpandedFolder(expandedFolder === folderId ? null : folderId);
  };

  const handleEditClick = (id, type, currentName) => {
    setEditId(id);
    setEditType(type);
    setNewName(currentName);
  };

  const handleSaveEdit = async () => {
    if (!newName.trim()) return;
    try {
      await axios.put(`${API_EDIT}/${editType}/${editId}`, { new_name: newName });
      setEditId(null);
      setNewName("");
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm("Move to trash?")) return;
    try {
      await axios.delete(`${API_EDIT}/${type}/${id}`);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async (fileId) => {
    try {
      const shared_with_email = prompt("Enter the email to share with:");
      if (!shared_with_email) return;

      const role = prompt("Enter role (viewer, editor, owner):", "viewer");
      if (!role || !["viewer", "editor", "owner"].includes(role)) {
        alert("Invalid role!");
        return;
      }

      await axios.post(API_SHARE, { file_id: fileId, shared_with_email, role });

      const res = await axios.get(`${API_SHARE}/${fileId}/signed-url`);
      navigator.clipboard.writeText(res.data.signedUrl);
      alert("Share link copied to clipboard!");
    } catch (err) {
      console.error(err);
      alert("Error sharing file.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📂 File Manager</h2>
      <table border="1" cellPadding="10" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>URL</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) =>
            item.type === "folder" ? (
              <React.Fragment key={`folder-${item.id}`}>
                <tr
                  style={{ background: "#f0f0f0", cursor: "pointer" }}
                  onClick={() => toggleFolder(item.id)}
                >
                  <td>
                    {editId === item.id && editType === "folder" ? (
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <strong>📁 {item.folder_name}</strong>
                    )}
                  </td>
                  <td>Folder</td>
                  <td>{item.folder_url || "-"}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {editId === item.id && editType === "folder" ? (
                      <button onClick={handleSaveEdit}>💾 Save</button>
                    ) : (
                      <button
                        onClick={() =>
                          handleEditClick(item.id, "folder", item.folder_name)
                        }
                      >
                        ✏ Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id, "folder")}
                      style={{ marginLeft: "5px" }}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>

                {expandedFolder === item.id &&
                  item.files.map((file) => (
                    <tr key={`file-${file.id}`}>
                      <td style={{ paddingLeft: "40px" }}>
                        {editId === file.id && editType === "files" ? (
                          <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                          />
                        ) : (
                          <>📄 {file.file_name}</>
                        )}
                      </td>
                      <td>File</td>
                      <td>{file.file_url}</td>
                      <td>
                        {editId === file.id && editType === "files" ? (
                          <button onClick={handleSaveEdit}>💾 Save</button>
                        ) : (
                          <button
                            onClick={() =>
                              handleEditClick(file.id, "files", file.file_name)
                            }
                          >
                            ✏ Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(file.id, "files")}
                          style={{ marginLeft: "5px" }}
                        >
                          🗑 Delete
                        </button>
                        <button
                          onClick={() => handleShare(file.id)}
                          style={{ marginLeft: "5px" }}
                        >
                          🔗 Share
                        </button>
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            ) : (
              <tr key={`file-${item.id}`}>
                <td>
                  {editId === item.id && editType === "files" ? (
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  ) : (
                    <>📄 {item.file_name}</>
                  )}
                </td>
                <td>File</td>
                <td>{item.file_url}</td>
                <td>
                  {editId === item.id && editType === "files" ? (
                    <button onClick={handleSaveEdit}>💾 Save</button>
                  ) : (
                    <button
                      onClick={() =>
                        handleEditClick(item.id, "files", item.file_name)
                      }
                    >
                      ✏ Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id, "files")}
                    style={{ marginLeft: "5px" }}
                  >
                    🗑 Delete
                  </button>
                  <button
                    onClick={() => handleShare(item.id)}
                    style={{ marginLeft: "5px" }}
                  >
                    🔗 Share
                  </button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
