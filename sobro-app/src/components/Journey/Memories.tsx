import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Image as ImageIcon, ExternalLink, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "@campnetwork/origin/react";
import Sidebar from "../grants/sidebar";
import { useCampfireIntegration } from "@/hooks/useCampfireIntegration";

interface NFTMemory {
  id: string;
  token: {
    id: string;
    name?: string;
  };
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
  };
  name?: string;
  description?: string;
}

export default function Memories() {
  const navigate = useNavigate();
  const { authenticated } = useAuthState();
  const { userNFTs, nftLoading, fetchUserNFTs, isConnected, getOriginData, getOriginUsage, address } = useCampfireIntegration();
  const [ipAssets, setIpAssets] = useState<any[]>([])
  const [filteredIPs, setFilteredIPs] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [stats, setStats] = useState({
    totalIPs: 0,
    totalRevenue: 0,
    totalViews: 0,
    totalLikes: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!authenticated || !isConnected || !address) return;
      
      try {
        console.log('Fetching data for wallet address:', address)
        let data = await getOriginData(address)
        console.log('Raw data received:', data)
        
        if (data) {
          data = data.filter((ip: any) => ip.metadata?.image && ip.metadata.image !== '')
          console.log('Filtered data:', data)
          setIpAssets(data)
          setStats(prev => ({
            ...prev,
            totalIPs: data.length
          }))
        }
        
        const usage = await getOriginUsage()
        console.log('Usage data:', usage)
        if (usage?.data?.user) {
          setStats(prev => ({
            ...prev,
            totalRevenue: usage.data.user.points || 0,
            totalLikes: usage.data.user.multiplier || 0,
          }))
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [authenticated, isConnected, address])

  useEffect(() => {
    // Filter IPs based on search and category
    let filtered = ipAssets

    if (searchTerm) {
      filtered = filtered.filter((ip: any) => {
        const name = (ip.name ?? ip.metadata?.name ?? '').toString().toLowerCase()
        const desc = (ip.description ?? ip.metadata?.description ?? '').toString().toLowerCase()
        return name.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase())
      })
    }

    if (filterCategory !== 'All') {
      filtered = filtered.filter((ip: any) => ip.category === filterCategory)
    }

    setFilteredIPs(filtered)
  }, [ipAssets, searchTerm, filterCategory])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleUploadClick = () => {
    // Always redirect to upload page - it will handle authentication there
    navigate('/upload-memories');
  };

  const isFullyConnected = authenticated;

  if (nftLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
<div className="flex min-h-screen bg-background">
    <Sidebar />

    <div className="min-h-screen bg-background p-6">
            
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Memories</h1>
            <p className="text-muted-foreground">
              {filteredIPs.length === 0 
                ? "No memories yet. Start by uploading your first image!"
                : `${filteredIPs.length} ${filteredIPs.length === 1 ? 'memory' : 'memories'} preserved as IP-NFTs`
              }
            </p>
          </div>
          <Button onClick={handleUploadClick} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {isFullyConnected ? 'Upload New Memory' : 'Connect to Upload'}
          </Button>
        </div>

        {/* Empty State */}
        {filteredIPs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No memories yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Upload your first image to start building your digital memory vault. Each image will be minted as an IP-NFT on the blockchain.
            </p>
            <Button onClick={handleUploadClick} size="lg" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {isFullyConnected ? 'Get Started' : 'Connect to Get Started'}
            </Button>
          </div>
        ) : (
          /* Memories Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIPs.map((nft: any) => (
              <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image Preview */}
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={nft.metadata?.image || ''}
                    alt={nft.metadata?.name || nft.name || 'NFT'}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">
                    NFT #{nft.token?.id || nft.id}
                  </Badge>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2">
                    {nft.metadata?.name || nft.name || 'Untitled'}
                  </CardTitle>
                  {(nft.metadata?.description || nft.description) && (
                    <CardDescription className="line-clamp-2">
                      {nft.metadata?.description || nft.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Token Info */}
                    <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <div className="font-medium">Token ID: {nft.token?.id || nft.id}</div>
                      <div>Blockchain NFT</div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(nft.metadata?.image || '', '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Full
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Statistics */}
        {filteredIPs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalIPs}</div>
              <div className="text-sm text-muted-foreground">Total IPs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.totalRevenue}
              </div>
              <div className="text-sm text-muted-foreground">Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalViews}
              </div>
              <div className="text-sm text-muted-foreground">Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalLikes}</div>
              <div className="text-sm text-muted-foreground">Likes</div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
    </>
  );
}