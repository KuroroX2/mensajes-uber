# 🚕 Mensajes para Uber

App (PWA) para generar mensajes a tu conductor a partir de **plantillas personalizables**.
Cada usuario define sus propias opciones, condiciones y textos.

Originalmente era un único `index.html` con los mensajes fijos para una dirección
(ver [`legacy/index.html`](legacy/index.html)). Ahora es una app React + Vite,
instalable y multiusuario.

## Stack

- **React + Vite** — frontend / PWA
- **vite-plugin-pwa** — service worker, manifest, instalable y offline
- **react-router-dom** — navegación
- **Capa de datos** (`src/lib/db.js`) — hoy persiste en `localStorage`; lista para
  reemplazarse por **Supabase** (auth + Postgres) sin tocar la UI.

## Cómo funciona una plantilla

```
Plantilla
 ├─ greeting      "Hola."
 ├─ fields[]      opciones que eliges al generar (select / toggle)
 └─ fragments[]   trozos de texto con condiciones (AND; vacío = siempre)
```

El mensaje final = saludo + los fragmentos cuyas condiciones se cumplen, en orden.
Los `select` pueden tener **autodetección por hora** (`autoTime`).

La plantilla de ejemplo "Mi casa" (`src/lib/seed.js`) porta la lógica original.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de producción en /dist
npm run lint
```

## Próximos pasos

1. **Supabase**: auth (email + Google) + sincronización en la nube (reemplazar `src/lib/db.js`).
2. Deploy en Vercel/Netlify.
3. Iconos PNG definitivos para la PWA.
