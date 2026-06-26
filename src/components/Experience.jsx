import React, { useRef } from "react";
import { faBriefcase, faCodeBranch, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomHook from "./CustomHook";
import { localizedContent } from "../data/localizedContent";
import { useLanguage } from "../context/LanguageContext";

function Experience() {
  const { language } = useLanguage();
  const { experiences, sections, ui } = localizedContent[language];
  const scrollTab = useRef();
  const animatedRefs = useRef([]);
  CustomHook(scrollTab, animatedRefs);

  return (
    <section ref={scrollTab} data-name="experience">
      <div className="section-heading animation" ref={(el) => el && animatedRefs.current.push(el)}>
        <div className="eyebrow">{sections.experience.eyebrow}</div>
        <h2>{sections.experience.title}</h2>
        <p>{sections.experience.description}</p>
      </div>

      <div className="timeline">
        {experiences.map((exp) => (
          <article
            className="experience-card animation"
            key={`${exp.company}-${exp.period}`}
            ref={(el) => el && animatedRefs.current.push(el)}
          >
            <header>
              <div>
                <div className="experience-company">{exp.company}</div>
                <h3>{exp.position}</h3>
                <p>{exp.period}</p>
              </div>
              {exp.website ? (
                <a
                  className="button-secondary"
                  href={exp.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faGlobe} />
                  {ui.companyWebsite}
                </a>
              ) : null}
            </header>

            <div className="experience-details">
              <div className="experience-meta">
                <div className="icon-wrap">
                  <FontAwesomeIcon icon={faBriefcase} />
                </div>
                <div>
                  <strong>{ui.roleFocus}</strong>
                  <p>{exp.position}</p>
                </div>
              </div>

              <div className="experience-meta">
                <div className="icon-wrap">
                  <FontAwesomeIcon icon={faCodeBranch} />
                </div>
                <div>
                  <strong>{ui.technologies}</strong>
                  <p>{exp.technologies.join(", ")}</p>
                </div>
              </div>

              <ul className="bullet-list">
                {exp.description.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Experience;
