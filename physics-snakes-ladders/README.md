# 🎲 Grade 10 Physics — Snakes & Ladders Championship

A classroom game show for four groups. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari) — no installation and no internet needed (fonts load from Google Fonts when online, with a fallback otherwise).

When the repository is published with GitHub Pages it is at `/physics-snakes-ladders/`.

## Offline version
`physics-championship.html` is the whole game in a single file. Save it on the classroom laptop (or a USB stick) and double-click it to play in Chrome or Edge with no internet. Games save in that browser on that laptop. After changing the game or questions, rebuild it with `python3 build-offline.py`.

## Quick start
1. Name the four groups and (optionally) list each group's students — they take turns answering.
2. Choose a 100- or 50-square board, the competition time limit and the question timers, then press **Start championship**.
3. Press **Space** to roll. The roll sets the difficulty — **1–2 Easy, 3–4 Moderate, 5–6 Challenging** — and the group answers a multiple-choice question. Tap the option the group chooses (or press A–D): the game checks it, shows the correct answer and explanation, and moves on automatically. Running out of time counts as wrong.

## Rules in brief
- Correct answer → earn points and move forward by the roll. Incorrect → stay put.
- Ladder foot → bonus question to climb (15 pts). Snake head → rescue question or slide down (15 pts).
- Special squares: 🎁 +10 · ⚡ extra turn · 🛡️ snake protection · 🚀 +5 squares · 🔄 swap · 💎 double points · 🎯 head-to-head challenge (both groups lock in an answer; each correct group earns 10) · ⏪ back 3 · ❓ mystery (random effect).
- Movement from a special square can trigger a snake or ladder but never another special square, so effects cannot loop.
- Reaching the last square triggers the **Final Challenge**; a miss means trying again next turn.
- When the competition clock runs out, most points wins and board position breaks ties.

Points: Easy 5 · Moderate 10 · Challenging 15 · Ladder 15 · Snake rescue 15 · Final 15 · Challenge win 10.

## Audience features (for a large hall)
- **📺 Welcome / rules slideshow** (key **W**): four large slides (groups and their supporter sections, how to play, snakes/ladders/power-ups, audience rules). It opens automatically after **Start championship**, advances every 12 s, and the clock waits until **Start the show**.
- **🙋 Ask the Audience** (key **V** during a question): each group gets one lifeline by default (set 0–3 in setup). The timer pauses while the hall votes with raised hands.
- **🎤 Audience question** (key **Q** between turns): a prize question for the audience that doesn't affect scores. Tap the answer the chosen student gives. The competition clock pauses meanwhile, and the game suggests one every 3 rounds.
- **📣 Supporter sections**: name each group's cheering section in setup. It appears on the scoreboard and the welcome slide.

## Teacher tools
Open the **🎛️ Teacher** panel (key **T**) to pause, restart, save/export/load, roll, replace or skip questions, adjust scores and positions, change timers, undo, toggle sound and enter full-screen.

Keys: `Space` roll · `A–D` (or `1–4`) lock in the answer · `Enter` continue · `S` replace question · `+` add 15 s · `P` pause · `U` undo · `F` full-screen · `M` sound · `H` help.

The game saves automatically in the browser after every turn and can be resumed from the start screen. **Export save** downloads a file to move a game to another computer.

## Question bank
118 built-in multiple-choice questions (4 options each, 3 levels) taken from the course book: **Chapter 2 – Strength of Solids** (Sections 2-1, 2-2 and the chapter review) and **Chapter 3, Section 3-1 – Fluids and Buoyant Force** (`js/questions.js`). The 8 topics are: phases of matter; moles and molecular quantities; interatomic forces and bonds; solids, rigidity and elasticity; tension, stress and strain; Young’s modulus; fluids and density; buoyant force and Archimedes’ principle. Options are shuffled every time a question is shown. In **📚 Question bank** you can add, edit, delete, search, export, and import questions from JSON or CSV. Download the CSV template from the bank screen. Its columns are:

```
category,difficulty,type,question,optionA,optionB,optionC,optionD,answer,explanation
```

`category` is 1–8, `difficulty` is Easy/Moderate/Challenging, `type` is mcq, and `answer` is the letter A–D. Only multiple-choice questions are imported. Questions don't repeat until the whole active bank has been used.
