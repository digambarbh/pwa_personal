export const QUOTES = [
  "One more problem than yesterday is still progress.",
  "The interview you're afraid of is 20 weeks away from someone who started today.",
  "Every unsolved problem on your list is just a skill you don't have yet — for now.",
  "Consistency beats intensity. Show up small, every single day.",
  "Your competition is sleeping in. That's the whole advantage.",
  "The offer letter is built in the weeks nobody's watching.",
  "You don't need motivation at 6 AM. You need a habit that doesn't ask.",
  "Nobody remembers the days you almost gave up and didn't.",
  "Hard problems today are easy problems in Phase 3. Keep going.",
  "A streak isn't about being perfect. It's about not quitting on the hard days.",
  "You're not behind. You're exactly where week one of a real plan looks like.",
  "The version of you that gets placed is built one focused hour at a time.",
  "Difficulty is the whole point — easy problems don't prepare you for anything.",
  "Log the score. Fix the gap. Repeat. That's the entire system.",
  "Discipline is choosing between what you want now and what you want most.",
  "Your GitHub graph is a diary of the days you didn't quit.",
  "20 weeks feels long until you're in week 19 wishing you'd started sooner.",
  "The best time to fix a weak topic is the moment you find it, not the night before.",
  "You don't have to feel ready. You just have to open the next problem.",
  "Small daily wins compound into an interview you walk into with confidence.",
  "Every mock test is data, not a verdict. Use it and move on.",
  "The gap between average and placed is usually just who showed up more days.",
  "Future you is counting on today's one hour of focus.",
  "Progress you can't see yet is still progress.",
  "Nobody is coming to do the DSA sheet for you. Good — that means it's yours to own.",
  "Tired and done for the day is fine. Tired and quitting the plan is not.",
  "The pattern you learn today will save you 10 minutes in an interview 3 months from now.",
  "You're not studying for a test. You're building the person who gets the offer.",
  "It's not about being the smartest in the room. It's about being the most prepared.",
  "Start the timer. The hardest part of every session is the first two minutes.",
];

export function getQuoteOfDay() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const now = new Date();
  const diff = now - start;
  const dayOfYear = Math.floor(diff / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}
