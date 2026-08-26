const componentPaths = {
  navigation: 'components/navigation.html',
  hero: 'components/hero.html',
  stats: 'components/stats.html',
  projects: 'components/projects.html',
  experience: 'components/experience.html',
  stack: 'components/stack.html',
  footer: 'components/footer.html',
};

async function loadComponents() {
  const componentContainers = [...document.querySelectorAll('[data-component]')];
  await Promise.all(componentContainers.map(async (container) => {
    const response = await fetch(componentPaths[container.dataset.component]);
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${container.dataset.component}`);
    }
    container.innerHTML = await response.text();
  }));
}

function getNavigationState() {
  return {
    navigationLinks: [...document.querySelectorAll('[data-nav-link]')],
    sections: [...document.querySelectorAll('[data-section]')],
    revealElements: [...document.querySelectorAll('[data-reveal]')],
  };
}

function setCurrentSection(sectionId, navigationLinks) {
  navigationLinks.forEach((link) => {
    const isCurrent = link.getAttribute('href') === `#${sectionId}`;
    link.setAttribute('aria-current', isCurrent ? 'true' : 'false');
  });
}

function observeSections({ navigationLinks, sections }) {
  if (!('IntersectionObserver' in window)) {
    return;
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (visibleSection) {
        setCurrentSection(visibleSection.target.id, navigationLinks);
      }
    },
    { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.25, 0.5] },
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

function observeRevealElements({ revealElements }) {
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

async function bootstrap() {
  try {
    await loadComponents();
    const state = getNavigationState();
    observeSections(state);
    observeRevealElements(state);
  } catch (error) {
    document.querySelector('[data-load-error]').hidden = false;
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', bootstrap);
