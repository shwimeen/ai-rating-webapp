const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// ⚠️ Замени на username своего бота (без @) — используется в реферальных
// ссылках и на карточке результата.
const BOT_USERNAME = "your_bot_username";

const API_BASE = "https://ai-rating-backend-2.onrender.com";

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

function hasAuth() {
    return !!(tg.initData && tg.initData.length > 0);
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
}

function dimorphismLabel(mode) {
    if (mode === "male") return { emoji: "💪", label: "Маскулинность" };
    if (mode === "female") return { emoji: "🌸", label: "Женственность" };
    return { emoji: "⚖️", label: "Диморфизм" };
}

// Единый список критериев — подписи/эмодзи совпадают с CRITERIA_GROUPS на backend.
const CRITERIA_GROUPS = [
    {
        title: "📊 Основные критерии",
        items: [
            { key: "rating", emoji: "⭐", label: "Общая привлекательность" },
            { key: "symmetry_score", emoji: "😊", label: "Симметрия лица" },
            { key: "proportions_score", emoji: "📐", label: "Пропорции лица" },
            { key: "jawline_score", emoji: "🦴", label: "Линия челюсти" },
            { key: "chin_score", emoji: "👤", label: "Подбородок" },
            { key: "eyes_score", emoji: "👀", label: "Глаза" },
            { key: "nose_score", emoji: "👃", label: "Нос" },
            { key: "lips_score", emoji: "👄", label: "Губы" },
            { key: "skin_score", emoji: "🧴", label: "Кожа" },
            { key: "hair_score", emoji: "💇", label: "Волосы и причёска" },
            { key: "expression_score", emoji: "😐", label: "Выражение лица" },
            { key: "photo_quality_score", emoji: "📸", label: "Качество фотографии" },
        ],
    },
    {
        title: "💪 Lookmaxing",
        items: [
            { key: "body_fat_percent", emoji: "🏋️", label: "Процент жира (оценочно)", unit: "%" },
        ],
    },
    {
        title: "✨ Дополнительно",
        items: [
            { key: "style_score", emoji: "💅", label: "Стиль" },
            { key: "dimorphism_score", emoji: "⚖️", label: "Диморфизм" },
        ],
    },
];

function buildCriteriaTableHtml(data, mode) {
    return CRITERIA_GROUPS.map(group => {
        const rows = group.items.map(item => {
            let emoji = item.emoji;
            let label = item.label;

            if (item.key === "dimorphism_score") {
                const dm = dimorphismLabel(mode);
                emoji = dm.emoji;
                label = dm.label;
            }

            const raw = Number(data[item.key]) || 0;
            const display = item.unit === "%"
                ? `${raw.toFixed(1)}%`
                : `${raw.toFixed(1)}<span class="crit-max">/10</span>`;

            return `
                <tr>
                    <td class="crit-name">${emoji} ${escapeHtml(label)}</td>
                    <td class="crit-value">${display}</td>
                </tr>`;
        }).join("");

        return `
            <div class="criteria-group">
                <h4 class="criteria-group-title">${group.title}</h4>
                <table class="criteria-table"><tbody>${rows}</tbody></table>
            </div>`;
    }).join("");
}

/* ---------------- Small API helpers ---------------- */
async function apiGet(path, params) {
    const url = new URL(API_BASE + path);
    Object.entries(params || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    });
    const res = await fetch(url.toString());
    return res.json();
}

async function apiPostForm(path, fields) {
    const formData = new FormData();
    Object.entries(fields || {}).forEach(([k, v]) => formData.append(k, v));
    const res = await fetch(API_BASE + path, { method: "POST", body: formData });
    return res.json();
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

/* ---------------- Photo upload (2 шага: анфас → профиль) + tilt effect ---------------- */
function setupPhotoBox(inputId, previewId, boxId, textId, loadedLabel) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const box = document.getElementById(boxId);
    const text = document.getElementById(textId);

    input.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
        text.innerHTML = `<span class="photo-icon">✅</span><span>${loadedLabel}</span>`;
        box.classList.add("loaded");
        haptic("medium");

        onPhotoBoxChanged(boxId, file);
    });

    box.addEventListener("pointermove", (e) => {
        if (!box.classList.contains("loaded")) return;
        const rect = box.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        preview.style.transform = `scale(1.04) translate(${x * 10}px, ${y * 10}px)`;
    });

    box.addEventListener("pointerleave", () => {
        preview.style.transform = "scale(1) translate(0,0)";
    });

    return { input, preview, box, text };
}

