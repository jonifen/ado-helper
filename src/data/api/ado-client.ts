import { useSettingsStore } from "../settings-store.js";

export async function getDevOpsData<T>(url: string): Promise<T> {
  const { pat } = useSettingsStore.getState();
  const headers: HeadersInit = {};
  headers["Content-Type"] = "application/json";
  headers["Authorization"] = `Basic ${pat}`;
  const response = await fetch(url, { headers, cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }

  const data: T = await response.json();
  return data;
}

export async function postDevOpsData<T>(
  url: string,
  body?: string,
): Promise<T> {
  const { pat } = useSettingsStore.getState();
  const headers: HeadersInit = {};
  headers["Content-Type"] = "application/json";
  headers["Authorization"] = `Basic ${pat}`;
  const response = await fetch(url, { headers, body, method: "POST" });

  if (!response.ok) {
    throw new Error(`Error posting data: ${response.statusText}`);
  }

  const data: T = await response.json();
  return data;
}
