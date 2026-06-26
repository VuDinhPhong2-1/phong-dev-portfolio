import React, { useRef } from "react";
import { faCode, faDisplay, faListCheck, faToolbox } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomHook from "./CustomHook";
import { localizedContent } from "../data/localizedContent";
import { useLanguage } from "../context/LanguageContext";

function Projects() {
  const { language } = useLanguage();
  const { projects, sections, ui } = localizedContent[language];
  const scrollTab = useRef();
  const animatedRefs = useRef([]);
  CustomHook(scrollTab, animatedRefs);

  return (
    <section ref={scrollTab} data-name="projects">
      <div className="section-heading animation" ref={(el) => el && animatedRefs.current.push(el)}>
        <div className="eyebrow">{sections.projects.eyebrow}</div>
        <h2>{sections.projects.title}</h2>
        <p>{sections.projects.description}</p>
      </div>

      <div className="project-list">
        {projects.map((project) => (
          <article
            className="project-card animation"
            key={project.name}
            ref={(el) => el && animatedRefs.current.push(el)}
          >
            <div className="project-grid">
              <div className="project-visual">
                <img src={project.image} alt={project.name} />
              </div>

              <div className="project-body">
                <header>
                  <div>
                    <h3>{project.name}</h3>
                    <p>{project.role}</p>
                  </div>
                </header>

                <p>{project.description}</p>

                <div className="project-badges">
                  {project.badges.map((badge) => (
                    <span key={badge}>{badge}</span>
                  ))}
                </div>

                <div className="project-details">
                  <div className="project-row">
                    <div className="icon-wrap">
                      <FontAwesomeIcon icon={faListCheck} />
                    </div>
                    <div>
                      <strong>{ui.keyFeatures}</strong>
                      <ul className="bullet-list">
                        {project.features.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="project-row">
                    <div className="icon-wrap">
                      <FontAwesomeIcon icon={faDisplay} />
                    </div>
                    <div>
                      <strong>{ui.frontend}</strong>
                      <p>{project.technologies.frontend}</p>
                    </div>
                  </div>

                  <div className="project-row">
                    <div className="icon-wrap">
                      <FontAwesomeIcon icon={faCode} />
                    </div>
                    <div>
                      <strong>{ui.backend}</strong>
                      <p>{project.technologies.backend}</p>
                    </div>
                  </div>

                  <div className="project-row">
                    <div className="icon-wrap">
                      <FontAwesomeIcon icon={faToolbox} />
                    </div>
                    <div>
                      <strong>{ui.tools}</strong>
                      <p>{project.technologies.tools}</p>
                    </div>
                  </div>
                </div>

                <div className="project-actions">
                  {project.sources.map((source) => (
                    <a
                      key={source.href}
                      className="button-secondary"
                      href={source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Projects;
