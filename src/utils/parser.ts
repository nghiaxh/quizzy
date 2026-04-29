export interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
}

export function parseQuestions(raw: string): Question[] {
  const blocks = raw.split(/\n{2,}/).filter((b) => b.trim());
  const questions: Question[] = [];

  for (const block of blocks) {
    const lines = block
      .trim()
      .split("\n")
      .filter((l) => l.trim());
    if (!lines.length) continue;

    const qMatch = lines[0].match(/^\d+\.\s+(.+)/);
    if (!qMatch) continue;

    const q: Question = {
      id: questions.length,
      text: qMatch[1].trim(),
      options: [],
      correctIndex: -1,
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      const isCorrect = line.startsWith("*");
      const m = line.replace(/^\*/, "").match(/^([A-D])\.\s+(.+)/);
      if (!m) continue;
      if (isCorrect) q.correctIndex = q.options.length;
      q.options.push(m[2].trim());
    }

    if (q.options.length >= 2 && q.correctIndex !== -1) {
      questions.push(q);
    }
  }

  return questions;
}
