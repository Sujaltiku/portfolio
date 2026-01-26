// ==================================
// ELASTIC GRID NETWORK BACKGROUND
// ==================================

const canvas = document.getElementById('particleCanvas');
const ctx = canvas?.getContext('2d');

let points = [];
let mouseX = -1000;
let mouseY = -1000;
const config = {
  spacing: 40,
  baseSize: 2,
  influence: 150,
  force: 0.6,
  damping: 0.9,
  tension: 0.05,
  color: '99, 102, 241' // Default Indigo-500 equivalent
};

class Point {
  constructor(x, y) {
    this.originX = x;
    this.originY = y;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
  }

  update() {
    // Mouse repulsion / Physics
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < config.influence) {
      const angle = Math.atan2(dy, dx);
      const f = (config.influence - distance) / config.influence;
      this.vx -= Math.cos(angle) * f * config.force;
      this.vy -= Math.sin(angle) * f * config.force;
    }

    // Ambient random movement (Breathing effect)
    // Add small noise to origin to make grid drift slightly
    const time = Date.now() * 0.001;
    const driftX = Math.sin(time + this.originY * 0.05) * 5;
    const driftY = Math.cos(time + this.originX * 0.05) * 5;

    // Spring back to (origin + drift)
    const ox = (this.originX + driftX) - this.x;
    const oy = (this.originY + driftY) - this.y;
    this.vx += ox * config.tension;
    this.vy += oy * config.tension;

    // Apply damping
    this.vx *= config.damping;
    this.vy *= config.damping;

    // Move
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx, color) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, config.baseSize, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color}, 0.5)`; // Slightly more transparent
    ctx.fill();
  }
}

function initGrid() {
  if (!canvas) return;
  points = [];
  // Use config.spacing but ensure we cover full screen
  const cols = Math.ceil(canvas.width / config.spacing) + 2;
  const rows = Math.ceil(canvas.height / config.spacing) + 2;

  const startX = -config.spacing;
  const startY = -config.spacing;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = startX + i * config.spacing;
      const y = startY + j * config.spacing;
      points.push(new Point(x, y));
    }
  }
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initGrid();
}

function animate() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Determine color based on theme (naive check or default)
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  // Use CSS variable-like colors: Blue for Light, Lighter Blue for Dark
  const rgbColor = isDark ? '96, 165, 250' : '59, 130, 246';

  // Update and draw points
  points.forEach(p => {
    p.update();
    p.draw(ctx, rgbColor);
  });

  // Draw connecting lines for a "mesh" feel
  ctx.beginPath();
  points.forEach((p, i) => {
    // Only connect if visible on screen (optimization)
    if (p.x < -50 || p.x > canvas.width + 50 || p.y < -50 || p.y > canvas.height + 50) return;

    // Connect to right neighbor
    const rightNeighbor = points.find(n => Math.abs(n.originX - (p.originX + config.spacing)) < 1 && Math.abs(n.originY - p.originY) < 1);
    if (rightNeighbor) {
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(rightNeighbor.x, rightNeighbor.y);
    }
    // Connect to bottom neighbor
    const bottomNeighbor = points.find(n => Math.abs(n.originX - p.originX) < 1 && Math.abs(n.originY - (p.originY + config.spacing)) < 1);
    if (bottomNeighbor) {
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(bottomNeighbor.x, bottomNeighbor.y);
    }
  });

  ctx.strokeStyle = `rgba(${rgbColor}, 0.12)`;
  ctx.lineWidth = 1;
  ctx.stroke();

  requestAnimationFrame(animate);
}

if (canvas) {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  animate();

  window.addEventListener('mousemove', (e) => {
    // No need to account for canvas offset if it's fixed full screen
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.body.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
  });
}

// ==================================
// MOBILE NAV
// ==================================

const toggle = document.querySelector(".nav-toggle");
const menu = document.querySelector("#nav-menu");

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    menu.classList.toggle("show");
  });

  menu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      menu.classList.remove("show");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ==================================
// FOOTER YEAR
// ==================================

document.querySelector("#year").textContent = new Date().getFullYear();

// ==================================
// ROLE ROTATOR
// ==================================

const roles = ["Web Developer", "Frontend Developer", "UI Builder", "Student Developer"];
let idx = 0;
setInterval(() => {
  const el = document.querySelector("#roleText");
  if (!el) return;
  idx = (idx + 1) % roles.length;
  el.textContent = roles[idx];
}, 2200);

// ==================================
// PROJECT SEARCH + FILTER
// ==================================

const search = document.querySelector("#projectSearch");
const filter = document.querySelector("#projectFilter");
const grid = document.querySelector("#projectGrid");

function applyProjectFilters() {
  if (!grid) return;
  const q = (search?.value || "").trim().toLowerCase();
  const f = filter?.value || "all";

  grid.querySelectorAll(".project").forEach(card => {
    const text = card.innerText.toLowerCase();
    const tags = (card.getAttribute("data-tags") || "").toLowerCase().split(" ");
    const okText = !q || text.includes(q);
    const okTag = f === "all" || tags.includes(f);
    card.style.display = (okText && okTag) ? "" : "none";
  });
}

search?.addEventListener("input", applyProjectFilters);
filter?.addEventListener("change", applyProjectFilters);

// ==================================
// EMAILJS CONTACT FORM
// ==================================

// Initialize EmailJS - REPLACE WITH YOUR PUBLIC KEY
emailjs.init("OePxvFB6x_yh3Mg1e");

const form = document.querySelector("#contactForm");
const statusEl = document.querySelector("#formStatus");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(form);
  const name = String(fd.get("name") || "").trim();
  const email = String(fd.get("email") || "").trim();
  const message = String(fd.get("message") || "").trim();

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Validation
  if (!name || !email || !message) {
    statusEl.textContent = "Please fill all fields.";
    statusEl.style.color = "#ef4444";
    return;
  }
  if (!validEmail) {
    statusEl.textContent = "Please enter a valid email address.";
    statusEl.style.color = "#ef4444";
    return;
  }

  // Show loading state
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Sending...";
  submitBtn.disabled = true;
  statusEl.textContent = "";

  try {
    // Send email via EmailJS
    await emailjs.send("service_e6prmaf", "template_2ryv7ne", {
      from_name: name,
      from_email: email,
      message: message,
      to_name: "Sujal",
      reply_to: email
    });

    statusEl.textContent = "Message sent successfully! I'll get back to you soon.";
    statusEl.style.color = "#22c55e";
    form.reset();
  } catch (error) {
    console.error("EmailJS error:", error);
    statusEl.textContent = "❌ Failed to send message. Please try again or email me directly.";
    statusEl.style.color = "#ef4444";
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});