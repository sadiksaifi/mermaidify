import type { MermaidConfig } from "mermaid";
import { deflate } from "pako";

export interface ExportPngOptions {
  background?: "transparent" | "white";
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getRendererBaseUrl() {
  return (process.env.NEXT_PUBLIC_MERMAID_RENDERER_URL || "https://mermaid.ink").replace(/\/+$/, "");
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x2000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function serializeRendererState(
  content: string,
  theme: MermaidConfig["theme"],
  look: MermaidConfig["look"],
) {
  const state = {
    code: content,
    mermaid: JSON.stringify({ theme, look }),
  };
  const json = JSON.stringify(state);
  const compressed = deflate(new TextEncoder().encode(json), { level: 9 });
  return `pako:${toBase64Url(compressed)}`;
}

function getRendererSvgUrl(
  content: string,
  theme: MermaidConfig["theme"],
  look: MermaidConfig["look"],
) {
  const base = getRendererBaseUrl();
  const serialized = serializeRendererState(content, theme, look);
  return `${base}/svg/${serialized}`;
}

async function exportPngUsingRenderer(
  content: string,
  fileName: string,
  theme: MermaidConfig["theme"],
  look: MermaidConfig["look"],
  options: ExportPngOptions = {},
  size?: { width: number; height: number; scale: number },
) {
  const res = await fetch(getRendererSvgUrl(content, theme, look));
  if (!res.ok) {
    throw new Error(`Renderer SVG export failed (${res.status})`);
  }
  const svg = await res.text();
  const blob = await rasterizeSvgToPngBlob(
    svg,
    size?.scale ?? 3,
    true,
    options.background ?? "transparent",
    size ? { width: size.width, height: size.height } : undefined,
  );
  const stem = fileName.replace(/\.mmd$/, "");
  triggerDownload(blob, `${stem}.png`);
}

function getBaseConfig(
  theme: MermaidConfig["theme"],
  look: MermaidConfig["look"],
): MermaidConfig {
  return {
    startOnLoad: false,
    theme,
    look,
  };
}

function getPngExportConfig(
  theme: MermaidConfig["theme"],
  look: MermaidConfig["look"],
): MermaidConfig {
  return {
    ...getBaseConfig(theme, look),
    securityLevel: "strict",
    htmlLabels: false,
    flowchart: { htmlLabels: false },
    class: { htmlLabels: false },
  };
}

function getRenderedSvgDimensions(svgEl: SVGSVGElement) {
  const viewBox = svgEl.getAttribute("viewBox");
  const vb = viewBox?.trim().split(/[\s,]+/).map(Number);

  if (vb && vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
    return { width: vb[2], height: vb[3] };
  }

  const width = parseLength(svgEl.getAttribute("width")) ?? 800;
  const height = parseLength(svgEl.getAttribute("height")) ?? 600;
  return { width, height };
}

function parseLength(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeForeignObjectEdgeLabels(svgEl: SVGSVGElement) {
  const doc = svgEl.ownerDocument;
  const labelGroups = svgEl.querySelectorAll("g.edgeLabel g.label");
  labelGroups.forEach((labelGroup) => {
    const foreignObject = labelGroup.querySelector("foreignObject");
    if (!foreignObject) return;

    const text = foreignObject.textContent?.replace(/\s+/g, " ").trim();
    if (!text) return;

    const width = parseLength(foreignObject.getAttribute("width")) ?? 60;
    const height = parseLength(foreignObject.getAttribute("height")) ?? 20;

    labelGroup.replaceChildren();

    const rect = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", "0");
    rect.setAttribute("y", "0");
    rect.setAttribute("width", `${width}`);
    rect.setAttribute("height", `${height}`);
    rect.setAttribute("rx", "2");
    rect.setAttribute("ry", "2");
    rect.setAttribute("fill", "#f6f6f6");
    rect.setAttribute("stroke", "none");
    rect.setAttribute("opacity", "0.95");
    labelGroup.appendChild(rect);

    const textNode = doc.createElementNS("http://www.w3.org/2000/svg", "text");
    textNode.setAttribute("x", `${width / 2}`);
    textNode.setAttribute("y", `${height / 2}`);
    textNode.setAttribute("text-anchor", "middle");
    textNode.setAttribute("dominant-baseline", "middle");
    textNode.setAttribute("fill", "#ffffff");
    textNode.setAttribute("font-size", "12");
    textNode.setAttribute("font-family", "trebuchet ms, verdana, arial, sans-serif");
    textNode.textContent = text;
    labelGroup.appendChild(textNode);
  });
}

function enforceEdgeLabelTextContrast(svgEl: SVGSVGElement) {
  normalizeForeignObjectEdgeLabels(svgEl);

  const style = svgEl.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = `
    .edgeLabel text,
    .edgeLabel tspan {
      fill: #ffffff !important;
      color: #ffffff !important;
      stroke: none !important;
    }
  `;
  svgEl.appendChild(style);
}

async function renderMermaidSvg(
  mermaid: typeof import("mermaid").default,
  idPrefix: string,
  content: string,
  config: MermaidConfig,
) {
  mermaid.initialize(config);
  const renderId = `${idPrefix}-${Date.now()}`;
  const { svg } = await mermaid.render(renderId, content);
  document.getElementById(renderId)?.remove();
  return svg;
}

function isTaintedCanvasError(error: unknown) {
  if (error instanceof DOMException && error.name === "SecurityError") {
    return true;
  }
  if (error instanceof Error && /tainted canvas|securityerror/i.test(error.message)) {
    return true;
  }
  return false;
}

function serializeForRasterization(
  svg: string,
  forceEdgeLabelContrast = false,
  sizeOverride?: { width: number; height: number },
) {
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  const svgEl = doc.querySelector("svg");
  if (!svgEl) throw new Error("Failed to render SVG for PNG export");
  if (forceEdgeLabelContrast) enforceEdgeLabelTextContrast(svgEl);

  const { width, height } = sizeOverride ?? getRenderedSvgDimensions(svgEl);
  svgEl.setAttribute("width", `${width}`);
  svgEl.setAttribute("height", `${height}`);
  svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svgEl.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  return {
    width,
    height,
    svg: new XMLSerializer().serializeToString(svgEl),
  };
}

async function rasterizeSvgToPngBlob(
  svg: string,
  scale = 2,
  forceEdgeLabelContrast = false,
  background: "transparent" | "white" = "transparent",
  sizeOverride?: { width: number; height: number },
) {
  const prepared = serializeForRasterization(
    svg,
    forceEdgeLabelContrast,
    sizeOverride,
  );
  const { width, height } = prepared;

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d")!;
  if (background === "white") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.scale(scale, scale);

  const img = new Image();
  img.crossOrigin = "anonymous";
  const svgBlob = new Blob([prepared.svg], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load rendered SVG for PNG export"));
    };
    img.src = url;
  });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) {
        resolve(b);
        return;
      }

