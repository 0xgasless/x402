import { Address, PublicClient } from "viem";
import { erc1155ABI } from "../../types/shared/evm/erc1155ABI";

/**
 * Gets the balance of a specific ERC1155 token for an address
 *
 * @param erc1155Address - The address of the ERC1155 contract
 * @param ownerAddress - The address to check balance for
 * @param tokenId - The token ID to check balance of
 * @param client - The public client to use for the call
 * @returns The balance of the token
 */
export async function getERC1155Balance(
  erc1155Address: Address,
  ownerAddress: Address,
  tokenId: bigint,
  client: PublicClient,
): Promise<bigint> {
  const balance = await client.readContract({
    address: erc1155Address,
    abi: erc1155ABI,
    functionName: "balanceOf",
    args: [ownerAddress, tokenId],
  });

  return balance;
}

/**
 * Gets the balances of multiple ERC1155 tokens for multiple addresses
 *
 * @param erc1155Address - The address of the ERC1155 contract
 * @param owners - Array of addresses to check balances for
 * @param tokenIds - Array of token IDs to check balances of
 * @param client - The public client to use for the call
 * @returns Array of balances corresponding to the input arrays
 */
export async function getERC1155BalanceBatch(
  erc1155Address: Address,
  owners: readonly Address[],
  tokenIds: readonly bigint[],
  client: PublicClient,
): Promise<readonly bigint[]> {
  const balances = await client.readContract({
    address: erc1155Address,
    abi: erc1155ABI,
    functionName: "balanceOfBatch",
    args: [owners, tokenIds],
  });

  return balances;
}

/**
 * Checks if an operator is approved to manage all tokens for an owner
 *
 * @param erc1155Address - The address of the ERC1155 contract
 * @param ownerAddress - The owner address
 * @param operatorAddress - The operator address to check
 * @param client - The public client to use for the call
 * @returns Whether the operator is approved
 */
export async function getERC1155IsApprovedForAll(
  erc1155Address: Address,
  ownerAddress: Address,
  operatorAddress: Address,
  client: PublicClient,
): Promise<boolean> {
  const isApproved = await client.readContract({
    address: erc1155Address,
    abi: erc1155ABI,
    functionName: "isApprovedForAll",
    args: [ownerAddress, operatorAddress],
  });

  return isApproved;
}

/**
 * Gets the URI for a specific token
 *
 * @param erc1155Address - The address of the ERC1155 contract
 * @param tokenId - The token ID to get the URI for
 * @param client - The public client to use for the call
 * @returns The token URI
 */
export async function getERC1155URI(
  erc1155Address: Address,
  tokenId: bigint,
  client: PublicClient,
): Promise<string> {
  const uri = await client.readContract({
    address: erc1155Address,
    abi: erc1155ABI,
    functionName: "uri",
    args: [tokenId],
  });

  return uri;
}

