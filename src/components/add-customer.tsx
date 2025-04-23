"use client"

import type React from "react"
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, User, Mail, Phone, MapPin, Camera, CheckCircle2, Menu, Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import Sidebaar from "./Sidebaar"
import { useDispatch, useSelector } from "react-redux"
import { setIsAuthenticated, setSidebarOpen } from "@/redux/appSlice"
import { ThemeToggle } from "./theme/theme-toggle"
import { userData } from "./api/installments"
import { useNavigate } from "react-router-dom"
import { Avatar } from "./ui/avatar"
import { supabase } from "@/lib/supabaseClient"

// Create a dynamic schema based on user type
const createFormSchema = (userType: string) => {
  // Base schema with common fields
  const baseSchema = {
    userType: z.string().min(1, { message: "Please select a user type" }),
    username: z.string().min(3, { message: "Username must be at least 3 characters" }),
    contactNumber: z.string().min(10, { message: "Please enter a valid contact number" }),
    profilePicture: z.instanceof(File).refine((file) => file.size > 0, {
      message: "Profile picture is required",
    }),
  }

  // Conditional fields based on user type
  if (userType === "customer") {
    return z.object({
      ...baseSchema,
      email: z.string().email({ message: "Please enter a valid email address" }),
      address: z.string().min(10, { message: "Please enter your full address" }),
      cnicFrontImage: z.instanceof(File).refine((file) => file.size > 0, {
        message: "CNIC front image is required",
      }),
      cnicBackImage: z.instanceof(File).refine((file) => file.size > 0, {
        message: "CNIC back image is required",
      }),
    })
  } else {
    return z.object({
      ...baseSchema,
      email: z.string().email({ message: "Please enter a valid email address" }).optional().or(z.literal("")),
      address: z.string().optional().or(z.literal("")),
      cnicFrontImage: z.instanceof(File).optional(),
      cnicBackImage: z.instanceof(File).optional(),
    })
  }
}

