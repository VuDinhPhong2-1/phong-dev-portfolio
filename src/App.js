import { useEffect, useState } from "react";
import "./App.css";
import "./magic.css";
import "./ngl.css";
import "./portfolio.css";

import Header from "./components/Header";
import Home from "./components/HomeOptimized";
import About from "./components/About";
import Education from "./components/Education";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contacts from "./components/Contacts";
import Experience from "./components/Experience";
import AdminAnalytics from "./components/AdminAnalytics";
import AnonymousVisitorPrompt from "./components/AnonymousVisitorPrompt";
import LegalPage from "./components/LegalPage";
import NglStandalonePage from "./components/NglStandalonePage";
import FloatingNglBubble from "./components/FloatingNglBubble";

import { LanguageProvider } from "./context/LanguageContext";
import { usePortfolioAnalytics } from "./hooks/usePortfolioAnalytics";

/**
 * Nội dung website chính.
 *
 * Analytics chỉ bắt đầu sau khi người dùng
 * đã xử lý popup xin vị trí.
 */
function PortfolioContent() {
  usePortfolioAnalytics();

  return (
    <main className="portfolio-shell">
      <Header />
      <Home />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Education />
      <Contacts />
      <AnonymousVisitorPrompt />
      <FloatingNglBubble />
    </main>
  );
}

/**
 * Website portfolio.
 */
function PortfolioApp() {
  return <PortfolioContent />;
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

  const isAdminRoute =
    hash.startsWith("#/admin-analytics") ||
    hash === "#/admin" ||
    hash.startsWith("#/admin/");
  const isPrivacyRoute = hash.startsWith("#/privacy");
  const isDataDeletionRoute = hash.startsWith("#/data-deletion");
  const isNglRoute = hash.startsWith("#/ngl") || hash.startsWith("#/ask");

  if (isPrivacyRoute) {
    return <LegalPage page="privacy" />;
  }

  if (isDataDeletionRoute) {
    return <LegalPage page="data-deletion" />;
  }

  if (isNglRoute) {
    return <NglStandalonePage />;
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
