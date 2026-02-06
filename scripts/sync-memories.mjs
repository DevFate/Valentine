import { copyFile, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import * as exifr from "exifr";

const sourceRoot = path.join(process.cwd(), "Memories");
const publicRoot = path.join(process.cwd(), "public", "memories", "user");
const generatedFilePath = path.join(process.cwd(), "src", "data", "generatedMemories.ts");

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".heic", ".heif"]);
const videoExtensions = new Set([".mp4", ".mov", ".m4v", ".webm"]);

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

function slugify(value) {
  return (
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-") || "memory"
  );
}

function normalizeTitle(value) {
  return value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function resolveMediaType(ext) {
  if (videoExtensions.has(ext)) {
    return "video";
  }

  return "image";
}

function isSupportedFile(fileName) {
  if (fileName.startsWith(".")) {
    return false;
  }

  const ext = path.extname(fileName).toLowerCase();
  return imageExtensions.has(ext) || videoExtensions.has(ext);
}

function pickFirst(source, keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
}

function normalizeDate(value) {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const msValue = value < 10000000000 ? value * 1000 : value;
    const parsed = new Date(msValue);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }

    return undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    const normalized = trimmed
      .replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3")
      .replace(/ (\d{2}:\d{2}:\d{2})$/, "T$1");

    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return undefined;
}

function normalizeCoordinate(value) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numeric = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(numeric)) {
    return undefined;
  }

  return Number(numeric.toFixed(6));
}

function parseDateFromFileName(fileName) {
  const baseName = path.basename(fileName, path.extname(fileName));

  const compactDateMatch = baseName.match(
    /(20\d{2})[-_]?([01]\d)[-_]?([0-3]\d)(?:[^0-9]?([0-2]\d)([0-5]\d)([0-5]\d)?)?/,
  );

  if (compactDateMatch) {
    const [, year, month, day, hours = "12", minutes = "00", seconds = "00"] = compactDateMatch;
    const parsed = new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hours),
        Number(minutes),
        Number(seconds),
      ),
    );

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  const dashedDateMatch = baseName.match(/(20\d{2})-([01]\d)-([0-3]\d)(?:-([0-2]\d)([0-5]\d))?/);
  if (dashedDateMatch) {
    const [, year, month, day, hours = "12", minutes = "00"] = dashedDateMatch;
    const parsed = new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), 0),
    );

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return undefined;
}

function buildLocationLabel(metadata) {
  const parts = [
    pickFirst(metadata, ["SubLocation", "sublocation", "Location", "location"]),
    pickFirst(metadata, ["City", "city"]),
    pickFirst(metadata, ["ProvinceState", "State", "state", "RegionName", "regionName"]),
    pickFirst(metadata, ["Country", "CountryName", "country", "countryName"]),
  ]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean);

  if (!parts.length) {
    return undefined;
  }

  const uniqueParts = [];
  const seen = new Set();
  for (const part of parts) {
    const normalized = part.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      uniqueParts.push(part);
    }
  }

  return uniqueParts.join(", ");
}

function buildDeviceLabel(metadata) {
  const makeRaw = pickFirst(metadata, ["Make", "make"]);
  const modelRaw = pickFirst(metadata, ["Model", "model"]);

  const make = typeof makeRaw === "string" ? makeRaw.trim() : "";
  const model = typeof modelRaw === "string" ? modelRaw.trim() : "";

  if (make && model) {
    if (model.toLowerCase().startsWith(make.toLowerCase())) {
      return model;
    }

    return `${make} ${model}`;
  }

  if (make || model) {
    return make || model;
  }

  return undefined;
}

function compactContext(context) {
  const output = {};

  for (const [key, value] of Object.entries(context)) {
    if (value !== undefined && value !== null && value !== "") {
      output[key] = value;
    }
  }

  if (!Object.keys(output).length) {
    return undefined;
  }

  return output;
}

async function readImageContext(filePath) {
  try {
    const metadata = await exifr.parse(filePath, {
      exif: true,
      gps: true,
      tiff: true,
      ifd0: true,
      xmp: true,
      iptc: true,
    });

    if (!metadata || typeof metadata !== "object") {
      return undefined;
    }

    const capturedAt = normalizeDate(
      pickFirst(metadata, ["DateTimeOriginal", "CreateDate", "DateTimeDigitized", "ModifyDate"]),
    );

    const latitude = normalizeCoordinate(
      pickFirst(metadata, ["latitude", "Latitude", "GPSLatitude", "lat"]),
    );
    const longitude = normalizeCoordinate(
      pickFirst(metadata, ["longitude", "Longitude", "GPSLongitude", "lng", "lon"]),
    );

    const location = buildLocationLabel(metadata);
    const device = buildDeviceLabel(metadata);

    return compactContext({
      capturedAt,
      location,
      latitude,
      longitude,
      device,
    });
  } catch {
    return undefined;
  }
}

