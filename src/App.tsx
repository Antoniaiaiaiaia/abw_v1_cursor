import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const location = useLocation();
  const isJobsPage = location.pathname === "/jobs";
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-white">
      <Header
        isLoggedIn={isLoggedIn}
        onLoginChange={setIsLoggedIn}
      />
      {isAdminPage ? (
        <Outlet />
      ) : (
        <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
          {isJobsPage && (
            <div className="flex">
              <Sidebar 
                selectedCategory={selectedCategory} 
                onCategoryChange={setSelectedCategory} 
              />
              <div className="flex-1 pl-8">
                <Outlet context={{ selectedCategory }} />
              </div>
            </div>
          )}
          {!isJobsPage && <Outlet />}
        </main>
      )}
      <Toaster />
    </div>
  );
}

