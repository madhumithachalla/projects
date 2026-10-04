# ShelfShift

Which fresh-produce batches will become waste before they sell? ShelfShift adjusts printed expiry using each batch's temperature history,
compares remaining life with the sales rate, and recommends the least aggressive action (transfer or markdown) that prevents the waste.
Includes sign up and login. Built for Climate Hack-tion 2026 (Zero Waste and Methane Reduction).

## Run
Open `index.html`, or `python3 -m http.server 8080` and visit http://localhost:8080.

## Sign up and login
Browser-only demo. Passwords are salted and hashed (PBKDF2) and stored in localStorage with each user's applied actions. Not secure for real users: there is no server.

## Data and assumptions
All batches, temperatures and sales rates are simulated. Life penalty (0.065 days per hour above the safe limit), safe limits and recovery rates are illustrative and unvalidated.
Methane: 1000 g x 0.15 x 0.5 x 1.0 x 0.5 x 16/12 = 50 g CH4 per kg of landfilled food, before landfill gas capture. To be verified against IPCC 2006 Vol 5 Ch 3.

## Tools and AI disclosure
Vanilla HTML/CSS/JS, no libraries. This build is a reconstruction of the team's ShelfShift dashboard, written with Claude (Anthropic) AI assistance.
