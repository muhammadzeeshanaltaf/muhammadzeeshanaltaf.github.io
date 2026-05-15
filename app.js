/* ═══════════════════════════════════════════
   PORTFOLIO JS — Network Animation & Effects
   ═══════════════════════════════════════════ */

// ══════════════════════════════════════════
// NETWORK TOPOLOGY ANIMATION — Full Canvas
// ══════════════════════════════════════════
const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');
let nodes = [];
let connections = [];
let packets = [];
let mouse = { x: -1000, y: -1000 };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); initNetwork(); });

// Track mouse for interactive glow
canvas.parentElement.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Node types with different visual shapes
const NODE_TYPES = [
  { label: 'Router', shape: 'hexagon', color: '#c026d3', size: 18 },
  { label: 'Switch', shape: 'diamond', color: '#8b5cf6', size: 16 },
  { label: 'Server', shape: 'rect', color: '#f97316', size: 16 },
  { label: 'Azure VM', shape: 'hexagon', color: '#c026d3', size: 18 },
  { label: 'Firewall', shape: 'shield', color: '#fb7185', size: 17 },
  { label: 'VLAN', shape: 'diamond', color: '#8b5cf6', size: 14 },
  { label: 'Cloud', shape: 'circle', color: '#e879f9', size: 20 },
  { label: 'AP', shape: 'circle', color: '#f97316', size: 12 },
  { label: 'DNS', shape: 'rect', color: '#fbbf24', size: 14 },
  { label: 'Entra ID', shape: 'hexagon', color: '#c026d3', size: 16 },
  { label: 'OSPF', shape: 'diamond', color: '#8b5cf6', size: 14 },
  { label: 'DHCP', shape: 'rect', color: '#f97316', size: 14 },
  { label: 'LAN', shape: 'circle', color: '#e879f9', size: 12 },
  { label: 'WAN', shape: 'circle', color: '#fb7185', size: 12 },
];

class NetNode {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = (Math.random() - 0.5) * 0.25;
    this.type = type;
    this.pulse = Math.random() * Math.PI * 2;
    this.hover = 0;
  }

  update() {
    this.pulse += 0.025;
    this.x += this.vx;
    this.y += this.vy;

    // Soft boundary bounce
    const margin = 60;
    if (this.x < margin || this.x > canvas.width - margin) this.vx *= -1;
    if (this.y < margin || this.y > canvas.height - margin) this.vy *= -1;

    // Mouse proximity effect
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.hover = dist < 150 ? (1 - dist / 150) : 0;
  }

  draw() {
    const t = this.type;
    const pulseScale = 1 + Math.sin(this.pulse) * 0.08;
    const size = t.size * pulseScale + this.hover * 4;
    const glowAlpha = 0.3 + Math.sin(this.pulse) * 0.15 + this.hover * 0.3;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Outer glow ring
    const gradient = ctx.createRadialGradient(0, 0, size * 0.5, 0, 0, size * 2.5);
    gradient.addColorStop(0, t.color + hexAlpha(glowAlpha * 0.5));
    gradient.addColorStop(1, t.color + '00');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Shape
    ctx.fillStyle = t.color + hexAlpha(0.7 + this.hover * 0.3);
    ctx.strokeStyle = t.color + hexAlpha(0.9);
    ctx.lineWidth = 1.5;

    if (t.shape === 'hexagon') {
      drawHexagon(ctx, 0, 0, size * 0.65);
    } else if (t.shape === 'diamond') {
      drawDiamond(ctx, 0, 0, size * 0.6);
    } else if (t.shape === 'rect') {
      const s = size * 0.5;
      ctx.beginPath();
      roundRect(ctx, -s, -s * 0.7, s * 2, s * 1.4, 3);
      ctx.fill();
      ctx.stroke();
    } else if (t.shape === 'shield') {
      drawShield(ctx, 0, 0, size * 0.6);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Label
    const labelAlpha = 0.5 + this.hover * 0.5;
    ctx.font = `600 ${10 + this.hover * 2}px Inter, sans-serif`;
    ctx.fillStyle = t.color + hexAlpha(labelAlpha);
    ctx.textAlign = 'center';
    ctx.fillText(t.label, 0, size + 16);

    ctx.restore();
  }
}

function hexAlpha(a) {
  return Math.round(Math.min(1, Math.max(0, a)) * 255).toString(16).padStart(2, '0');
}