export function RegistrationForm() {
  // Update the state to track image URLs
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [profileUrl, setProfileUrl] = useState<string | null>(null)
  const [cnicFrontPreview, setCnicFrontPreview] = useState<string | null>(null)
  const [cnicFrontUrl, setCnicFrontUrl] = useState<string | null>(null)
  const [cnicBackPreview, setCnicBackPreview] = useState<string | null>(null)
  const [cnicBackUrl, setCnicBackUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const isMobile = useSelector((state: any) => state.app.isMobile)
  const sidebarOpen = useSelector((state: any) => state.app.sideBarOpen)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [userType, setUserType] = useState("customer")

  // Initialize form with default schema
  const form = useForm<any>({
    resolver: zodResolver(createFormSchema(userType)),
    defaultValues: {
      userType: "customer",
      username: "",
      email: "",
      contactNumber: "",
      address: "",
    },
  })

  // Update validation schema when user type changes
  useEffect(() => {
    form.setValue("userType", userType)
    form.clearErrors()
  }, [userType, form])

  // Replace the handleImageUpload function with this enhanced version
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
    setPreview: (value: string | null) => void,
    setUrl: (value: string | null) => void,
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Set form value
    form.setValue(fieldName, file)

    // Create local preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    try {
      // Upload to Supabase
      const fileName = `${fieldName}_${Date.now()}.${file.name.split(".").pop()}`
      const { data, error } = await supabase.storage
        .from("restaurant-images") // Replace with your bucket name
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true,
        })

      if (error) {
        console.error("Upload error:", error.message)
        return
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("restaurant-images").getPublicUrl(fileName)

      // Store URL in state
      const publicUrl = urlData.publicUrl
      setUrl(publicUrl)
      console.log(`${fieldName} uploaded successfully:`, publicUrl)
    } catch (error) {
      console.error("Error in upload process:", error)
    }
  }

  // Update the onSubmit function to include image URLs in localStorage
  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    
  
    try {
      const activeSince = new Date()
  
      const userData = {
        ...data,
        id: uuidv4(),
        profilePicture: profileUrl,
        cnicFrontImage: cnicFrontUrl,
        cnicBackImage: cnicBackUrl,
        userType: userType,
        activeSince: activeSince,
        status: "Inactive",
      }
  
      // ⬇️ Get existing users from localStorage
      const existingUsers = JSON.parse(localStorage.getItem("userData") || "[]")
  
      // ⬇️ Add the new user to the array
      const updatedUsers = [...existingUsers, userData]
  
      // ⬇️ Save the updated array back to localStorage
      localStorage.setItem("userData", JSON.stringify(updatedUsers))
  
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
  
      console.log("Form submitted:", userData)
  
      setIsSubmitting(false)
      setIsSuccess(true)
  
      // Reset form after success message
      setTimeout(() => {
        form.reset()
        setProfilePreview(null)
        setProfileUrl(null)
        setCnicFrontPreview(null)
        setCnicFrontUrl(null)
        setCnicBackPreview(null)
        setCnicBackUrl(null)
        setIsSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setIsSubmitting(false)
    }
  }
  
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="flex h-screen overflow-hidden">
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => dispatch(setSidebarOpen(false))} />
        )}

        <Sidebaar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-auto">
          {/* Header */}
          <header className="h-16 border-b border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/30 backdrop-blur-md flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dispatch(setSidebarOpen(true))}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white md:hidden"
                >
                  <Menu size={20} />
                </Button>
              )}
              <div className="relative w-full md:w-64"></div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full"></span>
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-cyan-500">
                  <div className="bg-gradient-to-br from-purple-500 to-cyan-500 w-full h-full">
                    <img
                      src={userData.profile || "/placeholder.svg"}
                      alt="User Avatar"
                      className="object-center object-cover"
                    />
                  </div>
                </Avatar>
                <Button
                  onClick={() => {
                    dispatch(setIsAuthenticated(false)), navigate("/auth")
                  }}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          {/* <div className="min-h-screen h-auto  bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 "> */}
          <div className="w-full max-w-4xl flex flex-col items-center justify-center mx-auto mt-8 pb-4">
            <div className="text-center h-auto m-8">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
                User Registration
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Join our platform as a Customer or Investor</p>
            </div>
            <AnimatePresence>
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 border border-green-200 dark:border-green-900"
                >
                  <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">Registration Successful!</h2>
                  <p className="text-slate-600 dark:text-slate-300 mt-2 text-center">
                    Your account has been created successfully. You will be redirected shortly.
                  </p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                  <Card className="overflow-hidden p-0 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
                    <CardContent className="p-0">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          {/* User Type Selection */}
                          <div className="flex overflow-hidden rounded-t-lg">
                            <button
                              type="button"
                              onClick={() => setUserType("customer")}
                              className={cn(
                                "flex-1 py-4 px-4 text-center transition-all duration-300",
                                userType === "customer"
                                  ? "bg-violet-600 text-white font-medium"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700",
                              )}
                            >
                              Customer
                            </button>
                            <button
                              type="button"
                              onClick={() => setUserType("investor")}
                              className={cn(
                                "flex-1 py-4 px-4 text-center transition-all duration-300",
                                userType === "investor"
                                  ? "bg-cyan-600 text-white font-medium"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700",
                              )}
                            >
                              Investor
                            </button>
                          </div>

                          <div className="p-6 space-y-8">
                            {/* Profile Picture Upload */}
                            <div className="flex flex-col items-center">
                              <FormField
                                control={form.control}
                                name="profilePicture"
                                render={({ field: { onChange, value, ...field } }) => (
                                  <FormItem className="w-full flex flex-col items-center">
                                    <FormLabel className="text-center mb-2">Profile Picture</FormLabel>
                                    <div
                                      className={cn(
                                        "group relative w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center mb-2 overflow-hidden transition-all duration-300",
                                        profilePreview
                                          ? "border-violet-500 dark:border-violet-400"
                                          : "border-slate-300 dark:border-slate-700",
                                      )}
                                    >
                                      {profilePreview ? (
                                        <img
                                          src={profilePreview || "/placeholder.svg"}
                                          alt="Profile"
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <Camera className="h-10 w-10 text-slate-400 dark:text-slate-600" />
                                      )}
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <p className="text-white text-xs">Change photo</p>
                                      </div>
                                    </div>
                                    <Label
                                      htmlFor="profile-image"
                                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 text-white rounded-full text-sm font-medium transition-colors"
                                    >
                                      <Upload className="mr-2 h-4 w-4" />
                                      Upload Photo
                                    </Label>
                                    {/* Update the profile picture upload call */}
                                    <Input
                                      id="profile-image"
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) =>
                                        handleImageUpload(e, "profilePicture", setProfilePreview, setProfileUrl)
                                      }
                                      {...field}
                                    />
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                        <Input
                                          placeholder="johndoe"
                                          className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-violet-500 dark:focus:ring-violet-400"
                                          {...field}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Email
                                      {userType === "investor" && (
                                        <span className="text-slate-400 dark:text-slate-500 text-xs ml-2">
                                          (Optional)
                                        </span>
                                      )}
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                        <Input
                                          placeholder="email@example.com"
                                          className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-violet-500 dark:focus:ring-violet-400"
                                          {...field}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="contactNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Contact Number</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                        <Input
                                          placeholder="+1234567890"
                                          className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-violet-500 dark:focus:ring-violet-400"
                                          {...field}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Address
                                      {userType === "investor" && (
                                        <span className="text-slate-400 dark:text-slate-500 text-xs ml-2">
                                          (Optional)
                                        </span>
                                      )}
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                        <Textarea
                                          placeholder="Enter your full address"
                                          className="pl-10 min-h-[80px] bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-violet-500 dark:focus:ring-violet-400"
                                          {...field}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* CNIC Images */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                                CNIC Images
                                {userType === "investor" && (
                                  <span className="text-slate-400 dark:text-slate-500 text-xs ml-2">(Optional)</span>
                                )}
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                  control={form.control}
                                  name="cnicFrontImage"
                                  render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                      <FormLabel>CNIC Front</FormLabel>
                                      <FormControl>
                                        <div className="space-y-2">
                                          <div
                                            className={cn(
                                              "h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center overflow-hidden transition-all duration-300",
                                              cnicFrontPreview
                                                ? "border-violet-500 dark:border-violet-400"
                                                : "border-slate-300 dark:border-slate-700",
                                            )}
                                          >
                                            {cnicFrontPreview ? (
                                              <img
                                                src={cnicFrontPreview || "/placeholder.svg"}
                                                alt="CNIC Front"
                                                className="w-full h-full object-contain p-2"
                                              />
                                            ) : (
                                              <div className="flex flex-col items-center text-center p-4">
                                                <Upload className="h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                  Upload CNIC front image
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                          <Label
                                            htmlFor="cnic-front"
                                            className="cursor-pointer inline-flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 text-white rounded-md text-sm font-medium transition-colors"
                                          >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload Front
                                          </Label>
                                          {/* Update the CNIC front image upload call */}
                                          <Input
                                            id="cnic-front"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) =>
                                              handleImageUpload(
                                                e,
                                                "cnicFrontImage",
                                                setCnicFrontPreview,
                                                setCnicFrontUrl,
                                              )
                                            }
                                            {...field}
                                          />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="cnicBackImage"
                                  render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                      <FormLabel>CNIC Back</FormLabel>
                                      <FormControl>
                                        <div className="space-y-2">
                                          <div
                                            className={cn(
                                              "h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center overflow-hidden transition-all duration-300",
                                              cnicBackPreview
                                                ? "border-violet-500 dark:border-violet-400"
                                                : "border-slate-300 dark:border-slate-700",
                                            )}
                                          >
                                            {cnicBackPreview ? (
                                              <img
                                                src={cnicBackPreview || "/placeholder.svg"}
                                                alt="CNIC Back"
                                                className="w-full h-full object-contain p-2"
                                              />
                                            ) : (
                                              <div className="flex flex-col items-center text-center p-4">
                                                <Upload className="h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                  Upload CNIC back image
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                          <Label
                                            htmlFor="cnic-back"
                                            className="cursor-pointer inline-flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 text-white rounded-md text-sm font-medium transition-colors"
                                          >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload Back
                                          </Label>
                                          {/* Update the CNIC back image upload call */}
                                          <Input
                                            id="cnic-back"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) =>
                                              handleImageUpload(e, "cnicBackImage", setCnicBackPreview, setCnicBackUrl)
                                            }
                                            {...field}
                                          />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            {/* Form Submission */}
                            <div className="pt-4">
                              <Button
                                type="submit"
                                className="w-full py-6 text-lg bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 dark:from-violet-700 dark:to-cyan-700 dark:hover:from-violet-600 dark:hover:to-cyan-600 transition-all duration-300"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                    Processing...
                                  </div>
                                ) : (
                                  "Register Account"
                                )}
                              </Button>

                              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
                                By registering, you agree to our Terms of Service and Privacy Policy
                              </p>
                            </div>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
