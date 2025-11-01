import { FacilitatorConfig } from "x402/types";
import { CreateHeaders } from "x402/verify";

const X402_SDK_VERSION = "0.1.0";

export function createCorrelationHeader(): string {
  const data: Record<string, string> = {
    sdk_version: X402_SDK_VERSION,
    sdk_language: "typescript",
    source: "gasless-x402",
    source_version: X402_SDK_VERSION,
  };
  return Object.keys(data)
    .map(key => `${key}=${encodeURIComponent(data[key])}`)
    .join(",");
}

export function createAuthHeaders(): CreateHeaders {
  return async () => {
    const headers = {
      verify: {
        "Correlation-Context": createCorrelationHeader(),
      },
      settle: {
        "Correlation-Context": createCorrelationHeader(),
      },
      supported: {
        "Correlation-Context": createCorrelationHeader(),
      },
      list: {
        "Correlation-Context": createCorrelationHeader(),
      },
    };

    return headers;
  };
}

export function createFacilitatorConfig(baseUrl?: string): FacilitatorConfig {
  const url = baseUrl ?? process.env.GASLESS_FACILITATOR_URL ?? "https://x402.0xgasless.com/";
  
  return {
    url,
    createAuthHeaders: createAuthHeaders(),
  };
}
