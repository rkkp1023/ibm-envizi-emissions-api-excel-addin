/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { useEffect, useState } from "react";
import LoginPage from "./components/LoginPage";
import MainPage from "./components/MainPage";
import WelcomePage from "./components/WelcomePage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("getStartedClicked") === "true";
    setShowWelcome(!hasSeenWelcome && !isAuthenticated);
  }, [isAuthenticated]);

  const handleGetStarted = () => {
    localStorage.setItem("getStartedClicked", "true");
    setShowWelcome(false);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  if (showWelcome) {
    return <WelcomePage onGetStarted={handleGetStarted} />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <MainPage />;
}

export default function TaskpaneApp() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
