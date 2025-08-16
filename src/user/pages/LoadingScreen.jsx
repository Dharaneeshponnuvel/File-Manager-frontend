// src/components/LoadingScreen.jsx
export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* Spinner */}
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      
      {/* Message */}
      <p className="mt-4 text-gray-700 text-lg font-medium">{message}</p>
    </div>
  );
}
