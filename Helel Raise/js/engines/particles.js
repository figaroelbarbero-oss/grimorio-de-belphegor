// ====== PARTICLE CANVAS ======
var particleCanvas = document.getElementById('particle-canvas');
var ctx = particleCanvas.getContext('2d');
var particles = [];
var bloodDrops = [];

function resizeCanvas() {
  particleCanvas.width = window.innerWidth;
  particleCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * particleCanvas.width;
    this.y = Math.random() * particleCanvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedY = -Math.random() * 0.5 - 0.1;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.7 ? '139,0,0' : '80,20,20';
  }
  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.opacity -= 0.001;
    if (this.y < 0 || this.opacity <= 0) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
    ctx.fill();
    // Glow via larger transparent circle (cheaper than shadowBlur per frame)
    if (this.opacity > 0.2) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.opacity * 0.12})`;
      ctx.fill();
    }
  }
}

class BloodDrop {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * particleCanvas.width;
    this.y = -10;
    this.size = Math.random() * 3 + 1;
    this.speed = Math.random() * 2 + 1;
    this.opacity = Math.random() * 0.3 + 0.1;
  }
  update() {
    this.y += this.speed;
    this.speed += 0.02;
    if (this.y > particleCanvas.height) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size * 0.6, this.size, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(120,0,0,${this.opacity})`;
    ctx.fill();
  }
}

for (let i = 0; i < 60; i++) particles.push(new Particle());
for (let i = 0; i < 15; i++) bloodDrops.push(new BloodDrop());

function animateParticles() {
  ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

  // Fog effect
  ctx.fillStyle = 'rgba(5,2,8,0.02)';
  ctx.fillRect(0, 0, particleCanvas.width, particleCanvas.height);

  particles.forEach(p => { p.update(); p.draw(); });
  bloodDrops.forEach(d => { d.update(); d.draw(); });

  requestAnimationFrame(animateParticles);
}
animateParticles();

