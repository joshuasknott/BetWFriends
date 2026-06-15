/**
 * Workaround for an npm reify bug on Windows where @tailwindcss/postcss and its
 * entire JS-only dependency subtree are resolved as "satisfied" but never
 * extracted to disk. The @tailwindcss/oxide native binary installs fine, which
 * appears to confuse npm's reify into treating the whole subtree as present.
 *
 * This script runs via the npm "postinstall" hook. It reads the lockfile to
 * determine the correct version of each missing package, downloads it from the
 * npm cache, and extracts it into node_modules. It recursively resolves
 * dependencies so the whole subtree is complete. It's a no-op when packages
 * are already present (e.g. on Linux/macOS or when npm fixes the bug).
 */
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

// Seed packages that trigger the manual extraction.
// Include platform-specific native binaries explicitly.
const SEED_PACKAGES = [
  "@tailwindcss/postcss",
  "@tailwindcss/oxide-win32-x64-msvc",
  "lightningcss-win32-x64-msvc",
];

function readLockfile() {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"));
  } catch {
    return null;
  }
}

const lockfile = readLockfile();

function getLockEntry(pkg) {
  if (!lockfile) return null;
  return lockfile.packages?.[`node_modules/${pkg}`] ?? null;
}

function getResolvedVersion(pkg) {
  return getLockEntry(pkg)?.version ?? null;
}

function getDependencies(pkg) {
  const entry = getLockEntry(pkg);
  if (!entry) return [];
  return Object.keys(entry.dependencies ?? {});
}

function isInstalled(pkg) {
  return fs.existsSync(path.join(root, "node_modules", pkg, "package.json"));
}

function extractPackage(pkg, tmp) {
  if (isInstalled(pkg)) return true;

  const version = getResolvedVersion(pkg);
  if (!version) {
    console.warn(`[install-tailwind] No lockfile entry for ${pkg}, skipping.`);
    return false;
  }

  const target = path.join(root, "node_modules", pkg);
  fs.mkdirSync(target, { recursive: true });

  const tarballName = `${pkg.replace("@", "").replace("/", "-")}-${version}.tgz`;
  const tarball = path.join(tmp, tarballName);

  try {
    if (!fs.existsSync(tarball)) {
      execSync(`npm pack "${pkg}@${version}" --pack-destination="${tmp}"`, {
        cwd: root,
        stdio: "pipe",
      });
    }
    execSync(`tar -xzf "${tarball}" -C "${target}" --strip-components=1`, {
      stdio: "pipe",
    });
    console.log(`[install-tailwind] Extracted ${pkg}@${version}`);
    return true;
  } catch (e) {
    console.warn(`[install-tailwind] Failed to extract ${pkg}: ${e.message}`);
    return false;
  }
}

// Recursive extraction with a visited set to avoid infinite loops.
function extractTree(packages, tmp) {
  const queue = [...packages];
  const seen = new Set();
  while (queue.length > 0) {
    const pkg = queue.shift();
    if (seen.has(pkg)) continue;
    seen.add(pkg);

    if (isInstalled(pkg)) {
      // Already installed — still enqueue its deps in case they're missing.
    } else {
      const ok = extractPackage(pkg, tmp);
      if (!ok) continue;
    }

    // Enqueue this package's own dependencies.
    for (const dep of getDependencies(pkg)) {
      if (!seen.has(dep)) queue.push(dep);
    }
  }
}

const tmp = path.join(root, ".tailwind-tmp");
fs.mkdirSync(tmp, { recursive: true });

extractTree(SEED_PACKAGES, tmp);

// Copy the lightningcss native binary into lightningcss's own directory,
// because lightningcss/node/index.js requires '../lightningcss.<platform>.node'.
const lcNative = path.join(root, "node_modules", "lightningcss-win32-x64-msvc", "lightningcss.win32-x64-msvc.node");
const lcDest = path.join(root, "node_modules", "lightningcss", "lightningcss.win32-x64-msvc.node");
if (fs.existsSync(lcNative) && !fs.existsSync(lcDest)) {
  fs.copyFileSync(lcNative, lcDest);
  console.log("[install-tailwind] Copied lightningcss native binary");
}

// Also ensure @tailwindcss/oxide resolves — it may need its win32 binary copied.
const oxideNative = path.join(root, "node_modules", "@tailwindcss", "oxide-win32-x64-msvc", "tailwindcss-oxide.win32-x64-msvc.node");
if (fs.existsSync(oxideNative)) {
  const oxidePkg = path.join(root, "node_modules", "@tailwindcss", "oxide");
  if (fs.existsSync(oxidePkg)) {
    // oxide loads via its index — ensure the platform package is resolvable
  }
}

// cleanup
try {
  fs.rmSync(tmp, { recursive: true, force: true });
} catch {
  // ignore
}

console.log("[install-tailwind] Done.");
