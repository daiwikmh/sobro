import { useState, useEffect, useCallback } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'

interface UserProfile {
  id?: string
  email: string
  firstName: string
  lastName: string
  username: string
  bio: string
  location: string
  website: string
  dateOfBirth: string
  avatar?: string
  solana_public_key?: string
}

interface UseUserProfileReturn {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  isRegistered: boolean
  registerUser: () => Promise<boolean>
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>
  refetch: () => Promise<void>
  getDisplayName: () => string
  getFirstName: () => string
}

export function useUserProfile(): UseUserProfileReturn {
  const { address, embeddedWalletInfo, isConnected } = useAppKitAccount()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [hasAutoRegistered, setHasAutoRegistered] = useState(false)

  const registerUser = useCallback(async (): Promise<boolean> => {
    const email = embeddedWalletInfo?.user?.email
    if (!email || hasAutoRegistered) return false

    try {
      console.log('Auto-registering user:', email)
      const apiUrl = '/api'
      const response = await fetch(`${apiUrl}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          solanaPublicKey: address || 'unknown'
        })
      })

      if (response.ok) {
        console.log('User registered successfully:', email)
        setIsRegistered(true)
        setHasAutoRegistered(true)
        await fetchUserProfile()
        return true
      } else {
        console.error('Failed to register user:', response.status)
        return false
      }
    } catch (error) {
      console.error('Error registering user:', error)
      return false
    }
  }, [embeddedWalletInfo?.user?.email, address, hasAutoRegistered])

  const fetchUserProfile = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      const email = embeddedWalletInfo?.user?.email
      
      if (!email) {
        setProfile(null)
        setIsRegistered(false)
        setIsLoading(false)
        return
      }

      try {
        const apiUrl = '/api'
        const response = await fetch(`${apiUrl}/users/profile/email/${encodeURIComponent(email)}`)
        
        if (response.ok) {
          const { user } = await response.json()
          setProfile({
            id: user.id,
            email: user.email,
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            username: user.username || '',
            bio: user.bio || '',
            location: user.location || '',
            website: user.website || '',
            dateOfBirth: user.date_of_birth || '',
            avatar: user.avatar || (email ? `https://api.dicebear.com/7.x/initials/svg?seed=${email}` : ''),
            solana_public_key: user.solana_public_key
          })
          setIsRegistered(true)
        } else if (response.status === 404) {
          // User doesn't exist in backend
          setProfile({
            email: email,
            firstName: '',
            lastName: '',
            username: '',
            bio: '',
            location: '',
            website: '',
            dateOfBirth: '',
            avatar: email ? `https://api.dicebear.com/7.x/initials/svg?seed=${email}` : ''
          })
          setIsRegistered(false)
          // Auto-register if not already attempted
          if (!hasAutoRegistered) {
            await registerUser()
          }
        } else {
          setError('Failed to fetch profile')
          setIsRegistered(false)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        setError('Failed to fetch profile')
        setIsRegistered(false)
        // Fallback to default values
        setProfile({
          email: email,
          firstName: '',
          lastName: '',
          username: '',
          bio: '',
          location: '',
          website: '',
          dateOfBirth: '',
          avatar: email ? `https://api.dicebear.com/7.x/initials/svg?seed=${email}` : ''
        })
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setIsLoading(false)
    }
  }, [embeddedWalletInfo?.user?.email, hasAutoRegistered, registerUser])

  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    const email = embeddedWalletInfo?.user?.email
    if (!email || !profile) return false

    try {
      const apiUrl = '/api'
      const updateData = {
        first_name: updates.firstName ?? profile.firstName,
        last_name: updates.lastName ?? profile.lastName,
        username: updates.username ?? profile.username,
        bio: updates.bio ?? profile.bio,
        location: updates.location ?? profile.location,
        website: updates.website ?? profile.website,
        date_of_birth: updates.dateOfBirth ?? profile.dateOfBirth,
        avatar: updates.avatar ?? profile.avatar
      }

      const response = await fetch(`${apiUrl}/users/profile/email/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const { user } = await response.json()
        setProfile(prev => prev ? {
          ...prev,
          id: user.id,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          username: user.username || '',
          bio: user.bio || '',
          location: user.location || '',
          website: user.website || '',
          dateOfBirth: user.date_of_birth || '',
          avatar: user.avatar || prev.avatar,
          solana_public_key: user.solana_public_key
        } : null)
        return true
      } else {
        console.error('Failed to update profile:', response.status)
        return false
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      return false
    }
  }, [embeddedWalletInfo?.user?.email, profile])

  useEffect(() => {
    if (isConnected && embeddedWalletInfo?.user?.email) {
      fetchUserProfile()
    } else {
      setProfile(null)
      setIsRegistered(false)
      setHasAutoRegistered(false)
    }
  }, [isConnected, embeddedWalletInfo?.user?.email, fetchUserProfile])

  const getDisplayName = useCallback(() => {
    if (!profile) return 'Guest'
    
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`
    } else if (profile.firstName) {
      return profile.firstName
    } else if (profile.username) {
      return profile.username
    } else if (profile.email) {
      return profile.email.split('@')[0]
    } else {
      return 'User'
    }
  }, [profile])

  const getFirstName = useCallback(() => {
    if (!profile || !isRegistered) return 'Guest'
    
    if (profile.firstName) {
      return profile.firstName
    } else if (profile.username) {
      return profile.username
    } else if (profile.email) {
      return profile.email.split('@')[0]
    } else {
      return 'Guest'
    }
  }, [profile, isRegistered])

  return {
    profile,
    isLoading,
    error,
    isRegistered,
    registerUser,
    updateProfile,
    refetch: fetchUserProfile,
    getDisplayName,
    getFirstName
  }
}