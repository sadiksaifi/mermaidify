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

export async function downloadMmd(itemId: string, fileName: string) {
  const res = await fetch(`/api/items/${itemId}/content`);
  if (!res.ok) throw new Error("Failed to fetch file content");
  const { content } = (await res.json()) as { content: string };
  const blob = new Blob([content], { type: "text/plain" });
  triggerDownload(blob, fileName.endsWith(".mmd") ? fileName : `${fileName}.mmd`);
}

export async function exportSvg(itemId: string, fileName: string) {
  const res = await fetch(`/api/items/${itemId}/content`);
  if (!res.ok) throw new Error("Failed to fetch file content");
  const { content } = (await res.json()) as { content: string };

  const mermaid = (await import("mermaid")).default;
  mermaid.initialize({ startOnLoad: false, theme: "default" });
  const { svg } = await mermaid.render(`export-${Date.now()}`, content);

  const blob = new Blob([svg], { type: "image/svg+xml" });
  const stem = fileName.replace(/\.mmd$/, "");
  triggerDownload(blob, `${stem}.svg`);
}

export async function exportPng(itemId: string, fileName: string) {
  const res = await fetch(`/api/items/${itemId}/content`);
  if (!res.ok) throw new Error("Failed to fetch file content");
  const { content } = (await res.json()) as { content: string };

  const mermaid = (await import("mermaid")).default;
  mermaid.initialize({ startOnLoad: false, theme: "default" });
  const { svg } = await mermaid.render(`export-png-${Date.now()}`, content);

  const scale = 2;
  const container = document.createElement("div");
  container.innerHTML = svg;
  const svgEl = container.querySelector("svg")!;
  const width = svgEl.viewBox.baseVal.width || svgEl.width.baseVal.value || 800;
  const height = svgEl.viewBox.baseVal.height || svgEl.height.baseVal.value || 600;

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  const img = new Image();
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = reject;
    img.src = url;
  });

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to create PNG"))), "image/png");
  });

  const stem = fileName.replace(/\.mmd$/, "");
  triggerDownload(blob, `${stem}.png`);
}
