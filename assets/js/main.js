/* ============================================
   DR. KARPE'S DENTAL WEBSITE — main.js
   Handles: Navbar, Hero Slider, Counters,
   Gallery Filter, Lightbox, Mobile Nav, Scroll
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- NAVBAR SCROLL EFFECT ---- */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- ACTIVE NAV LINK ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---- MOBILE NAV TOGGLE ---- */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      // animate hamburger to X
      const spans = hamburger.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });
    // close on link click
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      });
    });
  }

  /* ---- HERO SLIDER ---- */
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (slides.length > 0) {
    let current = 0;
    let autoplay;

    const goTo = (idx) => {
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    };

    const startAutoplay = () => {
      autoplay = setInterval(() => goTo(current + 1), 5500);
    };
    const stopAutoplay = () => clearInterval(autoplay);

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { stopAutoplay(); goTo(i); startAutoplay(); });
    });

    // Touch swipe support
    const heroEl = document.querySelector('.hero');
    if (heroEl) {
      let startX = 0;
      heroEl.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
      heroEl.addEventListener('touchend', e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          stopAutoplay();
          goTo(diff > 0 ? current + 1 : current - 1);
          startAutoplay();
        }
      }, { passive: true });
    }

    startAutoplay();
  }

  /* ---- ANIMATED STAT COUNTERS ---- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length > 0) {
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const animateCounter = (el) => {
      const target = parseFloat(el.dataset.count);
      const isDecimal = el.dataset.decimal === 'true';
      const duration = 1800;
      const start = performance.now();
      const update = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const value = easeOut(progress) * target;
        el.textContent = isDecimal
          ? value.toFixed(1)
          : Math.floor(value).toLocaleString('en-IN');
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString('en-IN');
      };
      requestAnimationFrame(update);
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(c => counterObserver.observe(c));
  }

  /* ---- SCROLL REVEAL ---- */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // stagger delay based on sibling index
          const siblings = entry.target.parentElement.querySelectorAll('.reveal');
          let idx = 0;
          siblings.forEach((s, j) => { if (s === entry.target) idx = j; });
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, idx * 80);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => revealObserver.observe(el));
  }

  /* ---- GALLERY FILTER ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (filterBtns.length > 0 && galleryItems.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        galleryItems.forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }

  /* ---- LIGHTBOX ---- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  if (lightbox && lightboxImg) {
    let lightboxItems = [];
    let lightboxIndex = 0;

    const openLightbox = (items, idx) => {
      lightboxItems = items;
      lightboxIndex = idx;
      showLightboxItem();
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    };

    const showLightboxItem = () => {
      const item = lightboxItems[lightboxIndex];
      if (!item) return;
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt || '';
      if (lightboxCaption) lightboxCaption.textContent = item.caption || '';
    };

    const prevItem = () => {
      lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length;
      showLightboxItem();
    };

    const nextItem = () => {
      lightboxIndex = (lightboxIndex + 1) % lightboxItems.length;
      showLightboxItem();
    };

    // Gallery lightbox triggers
    const setupGalleryLightbox = (selector) => {
      const items = document.querySelectorAll(selector);
      items.forEach((item, idx) => {
        item.addEventListener('click', () => {
          const imgs = Array.from(items).map(el => ({
            src: el.querySelector('img').src,
            alt: el.querySelector('img').alt,
            caption: el.dataset.caption || el.querySelector('img').alt
          }));
          openLightbox(imgs, idx);
        });
        item.style.cursor = 'pointer';
      });
    };

    setupGalleryLightbox('.gallery-item');
    setupGalleryLightbox('.clinic-tour-item');

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevItem(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextItem(); });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevItem();
      if (e.key === 'ArrowRight') nextItem();
    });
  }

  /* ---- SMOOTH SCROLL FOR ANCHOR LINKS ---- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });

  /* ---- FORM SUBMISSION (WhatsApp Redirection) ---- */
  const apptForm = document.getElementById('appt-form');
  if (apptForm) {
    apptForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Gather input values
      const name = apptForm.querySelector('#name').value;
      const phone = apptForm.querySelector('#phone').value;
      const email = apptForm.querySelector('#email').value || 'N/A';
      const branchVal = apptForm.querySelector('#branch').value;
      const date = apptForm.querySelector('#date').value;
      const message = apptForm.querySelector('#message').value || 'None';

      // Map treatment value to readable label
      const treatmentSelect = apptForm.querySelector('#treatment');
      const treatmentText = treatmentSelect.options[treatmentSelect.selectedIndex].text;

      // Define WhatsApp numbers (Format: country code + number, no +, no spaces)
      // For testing, route all submissions to the user's test number: +91 8767223224
      const whatsappNumber = '918767223224'; 
      const branchName = branchVal === 'solapur' ? 'Solapur Main Branch' : 'Akkalkot Branch';

      // Format the WhatsApp message (using bold markdown *text*)
      const messageText = 
`*New Appointment Request*
---------------------------------
*Name:* ${name}
*Phone:* ${phone}
*Email:* ${email}
*Branch:* ${branchName}
*Date:* ${date}
*Treatment:* ${treatmentText}
*Message:* ${message}
---------------------------------
_Submitted via website form_`;

      // URL encode the text
      const encodedText = encodeURIComponent(messageText);

      // Construct final WhatsApp link
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');

      // Display custom success card inline on the website
      apptForm.innerHTML = `
        <div class="form-success-message" style="text-align: center; padding: 2rem 0; animation: fadeInUp 0.6s ease forwards;">
          <div style="width: 4rem; height: 4rem; background: rgba(74, 144, 164, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto; color: var(--accent);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h3 class="display-heading display-sm" style="margin-bottom: 0.5rem; color: var(--black);">Redirecting to WhatsApp...</h3>
          <p class="body-md" style="color: var(--gray-muted); max-width: 28rem; margin: 0 auto 1.5rem auto;">
            Thank you, <strong>${name}</strong>. We have opened a WhatsApp chat with our clinic containing your appointment request. Please send the pre-filled message in WhatsApp to confirm your slot.
          </p>
          <button type="button" class="btn btn-outline" onclick="window.location.reload()" style="margin: 0 auto;">Book Another Slot</button>
        </div>
      `;
    });
  }

});
