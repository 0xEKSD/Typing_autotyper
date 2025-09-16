import puppeteer from "puppeteer-core";
import dotenv from "dotenv";

dotenv.config();

const username = process.env.Typing_USERNAME;
const password = process.env.Typing_PASSWORD;
const browserExecutablePath = process.env.BROWSER_EXECUTABLE_PATH;

const browser = await puppeteer.launch({
    executablePath: browserExecutablePath,
    headless: true,
    args: ["--no-sandbox"]
});

const [page] = await browser.pages();

function createLog(message, emoji) {
    const timestamp = new Date().toISOString();
    return JSON.stringify({ timestamp, message, emoji });
};

function getRandomSpeed(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

console.log(createLog('Opening student login page...', '⏳'));
await page.goto("https://www.typing.com/student/login/", { waitUntil: "networkidle2" });
console.log(createLog('Login page loaded', '✅'));

console.log(createLog('Typing Username...', '➡️'));
await page.waitForSelector("#form-ele-username");
await page.type("#form-ele-username", username, { delay: 50 });
console.log(createLog('Username entered', '✅'));

console.log(createLog('Clicking next', '➡️'));
await page.click("button[type=submit]");

console.log(createLog('Typing Password...', '➡️'));
await page.waitForFunction(() => {
    const el = document.querySelector("#form-ele-password");
    return el && !el.disabled && el.offsetParent !== null;
});
await page.type("#form-ele-password", password, { delay: 50 });
console.log(createLog('Password entered', '✅'));

await Promise.all([
    page.click("button[type=submit]"),
    page.waitForNavigation({ waitUntil: "networkidle2" })
]);
console.log(createLog('Login successful', '✅'));

console.log(createLog('Navigating to custom lessons tab...', '➡️'));
await page.waitForSelector(".js-tab.path.tab.path--typing.path--subtext.path--roundBottom");
await page.click(".js-tab.path.tab.path--typing.path--subtext.path--roundBottom");

console.log(createLog('Looking for available lessons...', '🔍'));
await page.waitForSelector(".is-active.dashboard-list.Content.lessons.panel");

const lessons = await page.$$eval(".is-active.dashboard-list.Content.lessons.panel > .lesson", nodes => nodes.map(node => {
    const title = node.querySelector(".lesson-title")?.innerText.trim() || "";
    const link = node.querySelector(".lesson-action a.lesson-btn")?.href || "";
    const action = node.querySelector(".lesson-action a.lesson-btn")?.innerText.trim().toLowerCase() || "";
    return { title, link, action };
}));

const lessonTypeCount = lessons.reduce((a, w) => {
    if (w.action === "restart" || w.action === "start" || w.action === "resume") a[w.action] = (a[w.action] || 0) + 1;
    return a;
}, { restart: 0, start: 0, resume: 0 });
console.log(createLog(`${lessons.length} Lessons found: start => ${lessonTypeCount.start}, resume => ${lessonTypeCount.resume}, restart => ${lessonTypeCount.restart}`, '✅'));

const lessonToNavigate = lessons.find(lesson => lesson.action === "resume" || lesson.action === "start");

if (lessonToNavigate) {
    console.log(createLog(`Opening lesson: ${lessonToNavigate.title} (${lessonToNavigate.action})`, '➡️'));
    await page.goto(lessonToNavigate.link, { waitUntil: "networkidle2" });

    const lessonInstructionsElement = await page.$(".bubble.bubble--t.bubble--bg.tac");
    if (lessonInstructionsElement) {
        console.log(createLog('Lesson instruction popup detected, continuing to typing lesson', '⚠️'));
        await Promise.all([
            page.click("button.js-continue-button.btn.btn--a.has-tooltip"),
            page.waitForNavigation({ waitUntil: "networkidle2" })
        ]);
    };

    const typingSpeed = getRandomSpeed(150, 250);
    await page.waitForSelector(".screenBasic-lines");
    console.log(createLog('Lesson typing started. Speed: ' + typingSpeed, '📝'));
    const chars = await page.$$eval(".screenBasic-lines .screenBasic-word .screenBasic-letter", nodes => nodes.map(n => (n.textContent || "").trim()[0] || " "));
    for (const ch of chars) {
        await page.keyboard.type(ch, { delay: typingSpeed });
    }
    console.log(createLog('Finished typing lesson', '✅'));

    console.log(createLog('Successfully completed all available lessons', '🎉'));
    await browser.close();
    console.log(createLog('Browser closed', '✅'));
} else {
    console.log(createLog('No lessons found to Resume or Start', '⚠️'));
    await browser.close();
    console.log(createLog('Browser closed', '✅'));
};
