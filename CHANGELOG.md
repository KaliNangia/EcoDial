# Changelog

All notable changes to the EcoDial Carbon Footprint Awareness Console are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/).

## [1.1.0] - 2026-06-21

### Added
- Created **FastAPI backend API** inside `backend/` for server-side carbon calculation.
- Implemented **Pydantic schemas** in `backend/app/schemas.py` to securely validate and sanitize client input.
- Added shared server-side state in `backend/app/database.json` to synchronize the community leaderboard and prevent local-storage score tampering.
- Implemented a dockerized setup featuring a root-level `docker-compose.yml` to launch backend and frontend simultaneously.
- Configured a **graceful local fallback** in JavaScript so that if the API server goes offline, calculations and leaderboard continue locally via standard offline equations and local storage without breaking.
- Configured **Nginx Alpine Docker container** inside `frontend/` to serve static SPA files on port `8080`.
- Standardized repo structure with configuration files: `.dockerignore`, `.editorconfig`, `.gitignore`, `.env.example`, and `.pre-commit-config.yaml`.
- Integrated glows and custom-styled retro emoticons (`(^_^)` / `(-_-)` / `(>_<)`) on the card indicating carbon status.

### Changed
- Shifted calculations and status checking to secure server-side routes.
- Decoupled code structures: moved frontend code under `frontend/` and backend code under `backend/`.
- Replaced references to the "Paris Agreement" with generic local target metrics tailored for standard regional and country trackers.

## [1.0.0] - 2026-06-18

### Added
- Initial standalone offline prototype of the EcoDial console.
- Interactive SVG tactile dial control, clicky sound effects, custom color sliders.
- Real-time carbon math, comparison bars, visual breakdown charts, and shareable carbon passport cards using canvas-rendered downloads.
- Local Storage history snapshot log and mock community board layout.
