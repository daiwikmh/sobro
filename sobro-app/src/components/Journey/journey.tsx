import React, { useEffect, useState, useRef } from "react"
import Sidebar from "../grants/sidebar"
import TopNav from "../grants/top-nav"
import Hyperspeed from '@/components/ui/hyperspeed';
import ProfileCard from './profile-card'
import { useUserProfile } from "@/hooks/useUserProfile"
import { useCampfireIntegration } from "@/hooks/useCampfireIntegration"
import { useAuthState, useAuth } from "@campnetwork/origin/react"
import html2canvas from "html2canvas"
import { toast } from "sonner"


function Layout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className={`flex h-screen`}>
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <header className="h-16 border-b border-gray-200 dark:border-[#1F1F23] flex-shrink-0">
          <TopNav />
        </header>
        <main className="flex-1 overflow-hidden bg-gray-50 dark:bg-[#0F0F12]">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function Journey() {
  const { profile, getDisplayName } = useUserProfile()
  const { authenticated } = useAuthState()
  const { origin, jwt } = useAuth()
  const { 
    mintIPWithOrigin, 
    clearError,
    clearSuccess 
  } = useCampfireIntegration()
  const [showHyperspeed, setShowHyperspeed] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [showProfileCard, setShowProfileCard] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const profileCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log('Journey component mounted')
    
    // Start the animation immediately when component mounts
    const timer = setTimeout(() => {
      console.log('Starting hyperspeed animation')
      setIsVisible(true)
    }, 100)

    // Hide after 10 seconds and show ProfileCard
    const hideTimer = setTimeout(() => {
      console.log('Hiding hyperspeed animation')
      setIsVisible(false)
      // Remove from DOM after animation completes and show ProfileCard
      setTimeout(() => {
        setShowHyperspeed(false)
        setShowProfileCard(true)
        console.log('Hyperspeed animation removed, showing ProfileCard')
      }, 500) // Wait for fade out animation
    }, 1010) // 10 seconds + initial delay

    return () => {
      clearTimeout(timer)
      clearTimeout(hideTimer)
    }
  }, [])

  const createPlaceholderImage = async (): Promise<File> => {
    // Create a simple canvas as fallback
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 300
    const ctx = canvas.getContext('2d')!
    
    // Create a gradient background
    const gradient = ctx.createLinearGradient(0, 0, 400, 300)
    gradient.addColorStop(0, '#6c5ce7')
    gradient.addColorStop(1, '#00cec9')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 400, 300)
    
    // Add text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${getDisplayName()}`, 200, 150)
    ctx.font = '16px Arial'
    ctx.fillText('Profile Card', 200, 180)
    ctx.fillText(`@${profile?.username || "explorer"}`, 200, 200)
    
    // Convert to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
      }, 'image/png', 1.0)
    })
    
    return new File([blob], `${getDisplayName()}-profile-card.png`, {
      type: 'image/png'
    })
  }

  const handleMintCard = async () => {
    if (!authenticated || !origin || !jwt) {
      toast.error("Please connect your wallet to mint")
      return
    }

    setIsMinting(true)
    
    // Clear previous messages
    clearError()
    clearSuccess()
    
    try {
      let selectedFile: File
      
      try {
        // Try html2canvas first with very basic settings
        if (profileCardRef.current) {
          const canvas = await html2canvas(profileCardRef.current, {
            backgroundColor: '#0f0f12',
            scale: 1,
            logging: false,
            useCORS: true,
            allowTaint: true,
            width: 400,
            height: 300,
            windowWidth: 400,
            windowHeight: 300
          })

          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob)
            }, 'image/png', 1.0)
          })

          selectedFile = new File([blob], `${getDisplayName()}-profile-card.png`, {
            type: 'image/png'
          })
        } else {
          throw new Error('Element not found')
        }
      } catch (captureError) {
        console.warn('html2canvas failed, using placeholder:', captureError)
        // Fallback to placeholder image
        selectedFile = await createPlaceholderImage()
      }

      // Use the same metadata structure as ImageUploader
      const metadata = {
        name: '',
        description: '',
      };
      
      const updatedMetadata = {
        ...metadata,
        name: `${getDisplayName()} - Profile Card`,
        description: `Digital profile card for ${getDisplayName()} (${profile?.username || "explorer"}) - ${profile?.bio || "Traveler"}`,
        mimeType: selectedFile.type,
        size: selectedFile.size,
      };

      // Use the same license structure as ImageUploader
      const license = {
        price: '0',
        duration: '2629800',
        royalty: '0',
        paymentToken: '0x0000000000000000000000000000000000000000',
      };

      // Mint the card using the same method as ImageUploader
      const tokenId = await mintIPWithOrigin(
        selectedFile,
        updatedMetadata,
        license,
        ''
      )
      
      if (tokenId) {
        toast.success("Profile card minted successfully as IP-NFT!");
      } else {
        toast.error("Failed to mint profile card");
      }
    } catch (error) {
      console.error('Minting error:', error)
      toast.error("Failed to mint profile card. Please try again.");
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <Layout>
      <div className="w-full h-full relative">
        {/* Hyperspeed overlay - slides up from bottom */}
        {showHyperspeed && (
          <div 
            className={`absolute inset-0 z-50 transition-all duration-500 ease-in-out ${
              isVisible 
                ? 'transform translate-y-0 opacity-100' 
                : 'transform translate-y-full opacity-0'
            }`}
          >
            <Hyperspeed
              effectOptions={{
                onSpeedUp: () => { },
                onSlowDown: () => { },
                distortion: 'turbulentDistortion',
                length: 400,
                roadWidth: 10,
                islandWidth: 2,
                lanesPerRoad: 4,
                fov: 90,
                fovSpeedUp: 150,
                speedUp: 2,
                carLightsFade: 0.4,
                totalSideLightSticks: 20,
                lightPairsPerRoadWay: 40,
                shoulderLinesWidthPercentage: 0.05,
                brokenLinesWidthPercentage: 0.1,
                brokenLinesLengthPercentage: 0.5,
                lightStickWidth: [0.12, 0.5],
                lightStickHeight: [1.3, 1.7],
                movingAwaySpeed: [60, 80],
                movingCloserSpeed: [-120, -160],
                carLightsLength: [400 * 0.03, 400 * 0.2],
                carLightsRadius: [0.05, 0.14],
                carWidthPercentage: [0.3, 0.5],
                carShiftX: [-0.8, 0.8],
                carFloorSeparation: [0, 5],
                colors: {
                  roadColor: 0x080808,
                  islandColor: 0x0a0a0a,
                  background: 0x000000,
                  shoulderLines: 0xFFFFFF,
                  brokenLines: 0xFFFFFF,
                  leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
                  rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
                  sticks: 0x03B3C3,
                }
              }}
            />
          </div>
        )}

        {/* ProfileCard appears after hyperspeed animation */}
        {showProfileCard && (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-[#0F0F12] animate-fade-in">
            <div className="max-w-md" ref={profileCardRef}>
              <ProfileCard
                name={getDisplayName()}
                title={profile?.bio || "Traveler"}
                handle={profile?.username || "explorer"}
                status="Online"
                contactText="Contact"
                avatarUrl={profile?.avatar || "https://api.dicebear.com/7.x/avatars/svg?seed=user"}
                showUserInfo={true}
                enableTilt={true}
                onContactClick={() => console.log('Contact clicked')}
                onMintClick={handleMintCard}
                showMintButton={true}
                isMinting={isMinting}
              />
            </div>
          </div>
        )}

        {/* Default state when nothing is showing */}
        {!showHyperspeed && !showProfileCard && (
          <div className="w-full h-full bg-gray-50 dark:bg-[#0F0F12] flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Your Journey
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Experience the adventure ahead
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}