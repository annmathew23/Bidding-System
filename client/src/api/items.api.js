export async function getItems() {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/items`);
  if (!res.ok) {
    throw new Error(`GET /items failed: ${res.status}`);
  }
  return res.json();
}

export async function createItemApi({ title, startingPrice, durationMs }) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, startingPrice, durationMs }),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`POST /items failed: ${res.status} ${text}`);
  }

  return JSON.parse(text);
}
