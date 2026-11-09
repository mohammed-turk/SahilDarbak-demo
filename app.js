"use strict";

/* =====================================================
   سهل دربك - عرض تعريفي بـ 6 لمسات
   كل البيانات وهمية. الصفحات مبنية بنفس markup وCSS المشروع.
===================================================== */

const FAST = 3;                       // سرعة زر "سرّع اللمسة"
const S = { speed: 1, touch: -1, busy: false, token: 0, done: [] };

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const stage = $("#stage");
const site = $("#site");
const cursor = $("#cursor");

class Abort extends Error {}

/* ---------- الوقت (يتأثر بالسرعة لحظياً) ---------- */
function sleep(ms) {
    const tok = S.token;
    return new Promise((resolve, reject) => {
        let acc = 0;
        const timer = setInterval(() => {
            if (tok !== S.token) { clearInterval(timer); reject(new Abort()); return; }
            acc += 20 * S.speed;
            if (acc >= ms) { clearInterval(timer); resolve(); }
        }, 20);
    });
}

/* ---------- المؤشر والحركات ---------- */
function vh() { return window.innerHeight; }

async function reveal(el) {
    const r = el.getBoundingClientRect();
    if (r.top < 130 || r.bottom > vh() - 130) {
        el.scrollIntoView({ block: "center", behavior: S.speed > 1 ? "auto" : "smooth" });
        await sleep(S.speed > 1 ? 120 : 650);
    }
}

async function moveTo(el, fx = 0.5, fy = 0.5) {
    await reveal(el);
    const r = el.getBoundingClientRect();
    cursor.style.setProperty("--cur", (0.7 / S.speed) + "s");
    cursor.style.transform = `translate(${r.left + r.width * fx}px, ${r.top + r.height * fy}px)`;
    await sleep(750);
}

async function click(el, fx = 0.5, fy = 0.5) {
    await moveTo(el, fx, fy);
    cursor.classList.add("click");
    await sleep(220);
    cursor.classList.remove("click");
}

async function typeInto(el, text, delay = 55) {
    el.classList.add("demo-focus");
    for (const ch of text) {
        el.value += ch;
        el.dispatchEvent(new Event("input"));
        await sleep(delay);
    }
    await sleep(150);
    el.classList.remove("demo-focus");
}

async function countTo(el, to, format, steps = 22, ms = 900) {
    for (let i = 1; i <= steps; i++) {
        const eased = 1 - Math.pow(1 - i / steps, 3);
        el.textContent = format(Math.round(to * eased));
        await sleep(ms / steps);
    }
    el.textContent = format(to);
}

async function scrollToEl(el, block = "center") {
    el.scrollIntoView({ block, behavior: S.speed > 1 ? "auto" : "smooth" });
    await sleep(S.speed > 1 ? 150 : 800);
}

async function stagger(els, gap = 260) {
    for (const el of els) {
        el.classList.add("pop-in");
        el.style.display = el.dataset.display || "";
        await sleep(gap);
    }
}

function toast(text, type = "success") {
    const t = document.createElement("div");
    t.className = "im-toast im-toast-" + type;
    t.textContent = text;
    $("#toasts").appendChild(t);
    sleep(2400).then(() => t.remove(), () => t.remove());
}

/* ---------- عرض صفحة ---------- */
async function showPage(html, opts = {}) {
    site.classList.toggle("nonav", !!opts.noNav);
    stage.classList.remove("page-in");
    void stage.offsetWidth;
    stage.innerHTML = html;
    stage.classList.add("page-in");
    window.scrollTo({ top: 0, behavior: "auto" });
    cursor.style.transform = `translate(${window.innerWidth * 0.5}px, ${vh() * 0.7}px)`;
    if (!opts.instant) await sleep(900);
}

const ic = name => `<span class="material-symbols-rounded">${name}</span>`;
const tag = (icon, text) => `<span class="section-tag">${ic(icon)}${text}</span>`;
const nf = n => new Intl.NumberFormat("ar-SA").format(n);
const dateFmt = new Intl.DateTimeFormat("ar-u-ca-gregory-nu-arab", { day: "numeric", month: "long", year: "numeric" });
const fmtDate = iso => dateFmt.format(new Date(iso + "T12:00:00"));


/* =====================================================
   البيانات الوهمية
===================================================== */

const foodOptions = [
    ["halal", "حلال"], ["local_food", "أكل محلي"], ["vegetarian", "نباتي"],
    ["seafood", "مأكولات بحرية"], ["other", "أخرى"]
];

const activityOptions = [
    ["museum", "متاحف"], ["hiking", "تسلق وطبيعة"], ["shopping", "تسوق"], ["beach", "بحر"],
    ["culture", "ثقافة وتاريخ"], ["entertainment", "ترفيه"], ["food", "تجارب أكل"], ["other", "أخرى"]
];

const AI_DESTINATIONS = [
    {
        country: "إستونيا", code: "EE", capital: "تالين", score: 88, top: true,
        weather: "2°C - غائم", holidays: "ما فيه عطلات مؤثرة خلال الرحلة", crowd: "هادئ",
        recommendation: "مدينة قديمة هادية ومتاحف قريبة من بعض، تناسب رحلة فردية بميزانية مريحة.",
        why: ["أجواء المدن القديمة والمتاحف تناسب اهتمامك بالثقافة والتاريخ", "طقس بارد قريب من تفضيلك", "زحمة قليلة ووتيرة رحلة مريحة"],
        headsUp: "الشمس تغيب مبكراً في نوفمبر، فخطط أنشطتك للنهار."
    },
    {
        country: "فنلندا", code: "FI", capital: "هلسنكي", score: 76,
        weather: "-1°C - ثلوج خفيفة", holidays: "ما فيه عطلات مؤثرة خلال الرحلة", crowd: "هادئ",
        recommendation: "تجارب شتوية وطبيعة مميزة وهدوء، لكن تكاليفها أعلى.",
        why: ["طقس بارد يناسبك", "طبيعة وهدوء"],
        headsUp: "تكاليف المعيشة أعلى من المتوسط."
    },
    {
        country: "اليابان", code: "JP", capital: "طوكيو", score: 70,
        weather: "12°C - صحو", holidays: "1 عطلة خلال الرحلة", crowd: "مزدحم",
        recommendation: "ثقافة وتاريخ وتجارب أكل ممتازة، مع ازدحام عالٍ في المعالم الرئيسية.",
        why: ["ثقافة وتاريخ", "تجارب أكل"],
        headsUp: "الازدحام عالٍ في المعالم الرئيسية."
    }
];

const DAYS = [
    { n: 1, date: "2026-11-13", places: [
        { t: "activity", name: "Teatri väljak", time: "11:00", why: "ساحة ثقافية تتناسب مع أجواء المدينة وتفضيلاتك." },
        { t: "restaurant", name: "مطعم ليالي تالين", time: "14:00", why: "أكل محلي وخيارات حلال تناسب شروطك." } ] },
    { n: 2, date: "2026-11-14", places: [
        { t: "activity", name: "Eesti Arhitektuurimuuseum", time: "10:30", why: "متحف يعرض تاريخ العمارة الإستونية بوتيرة هادية." },
        { t: "restaurant", name: "مطبخ الساحة القديمة", time: "13:30", why: "قريب من مسارك وفيه خيارات نباتية وحلال." } ] },
    { n: 3, date: "2026-11-15", places: [
        { t: "activity", name: "Tuletõrjemuuseum", time: "11:00", why: "متحف هادي يناسب سرعة رحلتك المريحة." },
        { t: "restaurant", name: "مطعم ليالي تالين", time: "15:00", why: "غداء متأخر بعد الجولة، ويناسب تفضيلاتك الغذائية." } ] },
    { n: 4, date: "2026-11-16", places: [
        { t: "activity", name: "Tallinn Design House", time: "12:00", why: "تصاميم محلية وهدايا تذكارية مميزة." },
        { t: "restaurant", name: "مطبخ الساحة القديمة", time: "19:00", why: "عشاء قريب من مكان الإقامة." } ] },
    { n: 5, date: "2026-11-17", places: [
        { t: "activity", name: "LVLup! interaktiivne videomängude muuseum", time: "11:30", why: "تجربة ترفيهية تفاعلية خفيفة تكسر روتين المتاحف." },
        { t: "restaurant", name: "مطعم ليالي تالين", time: "14:30", why: "خيار حلال مناسب قريب من النشاط." } ] },
    { n: 6, date: "2026-11-18", places: [
        { t: "activity", name: "Raua tänava lahingu mälestuskivi", time: "10:00", why: "معلم تاريخي يتوافق مع اهتماماتك الثقافية." },
        { t: "restaurant", name: "مطبخ الساحة القديمة", time: "13:00", why: "استراحة غداء قريبة من مسار اليوم." } ] },
    { n: 7, date: "2026-11-19", places: [
        { t: "activity", name: "Katariina kälgu hauaplaadid", time: "11:00", why: "معلم تاريخي وثقافي يختتم أنشطة رحلتك." } ] }
];

