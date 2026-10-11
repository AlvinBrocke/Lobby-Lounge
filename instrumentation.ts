import { logs, SeverityNumber } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";

const posthogProjectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

let loggerProvider: LoggerProvider | undefined;

if (!posthogProjectToken || !posthogHost) {
  if (process.env.NODE_ENV === "development") {
    const missingVariable = posthogProjectToken
      ? "NEXT_PUBLIC_POSTHOG_HOST"
      : "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN";

    throw new Error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
    );
  }
} else {
  loggerProvider = new LoggerProvider({
    resource: resourceFromAttributes({ "service.name": "lobby-lounge" }),
    processors: [
      new BatchLogRecordProcessor({
        exporter: new OTLPLogExporter({
          url: new URL("/i/v1/logs", posthogHost).toString(),
          headers: {
            Authorization: `Bearer ${posthogProjectToken}`,
            "Content-Type": "application/json",
          },
        }),
      }),
    ],
  });
}

const posthogLogger = loggerProvider?.getLogger("lobby-lounge-posthog");

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && loggerProvider) {
    logs.setGlobalLoggerProvider(loggerProvider);
  }
}

export function logPostHogOnboardingCompleted() {
  posthogLogger?.emit({
    body: "onboarding_completed",
    severityNumber: SeverityNumber.INFO,
    attributes: { action: "onboarding_completed" },
  });
}

export function logPostHogOnboardingClaimSynced() {
  posthogLogger?.emit({
    body: "onboarding_claim_synced",
    severityNumber: SeverityNumber.INFO,
    attributes: { action: "onboarding_claim_synced" },
  });
}

export async function flushPostHogLogs() {
  try {
    await loggerProvider?.forceFlush();
  } catch {
    // Observability must not affect the completed server action.
  }
}
