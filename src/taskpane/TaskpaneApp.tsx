/*
 * Copyright IBM Corp. 2026
 * Licensed Materials - Property of IBM
 */

import { FluentProvider } from "@fluentui/react-components";
import { useEffect, useState } from "react";

import { LoginPage } from "./components/LoginPage";
import { MainPage } from "./components/MainPage";
import { WelcomePage } from "./components/WelcomePage";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useAuth, useTheme } from "./hooks";

function AppContent() {
  const { enableEnviziLogin, isAuthenticated, displayLogin } = useAuth();
  const [showWelcome, setShowWelcome] = useState(() => {
    const hasSeenWelcome = localStorage.getItem("getStartedClicked") === "true";
    return !hasSeenWelcome;
  });

  useEffect(() => {
    if (isAuthenticated) {
      setShowWelcome(false);
    }
  }, [isAuthenticated]);

  if (showWelcome) {
    const handleGetStarted = () => {
      // Check if Envizi login is enabled
      if (enableEnviziLogin) {
        displayLogin();
      } else {
        localStorage.setItem("getStartedClicked", "true");
        setShowWelcome(false);
      }
    };

    return <WelcomePage onGetStarted={handleGetStarted} />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <MainPage />;
}

function AppWithTheme() {
  const { theme } = useTheme();

  return (
    <FluentProvider theme={theme}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </FluentProvider>
  );
}

export function TaskpaneApp() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}
