const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// ⚠️ Замени на username своего бота (без @) — используется в реферальных
// ссылках и на карточке результата.
const BOT_USERNAME = "pslmaxai_bot";

const API_BASE = "https://ai-rating-backend-2.onrender.com";

/* ============================================================
   I18N — перевод интерфейса (ru/en)
   ============================================================ */

let currentLang = "ru";

const I18N = {
    ru: {
        app_subtitle: "Оцени свою внешность<br>с помощью искусственного интеллекта",
        stat_days: "дней",
        stat_analyses: "анализов",
        stat_balance: "баланс",
        tab_analyze: "🔥 Анализ",
        tab_history: "🕓 История",
        tab_leaderboard: "🏆 Топ",
        mode_label: "🎯 Тип анализа",
        mode_male: "👨 Муж.",
        mode_female: "👩 Жен.",
        mode_general: "✨ Общая",
        field_age: "🎂 Возраст",
        field_height: "📏 Рост (см)",
        field_weight: "⚖️ Вес (кг)",
        photo_front_label: "Анфас",
        photo_profile_label: "Профиль",
        photo_front_loaded: "Анфас загружен",
        photo_profile_loaded: "Профиль загружен",
        scan_status_default: "Поиск...",
        analyze_btn: "🔥 Анализировать",
        history_loading: "🕓 Загрузка истории...",
        invite_btn: "🤝 Пригласить друга",
        visibility_label: "Показывать меня в топе",
        leaderboard_loading: "🏆 Загрузка топа...",
        footer_hint: "Работает на нейросети · результат может отличаться каждый раз",
        privacy_link: "🔒 Конфиденциальность",
        settings_modal_title: "⚙️ Настройки",
        settings_language_label: "Язык интерфейса",
        badges_modal_title: "🏅 Бейджи",
        privacy_modal_title: "🔒 Конфиденциальность",
        privacy_p1: "Фото используются <b>только</b> для анализа внешности и не передаются третьим лицам, кроме сервиса Google Gemini, который непосредственно выполняет сам анализ по нашему запросу.",
        privacy_p2: "Файлы фотографий удаляются с сервера сразу после обработки — они нигде не сохраняются.",
        privacy_p3: "Сохраняются только результаты анализа (оценки, текст советов) и привязка к твоему Telegram-аккаунту — чтобы работали история, стрики и бейджи.",
        privacy_p4: "Данные для лидерборда (имя, оценка) видны другим пользователям, только если ты сам не отключил показ в настройках топа.",
        payment_modal_title: "⭐ Пополнить баланс",
        payment_hint: "Бесплатная попытка использована. Выбери пакет — оплата звёздами Telegram, прямо здесь.",
        packages_loading: "Загрузка пакетов...",
        share_modal_title: "📤 Поделиться",
        share_download: "⬇️ Скачать",
        share_native: "📤 Поделиться",

        toast_select_front: "📸 Сначала загрузите фото анфас",
        toast_select_profile: "📸 Теперь загрузите фото профиля (сбоку)",
        toast_telegram_only: "Доступно только в Telegram",
        toast_link_copied: "✅ Ссылка скопирована",
        toast_invoice_failed: "❌ Не удалось создать счёт",
        toast_payment_success: "✅ Оплата прошла! Баланс пополнен",
        toast_payment_failed: "❌ Оплата не прошла",
        toast_copied_manual_download: "✅ Ссылка скопирована, картинку скачайте вручную",
        share_native_text: "Мой AI Rating ✨ Проверь свою оценку:",

        thinking_phrases: [
            "🔍 Изучаем изображение...",
            "🧠 Анализируем черты лица...",
            "📐 Считаем пропорции...",
            "💫 Оцениваем стиль...",
            "✍️ Формируем вывод...",
        ],
        scan_status_phases: [
            "Поиск лица...",
            "Лицо обнаружено ✅",
            "Разметка точек...",
            "Анализ пропорций...",
        ],

        result_error_generic: "Произошла ошибка",
        server_unreachable: "❌ Не удалось связаться с сервером",
        unknown_error: "Неизвестная ошибка",

        criteria_group_main: "📊 Основные критерии",
        criteria_group_lookmax: "💪 Lookmaxing",
        criteria_group_bonus: "✨ Дополнительно",
        crit_rating: "Общая привлекательность",
        crit_symmetry_score: "Симметрия лица",
        crit_proportions_score: "Пропорции лица",
        crit_jawline_score: "Линия челюсти",
        crit_chin_score: "Подбородок",
        crit_eyes_score: "Глаза",
        crit_nose_score: "Нос",
        crit_lips_score: "Губы",
        crit_skin_score: "Кожа",
        crit_hair_score: "Волосы и причёска",
        crit_expression_score: "Выражение лица",
        crit_photo_quality_score: "Качество фотографии",
        crit_body_fat_percent: "Процент жира (оценочно)",
        crit_style_score: "Стиль",
        dimorphism_male: "Маскулинность",
        dimorphism_female: "Женственность",
        dimorphism_general: "Диморфизм",

        strengths_title: "✨ Сильные стороны",
        advice_title: "💡 Советы",
        share_result_btn: "📤 Поделиться результатом",
        potential_title: "Потенциал роста",
        progress_up: "с прошлого раза",
        progress_down: "с прошлого раза",
        checklist_progress: "выполнено",
        buy_credits_btn: "⭐ Пополнить баланс",
        loading_title: "✨ AI анализирует",
        paywall_default_message: "Бесплатная попытка использована.",

        history_empty_no_auth: "Откройте приложение через Telegram, чтобы видеть историю 🔒",
        history_load_error: "❌ Не удалось загрузить историю",
        history_empty: "Пока нет ни одного анализа 👀<br>Начни на вкладке «Анализ»",

        leaderboard_load_error: "❌ Не удалось загрузить топ",
        leaderboard_empty: "Топ пока пуст — стань первым! 🚀",
        leaderboard_you_suffix: " (вы)",
        leaderboard_default_name: "Игрок",

        badges_empty: "Бейджи появятся после первого анализа ✨",
        badge_new_prefix: "Новый бейдж: ",

        packages_unavailable: "❌ Оплата временно недоступна",
        package_badge_best: "Выгодно",

        share_out_of_10: "из 10",
        share_get_your_rating: "Узнай свою оценку:",
        share_ai_generated: "результат сгенерирован нейросетью",
        share_brand: "✨ AI Rating",
        invite_share_text: "Узнай свою AI-оценку внешности ✨",
    },

    en: {
        app_subtitle: "Get your appearance rated<br>by artificial intelligence",
        stat_days: "days",
        stat_analyses: "analyses",
        stat_balance: "balance",
        tab_analyze: "🔥 Analyze",
        tab_history: "🕓 History",
        tab_leaderboard: "🏆 Top",
        mode_label: "🎯 Analysis type",
        mode_male: "👨 Male",
        mode_female: "👩 Female",
        mode_general: "✨ General",
        field_age: "🎂 Age",
        field_height: "📏 Height (cm)",
        field_weight: "⚖️ Weight (kg)",
        photo_front_label: "Front",
        photo_profile_label: "Profile",
        photo_front_loaded: "Front photo added",
        photo_profile_loaded: "Profile photo added",
        scan_status_default: "Searching...",
        analyze_btn: "🔥 Analyze",
        history_loading: "🕓 Loading history...",
        invite_btn: "🤝 Invite a friend",
        visibility_label: "Show me on the leaderboard",
        leaderboard_loading: "🏆 Loading leaderboard...",
        footer_hint: "Powered by AI · results may vary each time",
        privacy_link: "🔒 Privacy",
        settings_modal_title: "⚙️ Settings",
        settings_language_label: "Interface language",
        badges_modal_title: "🏅 Badges",
        privacy_modal_title: "🔒 Privacy",
        privacy_p1: "Photos are used <b>only</b> to analyze your appearance and are not shared with third parties, except for the Google Gemini service, which performs the analysis itself on our request.",
        privacy_p2: "Photo files are deleted from the server right after processing — they are never stored.",
        privacy_p3: "Only the analysis results (scores, advice text) and a link to your Telegram account are saved — so history, streaks and badges work.",
        privacy_p4: "Leaderboard data (name, score) is visible to other users only if you haven't disabled it in leaderboard settings.",
        payment_modal_title: "⭐ Top up balance",
        payment_hint: "Your free trial has been used. Choose a package — pay with Telegram Stars, right here.",
        packages_loading: "Loading packages...",
        share_modal_title: "📤 Share",
        share_download: "⬇️ Download",
        share_native: "📤 Share",

        toast_select_front: "📸 Please upload a front photo first",
        toast_select_profile: "📸 Now upload a profile (side) photo",
        toast_telegram_only: "Available only in Telegram",
        toast_link_copied: "✅ Link copied",
        toast_invoice_failed: "❌ Failed to create invoice",
        toast_payment_success: "✅ Payment successful! Balance topped up",
        toast_payment_failed: "❌ Payment failed",
        toast_copied_manual_download: "✅ Link copied, please download the image manually",
        share_native_text: "My AI Rating ✨ Check your score:",

        thinking_phrases: [
            "🔍 Studying the image...",
            "🧠 Analyzing facial features...",
            "📐 Calculating proportions...",
            "💫 Evaluating style...",
            "✍️ Putting together the verdict...",
        ],
        scan_status_phases: [
            "Searching for a face...",
            "Face detected ✅",
            "Mapping landmarks...",
            "Analyzing proportions...",
        ],

        result_error_generic: "Something went wrong",
        server_unreachable: "❌ Could not reach the server",
        unknown_error: "Unknown error",

        criteria_group_main: "📊 Main criteria",
        criteria_group_lookmax: "💪 Lookmaxing",
        criteria_group_bonus: "✨ Bonus",
        crit_rating: "Overall attractiveness",
        crit_symmetry_score: "Facial symmetry",
        crit_proportions_score: "Facial proportions",
        crit_jawline_score: "Jawline",
        crit_chin_score: "Chin",
        crit_eyes_score: "Eyes",
        crit_nose_score: "Nose",
        crit_lips_score: "Lips",
        crit_skin_score: "Skin",
        crit_hair_score: "Hair & hairstyle",
        crit_expression_score: "Facial expression",
        crit_photo_quality_score: "Photo quality",
        crit_body_fat_percent: "Body fat (estimated)",
        crit_style_score: "Style",
        dimorphism_male: "Masculinity",
        dimorphism_female: "Femininity",
        dimorphism_general: "Dimorphism",

        strengths_title: "✨ Strengths",
        advice_title: "💡 Advice",
        share_result_btn: "📤 Share result",
        potential_title: "Growth potential",
        progress_up: "since last time",
        progress_down: "since last time",
        checklist_progress: "completed",
        buy_credits_btn: "⭐ Top up balance",
        loading_title: "✨ AI is analyzing",
        paywall_default_message: "Your free trial has been used.",

        history_empty_no_auth: "Open the app via Telegram to see your history 🔒",
        history_load_error: "❌ Failed to load history",
        history_empty: "No analyses yet 👀<br>Start on the Analyze tab",

        leaderboard_load_error: "❌ Failed to load leaderboard",
        leaderboard_empty: "Leaderboard is empty — be the first! 🚀",
        leaderboard_you_suffix: " (you)",
        leaderboard_default_name: "Player",

        badges_empty: "Badges will appear after your first analysis ✨",
        badge_new_prefix: "New badge: ",

        packages_unavailable: "❌ Payments are temporarily unavailable",
        package_badge_best: "Best value",

        share_out_of_10: "out of 10",
        share_get_your_rating: "Get your rating:",
        share_ai_generated: "result generated by AI",
        share_brand: "✨ AI Rating",
        invite_share_text: "Discover your AI appearance rating ✨",
    },
};

