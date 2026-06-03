/* ============================================================
   DR. CARLOS ALEXANDRE · CA CLINIC · interações
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initLetterSplit();
  initScrollProgress();
  initNav();
  initBurger();
  initScrollReveal();
  initCounters();
  initBeforeAfter();
  initReviewsCarousel();
  initGalleryCarousel();
});

/* Letter-by-letter reveal: divide texto em letras preservando <em>.
   Agrupa letras por palavra com white-space: nowrap pra evitar
   quebra de linha no meio de uma palavra. */
function initLetterSplit() {
  document.querySelectorAll('[data-letter-split]').forEach(el => {
    let i = 0;
    const wrap = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.replace(/\s+/g, ' ');
        const frag = document.createDocumentFragment();
        // separa palavras mantendo os espaços como tokens
        const tokens = text.split(/(\s+)/);
        for (const token of tokens) {
          if (!token) continue;
          if (/^\s+$/.test(token)) {
            // espaço solto entre palavras
            const sp = document.createElement('span');
            sp.className = 'ltr ltr--space';
            sp.style.setProperty('--i', i++);
            sp.textContent = ' ';
            frag.appendChild(sp);
          } else {
            // palavra: agrupa letras num wrapper que não quebra
            const word = document.createElement('span');
            word.className = 'ltr-word';
            for (const ch of token) {
              const span = document.createElement('span');
              span.className = 'ltr';
              span.style.setProperty('--i', i++);
              span.textContent = ch;
              word.appendChild(span);
            }
            frag.appendChild(word);
          }
        }
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(wrap);
      }
    };
    Array.from(el.childNodes).forEach(wrap);
  });
}

/* ---------- 1. Scroll progress bar ---------- */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = pct + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---------- 2. Nav scroll ---------- */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => {
    if (window.scrollY > 80) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- 3. Burger ---------- */
function initBurger() {
  const burger = document.getElementById('navBurger');
  const menu   = document.getElementById('navMenu');
  if (!burger || !menu) return;
  burger.addEventListener('click', () => menu.classList.toggle('is-open'));
  menu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => menu.classList.remove('is-open'))
  );
}

/* ---------- 4. Scroll Reveal ---------- */
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal, .reveal-stagger')
      .forEach(el => el.classList.add('is-visible'));
    return;
  }
  const targets = document.querySelectorAll('.reveal, .reveal-stagger');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
  targets.forEach(el => io.observe(el));
}

/* ---------- 5. Counters ---------- */
function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length || !('IntersectionObserver' in window)) {
    els.forEach(el => el.textContent = formatNum(+el.dataset.count));
    return;
  }
  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatNum(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
    });
  }, { threshold: 0.4 });
  els.forEach(el => io.observe(el));
}
function formatNum(n) {
  if (n >= 10000) {
    const k = n / 1000;
    return k >= 100 ? Math.round(k) + 'K' : k.toFixed(1).replace('.0','') + 'K';
  }
  if (n >= 1000) return n.toLocaleString('pt-BR');
  return n.toString();
}

/* ---------- 6. Antes / Depois (thumb switcher + auto-rotate) ---------- */
function initBeforeAfter() {
  const main    = document.getElementById('baMain');
  const title   = document.getElementById('baTitle');
  const desc    = document.getElementById('baDesc');
  const caseEl  = document.getElementById('baCase');
  const thumbs  = document.getElementById('baThumbs');
  const toggle  = document.getElementById('baToggle');
  const counter = document.getElementById('baCounter');
  if (!main || !thumbs) return;

  const allThumbs = Array.from(thumbs.querySelectorAll('.ba-thumb'));
  if (!allThumbs.length) return;

  let index = 0;
  let isPlaying = true;
  let autoTimer = null;
  const INTERVAL = 4500;

  const renderCounter = () => {
    if (counter) {
      counter.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(allThumbs.length).padStart(2, '0');
    }
  };

  const showCase = (i, scrollIntoView = false) => {
    index = (i + allThumbs.length) % allThumbs.length;
    const btn = allThumbs[index];
    allThumbs.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    main.src = btn.dataset.img;
    if (title  && btn.dataset.title) title.innerHTML = btn.dataset.title;
    if (desc   && btn.dataset.desc)  desc.textContent = btn.dataset.desc;
    if (caseEl && btn.dataset.case)  caseEl.textContent = `Caso ${btn.dataset.case}`;
    renderCounter();
    if (scrollIntoView) btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  const startAuto = () => {
    stopAuto();
    autoTimer = setInterval(() => showCase(index + 1, true), INTERVAL);
  };
  const stopAuto = () => {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  };

  allThumbs.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      showCase(i);
      // ao clicar manualmente, pausa o auto temporariamente e retoma se estiver no modo play
      if (isPlaying) {
        stopAuto();
        clearTimeout(allThumbs._resume);
        allThumbs._resume = setTimeout(() => { if (isPlaying) startAuto(); }, 9000);
      }
    });
  });

  if (toggle) {
    toggle.addEventListener('click', () => {
      isPlaying = !isPlaying;
      toggle.classList.toggle('is-paused', !isPlaying);
      const label = toggle.querySelector('.ba-toggle__label');
      if (label) label.textContent = isPlaying ? 'Pausar' : 'Retomar';
      if (isPlaying) startAuto(); else stopAuto();
    });
  }

  renderCounter();

  // só liga o auto-switch quando entrar na viewport
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && isPlaying) startAuto();
        else stopAuto();
      });
    }, { threshold: 0.3 });
    io.observe(main);
  } else {
    startAuto();
  }
}

