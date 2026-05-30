# Sanrio World

Mini aplicación web con persistencia y consumo de API.

## Cómo ejecutar

### 1. Abrir la app
Abre `index.html` con Live Server (VSCode) o cualquier servidor local.

### 2. Iniciar JSON Server (para la API)
```bash
npx json-server db.json
```
Esto levanta la API en `http://localhost:3000/characters`

## Qué hace cada parte

| Task | Archivo | Qué implementa |
|------|---------|---------------|
| 1 | `index.html` + `app.js` | Estructura base, archivos enlazados |
| 2 | `app.js` — `validateForm()`, `showFeedback()` | Validación y mensajes en el DOM |
| 3 | `app.js` — `renderList()`, `createCharacterElement()`, `deleteCharacter()` | DOM dinámico con appendChild/removeChild |
| 4 | `app.js` — `saveToStorage()`, `loadFromStorage()`, `init()` | localStorage entre sesiones |
| 5 | `app.js` — `fetchCharactersFromAPI()`, `postCharacterToAPI()`, `putCharacterToAPI()`, `deleteCharacterFromAPI()` | GET, POST, PUT, DELETE con fetch |
| 6 | Todos | Todo funciona en conjunto |
