import { ssrEntry } from "../config/paths.js";
export async function renderPage(data) {
  const { render } = await import(ssrEntry.href);
  return render(data);
}