const HOTELS = [
    { name: "Hotell Viru", why: "يقع بالقرب من الأنشطة والمواقع المقترحة، وسعره مناسب لميزانيتك.", rating: "8.4/10", price: 57 },
    { name: "Metropol Spa hotel", why: "يحتوي على تقييمات جيدة (8.9 من Expedia و 8.0 من Booking.com).", rating: "8.9/10", price: 29 },
    { name: "City Yard Inn", why: "خيار إقامة بقيمة مقدرة لليلة تناسب بيانات التقييمات العالمية.", rating: "8.0/10", price: 21 }
];

const RESTAURANTS = [
    { name: "مطعم ليالي تالين", why: "أكل محلي مع خيارات حلال واضحة.", rating: "4.6/5", halal: "حلال مؤكد" },
    { name: "مطبخ الساحة القديمة", why: "قريب من مسار الأيام وفيه خيارات نباتية.", rating: "4.3/5", halal: "حلال جزئي" },
    { name: "كافيه الميناء", why: "مكان هادي للاستراحة بعد الجولات.", rating: "4.4/5", halal: "غير متحقق" }
];

const EXTRA_ACTIVITIES = [
    { name: "Euroopa Elamuskeskus", why: "وجهة ثقافية بديلة تناسب الأنشطة الخاصة بك." },
    { name: "Tuletõrjemuuseum", why: "نشاط ثقافي بديل يتماشى مع اهتماماتك." },
    { name: "Teatri väljak", why: "معلم ثقافي إضافي يناسب اهتماماتك كخيار بديل." },
    { name: "1905. aasta revolutsiooni monument", why: "معلم تاريخي وثقافي بديل يناسب تطلعاتك." }
];

const TRIP_PLACES = [
    { type: "activity", name: "Teatri väljak", date: "2026-11-13", notes: "ساحة ثقافية" },
    { type: "activity", name: "Eesti Arhitektuurimuuseum", date: "2026-11-14", notes: "متحف العمارة" },
    { type: "activity", name: "Tuletõrjemuuseum", date: "2026-11-15", notes: "متحف هادي" },
    { type: "activity", name: "Tallinn Design House", date: "2026-11-16", notes: "تصاميم محلية" }
];

const BUDGET = { flight: 3500, stay: 4500, food: 1800, transport: 900, activities: 1200, total: 11900 };

const GUIDE = [
    { title: "نصائح محلية", icon: "lightbulb", items: [
        "أغلب معالم المدينة القديمة تنمشى بسهولة على الأقدام.",
        "الدفع بالبطاقة مقبول في أغلب الأماكن، فلا تحتاج كاش كثير.",
        "تطبيقات التنقل المحلية تسهّل المشاوير داخل المدينة.",
        "بعض المتاحف تغلق يوماً في الأسبوع، تأكد من مواعيدها."] },
    { title: "الآداب والثقافة", icon: "diversity_3", items: [
        "الإستونيون يميلون للهدوء ويحترمون المساحة الشخصية.",
        "التحية البسيطة والابتسامة تكفي في التعامل اليومي.",
        "خفّض صوتك في وسائل النقل والأماكن العامة.",
        "في الكنائس والمواقع التاريخية التزم بالهدوء واللباس المحتشم."] },
    { title: "السلامة", icon: "health_and_safety", items: [
        "المدينة آمنة عموماً، لكن انتبه لمقتنياتك في الأماكن المزدحمة.",
        "الأرصفة قد تكون زلقة في الطقس البارد.",
        "احتفظ بنسخة من جواز سفرك منفصلة عن الأصل."] },
    { title: "أرقام الطوارئ", icon: "call", items: [
        "رقم الطوارئ الموحد: 112.",
        "تأكد من هذه الأرقام محلياً قبل الاعتماد عليها."] }
];

const TRAVELER = {
    name: "تركي", gender: "ذكر", age: 27, home: "الرياض، السعودية", city: "تالين، إستونيا",
    bio: "أحب المشي واستكشاف الأسواق القديمة والتصوير.", km: "2.4",
    invite: "هلا تركي، أنا مسافر لحالي بتالين، وش رايك نمشي المدينة القديمة مع بعض؟",
    chatMe: "حياك الله، نتقابل عند ساحة البلدية الساعة 5؟",
    chatThem: "تمام، أشوفك هناك 👌"
};


/* =====================================================
   قوالب الصفحات (نفس markup المشروع)
===================================================== */

function stepIndicators() {
    const names = ["الرحلة", "جوّك", "الأكل", "الأنشطة", "القيود", "مراجعة"];
    return names.map((n, i) =>
        `<div class="step-indicator${i === 0 ? " active" : ""}" data-indicator="${i + 1}"><span>${i + 1}</span><small>${n}</small></div>`
    ).join('<div class="step-line"></div>');
}

function wizardTitle(icon, h, p) {
    return `<div class="wizard-title"><div class="wizard-title-icon">${ic(icon)}</div><div><h2>${h}</h2><p>${p}</p></div></div>`;
}

function choiceCard(name, value, icon, strong, small) {
    return `<label class="choice-card"><input type="radio" name="${name}" value="${value}">${ic(icon)}<strong>${strong}</strong><small>${small}</small></label>`;
}

function miniChoice(name, value, label, emoji = "") {
    return `<label class="mini-choice"><input type="radio" name="${name}" value="${value}">${emoji ? `<span>${emoji}</span>` : ""}${label}</label>`;
}

function foodItems() {
    return foodOptions.map(([v, l]) => `
        <div class="preference-item" data-food="${v}">
            <div class="preference-content">
                <label class="preference-main"><input type="checkbox" class="food-checkbox" value="${v}"><strong>${l}</strong></label>
                ${v === "other" ? `<input type="text" class="other-food-input" placeholder="اكتب تفضيلك..." style="display:none;">` : ""}
            </div>
            <label class="required-label"><input type="checkbox" class="food-required">شرط أساسي</label>
        </div>`).join("");
}

function activityItems() {
    return activityOptions.map(([v, l]) => `
        <div class="preference-item" data-activity="${v}">
            <label class="preference-main"><input type="checkbox" class="activity-checkbox" value="${v}"><strong>${l}</strong></label>
            <div class="preference-options"><span>الأهمية</span>
                <select class="priority-select">${[1, 2, 3, 4, 5].map(n => `<option value="${n}"${n === 3 ? " selected" : ""}>${n}</option>`).join("")}</select>
            </div>
        </div>`).join("");
}

