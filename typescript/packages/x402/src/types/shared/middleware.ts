import { CreateHeaders } from "../../verify";
import { Money } from "./money";
import { Network } from "./network";
import { Resource } from "./resource";
import { EvmSigner } from "./evm";
import { HTTPRequestStructure } from "..";

export type FacilitatorConfig = {
  url: Resource;
  createAuthHeaders?: CreateHeaders;
};

export type PaywallConfig = {
  cdpClientKey?: string;
  appName?: string;
  appLogo?: string;
  sessionTokenEndpoint?: string;
};

export type PaymentMiddlewareConfig = {
  description?: string;
  mimeType?: string;
  maxTimeoutSeconds?: number;
  inputSchema?: Omit<HTTPRequestStructure, "type" | "method">;
  outputSchema?: object;
  discoverable?: boolean;
  customPaywallHtml?: string;
  resource?: Resource;
  errorMessages?: {
    paymentRequired?: string;
    invalidPayment?: string;
    noMatchingRequirements?: string;
    verificationFailed?: string;
    settlementFailed?: string;
  };
};

export interface ERC20TokenAmount {
  amount: string;
  asset: {
    address: `0x${string}`;
    decimals: number;
    eip712: {
      name: string;
      version: string;
    };
  };
}

export interface SPLTokenAmount {
  amount: string;
  asset: {
    address: string;
    decimals: number;
  };
}

export interface ERC721TokenAmount {
  tokenId: string;
  asset: {
    address: `0x${string}`;
    eip712?: {
      name: string;
      version: string;
    };
  };
}

export interface ERC1155TokenAmount {
  tokenId: string;
  amount: string;
  asset: {
    address: `0x${string}`;
    eip712?: {
      name: string;
      version: string;
    };
  };
}

export type FeeType = "flat" | "percentage" | "dynamic";

export interface FeeStructure {
  type: FeeType;
  value: string; // For flat: absolute amount, for percentage: basis points (e.g., "250" = 2.5%)
  recipient?: `0x${string}`; // Optional fee recipient address (defaults to server owner)
  description?: string;
}

export type Price = Money | ERC20TokenAmount | SPLTokenAmount | ERC721TokenAmount | ERC1155TokenAmount;

export interface RouteConfig {
  price: Price;
  network: Network;
  config?: PaymentMiddlewareConfig;
  fees?: FeeStructure[];
}

export type RoutesConfig = Record<string, Price | RouteConfig>;

export interface RoutePattern {
  verb: string;
  pattern: RegExp;
  config: RouteConfig;
}

export type Wallet = EvmSigner;
