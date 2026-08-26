const navigationLinks = [...document.querySelectorAll('[data-nav-link]')];
const sections = [...document.querySelectorAll('[data-section]')];
const revealElements = [...document.querySelectorAll('[data-reveal]')];

function setCurrentSection(sectionId) {
  navigationLinks.forEach((link) => {
    const isCurrent = link.getAttribute('href') === `#${sectionId}`;
    link.setAttribute('aria-current', isCurrent ? 'true' : 'false');
  });
}

function observeSections() {
  if (!('IntersectionObserver' in window)) {
    return;
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (visibleSection) {
        setCurrentSection(visibleSection.target.id);
      }
    },
    { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.25, 0.5] },
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

function observeRevealElements() {
  if (!('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

function bootstrap() {
  observeSections();
  observeRevealElements();
}

document.addEventListener('DOMContentLoaded', bootstrap);
