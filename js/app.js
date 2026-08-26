// app.js — carga los componentes, maneja nav móvil, scrollspy y animaciones de entrada.

const COMPONENTS = {
  navigation: 'components/navigation.html',
  hero: 'components/hero.html',
  stats: 'components/stats.html',
  projects: 'components/projects.html',
  experience: 'components/experience.html',
  stack: 'components/stack.html',
  footer: 'components/footer.html',
};

async function loadComponent(name, path) {
  const slot = document.querySelector(`[data-component="${name}"]`);
  if (!slot) return;
  try {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.status);
    slot.outerHTML = await res.text();
  } catch (err) {
    console.error(`No se pudo cargar ${name}:`, err);
    const banner = document.querySelector('[data-load-error]');
    if (banner) banner.hidden = false;
  }
}

async function loadAll() {
  await Promise.all(
    Object.entries(COMPONENTS).map(([name, path]) => loadComponent(name, path))
  );
  initNavToggle();
  initScrollSpy();
  initReveal();
}

// Menú móvil: agrega un botón hamburguesa a la nav si no existe.
function initNavToggle() {
  const nav = document.querySelector('.site-nav');
  const list = nav?.querySelector('ul');
  if (!nav || !list) return;

  let toggle = nav.querySelector('.nav-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Abrir menú');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span>';
    nav.appendChild(toggle);
  }

  toggle.addEventListener('click', () => {
    const isOpen = list.getAttribute('data-open') === 'true';
    list.setAttribute('data-open', String(!isOpen));
    toggle.setAttribute('aria-expanded', String(!isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
  });

  // cierra el menú al elegir un link (mobile)
  list.querySelectorAll('a[data-nav-link]').forEach((link) => {
    link.addEventListener('click', () => {
      list.setAttribute('data-open', 'false');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Resalta el link de la sección visible actualmente.
function initScrollSpy() {
  const links = document.querySelectorAll('a[data-nav-link]');
  const sections = Array.from(links)
    .map((l) => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = `#${entry.target.id}`;
        const link = document.querySelector(`a[data-nav-link][href="${id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach((l) => l.setAttribute('aria-current', 'false'));
          link.setAttribute('aria-current', 'true');
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((s) => observer.observe(s));
}

// Anima la entrada de cada bloque marcado con data-reveal.
function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((el) => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', loadAll);