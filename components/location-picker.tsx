"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Navigation } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LocationPickerProps {
  onLocationSelect: (address: string, lat?: number, lng?: number) => void
  initialAddress?: string
}

export function LocationPicker({ onLocationSelect, initialAddress = "" }: LocationPickerProps) {
  const [address, setAddress] = useState(initialAddress)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const { toast } = useToast()

  const getCurrentLocation = () => {
    setIsGettingLocation(true)

    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser",
        variant: "destructive",
      })
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // Use reverse geocoding to get address from coordinates
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=a3229244d7854172aeb043f8783707ce&language=en&pretty=1`,
          )

          if (response.ok) {
            const data = await response.json()
            if (data.results && data.results.length > 0) {
              const formattedAddress = data.results[0].formatted
              setAddress(formattedAddress)
              onLocationSelect(formattedAddress, latitude, longitude)
              toast({
                title: "Success",
                description: "Location detected successfully!",
              })
            }
          } else {
            // Fallback: just use coordinates
            const fallbackAddress = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
            setAddress(fallbackAddress)
            onLocationSelect(fallbackAddress, latitude, longitude)
            toast({
              title: "Location detected",
              description: "Using coordinates as address",
            })
          }
        } catch (error) {
          // Fallback: just use coordinates
          const fallbackAddress = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
          setAddress(fallbackAddress)
          onLocationSelect(fallbackAddress, latitude, longitude)
          toast({
            title: "Location detected",
            description: "Using coordinates as address",
          })
        }

        setIsGettingLocation(false)
      },
      (error) => {
        toast({
          title: "Error",
          description: "Unable to get your location. Please enter address manually.",
          variant: "destructive",
        })
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  const handleAddressChange = (value: string) => {
    setAddress(value)
    onLocationSelect(value)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">Delivery Address</Label>
        <div className="flex space-x-2 mt-1">
          <Input
            id="address"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder="Enter your delivery address"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="px-3"
          >
            {isGettingLocation ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
            ) : (
              <Navigation className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          <MapPin className="h-3 w-3 inline mr-1" />
          Click the location button to use your current location
        </p>
      </div>

      {/* Simple Map Placeholder */}
      <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center text-gray-500">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p>Interactive Map</p>
          <p className="text-sm">Google Maps integration coming soon</p>
        </div>
      </div>
    </div>
  )
}
