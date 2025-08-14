import React from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Signup from "./user/Signup";
import Login from "./user/login";
import ProfileSetup from "./user/pages/ProfileSetup";
import Dashboard from "./user/pages/dashboard";
import UploadFile from "./user/pages/upolad";
import FolderUpload from "./user/pages/folderupolad";
import FileManagerTable from "./user/pages/FileManagerTable";
function App() {
  return (
    <BrowserRouter>
      
      <Routes>
        {/* Redirect root path to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadFile />} />
        <Route path="/folder-upload" element={<FolderUpload />} />
        <Route path="/file-manager" element={<FileManagerTable />} />
        
        {/* Catch-all route for 404 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
