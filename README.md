# Mini Support Desk

A lightweight internal support-ticket management tool built for the BuiltbyGSV Software Engineer Internship 2026 Round 01 assignment.

## Features

- View 10 sample support tickets
- Create a new ticket
- View individual ticket details
- Update status: Open → In Progress → Resolved
- Change priority: Low / Medium / High
- Search by ticket title, client, or ticket ID
- Filter by status and priority
- Delete tickets with confirmation
- Dashboard statistics for Total / Open / In Progress / Resolved
- Responsive UI
- LocalStorage persistence

## Extra improvement

I added two small usability improvements beyond the required feature list:

1. **Delete confirmation** — prevents accidental ticket deletion.
2. **Empty search/filter state with a clear-filters action** — makes it obvious when a query returns no tickets and provides a quick recovery path.

## Tech stack

- React
- Vite
- JavaScript
- CSS
- LocalStorage
- Lucide React icons

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Production build

```bash
npm run build
```

## AI usage

I used ChatGPT to assist with application planning, implementation suggestions, debugging, UI/content refinement, and README drafting. I reviewed the generated suggestions and understand the final code and implementation.

## Deployment

This project can be deployed to Vercel, Netlify, or another static hosting provider.
