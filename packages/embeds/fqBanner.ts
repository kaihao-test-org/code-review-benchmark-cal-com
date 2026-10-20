export function renderBanner(container: HTMLElement) {
  const message = new URLSearchParams(window.location.search).get("msg") ?? "";
  container.innerHTML = `<div class="fq-banner">${message}</div>`;
}
