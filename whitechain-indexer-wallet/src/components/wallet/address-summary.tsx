import { Stat } from '@/components/ui/stat';
import type { AddressInfo } from '@/lib/blockscout';
import { formatUnits, formatUsd, grouped } from '@/lib/format';

export interface AddressSummaryProps {
  info: AddressInfo;
  /** `eth_getBalance` result, already converted from hex to a decimal string. */
  liveBalanceWei: string;
  /** `eth_getTransactionCount` result, as a decimal string. */
  nonce: string;
}

/**
 * The four headline numbers, two from the indexer and two from the node. Showing
 * the indexed and the live balance side by side is the point of the example:
 * they agree once the indexer catches up to the chain head.
 */
export function AddressSummary({ info, liveBalanceWei, nonce }: AddressSummaryProps) {
  const usd = formatUsd(info.coin_balance, info.exchange_rate);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat
        label="Balance (indexed)"
        value={formatUnits(info.coin_balance)}
        unit="WBT"
        hint={usd ? `≈ ${usd} at ${info.exchange_rate} USD/WBT` : 'No exchange rate indexed'}
        surface="REST v2"
        call="GET /addresses/{hash}"
      />
      <Stat
        label="Balance (live)"
        value={formatUnits(liveBalanceWei)}
        unit="WBT"
        hint="Read straight from the node"
        surface="ETH RPC"
        call="eth_getBalance"
      />
      <Stat
        label="Nonce"
        value={grouped(nonce)}
        hint="Transactions sent by this address"
        surface="ETH RPC"
        call="eth_getTransactionCount"
      />
      <Stat
        label="Type"
        value={info.is_contract ? 'Contract' : 'Wallet'}
        hint={
          info.is_contract
            ? info.is_verified
              ? 'Source verified on the explorer'
              : 'Source not verified'
            : 'No contract code at this address'
        }
        surface="REST v2"
        call="GET /addresses/{hash}"
      />
    </div>
  );
}
