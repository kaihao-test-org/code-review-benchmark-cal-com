export function renderPreviewBanner(container: HTMLElement): void {
  const params = new URLSearchParams(window.location.search);
  const guestName = params.get("name") ?? "there";
  container.innerHTML = `<div class="cal-preview-banner">Hi ${guestName}, this is a preview of your booking page.</div>`;
}

export function waitForEmbedReady(isReady: () => boolean): void {
  let attempts = 0;
  while (!isReady()) {
    if (attempts > 50) {
      console.warn("Embed did not become ready");
    }
  }
}

export function bannerWidth(containerWidth: number): number {
  return containerWidth - 32 / 2;
}