let currentPhotoFrontFile = null;
let currentPhotoProfileFile = null;

const frontPhotoEls = setupPhotoBox(
    "photo-front", "preview-front", "photo-box-front", "photo-text-front", "Анфас загружен"
);
const profilePhotoEls = setupPhotoBox(
    "photo-profile", "preview-profile", "photo-box-profile", "photo-text-profile", "Профиль загружен"
);

function onPhotoBoxChanged(boxId, file) {
    if (boxId === "photo-box-front") {
        currentPhotoFrontFile = file;
    } else if (boxId === "photo-box-profile") {
        currentPhotoProfileFile = file;
    }
}

const photoBox = frontPhotoEls.box; // используется ripple/scan-overlay кодом ниже, который завязан на "первый" бокс

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

/* ============================================================
   TABS
   ============================================================ */

document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

function switchTab(name) {
    document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.id === "panel-" + name));
    haptic("light");
    if (name === "history") loadHistory();
    if (name === "leaderboard") loadLeaderboard();
}

/* ============================================================
   MODALS
   ============================================================ */

document.querySelectorAll("[data-close]").forEach(el => {
    el.addEventListener("click", () => closeModal(el.dataset.close));
});

function openModal(id) { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); }

document.getElementById("privacy-link").addEventListener("click", (e) => {
    e.preventDefault();
    openModal("privacy-modal");
    haptic("light");
});

document.getElementById("badges-btn").addEventListener("click", () => {
    renderBadgesGrid();
    openModal("badges-modal");
    haptic("light");
});

document.getElementById("stat-credits").closest(".stat").addEventListener("click", () => {
    openPaymentModal();
});
document.getElementById("stat-credits").closest(".stat").style.cursor = "pointer";

/* ============================================================
   PROFILE / STATS / BADGES
   ============================================================ */

let cachedBadges = [];

async function loadProfile() {
    if (!hasAuth()) return;
    try {
        const data = await apiGet("/profile", { init_data: tg.initData });
        if (data.error) return;

        document.getElementById("stat-streak").textContent = data.stats.streak;
        document.getElementById("stat-total").textContent = data.stats.total;
        document.getElementById("stat-credits").textContent = data.credits || 0;
        document.getElementById("visibility-checkbox").checked = !!data.leaderboard_opt_in;

        cachedBadges = data.badges || [];
    } catch (e) {
        console.error("loadProfile failed", e);
    }
}

function renderBadgesGrid() {
    const grid = document.getElementById("badges-grid");
    if (!cachedBadges.length) {
        grid.innerHTML = `<div class="empty-state">Бейджи появятся после первого анализа ✨</div>`;
        return;
    }
    grid.innerHTML = cachedBadges.map(b => `
        <div class="badge-chip ${b.earned ? "earned" : ""}">
            <span class="badge-emoji">${b.emoji}</span>
            <span class="badge-name">${escapeHtml(b.name)}</span>
        </div>
    `).join("");
}

function showBadgePopups(badges) {
    if (!badges || !badges.length) return;
    const wrap = document.getElementById("badge-popup");
    badges.forEach((b, i) => {
        setTimeout(() => {
            const el = document.createElement("div");
            el.className = "badge-popup-item";
            el.innerHTML = `<span class="badge-emoji">${b.emoji}</span><span>Новый бейдж: ${escapeHtml(b.name)}</span>`;
            wrap.appendChild(el);
            requestAnimationFrame(() => el.classList.add("show"));
            haptic("success");
            setTimeout(() => {
                el.classList.remove("show");
                setTimeout(() => el.remove(), 400);
            }, 2600);
        }, i * 900);
    });
}

document.getElementById("visibility-checkbox").addEventListener("change", async function () {
    if (!hasAuth()) {
        this.checked = !this.checked;
        showToast("Доступно только в Telegram");
        return;
    }
    await apiPostForm("/profile/visibility", { init_data: tg.initData, visible: this.checked });
    haptic("light");
});