function wizardHTML() {
    return `
<main class="flow-page"><div class="flow-container">

    <div class="request-header">
        ${tag("route", "خطط رحلتك")}
        <h1>خلنا نعرف رحلتك أكثر ✈️</h1>
        <p>كم خطوة بسيطة، وبعدها نقدر نرتب لك تجربة تناسبك فعلًا.</p>
    </div>

    <div class="request-stepper" id="stepper">${stepIndicators()}</div>
    <div id="requestMessage" class="request-message"></div>

    <section class="wizard-step active" data-step="1"><div class="wizard-card">
        ${wizardTitle("flight", "وش تفاصيل رحلتك؟", "التواريخ، الميزانية ومين مسافر معك.")}
        <div class="form-grid two-columns">
            <div class="form-group"><label>تاريخ بداية الرحلة</label><input id="startDate" type="date"></div>
            <div class="form-group"><label>تاريخ نهاية الرحلة</label><input id="endDate" type="date"></div>
            <div class="form-group"><label>ميزانيتك التقريبية</label>
                <div class="input-with-label"><input id="budget" type="number" placeholder="مثال: 10000"><span>ر.س</span></div></div>
        </div>
        <div class="question-block"><h3>مين مسافر؟</h3>
            <div class="choice-grid travel-type-grid">
                ${choiceCard("travelType", "solo", "person", "لحالي", "رحلة فردية")}
                ${choiceCard("travelType", "couple", "favorite", "شخصين", "رحلة لشخصين")}
                ${choiceCard("travelType", "group", "groups", "مجموعة", "أصدقاء أو مجموعة")}
                ${choiceCard("travelType", "family", "family_restroom", "عائلة", "بالغين وأطفال")}
            </div></div>
        <div class="question-block"><h3>كيف تبي تتنقل بين المدن؟</h3>
            <div class="choice-grid city-mode-grid">
                ${choiceCard("cityPlanMode", "single_city", "location_on", "مدينة واحدة", "رحلتي كلها في مدينة واحدة")}
                ${choiceCard("cityPlanMode", "multi_city_manual", "edit_location_alt", "أنا أختار المدن", "أكثر من مدينة وأرتبها بنفسي")}
                ${choiceCard("cityPlanMode", "multi_city_ai", "auto_awesome", "رتبها لي ✨", "الذكاء الاصطناعي يقترح المدن المناسبة")}
            </div></div>
    </div></section>

    <section class="wizard-step" data-step="2"><div class="wizard-card">
        ${wizardTitle("mood", "وش جوّ الرحلة اللي يعجبك؟", "هذي الأشياء تساعدنا نفهم اختياراتك.")}
        <div class="preference-question"><h3>الطقس اللي تفضله</h3><div class="mini-choice-grid">
            ${miniChoice("weather", "cold", "بارد", "❄️")}${miniChoice("weather", "mild", "معتدل", "🌤️")}${miniChoice("weather", "hot", "حار", "☀️")}${miniChoice("weather", "any", "ما يفرق", "✨")}
        </div></div>
        <div class="preference-question"><h3>الأجواء</h3><div class="mini-choice-grid">
            ${miniChoice("environment", "nature", "طبيعة")}${miniChoice("environment", "city", "مدن")}${miniChoice("environment", "beach", "بحر")}${miniChoice("environment", "mixed", "من كل شيء")}${miniChoice("environment", "any", "ما يفرق")}
        </div></div>
        <div class="preference-question"><h3>الزحمة</h3><div class="mini-choice-grid">
            ${miniChoice("crowdPreference", "low", "أفضل الهدوء")}${miniChoice("crowdPreference", "medium", "وسط")}${miniChoice("crowdPreference", "high", "أحب الأماكن الحيوية")}${miniChoice("crowdPreference", "any", "ما يفرق")}
        </div></div>
        <div class="preference-question"><h3>سرعة رحلتك</h3><div class="mini-choice-grid">
            ${miniChoice("tripPace", "relaxed", "هادية ومريحة")}${miniChoice("tripPace", "moderate", "متوازنة")}${miniChoice("tripPace", "active", "مليانة فعاليات")}
        </div></div>
    </div></section>

    <section class="wizard-step" data-step="3"><div class="wizard-card">
        ${wizardTitle("restaurant", "وش تفضيلاتك بالأكل؟", "اختر اللي يهمك، وإذا كان شرط أساسي فعل الخيار.")}
        <div id="foodPreferences" class="preference-list">${foodItems()}</div>
    </div></section>

    <section class="wizard-step" data-step="4"><div class="wizard-card">
        ${wizardTitle("attractions", "وش الأشياء اللي تستمتع فيها؟", "اختر الأنشطة وحدد أهميتها لك من 1 إلى 5.")}
        <div id="activityPreferences" class="preference-list">${activityItems()}</div>
    </div></section>

    <section class="wizard-step" data-step="5"><div class="wizard-card">
        ${wizardTitle("health_and_safety", "في شيء لازم ننتبه له؟", "حساسية، احتياج خاص، قيد غذائي أو أي ملاحظة مهمة.")}
        <div id="restrictionRows"></div>
        <button id="addRestrictionButton" class="btn btn-light" type="button">${ic("add")}أضف قيد أو ملاحظة</button>
    </div></section>

    <section class="wizard-step" data-step="6"><div class="wizard-card">
        ${wizardTitle("fact_check", "جاهزين؟ 👀", "راجع معلوماتك وبعدين نرسل طلب الرحلة.")}
        <div id="reviewContent" class="review-content"></div>
        <div class="review-note">${ic("auto_awesome")}<p>بعد الإرسال، يصير طلبك جاهز لمرحلة اختيار الوجهة.</p></div>
    </div></section>

    <div class="wizard-navigation">
        <button id="previousButton" class="btn btn-light" type="button" style="visibility:hidden">${ic("arrow_forward")}السابق</button>
        <button id="nextButton" class="btn btn-primary" type="button">التالي${ic("arrow_back")}</button>
        <button id="submitRequestButton" class="btn btn-primary submit-request-button" type="button">${ic("check_circle")}اعتماد طلب الرحلة</button>
    </div>

</div></main>`;
}

function aiCardHTML(d) {
    return `
<article class="ai-destination-card${d.top ? " top-match" : ""}" style="display:none" data-display="block">
    ${d.top ? `<span class="ai-top-match">⭐ أفضل تطابق</span>` : ""}
    <div class="ai-country-header">
        <div class="ai-country-info">
            <div class="ai-country-flag">${d.code}</div>
            <div><h3 class="ai-country-name">${d.country}</h3><p class="ai-country-capital">${d.capital}</p></div>
        </div>
        <div class="ai-score"><strong>${d.score}</strong><span>تطابق</span></div>
    </div>
    <div class="ai-info-list">
        <div class="ai-info-item">${ic("partly_cloudy_day")}<div><strong>الطقس</strong><span>${d.weather}</span></div></div>
        <div class="ai-info-item">${ic("event")}<div><strong>العطلات</strong><span>${d.holidays}</span></div></div>
        <div class="ai-info-item">${ic("groups")}<div><strong>الازدحام</strong><span>${d.crowd}</span></div></div>
    </div>
    <p class="ai-recommendation">${d.recommendation}</p>
    <p class="ai-match-title">ليش تناسبك؟</p>
    <ul class="ai-match-list">${d.why.map(r => `<li>${r}</li>`).join("")}</ul>
    <div class="ai-heads-up">${ic("warning")}<span>${d.headsUp}</span></div>
    <button type="button" class="ai-select-button" data-country="${d.country}">اختر هذه الوجهة${ic("arrow_back")}</button>
</article>`;
}

function tripStartHTML() {
    return `
<main class="trip-start-page"><div class="trip-start-container">

    <section class="trip-start-header">
        ${tag("travel_explore", "وجهتك")}
        <h1>وين ودك تكون رحلتك؟ 🌍</h1>
        <p>اختر وجهتك بنفسك، أو خل الاقتراح الذكي يساعدك لاحقًا.</p>
    </section>

    <div id="tripStartMessage" class="trip-start-message"></div>

    <section class="destination-methods">
        <article class="destination-method active-method">
            <div class="method-icon manual-icon">${ic("location_on")}</div>
            <div class="method-content">
                <span class="method-label">أعرف وين أبي أروح</span>
                <h2>اختر وجهتك بنفسك</h2>
                <p>عندك دولة في بالك؟ حددها ونبدأ نرتب الرحلة.</p>
                <button type="button" class="btn btn-primary">اختر بنفسي${ic("arrow_back")}</button>
            </div>
        </article>

        <article class="destination-method ai-method">
            <div class="ai-badge">AI</div>
            <div class="method-icon ai-icon">${ic("auto_awesome")}</div>
            <div class="method-content">
                <span class="method-label">محتار وين تسافر؟</span>
                <h2>اقترح لي وجهة ✨</h2>
                <p>نخلي الذكاء الاصطناعي يقترح وجهات تناسب جوّ رحلتك.</p>
                <button id="aiDestinationButton" type="button" class="btn ai-button">${ic("auto_awesome")}اقترح لي وجهة</button>
            </div>
        </article>
    </section>

    <section id="aiResultsSection" class="ai-results-section">
        <div class="ai-results-header"><div class="ai-results-title">
            <div class="ai-results-icon">${ic("auto_awesome")}</div>
            <div><span class="ai-results-label">AI TRAVEL MATCH</span><h2>الوجهات المناسبة لك ✨</h2>
                <p>بناءً على تفضيلات رحلتك، الذكاء الاصطناعي اختار لك أفضل الوجهات.</p></div>
        </div></div>
        <div id="aiLoading" class="ai-loading">
            <div class="ai-loading-icon">${ic("auto_awesome")}</div>
            <h3>لحظة ونشوف وين يناسبك 🌍</h3>
            <p>نحلل تفضيلاتك والطقس والعطلات ونبحث عن أفضل الوجهات لك.</p>
            <div class="ai-loading-dots"><span></span><span></span><span></span></div>
        </div>
        <div id="aiResultsContainer" class="ai-results-container"></div>
    </section>

</div></main>`;
}


