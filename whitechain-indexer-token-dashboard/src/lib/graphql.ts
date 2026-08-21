// Blockscout GraphQL client.
// Reference: https://docs.whitechain.io/build/block-explorer/indexer-token-dashboard
//
// The schema's root queries are address, addresses, block, transaction, and the
// `tokenTransfers` Relay connection. There is no `token` query, so token
// metadata, counters, and the holders list come from REST v2 (see
// blockscout.ts). The split is the point of the example: GraphQL powers the
// transfer feed, REST fills in what the schema does not expose.
import { GRAPHQL } from './config';

/**
 * GraphQL always answers with HTTP 200. On failure the body carries an `errors`
 * array instead of, or alongside, `data`, so checking the status code is not
 * enough: check for `errors` before reading `data`.
 */
export async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(GRAPHQL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL → ${res.status} ${res.statusText}`);
  const body = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (body.errors?.length) {
    throw new Error(`GraphQL: ${body.errors.map((e) => e.message).join('; ')}`);
  }
  if (!body.data) throw new Error('GraphQL returned no data');
  return body.data;
}

/**
 * The server caps operation complexity at 100 and `tokenTransfers` costs about
 * 11 per item, so a page of 8 stays comfortably under the cap. Raising this is
 * the fastest way to turn a working feed into a complexity error.
 */
export const TRANSFERS_PAGE_SIZE = 8;

export interface TokenTransferNode {
  /** Raw amount moved. Divide by the token's `decimals`. */
  amount: string | null;
  fromAddressHash: string;
  toAddressHash: string;
  transactionHash: string;
  /** NFT ids. `null` for ERC-20; set for ERC-721 and ERC-1155. */
  tokenIds: string[] | null;
}

export interface PageInfo {
  hasNextPage: boolean;
  /** Opaque cursor. Send it back as `after`; never build or parse one yourself. */
  endCursor: string | null;
}

interface TransfersResult {
  tokenTransfers: {
    edges: { node: TokenTransferNode }[];
    pageInfo: PageInfo;
  };
}

const TRANSFERS_QUERY = /* GraphQL */ `
  query Transfers($token: AddressHash!, $first: Int!, $after: String) {
    tokenTransfers(tokenContractAddressHash: $token, first: $first, after: $after) {
      edges {
        node {
          amount
          fromAddressHash
          toAddressHash
          transactionHash
          tokenIds
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * One page of transfers, newest first. Pass the previous response's
 * `pageInfo.endCursor` as `after` to continue; stop when `hasNextPage` is false.
 */
export async function getTokenTransfers(
  token: string,
  after?: string | null,
  first = TRANSFERS_PAGE_SIZE,
) {
  const data = await gql<TransfersResult>(TRANSFERS_QUERY, {
    token,
    first,
    after: after ?? null,
  });
  return {
    transfers: data.tokenTransfers.edges.map((edge) => edge.node),
    pageInfo: data.tokenTransfers.pageInfo,
  };
}

export interface AddressNode {
  hash: string;
  /** Native balance in wei. Divide by 10^18 for WBT. */
  fetchedCoinBalance: string | null;
  /** `null` means the address is a wallet, not a contract. */
  contractCode: string | null;
}

const ADDRESS_QUERY = /* GraphQL */ `
  query AddressLookup($hash: AddressHash!) {
    address(hash: $hash) {
      hash
      fetchedCoinBalance
      contractCode
    }
  }
`;

/** Look up one address: native balance, and whether it holds contract code. */
export async function getAddress(hash: string): Promise<AddressNode | null> {
  const data = await gql<{ address: AddressNode | null }>(ADDRESS_QUERY, { hash });
  return data.address;
}

/** The transfers query, verbatim, for the UI to display next to the feed. */
export const TRANSFERS_QUERY_SOURCE = TRANSFERS_QUERY.trim();