/* ============================================================
   HISTORY
   ============================================================ */

const MODE_ICONS = { male: "👨", female: "👩", general: "✨" };

async function loadHistory() {
    const wrap = document.getElementById("history-list");

    if (!hasAuth()) {
        wrap.innerHTML = `<div class="empty-state">Откройте приложение через Telegram, чтобы видеть историю 🔒</div>`;
        return;
    }

    wrap.innerHTML = `<div class="empty-state">🕓 Загрузка истории...</div>`;

    let data;
    try {
        data = await apiGet("/history", { init_data: tg.initData, limit: 30 });
    } catch (e) {
        wrap.innerHTML = `<div class="empty-state">❌ Не удалось загрузить историю</div>`;
        return;
    }

    if (data.error || !data.items || data.items.length === 0) {
        wrap.innerHTML = `<div class="empty-state">Пока нет ни одного анализа 👀<br>Начни на вкладке «Анализ»</div>`;
        return;
    }

    wrap.innerHTML = data.items.map(item => {
        const dt = new Date(item.created_at);
        const dateStr = isNaN(dt.getTime())
            ? ""
            : dt.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });

        return `
        <div class="history-item" data-id="${item.id}">
            <div class="history-item-top">
                <span class="history-mode-icon">${MODE_ICONS[item.mode] || "✨"}</span>
                <div class="history-meta">
                    <div class="history-date">${dateStr}${item.vibe ? " · " + escapeHtml(item.vibe) : ""}</div>
                    <div class="history-vibe">${escapeHtml(item.summary || "")}</div>
                </div>
                <div class="history-rating">${Number(item.rating || 0).toFixed(1)}</div>
            </div>
            <div class="history-body">
                ${buildCriteriaTableHtml(item, item.mode)}
                <p>${escapeHtml(item.potential || "")}</p>
                <ul>${(item.advice || []).map(a => `<li>${escapeHtml(a)}</li>`).join("")}</ul>
            </div>
        </div>`;
    }).join("");

    wrap.querySelectorAll(".history-item").forEach(el => {
        el.addEventListener("click", () => {
            el.classList.toggle("open");
            haptic("light");
        });
    });
}

/* ============================================================
   LEADERBOARD
   ============================================================ */

async function loadLeaderboard() {
    const wrap = document.getElementById("leaderboard-list");
    wrap.innerHTML = `<div class="empty-state">🏆 Загрузка топа...</div>`;

    let data;
    try {
        data = await apiGet("/leaderboard", { init_data: tg.initData || "", limit: 30 });
    } catch (e) {
        wrap.innerHTML = `<div class="empty-state">❌ Не удалось загрузить топ</div>`;
        return;
    }

    if (data.error || !data.items || data.items.length === 0) {
        wrap.innerHTML = `<div class="empty-state">Топ пока пуст — стань первым! 🚀</div>`;
        return;
    }

    const medals = ["🥇", "🥈", "🥉"];

    wrap.innerHTML = data.items.map(row => {
        const medal = row.rank <= 3 ? medals[row.rank - 1] : row.rank;
        const initials = (row.first_name || "?").slice(0, 1).toUpperCase();
        const avatar = row.photo_url
            ? `<img class="leaderboard-avatar" src="${row.photo_url}" alt="">`
            : `<div class="leaderboard-avatar">${initials}</div>`;

        return `
        <div class="leaderboard-row ${row.is_you ? "is-you" : ""}">
            <div class="leaderboard-rank">${medal}</div>
            ${avatar}
            <div class="leaderboard-name">${escapeHtml(row.first_name || "Игрок")}${row.is_you ? " (вы)" : ""}</div>
            <div class="leaderboard-score">${Number(row.best_rating || 0).toFixed(1)}</div>
        </div>`;
    }).join("");
}

/* ============================================================
   REFERRALS
   ============================================================ */

