import React, { useRef } from "react";
import {
  faEnvelope,
  faLocationDot,
  faPhone,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faGithub, faTiktok } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomHook from "./CustomHook";
import { localizedContent } from "../data/localizedContent";
import { useLanguage } from "../context/LanguageContext";
import { trackPortfolioEvent } from "../services/analyticsTracker";
import AnonymousQuestions from "./AnonymousQuestions";

const getContactIcon = (title) => {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes("email")) return faEnvelope;
  if (normalizedTitle.includes("phone") || normalizedTitle.includes("điện")) return faPhone;
  if (normalizedTitle.includes("address") || normalizedTitle.includes("địa")) return faLocationDot;
  if (normalizedTitle.includes("github")) return faGithub;
  if (normalizedTitle.includes("facebook")) return faFacebook;
  if (normalizedTitle.includes("tiktok")) return faTiktok;

  return faShareNodes;
};

const getContactIconTone = (title) => {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes("email")) return "email";
  if (normalizedTitle.includes("phone") || normalizedTitle.includes("điện")) return "phone";
  if (normalizedTitle.includes("address") || normalizedTitle.includes("địa")) return "address";
  if (normalizedTitle.includes("github")) return "github";
  if (normalizedTitle.includes("facebook")) return "facebook";
  if (normalizedTitle.includes("tiktok")) return "tiktok";

  return "default";
};

function Contacts() {
  const { language } = useLanguage();
  const { contactItems, profile, sections, ui } = localizedContent[language];
  const scrollTab = useRef();
  const animatedRefs = useRef([]);
  CustomHook(scrollTab, animatedRefs);

  return (
    <section ref={scrollTab} data-name="contact">
      <div className="section-heading animation" ref={(el) => el && animatedRefs.current.push(el)}>
        <div className="eyebrow">{sections.contact.eyebrow}</div>
        <h2>{sections.contact.title}</h2>
        <p>{sections.contact.description}</p>
      </div>

      <div className="contact-grid">
        <div className="contact-card contact-card-main animation" ref={(el) => el && animatedRefs.current.push(el)}>
          <h3>{profile.name}</h3>
          <p>{profile.role}</p>
          <div className="project-actions">
            <a
              className="button-primary"
              href={profile.cvLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackPortfolioEvent("cv_download", { source: "contact" })}
            >
              {ui.downloadCv}
            </a>
            <a
              className="button-secondary"
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackPortfolioEvent("github_click", { source: "contact_profile" })}
            >
              {ui.githubProfile}
            </a>
          </div>
        </div>

        <div className="contact-list">
          {contactItems.map((item) => (
            <article
              className="contact-card animation"
              key={item.title}
              ref={(el) => el && animatedRefs.current.push(el)}
            >
              <div className={`contact-icon contact-icon-${getContactIconTone(item.title)}`}>
                <FontAwesomeIcon icon={getContactIcon(item.title)} />
              </div>
              <div>
                <strong>{item.title}</strong>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackPortfolioEvent(item.href.includes("github.com") ? "github_click" : "contact_click", {
                        channel: item.title,
                        value: item.value,
                      })
                    }
                  >
                    {item.value}
                  </a>
                ) : (
                  <span>{item.value}</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <AnonymousQuestions />
    </section>
  );
}

export default Contacts;
