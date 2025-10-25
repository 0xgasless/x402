import { Address, PublicClient } from "viem";
import { erc721ABI } from "../../types/shared/evm/erc721ABI";

/**
 * Gets the owner of an ERC721 token
 *
 * @param erc721Address - The address of the ERC721 contract
 * @param tokenId - The token ID to check ownership of
 * @param client - The public client to use for the call
 * @returns The address of the token owner
 */
export async function getERC721Owner(
  erc721Address: Address,
  tokenId: bigint,
  client: PublicClient,
): Promise<Address> {
  const owner = await client.readContract({
    address: erc721Address,
    abi: erc721ABI,
    functionName: "ownerOf",
    args: [tokenId],
  });

  return owner;
}

/**
 * Gets the balance of ERC721 tokens for an address
 *
 * @param erc721Address - The address of the ERC721 contract
 * @param ownerAddress - The address to check balance for
 * @param client - The public client to use for the call
 * @returns The number of tokens owned
 */
export async function getERC721Balance(
  erc721Address: Address,
  ownerAddress: Address,
  client: PublicClient,
): Promise<bigint> {
  const balance = await client.readContract({
    address: erc721Address,
    abi: erc721ABI,
    functionName: "balanceOf",
    args: [ownerAddress],
  });

  return balance;
}

/**
 * Checks if an address is approved to transfer a specific token
 *
 * @param erc721Address - The address of the ERC721 contract
 * @param tokenId - The token ID to check approval for
 * @param client - The public client to use for the call
 * @returns The address that is approved to transfer the token
 */
export async function getERC721Approved(
  erc721Address: Address,
  tokenId: bigint,
  client: PublicClient,
): Promise<Address> {
  const approved = await client.readContract({
    address: erc721Address,
    abi: erc721ABI,
    functionName: "getApproved",
    args: [tokenId],
  });

  return approved;
}

/**
 * Gets the name of the ERC721 token
 *
 * @param erc721Address - The address of the ERC721 contract
 * @param client - The public client to use for the call
 * @returns The token name
 */
export async function getERC721Name(
  erc721Address: Address,
  client: PublicClient,
): Promise<string> {
  const name = await client.readContract({
    address: erc721Address,
    abi: erc721ABI,
    functionName: "name",
  });

  return name;
}

/**
 * Gets the symbol of the ERC721 token
 *
 * @param erc721Address - The address of the ERC721 contract
 * @param client - The public client to use for the call
 * @returns The token symbol
 */
export async function getERC721Symbol(
  erc721Address: Address,
  client: PublicClient,
): Promise<string> {
  const symbol = await client.readContract({
    address: erc721Address,
    abi: erc721ABI,
    functionName: "symbol",
  });

  return symbol;
}

/**
 * Gets the token URI for a specific token
 *
 * @param erc721Address - The address of the ERC721 contract
 * @param tokenId - The token ID to get the URI for
 * @param client - The public client to use for the call
 * @returns The token URI
 */
export async function getERC721TokenURI(
  erc721Address: Address,
  tokenId: bigint,
  client: PublicClient,
): Promise<string> {
  const uri = await client.readContract({
    address: erc721Address,
    abi: erc721ABI,
    functionName: "tokenURI",
    args: [tokenId],
  });

  return uri;
}

