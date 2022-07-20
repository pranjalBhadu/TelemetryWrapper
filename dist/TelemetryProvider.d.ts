import { SpanKind, Span, Tracer } from "@opentelemetry/api";
export declare class TelemetryProvider {
    private static TelemetryResource;
    private static Provider;
    private static TelemetryExporter;
    private static TelemetryProcessor;
    static TelemetryTracer: Tracer;
    constructor(TracerName: string, TracerVersion: string, ConnectionString: string);
    static getTelemetryTracer(): Tracer;
    static startTracing(spanName: string, activeSpan?: Span | undefined, kind?: number, attributes?: Object | null): Span;
    static startTracingWith(spanName: string, func: () => void): void;
    static getSpanKind(kind: number): SpanKind;
    static setSpanTags(span: Span, attributes: Object): void;
    static endTracing(span: Span): void;
}
