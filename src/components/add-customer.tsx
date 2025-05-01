"use client"

import type React from "react"
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Menu, Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import Sidebaar from "./Sidebaar"
import { useDispatch, useSelector } from "react-redux"
import { setIsAuthenticated, setSidebarOpen } from "@/redux/appSlice"
import { ThemeToggle } from "./theme/theme-toggle"
import { userData } from "./api/installments"
import { useNavigate } from "react-router-dom"
import { Avatar } from "./ui/avatar"
import { supabase } from "@/lib/supabaseClient"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle } from "lucide-react"
import UserList, { User } from "./ui/user-list";
import AddGuarantorForm from "./ui/add-guarantor-form";

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

const customers: User[] = [
  {
    id: "1",
    name: "Alex Johnson",
    profileImage: "/placeholder.svg?height=100&width=100",
    activeSince: "Jan 2023",
    type: "Customer",
  },
  {
    id: "2",
    name: "Sarah Williams",
    profileImage: "/placeholder.svg?height=100&width=100",
    activeSince: "Mar 2023",
    type: "Customer",
  },
]

const investors: User[] = [
  {
    id: "3",
    name: "Michael Chen",
    profileImage: "/placeholder.svg?height=100&width=100",
    activeSince: "Feb 2022",
    type: "Investor",
  },
  {
    id: "4",
    name: "Emma Rodriguez",
    profileImage: "/placeholder.svg?height=100&width=100",
    activeSince: "Nov 2022",
    type: "Investor",
  },
]

const guarantors: User[] = [
  {
    id: "5",
    name: "David Kim",
    profileImage: "/placeholder.svg?height=100&width=100",
    activeSince: "Apr 2023",
    type: "Guarantor",
  },
]

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
  const [showAddGuarantor, setShowAddGuarantor] = useState(false)
  const [activeTab, setActiveTab] = useState("customer")
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
          {/* <div className="w-full max-w-4xl flex flex-col items-center justify-center mx-auto mt-8 pb-4"> */}
          <div className="relative flex flex-col lg:flex-row gap-6  bg-white/80 dark:bg-slate-800/30 rounded-xl border  mt-8 mx-6 border-slate-200 dark:border-slate-700/50 p-1 shadow-lg">
      <div className={`flex-1 transition-all duration-300 ${showAddGuarantor ? "lg:w-2/3" : "w-full"}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 p-4">
          <h2 className="text-2xl font-semibold mb-2 md:mb-0">Users</h2>
          <Button
            onClick={() => setShowAddGuarantor(true)}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Guarantor
          </Button>
        </div>

        <Tabs defaultValue="customer" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6 mx-4">
            <TabsTrigger value="customer">Customers</TabsTrigger>
            <TabsTrigger value="investor">Investors</TabsTrigger>
            <TabsTrigger value="guarantor">Guarantors</TabsTrigger>
          </TabsList>

          <TabsContent value="customer">
            <UserList users={customers} />
          </TabsContent>

          <TabsContent value="investor">
            <UserList users={investors} />
          </TabsContent>

          <TabsContent value="guarantor">
            <UserList users={guarantors} />
          </TabsContent>
        </Tabs>
      </div>

      {showAddGuarantor && (
        <div className="lg:w-1/3 bg-card rounded-lg border border-border shadow-lg transition-all duration-300 ease-in-out">
          <AddGuarantorForm onClose={() => setShowAddGuarantor(false)} />
        </div>
      )}
    </div>
                </div>
                </div>
                </div>
                // </div>
  )
}
