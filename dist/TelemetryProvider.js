"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryProvider = void 0;
const resources_1 = require("@opentelemetry/resources");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const sdk_trace_node_1 = require("@opentelemetry/sdk-trace-node");
const monitor_opentelemetry_exporter_1 = require("@azure/monitor-opentelemetry-exporter");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const api_1 = require("@opentelemetry/api");
const TelemetryConstants_1 = require("./TelemetryConstants");
const { W3CTraceContextPropagator } = require("@opentelemetry/core");
class TelemetryProvider {
    constructor(TracerName, TracerVersion, ConnectionString) {
        TelemetryProvider.TelemetryExporter = new monitor_opentelemetry_exporter_1.AzureMonitorTraceExporter({
            connectionString: ConnectionString
        });
        TelemetryProvider.TelemetryProcessor = new sdk_trace_base_1.BatchSpanProcessor(TelemetryProvider.TelemetryExporter);
        TelemetryProvider.TelemetryResource =
            resources_1.Resource.default().merge(new resources_1.Resource({
                [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: TelemetryConstants_1.TelemetryConstants.ServiceName,
                [semantic_conventions_1.SemanticResourceAttributes.SERVICE_VERSION]: TelemetryConstants_1.TelemetryConstants.ServiceVersion,
            }));
        TelemetryProvider.Provider = new sdk_trace_node_1.NodeTracerProvider({
            resource: TelemetryProvider.TelemetryResource,
        });
        TelemetryProvider.Provider.addSpanProcessor(TelemetryProvider.TelemetryProcessor);
        TelemetryProvider.Provider.register();
        api_1.trace.setGlobalTracerProvider(TelemetryProvider.Provider);
        TelemetryProvider.TelemetryTracer = api_1.trace.getTracer(TracerName, TracerVersion);
    }
    static getTelemetryTracer() {
        return TelemetryProvider.TelemetryTracer;
    }
    static startTracing(spanName, activeSpan = undefined, kind = 0, attributes = null) {
        const spanKind = TelemetryProvider.getSpanKind(kind);
        let span;
        if (activeSpan != undefined) {
            const ctx = api_1.trace.setSpan(api_1.context.active(), activeSpan);
            span = TelemetryProvider.TelemetryTracer.startSpan(spanName, { kind: spanKind }, ctx);
        }
        else {
            span = TelemetryProvider.TelemetryTracer.startSpan(spanName, { kind: spanKind });
        }
        if (attributes != undefined) {
            this.setSpanTags(span, attributes);
        }
        return span;
    }
    static setParentSpan(span) {
        return api_1.trace.setSpan(api_1.context.active(), span);
    }
    static getSpanKind(kind) {
        if (kind == 0)
            return api_1.SpanKind.INTERNAL;
        else if (kind == 1)
            return api_1.SpanKind.SERVER;
        else if (kind == 2)
            return api_1.SpanKind.CLIENT;
        else if (kind == 3)
            return api_1.SpanKind.PRODUCER;
        return api_1.SpanKind.CONSUMER;
    }
    static getCurrentSpan() {
        return api_1.trace.getSpan(api_1.context.active());
    }
    static setSpanTags(span, attributes) {
        if (attributes == null) {
            throw new Error("NULL MESSAGE!!");
        }
        if (span.isRecording()) {
            for (const [key, value] of Object.entries(attributes)) {
                span.setAttribute(key, value);
            }
        }
    }
    static endTracing(span) {
        span.end();
    }
}
exports.TelemetryProvider = TelemetryProvider;
