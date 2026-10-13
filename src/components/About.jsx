import React, { useRef } from "react";
import { faBookOpen, faChalkboardTeacher, faLaptopCode } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomHook from "./CustomHook";
import { localizedContent } from "../data/localizedContent";
import { useLanguage } from "../context/LanguageContext";

const icons = [faBookOpen, faChalkboardTeacher, faLaptopCode];

function About() {
  const { language } = useLanguage();
  const { profile, sections } = localizedContent[language];
  const scrollTab = useRef();
  const animatedRefs = useRef([]);
  CustomHook(scrollTab, animatedRefs);

  return (
    <section ref={scrollTab} className="about-section magic-about" data-name="about">
      <div className="section-heading animation" ref={(el) => el && animatedRefs.current.push(el)}>
        <div className="eyebrow magic-eyebrow">
          <span className="eyebrow-sparkle">✦</span>
          {sections.about.eyebrow}
          <span className="eyebrow-sparkle">✦</span>
        </div>
        <h2 className="magic-heading">{sections.about.title}</h2>
        <p className="magic-subheading">{sections.about.description}</p>
      </div>

      <div className="about-grid">
        <div className="about-copy magic-glass-card animation" ref={(el) => el && animatedRefs.current.push(el)}>
          <div className="glass-ambient-glow" />
          <div className="about-copy-header">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">~/phong-profile.story</span>
          </div>
          {profile.about.map((paragraph, idx) => (
            <p key={paragraph} className={`paragraph-fade-${idx}`}>
              {paragraph}
            </p>
          ))}
          <div className="about-story-pills">
            <span className="story-pill">✦ MOS Master Certified</span>
            <span className="story-pill">✦ Clean Code Mindset</span>
            <span className="story-pill">✦ Agile & Creative</span>
          </div>
        </div>

        <div className="about-focus magic-glass-card animation" ref={(el) => el && animatedRefs.current.push(el)}>
          <div className="glass-ambient-glow" />
          <h3 className="magic-focus-title">{sections.about.focusTitle}</h3>
          <div className="focus-list">
            {profile.focusAreas.map((item, index) => (
              <div className="focus-item magic-focus-item" key={item.title}>
                <div className={`icon-wrap magic-icon-wrap tone-${index % 3}`}>
                  <FontAwesomeIcon icon={icons[index % icons.length]} />
                  <div className="icon-glow-ring" />
                </div>
                <div className="focus-content">
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
