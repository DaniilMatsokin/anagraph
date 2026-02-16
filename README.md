# Anagraph

Anagraph is a React charting library focused on one primary goal: **fast and smooth plot manipulation**.

It is built for interactive workflows where users drag, zoom, and inspect data continuously. The rendering model is performance-first, with worker-based drawing, frame-coalesced redraws, and data downsampling to keep interaction responsive.

## Why this project exists

Many charting workflows degrade when datasets grow or when users manipulate the viewport quickly.

Anagraph is designed to stay responsive under those conditions:

-   smooth pan and zoom on mouse, trackpad, and touch
-   worker-backed rendering via `OffscreenCanvas` when available
-   redraw scheduling with `requestAnimationFrame` to avoid redundant work
-   line downsampling based on visible pixel width to reduce draw cost
-   integer pixel transforms in draw path for better canvas performance

If your product relies on fast, fluid chart interaction as a core UX requirement, this is what Anagraph optimizes for.

## Features

-   Time-based X axis rendering (timestamps in milliseconds)
-   Multiple drawable layers:
    -   `Line`
    -   `FillArea`
    -   `VerticalFilling`
    -   `BottomStatus`
-   Shared bounds model for synchronized multi-chart panning/zooming
-   Pointer, wheel, touch, and double-click zoom interactions
-   Optional imperative chart API via `ChartRef`
-   Configurable chart appearance via `ChartSettings`

## Installation

```bash
npm install anagraph
```

Peer runtime expectation: React 18+.

## Quick start

### 1) Create a worker entry file

```ts
// src/anagraph.worker.ts
import { startWorker } from "anagraph";

startWorker();
```

### 2) Wire Anagraph in your React app

```tsx
import { useMemo } from "react";
import { WorkerCreatorProvider, BoundsManager, Chart, Line, VerticalFilling, BottomStatus, FillArea } from "anagraph";

const dayStart = new Date();
dayStart.setHours(0, 0, 0, 0);

const xBounds: readonly [number, number] = [dayStart.getTime(), dayStart.getTime() + 24 * 60 * 60 * 1000];

export function ExampleChart() {
    const points = useMemo(
        () =>
            Array.from({ length: 10_000 }, (_, i) => {
                const x = xBounds[0] + (i / 10_000) * (xBounds[1] - xBounds[0]);
                const y = 50 + Math.sin(i / 80) * 35;
                return [x, y] as [number, number];
            }),
        [],
    );

    const workerCreator = useMemo(
        () => () =>
            new Worker(new URL("./anagraph.worker.ts", import.meta.url), {
                type: "module",
            }),
        [],
    );

    return (
        <WorkerCreatorProvider workerCreator={workerCreator}>
            <BoundsManager initialXBounds={xBounds} xBoundsLimit={xBounds}>
                <Chart
                    style={{ height: 360, border: "1px solid #d0d0d0" }}
                    settings={{
                        grid: { y: { bounds: [0, 100] } },
                        background: "#ffffff",
                    }}
                >
                    <VerticalFilling
                        intervals={[[xBounds[0], xBounds[0] + 2 * 60 * 60 * 1000]]}
                        color="rgba(255, 180, 0, 0.2)"
                    />
                    <FillArea
                        points={[
                            [xBounds[0], 30],
                            [xBounds[0] + 6 * 60 * 60 * 1000, 30],
                            [xBounds[0] + 6 * 60 * 60 * 1000, 70],
                            [xBounds[0], 70],
                        ]}
                        yBounds={[0, 100]}
                        fillColor="rgba(0, 140, 255, 0.08)"
                    />
                    <Line points={points} color="#1f6feb" lineWidth={2} yBounds={[0, 100]} />
                    <BottomStatus
                        intervals={[[xBounds[0] + 3 * 60 * 60 * 1000, xBounds[0] + 8 * 60 * 60 * 1000]]}
                        color="#14a44d"
                    />
                </Chart>
            </BoundsManager>
        </WorkerCreatorProvider>
    );
}
```

### 3) No worker yet?

If you do not want to configure a worker immediately, set `disableWorker` on `Chart`:

```tsx
<Chart disableWorker>{/* layers */}</Chart>
```

This uses the single-thread fallback path.

## Core API

### Containers and context

-   `WorkerCreatorProvider` - supplies a `workerCreator` function that returns a new `Worker`
-   `BoundsManager` - owns interactive X bounds and propagates updates
-   `Chart` - rendering surface and interaction layer

### Drawable layers

-   `Line` - polyline series (`points`, `color`, `lineWidth`, `yBounds`)
-   `FillArea` - polygon fill (`points`, `fillColor`, `yBounds`, optional border)
-   `VerticalFilling` - vertical interval highlights (`intervals`, `color`)
-   `BottomStatus` - compact status bars below the main grid (`intervals`, `color`)

### Chart callbacks

-   `onChangeBounds(bounds)` - called continuously during manipulation
-   `onChangeBoundsEnd(bounds)` - called when manipulation ends
-   `onHover(x, event)` - hover on manipulation area
-   `onHoverEnd()` - hover leaves manipulation area
-   `onTouchUp(x, event)` - touch/pointer release callback

### Imperative control (`ChartRef`)

-   `xToPixelOffset(x)`
-   `pixelOffsetToX(pixelOffset)`
-   `setViewBounds(bounds)`

## Performance notes and best practices

To get the smoothest interaction in production:

1. Keep line points sorted by X ascending.
2. Use timestamps (ms) for X values if you want correct time legend behavior.
3. Reuse arrays where possible instead of recreating huge datasets every render.
4. Use `onChangeBounds` for lightweight UI updates and defer expensive work to `onChangeBoundsEnd`.
5. Keep `Chart.settings` stable (memoize if building dynamically).
6. Prefer worker mode (`WorkerCreatorProvider`) for heavy datasets.

## Synchronized multi-chart interactions

Place multiple `Chart` components inside the same `BoundsManager` to sync pan/zoom across all of them.

## Development

### Install dependencies

```bash
npm install
```

### Run Storybook

```bash
npm run storybook
```

### Run tests

```bash
npm test
```

### Build library

```bash
npm run build
```

## Internal architecture (developer notes)

-   Canvas drawing happens in `src/lib/worker`
-   Main thread sends object-level update messages (`add/change/remove`) for each drawable layer
-   Worker stores chart state maps and redraws once per animation frame
-   Line rendering uses `visualDownsample(...)` based on visible X bounds and pixel width
-   If `OffscreenCanvas` is unavailable (or `disableWorker` is true), Anagraph uses an in-thread pseudo-worker path for compatibility

## Current status

Anagraph is actively optimized around interaction performance. The main product goal remains unchanged: keep chart manipulation fast, stable, and pleasant for end users even as data volume grows.
