"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Upload, Phone } from "lucide-react"
import { useCreateUser } from "@/hooks/postApi"
import { PhoneInput } from "./phone-input"

interface AddGuarantorFormProps {
  onClose: () => void
  role: 'GUARANTOR' | 'ADMIN' | 'INVESTOR' | 'CUSTOMER'
}

export default function AddGuarantorForm({ onClose, role }: AddGuarantorFormProps) {
  const [cnicFront, setCnicFront] = useState<File | null>(null)
  const [cnicBack, setCnicBack] = useState<File | null>(null)
  const [profilePic, setProfilePic] = useState<File | null>(null)
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null)
  const [phone, setPhone] = useState("");

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

  const { createUser, loading, error, success } = useCreateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  const firstName = (e.target as HTMLFormElement).firstName.value;
  const lastName = (e.target as HTMLFormElement).lastName.value;
  const email = (e.target as HTMLFormElement).email.value;
  const phone = (e.target as HTMLFormElement).phone.value;
  const cnicNumber = (e.target as HTMLFormElement).cnicNumber.value;
  const address = (e.target as HTMLFormElement).address.value;
  const cnicFrontFile = cnicFront;
  const cnicBackFile = cnicBack;
  const profilePicFile = profilePic;
  const cnicFrontFileName = cnicFrontFile ? cnicFrontFile.name : null;
  const cnicBackFileName = cnicBackFile ? cnicBackFile.name : null;
  const profilePicFileName = profilePicFile ? profilePicFile.name : null;
  
  
    try {
      await createUser({
        firstName,
        lastName,
        email,
        phone,
        role: role,
        cnicFrontUrl: "https://pakobserver.net/wp-content/uploads/2024/01/cnic-1.jpg", 
        cnicBackUrl: "https://pakobserver.net/wp-content/uploads/2024/01/cnic-1.jpg", 
        profilePicture: "https://wallpapers.com/images/featured/cool-profile-picture-87h46gcobjl5e4xu.jpg", 
        address: address, 
        cnicNumber: cnicNumber, 

      });
  
      onClose(); 
    } catch (err) {
      console.error(err);
    }
  };
  

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Popup Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Add {role === "CUSTOMER" ? "Customer" : role === "INVESTOR" ? "Investor" : "Guarantor"}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter first name" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter last name" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profilePic">Profile Picture (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer flex-1">
                      <input
                        type="file"
                        id="profilePic"
                        className="hidden"
                        accept="image/*"
                        onChange={handleProfilePicChange}
                      />
                      <label htmlFor="profilePic" className="cursor-pointer flex flex-col items-center">
                        <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {profilePic ? profilePic.name : "Upload Profile Picture"}
                        </span>
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
                          className="absolute top-0 right-0 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-600"
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
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" type="address" placeholder="Enter address" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact</Label>
                  <PhoneInput id="phone" value={phone} onChange={setPhone} />
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">Format: 12345-1234567-1</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>CNIC Front</Label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
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
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
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

                <div className="pt-4 pb-6">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                  >
                    {loading
                      ? "Adding..."
                      : `Add ${role === "CUSTOMER" ? "Customer" : role === "INVESTOR" ? "Investor" : "Guarantor"}`}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )

}
