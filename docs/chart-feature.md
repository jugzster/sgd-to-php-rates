# Historical Exchange Rate Chart

## Overview

Added an interactive chart showing SGD to PHP mid-rate history below the rates table. Users can view 1 week to all-time data with range buttons (1W, 1M, 3M, 6M, 1Y, 2Y, All).

## Files Added/Modified

| File                                     | Purpose                       |
| ---------------------------------------- | ----------------------------- |
| `frontend/components/RateChart.tsx`      | Chart component (new)         |
| `frontend/lib/historicalRates.ts`        | API client function (new)     |
| `frontend/pages/api/historical-rates.ts` | Server API endpoint (new)     |
| `frontend/pages/index.tsx`               | Added `<RateChart />` to page |

## How It Works

### Data Flow

```
User clicks range button
        ↓
RateChart calls fetchHistoricalRates(range)
        ↓
Browser requests /api/historical-rates?range=1Y
        ↓
Next.js API route queries MongoDB
        ↓
Returns JSON: [{ date: Date, rate: number }]
        ↓
RateChart converts dates → chart format
        ↓
Lightweight Charts renders the line
```

### Range Behavior

| Range          | Data Points                   | X-Axis Format                  |
| -------------- | ----------------------------- | ------------------------------ |
| 1W, 1M, 3M, 6M | All 12-hour snapshots         | Unix timestamps (shows time)   |
| 1Y, 2Y, All    | One per day (latest snapshot) | Date strings (shows date only) |

---

## React Concepts Explained

### 1. Component (`RateChart`)

A **component** is a reusable piece of UI. Think of it like a custom HTML tag you create yourself.

```tsx
const RateChart = ({ midRate }: RateChartProps) => {
  // ... component logic
  return <div>...</div>; // What gets rendered
};
```

- `RateChart` is the component name
- `{ midRate }` is a **prop** (input data from the parent)
- The `return` statement defines what HTML/JSX appears on screen
- `RateChartProps` is a TypeScript type defining what props the component accepts

### 2. Props

**Props** are how parent components pass data to child components. Like function arguments.

```tsx
// Parent (index.tsx) passes midRate to RateChart
<RateChart midRate={midRate} />;

// Child (RateChart.tsx) receives it
const RateChart = ({ midRate }: RateChartProps) => {
  // midRate is available here
};
```

### 3. State (`useState`)

**State** is data that can change over time. When state changes, React re-renders the component to show the new data.

```tsx
const [selectedRange, setSelectedRange] = useState<string>("1Y");
const [data, setData] = useState<HistoricalRate[]>([]);
const [loading, setLoading] = useState(false);
```

- `useState("1Y")` creates a state variable starting at `"1Y"`
- `selectedRange` is the current value (read-only)
- `setSelectedRange("1M")` updates the value and triggers a re-render
- Each `useState` call is independent — changing one doesn't affect others

**Why state matters here:** When the user clicks a range button, `setSelectedRange` updates, which triggers the data fetch and chart update.

### 4. Effects (`useEffect`)

**Effects** run code after the component renders. They're used for things React doesn't handle directly: API calls, event listeners, DOM manipulation.

```tsx
// Effect 1: Fetch data when range changes
useEffect(() => {
  loadData(selectedRange);
}, [selectedRange, loadData]);

// Effect 2: Create chart (runs once)
useEffect(() => {
  const chart = createChart(...);
  return () => chart.remove();  // Cleanup
}, []);

// Effect 3: Update chart when data arrives
useEffect(() => {
  seriesRef.current.setData(chartData);
}, [data, selectedRange]);
```

**Dependency array** (the second argument):

- `[]` — runs once when component mounts
- `[selectedRange]` — runs when `selectedRange` changes
- No array — runs after every render (usually a bug)

**Cleanup function** (the return value): runs when the component unmounts or before the effect re-runs. Used to prevent memory leaks (removing event listeners, destroying charts).

### 5. Refs (`useRef`)

**Refs** hold values that persist across renders but don't trigger re-renders when changed.

```tsx
const chartContainerRef = useRef<HTMLDivElement>(null); // DOM element
const chartRef = useRef<IChartApi | null>(null); // Chart instance
const dataRangeRef = useRef<string>("1Y"); // Tracks data's range
```

**Two uses of refs here:**

1. **DOM access** — `chartContainerRef` gives direct access to the `<div>` so Lightweight Charts can render into it. React's virtual DOM doesn't know about the canvas chart, so we need the real DOM element.

2. **Stable values** — `dataRangeRef` tracks which range the current data belongs to. Unlike state, changing a ref doesn't cause a re-render. This is used to prevent race conditions (see below).

### 6. The Race Condition Fix

**The problem:** When switching ranges quickly (1W → 1Y), two things update at different times:

```
1. User clicks "1Y" → selectedRange = "1Y" (instant)
2. Fetch starts...
3. Old 1W data is still in state
4. Chart effect runs with selectedRange="1Y" but 1W data ← BUG
5. 1Y data arrives → data updates
6. Chart effect runs again with correct data
```

Step 4 processes 1W data (Unix timestamps) as if it were 1Y data (date strings), causing duplicate timestamp errors.

**The fix:** Use a ref to track which range the data belongs to:

```tsx
const dataRangeRef = useRef<string>("1Y");

const loadData = useCallback(async (range: string) => {
  const result = await fetchHistoricalRates(range);
  dataRangeRef.current = range; // Mark data with its range
  setData(result);
}, []);

// In the chart update effect:
useEffect(() => {
  if (dataRangeRef.current !== selectedRange) return; // Skip mismatched data
  // ... process data
}, [data, selectedRange]);
```

When the effect runs with stale data, `dataRangeRef.current` ("1W") doesn't match `selectedRange` ("1Y"), so it skips processing. The chart waits until the correct data arrives.

### 7. MutationObserver (Theme Changes)

The chart is rendered on a `<canvas>` element by Lightweight Charts — it's outside React's control. When the user toggles dark mode, React re-renders components, but the canvas doesn't update automatically.

**`MutationObserver`** watches for DOM changes (the `dark` class being added/removed on `<html>`) and updates the chart colors imperatively:

```tsx
const observer = new MutationObserver(() => {
  const newColors = getThemeColors();
  chart.applyOptions({
    layout: { background: { color: newColors.background } },
    // ...
  });
});
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"],
});
```

This is one case where direct DOM manipulation is necessary — React can't manage a third-party canvas library's internal state.

---

## Architecture Decisions

### Why a Next.js API route instead of calling the backend?

The existing app follows this pattern:

- **Frontend** connects directly to MongoDB for reads (via `lib/mongodb.ts`)
- **Backend** (FastAPI on AWS Lambda) handles writes/scraping

The chart follows the same pattern — the Next.js API route queries MongoDB directly, consistent with how `getRates()` and `getLatestStatus()` work in `lib/exchangeRate.ts` and `lib/status.ts`.

### Why return `Date` objects from the API?

Consistent with `ExchangeRate` type which also uses `Date`. The client (RateChart) handles formatting based on context (sub-daily vs daily). This keeps the API simple and lets the client decide how to display dates.

### Why Lightweight Charts?

- Small bundle size (~45KB)
- Good performance with large datasets
- Built-in time series support
- Dark mode customization
- Used by TradingView (familiar UX)
