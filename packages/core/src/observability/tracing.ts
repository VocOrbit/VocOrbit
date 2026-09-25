import {
  context,
  trace,
  SpanStatusCode,
  type Attributes,
  type Span,
  type SpanOptions,
} from "@opentelemetry/api";

export type ActiveTraceContext = {
  traceId?: string;
  spanId?: string;
};

const tracer = trace.getTracer("vocorbit-server");

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function getActiveTraceContext(): ActiveTraceContext {
  const activeSpan = trace.getSpan(context.active());
  if (!activeSpan) return {};
  const spanContext = activeSpan.spanContext();
  if (!spanContext.traceId || !spanContext.spanId) return {};
  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
  };
}

export async function withSpan<T>(
  name: string,
  run: (span: Span) => Promise<T> | T,
  options: SpanOptions & { attributes?: Attributes } = {},
): Promise<T> {
  const { attributes, ...spanOptions } = options;
  const span = tracer.startSpan(name, spanOptions);
  if (attributes) {
    span.setAttributes(attributes);
  }

  const activeContext = trace.setSpan(context.active(), span);
  try {
    return await context.with(activeContext, async () => {
      const result = await run(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    });
  } catch (error) {
    span.recordException(error instanceof Error ? error : new Error(toErrorMessage(error)));
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: toErrorMessage(error),
    });
    throw error;
  } finally {
    span.end();
  }
}
