import { ClearBackgroundInstruction } from "../../drawing-types";
import { Bounds } from "../../../lib/basic-types";

export function doClearBackground(
    instruction: ClearBackgroundInstruction,
    ctx: OffscreenCanvasRenderingContext2D,
): void {
    const { width, height, color } = instruction;
    if (color == null) {
        ctx.clearRect(0, 0, width, height);
    } else {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
    }
}