/* ---------- صفحة الرحلة ---------- */

function recCard(item, typeName) {
    const meta = [];
    if (item.rating) meta.push(`⭐ ${item.rating}`);
    if (item.price != null) meta.push(`تقريبًا ${nf(item.price)} USD / ليلة`);
    if (item.halal) meta.push(item.halal);
    return `
    <article class="recommendation-card">
        <small>${typeName}</small>
        <h3>${item.name}</h3>
        ${item.why ? `<p>${item.why}</p>` : ""}
        ${meta.length ? `<div class="recommendation-meta">${meta.map(m => `<span>${m}</span>`).join("")}</div>` : ""}
        <a href="#" onclick="return false">الموقع الرسمي</a>
    </article>`;
}

function recGroup(title, icon, cards) {
    return `
    <div class="city-recommendation-group">
        <div class="section-card-heading"><div><h3>${title}</h3></div>${ic(icon)}</div>
        <div class="recommendation-grid">${cards}</div>
    </div>`;
}

function dayCardHTML(day) {
    const places = day.places.map(p => `
        <div class="day-activity">
            ${ic(p.t === "restaurant" ? "restaurant" : "local_activity")}
            <div><strong>${p.name}</strong><small>${p.time}</small><p>${p.why}</p></div>
        </div>`).join("");
    return `
    <article class="itinerary-day" style="display:none" data-display="block">
        <div class="itinerary-day-header"><div class="itinerary-day-number">
            <div class="day-number-circle">${day.n}</div>
            <div><h3>اليوم ${day.n}</h3><small>${fmtDate(day.date)}</small></div>
        </div></div>
        <div class="day-activities">${places}</div>
    </article>`;
}

function itineraryResultInner() {
    return `
    <section class="itinerary-city-group">
        <div class="section-card-heading">
            <div><span class="section-small-label">محطة من رحلتك</span><h2>تالين</h2>
                <small>${fmtDate(TRIP.start)} - ${fmtDate(TRIP.end)}</small></div>
            ${ic("location_city")}
        </div>
        <div class="city-itinerary-days" id="dayList">${DAYS.map(dayCardHTML).join("")}</div>
        <div id="recBlocks" style="display:none">
            ${recGroup("فنادق مقترحة", "hotel", HOTELS.map(h => recCard(h, "فندق")).join(""))}
            ${recGroup("مطاعم مقترحة", "restaurant", RESTAURANTS.map(r => recCard(r, "مطعم")).join(""))}
            ${recGroup("أنشطة وتجارب إضافية", "local_activity", EXTRA_ACTIVITIES.map(a => recCard(a, "نشاط")).join(""))}
        </div>
    </section>`;
}

function tripPageHTML() {
    return `
<main class="trip-page"><div class="trip-container">

    <section class="trip-hero">
        <div class="trip-hero-content">
            ${tag("travel", "رحلتك")}
            <h1 id="tripTitle">رحلتك إلى ${TRIP.country} ✈️</h1>
            <p>هنا تلقى تفاصيل الرحلة وخطتك اليومية وميزانيتك.</p>
        </div>
        <div class="trip-status-badge" id="tripStatus">${ic("check_circle")}قيد التخطيط</div>
    </section>

    <div id="tripMessage" class="trip-message"></div>

    <section class="trip-summary-grid">
        <article class="trip-summary-card"><div class="summary-icon">${ic("public")}</div><div><small>الوجهة</small><strong>${TRIP.country}</strong></div></article>
        <article class="trip-summary-card"><div class="summary-icon">${ic("calendar_month")}</div><div><small>تاريخ الرحلة</small><strong>${fmtDate(TRIP.start)} - ${fmtDate(TRIP.end)}</strong></div></article>
        <article class="trip-summary-card"><div class="summary-icon">${ic("payments")}</div><div><small>الميزانية</small><strong>${nf(TRIP.budget)} ر.س</strong></div></article>
        <article class="trip-summary-card"><div class="summary-icon">${ic("group")}</div><div><small>نوع الرحلة</small><strong>فردية</strong></div></article>
    </section>

    <section class="trip-tabs" id="tripTabs">
        <button type="button" class="trip-tab active" data-tab="overview">${ic("dashboard")}نظرة عامة</button>
        <button type="button" class="trip-tab" data-tab="itinerary">${ic("route")}البرنامج</button>
        <button type="button" class="trip-tab" data-tab="places">${ic("location_on")}أماكن الرحلة</button>
        <button type="button" class="trip-tab" data-tab="budget">${ic("account_balance_wallet")}الميزانية</button>
    </section>

    <section id="overviewTab" class="trip-tab-content active">
        <div class="trip-section-card">
            <div class="section-card-heading"><div><span class="section-small-label">مسار الرحلة</span><h2>مدن رحلتك 🗺️</h2></div>
                <span class="material-symbols-rounded heading-icon">location_city</span></div>
            <div class="trip-cities"><div class="trip-city-chip">${ic("location_on")}تالين</div></div>
        </div>
        <div class="trip-section-card">
            <div class="section-card-heading"><div><span class="section-small-label">الخطوة التالية</span><h2>جهز برنامج رحلتك ✨</h2></div>
                <span class="material-symbols-rounded heading-icon">auto_awesome</span></div>
            <p class="section-description">نخلي الذكاء الاصطناعي يرتب لك الفنادق والمطاعم والأنشطة حسب مدن الرحلة وتفضيلاتك.</p>
            <button type="button" class="btn btn-primary">${ic("route")}روح للبرنامج</button>
        </div>
    </section>

    <section id="itineraryTab" class="trip-tab-content">
        <div id="itineraryEmpty" class="trip-section-card empty-section">
            <div class="empty-section-icon">${ic("auto_awesome")}</div>
            <h2>نرتب لك برنامج الرحلة؟</h2>
            <p>بنختار لك أماكن حقيقية ونرتبها يوم بيوم حسب تفضيلاتك ومدن رحلتك.</p>
            <button id="generateItineraryButton" type="button" class="btn btn-primary">${ic("auto_awesome")}أنشئ برنامجي</button>
        </div>
        <div id="itineraryLoading" class="trip-section-card loading-section">
            <span class="material-symbols-rounded loading-icon">progress_activity</span>
            <h3>قاعدين نرتب برنامج رحلتك...</h3>
            <p>نختار الأماكن ونوزعها على الأيام ✨</p>
        </div>
        <div id="itineraryResult" class="itinerary-result">
            <div class="trip-section-card">
                <div class="section-card-heading"><div><span class="section-small-label">خطتك اليومية</span><h2>برنامج الرحلة</h2></div>
                    <span class="material-symbols-rounded heading-icon">calendar_view_day</span></div>
                <div id="itineraryDays" class="itinerary-days">${itineraryResultInner()}</div>
            </div>
            <div class="itinerary-actions" id="itineraryActions">
                <button id="regenerateItineraryButton" type="button" class="btn btn-light">${ic("refresh")}أعد ترتيب البرنامج</button>
                <button id="cancelItineraryButton" type="button" class="btn btn-light">${ic("close")}إلغاء الاقتراح</button>
                <button id="sendItineraryEmailButton" type="button" class="btn btn-light">${ic("mail")}إرسال للإيميل</button>
                <button id="sendTodayWhatsAppButton" type="button" class="btn btn-light" style="display:none">${ic("chat")}إرسال خطة اليوم للواتساب</button>
                <button id="acceptItineraryButton" type="button" class="btn btn-primary">${ic("check_circle")}اعتمد البرنامج</button>
            </div>
        </div>
    </section>

    <section id="placesTab" class="trip-tab-content">
        <div id="tripPlacesLocked" class="trip-section-card empty-section">
            <div class="empty-section-icon">${ic("lock")}</div>
            <h2>اعتمد برنامج الرحلة أول ✨</h2>
            <p>بعد اعتماد البرنامج تقدر تضيف أماكن من اختيارك، وتعدل أو تحذف الأماكن الموجودة في خطتك.</p>
            <button id="goToAcceptItineraryButton" type="button" class="btn btn-primary">${ic("route")}روح للبرنامج</button>
        </div>
        <div id="tripPlacesContent" style="display:none">
            <div class="trip-section-card">
                <div class="section-card-heading"><div><span class="section-small-label">خصص خطتك</span><h2>أماكن رحلتك 📍</h2></div>
                    <span class="material-symbols-rounded heading-icon">map</span></div>
                <p class="section-description">هنا تقدر تشوف الأماكن الموجودة في برنامجك، وتضيف مكان جديد من اختيارك أو تعدل خطتك.</p>
                <button type="button" class="btn btn-primary">${ic("add_location_alt")}أضف مكان</button>
            </div>
            <div class="trip-section-card">
                <div class="section-card-heading"><div><span class="section-small-label">خطتك الحالية</span><h2>الأماكن</h2></div>
                    <span class="material-symbols-rounded heading-icon">location_on</span></div>
                <div id="tripPlacesList" class="trip-places-list">${TRIP_PLACES.map(placeCardHTML).join("")}</div>
            </div>
        </div>
    </section>

    <section id="budgetTab" class="trip-tab-content">
        <div id="budgetEmpty" class="trip-section-card empty-section">
            <div class="empty-section-icon budget-icon">${ic("payments")}</div>
            <h2>نحسب لك ميزانية الرحلة؟</h2>
            <p>نعطيك تقدير تقريبي للطيران والسكن والأكل والمواصلات والأنشطة.</p>
            <div id="budgetOriginFields" style="width:100%;max-width:620px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:22px;text-align:right;">
                <div class="form-group"><label>دولة المغادرة</label><input id="departureCountry" type="text" placeholder="مثال: Saudi Arabia"></div>
                <div class="form-group"><label>مدينة المغادرة</label><input id="departureCity" type="text" placeholder="مثال: Riyadh"></div>
                <div class="form-group"><label>العملة</label><input id="budgetCurrency" type="text" placeholder="SAR"></div>
            </div>
            <button id="generateBudgetButton" type="button" class="btn btn-primary">${ic("calculate")}احسب ميزانيتي</button>
        </div>
        <div id="budgetLoading" class="trip-section-card loading-section">
            <span class="material-symbols-rounded loading-icon">progress_activity</span>
            <h3>نحسب ميزانية رحلتك...</h3>
        </div>
        <div id="budgetResult" class="budget-result">
            <div class="budget-total-card"><small>التقدير الإجمالي</small><strong id="budgetTotal">—</strong><span>SAR</span></div>
            <div class="budget-breakdown">
                ${[["flight", "الطيران", "flightEstimate"], ["hotel", "السكن", "accommodationEstimate"], ["restaurant", "الأكل", "foodEstimate"],
                    ["directions_car", "المواصلات", "transportationEstimate"], ["local_activity", "الأنشطة", "activitiesEstimate"]]
                    .map(([i, l, id]) => `<article class="budget-item" style="opacity:0">${ic(i)}<small>${l}</small><strong id="${id}">—</strong></article>`).join("")}
            </div>
            <div id="budgetSummary" class="budget-summary"></div>
            <div class="budget-actions"><button id="refreshBudgetButton" type="button" class="btn btn-light">${ic("refresh")}حدث التقدير</button></div>
        </div>
    </section>

</div></main>`;
}

