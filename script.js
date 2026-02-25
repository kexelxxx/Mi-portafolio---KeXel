// ===== SCROLL REVEAL =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.t-item').forEach(el => observer.observe(el));

// ===== SKILL BARS =====
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const card = entry.target;
      const level = card.dataset.level;
      const bar = card.querySelector('.bar');
      if (bar) bar.style.width = level + '%';
      barObserver.unobserve(card);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.lang-card').forEach(el => barObserver.observe(el));

// ===== SVG LINE CHART =====
const chartData = [
  { year: '2021', value: 10 },
  { year: '2022', value: 28 },
  { year: '2023', value: 50 },
  { year: '2024', value: 70 },
  { year: '2025', value: 88 },
  { year: '2026', value: 100 },
];

function buildChart() {
  const svg = document.getElementById('chart');
  if (!svg) return;

  const W = 460, H = 130;
  const padL = 4, padR = 4, padT = 8, padB = 14;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const pts = chartData.map((d, i) => ({
    x: padL + (i / (chartData.length - 1)) * chartW,
    y: padT + chartH - (d.value / 100) * chartH
  }));

  // Smooth curve (catmull-rom)
  function crPath(points) {
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }

  const lineDef = crPath(pts);
  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];
  const fillDef = lineDef + ` L ${lastPt.x} ${padT + chartH} L ${firstPt.x} ${padT + chartH} Z`;

  document.getElementById('chartFill').setAttribute('d', fillDef);

  const lineEl = document.getElementById('chartLine');
  lineEl.setAttribute('d', lineDef);

  // Animate the line draw
  const length = lineEl.getTotalLength ? lineEl.getTotalLength() : 600;
  lineEl.style.strokeDasharray = length;
  lineEl.style.strokeDashoffset = length;
  lineEl.style.transition = 'none';

  // Dots
  const dotsG = document.getElementById('chartDots');
  pts.forEach((pt, i) => {
    const ns = 'http://www.w3.org/2000/svg';
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', pt.x);
    c.setAttribute('cy', pt.y);
    c.setAttribute('r', '3.5');
    c.setAttribute('fill', '#4f8ef7');
    c.setAttribute('stroke', '#0f1117');
    c.setAttribute('stroke-width', '2');
    c.style.opacity = '0';
    c.style.transition = `opacity 0.3s ${0.2 + i * 0.3}s`;
    dotsG.appendChild(c);
  });

  // Trigger animation when chart enters viewport
  const chartObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        requestAnimationFrame(() => {
          lineEl.style.transition = `stroke-dashoffset 1.8s cubic-bezier(0.4,0,0.2,1)`;
          lineEl.style.strokeDashoffset = '0';
          dotsG.querySelectorAll('circle').forEach(c => c.style.opacity = '1');
        });
        chartObs.disconnect();
      }
    });
  }, { threshold: 0.2 });

  chartObs.observe(svg);
}

buildChart();

// ===== SMOOTH NAV HIGHLIGHT =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObs.observe(s));
