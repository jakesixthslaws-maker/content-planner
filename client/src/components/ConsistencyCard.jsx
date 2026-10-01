import { useMemo, useState } from "react";
import "./consistency.css";

const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const dayIndex = (d) => (d.getDay() + 6) % 7; // Monday = 0
const startOfWeek = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return addDays(x, -dayIndex(x)); };
const sameDay = (a, b) => a.toDateString() === b.toDateString();
// Uses postedAt if your API has it, otherwise the last time the post changed.
const postedOn = (p) => new Date(p.postedAt || p.updatedAt || p.createdAt || 0);

export default function ConsistencyCard({ posts }) {
  const [goal, setGoal] = useState(() => {
    try { return Number(localStorage.getItem("weeklyGoal")) || 3; } catch { return 3; }
  });
  const pickGoal = (n) => {
    setGoal(n);
    try { localStorage.setItem("weeklyGoal", String(n)); } catch { /* storage unavailable */ }
  };

  const s = useMemo(() => {
    const today = new Date();
    const wk0 = startOfWeek(today);
    const posted = posts.filter((p) => p.status === "POSTED").map(postedOn).filter((d) => d.getTime() > 0);
    const inWeek = (start) => posted.filter((d) => d >= start && d < addDays(start, 7)).length;

    const thisWeek = inWeek(wk0);
    let streak = 0;
    for (let i = 1; i <= 52 && inWeek(addDays(wk0, -7 * i)) >= goal; i++) streak++;
    if (thisWeek >= goal) streak++; // this week only counts once the goal is hit, but never breaks the streak early

    const cells = Array.from({ length: 28 }, (_, i) => {
      const day = addDays(wk0, i - 21);
      return { key: i, n: posted.filter((d) => sameDay(d, day)).length, future: day > today, today: sameDay(day, today) };
    });

    const count = (st) => posts.filter((p) => p.status === st).length;
    const ready = count("FILMED"), scripted = count("SCRIPTED"), ideas = count("IDEA");
    let note;
    if (thisWeek >= goal) note = "Goal hit. Anything extra builds momentum for next week.";
    else if (ready) note = `${ready} filmed post${ready > 1 ? "s are" : " is"} ready. Publish one today.`;
    else if (scripted) note = `${scripted} scripted. Film one and you're close.`;
    else if (ideas) note = "Turn one of your ideas into a script today.";
    else note = "Add an idea above to start your week.";

    return { thisWeek, streak, cells, note, left: 6 - dayIndex(today) };
  }, [posts, goal]);

  const done = s.thisWeek >= goal;
  const C = 2 * Math.PI * 34;

  return (
    <section className="consistency" aria-label="Posting consistency">
      <div className="cons-ring">
        <svg viewBox="0 0 80 80" width="88" height="88" aria-hidden="true">
          <circle cx="40" cy="40" r="34" className="ring-bg" />
          <circle cx="40" cy="40" r="34" className="ring-fg" strokeDasharray={C}
            strokeDashoffset={C * (1 - Math.min(1, s.thisWeek / goal))} transform="rotate(-90 40 40)" />
        </svg>
        <div className="ring-text"><b>{s.thisWeek}</b><span>of {goal}</span></div>
      </div>

      <div className="cons-main">
        <h2>{done ? "Goal hit this week" : `${goal - s.thisWeek} more to hit your goal`}</h2>
        <p>{s.note} <span className="cons-left">{s.left === 0 ? "Last day of the week." : `${s.left} day${s.left > 1 ? "s" : ""} left.`}</span></p>
        <label className="cons-goal">
          Weekly goal
          <select value={goal} onChange={(e) => pickGoal(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n} post{n > 1 ? "s" : ""} a week</option>)}
          </select>
        </label>
      </div>

      <div className="cons-side">
        <div className="cons-streak"><b>{s.streak}</b><span>week streak</span></div>
        <div className="cons-grid" aria-hidden="true">
          {s.cells.map((c) => (
            <i key={c.key} className={`cell c${Math.min(3, c.n)} ${c.future ? "future" : ""} ${c.today ? "today" : ""}`} />
          ))}
        </div>
      </div>
    </section>
  );
}