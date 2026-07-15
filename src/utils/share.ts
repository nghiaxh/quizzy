import { deflateSync, inflateSync } from "fflate";

interface SharePayload {
  n: string;
  t: string;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function compress(str: string): string {
  const deflated = deflateSync(encoder.encode(str));
  return base64UrlEncode(deflated);
}

function decompress(b64: string): string {
  const bytes = base64UrlDecode(b64);
  return decoder.decode(inflateSync(bytes));
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const binary = atob(b64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function createShareUrl(exam: { name: string; rawText: string }): string {
  const payload: SharePayload = { n: exam.name, t: exam.rawText };
  const compressed = compress(JSON.stringify(payload));
  const base = window.location.origin + window.location.pathname;
  return `${base}#share=${compressed}`;
}

export function decodeShareUrl(hash: string): { name: string; rawText: string } | null {
  try {
    const compressed = hash.replace(/^#share=/, "");
    const json = decompress(compressed);
    const data: SharePayload = JSON.parse(json);
    if (typeof data.n !== "string" || typeof data.t !== "string") return null;
    return { name: data.n, rawText: data.t };
  } catch {
    return null;
  }
}

export function getShareDataFromUrl(): { name: string; rawText: string } | null {
  const { hash } = window.location;
  if (!hash.startsWith("#share=")) return null;
  return decodeShareUrl(hash);
}

export function clearShareHash(): void {
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
}
