import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import { faArrowRight, faDownload, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomHook from "./CustomHook";
import { localizedContent } from "../data/localizedContent";
import { useLanguage } from "../context/LanguageContext";
import { changeTabActive } from "../redux/actions";
import { scrollToSection } from "../utils/scrollToSection";

function Home() {
  const dispatch = useDispatch();
  const { language } = useLanguage();
  const { profile, ui } = localizedContent[language];
  const scrollTab = useRef();
  const animatedRefs = useRef([]);
  CustomHook(scrollTab, animatedRefs);

  const jumpTo = (section) => {
    dispatch(changeTabActive(section));
    scrollToSection(section);
  };

  return (
    <section ref={scrollTab} className="hero" data-name="hero">
      <div className="hero-copy">
        <div className="eyebrow animation" ref={(el) => el && animatedRefs.current.push(el)}>
          {profile.heroEyebrow}
        </div>
        <h1 className="animation" ref={(el) => el && animatedRefs.current.push(el)}>
          {profile.name}
          <span>{ui.portfolio}</span>
        </h1>
        <p className="hero-role animation" ref={(el) => el && animatedRefs.current.push(el)}>
          {profile.role}
        </p>
        <p className="hero-summary animation" ref={(el) => el && animatedRefs.current.push(el)}>
          {profile.summary}
        </p>
        <div className="hero-proof animation" ref={(el) => el && animatedRefs.current.push(el)}>
          <strong>{ui.heroProofLabel}</strong>
          <span>{ui.heroProofText}</span>
        </div>
        <div className="hero-actions animation" ref={(el) => el && animatedRefs.current.push(el)}>
          <button type="button" className="button-primary" onClick={() => jumpTo("projects")}>
            <FontAwesomeIcon icon={faArrowRight} />
            {ui.viewProjects}
          </button>
          <a
            className="button-secondary"
            href={profile.cvLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faDownload} />
            {ui.downloadCv}
          </a>
          <button type="button" className="button-secondary" onClick={() => jumpTo("contact")}>
            <FontAwesomeIcon icon={faEnvelope} />
            {ui.contactMe}
          </button>
        </div>
        <div className="hero-highlights animation" ref={(el) => el && animatedRefs.current.push(el)}>
          {profile.heroHighlights.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      <aside className="hero-card animation" ref={(el) => el && animatedRefs.current.push(el)}>
        <div className="portrait">
          <img src={profile.avatar} alt={profile.name} />
        </div>
        <div className="hero-card-caption">
          <strong>{profile.role}</strong>
          <span>{profile.heroHighlights.slice(0, 3).join(" / ")}</span>
        </div>
        <footer>
          {profile.personalFacts.map((fact) => (
            <div key={fact.label}>
              <strong>{fact.label}</strong>
              <span>{fact.value}</span>
            </div>
          ))}
        </footer>
      </aside>
    </section>
  );
}

export default Home;
