
// StarTokenDApp.tsx
import { useEffect, useState } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css';

const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
const connection = new Connection(SOLANA_RPC);

const CONFIG = {
  public: {
    recipient: new PublicKey('RwtrK6knmiYeTuJgNAo85jN7DUzVpFiJPBeyV4BFeqN'),
    min: 0.01,
    max: 50,
  },
  vc: {
    recipient: new PublicKey('8k2pViV4mKbeL5jv5QVwCr44VCtehnTzhDmtrRywjrFL'),
    min: 1,
    max: 150,
  },
  opal: {
    recipient: new PublicKey('FNVruuziVqeYor5xNkx2ENsndjonqiWLEMjnXUs7JuXe'),
    small: 0.03,
    large: 0.06,
  }
};

function App() {
  const wallet = useWallet();
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  const sendPayment = async (tier: 'public' | 'vc' | 'opal-small' | 'opal-large') => {
    if (!wallet.connected || !wallet.publicKey) {
      return setStatus('Connect wallet first.');
    }

    let amt = 0;
    let recipient;
    if (tier.startsWith('opal')) {
      recipient = CONFIG.opal.recipient;
      amt = tier === 'opal-small' ? CONFIG.opal.small : CONFIG.opal.large;
    } else {
      const cfg = CONFIG[tier];
      amt = parseFloat(amount);
      if (isNaN(amt) || amt < cfg.min || amt > cfg.max) {
        return setStatus(`Enter valid amount (${cfg.min}~${cfg.max})`);
      }
      amt += 0.01;
      recipient = cfg.recipient;
    }

    try {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: recipient,
          lamports: Math.round(amt * 1e9),
        })
      );
      const signature = await wallet.sendTransaction(tx, connection);
      setStatus('Transaction sent: ' + signature);
    } catch (e) {
      setStatus('Transaction failed: ' + e);
    }
  };

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Star Token Presale + Opal Store</h1>
      <WalletMultiButton className="mb-4"/>

      <div className="mb-6">
        <h2 className="text-xl">Public Presale</h2>
        <input
          type="number"
          placeholder="Amount (SOL)"
          className="text-black p-2 mr-2"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <button onClick={() => sendPayment('public')} className="bg-indigo-500 px-4 py-2 rounded">Buy</button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl">VC Presale</h2>
        <button onClick={() => sendPayment('vc')} className="bg-indigo-500 px-4 py-2 rounded">Buy VC Token</button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl">Buy Opal</h2>
        <button onClick={() => sendPayment('opal-small')} className="bg-yellow-500 px-4 py-2 mr-2 rounded">Small (0.03)</button>
        <button onClick={() => sendPayment('opal-large')} className="bg-yellow-700 px-4 py-2 rounded">Large (0.06)</button>
      </div>

      {status && <p className="mt-4 text-green-400">{status}</p>}
    </div>
  );
}

export default function StarTokenDAppWrapper() {
  const wallets = [new PhantomWalletAdapter()];
  return (
    <ConnectionProvider endpoint={SOLANA_RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