function placeCardHTML(p) {
    const icon = { activity: "local_activity", restaurant: "restaurant", hotel: "hotel" }[p.type] || "location_on";
    const label = { activity: "نشاط", restaurant: "مطعم", hotel: "فندق" }[p.type] || "مكان";
    return `
    <article class="trip-place-card">
        <div class="trip-place-card-main">
            <div class="trip-place-icon">${ic(icon)}</div>
            <div class="trip-place-info">
                <small>${label}</small>
                <h3>${p.name}</h3>
                <div class="trip-place-meta">
                    <span>${ic("calendar_month")}${fmtDate(p.date)}</span>
                    <span>${ic("location_city")}Tallinn</span>
                </div>
                ${p.notes ? `<p>${p.notes}</p>` : ""}
                <a href="#" onclick="return false">الموقع الرسمي</a>
            </div>
        </div>
        <div class="trip-place-actions">
            <button type="button" class="btn btn-light">${ic("edit")}تعديل</button>
            <button type="button" class="btn btn-light">${ic("delete")}حذف</button>
        </div>
    </article>`;
}

/* ---------- تسجيل الوصول، المدينة، المسافرون، الاتصالات ---------- */

function checkinHTML() {
    return `
<main class="im-page"><section class="im-container im-narrow">
    <div class="im-card im-center">
        <div class="im-icon-circle">${ic("location_on")}</div>
        <h1 class="im-title">وصلت؟ خبّرنا وين أنت 📍</h1>
        <p class="im-text">نحدد مدينتك من موقعك، وبعدها نعطيك دليل المدينة ونوريك المسافرين حولك.</p>
        <button id="gpsBtn" type="button" class="btn btn-primary im-btn-full">${ic("my_location")}<span>استخدم موقعي الحالي</span></button>
        <details class="im-manual"><summary>أو أدخل الإحداثيات يدويًا</summary></details>
    </div>
</section></main>`;
}

function cityHTML() {
    return `
<main class="im-page"><section class="im-container">
    <div class="im-city-top">
        <div><h1 class="im-title">انغمس في مدينتك 🌆</h1>
            <p class="im-text">نصايح تعرّفك على المدينة، ومسافرين حولك لو ودك بصحبة.</p></div>
        <div class="im-stat">${ic("group")}<div><strong id="nearbyCount">-</strong><div>مسافر حولك</div></div></div>
    </div>
    <h2 class="im-section-title">دليل المدينة</h2>
    <div id="guideLoader" class="im-loader"><span class="material-symbols-rounded loading-icon">progress_activity</span><p>نجهز لك الدليل...</p></div>
    <div id="guideGrid" class="im-guide-grid"></div>
    <div class="im-links">
        <a id="goNearby" class="btn btn-primary">${ic("travel_explore")}<span>المسافرين حولي</span></a>
        <a class="btn btn-secondary"><span>الدعوات</span></a>
        <a class="btn btn-secondary"><span>اتصالاتي</span></a>
        <button type="button" class="btn btn-secondary">${ic("logout")}<span>تسجيل المغادرة</span></button>
    </div>
</section></main>`;
}

function travelMatchHTML() {
    return `
<main class="im-page"><section class="im-container">
    <div class="tm-top">
        <div><h1 class="im-title">مسافرين حولك 🧳</h1>
            <p class="im-text">ناس مثلك في نفس مدينتك، أرسل لهم دعوة وتعرفوا على بعض.</p></div>
        <div class="tm-top-links">
            <a class="btn btn-secondary">${ic("arrow_forward")}<span>دليل المدينة</span></a>
            <a class="btn btn-primary">${ic("mail")}<span>دعواتي</span></a>
        </div>
    </div>
    <div id="tmLoader" class="im-loader"><span class="material-symbols-rounded loading-icon">progress_activity</span></div>
    <div id="tmGrid" class="tm-grid"></div>
</section></main>

<div id="tmModal" class="tm-modal" style="display:none;">
    <div class="tm-modal-box im-card">
        <h2><span>دعوة</span> <span id="tmModalName">${TRAVELER.name}</span></h2>
        <label class="im-field"><span>رسالتك</span>
            <textarea id="tmMessage" maxlength="300" rows="4"></textarea>
            <span class="im-counter"><span id="tmMsgCount">0</span> / 300</span></label>
        <div class="tm-modal-actions">
            <button id="tmSendBtn" type="button" class="btn btn-primary">${ic("send")}<span>أرسل الدعوة</span></button>
            <button type="button" class="btn btn-secondary"><span>إلغاء</span></button>
        </div>
    </div>
</div>`;
}

