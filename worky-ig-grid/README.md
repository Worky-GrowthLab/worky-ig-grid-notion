# Worky — Grid IG Preview

Mini app que se conecta en vivo a la base **"Worky - Master de contenidos"** de Notion
y renderiza un grid de Instagram (3 columnas, orden cronológico inverso, igual que el
perfil real) para previsualizar cómo va a quedar el feed antes de publicar.

No depende de ningún widget pago de terceros: es código propio, se hostea en Vercel
(mismo esquema que DASH-01) y se embebe en Notion con un bloque `/embed`.

## Cómo funciona

- `app/api/grid/route.js` — función serverless. Es la ÚNICA parte que toca el token de
  Notion (nunca queda expuesto en el navegador). Consulta el data source vía
  `POST /v1/data_sources/{id}/query`, filtra por plataforma + que tenga imagen y fecha,
  y ordena por "Fecha de Publicación" descendente.
- `app/page.js` — el grid en sí. Pide `/api/grid` y pinta las imágenes en una grilla
  cuadrada tipo Instagram, con ícono de Reel/Carrusel en la esquina.
- Parámetros de URL soportados en el embed: `?ds=<data_source_id>` (para apuntar a otra
  base, ej. Visual Shop), `?platform=Instagram`, `?cols=3` o `?cols=4`, `?limit=24`,
  `?theme=dark` (fondo oscuro estilo Worky en vez de blanco tipo IG).

## Paso 1 — Crear la integración de Notion (una sola vez)

1. Entrá a **notion.so/my-integrations** con la cuenta del workspace "Worky".
2. **New integration** → nombre: `Worky Grid Widget` → tipo: Internal → Submit.
3. Copiá el **Internal Integration Token** (empieza con `secret_...`). Es el valor de
   `NOTION_TOKEN`.

## Paso 2 — Compartir la base con la integración

1. Abrí la base **"Worky - Master de contenidos"** en Notion.
2. Menú `···` (arriba a la derecha) → **Conexiones** (Connections) → buscá y agregá
   `Worky Grid Widget`.
3. Sin este paso la API responde 403 aunque el token sea correcto.

El `data_source_id` de esa base ya está identificado y precargado en `.env.example`:
`268734c7-0526-81b5-993b-000bf16684fc` — no hace falta que lo busques.

## Paso 3 — Subir el código a GitHub

```bash
cd worky-ig-grid
git init
git add .
git commit -m "Worky IG grid preview"
gh repo create worky-ig-grid --private --source=. --push
# o, sin gh cli: creá el repo vacío en github.com y
# git remote add origin <url> && git push -u origin main
```

## Paso 4 — Deploy en Vercel (rol de Aparicio, mismo flujo que DASH-01)

1. **vercel.com** → **Add New → Project** → importar el repo `worky-ig-grid`.
2. Framework se detecta solo (Next.js). No tocar build settings.
3. En **Environment Variables** agregar:
   - `NOTION_TOKEN` = el secret del Paso 1
   - `NOTION_DATA_SOURCE_ID` = `268734c7-0526-81b5-993b-000bf16684fc`
4. Deploy. Vercel da una URL tipo `https://worky-ig-grid.vercel.app`.

## Paso 5 — Embeberlo en Notion

1. En la página de Notion donde querés el grid (al lado del Calendario, por ejemplo en
   "Contenido Anual Worky"), escribí `/embed`.
2. Pegá la URL de Vercel del paso anterior.
3. Ajustá el tamaño del bloque arrastrando el borde. Listo: cada vez que cargues una
   imagen y fecha en el Content Calendar, el grid se actualiza (botón "Actualizar" o
   recargando la página).

### Variantes útiles para otros clientes/marcas

Como el `?ds=` es parametrizable, un solo deploy sirve para todos los grids: alcanza con
compartir la base de Visual Shop o de la marca personal con la misma integración y
embeber la misma URL de Vercel con otro `?ds=<data_source_id_del_cliente>`.

Ejemplo: `https://worky-ig-grid.vercel.app/?ds=xxxxxxxx&cols=3&theme=dark`

## Desarrollo local (opcional, para probar antes de deployar)

```bash
npm install
cp .env.example .env.local   # completar con tu token real
npm run dev
# abrir http://localhost:3000
```
