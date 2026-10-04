# Rot Clock

Game-style fridge app. Add food, see a spoilage countdown, get rescue meals, and track money and estimated methane saved.
Built for Climate Hack-tion 2026 (Zero Waste and Methane Reduction).

## Run
Open `index.html`, or serve it: `python3 -m http.server 8080` then visit http://localhost:8080.
For GitHub Pages: push `index.html` to the repo root and enable Pages.

## Sign up and login
Browser-only demo. Passwords are salted and hashed (PBKDF2) and stored with each user's fridge data in localStorage.
This is not secure for real users: there is no server. Production would need a backend (see P01/P02 gates).

## Assumptions
Methane: 1000 g x 0.15 x 0.5 x 1.0 x 0.5 x 16/12 = 50 g CH4 per kg (IPCC 2006 Vol 5 Ch 3, to be verified). Shelf lives, weights and prices are placeholders.

## Tools and AI disclosure
Vanilla HTML/CSS/JS, no libraries. Written with Claude (Anthropic) AI assistance.
