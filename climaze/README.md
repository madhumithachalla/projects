# CliMaze

Climate Hack-tion 2026 prototype (Zero Waste and Methane Reduction).

## Main app: ShelfShift
`index.html` is the integrated idea. It adjusts printed expiry using each batch's temperature history, compares remaining life with the sales rate,
and recommends the least aggressive action (transfer or markdown) that prevents the waste. Includes sign up and login.

One app, two sides:
- **Dashboard (retail):** batch waste risk, dynamic expiry from temperature history, FEFO, recommended transfers and markdowns.
- **My fridge (household):** countdown per item, rescue meals, points and streaks. Food left out of the fridge loses life using the same temperature penalty as the retail model.
- **Impact:** combined food, money and estimated methane avoided across both sides.

Open `index.html`, or run `python3 -m http.server 8080` and visit http://localhost:8080.

## Also in this repo
- `rot-clock/`: the consumer fridge-countdown game (Fridge, Add, Cook, Impact tabs), with sign up and login.
- `shelfshift/`: same ShelfShift app, kept at its own path.
- `Rot-Clock-Team-Brief.pdf`: team brief.

## Sign up and login
Browser-only demo. Passwords are salted and hashed (PBKDF2) and stored in localStorage. Not secure for real users: there is no server.

## Data and assumptions
All data is simulated. Life penalty, safe limits and recovery rates are illustrative and unvalidated.
Methane: 1000 g x 0.15 x 0.5 x 1.0 x 0.5 x 16/12 = 50 g CH4 per kg of landfilled food, before landfill gas capture. To be verified against IPCC 2006 Vol 5 Ch 3.

## Tools and AI disclosure
Vanilla HTML/CSS/JS, no libraries. Built with Claude (Anthropic) AI assistance.
