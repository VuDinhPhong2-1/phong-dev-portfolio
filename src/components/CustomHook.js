import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeTabActive } from "../redux/actions";

const getHeaderOffset = () => {
  const header = document.querySelector("header");
  if (!header) {
    return 120;
  }

  return header.getBoundingClientRect().height + 32;
};

const getActiveSectionName = () => {
  const anchor = getHeaderOffset();
  const sections = Array.from(document.querySelectorAll("section[data-name]"));
  const scrollPosition = window.scrollY + anchor + 12;

  let currentSectionName = sections[0]?.dataset.name;
  sections.forEach((section) => {
    if (section.offsetTop <= scrollPosition) {
      currentSectionName = section.dataset.name;
    }
  });

  return currentSectionName;
};

const CustomHook = (refTab = null, refList = null) => {
  const activeTab = useSelector((state) => state.activeTab);
  const dispatch = useDispatch();

  useEffect(() => {
    const section = refTab?.current;
    if (!section) {
      return undefined;
    }

    const animatedElements = refList
      ? Array.from(new Set(refList.current.filter(Boolean)))
      : [];

    animatedElements.forEach((element) => {
      element.classList.add("animation");
    });

    const revealOnScroll = () => {
      animatedElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop <= window.innerHeight * 0.88) {
          element.classList.add("active");
        } else {
          element.classList.remove("active");
        }
      });
    };

    const updateActiveSection = () => {
      const currentSectionName = getActiveSectionName();
      if (currentSectionName && currentSectionName !== activeTab) {
        dispatch(changeTabActive(currentSectionName));
      }
    };

    revealOnScroll();
    updateActiveSection();

    const onScroll = () => {
      revealOnScroll();
      updateActiveSection();
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [activeTab, dispatch, refList, refTab]);
};

export default CustomHook;