/* ---------- 7. Carrossel de depoimentos ---------- */
function initReviewsCarousel() {
  const root  = document.getElementById('reviewsCarousel');
  const track = document.getElementById('reviewsTrack');
  const dots  = document.getElementById('reviewsDots');
  if (!root || !track || !dots) return;

  const reviews = Array.from(track.children);
  const total = reviews.length;
  if (!total) return;

  let index = 0;
  let paused = false;
  let autoTimer = null;

  const cardsPerView = () => {
    const w = window.innerWidth;
    if (w <= 720)  return 1;
    if (w <= 1024) return 2;
    return 3;
  };

  const maxIndex = () => Math.max(0, total - cardsPerView());

  const go = (n) => {
    index = Math.max(0, Math.min(n, maxIndex()));
    const slide = reviews[0];
    if (!slide) return;
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    const w = slide.getBoundingClientRect().width + gap;
    track.style.transform = `translateX(-${index * w}px)`;
    renderDots();
  };

  const next = () => index >= maxIndex() ? go(0) : go(index + 1);
  const prev = () => index <= 0 ? go(maxIndex()) : go(index - 1);

  const renderDots = () => {
    const count = maxIndex() + 1;
    if (dots.children.length !== count) {
      dots.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const b = document.createElement('button');
        b.className = 'reviews__dot' + (i === index ? ' reviews__dot--active' : '');
        b.setAttribute('aria-label', `Ir para depoimento ${i + 1}`);
        b.addEventListener('click', () => { go(i); pause(); });
        dots.appendChild(b);
      }
    } else {
      Array.from(dots.children).forEach((d, i) =>
        d.classList.toggle('reviews__dot--active', i === index)
      );
    }
  };

  const startAuto = () => {
    stopAuto();
    autoTimer = setInterval(() => { if (!paused) next(); }, 5500);
  };
  const stopAuto = () => { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } };
  const pause = () => { paused = true; clearTimeout(pause._t); pause._t = setTimeout(() => paused = false, 9000); };

  root.querySelectorAll('.reviews-arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      +btn.dataset.dir > 0 ? next() : prev();
      pause();
    });
  });
  root.addEventListener('mouseenter', () => paused = true);
  root.addEventListener('mouseleave', () => paused = false);

  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; pause(); }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
  });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { go(0); }, 200);
  });

  go(0);
  startAuto();
}

/* ---------- 8. Carrossel horizontal (galeria) ---------- */
function scrollCarousel(direction) {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  const slide = track.querySelector('.carousel__slide');
  if (!slide) return;
  const slideWidth = slide.offsetWidth + parseFloat(getComputedStyle(track).gap || 16);
  track.scrollBy({ left: slideWidth * direction * 2, behavior: 'smooth' });
  pauseGallery();
}
let galleryTimer = null;
let galleryPaused = false;
let galleryResume = null;

function initGalleryCarousel() {
  const track = document.getElementById('carouselTrack');
  const carousel = document.getElementById('carousel');
  if (!track || !carousel) return;

  const step = () => {
    if (galleryPaused) return;
    const slide = track.querySelector('.carousel__slide');
    if (!slide) return;
    const slideWidth = slide.offsetWidth + parseFloat(getComputedStyle(track).gap || 16);
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (track.scrollLeft >= maxScroll - 5) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: slideWidth, behavior: 'smooth' });
    }
  };
  galleryTimer = setInterval(step, 3500);

  carousel.addEventListener('mouseenter', () => galleryPaused = true);
  carousel.addEventListener('mouseleave', () => galleryPaused = false);
  track.addEventListener('touchstart', pauseGallery, { passive: true });
}
function pauseGallery() {
  galleryPaused = true;
  if (galleryResume) clearTimeout(galleryResume);
  galleryResume = setTimeout(() => galleryPaused = false, 5000);
}
