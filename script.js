/* ============================================
   XAMELEON — Скрипты анимаций
   1) Бокэ фон (bokeh canvas)
   2) Лепестки роз у курсора
   3) Scroll-анимации карточек
   4) Навбар при скролле
   ============================================ */

// ===========================
// 1. БОКЭ ФОН (Bokeh)
// ===========================
(function () {
    const canvas = document.getElementById('wavesCanvas');
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
    }
    window.addEventListener('resize', resize);
    resize();

    const bokehColors = [
        { r: 140, g: 40, b: 70 },
        { r: 100, g: 55, b: 90 },
        { r: 198, g: 168, b: 124 },
        { r: 201, g: 24, b: 74 },
        { r: 80, g: 25, b: 50 },
        { r: 60, g: 40, b: 55 },
        { r: 150, g: 80, b: 100 },
    ];

    let mouseX = W / 2, mouseY = H / 2;
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    class BokehOrb {
        constructor() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.radius = Math.random() * 120 + 40;
            this.baseRadius = this.radius;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.2 + 0.1;
            this.baseOpacity = this.opacity;
            const c = bokehColors[Math.floor(Math.random() * bokehColors.length)];
            this.r = c.r; this.g = c.g; this.b = c.b;
            this.phase = Math.random() * Math.PI * 2;
            this.pulseSpeed = Math.random() * 0.008 + 0.003;
        }

        update(time) {
            this.x += this.vx;
            this.y += this.vy;
            const pulse = Math.sin(time * this.pulseSpeed + this.phase);
            this.radius = this.baseRadius + pulse * 15;
            this.opacity = this.baseOpacity + pulse * 0.08;

            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 400) {
                const push = (1 - dist / 400) * 0.2;
                this.x -= dx * push * 0.01;
                this.y -= dy * push * 0.01;
                this.opacity = Math.min(this.opacity + (1 - dist / 400) * 0.08, 0.35);
            }

            if (this.x < -this.radius * 2) this.x = W + this.radius;
            if (this.x > W + this.radius * 2) this.x = -this.radius;
            if (this.y < -this.radius * 2) this.y = H + this.radius;
            if (this.y > H + this.radius * 2) this.y = -this.radius;
        }

        draw(ctx) {
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            grad.addColorStop(0, `rgba(${this.r}, ${this.g}, ${this.b}, ${this.opacity})`);
            grad.addColorStop(0.5, `rgba(${this.r}, ${this.g}, ${this.b}, ${this.opacity * 0.4})`);
            grad.addColorStop(1, `rgba(${this.r}, ${this.g}, ${this.b}, 0)`);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }
    }

    const orbs = [];
    const count = Math.min(25, Math.max(15, Math.floor(W * H / 60000)));
    for (let i = 0; i < count; i++) orbs.push(new BokehOrb());

    let time = 0;
    function animate() {
        ctx.clearRect(0, 0, W, H);
        time++;
        for (const orb of orbs) {
            orb.update(time);
            orb.draw(ctx);
        }
        requestAnimationFrame(animate);
    }
    animate();
})();


// ===========================
// 2. ЛЕПЕСТКИ РОЗ
// ===========================
(function () {
    const canvas = document.getElementById('petalsCanvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];

    const petalColors = [
        'rgba(201, 24, 74, ',
        'rgba(255, 179, 198, ',
        'rgba(160, 19, 59, ',
        'rgba(255, 230, 235, '
    ];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    class Petal {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = (Math.random() - 0.5) * 4 + 1;
            this.size = Math.random() * 8 + 4;
            this.life = 1;
            this.decay = Math.random() * 0.02 + 0.01;
            this.colorBase = petalColors[Math.floor(Math.random() * petalColors.length)];
            this.angle = Math.random() * Math.PI * 2;
            this.angularVel = (Math.random() - 0.5) * 0.2;
            this.scaleY = Math.random() * 0.5 + 0.5;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.98;
            this.vy += 0.05;
            this.angle += this.angularVel;
            this.life -= this.decay;
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.scale(1, this.scaleY);
            ctx.fillStyle = this.colorBase + this.life + ')';
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.bezierCurveTo(this.size, -this.size, this.size, this.size, 0, this.size);
            ctx.bezierCurveTo(-this.size, this.size, -this.size, -this.size, 0, -this.size);
            ctx.fill();
            ctx.restore();
        }
    }

    window.addEventListener('mousemove', (e) => {
        const count = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;
            particles.push(new Petal(e.clientX + offsetX, e.clientY + offsetY));
        }
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw(ctx);
            if (p.life <= 0 || p.y > height + 20 || p.x < -20 || p.x > width + 20) {
                particles.splice(i, 1);
            }
        }
        requestAnimationFrame(animate);
    }

    animate();
})();


// ===========================
// 3. SCROLL-АНИМАЦИЯ КАРТОЧЕК
// ===========================
(function () {
    const cards = document.querySelectorAll('.anim-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    cards.forEach(card => observer.observe(card));
})();


// ===========================
// 4. НАВБАР ПРИ СКРОЛЛЕ
// ===========================
(function () {
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(13, 9, 10, 0.9)';
            nav.style.padding = '1rem 5%';
            nav.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
        } else {
            nav.style.background = 'rgba(13, 9, 10, 0.5)';
            nav.style.padding = '1.5rem 5%';
            nav.style.boxShadow = 'none';
        }
    });
})();
