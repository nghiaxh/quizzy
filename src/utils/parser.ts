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
      .filter((l) => l.trim() !== "");
    if (!lines.length) continue;

    const qMatch = lines[0].match(/^\d+\.\s+(.+)/);
    if (!qMatch) continue;

    let questionText = qMatch[1].trim();
    const options: string[] = [];
    let correctIndex = -1;
    let currentOptionIndex = -1;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      const optMatch = line.match(/^(\*?)([A-D])\.\s+(.+)/);
      if (optMatch) {
        const isCorrect = optMatch[1] === "*";
        const text = optMatch[3].trim();
        currentOptionIndex = options.length;
        options.push(text);
        if (isCorrect && correctIndex === -1) {
          correctIndex = currentOptionIndex;
        }
      } else {
        if (currentOptionIndex === -1) {
          questionText += "\n" + line;
        } else {
          options[currentOptionIndex] += "\n" + line;
        }
      }
    }

    if (options.length >= 2 && correctIndex !== -1) {
      questions.push({
        id: questions.length,
        text: questionText,
        options,
        correctIndex,
      });
    }
  }

  return questions;
}
