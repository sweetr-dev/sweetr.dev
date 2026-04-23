import { useEffect, useLayoutEffect, useState } from "react";
import type { CodeReviewDistributionEntity } from "@sweetr/graphql-types/frontend/graphql";

function needsAvatarRaster(
  entities: CodeReviewDistributionEntity[] | undefined,
  idealLoad: number | undefined,
): boolean {
  return (
    !!entities?.length &&
    idealLoad != null &&
    entities.some((e) => !!e.image)
  );
}

export function avatarRasterKey(imageUrl: string, sizePx: number): string {
  return `${imageUrl}\0${Math.round(sizePx)}`;
}

/** Same formula as raster jobs and ECharts `symbolSize` for reviewer nodes. */
export function getDistributionSymbolSize(
  entity: { id: string; reviewCount?: number | null },
  safeIdealLoad: number,
): number {
  const isReviewer = entity.id.includes("cr-author");
  if (!isReviewer) return 25;
  const n = entity.reviewCount;
  if (!n) return 62.5;
  const baseSize = 62.5;
  const minSize = 25;
  const maxSize = 150;
  const scalingFactor = (maxSize - baseSize) / safeIdealLoad;
  const deviation = n - safeIdealLoad;
  const size = baseSize + deviation * scalingFactor;
  return Math.max(minSize, Math.min(size, maxSize));
}

const AVATAR_LOAD_TIMEOUT_MS = 3000;

function loadImageCors(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const cleanup = () => {
      if (timeoutId != null) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };
    const finish = (action: () => void) => {
      img.onload = null;
      img.onerror = null;
      cleanup();
      action();
    };
    timeoutId = setTimeout(() => {
      finish(() => {
        img.removeAttribute("src");
        reject(new Error("avatar load timeout"));
      });
    }, AVATAR_LOAD_TIMEOUT_MS);
    img.onload = () => finish(() => resolve(img));
    img.onerror = () => finish(() => reject(new Error("avatar load failed")));
    img.src = src;
  });
}

function toCircularAvatarDataUrl(
  img: HTMLImageElement,
  sizePx: number,
  dpr: number,
): string | null {
  const s = Math.max(2, Math.round(sizePx * dpr));
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const r = s / 2;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return null;

  ctx.save();
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  const scale = Math.max(s / iw, s / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (s - dw) / 2;
  const dy = (s - dh) / 2;
  ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(r, r, r - 0.5 * dpr, 0, Math.PI * 2);
  ctx.strokeStyle = "#1A1B1E";
  ctx.lineWidth = Math.max(1, dpr);
  ctx.stroke();

  try {
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

async function buildCircularAvatarMap(
  entities: CodeReviewDistributionEntity[],
  idealLoad: number,
): Promise<Map<string, string>> {
  const safeIdeal = Math.max(idealLoad, 1e-6);

  const jobs = new Map<string, { url: string; sizePx: number }>();

  for (const entity of entities) {
    if (!entity.image) continue;
    const sizePx = getDistributionSymbolSize(entity, safeIdeal);
    const key = avatarRasterKey(entity.image, sizePx);
    if (!jobs.has(key)) jobs.set(key, { url: entity.image, sizePx });
  }

  const dpr = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    2,
  );
  const out = new Map<string, string>();

  await Promise.all(
    [...jobs.entries()].map(async ([key, { url, sizePx }]) => {
      try {
        const img = await loadImageCors(url);
        const dataUrl = toCircularAvatarDataUrl(img, sizePx, dpr);
        if (dataUrl) out.set(key, dataUrl);
      } catch {
        // Timeout, CORS, decode, etc.: omit key; chart can fall back for this avatar.
      }
    }),
  );

  return out;
}

/**
 * Rasterizes reviewer avatars to circular PNG data URLs for ECharts `image://`.
 * Waits until the map is computed (or confirmed empty) before consumers should init dependent UI.
 */
export function useRoundedAvatars(
  entities: CodeReviewDistributionEntity[] | undefined,
  idealLoad: number | undefined,
): { avatarMap: Map<string, string>; isRasterReady: boolean } {
  const [avatarMap, setAvatarMap] = useState<Map<string, string>>(
    () => new Map(),
  );
  const [isRasterReady, setIsRasterReady] = useState(
    () => !needsAvatarRaster(entities, idealLoad),
  );

  useLayoutEffect(() => {
    if (!needsAvatarRaster(entities, idealLoad)) {
      setAvatarMap(new Map());
      setIsRasterReady(true);
      return;
    }
    setIsRasterReady(false);
  }, [entities, idealLoad]);

  useEffect(() => {
    if (!needsAvatarRaster(entities, idealLoad)) return;

    let cancelled = false;
    void buildCircularAvatarMap(entities!, idealLoad!).then((m) => {
      if (!cancelled) {
        setAvatarMap(m);
        setIsRasterReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [entities, idealLoad]);

  return { avatarMap, isRasterReady };
}