function travelerCardHTML() {
    return `
<article class="im-card tm-card pop-in">
    <div class="tm-card-head">
        <div class="tm-avatar">${ic("person")}</div>
        <div><div class="tm-name">${TRAVELER.name}</div><div class="tm-meta"><span>${TRAVELER.gender}</span> · ${TRAVELER.age}</div></div>
    </div>
    <div class="tm-origin">${ic("home")}<span>${TRAVELER.home}</span></div>
    <p class="tm-bio">${TRAVELER.bio}</p>
    <div class="tm-distance">${TRAVELER.km} <span>كم منك</span></div>
    <button id="inviteBtn" type="button" class="btn btn-primary">${ic("send")}<span>أرسل دعوة</span></button>
</article>`;
}

function connectionsHTML() {
    return `
<main class="im-page"><section class="im-container">
    <div class="cn-top">
        <div><h1 class="im-title">اتصالاتي 💬</h1>
            <p class="im-text">المسافرين اللي قبلوا دعوتك، تقدر تسولف معهم أو تاخذ رقمهم.</p></div>
        <div class="cn-top-links">
            <a class="btn btn-secondary">${ic("mail")}<span>دعواتي</span></a>
            <a class="btn btn-secondary">${ic("block")}<span>المحظورين</span></a>
        </div>
    </div>
    <div id="cnLoader" class="im-loader"><span class="material-symbols-rounded loading-icon">progress_activity</span></div>
    <div id="cnGrid" class="cn-grid"></div>
</section></main>

<div id="cnChat" class="cn-chat" style="display:none;">
    <div class="cn-chat-box im-card">
        <div class="cn-chat-head"><h2 id="cnChatName">${TRAVELER.name}</h2>
            <button type="button" class="cn-chat-close">${ic("close")}</button></div>
        <div id="cnMessages" class="cn-messages"></div>
        <form id="cnChatForm" class="cn-chat-form" onsubmit="return false">
            <input id="cnChatInput" type="text" autocomplete="off" placeholder="اكتب رسالتك...">
            <button type="submit" class="btn btn-primary">${ic("send")}</button>
        </form>
    </div>
</div>`;
}

function connectionCardHTML() {
    return `
<article class="im-card cn-card pop-in">
    <div class="cn-person">
        <div class="cn-avatar">${ic("person")}</div>
        <div><div class="cn-name">${TRAVELER.name}</div><div class="cn-meta">${TRAVELER.city}</div></div>
    </div>
    <p class="cn-bio">${TRAVELER.bio}</p>
    <div class="cn-actions">
        <button id="chatBtn" type="button" class="btn btn-primary">${ic("chat")}<span>محادثة</span></button>
        <button type="button" class="btn btn-secondary">${ic("block")}<span>حظر</span></button>
    </div>
</article>`;
}


/* =====================================================
   اللمسات
===================================================== */

const TRIP = { country: "إستونيا - تالين", start: "2026-11-13", end: "2026-11-19", budget: 29999 };

const show = (el, display = "block") => { el.style.display = display; };
const hide = el => { el.style.display = "none"; };

async function pick(selector) {
    const input = $(selector);
    await click(input.closest("label"));
    input.checked = true;
    input.dispatchEvent(new Event("change"));
    await sleep(380);
}

function activateTab(name) {
    $$(".trip-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === name));
    $$(".trip-tab-content").forEach(c => c.classList.remove("active"));
    $("#" + name + "Tab").classList.add("active");
}

async function openTab(name) {
    await click($(`.trip-tab[data-tab="${name}"]`));
    activateTab(name);
    window.scrollTo({ top: 0, behavior: "smooth" });
    await sleep(S.speed > 1 ? 250 : 800);
}

/* ---------- اللمسة 1: طلب الرحلة ---------- */

function goStep(n) {
    $$(".wizard-step").forEach(s => s.classList.toggle("active", +s.dataset.step === n));
    $$(".step-indicator").forEach(i => {
        const k = +i.dataset.indicator;
        i.classList.toggle("active", k === n);
        i.classList.toggle("completed", k < n);
    });
    $("#previousButton").style.visibility = n === 1 ? "hidden" : "visible";
    $("#nextButton").style.display = n === 6 ? "none" : "inline-flex";
    $("#submitRequestButton").style.display = n === 6 ? "inline-flex" : "none";
    if (n === 6) renderReview();
    const y = $("#stepper").getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: y, behavior: S.speed > 1 ? "auto" : "smooth" });
}

function renderReview() {
    const card = (small, strong) => `<div class="review-card"><small>${small}</small><strong>${strong}</strong></div>`;
    $("#reviewContent").innerHTML =
        card("التواريخ", `${$("#startDate").value} - ${$("#endDate").value}`) +
        card("الميزانية", `${$("#budget").value} ر.س`) +
        card("نوع الرحلة", "رحلة فردية") +
        card("تخطيط المدن", "مدينة واحدة");
}

async function nextStep(n) {
    await click($("#nextButton"));
    goStep(n);
    await sleep(900);
}

async function touch1() {
    await showPage(wizardHTML());

    // الخطوة 1
    const sd = $("#startDate"); await click(sd); sd.value = "2026-11-13"; await sleep(450);
    const ed = $("#endDate");   await click(ed); ed.value = "2026-11-19"; await sleep(450);
    const bd = $("#budget");    await click(bd); await typeInto(bd, "29999", 90);
    await pick('input[name="travelType"][value="solo"]');
    await pick('input[name="cityPlanMode"][value="single_city"]');
    await nextStep(2);

    // الخطوة 2
    await pick('input[name="weather"][value="cold"]');
    await pick('input[name="environment"][value="city"]');
    await pick('input[name="crowdPreference"][value="low"]');
    await pick('input[name="tripPace"][value="relaxed"]');
    await nextStep(3);

    // الخطوة 3
    for (const sel of ['[data-food="halal"] .food-checkbox', '[data-food="halal"] .food-required', '[data-food="local_food"] .food-checkbox']) {
        const cb = $(sel);
        await click(cb.closest("label"));
        cb.checked = true;
        await sleep(300);
    }
    await nextStep(4);

    // الخطوة 4
    for (const [key, level] of [["culture", "5"], ["museum", "4"], ["hiking", "3"]]) {
        const cb = $(`[data-activity="${key}"] .activity-checkbox`);
        await click(cb.closest("label"));
        cb.checked = true;
        const sel = $(`[data-activity="${key}"] .priority-select`);
        if (level !== "3") { await click(sel); sel.value = level; }
        await sleep(350);
    }
    await nextStep(5);

    // الخطوة 5
    await click($("#addRestrictionButton"));
    $("#restrictionRows").innerHTML = `
        <div class="restriction-row pop-in">
            <select class="restriction-type"><option value="allergy">حساسية</option><option value="accessibility">سهولة الوصول</option><option value="dietary" selected>قيد غذائي</option><option value="medical">احتياج صحي</option><option value="other">أخرى</option></select>
            <input type="text" class="restriction-description" placeholder="اكتب التفاصيل">
            <label class="required-label"><input type="checkbox" class="restriction-required">شرط أساسي</label>
            <button type="button" class="remove-row-button">${ic("delete")}</button>
        </div>`;
    await sleep(500);
    const desc = $(".restriction-description");
    await click(desc);
    await typeInto(desc, "بدون كحول في الطبخ", 60);
    const rq = $(".restriction-required");
    await click(rq.closest("label")); rq.checked = true; await sleep(300);
    await nextStep(6);

    // الخطوة 6
    await sleep(900);
    const submit = $("#submitRequestButton");
    await click(submit);
    submit.disabled = true;
    const msg = $("#requestMessage");
    msg.className = "request-message success";
    msg.textContent = "تم اعتماد طلب الرحلة بنجاح ✨";
    window.scrollTo({ top: $("#stepper").getBoundingClientRect().top + window.scrollY - 110, behavior: "smooth" });
    await sleep(1600);
}

/* ---------- اللمسة 2: الذكاء يقترح الوجهة ---------- */

async function touch2() {
    await showPage(tripStartHTML());

    await click($("#aiDestinationButton"));
    $("#aiResultsSection").classList.add("show");
    $("#aiLoading").classList.add("show");
    await scrollToEl($("#aiResultsSection"), "start");
    await sleep(2600);
    $("#aiLoading").classList.remove("show");

    const box = $("#aiResultsContainer");
    box.innerHTML = AI_DESTINATIONS.map(aiCardHTML).join("");
    await stagger($$(".ai-destination-card", box), 420);
    await sleep(900);
    await scrollToEl($(".ai-destination-card", box), "center");
    await sleep(1400);

    const pickBtn = $('.ai-select-button[data-country="إستونيا"]');
    await click(pickBtn);
    pickBtn.closest(".ai-destination-card").style.outline = "3px solid var(--secondary)";
    const m = $("#tripStartMessage");
    m.className = "trip-start-message info";
    m.textContent = "اخترت إستونيا - تالين، نجهز لك رحلتك...";
    window.scrollTo({ top: 0, behavior: "smooth" });
    await sleep(1800);
}

