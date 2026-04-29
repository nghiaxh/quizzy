import confetti from "canvas-confetti";

export function fireCorrect() {
  confetti({
    particleCount: 70,
    spread: 65,
    origin: { y: 0.75 },
    colors: ["#534AB7", "#62C554", "#F4BE4F", "#5DCAA5", "#ED6B5A"],
    ticks: 180,
  });
}

export function fireBig() {
  const opts: confetti.Options = {
    particleCount: 80,
    spread: 60,
    ticks: 250,
    colors: ["#534AB7", "#62C554", "#F4BE4F", "#5DCAA5", "#ED6B5A"],
  };
  confetti({ ...opts, angle: 60, origin: { x: 0, y: 0.65 } });
  setTimeout(() => {
    confetti({ ...opts, angle: 120, origin: { x: 1, y: 0.65 } });
  }, 150);
  setTimeout(() => {
    confetti({ ...opts, angle: 90, origin: { x: 0.5, y: 0.5 }, particleCount: 50 });
  }, 350);
}