function t(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) ?? I18N.ru[key] ?? key;
}

function applyStaticTranslations() {
    document.documentElement.lang = currentLang;

    document.querySelectorAll("[data-i18n]").forEach(el => {
        el.innerHTML = t(el.dataset.i18n);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        el.placeholder = t(el.dataset.i18nPlaceholder);
    });
}


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

function buildAdviceChecklistHtml(analysisId, adviceList, progressArr) {
    if (!adviceList.length) return "";

    return `<ul class="advice-checklist">` + adviceList.map((item, i) => {
        const done = !!progressArr[i];
        return `
        <li class="advice-item ${done ? "done" : ""}" data-analysis-id="${analysisId || ""}" data-index="${i}">
            <span class="advice-checkbox">${done ? "✅" : "⬜"}</span>
            <span class="advice-text">${escapeHtml(item)}</span>
        </li>`;
    }).join("") + `</ul>`;
}

function updateAdviceProgressLabel(container) {
    const label = container.querySelector(".advice-progress-label");
    if (!label) return;
    const items = container.querySelectorAll(".advice-item");
    const done = container.querySelectorAll(".advice-item.done").length;
    label.textContent = `${done}/${items.length} ${t("checklist_progress")}`;
}

// Делегирование клика по чек-листу советов — работает и в результате анализа, и в истории.
document.addEventListener("click", async (e) => {
    const li = e.target.closest(".advice-item");
    if (!li) return;

    const analysisId = li.dataset.analysisId;
    if (!analysisId) {
        showToast(t("toast_telegram_only"));
        return;
    }

    const index = Number(li.dataset.index);
    const willBeDone = !li.classList.contains("done");

    li.classList.toggle("done", willBeDone);
    li.querySelector(".advice-checkbox").textContent = willBeDone ? "✅" : "⬜";
    haptic("light");

    const container = li.closest(".section, .history-body");
    if (container) updateAdviceProgressLabel(container);

    try {
        await apiPostForm("/advice/toggle", {
            init_data: tg.initData,
            analysis_id: analysisId,
            index: index,
            done: willBeDone,
        });
    } catch (err) {
        console.error("advice toggle failed", err);
    }
});