/* ---------- اللمسة 3: البرنامج + الاعتماد ---------- */

async function touch3() {
    await showPage(tripPageHTML());
    await sleep(900);

    await openTab("itinerary");
    await click($("#generateItineraryButton"));
    hide($("#itineraryEmpty"));
    show($("#itineraryLoading"), "flex");
    await sleep(2800);
    hide($("#itineraryLoading"));
    show($("#itineraryResult"));
    window.scrollTo({ top: 0, behavior: "auto" });

    // الأيام تنزل يوم بيوم
    const days = $$("#dayList .itinerary-day");
    for (let i = 0; i < days.length; i++) {
        days[i].classList.add("pop-in");
        days[i].style.display = "block";
        if (i === 1 || i === 3 || i === 5) await scrollToEl(days[i], "center");
        await sleep(420);
    }
    await sleep(700);

    // الفنادق والمطاعم والأنشطة وشارات الحلال
    const rec = $("#recBlocks");
    show(rec);
    rec.classList.add("pop-in");
    const groups = $$(".city-recommendation-group", rec);
    for (const g of groups) {
        await scrollToEl(g, "center");
        await sleep(S.speed > 1 ? 400 : 1500);
    }

    // أماكن الرحلة مقفلة قبل الاعتماد
    await openTab("places");
    await sleep(1500);
    await click($("#goToAcceptItineraryButton"));
    activateTab("itinerary");
    window.scrollTo({ top: 0, behavior: "auto" });
    await sleep(300);

    // اعتماد البرنامج
    const accept = $("#acceptItineraryButton");
    await click(accept);
    accept.disabled = true;
    accept.innerHTML = `${ic("check_circle")}البرنامج معتمد`;
    hide($("#regenerateItineraryButton"));
    hide($("#cancelItineraryButton"));
    show($("#sendTodayWhatsAppButton"), "inline-flex");
    const msg = $("#tripMessage");
    msg.className = "trip-message success";
    msg.textContent = "تم اعتماد برنامج الرحلة بنجاح ✨";
    await scrollToEl(msg, "center");
    await sleep(1400);

    // أماكن الرحلة تنفتح بعد الاعتماد
    await openTab("places");
    hide($("#tripPlacesLocked"));
    show($("#tripPlacesContent"));
    await scrollToEl($("#tripPlacesList"), "center");
    await stagger($$("#tripPlacesList .trip-place-card"), 350);
    await sleep(1400);
}

/* ---------- اللمسة 4: الميزانية ---------- */

async function touch4() {
    if (!$("#budgetTab")) await showPage(tripPageHTML());
    await openTab("budget");

    for (const [id, value] of [["departureCountry", "Saudi Arabia"], ["departureCity", "Riyadh"], ["budgetCurrency", "SAR"]]) {
        const el = $("#" + id);
        await click(el);
        await typeInto(el, value, 70);
    }
    await click($("#generateBudgetButton"));
    hide($("#budgetEmpty"));
    show($("#budgetLoading"), "flex");
    await sleep(2200);
    hide($("#budgetLoading"));
    show($("#budgetResult"));
    window.scrollTo({ top: 0, behavior: "auto" });

    const cur = " SAR";
    const rows = [
        ["flightEstimate", BUDGET.flight], ["accommodationEstimate", BUDGET.stay], ["foodEstimate", BUDGET.food],
        ["transportationEstimate", BUDGET.transport], ["activitiesEstimate", BUDGET.activities]
    ];
    const totalEl = $("#budgetTotal");
    await Promise.all([
        countTo(totalEl, BUDGET.total, nf, 26, 1200),
        (async () => {
            const items = $$(".budget-item");
            for (let i = 0; i < items.length; i++) {
                items[i].style.opacity = "";
                items[i].classList.add("pop-in");
                countTo($("#" + rows[i][0]), rows[i][1], v => nf(v) + cur, 16, 700).catch(() => {});
                await sleep(300);
            }
        })()
    ]);
    await sleep(500);
    const sum = $("#budgetSummary");
    sum.textContent = `تقدير رحلتك إلى تالين أقل من ميزانيتك (${nf(TRIP.budget)} ر.س)، وتبقى لك مساحة مريحة للأكل والأنشطة. هذه التقديرات تخطيطية وليست أسعاراً مضمونة.`;
    sum.classList.add("pop-in");
    await scrollToEl(sum, "center");
    await sleep(1200);

    const refresh = $("#refreshBudgetButton");
    await click(refresh);
    const icon = $(".material-symbols-rounded", refresh);
    icon.classList.add("loading-icon");
    await countTo(totalEl, BUDGET.total, nf, 14, 700);
    icon.classList.remove("loading-icon");
    await sleep(900);
}

/* ---------- اللمسة 5: الوصول ودليل المدينة ---------- */

async function touch5() {
    await showPage(checkinHTML());
    const gps = $("#gpsBtn");
    await click(gps);
    gps.disabled = true;
    gps.innerHTML = `<span class="material-symbols-rounded loading-icon">progress_activity</span>`;
    await sleep(1500);
    toast("تم تسجيل وصولك 🎉");
    await sleep(1400);

    await showPage(cityHTML());
    await sleep(500);
    await countTo($("#nearbyCount"), 1, v => String(v), 1, 100);
    await sleep(1500);
    hide($("#guideLoader"));
    const grid = $("#guideGrid");
    grid.innerHTML = GUIDE.map(g => `
        <article class="im-card im-guide-card" style="display:none" data-display="block">
            <h3>${ic(g.icon)}<span>${g.title}</span></h3>
            <ul>${g.items.map(i => `<li>${i}</li>`).join("")}</ul>
        </article>`).join("");
    await stagger($$(".im-guide-card", grid), 520);
    await sleep(900);
    const go = $("#goNearby");
    await click(go);
    go.style.boxShadow = "0 0 0 4px rgba(244,162,97,.45)";
    await sleep(900);
}

/* ---------- اللمسة 6: مسافرين حولك + دعوة + شات ---------- */

async function touch6() {
    await showPage(travelMatchHTML());
    await sleep(1100);
    hide($("#tmLoader"));
    $("#tmGrid").innerHTML = travelerCardHTML();
    await sleep(1300);

    await click($("#inviteBtn"));
    const modal = $("#tmModal");
    show(modal, "flex");
    const area = $("#tmMessage");
    await sleep(500);
    area.classList.add("demo-focus");
    for (const ch of TRAVELER.invite) {
        area.value += ch;
        $("#tmMsgCount").textContent = area.value.length;
        await sleep(32);
    }
    area.classList.remove("demo-focus");
    await sleep(500);

    const send = $("#tmSendBtn");
    await click(send);
    send.disabled = true;
    send.innerHTML = `<span class="material-symbols-rounded loading-icon">progress_activity</span>`;
    await sleep(900);
    hide(modal);
    const inv = $("#inviteBtn");
    inv.disabled = true;
    inv.className = "btn btn-secondary";
    inv.innerHTML = `${ic("check")}<span>تم إرسال الدعوة</span>`;
    toast("انرسلت الدعوة 🎉");
    await sleep(1600);

    // فاصل: قبول الدعوة
    const inter = document.createElement("div");
    inter.className = "demo-interlude";
    inter.innerHTML = `<div>${ic("hourglass_top")}بعد ما يقبل ${TRAVELER.name} الدعوة…</div>`;
    document.body.appendChild(inter);
    await sleep(2200);
    inter.remove();

    await showPage(connectionsHTML());
    await sleep(900);
    hide($("#cnLoader"));
    $("#cnGrid").innerHTML = connectionCardHTML();
    await sleep(1200);

    await click($("#chatBtn"));
    const chat = $("#cnChat");
    show(chat, "flex");
    await sleep(700);
    const input = $("#cnChatInput");
    await click(input);
    await typeInto(input, TRAVELER.chatMe, 50);
    await click($("#cnChatForm button"));
    const box = $("#cnMessages");
    box.insertAdjacentHTML("beforeend", `<div class="cn-msg cn-msg-me pop-in">${input.value}</div>`);
    input.value = "";
    await sleep(1300);
    box.insertAdjacentHTML("beforeend", `<div class="cn-msg cn-msg-them pop-in">${TRAVELER.chatThem}</div>`);
    box.scrollTop = box.scrollHeight;
    await sleep(2000);
}

