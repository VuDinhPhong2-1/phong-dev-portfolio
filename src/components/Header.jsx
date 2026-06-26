import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { changeTabActive } from "../redux/actions";
import { useLanguage } from "../context/LanguageContext";
import { localizedContent } from "../data/localizedContent";
import { scrollToSection } from "../utils/scrollToSection";

function Header() {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.activeTab);
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const content = localizedContent[language];

  const handleChangeTab = (value) => {
    dispatch(changeTabActive(value));
    scrollToSection(value);
    setIsOpen(false);
  };

  return (
    <header>
      <button type="button" className="brand" onClick={() => handleChangeTab("hero")}>
        <strong>Vu Dinh Phong</strong>
        <span>{content.ui.brandRole}</span>
      </button>

      <nav className={isOpen ? "active" : ""}>
        {content.nav.map((item) => (
          <button
            type="button"
            key={item.key}
            className={activeTab === item.key ? "active" : ""}
            onClick={() => handleChangeTab(item.key)}
          >
            {item.label}
          </button>
        ))}
        <div className="language-switch" aria-label="Language mode">
          {["en", "vi"].map((item) => (
            <button
              type="button"
              key={item}
              className={language === item ? "active" : ""}
              aria-label={item === "en" ? "Switch to English" : "Chuyển sang tiếng Việt"}
              onClick={() => {
                setLanguage(item);
                setIsOpen(false);
              }}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      <button type="button" className="icon-bar" onClick={() => setIsOpen((prev) => !prev)}>
        <FontAwesomeIcon icon={faBars} />
      </button>
    </header>
  );
}

export default Header;
