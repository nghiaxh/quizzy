import { deflateSync, inflateSync } from "fflate";
import { parseQuestions } from "./parser";

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

function encodeCompact(name: string, rawText: string): string {
  const questions = parseQuestions(rawText);
  const parts = [name];
  for (const q of questions) {
    parts.push([q.text, String(q.correctIndex), ...q.options].join("\x00"));
  }
  return parts.join("\x01");
}

function decodeCompact(compact: string): { name: string; rawText: string } | null {
  const parts = compact.split("\x01");
  if (parts.length < 2) return null;

  const name = parts[0];
  const qLines: string[] = [];

  for (let i = 1; i < parts.length; i++) {
    const fields = parts[i].split("\x00");
    if (fields.length < 3) return null;

    const text = fields[0];
    const correctIdx = parseInt(fields[1], 10);
    const options = fields.slice(2);

    if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= options.length) return null;

    const block = [`${i}. ${text}`];
    for (let j = 0; j < options.length; j++) {
      const label = String.fromCharCode(65 + j);
      const marker = j === correctIdx ? "*" : "";
      block.push(`${marker}${label}. ${options[j]}`);
    }
    qLines.push(block.join("\n"));
  }

  const rawText = qLines.join("\n\n");
  const reparsed = parseQuestions(rawText);
  if (reparsed.length === 0) return null;

  return { name, rawText };
}

export function createShareUrl(exam: { name: string; rawText: string }): string {
  const compact = encodeCompact(exam.name, exam.rawText);
  const compressed = compress(compact);
  const base = window.location.origin + window.location.pathname;
  return `${base}#share=${compressed}`;
}

export function decodeShareUrl(hash: string): { name: string; rawText: string } | null {
  try {
    const compressed = hash.replace(/^#share=/, "");
    const compact = decompress(compressed);
    return decodeCompact(compact);
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
