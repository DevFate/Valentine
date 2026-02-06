"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

import type { MemoryFolder, MemoryMediaItem } from "@/data/media";
import { withBasePath } from "@/lib/paths";

type MemoriesExperienceProps = {
  folders: MemoryFolder[];
};

type ActiveHeartModal = {
  folderIndex: number;
  itemIndex: number;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatCapturedDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return dateFormatter.format(parsed);
}

function formatCoordinates(latitude?: number, longitude?: number) {
  if (latitude === undefined || longitude === undefined) {
    return undefined;
  }

  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

function getItemContextLabels(item: MemoryMediaItem) {
  const labels: string[] = [];

  const capturedAt = formatCapturedDate(item.context?.capturedAt);
  if (capturedAt) {
    labels.push(capturedAt);
  }

  if (item.context?.location) {
    labels.push(item.context.location);
  } else {
    const coordinates = formatCoordinates(item.context?.latitude, item.context?.longitude);
    if (coordinates) {
      labels.push(coordinates);
    }
  }

  if (item.context?.device) {
    labels.push(item.context.device);
  }

  return labels;
}

function getFolderSummary(folder: MemoryFolder) {
  const dateValues = folder.items
    .map((item) => item.context?.capturedAt)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  const locations = Array.from(
    new Set(
      folder.items
        .map((item) => item.context?.location)
        .filter((value): value is string => Boolean(value)),
    ),
  ).slice(0, 2);

  const dateLabel =
    dateValues.length === 0
      ? undefined
      : dateValues.length === 1
        ? dateFormatter.format(dateValues[0])
        : `${dateFormatter.format(dateValues[0])} - ${dateFormatter.format(dateValues[dateValues.length - 1])}`;

  return {
    dateLabel,
    locations,
  };
}

function MemoryTile({ item, sizes }: { item: MemoryMediaItem; sizes: string }) {
  if (item.type === "video") {
    return (
      <video controls playsInline preload="metadata" className="chapter-video">
        <source src={withBasePath(item.src)} />
      </video>
    );
  }

  return (
    <Image
      src={item.src}
      alt={item.alt}
      fill
      className="chapter-image"
      sizes={sizes}
    />
  );
}

export function MemoriesExperience({ folders }: MemoriesExperienceProps) {
  const [activeHeartModal, setActiveHeartModal] = useState<ActiveHeartModal | null>(null);

  const heartFolders = useMemo(
    () => folders.filter((folder) => folder.count <= 3),
    [folders],
  );

  const chapterFolders = useMemo(
    () => folders.filter((folder) => folder.count > 3),
    [folders],
  );

  const activeFolder =
    activeHeartModal !== null ? heartFolders[activeHeartModal.folderIndex] : null;
  const activeItem =
    activeFolder && activeHeartModal
      ? activeFolder.items[activeHeartModal.itemIndex]
      : null;
  const activeItemLabels = activeItem ? getItemContextLabels(activeItem) : [];
  const floatingHeartMotion = useMemo(
    () =>
      heartFolders.map((_, index) => ({
        left: ((index * 23) % 88) + 6,
        restTop: ((index * 11) % 76) + 8,
        duration: 25 + (index % 7) * 2.8,
        delay: index * 2.4,
        size: 1.2 + (index % 4) * 0.25,
        drift: (index % 9) * 4 - 16,
      })),
    [heartFolders],
  );

  useEffect(() => {
    if (!activeFolder) {
      return;
    }

    const onKeydown = (event: KeyboardEvent) => {
      if (!activeFolder) {
        return;
      }

      if (event.key === "Escape") {
        setActiveHeartModal(null);
      }

      if (event.key === "ArrowRight") {
        setActiveHeartModal((previous) => {
          if (!previous) {
            return previous;
          }

          return {
            ...previous,
            itemIndex: (previous.itemIndex + 1) % activeFolder.items.length,
          };
        });
      }

      if (event.key === "ArrowLeft") {
        setActiveHeartModal((previous) => {
          if (!previous) {
            return previous;
          }

          return {
            ...previous,
            itemIndex:
              (previous.itemIndex - 1 + activeFolder.items.length) %
              activeFolder.items.length,
          };
        });
      }
    };

    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [activeFolder]);

  return (
    <>
      {heartFolders.length ? (
        <div className="memory-heart-overlay" aria-label="Floating memory hearts">
          {heartFolders.map((folder, index) => {
            const summary = getFolderSummary(folder);
            const metaLabel =
              summary.locations[0] ??
              summary.dateLabel ??
              `${folder.count} moment${folder.count > 1 ? "s" : ""}`;
            const motion = floatingHeartMotion[index];
            const heartStyle = {
              left: `${motion.left}%`,
              animationDuration: `${motion.duration}s`,
              animationDelay: `${motion.delay}s`,
              fontSize: `${motion.size}rem`,
              "--heart-drift": `${motion.drift}px`,
              "--heart-rest-top": `${motion.restTop}%`,
            } as CSSProperties;

            return (
              <button
                key={folder.id}
                type="button"
                className="memory-heart memory-heart-global"
                style={heartStyle}
                aria-label={`${folder.title}. ${folder.count} moments. ${metaLabel}`}
                onClick={() => setActiveHeartModal({ folderIndex: index, itemIndex: 0 })}
              >
                <span className="memory-heart-icon" aria-hidden="true">
                  ❤️
                </span>
                <span className="memory-heart-label">
                  <strong>{folder.title}</strong>
                  <em>{metaLabel}</em>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <section className="heart-memories section-shell" id="heart-memories">
        <div className="section-title-wrap">
          <p className="eyebrow">Mini moments</p>
          <h2>Tap the floating hearts</h2>
          <p className="section-subtle-copy">
            Every heart opens a little memory scene with file metadata context when available.
          </p>
        </div>

        {heartFolders.length ? null : (
          <p className="section-subtle-copy">
            Add smaller folders with 1-3 files in `Memories/` to unlock floating clickable hearts.
          </p>
        )}
      </section>

      <section className="memory-chapters section-shell" id="memory-chapters">
        <div className="section-title-wrap">
          <p className="eyebrow">Big chapters</p>
          <h2>The moments that became a whole era</h2>
          <p className="section-subtle-copy">
            These folders hold fuller story arcs, so each one gets its own visual style and timeline hints.
          </p>
        </div>

        <div className="chapter-list">
          {chapterFolders.map((folder, folderIndex) => {
            const variant = folderIndex % 3;
            const summary = getFolderSummary(folder);

            return (
              <article key={folder.id} className="chapter-card">
                <header className="chapter-header">
                  <h3>{folder.title}</h3>
                  <p>{folder.count} memories</p>
                </header>
                {summary.dateLabel || summary.locations.length ? (
                  <p className="chapter-context">
                    {summary.dateLabel ? <span>{summary.dateLabel}</span> : null}
                    {summary.locations.map((location) => (
                      <span key={`${folder.id}-${location}`}>{location}</span>
                    ))}
                  </p>
                ) : null}

                {variant === 0 ? (
                  <div className="chapter-grid chapter-grid-mosaic">
                    {folder.items.map((item, itemIndex) => (
                      <figure
                        key={item.id}
                        className={`chapter-tile ${itemIndex === 0 ? "hero" : ""}`}
                      >
                        <MemoryTile
                          item={item}
                          sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
                        />
                      </figure>
                    ))}
                  </div>
                ) : null}

                {variant === 1 ? (
                  <div className="chapter-strip">
                    {folder.items.map((item) => (
                      <figure key={item.id} className="chapter-tile strip-tile">
                        <MemoryTile
                          item={item}
                          sizes="(max-width: 720px) 90vw, 360px"
                        />
                      </figure>
                    ))}
                  </div>
                ) : null}

                {variant === 2 ? (
                  <div className="chapter-stack">
                    {folder.items.map((item, itemIndex) => (
                      <figure
                        key={item.id}
                        className="chapter-tile stack-tile"
                        style={{
                          rotate: `${(itemIndex % 5) * 2 - 4}deg`,
                          zIndex: folder.items.length - itemIndex,
                        }}
                      >
                        <MemoryTile
                          item={item}
                          sizes="(max-width: 720px) 90vw, 300px"
                        />
                      </figure>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      {activeFolder && activeHeartModal ? (
        <div
          className="heart-modal"
          role="dialog"
          aria-modal="true"
          aria-label={activeFolder.title}
          onClick={() => setActiveHeartModal(null)}
        >
          <div className="heart-modal-panel" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="heart-modal-close"
              aria-label="Close memory"
              onClick={() => setActiveHeartModal(null)}
            >
              ×
            </button>

            <p className="heart-modal-eyebrow">{activeFolder.title}</p>

            <div className="heart-modal-media-frame">
              {activeFolder.items[activeHeartModal.itemIndex].type === "video" ? (
                <video controls playsInline preload="metadata" className="heart-modal-media">
                  <source
                    src={withBasePath(activeFolder.items[activeHeartModal.itemIndex].src)}
                  />
                </video>
              ) : (
                <Image
                  src={activeFolder.items[activeHeartModal.itemIndex].src}
                  alt={activeFolder.items[activeHeartModal.itemIndex].alt}
                  fill
                  className="heart-modal-media"
                  sizes="(max-width: 768px) 90vw, 64vw"
                />
              )}
            </div>

            <p className="heart-modal-title">
              {activeFolder.items[activeHeartModal.itemIndex].title}
            </p>
            {activeItemLabels.length ? (
              <div className="heart-modal-meta">
                {activeItemLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            ) : null}

            {activeFolder.items.length > 1 ? (
              <div className="heart-modal-nav">
                <button
                  type="button"
                  onClick={() =>
                    setActiveHeartModal((previous) => {
                      if (!previous) {
                        return previous;
                      }

                      return {
                        ...previous,
                        itemIndex:
                          (previous.itemIndex - 1 + activeFolder.items.length) %
                          activeFolder.items.length,
                      };
                    })
                  }
                >
                  ← Prev
                </button>

                <span>
                  {activeHeartModal.itemIndex + 1} / {activeFolder.items.length}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setActiveHeartModal((previous) => {
                      if (!previous) {
                        return previous;
                      }

                      return {
                        ...previous,
                        itemIndex: (previous.itemIndex + 1) % activeFolder.items.length,
                      };
                    })
                  }
                >
                  Next →
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
