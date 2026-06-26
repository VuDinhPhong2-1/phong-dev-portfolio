import React, { useRef } from "react";
import CustomHook from "./CustomHook";
import { localizedContent } from "../data/localizedContent";
import { useLanguage } from "../context/LanguageContext";

function Education() {
  const { language } = useLanguage();
  const { educationItems, sections } = localizedContent[language];
  const scrollTab = useRef();
  const animatedRefs = useRef([]);
  CustomHook(scrollTab, animatedRefs);

  return (
    <section ref={scrollTab} data-name="education">
      <div className="section-heading animation" ref={(el) => el && animatedRefs.current.push(el)}>
        <div className="eyebrow">{sections.education.eyebrow}</div>
        <h2>{sections.education.title}</h2>
        <p>{sections.education.description}</p>
      </div>

      <div className="education-grid">
        {educationItems.map((item) => (
          <article
            className="education-card animation"
            key={item.title}
            ref={(el) => el && animatedRefs.current.push(el)}
          >
            <small>{item.period}</small>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Education;
