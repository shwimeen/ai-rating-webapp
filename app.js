const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Apply Telegram theme background subtly if available (falls back to CSS gradient)
try { tg.setHeaderColor && tg.setHeaderColor("secondary_bg_color"); } catch(e) {}

function haptic(type) {
    try {
        if (type === "success" || type === "error" || type === "warning") {
            tg.HapticFeedback.notificationOccurred(type);
        } else {
            tg.HapticFeedback.impactOccurred(type || "light");
        }
    } catch (e) {}
}

/* ---------------- Segmented mode control ---------------- */
const modeGroup = document.getElementById("mode-group");
const modeInput = document.getElementById("mode");

modeGroup.addEventListener("click", (e) => {
    const btn = e.target.closest(".seg");
    if (!btn) return;
    modeGroup.querySelectorAll(".seg").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    modeInput.value = btn.dataset.value;
    haptic("light");
});

/* ---------------- Photo upload + tilt effect ---------------- */
const photoInput = document.getElementById("photo");
const preview = document.getElementById("preview");
const photoBox = document.getElementById("photo-box");
const photoText = document.getElementById("photo-text");

photoInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
        photoText.innerHTML = `<span class="photo-icon">✅</span><span>Фото загружено</span>`;
        photoBox.classList.add("loaded");
        haptic("medium");
    }
});

// Subtle tilt/parallax on the preview image following pointer
photoBox.addEventListener("pointermove", (e) => {
    if (!photoBox.classList.contains("loaded")) return;
    const rect = photoBox.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    preview.style.transform = `scale(1.04) translate(${x * 10}px, ${y * 10}px)`;
});

photoBox.addEventListener("pointerleave", () => {
    preview.style.transform = "scale(1) translate(0,0)";
});

/* ---------------- Button ripple effect ---------------- */
const analyzeBtn = document.getElementById("analyze-btn");

analyzeBtn.addEventListener("pointerdown", function (e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
    ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
});

