// Copyright IBM Corp. 2026

import { FluentProvider } from "@fluentui/react-components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { LoginPage } from "./components/LoginPage/LoginPage";
import { MainPage } from "./components/MainPage/MainPage";
import { WelcomePage } from "./components/WelcomePage/WelcomePage";
import { ActivityRecommenderProvider } from "./context/ActivityRecommenderContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useAuth, useTheme } from "./hooks";

// Create a QueryClient instance
const queryClient = new QueryClient({});

const getStartedClicked = "getStartedClicked";

function AppContent() {
  const { state, displayLogin } = useAuth();
  const [showWelcome, setShowWelcome] = useState(() => {
    const hasSeenWelcome = localStorage.getItem(getStartedClicked) === "true";
    return !hasSeenWelcome;
  });

  useEffect(() => {
    if (state.isAuthenticated) {
      // User is authenticated, hide welcome and mark as seen
      localStorage.setItem(getStartedClicked, "true");
      setShowWelcome(false);
    }
  }, [state.isAuthenticated]);

  if (!state.isInitialized) {
    return null;
  }

  if (showWelcome) {
    const handleGetStarted = () => {
      displayLogin();
    };

    return <WelcomePage onGetStarted={handleGetStarted} />;
  }

  if (!state.isAuthenticated) {
    return <LoginPage />;
  }

  return <MainPage />;
}

function AppWithTheme() {
  const { theme } = useTheme();

  return (
    <FluentProvider theme={theme} className="fluent-provider">
      <AuthProvider>
        <ActivityRecommenderProvider>
          <AppContent />
        </ActivityRecommenderProvider>
      </AuthProvider>
    </FluentProvider>
  );
}

export function TaskpaneApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppWithTheme />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
