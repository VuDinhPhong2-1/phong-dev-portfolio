import "./App.css";
import Header from "./components/Header";
import Home from "./components/Home";
import About from "./components/About";
import Education from "./components/Education";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contacts from "./components/Contacts";
import Experience from "./components/Experience";
import { LanguageProvider } from "./context/LanguageContext";

function App() {
  return (
    <LanguageProvider>
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
    </LanguageProvider>
  );
}

export default App;
