import { GraphData, scale } from "./utils";
import { useCallback, useMemo } from "react";
import { useBoundsContext } from "./BoundsManager";
import { useIncFPSCounter } from "./fps";
import { visualDownsample } from "./downsample";
import { useGridRectCpx } from "./LayoutManager";
import { useYAxisContext } from "./YAxisProvider";
import { useCanvasContext, useDrawCallback } from "./Canvas";

interface LineProps {
    data: GraphData;
}

export const Line = function Line(props: LineProps) {
    const { getCurrentXBounds } = useBoundsContext();
    const { bounds: yBounds } = useYAxisContext();

    const incFrameCounter = useIncFPSCounter();

    const { ctx } = useCanvasContext();

    const gridRect = useGridRectCpx();

    const grad = useMemo(() => {
        if (ctx == null) {
            return null;
        }

        const grd = ctx.createLinearGradient(gridRect.x, gridRect.y + gridRect.height, gridRect.x, gridRect.y);
        grd.addColorStop(0, "red");
        grd.addColorStop(1, "blue");
        return grd;
    }, [ctx, gridRect]);

    const [yMin, yMax] = yBounds;

    const clipPath = useMemo(() => {
        const clipping = new Path2D();
        clipping.rect(gridRect.x, gridRect.y, gridRect.width, gridRect.height);
        return clipping;
    }, [gridRect]);

    const draw = useCallback(
        (ctx: CanvasRenderingContext2D) => {
            if (props.data.length === 0 || !grad) return;

            const effectiveXBounds = getCurrentXBounds();

            const downsampled = visualDownsample(props.data, effectiveXBounds, gridRect.width);

            ctx.lineWidth = 2 * window.devicePixelRatio;
            ctx.lineCap = "square";
            ctx.lineJoin = "bevel";
            ctx.strokeStyle = grad;

            ctx.save();
            try {
                ctx.clip(clipPath);

                const scaled = downsampled.map(([x, y]): [number, number | null] => [
                    scale(x, effectiveXBounds, [gridRect.x, gridRect.x + gridRect.width]),
                    y == null ? null : scale(y, [yMin, yMax], [gridRect.y + gridRect.height, gridRect.y]),
                ]);

                for (let i = 0; i < scaled.length - 1; i++) {
                    const [x1, y1] = scaled[i];
                    const [x2, y2] = scaled[i + 1];
                    if (y1 == null || y2 == null) continue;

                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
            } finally {
                ctx.restore();
            }

            incFrameCounter();
        },
        [gridRect, grad, props.data, yMin, yMax, incFrameCounter]
    );

    useDrawCallback(draw);

    return null;
};