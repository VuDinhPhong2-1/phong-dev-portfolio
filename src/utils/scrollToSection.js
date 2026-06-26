export function scrollToSection(value) {
  const section = document.querySelector(`[data-name="${value}"]`);
  const header = document.querySelector("header");

  if (!section) {
    return;
  }

  const headerOffset = header ? header.getBoundingClientRect().height + 32 : 120;
  const targetTop = Math.max(section.offsetTop - headerOffset, 0);
  window.scrollTo({ top: targetTop, behavior: "smooth" });
}
