# Deployment

## Recommended Host
Netlify or Vercel (static Vite build).

## Build Command
```powershell
npm run build
```

## Output Folder
`dist/`

## Environment Variables
None required for current functionality.

## SPA Routing Notes
No client-side route rewrites are required for the current single-route app. If routing is added later, configure a fallback rewrite to `index.html`.
