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
import { LanguageProvider } from "./context/LanguageContext";
import { usePortfolioAnalytics } from "./hooks/usePortfolioAnalytics";

function PortfolioApp() {
  usePortfolioAnalytics();

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
    </main>
  );
}

function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const isAdminRoute = hash.startsWith("#/admin-analytics");

  return <LanguageProvider>{isAdminRoute ? <AdminAnalytics /> : <PortfolioApp />}</LanguageProvider>;
}

export default App;
