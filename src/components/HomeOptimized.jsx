import React, { useCallback, useEffect, useRef } from "react";
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
  const cardRef = useRef(null);
  const sheenRef = useRef(null);
  const tiltFrameRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });

  CustomHook(scrollTab, animatedRefs, true);

  const registerAnimatedRef = useCallback((element) => {
    if (element && !animatedRefs.current.includes(element)) {
      animatedRefs.current.push(element);
    }
  }, []);

  const handleCardMouseMove = useCallback((event) => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    pointerRef.current = { x: event.clientX, y: event.clientY };
    if (tiltFrameRef.current !== null) return;

    tiltFrameRef.current = window.requestAnimationFrame(() => {
      tiltFrameRef.current = null;
      const card = cardRef.current;
      const sheen = sheenRef.current;
      if (!card || !sheen) return;

      const rect = card.getBoundingClientRect();
      const x = pointerRef.current.x - rect.left;
      const y = pointerRef.current.y - rect.top;
      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -4;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 4;

      card.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-3px)`;
      sheen.style.opacity = "0.4";
      sheen.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.45) 0%, rgba(79, 70, 229, 0.08) 42%, transparent 70%)`;
    });
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    if (tiltFrameRef.current !== null) {
      window.cancelAnimationFrame(tiltFrameRef.current);
      tiltFrameRef.current = null;
    }
    if (cardRef.current) {
      cardRef.current.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
    }
    if (sheenRef.current) sheenRef.current.style.opacity = "0";
  }, []);

  useEffect(
    () => () => {
      if (tiltFrameRef.current !== null) {
        window.cancelAnimationFrame(tiltFrameRef.current);
      }
    },
    [],
  );

  const jumpTo = (section) => {
    dispatch(changeTabActive(section));
    scrollToSection(section);
  };

  return (
    <section ref={scrollTab} className="hero magic-hero" data-name="hero">
      <MagicCanvas />

      <div className="hero-copy">
        <div className="magic-status-pill animation" ref={registerAnimatedRef}>
          <span className="magic-status-dot" />
          <span>{profile.heroEyebrow}</span>
          <span className="magic-pill-sparkle">✦</span>
        </div>

        <h1 className="animation magic-title" ref={registerAnimatedRef}>
          <span className="magic-name-gradient">{profile.name}</span>
          <span className="magic-portfolio-badge">{ui.portfolio}</span>
        </h1>

        <p className="hero-role magic-glow-role animation" ref={registerAnimatedRef}>
          {profile.role}
        </p>

        <p className="hero-summary animation" ref={registerAnimatedRef}>
          {profile.summary}
        </p>

        <div className="hero-proof magic-proof-card animation" ref={registerAnimatedRef}>
          <div className="magic-proof-glow" />
          <strong>{ui.heroProofLabel}</strong>
          <span>{ui.heroProofText}</span>
        </div>

        <div className="hero-actions animation" ref={registerAnimatedRef}>
          <button type="button" className="button-primary magic-btn-primary" onClick={() => jumpTo("projects")}>
            <FontAwesomeIcon icon={faArrowRight} />
            {ui.viewProjects}
          </button>
          <button type="button" className="button-secondary magic-btn-secondary" onClick={() => jumpTo("contact")}>
            <FontAwesomeIcon icon={faEnvelope} />
            {ui.contactMe}
          </button>
        </div>

        <div className="hero-highlights animation" ref={registerAnimatedRef}>
          {profile.heroHighlights.map((item, idx) => (
            <span key={item} className={`magic-tag magic-tag-${idx % 3}`}>
              <span className="tag-sparkle">✧</span> {item}
            </span>
          ))}
        </div>
      </div>

      <aside
        ref={(element) => {
          cardRef.current = element;
          registerAnimatedRef(element);
        }}
        className="hero-card magic-hero-card animation"
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
      >
        <div ref={sheenRef} className="magic-card-sheen" />
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
