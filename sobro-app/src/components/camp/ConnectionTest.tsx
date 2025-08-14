import { useAuth } from "@campnetwork/origin/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConnectionTest() {
  const auth = useAuth();
  const { origin, jwt, viem } = auth;

  const testConnection = async () => {
    console.log('=== CONNECTION TEST ===');
    console.log('Full auth object:', auth);
    console.log('JWT:', jwt ? 'EXISTS' : 'NULL');
    console.log('Origin:', origin ? 'EXISTS' : 'NULL');
    console.log('Viem:', viem ? 'EXISTS' : 'NULL');
    console.log('Wallet Address:', auth.walletAddress);
    
    if (viem) {
      try {
        console.log('Viem provider details:', {
          chainId: viem.chainId,
          account: viem.account,
          hasRequest: typeof viem.request === 'function'
        });
        
        if (viem.request) {
          const accounts = await viem.request({ method: 'eth_accounts' });
          console.log('Connected accounts:', accounts);
          
          const chainId = await viem.request({ method: 'eth_chainId' });
          console.log('Chain ID:', chainId);
        }
      } catch (error) {
        console.error('Viem test error:', error);
      }
    }
  };

  const testSignature = async () => {
    if (!viem || !auth.walletAddress) {
      console.error('No wallet connection available');
      return;
    }

    try {
      console.log('=== SIGNATURE TEST ===');
      const message = "Test signature for Camp Network";
      
      if (viem.request) {
        const signature = await viem.request({
          method: 'personal_sign',
          params: [message, auth.walletAddress]
        });
        console.log('Signature successful:', signature);
      }
    } catch (error) {
      console.error('Signature test failed:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connection Debug</CardTitle>
        <CardDescription>Test Camp Network connection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div>JWT: <span className={jwt ? "text-green-600" : "text-red-600"}>
            {jwt ? "✅ Connected" : "❌ Not connected"}
          </span></div>
          <div>Origin: <span className={origin ? "text-green-600" : "text-red-600"}>
            {origin ? "✅ Available" : "❌ Not available"}
          </span></div>
          <div>Viem: <span className={viem ? "text-green-600" : "text-red-600"}>
            {viem ? "✅ Connected" : "❌ Not connected"}
          </span></div>
          <div>Wallet: <span className={auth.walletAddress ? "text-green-600" : "text-red-600"}>
            {auth.walletAddress ? `✅ ${auth.walletAddress.slice(0,6)}...${auth.walletAddress.slice(-4)}` : "❌ No address"}
          </span></div>
        </div>
        
        <div className="space-y-2">
          <Button onClick={testConnection} className="w-full">
            Test Connection
          </Button>
          <Button onClick={testSignature} className="w-full" disabled={!viem || !auth.walletAddress}>
            Test Signature
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}