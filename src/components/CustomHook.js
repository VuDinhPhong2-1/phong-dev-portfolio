import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { changeTabActive } from "../redux/actions";

const revealElement = (element) => {
  element.classList.add("active");
  element.addEventListener(
    "transitionend",
    () => {
      element.style.willChange = "auto";
    },
    { once: true },
  );
};

/**
 * Reveals a section's animated children once and, for the hero instance, keeps
 * the navigation in sync through a single IntersectionObserver.
 */
const CustomHook = (refTab = null, refList = null, trackActiveSections = false) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!refTab?.current) return undefined;

    const animatedElements = Array.from(new Set(refList?.current?.filter(Boolean) || []));
    if (refList) refList.current = animatedElements;
    const pendingElements = animatedElements.filter(
      (element) => !element.classList.contains("active"),
    );

    // Do not hide content in tests, older browsers, or reduced-motion mode.
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      pendingElements.forEach(revealElement);
      return undefined;
    }

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          revealElement(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );

    pendingElements.forEach((element) => revealObserver.observe(element));

    return () => revealObserver.disconnect();
  });

  useEffect(() => {
    if (!trackActiveSections) return undefined;

    const sections = Array.from(document.querySelectorAll("section[data-name]"));
    if (!sections.length) return undefined;

    let activeSectionName = "";
    const activate = (name) => {
      if (!name || name === activeSectionName) return;
      activeSectionName = name;
      dispatch(changeTabActive(name));
    };

    // Compatibility path: still only one passive, RAF-throttled listener.
    if (typeof IntersectionObserver === "undefined") {
      let frameId = null;
      const updateFromScroll = () => {
        frameId = null;
        const headerHeight = document.querySelector(".portfolio-header")?.offsetHeight || 88;
        const marker = headerHeight + window.innerHeight * 0.2;
        let current = sections[0];

        sections.forEach((section) => {
          if (section.getBoundingClientRect().top <= marker) current = section;
        });
        activate(current.dataset.name);
      };
      const onScroll = () => {
        if (frameId === null) frameId = window.requestAnimationFrame(updateFromScroll);
      };

      updateFromScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onScroll);
        if (frameId !== null) window.cancelAnimationFrame(frameId);
      };
    }

    const headerHeight = Math.ceil(
      document.querySelector(".portfolio-header")?.getBoundingClientRect().height || 88,
    );
    const visibleSections = new Map();
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleSections.set(entry.target, entry);
          else visibleSections.delete(entry.target);
        });

        const closest = Array.from(visibleSections.values()).sort(
          (a, b) =>
            Math.abs(a.boundingClientRect.top - headerHeight) -
            Math.abs(b.boundingClientRect.top - headerHeight),
        )[0];

        if (closest) activate(closest.target.dataset.name);
      },
      {
        rootMargin: `-${headerHeight}px 0px -55% 0px`,
        threshold: [0, 0.15, 0.35],
      },
    );

    sections.forEach((section) => sectionObserver.observe(section));
    activate(sections[0].dataset.name);

    return () => sectionObserver.disconnect();
  }, [dispatch, trackActiveSections]);
};

export default CustomHook;
