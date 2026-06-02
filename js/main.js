/* =============================================
   CRIANZA CON AMOR - JavaScript Principal
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* --- Navbar scroll shadow --- */
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  /* --- Mobile hamburger menu --- */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const hamburgerSpans = document.querySelectorAll('.hamburger span');
  let menuOpen = false;

  hamburger && hamburger.addEventListener('click', () => {
    menuOpen = !menuOpen;
    navLinks.classList.toggle('open', menuOpen);
    hamburgerSpans[0].style.transform = menuOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
    hamburgerSpans[1].style.opacity = menuOpen ? '0' : '1';
    hamburgerSpans[2].style.transform = menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });

  navLinks && navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      navLinks.classList.remove('open');
      hamburgerSpans.forEach(s => { s.style.transform = ''; s.style.opacity = '1'; });
    });
  });

  /* --- Smooth scroll for anchor links --- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = navbar ? navbar.offsetHeight : 0;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });

  /* --- Scroll animations (IntersectionObserver) --- */
  const animateEls = document.querySelectorAll('.animate');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    animateEls.forEach(el => observer.observe(el));
  } else {
    animateEls.forEach(el => el.classList.add('visible'));
  }

  /* --- Counter animation --- */
  function animateCounter(el, target, suffix = '', duration = 1800) {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { start = target; clearInterval(timer); }
      el.textContent = Math.floor(start).toLocaleString('es-PE') + suffix;
    }, 16);
  }

  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.dataset.counter);
          const suffix = el.dataset.suffix || '';
          animateCounter(el, target, suffix);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));
  }

  /* --- FAQ Accordion --- */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(open => open.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* --- Checkout con Mercado Pago ---
     Cada botón tiene data-product-id con el ID del producto.
     1) Llama al backend para crear la preferencia
     2) Redirige al checkout de Mercado Pago
  --- */
  document.querySelectorAll('.product-cta[data-product-id]').forEach(btn => {
    btn.addEventListener('click', async function () {
      const productId = this.dataset.productId;
      const originalText = this.textContent;

      this.textContent = 'Preparando pago...';
      this.disabled = true;
      this.style.opacity = '0.75';

      try {
        const res = await fetch('/api/crear-preferencia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });

        if (!res.ok) throw new Error('Error del servidor');

        const { initPoint } = await res.json();
        window.location.href = initPoint;

      } catch (err) {
        console.error('Error al iniciar pago:', err);
        this.textContent = '⚠ Error. Intenta de nuevo';
        this.style.background = '#EF4444';
        setTimeout(() => {
          this.textContent = originalText;
          this.disabled = false;
          this.style.opacity = '';
          this.style.background = '';
        }, 3000);
      }
    });
  });

});