function drawHexagon(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawDiamond(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.75, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r * 0.75, cy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawShield(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.8, cy - r * 0.4);
  ctx.lineTo(cx + r * 0.8, cy + r * 0.2);
  ctx.quadraticCurveTo(cx, cy + r * 1.1, cx, cy + r);
  ctx.quadraticCurveTo(cx, cy + r * 1.1, cx - r * 0.8, cy + r * 0.2);
  ctx.lineTo(cx - r * 0.8, cy - r * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

class DataPacket {
  constructor(fromNode, toNode) {
    this.from = fromNode;
    this.to = toNode;
    this.progress = 0;
    this.speed = 0.006 + Math.random() * 0.006;
    this.color = fromNode.type.color;
    this.trail = [];
  }
  update() {
    this.progress += this.speed;
    const x = this.from.x + (this.to.x - this.from.x) * this.progress;
    const y = this.from.y + (this.to.y - this.from.y) * this.progress;
    this.trail.push({ x, y, alpha: 1 });
    if (this.trail.length > 20) this.trail.shift();
    this.trail.forEach(t => t.alpha *= 0.92);
    return this.progress < 1;
  }
  draw() {
    // Trail
    this.trail.forEach(t => {
      ctx.beginPath();
      ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = this.color + hexAlpha(t.alpha * 0.5);
      ctx.fill();
    });
    // Packet head
    const x = this.from.x + (this.to.x - this.from.x) * this.progress;
    const y = this.from.y + (this.to.y - this.from.y) * this.progress;
    // Bright core
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    // Colored glow
    const grd = ctx.createRadialGradient(x, y, 2, x, y, 14);
    grd.addColorStop(0, this.color + 'aa');
    grd.addColorStop(1, this.color + '00');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();
  }
}

const CONNECT_DIST = 250;

function initNetwork() {
  nodes = [];
  connections = [];
  packets = [];
  const count = Math.max(12, Math.floor((canvas.width * canvas.height) / 60000));
  for (let i = 0; i < count; i++) {
    const type = NODE_TYPES[Math.floor(Math.random() * NODE_TYPES.length)];
    const x = 80 + Math.random() * (canvas.width - 160);
    const y = 80 + Math.random() * (canvas.height - 160);
    nodes.push(new NetNode(x, y, type));
  }
}
initNetwork();

function drawGrid() {
  const spacing = 60;
  ctx.strokeStyle = 'rgba(192,38,211,0.02)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < canvas.width; x += spacing) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += spacing) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
}

function drawConnections() {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONNECT_DIST) {
        const alpha = 0.12 * (1 - dist / CONNECT_DIST);
        // Gradient line between the two node colors
        const grad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
        grad.addColorStop(0, nodes[i].type.color + hexAlpha(alpha));
        grad.addColorStop(1, nodes[j].type.color + hexAlpha(alpha));
        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }
}

function spawnPacket() {
  if (nodes.length < 2) return;
  const i = Math.floor(Math.random() * nodes.length);
  let closest = null, closestDist = CONNECT_DIST;
  for (let j = 0; j < nodes.length; j++) {
    if (j === i) continue;
    const dx = nodes[i].x - nodes[j].x;
    const dy = nodes[i].y - nodes[j].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < closestDist) { closestDist = dist; closest = j; }
  }
  if (closest !== null) {
    packets.push(new DataPacket(nodes[i], nodes[closest]));
  }
}

let frameCount = 0;
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawConnections();

  nodes.forEach(n => { n.update(); n.draw(); });

  // Spawn packets regularly
  frameCount++;
  if (frameCount % 40 === 0) spawnPacket();
  if (frameCount % 60 === 0) spawnPacket();

  packets = packets.filter(p => { const alive = p.update(); p.draw(); return alive; });

  requestAnimationFrame(animate);
}
animate();


// ══════════════════════════════════════════
// CURSOR GLOW
// ══════════════════════════════════════════
const glow = document.getElementById('cursorGlow');
document.addEventListener('mousemove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

// ══════════════════════════════════════════
// NAVBAR
// ══════════════════════════════════════════
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const icon = navToggle.querySelector('i');
  icon.className = navLinks.classList.contains('open') ? 'ri-close-line' : 'ri-menu-3-line';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.querySelector('i').className = 'ri-menu-3-line';
  });
});

// Active nav on scroll
const sections = document.querySelectorAll('section[id], .hero');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    if (window.scrollY >= top) current = sec.getAttribute('id') || 'home';
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ══════════════════════════════════════════
// SCROLL REVEAL
// ══════════════════════════════════════════
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ══════════════════════════════════════════
// COUNTER ANIMATION
// ══════════════════════════════════════════
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const isFloat = target % 1 !== 0;
      const start = performance.now();
      const duration = 2000;

      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = eased * target;
        el.textContent = (isFloat ? val.toFixed(1) : Math.floor(val)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));

// ══════════════════════════════════════════
// TYPING ANIMATION
// ══════════════════════════════════════════
const typingTarget = document.getElementById('typingTarget');
const phrases = [
  'Azure Administration • IT Support • Network Infrastructure • Security',
  'VM Provisioning • Entra ID • Wireless Deployments',
  'VLAN Configuration • OSPF Routing • Cloud Solutions',
];
let phraseIdx = 0, charIdx = 0, isDeleting = false;

function typeLoop() {
  const current = phrases[phraseIdx];
  if (!isDeleting) {
    typingTarget.textContent = current.substring(0, charIdx + 1);
    charIdx++;
    if (charIdx === current.length) {
      isDeleting = true;
      setTimeout(typeLoop, 2200);
      return;
    }
    setTimeout(typeLoop, 45);
  } else {
    typingTarget.textContent = current.substring(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      setTimeout(typeLoop, 400);
      return;
    }
    setTimeout(typeLoop, 25);
  }
}
setTimeout(typeLoop, 800);

// ══════════════════════════════════════════
// CONTACT FORM
// ══════════════════════════════════════════
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.innerHTML = '<i class="ri-check-line"></i> Message Sent!';
  btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
  setTimeout(() => {
    btn.innerHTML = '<i class="ri-send-plane-fill"></i> Send Message';
    btn.style.background = '';
    e.target.reset();
  }, 3000);
});

// ══════════════════════════════════════════
// PROFILE PHOTO FALLBACK
// ══════════════════════════════════════════
const heroPhoto = document.getElementById('heroPhoto');
if (heroPhoto) {
  heroPhoto.addEventListener('error', () => {
    const ring = heroPhoto.parentElement;
    ring.classList.add('no-image');
    heroPhoto.remove();
    ring.textContent = 'ZA';
  });
}