function dimorphismLabel(mode) {
    if (mode === "male") return { emoji: "💪", label: t("dimorphism_male") };
    if (mode === "female") return { emoji: "🌸", label: t("dimorphism_female") };
    return { emoji: "⚖️", label: t("dimorphism_general") };
}

// Единый список критериев — ключи совпадают с CRITERIA_GROUPS на backend,
// подписи резолвятся через t() в момент рендера (чтобы учитывать язык).
const CRITERIA_GROUPS = [
    {
        titleKey: "criteria_group_main",
        items: [
            { key: "rating", emoji: "⭐", labelKey: "crit_rating" },
            { key: "symmetry_score", emoji: "😊", labelKey: "crit_symmetry_score" },
            { key: "proportions_score", emoji: "📐", labelKey: "crit_proportions_score" },
            { key: "jawline_score", emoji: "🦴", labelKey: "crit_jawline_score" },
            { key: "chin_score", emoji: "👤", labelKey: "crit_chin_score" },
            { key: "eyes_score", emoji: "👀", labelKey: "crit_eyes_score" },
            { key: "nose_score", emoji: "👃", labelKey: "crit_nose_score" },
            { key: "lips_score", emoji: "👄", labelKey: "crit_lips_score" },
            { key: "skin_score", emoji: "🧴", labelKey: "crit_skin_score" },
            { key: "hair_score", emoji: "💇", labelKey: "crit_hair_score" },
            { key: "expression_score", emoji: "😐", labelKey: "crit_expression_score" },
            { key: "photo_quality_score", emoji: "📸", labelKey: "crit_photo_quality_score" },
        ],
    },
    {
        titleKey: "criteria_group_lookmax",
        items: [
            { key: "body_fat_percent", emoji: "🏋️", labelKey: "crit_body_fat_percent", unit: "%" },
        ],
    },
    {
        titleKey: "criteria_group_bonus",
        items: [
            { key: "style_score", emoji: "💅", labelKey: "crit_style_score" },
            { key: "dimorphism_score", emoji: "⚖️", labelKey: null },
        ],
    },
];

