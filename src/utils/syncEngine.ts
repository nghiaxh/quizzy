import { Exam } from "../store/quizStore";

export interface MergeResult {
  mergedExams: Exam[];
  uploaded: Exam[];
  downloaded: Exam[];
}

export function twoWayMerge(
  localExams: Exam[],
  driveExams: Exam[],
  _lastSyncAt: number | null,
): MergeResult {
  const localMap = new Map<string, Exam>(
    localExams.map((e) => [e.id, e]),
  );
  const driveMap = new Map<string, Exam>(
    driveExams.map((e) => [e.id, e]),
  );
  const allIds = new Set([...localMap.keys(), ...driveMap.keys()]);

  const mergedExams: Exam[] = [];
  const uploaded: Exam[] = [];
  const downloaded: Exam[] = [];

  for (const id of allIds) {
    const local = localMap.get(id);
    const drive = driveMap.get(id);

    if (local && !drive) {
      if (!local.deletedAt) {
        uploaded.push(local);
        mergedExams.push(local);
      }
    } else if (drive && !local) {
      if (!drive.deletedAt) {
        downloaded.push(drive);
        mergedExams.push(drive);
      }
    } else if (local && drive) {
      if (local.deletedAt) {
        if (drive.updatedAt > local.deletedAt && !drive.deletedAt) {
          downloaded.push(drive);
          mergedExams.push(drive);
        } else if (_lastSyncAt == null && !drive.deletedAt) {
          downloaded.push(drive);
          mergedExams.push(drive);
        }
      } else if (drive.deletedAt) {
        if (local.updatedAt > drive.deletedAt) {
          uploaded.push(local);
          mergedExams.push(local);
        }
      } else {
        if (local.updatedAt >= drive.updatedAt) {
          mergedExams.push(local);
          if (local.updatedAt !== drive.updatedAt) uploaded.push(local);
        } else {
          mergedExams.push(drive);
          downloaded.push(drive);
        }
      }
    }
  }

  return { mergedExams, uploaded, downloaded };
}
