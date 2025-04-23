"use client";

import React from "react";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Eye,
  EyeOff,
  Upload,
  User,
  Mail,
  Phone,
  CreditCard,
  Camera,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { setIsAuthenticated } from "@/redux/appSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { userData } from "../api/installments";

// Sign-in form schema
const signInFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password must not be longer than 100 characters" }),
});

// Sign-up form schema
const signUpFormSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(50, { message: "Username must not be longer than 50 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    contact: z
      .string()
      .min(10, { message: "Contact number must be at least 10 digits" })
      .max(15, { message: "Contact number must not be longer than 15 digits" }),
    cnicNumber: z
      .string()
      .min(13, { message: "CNIC number must be at least 13 digits" })
      .max(15, { message: "CNIC number must not be longer than 15 digits" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(100, { message: "Password must not be longer than 100 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function AuthForms() {
  const [activeTab, setActiveTab] = useState("signin");
  const { toast } = useToast();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
            Welcome to Our Platform
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Sign in to your account or create a new one
          </p>
        </div>
        <Tabs
          defaultValue="signin"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-md mx-auto"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <SignInForm onSuccess={() => setActiveTab("signup")} />
          </TabsContent>
          <TabsContent value="signup">
            <SignUpForm onSuccess={() => setActiveTab("signin")} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof signInFormSchema>) {
    

    if (data.email !== userData.email || data.password !== userData.password) {
      toast({
        title: "Invalid credentials",
        description: "Please check your email and password",
        variant: "destructive",
      });
      return;
      
    }
    localStorage.setItem("user", JSON.stringify(data));
    dispatch(setIsAuthenticated(true));
    navigate("/");

    
    console.log(data);
    toast({
      title: "Sign in successful",
      description: "You have been signed in successfully.",
    });
    onSuccess();
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      <Input
                        placeholder="email@example.com"
                        className="pl-9 sm:pl-10 text-sm sm:text-base"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pr-10 text-sm sm:text-base"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center p-4 sm:p-6">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto text-xs sm:text-sm"
            onClick={() =>
              (
                document.querySelector('[data-value="signup"]') as HTMLElement
              )?.click()
            }
          >
            Sign up
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}

function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [cnicFrontImage, setCnicFrontImage] = useState<string | null>(null);
  const [cnicBackImage, setCnicBackImage] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      username: "",
      email: "",
      contact: "",
      cnicNumber: "",
      password: "",
      confirmPassword: "",
    },
  });
  function onSubmit(data: any) {
    // Validate that all required images are uploaded
    if (!profileImage || !cnicFrontImage || !cnicBackImage) {
      toast({
        title: "Missing images",
        description: "Please upload all required images",
        variant: "destructive",
      });
      return;
    }

    // In a real app, you would handle registration here
    console.log({ ...data, profileImage, cnicFrontImage, cnicBackImage });
    toast({
      title: "Account created",
      description: "Your account has been created successfully.",
    });
    onSuccess();
  }

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl">Create an Account</CardTitle>
        <CardDescription>
          Enter your details to create a new account
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Profile Image Upload */}
            <div className="mb-6 flex flex-col items-center">
              <Label className="self-start mb-2">Profile Picture</Label>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-dashed flex items-center justify-center mb-2 overflow-hidden",
                    profileImage ? "border-primary" : "border-muted-foreground"
                  )}
                >
                  {profileImage ? (
                    <img
                      src={profileImage || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                  )}
                </div>
                <Label
                  htmlFor="profile-image"
                  className="cursor-pointer inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium"
                >
                  <Upload className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                  Upload Photo
                </Label>
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, setProfileImage)}
                />
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        <Input
                          placeholder="johndoe"
                          className="pl-9 sm:pl-10 text-sm sm:text-base"
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        <Input
                          placeholder="email@example.com"
                          className="pl-9 sm:pl-10 text-sm sm:text-base"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        <Input
                          placeholder="+1234567890"
                          className="pl-9 sm:pl-10 text-sm sm:text-base"
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
                name="cnicNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNIC Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        <Input
                          placeholder="3520112345678"
                          className="pl-9 sm:pl-10 text-sm sm:text-base"
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
            <div className="grid grid-cols-1 gap-4 mt-4">
              <Label className="block mb-1">CNIC Images</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div
                    className={cn(
                      "h-32 sm:h-40 border-2 border-dashed rounded-md flex flex-col items-center justify-center mb-2",
                      cnicFrontImage
                        ? "border-primary"
                        : "border-muted-foreground"
                    )}
                  >
                    {cnicFrontImage ? (
                      <img
                        src={cnicFrontImage || "/placeholder.svg"}
                        alt="CNIC Front"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-1 sm:mb-2" />
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Upload CNIC front
                        </p>
                      </>
                    )}
                  </div>
                  <Label
                    htmlFor="cnic-front"
                    className="cursor-pointer inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium"
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                    Upload Front
                  </Label>
                  <Input
                    id="cnic-front"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, setCnicFrontImage)}
                  />
                </div>
                <div>
                  <div
                    className={cn(
                      "h-32 sm:h-40 border-2 border-dashed rounded-md flex flex-col items-center justify-center mb-2",
                      cnicBackImage
                        ? "border-primary"
                        : "border-muted-foreground"
                    )}
                  >
                    {cnicBackImage ? (
                      <img
                        src={cnicBackImage || "/placeholder.svg"}
                        alt="CNIC Back"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-1 sm:mb-2" />
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Upload CNIC back
                        </p>
                      </>
                    )}
                  </div>
                  <Label
                    htmlFor="cnic-back"
                    className="cursor-pointer inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded-md text-xs sm:text-sm font-medium"
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                    Upload Back
                  </Label>
                  <Input
                    id="cnic-back"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, setCnicBackImage)}
                  />
                </div>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pr-10 text-sm sm:text-base"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pr-10 text-sm sm:text-base"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                          <span className="sr-only">
                            {showConfirmPassword
                              ? "Hide password"
                              : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full mt-6">
              Create Account
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center p-4 sm:p-6">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto text-xs sm:text-sm"
            onClick={() =>
              (
                document.querySelector('[data-value="signin"]') as HTMLElement
              )?.click()
            }
          >
            Sign in
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
