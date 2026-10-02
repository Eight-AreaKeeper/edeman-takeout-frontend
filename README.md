# Edeman Frontend

Admin console for [edeman-backend](https://github.com/Eight-AreaKeeper/edeman-backend), a food-ordering/takeout platform — a Vue 3 + TypeScript rebuild of the original `project-rjwm-admin-vue-ts` (Vue 2 + Element UI, Chinese-only UI), with a lighter/more vivid visual design and a fully English UI.

## Stack

- Vite + Vue 3 (`<script setup lang="ts">`)
- Element Plus
- Pinia (state)
- Vue Router 4
- Axios
- ECharts 5 via `vue-echarts`
- dayjs

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies `/api/*` to `http://localhost:8080/admin` (the edeman-backend server), matching `vite.config.ts`. Start [edeman-backend](https://github.com/Eight-AreaKeeper/edeman-backend) separately before logging in.

```bash
npm run build     # type-check + production build
npm run preview   # preview the production build
```

## Project layout

```
src/
  api/            API modules — one per backend controller (category, dish, employee, setMeal, order, shop, workspace, report, notifications, common)
  components/     Shared UI: StatusTag, EmptyState, PageHeader, ImageUpload, OrderDetailDialog, CancelReasonDialog
  composables/    usePagination, useOrderActions (shared order accept/reject/cancel/deliver/complete logic)
  layout/         AppLayout, Sidebar, Navbar, PasswordDialog
  router/         Route table + auth guard
  stores/         Pinia stores: user (auth), app (sidebar state, unread count)
  styles/         Design tokens (variables.scss) + global styles
  utils/          request.ts (axios client), cookies.ts, dateRanges.ts, validators.ts, parseList.ts
  views/          One folder per feature: login, dashboard, order, category, dish, setmeal, statistics, employee, notifications, not-found
```

## Backend compatibility notes

This frontend targets the [edeman-backend](https://github.com/Eight-AreaKeeper/edeman-backend) API as it exists in that repo.

- **Notification Center** (`/messages/*`) is backed by a `MessageController`/`NotificationService`/`notification` table in `edeman-server` (see that repo's `src/main/resources/sql/notification.sql`). It's populated from two existing order events: a new order being paid (`type: 1`) and a customer urging an order (`type: 2`, "rush order" reminder). Requires the backend to be **restarted** to pick up the new controller.
- **Statistics → Data Overview cards** (`/report/dataOverView`) and the **Detailed Report** page (`/report/amountCollect`, `/dayCollect`, `/hourCollect`, `/payTypeCollect`, `/categoryCollect`, `/currentDishRank`, and their date-range variants) are **not implemented** on `ReportController`, which currently only has `turnoverStatistics`, `userStatistics`, `ordersStatistics`, `top10`, and `export`. These calls fail silently (no error spam) rather than blocking the rest of the page — build them on the backend the same way `MessageController` was added, if needed.

## Bug fixes made relative to the original template

1. Notification Center parses the `details` field with `JSON.parse` instead of `eval()`.
2. Login page has no hardcoded prefilled credentials.
3. The 404 page's "Back to home" link actually routes to `/`.
4. Sidebar collapsed/expanded state is correctly restored on reload (the original computed a cookie key but never read it back).
5. Order accept/reject/cancel/deliver/complete logic — previously duplicated between the Order Management page and the Dashboard's embedded order list (~400 lines) — is now a single `useOrderActions` composable shared by both.
