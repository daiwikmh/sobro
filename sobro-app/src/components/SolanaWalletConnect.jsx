import React from 'react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Wallet, Copy, ExternalLink, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const SolanaWalletConnect = () => {
  const { isConnected, address } = useAppKitAccount();
  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider('solana');

  const [balance, setBalance] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // Fetch wallet balance
  const fetchBalance = React.useCallback(async () => {
    if (!connection || !address || !isConnected) return;
    
    try {
      setLoading(true);
      const wallet = new PublicKey(address);
      const balanceInLamports = await connection.getBalance(wallet);
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
      setBalance(balanceInSOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  }, [connection, address, isConnected]);

  // Fetch balance when connected
  React.useEffect(() => {
    if (isConnected && address) {
      fetchBalance();
    }
  }, [isConnected, address, fetchBalance]);

  // Sign a message
  const handleSignMessage = async () => {
    if (!walletProvider) return;
    
    try {
      const message = "Hello from Reown AppKit on Solana!";
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await walletProvider.signMessage(encodedMessage);
      console.log('Message signed:', Buffer.from(signature).toString('hex'));
      alert('Message signed successfully! Check console for signature.');
    } catch (error) {
      console.error('Error signing message:', error);
      alert('Error signing message: ' + error.message);
    }
  };

  // Copy address to clipboard
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      alert('Address copied to clipboard!');
    }
  };

  // Truncate address for display
  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 space-y-4">
        <div className="flex items-center justify-center space-x-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Connected to Solana</span>
        </div>

        {/* Wallet Info */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Solana Wallet</p>
              <p className="text-xs text-gray-600">Via Social Login</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Address:</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono">{truncateAddress(address)}</span>
                <button
                  onClick={copyAddress}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Balance:</span>
              <span className="text-sm font-medium">
                {loading ? '...' : balance !== null ? `${balance.toFixed(4)} SOL` : 'Error loading'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleSignMessage}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Sign Message
          </button>

          <button
            onClick={fetchBalance}
            disabled={loading}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Balance'}
          </button>

          <appkit-button />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">Universal Wallet Features:</p>
              <ul className="space-y-1">
                <li>• Non-custodial wallet linked to your social account</li>
                <li>• Works across all Reown AppKit enabled apps</li>
                <li>• Can be upgraded to self-custodial anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">Connect to Solana</h3>
        <p className="text-gray-600">Create your wallet using Gmail or other social accounts</p>
      </div>

      {/* AppKit Connect Button */}
      <div className="flex justify-center">
        <appkit-button />
      </div>

      {/* Features List */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-gray-900">What you get:</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Instant wallet creation with social login</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Non-custodial - you own your keys</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Works across 600+ Web3 apps</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Built-in swap & on-ramp features</span>
          </li>
        </ul>
      </div>

      {/* Powered by Reown */}
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
        <Shield className="w-4 h-4" />
        <span>Powered by Reown AppKit</span>
      </div>
    </div>
  );
};

export default SolanaWalletConnect;