async function resolveMediaContext({ mediaType, sourceFilePath, fileName }) {
  const imageContext = mediaType === "image" ? await readImageContext(sourceFilePath) : undefined;
  const fileDate = parseDateFromFileName(fileName);

  return compactContext({
    ...imageContext,
    capturedAt: imageContext?.capturedAt ?? fileDate,
  });
}

const RETRYABLE_RM_ERRORS = new Set(["ENOTEMPTY", "EBUSY", "EPERM"]);

async function ensureDir(targetPath) {
  await mkdir(targetPath, { recursive: true });
}

async function removePath(targetPath, attempts = 3) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await rm(targetPath, { recursive: true, force: true });
      return;
    } catch (error) {
      if (!RETRYABLE_RM_ERRORS.has(error?.code) || attempt === attempts - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
    }
  }
}

async function emptyDir(targetPath) {
  let entries = [];
  try {
    entries = await readdir(targetPath, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") {
      return;
    }
    throw error;
  }

  for (const entry of entries) {
    const entryPath = path.join(targetPath, entry.name);
    await removePath(entryPath);
  }
}

async function run() {
  await ensureDir(path.dirname(generatedFilePath));

  let sourceExists = false;
  try {
    const srcStat = await stat(sourceRoot);
    sourceExists = srcStat.isDirectory();
  } catch {
    sourceExists = false;
  }

  if (!sourceExists) {
    await ensureDir(publicRoot);
    await writeGenerated([]);
    console.log("[sync-memories] No Memories folder found. Generated an empty manifest.");
    return;
  }

  await ensureDir(publicRoot);
  await emptyDir(publicRoot);

  const directoryEntries = await readdir(sourceRoot, { withFileTypes: true });
  const folders = directoryEntries
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => collator.compare(a.name, b.name));

  const slugSet = new Set();
  const manifestFolders = [];

  for (const folderEntry of folders) {
    const folderName = folderEntry.name;
    const originalFolderPath = path.join(sourceRoot, folderName);

    const mediaFiles = (await readdir(originalFolderPath, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && isSupportedFile(entry.name))
      .map((entry) => entry.name)
      .sort((a, b) => collator.compare(a, b));

    if (mediaFiles.length === 0) {
      continue;
    }

    const baseSlug = slugify(folderName);
    let folderSlug = baseSlug;
    let folderIndex = 2;
    while (slugSet.has(folderSlug)) {
      folderSlug = `${baseSlug}-${folderIndex}`;
      folderIndex += 1;
    }
    slugSet.add(folderSlug);

    const targetFolderPath = path.join(publicRoot, folderSlug);
    await ensureDir(targetFolderPath);

    const fileSlugSet = new Set();
    const items = [];

    for (let index = 0; index < mediaFiles.length; index += 1) {
      const fileName = mediaFiles[index];
      const fileExt = path.extname(fileName).toLowerCase();
      const rawName = path.basename(fileName, path.extname(fileName));
      const normalizedName = normalizeTitle(rawName);

      const baseFileSlug = slugify(normalizedName || `memory-${index + 1}`);
      let fileSlug = baseFileSlug;
      let fileIndex = 2;
      while (fileSlugSet.has(fileSlug)) {
        fileSlug = `${baseFileSlug}-${fileIndex}`;
        fileIndex += 1;
      }
      fileSlugSet.add(fileSlug);

      const outputFileName = `${fileSlug}${fileExt}`;
      const sourceFilePath = path.join(originalFolderPath, fileName);
      const targetFilePath = path.join(targetFolderPath, outputFileName);
      await copyFile(sourceFilePath, targetFilePath);

      const mediaType = resolveMediaType(fileExt);
      const context = await resolveMediaContext({ mediaType, sourceFilePath, fileName });

      items.push({
        id: `${folderSlug}-${fileSlug}`,
        title: normalizedName || `Memory ${index + 1}`,
        type: mediaType,
        src: `/memories/user/${folderSlug}/${outputFileName}`,
        alt: `${folderName} - ${normalizedName || `Memory ${index + 1}`}`,
        context,
      });
    }

    manifestFolders.push({
      id: folderSlug,
      title: folderName.trim(),
      slug: folderSlug,
      count: items.length,
      items,
    });
  }

  await writeGenerated(manifestFolders);
  console.log(`[sync-memories] Synced ${manifestFolders.length} folders into public/memories/user.`);
}

async function writeGenerated(folders) {
  const generatedAt = new Date().toISOString();
  const fileContent = `import type { MemoryFolder } from "./media";\n\n// This file is auto-generated by scripts/sync-memories.mjs\n// Generated at: ${generatedAt}\nexport const generatedMemories: MemoryFolder[] = ${JSON.stringify(folders, null, 2)};\n`;

  await writeFile(generatedFilePath, fileContent, "utf8");
}

run().catch((error) => {
  console.error("[sync-memories] Failed to sync memories.");
  console.error(error);
  process.exit(1);
});
