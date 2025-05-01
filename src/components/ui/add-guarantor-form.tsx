"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Upload } from "lucide-react"

interface AddGuarantorFormProps {
  onClose: () => void
}

export default function AddGuarantorForm({ onClose }: AddGuarantorFormProps) {
  const [cnicFront, setCnicFront] = useState<File | null>(null)
  const [cnicBack, setCnicBack] = useState<File | null>(null)
  const [profilePic, setProfilePic] = useState<File | null>(null)
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null)

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfilePic(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfilePicPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log("Form submitted")
    onClose()
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Add Guarantor</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" placeholder="Enter full name" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profilePic">Profile Picture (Optional)</Label>
          <div className="flex items-center gap-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:bg-accent/50 transition-colors cursor-pointer flex-1">
              <input
                type="file"
                id="profilePic"
                className="hidden"
                accept="image/*"
                onChange={handleProfilePicChange}
              />
              <label htmlFor="profilePic" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                <span className="text-sm font-medium">{profilePic ? profilePic.name : "Upload Profile Picture"}</span>
              </label>
            </div>

            {profilePicPreview && (
              <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-primary/20">
                <img
                  src={profilePicPreview || "/placeholder.svg"}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setProfilePic(null)
                    setProfilePicPreview(null)
                  }}
                  className="absolute top-0 right-0 bg-background/80 rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input id="email" type="email" placeholder="Enter email address" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact">Contact</Label>
          <Input id="contact" placeholder="Enter contact number" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnicNumber">CNIC Number</Label>
          <Input
            id="cnicNumber"
            placeholder="Enter CNIC number"
            required
            pattern="[0-9]{5}-[0-9]{7}-[0-9]{1}"
            title="Format: 12345-1234567-1"
          />
          <p className="text-xs text-muted-foreground">Format: 12345-1234567-1</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>CNIC Front</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:bg-accent/50 transition-colors cursor-pointer">
              <input
                type="file"
                id="cnicFront"
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files && setCnicFront(e.target.files[0])}
              />
              <label htmlFor="cnicFront" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                <span className="text-sm font-medium">{cnicFront ? cnicFront.name : "Upload CNIC Front"}</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>CNIC Back</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:bg-accent/50 transition-colors cursor-pointer">
              <input
                type="file"
                id="cnicBack"
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files && setCnicBack(e.target.files[0])}
              />
              <label htmlFor="cnicBack" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                <span className="text-sm font-medium">{cnicBack ? cnicBack.name : "Upload CNIC Back"}</span>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
          >
            Add Guarantor
          </Button>
        </div>
      </form>
    </div>
  )
}
