import { DrawContext } from "../worker-types";
import { LegendSettings } from "../../settings-types";
import { Bounds, Rect } from "../../basic-types";
import { generateTicks, scale } from "../../utils";
import { yLabel } from "../labels";

export function drawYLegend(drawContext: DrawContext, legendSettings: LegendSettings, yBounds: Bounds, drawArea: Rect) {
    const { ctx, devicePixelRatio: dpr } = drawContext;

    ctx.save();
    ctx.fillStyle = legendSettings.labels.color;
    ctx.font = `${legendSettings.labels.fontStyle} ${legendSettings.labels.fontSize * dpr}px ${
        legendSettings.labels.fontFamily
    }`;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (const y of generateTicks(yBounds, drawArea.height, legendSettings.y.minHeight)) {
        const ypx = Math.round(scale(y, yBounds, [drawArea.y + drawArea.height, drawArea.y]));
        ctx.fillRect(
            drawArea.x - legendSettings.bulletRadius * dpr,
            ypx - legendSettings.bulletRadius * dpr,
            legendSettings.bulletRadius * dpr * 2,
            legendSettings.bulletRadius * dpr * 2,
        );

        const text = yLabel(y);
        const x = drawArea.x - legendSettings.y.gap * dpr;
        ctx.fillText(text, x, ypx);
    }
    ctx.restore();
}