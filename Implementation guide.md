# Flight Search Engine - Complete Implementation Guide

## 🎯 Quick Start (10 Hours Remaining)

### Time Allocation
- ✅ Setup & Structure: DONE (30 mins)
- ✅ API & Types: DONE (1 hour)
- ✅ Utilities & Hooks: DONE (1 hour)
- ⏳ Filter Components: 1.5 hours (NEXT)
- ⏳ Results Display: 1.5 hours
- ⏳ Price Chart: 1 hour
- ⏳ Main App & Routing: 1 hour
- ⏳ Styling & Polish: 1.5 hours
- ⏳ Deployment & Demo: 1 hour

---

## 📂 Project Structure (Created)

```
src/
├── types/index.ts               ✅ DONE
├── services/amadeus.ts          ✅ DONE
├── utils/helpers.ts             ✅ DONE
├── hooks/useFlights.ts          ✅ DONE
├── components/
│   ├── ui/                      ✅ DONE
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Select.tsx
│   ├── search/                  ✅ DONE
│   │   └── SearchForm.tsx
│   ├── filters/                 ⏳ CREATE NEXT
│   │   ├── FilterPanel.tsx
│   │   ├── PriceFilter.tsx
│   │   ├── StopsFilter.tsx
│   │   ├── AirlineFilter.tsx
│   │   └── TimeFilter.tsx
│   ├── results/                 ⏳ CREATE
│   │   ├── FlightList.tsx
│   │   ├── FlightCard.tsx
│   │   └── SortControls.tsx
│   └── charts/                  ⏳ CREATE
│       └── PriceChart.tsx
├── routes/                      ⏳ CREATE
│   └── __root.tsx
│   └── index.tsx
└── main.tsx                     ⏳ CREATE
```

---

## 🚀 Next Steps - Filter Components (1.5 hours)

### 1. Create `src/components/filters/PriceFilter.tsx`

```tsx
/**
 * PriceFilter Component
 * Dual range slider for min/max price filtering
 */


```

### 2. Create `src/components/filters/StopsFilter.tsx`

```tsx
/**
 * StopsFilter Component
 * Checkbox group for filtering by number of stops
 */

```

### 3. Create `src/components/filters/AirlineFilter.tsx`

```tsx
/**
 * AirlineFilter Component
 * Multi-select checkbox list for airline filtering
 */

```

### 4. Create `src/components/filters/FilterPanel.tsx`

```tsx
/**
 * FilterPanel Component
 * Main container for all filter controls
 * Responsive - sidebar on desktop, modal on mobile
 */


```

---

## 🎨 Results Components (1.5 hours)

### Create `src/components/results/FlightCard.tsx`

```tsx
/**
 * FlightCard Component
 * Displays individual flight offer with itinerary details
 */


```

### Create `src/components/results/`

```tsx
/**
 * FlightList Component
 * Container for flight results with sorting and empty states
 */


```

---

## 📊 Price Chart Component (1 hour)

### Create `src/components/charts/PriceChart.tsx`

```tsx
/
```

---

## 🏠 Main App & Routing (1 hour)

### Create `src/routes/__root.tsx`

```tsx

```

### Create `src/routes/index.tsx`

```tsx

```

### Create `src/main.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';
import './index.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Create router
const router = createRouter({ routeTree });

// Type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
```

---

## 🎨 Styling (30 mins)

### Update `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/
```

---

## 🚀 Deployment (1 hour)

### 1. Create `.env` file
```bash
VITE_AMADEUS_API_KEY=your_actual_api_key
VITE_AMADEUS_API_SECRET=your_actual_api_secret
VITE_AMADEUS_API_URL=https://test.api.amadeus.com/v2
```

### 2. Build & Deploy to Vercel

```bash
# Install dependencies
npm install

# Build
npm run build

# Test locally
npm run preview

# Deploy to Vercel
npx vercel --prod
```

### 3. Environment Variables on Vercel
Add your environment variables in Vercel dashboard:
- VITE_AMADEUS_API_KEY
- VITE_AMADEUS_API_SECRET
- VITE_AMADEUS_API_URL

---

## 🎥 Loom Demo Script (3-4 mins)

### Opening (30s)
"Hi! I'm Daniel, and I built this flight search engine. Let me walk you through the key features and technical decisions."

### Search & Results (1 min)
- Show airport autocomplete
- Execute a search
- Highlight real-time results loading

### Filtering & Price Graph (1.5 min)
- Demonstrate multiple simultaneous filters
- Show price graph updating in real-time
- Explain data visualization approach

### Technical Highlights (1 min)
- Mention React Query for caching
- TanStack Router for routing
- Recharts for visualization
- Component architecture
- Responsive design

### Closing (30s)
- Quick mobile demo
- Thank reviewers
- GitHub + Live link

---

## ✅ Final Checklist

- [ ] All components created
- [ ] Filters work simultaneously
- [ ] Price chart updates in real-time
- [ ] Fully responsive (mobile + desktop)
- [ ] Error handling implemented
- [ ] Loading states everywhere
- [ ] Clean, commented code
- [ ] GitHub repo with README
- [ ] Deployed to Vercel
- [ ] Loom demo recorded
- [ ] Submit within 4 days

---

## 💡 Extra Polish Ideas (If Time Permits)

1. **Skeleton loading states** for better UX
2. **Persist search in URL** for shareable links
3. **Compare flights** side-by-side
4. **Export results** to CSV
5. **Dark mode** toggle
6. **Keyboard shortcuts** for power users
7. **Animation** when applying filters
8. **Toast notifications** for errors

Good luck! 🚀