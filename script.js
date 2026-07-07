/* ============================================
   MOBILE NAV TOGGLE
   ============================================ */
const navEl = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = navEl.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navEl.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ============================================
   AMBIENT CURSOR GLOW (desktop only)
   ============================================ */
if (window.matchMedia('(min-width: 781px)').matches && !reduceMotionPref()) {
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  let gx = window.innerWidth / 2, gy = window.innerHeight / 2;
  let cx = gx, cy = gy;
  window.addEventListener('mousemove', (e) => { gx = e.clientX; gy = e.clientY; });
  function animateGlow() {
    cx += (gx - cx) * 0.12;
    cy += (gy - cy) * 0.12;
    glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
}

function reduceMotionPref() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ============================================
   SCROLL REVEALS
   ============================================ */
const revealTargets = document.querySelectorAll('.reveal, .reveal-item');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        const siblings = entry.target.parentElement ? Array.from(entry.target.parentElement.children) : [];
        const posIndex = siblings.indexOf(entry.target);
        if (entry.target.classList.contains('reveal-item') && posIndex >= 0) {
          entry.target.style.setProperty('--reveal-delay', `${Math.min(posIndex, 5) * 0.08}s`);
        }
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach(el => io.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('in-view'));
}

/* ============================================
   ANIMATED STAT COUNTERS
   ============================================ */
const statEls = document.querySelectorAll('.stat-number');
if (statEls.length && 'IntersectionObserver' in window) {
  const statIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statEls.forEach(el => statIO.observe(el));
}

function animateCount(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 1200;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ============================================
   TILT CARDS
   ============================================ */
if (window.matchMedia('(min-width: 781px)').matches && !reduceMotionPref()) {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(700px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
}

/* ============================================
   ACTIVE NAV LINK ON SCROLL
   ============================================ */
const navLinkEls = document.querySelectorAll('.nav-links a');
const sectionEls = Array.from(navLinkEls)
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

if (sectionEls.length && 'IntersectionObserver' in window) {
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navLinkEls.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
      }
    });
  }, { threshold: 0, rootMargin: '-45% 0px -50% 0px' });
  sectionEls.forEach(sec => navIO.observe(sec));
}

/* ============================================
   HERO CANVAS — GRADIENT DESCENT TO THE MINIMUM
   A convex bowl (contour plot) with a point descending
   to the global minimum, echoing the convergence proof
   in the ConvexLDA objective.
   ============================================ */
const canvas = document.getElementById('descentCanvas');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas) {
  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let minX, minY; // location of the minimum, in canvas coords

  // Convex bowl function coefficients (in a normalized -1..1 space)
  const A = 1.0;
  const B = 1.6;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    minX = width * 0.68;
    minY = height * 0.42;
  }

  function toNorm(px, py) {
    // map canvas px to normalized coords centered at the minimum
    const scale = Math.min(width, height) * 0.9;
    return [(px - minX) / scale, (py - minY) / scale];
  }

  function f(nx, ny) {
    return A * nx * nx + B * ny * ny;
  }

  function drawContours() {
    ctx.clearRect(0, 0, width, height);
    const levels = [0.02, 0.05, 0.09, 0.14, 0.2, 0.27, 0.35, 0.44, 0.54];
    const scale = Math.min(width, height) * 0.9;

    levels.forEach((level, i) => {
      const rx = Math.sqrt(level / A) * scale;
      const ry = Math.sqrt(level / B) * scale;
      ctx.beginPath();
      ctx.ellipse(minX, minY, rx, ry, 0, 0, Math.PI * 2);
      const alpha = 0.10 - i * 0.006;
      ctx.strokeStyle = `rgba(201, 162, 39, ${Math.max(alpha, 0.02)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // minimum marker
    ctx.beginPath();
    ctx.arc(minX, minY, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(178, 62, 38, 0.9)';
    ctx.fill();
  }

  function computePath() {
    // random start point in normalized space, biased to upper-left
    const startNx = -0.9 - Math.random() * 0.5;
    const startNy = -0.55 - Math.random() * 0.5;
    let nx = startNx, ny = startNy;
    const path = [];
    const lr = 0.28;
    for (let i = 0; i < 90; i++) {
      path.push([nx, ny]);
      const gx = 2 * A * nx;
      const gy = 2 * B * ny;
      nx -= lr * gx;
      ny -= lr * gy;
      if (Math.abs(nx) < 0.004 && Math.abs(ny) < 0.004) break;
    }
    path.push([0, 0]);
    return path;
  }

  function normToPx([nx, ny]) {
    const scale = Math.min(width, height) * 0.9;
    return [minX + nx * scale, minY + ny * scale];
  }

  let path = [];
  let step = 0;
  let pauseFrames = 0;

  function drawPathTrail(upTo) {
    if (upTo < 2) return;
    ctx.beginPath();
    for (let i = 0; i < upTo; i++) {
      const [px, py] = normToPx(path[i]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawDot(pos) {
    const [px, py] = normToPx(pos);
    const grad = ctx.createRadialGradient(px, py, 0, px, py, 14);
    grad.addColorStop(0, 'rgba(201, 162, 39, 0.9)');
    grad.addColorStop(1, 'rgba(201, 162, 39, 0)');
    ctx.beginPath();
    ctx.arc(px, py, 14, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#D9B23C';
    ctx.fill();
  }

  function frame() {
    drawContours();

    if (step < path.length) {
      drawPathTrail(step);
      drawDot(path[step]);
      step += 1;
    } else if (pauseFrames < 70) {
      drawPathTrail(path.length);
      drawDot(path[path.length - 1]);
      pauseFrames += 1;
    } else {
      path = computePath();
      step = 0;
      pauseFrames = 0;
    }

    requestAnimationFrame(frame);
  }

  function staticFrame() {
    // reduced-motion: draw contours and dot already at the minimum, no animation loop
    drawContours();
    drawDot([0, 0]);
  }

  window.addEventListener('resize', () => {
    resize();
  });

  resize();

  if (reduceMotion) {
    staticFrame();
  } else {
    path = computePath();
    frame();
  }
}
