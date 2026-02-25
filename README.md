# TaskNest

TaskNest is a frontend task manager focused on day planning and recurring work. It runs fully in the browser and stores data locally with no backend dependency.

## Features
- Create, edit, and delete tasks with title, notes, due date, and recurrence.
- Filter tasks by Today, Upcoming, Overdue, and Completed.
- Support daily and weekly recurrence with automatic due-date roll-forward.
- Toggle upcoming window ranges (14 days, 30 days, or all upcoming).
- Persist tasks and UI state in localStorage.

## Tech Stack
- React 19
- TypeScript
- Vite 7
- ESLint 9

## Local Development
```powershell
npm install
npm run dev
```

## Build
```powershell
npm run build
npm run preview
```

## Deployment Overview
Deploy the static `dist/` output to Netlify or Vercel. No environment variables are required for the current app.

## Attribution
Tasks icon: https://www.flaticon.com/free-icons/tasks
