# Japan Study

Mobile-first smart study planner for Japanese learning.

This repository hosts an MVP that:
- tracks study goals and knowledge units,
- knows weekly free-time windows,
- prioritizes urgent and weak topics,
- reserves review time so knowledge is not skipped,
- limits daily load to reduce cramming,
- works fully in the browser with localStorage.

The visual direction is inspired by the clarity of Japanese-learning apps such as Migii JLPT, but uses an original yellow theme and layout.

## Run locally
Open `index.html` directly, or serve the folder with any static web server.

## Deploy
The app is static and can be deployed with GitHub Pages from the repository root.

## Current MVP
Data is stored locally in the browser. Google Calendar sync and AI document ingestion are planned next.

## UI contrast rules
- Light background/surface -> dark text.
- Dark background/surface -> light text.
- Never inherit text colors from host/theme when contrast is uncertain.
- Yellow is an accent, not a default text color.
- Mobile readability takes priority over decorative styling.
