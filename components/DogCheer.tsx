"use client";

const DOGS = ["🐶", "🐕", "🦮", "🐩", "🐕‍🦺", "🐾"];

const CHEERS = [
  "You showed up. That's the hard part!",
  "Good human! Let's get those reps. 🦴",
  "Every set counts. Proud of you!",
  "Strong today, stronger tomorrow.",
  "Your pup believes in you. 🐾",
  "One more. You've got this!",
  "Consistency beats intensity. Keep going!",
  "Look at you go! Tail = wagging.",
];

export default function DogCheer({
  message,
  seed = 0,
  size = "text-5xl",
  className = "",
}: {
  message?: string;
  seed?: number;
  size?: string;
  className?: string;
}) {
  const dog = DOGS[Math.abs(seed) % DOGS.length];
  const cheer = message ?? CHEERS[Math.abs(seed) % CHEERS.length];
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className={`${size} inline-block animate-floaty`} aria-hidden>
        {dog}
      </span>
      <p className="text-sm font-semibold text-stone-600">{cheer}</p>
    </div>
  );
}
