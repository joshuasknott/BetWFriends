// Quick mobile+desktop screenshot audit. Run against the dev server.
// Usage: node scripts/audit-screens.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.AUDIT_BASE ?? "http://localhost:3000";
const OUT = "./screenshots";
mkdirSync(OUT, { recursive: true });

const MOBILE = { width: 375, height: 812 }; // iPhone 13 mini
const DESKTOP = { width: 1440, height: 900 };

const ROUTES = [
  { name: "landing", path: "/" },
  { name: "login", path: "/login" },
  { name: "register", path: "/register" },
  { name: "dashboard", path: "/dashboard", auth: true },
  { name: "wallet", path: "/wallet", auth: true },
  { name: "profile", path: "/profile", auth: true },
  { name: "group-new", path: "/groups/new", auth: true },
  { name: "group-join", path: "/groups/join", auth: true },
];

async function login(page) {
  // Go to landing first so the CSRF cookie gets set, then to login.
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  // If already redirected to dashboard, we're logged in.
  if (page.url().includes("/dashboard")) return;
  await page.waitForSelector('[name="email"]', { state: "visible", timeout: 15000 });
  await page.fill('[name="email"]', "josh@example.com");
  await page.fill('[name="password"]', "password");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

async function run() {
  const browser = await chromium.launch();
  for (const viewport of [
    { label: "mobile", config: MOBILE },
    { label: "desktop", config: DESKTOP },
  ]) {
    const ctx = await browser.newContext({
      viewport: viewport.config,
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    let loggedIn = false;

    for (const route of ROUTES) {
      if (route.auth && !loggedIn) {
        await login(page);
        loggedIn = true;
      }
      await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      await page.screenshot({
        path: `${OUT}/${viewport.label}-${route.name}.png`,
        fullPage: true,
      });
      console.log(`✓ ${viewport.label}/${route.name}`);
    }
    await ctx.close();
  }
  await browser.close();
  console.log(`\nScreenshots saved to ${OUT}/`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
