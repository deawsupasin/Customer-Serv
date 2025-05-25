# Your App

Simple Electron app with a maintainable structure, no frontend build tools required.

## Structure

- `src/main/` – Electron main process code
- `src/renderer/` – HTML, JS, CSS for UI
- `src/preload/` – Electron preload script
- `db/` – SQLite database (created at runtime)
- `.gitignore` – ignores node_modules and database

## Run the app

```sh
npm install
npm start
```

## Notes

- The database file is created automatically in the `db/` folder.
- No build step is needed for the frontend.