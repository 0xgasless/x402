import { FeeStructure, FeeType } from "../types";

/**
 * Calculates the total fee amount based on the fee structure
 *
 * @param baseAmount - The base amount before fees
 * @param feeStructure - The fee structure to apply
 * @returns The calculated fee amount
 */
export function calculateFee(baseAmount: string, feeStructure: FeeStructure): string {
  const base = BigInt(baseAmount);

  switch (feeStructure.type) {
    case "flat":
      return feeStructure.value;

    case "percentage": {
      // Value is in basis points (1 basis point = 0.01%)
      // e.g., "250" = 2.5%
      const basisPoints = BigInt(feeStructure.value);
      const fee = (base * basisPoints) / BigInt(10000);
      return fee.toString();
    }

    case "dynamic":
      // Dynamic fees should be resolved at runtime
      // For now, return the value as-is (server should resolve this)
      return feeStructure.value;

    default:
      throw new Error(`Unknown fee type: ${feeStructure.type}`);
  }
}

/**
 * Calculates the total amount including all fees
 *
 * @param baseAmount - The base amount before fees
 * @param fees - Array of fee structures to apply
 * @returns The total amount including all fees
 */
export function calculateTotalWithFees(baseAmount: string, fees?: FeeStructure[]): string {
  if (!fees || fees.length === 0) {
    return baseAmount;
  }

  let total = BigInt(baseAmount);

  for (const fee of fees) {
    const feeAmount = BigInt(calculateFee(baseAmount, fee));
    total += feeAmount;
  }

  return total.toString();
}

/**
 * Breaks down the total amount into base amount and individual fees
 *
 * @param baseAmount - The base amount before fees
 * @param fees - Array of fee structures to apply
 * @returns Breakdown of amounts
 */
export function getFeeBreakdown(
  baseAmount: string,
  fees?: FeeStructure[],
): {
  baseAmount: string;
  fees: Array<{ type: FeeType; amount: string; recipient?: `0x${string}`; description?: string }>;
  total: string;
} {
  if (!fees || fees.length === 0) {
    return {
      baseAmount,
      fees: [],
      total: baseAmount,
    };
  }

  const feeDetails = fees.map(fee => ({
    type: fee.type,
    amount: calculateFee(baseAmount, fee),
    recipient: fee.recipient,
    description: fee.description,
  }));

  const total = calculateTotalWithFees(baseAmount, fees);

  return {
    baseAmount,
    fees: feeDetails,
    total,
  };
}

/**
 * Validates a fee structure
 *
 * @param feeStructure - The fee structure to validate
 * @throws Error if the fee structure is invalid
 */
export function validateFeeStructure(feeStructure: FeeStructure): void {
  if (!["flat", "percentage", "dynamic"].includes(feeStructure.type)) {
    throw new Error(`Invalid fee type: ${feeStructure.type}`);
  }

  if (feeStructure.type === "percentage") {
    const basisPoints = BigInt(feeStructure.value);
    if (basisPoints < 0 || basisPoints > 10000) {
      throw new Error(`Percentage fee must be between 0 and 10000 basis points (0-100%)`);
    }
  }

  if (feeStructure.type === "flat") {
    const amount = BigInt(feeStructure.value);
    if (amount < 0) {
      throw new Error(`Flat fee must be non-negative`);
    }
  }
}