// رابط المشروع في زر GitHub (غيّره لرابط الريبو الموحد بعد إنشائه)
const REPO_URL = "https://github.com/mohammed-turk/SahilDarbak";

// فريق العمل (ضع رابط LinkedIn لرزان في linkedin؛ إذا تُرك فاضي يُخفى الزر)
const TEAM = [
    { name: "Razan Almadan", linkedin: "https://www.linkedin.com/in/razanalmadan/" },
    { name: "Lama Alharbi", linkedin: "https://www.linkedin.com/in/lama-alharbi-372bb920a/" },
    { name: "Mohammed Aljubaili", linkedin: "https://www.linkedin.com/in/mohammed-aljubaili/" }
];

const LI_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>`;

const TOUCHES = [
    { name: "طلب الرحلة", desc: "ويزارد من 6 خطوات يعرّف سهل دربك على ذوقك وميزانيتك.", run: touch1 },
    { name: "الذكاء يقترح وجهتك", desc: "يحلل الطقس والعطلات والازدحام ويرشّح لك الأنسب، وأنت تختار.", run: touch2 },
    { name: "برنامج تعتمده أنت", desc: "أيام وفنادق ومطاعم مع حالة الحلال، ولا يصير خطتك إلا بعد اعتمادك.", run: touch3 },
    { name: "ميزانية تقديرية", desc: "تقدير للطيران والسكن والأكل والمواصلات والأنشطة.", run: touch4 },
    { name: "وصلت؟ دليل مدينتك", desc: "تسجيل وصول بموقعك، ثم دليل محلي جاهز للمدينة.", run: touch5 },
    { name: "مسافرين حولك", desc: "دعوة لمسافر قريب، وبعد القبول محادثة مباشرة.", run: touch6 }
];


/* =====================================================
   الواجهة: شريط التحكم، المقدمة، الختام
===================================================== */

const ctl = {
    bar: $("#controlBar"), title: $("#ctlTitle"), desc: $("#ctlDesc"),
    speed: $("#speedBtn"), speedLabel: $("#speedLabel"),
    next: $("#nextBtn"), nextLabel: $("#nextLabel"), dots: $("#demoDots"),
    hint: $("#doneHint"), dim: $("#dimLayer")
};
ctl.dots.innerHTML = TOUCHES.map(() => "<i></i>").join("");

function updateUI() {
    const i = S.touch;
    $$("i", ctl.dots).forEach((d, k) => {
        d.className = S.done[k] ? "done" : (k === i && S.busy ? "on" : "");
    });
    ctl.bar.hidden = i >= TOUCHES.length;

    // المؤشر الوهمي يظهر فقط أثناء اللمسة، والتعتيم والتنبيه عند انتهائها
    const ready = !S.busy && i >= 0 && i < TOUCHES.length && !!S.done[i];
    cursor.classList.toggle("visible", S.busy);
    ctl.dim.classList.toggle("on", ready);
    ctl.hint.hidden = !ready;
    ctl.next.classList.toggle("pulse", ready || i < 0);
    ctl.speed.hidden = !S.busy;
    ctl.speed.classList.toggle("active", S.speed > 1);
    ctl.speedLabel.textContent = S.speed > 1 ? "سرعة عادية" : "سرّع اللمسة";

    if (i < 0) {
        ctl.title.textContent = "سهل دربك في 6 لمسات";
        ctl.desc.textContent = "اضغط ابدأ وشاهد رحلة كاملة من الطلب حتى الدردشة.";
        ctl.nextLabel.textContent = "ابدأ العرض";
        ctl.next.disabled = false;
        return;
    }
    if (i >= TOUCHES.length) return;
    ctl.title.textContent = `اللمسة ${i + 1} من ${TOUCHES.length} · ${TOUCHES[i].name}`;
    ctl.desc.textContent = TOUCHES[i].desc;
    ctl.next.disabled = S.busy;
    ctl.nextLabel.textContent = S.busy ? "جارية…" : (i < TOUCHES.length - 1 ? `اللمسة ${i + 2}` : "الختام");
}

async function runTouch(i) {
    const tok = ++S.token;
    S.touch = i;
    S.busy = true;
    S.speed = 1;
    // نثبّت المؤشر في الوسط وهو مخفي قبل ما يظهر
    cursor.style.transition = "none";
    cursor.style.transform = `translate(${window.innerWidth * 0.5}px, ${vh() * 0.7}px)`;
    void cursor.offsetWidth;
    cursor.style.transition = "";
    updateUI();
    try {
        await TOUCHES[i].run();
        if (tok !== S.token) return;
        S.done[i] = true;
    } catch (e) {
        if (!(e instanceof Abort)) console.error(e);
        return;
    }
    S.busy = false;
    S.speed = 1;
    updateUI();
}

ctl.speed.addEventListener("click", () => {
    S.speed = S.speed > 1 ? 1 : FAST;
    updateUI();
});

ctl.next.addEventListener("click", async () => {
    if (S.busy) return;
    if (S.touch < TOUCHES.length - 1) {
        await runTouch(S.touch + 1);
    } else {
        showOutro();
    }
});

function introHTML() {
    return `
<div class="demo-hero"><div class="demo-hero-card">
    <img class="demo-hero-logo" src="assets/logo.png" alt="سهل دربك">
    <h1>استكشف سهل دربك<br>بـ 6 لمسات</h1>
    <p>رحلة كاملة من أول طلب حتى الدردشة مع مسافر قريب منك، بنفس صفحات المشروع، وببيانات تجريبية.</p>
    <div class="demo-steps">
        <div>1. اضغط ابدأ<small>والبيانات تتعبأ قدامك</small></div>
        <div>2. شاهد اللمسة<small>صفحات تنتقل لحالها</small></div>
        <div>3. سرّع إذا تبي<small>زر "سرّع اللمسة"</small></div>
    </div>
</div></div>`;
}

function outroHTML() {
    return `
<div class="demo-hero"><div class="demo-hero-card">
    ${tag("flag", "انتهت اللمسات")}
    <h1>هذا اللي يسويه سهل دربك</h1>
    <p>الذكاء الاصطناعي يقترح، وأنت اللي تقرر. من طلب بسيط إلى رحلة جاهزة وصحبة في وجهتك.</p>
    <div class="demo-stats">
        <div class="demo-stat"><strong>18</strong><span>صفحة في المشروع</span></div>
        <div class="demo-stat"><strong>6</strong><span>خدمات خارجية</span></div>
        <div class="demo-stat"><strong>1</strong><span>مبدأ: أنت تقرر</span></div>
    </div>
    <div class="demo-more">وفيه أكثر: أدوات الرحلة (الطقس والإجازات والشنطة والتنقل)، مجتمع التجارب، مقارنة الدول، وإضافة أماكنك للبرنامج.</div>
    <div class="demo-links">
        <a class="btn btn-primary" href="${REPO_URL}" target="_blank" rel="noopener">${ic("code")}المشروع على GitHub</a>
        <button id="replayBtn" class="btn btn-secondary" type="button">${ic("replay")}أعد العرض</button>
    </div>
    <h3 class="demo-team-title">فريق العمل</h3>
    <div class="demo-team-grid">
        ${TEAM.map(m => `
        <div class="demo-member">
            <strong dir="ltr">${m.name}</strong>
            ${m.linkedin ? `<a class="btn btn-secondary demo-li" href="${m.linkedin}" target="_blank" rel="noopener">${LI_ICON}<span>LinkedIn</span></a>` : ""}
        </div>`).join("")}
    </div>
</div></div>`;
}

async function showOutro() {
    S.token++;
    S.touch = TOUCHES.length;
    S.busy = false;
    updateUI();
    await showPage(outroHTML(), { noNav: true, instant: true });
    $("#replayBtn").addEventListener("click", resetDemo);
}

async function resetDemo() {
    S.token++;
    S.touch = -1; S.busy = false; S.speed = 1; S.done = [];
    $("#toasts").innerHTML = "";
    updateUI();
    await showPage(introHTML(), { noNav: true, instant: true });
}

resetDemo();
