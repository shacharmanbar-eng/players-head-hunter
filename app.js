const NEEDS = [
  ["physical", "Physical attributes"],
  ["shooting", "Shooting"],
  ["handling", "Ball handling"],
  ["passing", "Passing & playmaking"],
  ["defense", "Defense"],
  ["rebounding", "Rebounding"],
  ["iq", "Basketball IQ"],
  ["mental", "Mental & competitive"],
  ["team", "Team contribution"],
];

// Fictional sample players. Replaced by real collected data later.
const PLAYERS = [
  { name: "Daniel Arad", age: 27, pos: "PG", height: 190, team: "Sample Tel Aviv", league: "Israeli league",
    r: { physical: 3, shooting: 4, handling: 5, passing: 5, defense: 3, rebounding: 2, iq: 5, mental: 4, team: 4 },
    games: ["Sat 24 Oct 20:00 vs Sample Haifa", "Tue 27 Oct 19:30 @ Sample Jerusalem"] },
  { name: "Marko Vukovic", age: 31, pos: "C", height: 211, team: "Sample Belgrade", league: "EuroLeague",
    r: { physical: 5, shooting: 2, handling: 2, passing: 3, defense: 5, rebounding: 5, iq: 4, mental: 4, team: 4 },
    games: ["Thu 22 Oct 20:30 vs Sample Madrid", "Fri 30 Oct 21:00 @ Sample Athens"] },
  { name: "Lior Peretz", age: 23, pos: "SG", height: 196, team: "Sample Eilat", league: "Israeli league",
    r: { physical: 4, shooting: 5, handling: 4, passing: 3, defense: 3, rebounding: 2, iq: 3, mental: 4, team: 3 },
    games: ["Sun 25 Oct 20:00 vs Sample Netanya"] },
  { name: "Andre Costa", age: 26, pos: "SF", height: 201, team: "Sample Lisbon", league: "EuroLeague",
    r: { physical: 5, shooting: 4, handling: 3, passing: 3, defense: 5, rebounding: 4, iq: 4, mental: 5, team: 5 },
    games: ["Wed 21 Oct 20:45 @ Sample Milan", "Sat 24 Oct 18:00 vs Sample Kaunas"] },
  { name: "Tomer Ben-David", age: 34, pos: "PF", height: 206, team: "Sample Haifa", league: "Israeli league",
    r: { physical: 4, shooting: 3, handling: 2, passing: 4, defense: 4, rebounding: 5, iq: 5, mental: 5, team: 5 },
    games: ["Sat 24 Oct 20:00 @ Sample Tel Aviv"] },
  { name: "Nikos Pappas", age: 21, pos: "PG", height: 188, team: "Sample Athens", league: "EuroLeague",
    r: { physical: 3, shooting: 3, handling: 4, passing: 4, defense: 2, rebounding: 1, iq: 3, mental: 3, team: 3 },
    games: ["Fri 23 Oct 20:00 vs Sample Istanbul"] },
];

const needsEl = document.getElementById("needs");
const resultsEl = document.getElementById("results");
const filterIds = ["f-pos", "f-league", "f-age-min", "f-age-max", "f-h-min", "f-h-max"];

NEEDS.forEach(([key, label]) => {
  const row = document.createElement("div");
  row.className = "need";
  row.innerHTML =
    `<label for="n-${key}">${label} <output id="o-${key}">3</output></label>` +
    `<input type="range" id="n-${key}" min="1" max="5" step="1" value="3">`;
  needsEl.appendChild(row);
  row.querySelector("input").addEventListener("input", (e) => {
    document.getElementById(`o-${key}`).textContent = e.target.value;
    render();
  });
});
filterIds.forEach((id) => document.getElementById(id).addEventListener("input", render));

// Only shortfalls cost points: a player above the need is never penalised.
function score(player, needs) {
  let weight = 0, lost = 0;
  NEEDS.forEach(([k]) => {
    weight += needs[k];
    lost += needs[k] * Math.max(0, needs[k] - player.r[k]);
  });
  return Math.round(100 - (lost / (weight * 4)) * 100);
}

function currentNeeds() {
  const n = {};
  NEEDS.forEach(([k]) => (n[k] = Number(document.getElementById(`n-${k}`).value)));
  return n;
}

function passesFilters(p) {
  const v = (id) => document.getElementById(id).value;
  if (v("f-pos") && p.pos !== v("f-pos")) return false;
  if (v("f-league") && p.league !== v("f-league")) return false;
  if (v("f-age-min") && p.age < Number(v("f-age-min"))) return false;
  if (v("f-age-max") && p.age > Number(v("f-age-max"))) return false;
  if (v("f-h-min") && p.height < Number(v("f-h-min"))) return false;
  if (v("f-h-max") && p.height > Number(v("f-h-max"))) return false;
  return true;
}

function whyText(p, needs) {
  const met = NEEDS.filter(([k]) => needs[k] >= 4 && p.r[k] >= needs[k]).map(([, l]) => l.toLowerCase());
  const gaps = NEEDS.filter(([k]) => p.r[k] < needs[k]).map(([, l]) => l.toLowerCase());
  let t = met.length ? `Meets your top needs in ${met.join(", ")}.` : "No critical need is fully covered.";
  if (gaps.length) t += ` Below your target in ${gaps.join(", ")}.`;
  return t;
}

function card(p, needs) {
  const bars = NEEDS.map(([k, label]) => {
    const short = p.r[k] < needs[k] ? " short" : "";
    return `<div class="bar${short}"><span>${label}</span>` +
      `<div class="track"><div class="fill" style="width:${p.r[k] * 20}%"></div>` +
      `<div class="need-mark" style="left:calc(${needs[k] * 20}% - 1px)" title="Your need: ${needs[k]}"></div></div>` +
      `<span class="nums">${p.r[k]} / ${needs[k]}</span></div>`;
  }).join("");
  return `<article class="card">
    <header><div><h3>${p.name}</h3>
    <span class="meta">${p.pos} · ${p.age} yrs · ${p.height} cm · ${p.team} (${p.league})</span></div>
    <span class="score">${p.score}% fit</span></header>
    <p class="why">${whyText(p, needs)}</p>
    <div class="bars">${bars}</div>
    <div class="games"><strong>Upcoming games</strong><ul>${p.games.map((g) => `<li>${g}</li>`).join("")}</ul></div>
  </article>`;
}

function render() {
  const needs = currentNeeds();
  const list = PLAYERS.filter(passesFilters)
    .map((p) => ({ ...p, score: score(p, needs) }))
    .sort((a, b) => b.score - a.score);
  resultsEl.innerHTML = list.length
    ? list.map((p) => card(p, needs)).join("")
    : `<p class="empty">No players match these filters.</p>`;
}

render();
