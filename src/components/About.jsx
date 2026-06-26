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
    <section ref={scrollTab} data-name="about">
      <div className="section-heading animation" ref={(el) => el && animatedRefs.current.push(el)}>
        <div className="eyebrow">{sections.about.eyebrow}</div>
        <h2>{sections.about.title}</h2>
        <p>{sections.about.description}</p>
      </div>

      <div className="about-grid">
        <div className="about-copy animation" ref={(el) => el && animatedRefs.current.push(el)}>
          {profile.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="about-focus animation" ref={(el) => el && animatedRefs.current.push(el)}>
          <h3>{sections.about.focusTitle}</h3>
          <div className="focus-list">
            {profile.focusAreas.map((item, index) => (
              <div className="focus-item" key={item.title}>
                <div className="icon-wrap">
                  <FontAwesomeIcon icon={icons[index % icons.length]} />
                </div>
                <div>
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
