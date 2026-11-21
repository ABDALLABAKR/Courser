# 🎲 Grade 10 Physics — Snakes & Ladders Championship

A classroom game show for four groups. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari) — no installation and no internet needed (fonts load from Google Fonts when online, with a fallback otherwise).

When the repository is published with GitHub Pages it is at `/physics-snakes-ladders/`.

## Quick start
1. Name the four groups and (optionally) list each group's students — they take turns answering.
2. Choose a 100- or 50-square board, the competition time limit and the question timers, then press **Start championship**.
3. Press **Space** to roll. The group picks Easy / Moderate / Challenging, answers, and the teacher presses **A** (reveal), then **C** (correct) or **X** (incorrect).

## Rules in brief
- Correct answer → earn points and move forward by the roll. Incorrect → stay put.
- Ladder foot → bonus question to climb (15 pts). Snake head → rescue question or slide down (15 pts).
- Special squares: 🎁 +10 · ⚡ extra turn · 🛡️ snake protection · 🚀 +5 squares · 🔄 swap · 💎 double points · 🎯 head-to-head challenge · ⏪ back 3 · ❓ mystery (random effect).
- Movement from a special square can trigger a snake or ladder but never another special square, so effects cannot loop.
- Reaching the last square triggers the **Final Challenge**; a miss means trying again next turn.
- When the competition clock runs out, most points wins and board position breaks ties.

Points: Easy 5 · Moderate 10 · Challenging 15 · Ladder 15 · Snake rescue 15 · Final 15 · Challenge win 10.

## Teacher tools
Open the **🎛️ Teacher** panel (key **T**) to pause, restart, save/export/load, roll, reveal, mark answers, replace or skip questions, adjust scores and positions, change timers, undo, toggle sound and enter full-screen.

Keys: `Space` roll · `1/2/3` difficulty · `A` reveal · `C` correct · `X` incorrect · `S` replace question · `+` add 15 s · `P` pause · `U` undo · `F` full-screen · `M` sound · `H` help.

The game saves automatically in the browser after every turn and can be resumed from the start screen. **Export save** downloads a file to move a game to another computer.

## Question bank
100 built-in questions across 8 topics, 3 levels and 6 question types (`js/questions.js`). In **📚 Question bank** you can add, edit, delete, search, export, and import questions from JSON or CSV. Download the CSV template from the bank screen. Its columns are:

```
category,difficulty,type,question,optionA,optionB,optionC,optionD,answer,explanation
```

`category` is 1–8, `difficulty` is Easy/Moderate/Challenging, and `type` is mcq/tf/short/num/mistake/reason. For mcq, `answer` is the letter A–D. Questions don't repeat until the whole active bank has been used.