function buildCriteriaTableHtml(data, mode, deltas) {
    return CRITERIA_GROUPS.map(group => {
        const rows = group.items.map(item => {
            let emoji = item.emoji;
            let label = item.labelKey ? t(item.labelKey) : "";

            if (item.key === "dimorphism_score") {
                const dm = dimorphismLabel(mode);
                emoji = dm.emoji;
                label = dm.label;
            }

            const raw = Number(data[item.key]) || 0;
            const display = item.unit === "%"
                ? `${raw.toFixed(1)}%`
                : `${raw.toFixed(1)}<span class="crit-max">/10</span>`;

            let deltaHtml = "";
            if (deltas && typeof deltas[item.key] === "number" && deltas[item.key] !== 0) {
                const d = deltas[item.key];
                const up = d > 0;
                const cls = up ? "delta-up" : "delta-down";
                const arrow = up ? "▲" : "▼";
                deltaHtml = `<span class="crit-delta ${cls}">${arrow} ${Math.abs(d).toFixed(1)}</span>`;
            }

            return `
                <tr>
                    <td class="crit-name">${emoji} ${escapeHtml(label)}</td>
                    <td class="crit-value">${display}${deltaHtml}</td>
                </tr>`;
        }).join("");

        return `
            <div class="criteria-group">
                <h4 class="criteria-group-title">${t(group.titleKey)}</h4>
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
function setupPhotoBox(inputId, previewId, boxId, textId, loadedLabelKey) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const box = document.getElementById(boxId);
    const text = document.getElementById(textId);

    input.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
        text.innerHTML = `<span class="photo-icon">✅</span><span>${t(loadedLabelKey)}</span>`;
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
    "photo-front", "preview-front", "photo-box-front", "photo-text-front", "photo_front_loaded"
);
const profilePhotoEls = setupPhotoBox(
    "photo-profile", "preview-profile", "photo-box-profile", "photo-text-profile", "photo_profile_loaded"
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
let thinkingTimer = null;

function startThinkingRotation() {
    const phrases = t("thinking_phrases");
    let i = 0;
    const el = document.getElementById("ai-text");
    thinkingTimer = setInterval(() => {
        i = (i + 1) % phrases.length;
        if (el) {
            el.style.opacity = 0;
            setTimeout(() => {
                el.textContent = phrases[i];
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
const scanOverlayFront = document.getElementById("scan-overlay-front");
const scanOverlayProfile = document.getElementById("scan-overlay-profile");

function playScanAnimation(duration = 2200) {
    return new Promise((resolve) => {
        scanOverlayFront.classList.add("active");
        scanOverlayProfile.classList.add("active");
        haptic("light");

        // Лёгкая haptic-обратная связь по ходу сканирования (без текста).
        const tickCount = 4;
        const hapticInterval = setInterval(() => {
            haptic("light");
        }, duration / tickCount);

        setTimeout(() => {
            clearInterval(hapticInterval);
            scanOverlayFront.classList.remove("active");
            scanOverlayProfile.classList.remove("active");
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

document.getElementById("privacy-link-settings").addEventListener("click", (e) => {
    e.preventDefault();
    openModal("privacy-modal");
    haptic("light");
});

document.getElementById("badges-btn").addEventListener("click", () => {
    renderBadgesGrid();
    openModal("badges-modal");
    haptic("light");
});

async function switchLanguage(newLang) {
    if (newLang === currentLang) return;
    currentLang = newLang;
    applyStaticTranslations();
    renderBadgesGrid();
    updateSettingsLangButtons();
    haptic("light");

    if (hasAuth()) {
        try {
            await apiPostForm("/language", { init_data: tg.initData, language: newLang });
        } catch (e) {
            console.error("language switch failed", e);
        }
    }
}

function updateSettingsLangButtons() {
    document.querySelectorAll("#settings-lang-group .seg").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });
}

document.querySelectorAll("#settings-lang-group .seg").forEach(btn => {
    btn.addEventListener("click", () => switchLanguage(btn.dataset.lang));
});

document.getElementById("settings-btn").addEventListener("click", () => {
    updateSettingsLangButtons();
    openModal("settings-modal");
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

        if (data.language && I18N[data.language]) {
            currentLang = data.language;
            applyStaticTranslations();
            updateSettingsLangButtons();
        }

        document.getElementById("stat-streak").textContent = data.stats.streak;
        document.getElementById("stat-total").textContent = data.stats.total;
        document.getElementById("stat-credits").textContent = data.credits || 0;
        document.getElementById("visibility-checkbox").checked = !!data.leaderboard_opt_in;

        cachedBadges = data.badges || [];
    } catch (e) {
        console.error("loadProfile failed", e);
    }
}

// Названия бейджей переводим на клиенте по id — сервер присылает только
// русское name (используется как fallback, если id не распознан).
const BADGE_NAMES = {
    ru: {
        first_scan: "Первый шаг", five_scans: "Разогрелся", twenty_scans: "Ветеран",
        streak_3: "3 дня подряд", streak_7: "Неделя подряд", high_score: "Топ 9+",
        style_icon: "Икона стиля", symmetry_master: "Идеальная симметрия",
        golden_ratio: "Золотое сечение", sharp_jawline: "Чёткая челюсть",
        clear_skin: "Чистая кожа", inviter: "Первый друг", inviter5: "Амбассадор",
    },
    en: {
        first_scan: "First step", five_scans: "Warmed up", twenty_scans: "Veteran",
        streak_3: "3-day streak", streak_7: "7-day streak", high_score: "Top 9+",
        style_icon: "Style icon", symmetry_master: "Perfect symmetry",
        golden_ratio: "Golden ratio", sharp_jawline: "Sharp jawline",
        clear_skin: "Clear skin", inviter: "First friend", inviter5: "Ambassador",
    },
};

function badgeName(b) {
    return (BADGE_NAMES[currentLang] && BADGE_NAMES[currentLang][b.id]) || b.name;
}

function renderBadgesGrid() {
    const grid = document.getElementById("badges-grid");
    if (!cachedBadges.length) {
        grid.innerHTML = `<div class="empty-state">${t("badges_empty")}</div>`;
        return;
    }
    grid.innerHTML = cachedBadges.map(b => `
        <div class="badge-chip ${b.earned ? "earned" : ""}">
            <span class="badge-emoji">${b.emoji}</span>
            <span class="badge-name">${escapeHtml(badgeName(b))}</span>
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
            el.innerHTML = `<span class="badge-emoji">${b.emoji}</span><span>${t("badge_new_prefix")}${escapeHtml(badgeName(b))}</span>`;
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
        showToast(t("toast_telegram_only"));
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
        wrap.innerHTML = `<div class="empty-state">${t("history_empty_no_auth")}</div>`;
        return;
    }

    wrap.innerHTML = `<div class="empty-state">${t("history_loading")}</div>`;

    let data;
    try {
        data = await apiGet("/history", { init_data: tg.initData, limit: 30 });
    } catch (e) {
        wrap.innerHTML = `<div class="empty-state">${t("history_load_error")}</div>`;
        return;
    }

    if (data.error || !data.items || data.items.length === 0) {
        wrap.innerHTML = `<div class="empty-state">${t("history_empty")}</div>`;
        return;
    }

    const dateLocale = currentLang === "en" ? "en-US" : "ru-RU";

    wrap.innerHTML = data.items.map(item => {
        const dt = new Date(item.created_at);
        const dateStr = isNaN(dt.getTime())
            ? ""
            : dt.toLocaleDateString(dateLocale, { day: "numeric", month: "short" });

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
                <div class="advice-header">
                    <span class="advice-progress-label"></span>
                </div>
                ${buildAdviceChecklistHtml(item.id, item.advice || [], item.advice_progress || [])}
            </div>
        </div>`;
    }).join("");

    wrap.querySelectorAll(".history-body").forEach(el => updateAdviceProgressLabel(el));

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
    wrap.innerHTML = `<div class="empty-state">${t("leaderboard_loading")}</div>`;

    let data;
    try {
        data = await apiGet("/leaderboard", { init_data: tg.initData || "", limit: 30 });
    } catch (e) {
        wrap.innerHTML = `<div class="empty-state">${t("leaderboard_load_error")}</div>`;
        return;
    }

    if (data.error || !data.items || data.items.length === 0) {
        wrap.innerHTML = `<div class="empty-state">${t("leaderboard_empty")}</div>`;
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
            <div class="leaderboard-name">${escapeHtml(row.first_name || t("leaderboard_default_name"))}${row.is_you ? t("leaderboard_you_suffix") : ""}</div>
            <div class="leaderboard-score">${Number(row.latest_rating || 0).toFixed(1)}</div>
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
        showToast(t("toast_telegram_only"));
        return;
    }
    const link = `https://t.me/${BOT_USERNAME}?startapp=ref_${myId}`;
    const text = `${t("invite_share_text")}\n${link}`;

    haptic("medium");

    if (navigator.share) {
        navigator.share({ text }).catch(() => {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        showToast(t("toast_link_copied"));
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

// Названия пакетов переводим на клиенте по id, цену/кредиты берём с сервера.
const PACKAGE_LABELS = {
    ru: { small: "5 анализов", medium: "15 анализов", large: "50 анализов" },
    en: { small: "5 analyses", medium: "15 analyses", large: "50 analyses" },
};

function packageTitle(p) {
    return (PACKAGE_LABELS[currentLang] && PACKAGE_LABELS[currentLang][p.id]) || p.title;
}

async function openPaymentModal() {
    const wrap = document.getElementById("packages-list");
    wrap.innerHTML = `<div class="empty-state">${t("packages_loading")}</div>`;
    openModal("payment-modal");
    haptic("light");

    const packages = await loadPackages();

    if (!packages.length) {
        wrap.innerHTML = `<div class="empty-state">${t("packages_unavailable")}</div>`;
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
                <span class="package-title">${escapeHtml(packageTitle(p))}</span>
                ${p.id === bestValueId ? `<span class="package-badge">${t("package_badge_best")}</span>` : ""}
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
        showToast(t("toast_telegram_only"));
        return;
    }

    haptic("medium");

    const data = await apiPostForm("/create_invoice", {
        init_data: tg.initData,
        package: packageId,
    });

    if (data.error || !data.invoice_link) {
        showToast(data.message || t("toast_invoice_failed"));
        return;
    }

    tg.openInvoice(data.invoice_link, (status) => {
        if (status === "paid") {
            haptic("success");
            launchConfetti();
            showToast(t("toast_payment_success"));
            closeModal("payment-modal");
            loadProfile();
        } else if (status === "failed") {
            haptic("error");
            showToast(t("toast_payment_failed"));
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
    sc.fillText(t("share_out_of_10"), W / 2, 478);

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
    const chipWidths = chipTexts.map(txt => sc.measureText(txt).width + 30);
    const gap = 10;
    const totalW = chipWidths.reduce((a, b) => a + b, 0) + gap * (chipWidths.length - 1);
    let chipX = W / 2 - totalW / 2;
    const chipY = 565;

    chipTexts.forEach((txt, i) => {
        const cw = chipWidths[i];
        sc.fillStyle = "rgba(255,255,255,.08)";
        roundRectPath(sc, chipX, chipY, cw, 34, 17);
        sc.fill();
        sc.fillStyle = "rgba(255,255,255,.85)";
        sc.fillText(txt, chipX + cw / 2, chipY + 23);
        chipX += cw + gap;
    });

    sc.font = "bold 26px -apple-system, Arial";
    sc.fillStyle = "#fff";
    sc.fillText(t("share_brand"), W / 2, 622);

    sc.font = "16px -apple-system, Arial";
    sc.fillStyle = "rgba(255,255,255,.55)";
    sc.fillText(`${t("share_get_your_rating")} @${BOT_USERNAME}`, W / 2, 657);

    sc.font = "12px -apple-system, Arial";
    sc.fillStyle = "rgba(255,255,255,.3)";
    sc.fillText(t("share_ai_generated"), W / 2, 722);
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
        const text = `${t("share_native_text")} ${link}`;

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
            showToast(t("toast_copied_manual_download"));
        }
    }, "image/png");
});

/* ---------------- Main analyze flow ---------------- */
async function analyze() {
    const frontFile = document.getElementById("photo-front").files[0];
    const profileFile = document.getElementById("photo-profile").files[0];

    if (!frontFile) {
        haptic("error");
        showToast(t("toast_select_front"));
        return;
    }

    if (!profileFile) {
        haptic("error");
        showToast(t("toast_select_profile"));
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
    <h3>${t("loading_title")}</h3>
    <p id="ai-text">${t("thinking_phrases")[0]}</p>
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
        resultEl.innerHTML = `<div class="result-wrap">${t("server_unreachable")}</div>`;
        return;
    }

    stopThinkingRotation();
    analyzeBtn.classList.remove("loading");

    if (!response.ok) {
        haptic("error");
        let errorText = t("unknown_error");
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
                <p>${escapeHtml(data.message || t("paywall_default_message"))}</p>
                <button class="share-btn" id="buy-credits-btn">${t("buy_credits_btn")}</button>
            </div>
        </div>`;
        document.getElementById("buy-credits-btn").addEventListener("click", openPaymentModal);
        return;
    }

    if (data.error) {
        haptic("error");
        resultEl.innerHTML = `<div class="result-wrap">${escapeHtml(data.message || t("result_error_generic"))}</div>`;
        return;
    }

    const rating = Number(data.rating) || 0;
    const circumference = 314; // 2 * PI * r(50)
    const offset = circumference - (rating / 10) * circumference;
    const criteriaHtml = buildCriteriaTableHtml(data, modeInput.value, data.deltas);

    let progressChip = "";
    if (data.has_previous && data.deltas && typeof data.deltas.rating === "number" && data.deltas.rating !== 0) {
        const d = data.deltas.rating;
        const up = d > 0;
        progressChip = `<div class="progress-chip ${up ? "delta-up" : "delta-down"}">
            ${up ? "▲" : "▼"} ${Math.abs(d).toFixed(1)} ${t(up ? "progress_up" : "progress_down")}
        </div>`;
    }

    const adviceList = data.advice || [];
    const adviceProgress = adviceList.map(() => false);

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
        ${progressChip}
        <p>${escapeHtml(data.summary || "")}</p>

        ${data.vibe ? `<div class="vibe-pill">🌀 ${escapeHtml(data.vibe)}</div>` : ""}

        ${data.potential ? `<div class="potential-box"><b>${t("potential_title")}</b>${escapeHtml(data.potential)}</div>` : ""}
    </div>

    <div class="criteria-wrap">${criteriaHtml}</div>

    <div class="section">
        <h3>${t("strengths_title")}</h3>
        <ul>${(data.strengths || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </div>

    <div class="section">
        <div class="advice-header">
            <h3>${t("advice_title")}</h3>
            <span class="advice-progress-label" id="advice-progress-label">0/${adviceList.length} ${t("checklist_progress")}</span>
        </div>
        ${buildAdviceChecklistHtml(data.analysis_id, adviceList, adviceProgress)}
    </div>

    <button class="share-btn" id="share-btn">${t("share_result_btn")}</button>

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
applyStaticTranslations();
loadProfile();
handleReferral();