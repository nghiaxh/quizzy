import { Exam } from "../store/quizStore";
import { twoWayMerge } from "./syncEngine";

const BACKUP_FILE_NAME = "quizzy-backup.json";
const SCOPES = "https://www.googleapis.com/auth/drive.appdata";

let tokenClient: {
  requestAccessToken: (config?: { prompt?: string }) => void;
} | null = null;
let accessToken: string | null = null;
let tokenCallback: ((token: string) => void) | null = null;

export function initDriveClient(clientId: string) {
  const gis = (window as any).google?.accounts?.oauth2;
  if (!gis) return;

  tokenClient = gis.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: (resp: { access_token?: string; error?: string }) => {
      if (resp.error) return;
      accessToken = resp.access_token ?? null;
      if (accessToken && tokenCallback) {
        tokenCallback(accessToken);
        tokenCallback = null;
      }
    },
  });
}

export function isGisLoaded(): boolean {
  return !!(window as any).google?.accounts?.oauth2;
}

export function signIn(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject(new Error("Drive client chưa được khởi tạo"));

    tokenCallback = (token: string) => {
      localStorage.setItem("drive_access_token", token);
      resolve(token);
    };
    tokenClient.requestAccessToken();
  });
}

export async function tryRestoreToken(): Promise<boolean> {
  const stored = localStorage.getItem("drive_access_token");
  if (!stored) return false;

  accessToken = stored;
  return true;
}

export async function tryRefreshToken(): Promise<boolean> {
  if (!tokenClient) return false;
  return new Promise<boolean>((resolve) => {
    tokenCallback = (newToken: string) => {
      localStorage.setItem("drive_access_token", newToken);
      resolve(true);
    };
    (tokenClient as any).requestAccessToken({ prompt: "none" });
    setTimeout(() => {
      if (tokenCallback) {
        tokenCallback = null;
        resolve(false);
      }
    }, 10000);
  });
}

export function signOut() {
  const token = accessToken;
  accessToken = null;
  localStorage.removeItem("drive_access_token");
  if (token) {
    (window as any).google?.accounts?.oauth2?.revoke(token, () => {});
  }
}

export function isSignedIn(): boolean {
  return !!accessToken;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  if (!accessToken) throw new Error("Chưa đăng nhập Google Drive");
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options?.headers as Record<string, string>),
    },
  });
  if (res.status === 401) {
    accessToken = null;
    localStorage.removeItem("drive_access_token");
    throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Drive API error ${res.status}: ${text}`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

async function findBackupFile(): Promise<{ id: string } | null> {
  const data = await request<{ files: { id: string }[] }>(
    `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FILE_NAME}'&spaces=appDataFolder&fields=files(id)`,
  );
  return data.files[0] ?? null;
}

async function createFile(payload: unknown): Promise<{ id: string }> {
  const boundary = "quizzy-boundary";
  const metadata = JSON.stringify({
    name: BACKUP_FILE_NAME,
    parents: ["appDataFolder"],
  });
  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    metadata,
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(payload),
    `--${boundary}--`,
  ].join("\r\n");

  return request<{ id: string }>(
    `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id`,
    {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    },
  );
}

async function updateFile(fileId: string, payload: unknown): Promise<void> {
  const boundary = "quizzy-boundary";
  const metadata = JSON.stringify({});
  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    metadata,
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify(payload),
    `--${boundary}--`,
  ].join("\r\n");

  await request(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
    {
      method: "PATCH",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    },
  );
}

async function downloadFile(fileId: string): Promise<unknown> {
  return request(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
  );
}

export async function getBackupMetadata(): Promise<{
  id: string;
  modifiedTime: string;
} | null> {
  const data = await request<{ files: { id: string; modifiedTime: string }[] }>(
    `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FILE_NAME}'&spaces=appDataFolder&fields=files(id,modifiedTime)`,
  );
  return data.files[0] ?? null;
}

export interface SyncStats {
  uploaded: number;
  downloaded: number;
  total: number;
}

export async function orchestrateSync(
  localExams: Exam[],
  lastSyncAt: number | null,
): Promise<{ mergedExams: Exam[]; stats: SyncStats }> {
  const file = await findBackupFile();
  let driveExams: Exam[] = [];

  if (file) {
    const raw = await downloadFile(file.id);
    const backup = raw as { version: number; backedUpAt: string; exams: Exam[] };
    driveExams = backup.exams ?? [];
  }

  const { mergedExams, uploaded, downloaded } = twoWayMerge(
    localExams,
    driveExams,
    lastSyncAt,
  );

  const payload = {
    version: 1,
    backedUpAt: new Date().toISOString(),
    exams: mergedExams,
  };

  if (file) {
    await updateFile(file.id, payload);
  } else {
    await createFile(payload);
  }

  return {
    mergedExams,
    stats: { uploaded: uploaded.length, downloaded: downloaded.length, total: mergedExams.length },
  };
}
