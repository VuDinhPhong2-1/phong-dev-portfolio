import React, { useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { faArrowRight, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomHook from "./CustomHook";
import MagicCanvas from "./MagicCanvas";
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

  // 3D Card Tilt state & handling
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
    sheenStyle: { opacity: 0 },
  });

  const handleCardMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`,
      sheenStyle: {
        opacity: 0.65,
        background: `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.28) 0%, rgba(168, 85, 247, 0.15) 45%, transparent 70%)`,
      },
    });
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)",
      sheenStyle: { opacity: 0 },
    });
  }, []);

  const jumpTo = (section) => {
    dispatch(changeTabActive(section));
    scrollToSection(section);
  };

  return (
    <section ref={scrollTab} className="hero magic-hero" data-name="hero">
      <MagicCanvas />

      <div className="hero-copy">
        <div className="magic-status-pill animation" ref={(el) => el && animatedRefs.current.push(el)}>
          <span className="magic-status-dot" />
          <span>{profile.heroEyebrow}</span>
          <span className="magic-pill-sparkle">✦</span>
        </div>

        <h1 className="animation magic-title" ref={(el) => el && animatedRefs.current.push(el)}>
          <span className="magic-name-gradient">{profile.name}</span>
          <span className="magic-portfolio-badge">{ui.portfolio}</span>
        </h1>

        <p className="hero-role magic-glow-role animation" ref={(el) => el && animatedRefs.current.push(el)}>
          {profile.role}
        </p>

        <p className="hero-summary animation" ref={(el) => el && animatedRefs.current.push(el)}>
          {profile.summary}
        </p>

        <div className="hero-proof magic-proof-card animation" ref={(el) => el && animatedRefs.current.push(el)}>
          <div className="magic-proof-glow" />
          <strong>{ui.heroProofLabel}</strong>
          <span>{ui.heroProofText}</span>
        </div>

        <div className="hero-actions animation" ref={(el) => el && animatedRefs.current.push(el)}>
          <button type="button" className="button-primary magic-btn-primary" onClick={() => jumpTo("projects")}>
            <FontAwesomeIcon icon={faArrowRight} />
            {ui.viewProjects}
          </button>
          <button type="button" className="button-secondary magic-btn-secondary" onClick={() => jumpTo("contact")}>
            <FontAwesomeIcon icon={faEnvelope} />
            {ui.contactMe}
          </button>
        </div>

        <div className="hero-highlights animation" ref={(el) => el && animatedRefs.current.push(el)}>
          {profile.heroHighlights.map((item, idx) => (
            <span key={item} className={`magic-tag magic-tag-${idx % 3}`}>
              <span className="tag-sparkle">✧</span> {item}
            </span>
          ))}
        </div>
      </div>

      <aside
        ref={(el) => {
          cardRef.current = el;
          if (el) animatedRefs.current.push(el);
        }}
        className="hero-card magic-hero-card animation"
        style={{ transform: tiltStyle.transform }}
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
      >
        <div className="magic-card-sheen" style={tiltStyle.sheenStyle} />
        <div className="portrait magic-portrait">
          <div className="magic-portrait-glow" />
          <img src={profile.avatar} alt={profile.name} />
          <div className="magic-hologram-line" />
        </div>
        <div className="hero-card-caption">
          <strong>{profile.role}</strong>
          <span>{profile.heroHighlights.slice(0, 3).join(" / ")}</span>
        </div>
        <footer>
          {profile.personalFacts.map((fact) => (
            <div key={fact.label} className="magic-fact-item">
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