/* ---------------- Toast helper ---------------- */
function showToast(msg) {
    let toast = document.querySelector(".toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    requestAnimationFrame(() => toast.classList.add("show"));
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------------- Rotating "thinking" phrases ---------------- */
const thinkingPhrases = [
    "🔍 Изучаем изображение...",
    "🧠 Анализируем черты лица...",
    "📐 Считаем пропорции...",
    "💫 Оцениваем стиль...",
    "✍️ Формируем вывод..."
];

let thinkingTimer = null;

function startThinkingRotation() {
    let i = 0;
    const el = document.getElementById("ai-text");
    thinkingTimer = setInterval(() => {
        i = (i + 1) % thinkingPhrases.length;
        if (el) {
            el.style.opacity = 0;
            setTimeout(() => {
                el.textContent = thinkingPhrases[i];
                el.style.opacity = .65;
            }, 250);
        }
    }, 1400);
}

function stopThinkingRotation() {
    clearInterval(thinkingTimer);
}

/* ---------------- Count-up animation ---------------- */
function animateCount(el, target, duration = 1200) {
    const start = performance.now();
    function frame(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const value = (target * eased).toFixed(1);
        el.textContent = value;
        if (progress < 1) requestAnimationFrame(frame);
        else el.textContent = target.toFixed(1);
    }
    requestAnimationFrame(frame);
}

/* ---------------- Lightweight confetti ---------------- */
const confettiCanvas = document.getElementById("confetti");
const ctx = confettiCanvas.getContext("2d");
let confettiParticles = [];
let confettiAnimId = null;

function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function launchConfetti() {
    const colors = ["#8b5cf6", "#ec4899", "#ffffff", "#c4b5fd"];
    confettiParticles = Array.from({ length: 90 }, () => ({
        x: confettiCanvas.width / 2,
        y: confettiCanvas.height * 0.35,
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -14 - 4,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12,
        gravity: 0.35 + Math.random() * 0.15,
        life: 0
    }));

    cancelAnimationFrame(confettiAnimId);
    const tick = () => {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        let alive = false;
        confettiParticles.forEach(p => {
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.vr;
            p.life++;
            if (p.y < confettiCanvas.height + 20 && p.life < 260) {
                alive = true;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, 1 - p.life / 260);
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                ctx.restore();
            }
        });
        if (alive) {
            confettiAnimId = requestAnimationFrame(tick);
        } else {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
    };
    tick();
}

/* ---------------- Face scan overlay animation ---------------- */
const scanOverlay = document.getElementById("scan-overlay");
const scanDotsWrap = document.getElementById("scan-dots");
const scanStatusEl = document.getElementById("scan-status");

const scanStatusPhases = [
    "Поиск лица...",
    "Лицо обнаружено ✅",
    "Разметка точек...",
    "Анализ пропорций..."
];

function playScanAnimation(duration = 2200) {
    return new Promise((resolve) => {
        scanDotsWrap.innerHTML = "";
        scanOverlay.classList.add("active");

        // Scatter random "landmark" dots inside the frame, staggered
        const dotCount = 14;
        for (let i = 0; i < dotCount; i++) {
            const dot = document.createElement("div");
            dot.className = "scan-dot";
            const x = 20 + Math.random() * 60; // % within frame, avoiding edges
            const y = 20 + Math.random() * 60;
            dot.style.left = x + "%";
            dot.style.top = y + "%";
            dot.style.animationDelay = (i * 0.07) + "s";
            scanDotsWrap.appendChild(dot);
        }

        // Cycle status text
        let phase = 0;
        scanStatusEl.textContent = scanStatusPhases[0];
        haptic("light");
        const statusInterval = setInterval(() => {
            phase = (phase + 1) % scanStatusPhases.length;
            scanStatusEl.textContent = scanStatusPhases[phase];
            haptic("light");
        }, duration / scanStatusPhases.length);

        setTimeout(() => {
            clearInterval(statusInterval);
            scanOverlay.classList.remove("active");
            haptic("success");
            resolve();
        }, duration);
    });
}

/* ---------------- Main analyze flow ---------------- */
async function analyze() {
    const file = document.getElementById("photo").files[0];

    if (!file) {
        haptic("error");
        showToast("📸 Сначала выберите фото");
        return;
    }

    haptic("medium");
    analyzeBtn.classList.add("loading");

    // Play the face-scan animation over the photo first
    await playScanAnimation();

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("mode", modeInput.value);
    formData.append("age", document.getElementById("age").value);
    formData.append("height", document.getElementById("height").value);
    formData.append("weight", document.getElementById("weight").value);

    const resultEl = document.getElementById("result");
    resultEl.innerHTML = `
<div class="loading">
    <div class="skeleton-ring"></div>
    <h3>✨ AI анализирует</h3>
    <p id="ai-text">🔍 Изучаем изображение...</p>
    <div class="skeleton-line w1"></div>
    <div class="skeleton-line w2"></div>
    <div class="skeleton-line w3"></div>
</div>`;
    startThinkingRotation();

    let response;
    try {
        response = await fetch("https://ai-rating-backend-2.onrender.com/analyze", {
            method: "POST",
            body: formData
        });
    } catch (err) {
        stopThinkingRotation();
        analyzeBtn.classList.remove("loading");
        haptic("error");
        resultEl.innerHTML = `<div class="result-wrap">❌ Не удалось связаться с сервером</div>`;
        return;
    }

    stopThinkingRotation();
    analyzeBtn.classList.remove("loading");

    if (!response.ok) {
        haptic("error");
        resultEl.innerHTML = `<div class="result-wrap">❌ Ошибка сервера</div>`;
        return;
    }

    const data = await response.json();
    const rating = Number(data.rating) || 0;
    const circumference = 314; // 2 * PI * r(50)
    const offset = circumference - (rating / 10) * circumference;

    resultEl.innerHTML = `
<div class="result-wrap">

    <div class="score">
        <div class="score-ring-wrap">
            <svg viewBox="0 0 120 120">
                <defs>
                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#8b5cf6"/>
                        <stop offset="100%" stop-color="#ec4899"/>
                    </linearGradient>
                </defs>
                <circle class="score-ring-bg" cx="60" cy="60" r="50"/>
                <circle class="score-ring-fg" id="ring-fg" cx="60" cy="60" r="50"/>
            </svg>
            <div class="score-number"><span id="score-count">0.0</span><span>/10</span></div>
        </div>
        <p>${data.summary || ""}</p>
    </div>

    <div class="section">
        <h3>✨ Сильные стороны</h3>
        <ul>${(data.strengths || []).map(item => `<li>${item}</li>`).join("")}</ul>
    </div>

    <div class="section">
        <h3>💡 Советы</h3>
        <ul>${(data.advice || []).map(item => `<li>${item}</li>`).join("")}</ul>
    </div>

    <button class="share-btn" id="share-btn">📤 Поделиться результатом</button>

</div>`;

    // Animate ring + counter
    const ringFg = document.getElementById("ring-fg");
    requestAnimationFrame(() => {
        ringFg.style.strokeDashoffset = offset;
    });
    animateCount(document.getElementById("score-count"), rating);

    if (rating >= 8) {
        haptic("success");
        launchConfetti();
    } else if (rating >= 5) {
        haptic("light");
    } else {
        haptic("warning");
    }

    document.getElementById("share-btn").addEventListener("click", () => {
        const text = `Мой AI Rating: ${rating.toFixed(1)}/10 ✨`;
        if (navigator.share) {
            navigator.share({ text }).catch(() => {});
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            showToast("✅ Результат скопирован");
        }
        haptic("light");
    });
}