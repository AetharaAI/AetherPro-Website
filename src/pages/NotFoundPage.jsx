import React from "react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-4 text-red-600">404</h1>
      <p className="text-lg text-gray-700">Page Not Found</p>
    </div>
  );
}