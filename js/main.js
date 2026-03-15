(function() {

  var SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$&';
  var cursorDot, cursorRing, ringX = 0, ringY = 0, dotX = 0, dotY = 0;

  function scrambleText(el, finalText, durationMs) {
    var totalFrames = 55;
    var frame = 0;
    var id = setInterval(function() {
      el.textContent = finalText.split('').map(function(ch, i) {
        if (ch === ' ' || ch === '.') return ch;
        if (frame / totalFrames > i / finalText.length) return ch;
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }).join('');
      frame++;
      if (frame > totalFrames) {
        clearInterval(id);
        el.textContent = finalText;
      }
    }, durationMs / totalFrames);
  }

  var bootLines = [
    { id: 'bl1', text: 'SYS/BOOT_' },
    { id: 'bl2', text: 'LOADING HARVEY A. PORTFOLIO' },
    { id: 'bl3', text: 'VERSION 2026.1 / GAME & SYSTEMS DEVELOPER' },
    { id: 'bl4', text: 'STATUS: AVAILABLE FOR HIRE / PART-TIME OK' },
    { id: 'bl5', text: 'READY_' }
  ];

  function runBoot() {
    var delay = 0;
    bootLines.forEach(function(line, i) {
      var el = document.getElementById(line.id);
      if (!el) return;
      el.textContent = line.text;
      setTimeout(function() {
        el.classList.add('typing');
      }, delay);
      delay += 280;
    });
    setTimeout(function() {
      var boot = document.getElementById('boot');
      var main = document.getElementById('main-content');
      if (boot) boot.classList.add('done');
      if (main) {
        main.classList.add('visible');
        var scrambleEl = document.getElementById('scramble-target');
        if (scrambleEl) {
          var finalText = scrambleEl.dataset.final || scrambleEl.textContent;
          scrambleText(scrambleEl, finalText, 900);
        }
      }
      initEverything();
    }, delay + 400);
  }

  function initCursor() {
    cursorDot  = document.getElementById('cursor-dot');
    cursorRing = document.getElementById('cursor-ring');
    if (!cursorDot || !cursorRing) return;

    document.addEventListener('mousemove', function(e) {
      dotX = e.clientX;
      dotY = e.clientY;
      cursorDot.style.left = dotX + 'px';
      cursorDot.style.top  = dotY + 'px';
    });

    (function animRing() {
      ringX += (dotX - ringX) * 0.14;
      ringY += (dotY - ringY) * 0.14;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top  = ringY + 'px';
      requestAnimationFrame(animRing);
    })();

    var hoverEls = document.querySelectorAll('a, button, .gm-item, .ide-tab, .cta-primary, .cta-secondary, .discord-btn, .lb-close, .sidebar-dot');
    hoverEls.forEach(function(el) {
      el.addEventListener('mouseenter', function() { document.body.classList.add('cursor-hover'); });
      el.addEventListener('mouseleave', function() { document.body.classList.remove('cursor-hover'); });
    });
  }

  function initScrollProgress() {
    var bar = document.getElementById('progress-bar');
    if (!bar) return;
    function update() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docH = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var pct = docH > 0 ? (scrollTop / docH) * 100 : 0;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function initSidebarNav() {
    var dots = document.querySelectorAll('.sidebar-dot');
    var sections = [];
    dots.forEach(function(dot) {
      var href = dot.getAttribute('href');
      if (!href) return;
      var id = href.replace('#', '');
      var el = document.getElementById(id);
      if (el) sections.push({ dot: dot, el: el });
    });
    if (!sections.length) return;

    function update() {
      var scrollY = window.scrollY + window.innerHeight * 0.4;
      var active = sections[0];
      sections.forEach(function(s) {
        if (s.el.offsetTop <= scrollY) active = s;
      });
      dots.forEach(function(d) { d.classList.remove('active'); });
      if (active) active.dot.classList.add('active');
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function initHudSection() {
    var hudSection = document.getElementById('hud-section');
    if (!hudSection) return;
    var sections = document.querySelectorAll('section[data-section]');
    var entries = [];
    sections.forEach(function(s) {
      entries.push({ el: s, label: s.dataset.section });
    });
    if (!entries.length) return;

    function update() {
      var scrollY = window.scrollY + window.innerHeight * 0.4;
      var current = 'HOME';
      entries.forEach(function(e) {
        if (e.el.offsetTop <= scrollY) current = e.label;
      });
      hudSection.textContent = current;
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function initScrollReveal() {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    var targets = document.querySelectorAll('.skill-block, .gm-item, .vr-card, .exp-item, .reveal, .site-meta');
    targets.forEach(function(el) { obs.observe(el); });
  }

  function initSkillBars() {
    var barObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var fill = entry.target.querySelector('.skill-bar-fill');
        if (fill && fill.dataset.pct) {
          fill.style.width = fill.dataset.pct + '%';
        }
        barObs.unobserve(entry.target);
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.skill-block').forEach(function(el) {
      barObs.observe(el);
    });
  }

  function switchTab(group, pane, btn) {
    var allTabs  = document.querySelectorAll('#' + group + '-tabs .ide-tab');
    var allPanes = document.querySelectorAll('[id^="' + group + '-"]');

    allTabs.forEach(function(t) { t.classList.remove('active'); });
    allPanes.forEach(function(p) { p.classList.remove('active'); });

    if (btn) btn.classList.add('active');

    var target = document.getElementById(group + '-' + pane);
    if (target) {
      target.classList.add('active');
      target.querySelectorAll('pre code').forEach(function(block) {
        if (!block.dataset.highlighted) {
          hljs.highlightElement(block);
          block.dataset.highlighted = 'yes';
        }
      });
    }
  }

  function openLightbox(src, label) {
    var lb    = document.getElementById('lightbox');
    var img   = document.getElementById('lb-img');
    var lbl   = document.getElementById('lb-label');
    if (!lb || !img) return;
    img.src = src;
    if (lbl) lbl.textContent = label || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    var lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  function initLightbox() {
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  function initHighlight() {
    if (typeof hljs === 'undefined') return;
    document.querySelectorAll('.ide-pane.active pre code').forEach(function(block) {
      hljs.highlightElement(block);
      block.dataset.highlighted = 'yes';
    });
  }

  function initEverything() {
    initCursor();
    initScrollProgress();
    initSidebarNav();
    initHudSection();
    initScrollReveal();
    initSkillBars();
    initLightbox();
    initHighlight();
  }

  window.switchTab    = switchTab;
  window.openLightbox = openLightbox;
  window.closeLightbox = closeLightbox;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runBoot);
  } else {
    runBoot();
  }

})();
