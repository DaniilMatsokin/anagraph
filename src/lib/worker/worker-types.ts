import { ChartSettings } from "../settings-types";
import { Bounds, LineData } from "../basic-types";

export interface DrawContext {
    canvas: OffscreenCanvas | HTMLCanvasElement;
    ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
    devicePixelRatio: number;
}

export type Id = string;

export interface LineInfo {
    points: LineData;
    color: string;
    lineWidth: number;
    yBounds: Bounds;
    isFill?: boolean;
    fillColor?: string;
}

export interface VerticalFilling {
    intervals: Bounds[];
    color: string;
}

export interface BottomStatus {
    intervals: Bounds[];
    color: string;
}

export interface FillArea {
    points: LineData;
    fillColor: string;
    yBounds: Bounds;
    borderWidth?: number;
    borderColor?: string;
}

export interface ChartInfo {
    settings: ChartSettings;
    xBounds: Bounds;
    lines: Map<Id, LineInfo>;
    verticalFillings: Map<Id, VerticalFilling>;
    bottomStatuses: Map<Id, BottomStatus>;
    fillAreas: Map<Id, FillArea>;
}