async function handleReferral() {
    if (!hasAuth()) return;

    const startParam = tg.initDataUnsafe && tg.initDataUnsafe.start_param;
    if (!startParam || !startParam.startsWith("ref_")) return;
    if (localStorage.getItem("ai_rating_referral_done")) return;

    const referrerId = startParam.replace("ref_", "");
    if (!referrerId || isNaN(Number(referrerId))) return;

    try {
        await apiPostForm("/referral", { init_data: tg.initData, referred_by: referrerId });
        localStorage.setItem("ai_rating_referral_done", "1");
    } catch (e) {
        console.error("referral failed", e);
    }
}

document.getElementById("invite-btn").addEventListener("click", () => {
    const myId = tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id;
    if (!myId) {
        showToast("Доступно только в Telegram");
        return;
    }
    const link = `https://t.me/${BOT_USERNAME}?startapp=ref_${myId}`;
    const text = `Узнай свою AI-оценку внешности ✨\n${link}`;

    haptic("medium");

    if (navigator.share) {
        navigator.share({ text }).catch(() => {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        showToast("✅ Ссылка скопирована");
    }
});

/* ============================================================
   PAYMENTS (Telegram Stars)
   ============================================================ */

let cachedPackages = null;

async function loadPackages() {
    if (cachedPackages) return cachedPackages;
    try {
        const data = await apiGet("/packages", {});
        cachedPackages = data.items || [];
    } catch (e) {
        cachedPackages = [];
    }
    return cachedPackages;
}

async function openPaymentModal() {
    const wrap = document.getElementById("packages-list");
    wrap.innerHTML = `<div class="empty-state">Загрузка пакетов...</div>`;
    openModal("payment-modal");
    haptic("light");

    const packages = await loadPackages();

    if (!packages.length) {
        wrap.innerHTML = `<div class="empty-state">❌ Оплата временно недоступна</div>`;
        return;
    }

    // Пакет с лучшей ценой за анализ помечаем как "выгодно"
    const bestValueId = packages.reduce((best, p) => {
        const ratio = p.stars / p.credits;
        const bestRatio = best ? best.stars / best.credits : Infinity;
        return ratio < bestRatio ? p : best;
    }, null)?.id;

    wrap.innerHTML = packages.map(p => `
        <div class="package-card ${p.id === bestValueId ? "popular" : ""}" data-id="${p.id}">
            <div class="package-info">
                <span class="package-title">${escapeHtml(p.title)}</span>
                ${p.id === bestValueId ? `<span class="package-badge">Выгодно</span>` : ""}
            </div>
            <div class="package-price">⭐ ${p.stars}</div>
        </div>
    `).join("");

    wrap.querySelectorAll(".package-card").forEach(card => {
        card.addEventListener("click", () => buyPackage(card.dataset.id));
    });
}

async function buyPackage(packageId) {
    if (!hasAuth()) {
        showToast("Доступно только в Telegram");
        return;
    }

    haptic("medium");

    const data = await apiPostForm("/create_invoice", {
        init_data: tg.initData,
        package: packageId,
    });

    if (data.error || !data.invoice_link) {
        showToast(data.message || "❌ Не удалось создать счёт");
        return;
    }

    tg.openInvoice(data.invoice_link, (status) => {
        if (status === "paid") {
            haptic("success");
            launchConfetti();
            showToast("✅ Оплата прошла! Баланс пополнен");
            closeModal("payment-modal");
            loadProfile();
        } else if (status === "failed") {
            haptic("error");
            showToast("❌ Оплата не прошла");
        } else if (status === "cancelled") {
            haptic("light");
        }
    });
}

/* ============================================================
   SHARE CARD (canvas)
   ============================================================ */

function roundRectPath(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
}

function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

async function buildShareCard(data, rating) {
    const canvas = document.getElementById("share-canvas");
    const sc = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;

    const bg = sc.createRadialGradient(W / 2, 120, 40, W / 2, H / 2, W);
    bg.addColorStop(0, "#5b21ff");
    bg.addColorStop(0.5, "#1a1030");
    bg.addColorStop(1, "#05050a");
    sc.fillStyle = bg;
    sc.fillRect(0, 0, W, H);

    if (currentPhotoFrontFile) {
        try {
            const img = await loadImageFromFile(currentPhotoFrontFile);
            const size = 260;
            const px = W / 2 - size / 2, py = 70;

            sc.save();
            roundRectPath(sc, px, py, size, size, 28);
            sc.clip();
            const scale = Math.max(size / img.width, size / img.height);
            const iw = img.width * scale, ih = img.height * scale;
            sc.drawImage(img, px + size / 2 - iw / 2, py + size / 2 - ih / 2, iw, ih);
            sc.restore();

            sc.strokeStyle = "rgba(255,255,255,.25)";
            sc.lineWidth = 2;
            roundRectPath(sc, px, py, size, size, 28);
            sc.stroke();
        } catch (e) {
            console.error("photo draw failed", e);
        }
    }

    sc.textAlign = "center";
    sc.fillStyle = "#ffffff";
    sc.font = "bold 90px -apple-system, Arial";
    sc.fillText(rating.toFixed(1), W / 2, 445);

    sc.font = "20px -apple-system, Arial";
    sc.fillStyle = "rgba(255,255,255,.6)";
    sc.fillText("из 10", W / 2, 478);

    if (data.vibe) {
        sc.font = "bold 22px -apple-system, Arial";
        const text = data.vibe;
        const textW = sc.measureText(text).width;
        const pillW = textW + 50, pillH = 44;
        const pillX = W / 2 - pillW / 2, pillY = 505;

        sc.fillStyle = "rgba(255,255,255,.12)";
        roundRectPath(sc, pillX, pillY, pillW, pillH, 22);
        sc.fill();
        sc.strokeStyle = "rgba(255,255,255,.25)";
        sc.stroke();

        sc.fillStyle = "#fff";
        sc.fillText(text, W / 2, pillY + 29);
    }

    // Мини-метрики на карточке: симметрия / пропорции / чёткость челюсти
    const miniStats = [
        { emoji: "😊", value: Number(data.symmetry_score) || 0 },
        { emoji: "📐", value: Number(data.proportions_score) || 0 },
        { emoji: "🦴", value: Number(data.jawline_score) || 0 },
    ];

    sc.font = "15px -apple-system, Arial";
    const chipTexts = miniStats.map(m => `${m.emoji} ${m.value.toFixed(1)}`);
    const chipWidths = chipTexts.map(t => sc.measureText(t).width + 30);
    const gap = 10;
    const totalW = chipWidths.reduce((a, b) => a + b, 0) + gap * (chipWidths.length - 1);
    let chipX = W / 2 - totalW / 2;
    const chipY = 565;

    chipTexts.forEach((t, i) => {
        const cw = chipWidths[i];
        sc.fillStyle = "rgba(255,255,255,.08)";
        roundRectPath(sc, chipX, chipY, cw, 34, 17);
        sc.fill();
        sc.fillStyle = "rgba(255,255,255,.85)";
        sc.fillText(t, chipX + cw / 2, chipY + 23);
        chipX += cw + gap;
    });

    sc.font = "bold 26px -apple-system, Arial";
    sc.fillStyle = "#fff";
    sc.fillText("✨ AI Rating", W / 2, 622);

    sc.font = "16px -apple-system, Arial";
    sc.fillStyle = "rgba(255,255,255,.55)";
    sc.fillText(`Узнай свою оценку: @${BOT_USERNAME}`, W / 2, 657);

    sc.font = "12px -apple-system, Arial";
    sc.fillStyle = "rgba(255,255,255,.3)";
    sc.fillText("результат сгенерирован нейросетью", W / 2, 722);
}

async function openShareCard(data, rating) {
    await buildShareCard(data, rating);
    openModal("share-modal");
    haptic("light");
}

document.getElementById("share-download").addEventListener("click", () => {
    const canvas = document.getElementById("share-canvas");
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ai-rating.png";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, "image/png");
    haptic("medium");
});

document.getElementById("share-native").addEventListener("click", () => {
    const canvas = document.getElementById("share-canvas");
    canvas.toBlob(async blob => {
        const file = new File([blob], "ai-rating.png", { type: "image/png" });
        const myId = tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id;
        const link = myId ? `https://t.me/${BOT_USERNAME}?startapp=ref_${myId}` : `https://t.me/${BOT_USERNAME}`;
        const text = `Мой AI Rating ✨ Проверь свою оценку: ${link}`;

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({ files: [file], text });
                haptic("success");
                return;
            } catch (e) {
                /* user cancelled or unsupported — fall through to clipboard */
            }
        }

        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            showToast("✅ Ссылка скопирована, картинку скачайте вручную");
        }
    }, "image/png");
});