      try {
        // toDataURL throws SecurityError on tainted canvas in browsers that
        // don't throw from toBlob.
        canvas.toDataURL("image/png");
        reject(new Error("Failed to create PNG"));
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Failed to create PNG"));
      }
    }, "image/png");
  });
}

function getSvgDimensionsFromMarkup(svg: string) {
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  const svgEl = doc.querySelector("svg");
  if (!svgEl) return null;
  return getRenderedSvgDimensions(svgEl);
}

function getHiResRendererSize(
  dimensions: { width: number; height: number } | null,
) {
  if (!dimensions) return undefined;

  const sourceWidth = Math.max(1, Math.round(dimensions.width));
  const sourceHeight = Math.max(1, Math.round(dimensions.height));
  const scale = 3;
  const maxScaledDimension = 9000;
  const maxSourceDimension = Math.max(sourceWidth, sourceHeight);
  const downscaleFactor = Math.min(1, maxScaledDimension / (maxSourceDimension * scale));

  return {
    width: Math.max(1, Math.floor(sourceWidth * downscaleFactor)),
    height: Math.max(1, Math.floor(sourceHeight * downscaleFactor)),
    scale,
  };
}

export async function downloadMmd(itemId: string, fileName: string) {
  const res = await fetch(`/api/items/${itemId}/content`);
  if (!res.ok) throw new Error("Failed to fetch file content");
  const { content } = (await res.json()) as { content: string };
  const blob = new Blob([content], { type: "text/plain" });
  triggerDownload(blob, fileName.endsWith(".mmd") ? fileName : `${fileName}.mmd`);
}

export async function exportSvg(
  itemId: string,
  fileName: string,
  theme: MermaidConfig["theme"] = "default",
  look: MermaidConfig["look"] = "classic",
) {
  const res = await fetch(`/api/items/${itemId}/content`);
  if (!res.ok) throw new Error("Failed to fetch file content");
  const { content } = (await res.json()) as { content: string };

  const mermaid = (await import("mermaid")).default;
  const svg = await renderMermaidSvg(
    mermaid,
    "export",
    content,
    getBaseConfig(theme, look),
  );

  const blob = new Blob([svg], { type: "image/svg+xml" });
  const stem = fileName.replace(/\.mmd$/, "");
  triggerDownload(blob, `${stem}.svg`);
}

export async function exportPng(
  itemId: string,
  fileName: string,
  theme: MermaidConfig["theme"] = "default",
  look: MermaidConfig["look"] = "classic",
  options: ExportPngOptions = {},
) {
  const res = await fetch(`/api/items/${itemId}/content`);
  if (!res.ok) throw new Error("Failed to fetch file content");
  const { content } = (await res.json()) as { content: string };

  const mermaid = (await import("mermaid")).default;
  const sizingSvg = await renderMermaidSvg(
    mermaid,
    "export-png-size",
    content,
    getBaseConfig(theme, look),
  );
  const rendererSize = getHiResRendererSize(getSvgDimensionsFromMarkup(sizingSvg));

  try {
    await exportPngUsingRenderer(
      content,
      fileName,
      theme,
      look,
      options,
      rendererSize,
    );
    return;
  } catch {
    // fall back to client-side rasterization when remote renderer is unavailable
  }

  const stem = fileName.replace(/\.mmd$/, "");

  try {
    const normalSvg = await renderMermaidSvg(
      mermaid,
      "export-png",
      content,
      getBaseConfig(theme, look),
    );
    const blob = await rasterizeSvgToPngBlob(
      normalSvg,
      2,
      false,
      options.background ?? "transparent",
    );
    triggerDownload(blob, `${stem}.png`);
    return;
  } catch (error) {
    if (!isTaintedCanvasError(error)) {
      throw error;
    }
  }

  const safeSvg = await renderMermaidSvg(
    mermaid,
    "export-png-safe",
    content,
    getPngExportConfig(theme, look),
  );
  const blob = await rasterizeSvgToPngBlob(
    safeSvg,
    2,
    true,
    options.background ?? "transparent",
  );

  triggerDownload(blob, `${stem}.png`);
}
