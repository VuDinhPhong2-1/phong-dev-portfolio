import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { changeTabActive } from "../redux/actions";
import { useLanguage } from "../context/LanguageContext";
import { localizedContent } from "../data/localizedContent";
import { scrollToSection } from "../utils/scrollToSection";
import { getUserQuestions, subscribeToMyQuestions } from "../services/nglNotificationService";
import { trackPortfolioEvent } from "../services/analyticsTracker";

function Header() {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.activeTab);
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const content = localizedContent[language];
  const [unreadNgl, setUnreadNgl] = useState(0);

  useEffect(() => {
    const unsub = subscribeToMyQuestions((items) => {
      const list = items || getUserQuestions();
      const count = list.filter((q) => q.status === "answered" && !q.read).length;
      setUnreadNgl(count);
    });
    return () => unsub?.();
  }, []);

  const handleChangeTab = (value) => {
    trackPortfolioEvent("nav_click", { tab: value });
    dispatch(changeTabActive(value));
    scrollToSection(value);
    setIsOpen(false);
  };

  const handleSwitchLanguage = (nextLang) => {
    if (nextLang !== language) {
      trackPortfolioEvent("language_change", { from: language, to: nextLang });
    }
    setLanguage(nextLang);
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

        <a
          href="#/ngl"
          target="_blank"
          rel="noopener noreferrer"
          className="header-ngl-tab-link"
          title="Mở trang nhắn tin ẩn danh trong tab mới"
          onClick={() => trackPortfolioEvent("header_ngl_click")}
        >
          <span>Hỏi ẩn danh</span>
          {unreadNgl > 0 ? (
            <span className="header-ngl-badge">{unreadNgl}</span>
          ) : (
            <span className="header-ngl-icon">💬</span>
          )}
        </a>

        <div className="language-switch" aria-label="Language mode">
          {["en", "vi"].map((item) => (
            <button
              type="button"
              key={item}
              className={language === item ? "active" : ""}
              aria-label={item === "en" ? "Switch to English" : "Chuyển sang tiếng Việt"}
              onClick={() => handleSwitchLanguage(item)}
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

