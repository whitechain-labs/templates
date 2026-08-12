import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { StoragePanel, WalletPanel } from '@/components/web3/panels';

/**
 * Example home page: a Server Component (the default) that composes two small
 * client islands, the Reown wallet panel and the Storage contract panel. Replace
 * this with your app; it exists only to show the web3 wiring.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">Whitechain dApp</h1>
        <p className="max-w-2xl text-gray-500">
          A Next + Reown starter: connect a wallet on Whitechain Sepolia, then read and write the
          example Storage contract. Replace this page with your app.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Wallet</h2>
            <p className="text-sm text-gray-500">
              Connect with Reown AppKit (WalletConnect). Your account, network and balance appear
              here once connected.
            </p>
          </CardHeader>
          <CardBody>
            <WalletPanel />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Storage contract</h2>
            <p className="text-sm text-gray-500">
              Calls store() and retrieve() on the example Storage contract deployed to Whitechain
              Sepolia.
            </p>
          </CardHeader>
          <CardBody>
            <StoragePanel />
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
