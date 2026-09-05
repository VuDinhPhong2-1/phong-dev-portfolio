import { useEffect, useState } from "react";
import "./App.css";

import Header from "./components/Header";
import Home from "./components/Home";
import About from "./components/About";
import Education from "./components/Education";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contacts from "./components/Contacts";
import Experience from "./components/Experience";
import AdminAnalytics from "./components/AdminAnalytics";
import AnonymousVisitorPrompt from "./components/AnonymousVisitorPrompt";
import LegalPage from "./components/LegalPage";
import LocationPermissionModal from "./components/LocationPermissionModal";

import { LanguageProvider } from "./context/LanguageContext";
import { usePortfolioAnalytics } from "./hooks/usePortfolioAnalytics";
import { setCachedLocationContext } from "./services/analyticsTracker";

/**
 * Nội dung website chính.
 *
 * Analytics chỉ bắt đầu sau khi người dùng
 * đã xử lý popup xin vị trí.
 */
function PortfolioContent({ location }) {
  usePortfolioAnalytics(location);

  return (
    <main>
      <Header />
      <Home />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Education />
      <Contacts />
      <AnonymousVisitorPrompt />
    </main>
  );
}

/**
 * Website portfolio.
 */
function PortfolioApp() {
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [location, setLocation] = useState(null);

  const handleLocationSuccess = (locationData) => {
    // Không cho phép null đi qua
    if (
      !locationData ||
      typeof locationData.latitude !== "number" ||
      typeof locationData.longitude !== "number" ||
      !locationData.address
    ) {
      console.error("❌ Location data không hợp lệ:", locationData);
      return;
    }

    setLocation(locationData);

    setCachedLocationContext(locationData);

    // Chỉ mở website khi đã có location hợp lệ
    setLocationConfirmed(true);
  };

  // CHƯA CÓ LOCATION → KHÔNG ĐƯỢC VÀO WEBSITE
  if (!locationConfirmed || !location) {
    return (
      <LocationPermissionModal
        onSuccess={handleLocationSuccess}
      />
    );
  }

  return <PortfolioContent location={location} />;
}

/**
 * App root.
 */
function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const isAdminRoute = hash.startsWith("#/admin-analytics");
  const isPrivacyRoute = hash.startsWith("#/privacy");
  const isDataDeletionRoute = hash.startsWith("#/data-deletion");

  if (isPrivacyRoute) {
    return <LegalPage page="privacy" />;
  }

  if (isDataDeletionRoute) {
    return <LegalPage page="data-deletion" />;
  }

  return (
    <LanguageProvider>
      {isAdminRoute ? (
        <AdminAnalytics />
      ) : (
        <PortfolioApp />
      )}
    </LanguageProvider>
  );
}

export default App;