/* ---------------- Main analyze flow ---------------- */
async function analyze() {
    const frontFile = document.getElementById("photo-front").files[0];
    const profileFile = document.getElementById("photo-profile").files[0];

    if (!frontFile) {
        haptic("error");
        showToast("📸 Сначала загрузите фото анфас");
        return;
    }

    if (!profileFile) {
        haptic("error");
        showToast("📸 Теперь загрузите фото профиля (сбоку)");
        return;
    }

    haptic("medium");
    analyzeBtn.classList.add("loading");

    // Play the face-scan animation over the photo first
    await playScanAnimation();

    const formData = new FormData();
    formData.append("photo_front", frontFile);
    formData.append("photo_profile", profileFile);
    formData.append("mode", modeInput.value);
    formData.append("age", document.getElementById("age").value);
    formData.append("height", document.getElementById("height").value);
    formData.append("weight", document.getElementById("weight").value);
    formData.append("init_data", tg.initData || "");

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
        response = await fetch(`${API_BASE}/analyze`, {
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
        let errorText = "Неизвестная ошибка";
        try {
            const errorData = await response.json();
            errorText = errorData.error || errorText;
        } catch (e) {}
        resultEl.innerHTML = `<div class="result-wrap">❌ ${escapeHtml(errorText)}</div>`;
        return;
    }

    const data = await response.json();
    if (!data.error) data.mode = modeInput.value;

    if (data.need_payment) {
        haptic("warning");
        resultEl.innerHTML = `
        <div class="result-wrap">
            <div class="paywall-card">
                <div class="paywall-emoji">🔒</div>
                <p>${escapeHtml(data.message || "Бесплатная попытка использована.")}</p>
                <button class="share-btn" id="buy-credits-btn">⭐ Пополнить баланс</button>
            </div>
        </div>`;
        document.getElementById("buy-credits-btn").addEventListener("click", openPaymentModal);
        return;
    }

    if (data.error) {
        haptic("error");
        resultEl.innerHTML = `<div class="result-wrap">${escapeHtml(data.message || "Произошла ошибка")}</div>`;
        return;
    }

    const rating = Number(data.rating) || 0;
    const circumference = 314; // 2 * PI * r(50)
    const offset = circumference - (rating / 10) * circumference;
    const criteriaHtml = buildCriteriaTableHtml(data, modeInput.value);

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
        <p>${escapeHtml(data.summary || "")}</p>

        ${data.vibe ? `<div class="vibe-pill">🌀 ${escapeHtml(data.vibe)}</div>` : ""}

        ${data.potential ? `<div class="potential-box"><b>Потенциал роста</b>${escapeHtml(data.potential)}</div>` : ""}
    </div>

    <div class="criteria-wrap">${criteriaHtml}</div>

    <div class="section">
        <h3>✨ Сильные стороны</h3>
        <ul>${(data.strengths || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </div>

    <div class="section">
        <h3>💡 Советы</h3>
        <ul>${(data.advice || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </div>

    <button class="share-btn" id="share-btn">📤 Поделиться результатом</button>

</div>`;

    // Animate ring + counters
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

    // Update stats bar + badges from this response, refresh full profile in background
    if (typeof data.streak === "number") document.getElementById("stat-streak").textContent = data.streak;
    if (typeof data.total_analyses === "number") document.getElementById("stat-total").textContent = data.total_analyses;
    if (typeof data.credits_left === "number") document.getElementById("stat-credits").textContent = data.credits_left;
    if (data.new_badges && data.new_badges.length) showBadgePopups(data.new_badges);
    loadProfile();

    document.getElementById("share-btn").addEventListener("click", () => {
        haptic("light");
        openShareCard(data, rating);
    });
}

/* ---------------- Init ---------------- */
loadProfile();
handleReferral();