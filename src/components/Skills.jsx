import React, { useRef } from "react";
import CustomHook from "./CustomHook";
import { localizedContent } from "../data/localizedContent";
import { useLanguage } from "../context/LanguageContext";

function Skills() {
  const { language } = useLanguage();
  const { skillGroups, sections } = localizedContent[language];
  const scrollTab = useRef();
  const animatedRefs = useRef([]);
  CustomHook(scrollTab, animatedRefs);

  return (
    <section ref={scrollTab} data-name="skills">
      <div className="section-heading animation" ref={(el) => el && animatedRefs.current.push(el)}>
        <div className="eyebrow">{sections.skills.eyebrow}</div>
        <h2>{sections.skills.title}</h2>
        <p>{sections.skills.description}</p>
      </div>

      <div className="skills-grid">
        {skillGroups.map((group) => (
          <article
            className="skill-group animation"
            key={group.title}
            ref={(el) => el && animatedRefs.current.push(el)}
          >
            <h3>{group.title}</h3>
            <p>{group.description}</p>
            <div className="skill-items">
              {group.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Skills;
