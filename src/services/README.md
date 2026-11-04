# services/

This folder is intentionally empty. The app is **frontend only**.

All data comes from `src/data/*.js` and is managed by `src/context/DataContext.jsx`, which persists it to `localStorage` under the key `hm.data.v1`.

To connect a real backend:

1. Add one module per resource here, for example `roomsService.js` exporting `list()`, `get(id)`, `create()` and `update()`, using `import.meta.env.VITE_API_BASE_URL`.
2. Replace the matching action in `DataContext` with an async call to that service. Keep the action names, so pages don't need to change.
3. Move authentication to the server. `AuthContext` currently checks passwords in the browser, which is for demonstration only.
