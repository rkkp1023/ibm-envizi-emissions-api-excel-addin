/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { useEffect, useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { MainPage } from "./components/MainPage";
import { WelcomePage } from "./components/WelcomePage";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useAuth } from "./hooks/useAuth";
import { useStyles } from "./hooks/useStyles";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(() => {
    const hasSeenWelcome = localStorage.getItem("getStartedClicked") === "true";
    return !hasSeenWelcome;
  });

  useEffect(() => {
    if (isAuthenticated) {
      setShowWelcome(false);
    }
  }, [isAuthenticated]);

  const handleGetStarted = () => {
    localStorage.setItem("getStartedClicked", "true");
    setShowWelcome(false);
  };

  if (showWelcome) {
    return <WelcomePage onGetStarted={handleGetStarted} />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <MainPage />;
}

export default function TaskpaneApp() {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}
