"use client";
import React from "react";
import { useState, useRef } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "./theme/theme-toggle";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Edit,
  Save,
  X,
  Upload,
  Bell,
  Menu,
  IdCard,
} from "lucide-react";
import Sidebaar from "./Sidebaar";
import { useDispatch, useSelector } from "react-redux";
import { setSidebarOpen } from "@/redux/appSlice";
import { userData } from "./api/installments";

// Sample user data - in a real app, this would come from an API or database


export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [tempUserData, setTempUserData] = useState(userData);
  const isMobile = useSelector((state: any) => state.app.isMobile);
  const sidebarCollapsed = useSelector((state: any) => state.app.sideBarCollapsed);
  const sidebarOpen = useSelector((state: any) => state.app.sideBarOpen);
  const { toast } = useToast();
  const dispatch = useDispatch();
  // Refs for file inputs
  const profileImageRef = useRef(null);
  const cnicFrontRef = useRef(null);
  const cnicBackRef = useRef(null);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setTempUserData(userData);
      setIsEditing(false);
    } else {
      // Start editing
      setTempUserData(userData);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    // setUserData(tempUserData);
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setTempUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e: any, imageType: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTempUserData((prev) => ({
            ...prev,
            [imageType]: event.target?.result,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = (ref: any) => {
    ref.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="flex h-screen overflow-hidden">
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => dispatch(setSidebarOpen(false))}
          />
        )}

        {/* Sidebar - Mobile: full slide in, Desktop: collapsible */}

        <Sidebaar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
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
              <h1 className="text-lg font-semibold hidden md:block">Profile</h1>
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
                  <div className="bg-gradient-to-br from-purple-500 to-cyan-500 w-full h-full"></div>
                </Avatar>
                <span className="text-sm font-medium hidden md:inline-block">
                  Admin
                </span>
              </div>
            </div>
          </header>

          {/* Profile Content */}
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-5xl mx-auto">
              {/* Main Profile Card */}
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 overflow-hidden mb-6">
                <CardHeader className="relative pb-0">
                  <div className="absolute top-4 right-4 flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleSave}
                          size="sm"
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          onClick={handleEditToggle}
                          size="sm"
                          variant="outline"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={handleEditToggle}
                        size="sm"
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                  <br></br>
                  <div className="flex flex-col items-center">
                    <div className="relative group">
                      <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-700 shadow-lg mb-4 overflow-hidden">
                        <img
                          src={
                            isEditing
                              ? tempUserData.profile
                              : userData.profile
                          }
                          alt="Profile"
                          className="object-cover w-full h-full"
                        />
                      </Avatar>
                      {isEditing && (
                        <div
                          className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          onClick={() => triggerFileInput(profileImageRef)}
                        >
                          <Upload className="h-8 w-8 text-white" />
                          <input
                            type="file"
                            ref={profileImageRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageUpload(e, "profileImage")
                            }
                          />
                        </div>
                      )}
                    </div>
                    {isEditing ? (
                      <Input
                        name="name"
                        value={tempUserData.username}
                        onChange={handleInputChange}
                        className="text-center text-2xl font-bold bg-transparent border-b border-slate-300 dark:border-slate-600 w-auto max-w-xs"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-500 bg-clip-text text-transparent">
                        {userData.username}
                      </h2>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-6 pb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
                        Contact Information
                      </h3>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="flex items-center text-slate-500 dark:text-slate-400">
                            <Mail className="h-4 w-4 mr-2" />
                            Email Address
                          </Label>
                          {isEditing ? (
                            <Input
                              name="email"
                              value={tempUserData.email}
                              onChange={handleInputChange}
                              className="bg-slate-100/50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600"
                            />
                          ) : (
                            <p className="text-slate-900 dark:text-white pl-6">
                              {userData.email}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center text-slate-500 dark:text-slate-400">
                            <Phone className="h-4 w-4 mr-2" />
                            Phone Number
                          </Label>
                          {isEditing ? (
                            <Input
                              name="contact"
                              value={tempUserData.contact}
                              onChange={handleInputChange}
                              className="bg-slate-100/50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600"
                            />
                          ) : (
                            <p className="text-slate-900 dark:text-white pl-6">
                              {userData.contact}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center text-slate-500 dark:text-slate-400">
                            <IdCard className="h-4 w-4 mr-2" />
                            CNIC Number
                          </Label>
                            <p className="text-slate-900 dark:text-white pl-6">
                              {userData.cnicNumber}
                            </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center text-slate-500 dark:text-slate-400">
                            <MapPin className="h-4 w-4 mr-2" />
                            Address
                          </Label>
                          {isEditing ? (
                            <Textarea
                              name="address"
                              value={tempUserData.address}
                              onChange={handleInputChange}
                              className="bg-slate-100/50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600 min-h-[100px]"
                            />
                          ) : (
                            <p className="text-slate-900 dark:text-white pl-6">
                              {userData.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* CNIC Documents */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        CNIC Documents
                      </h3>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="text-slate-500 dark:text-slate-400">
                            CNIC Front
                          </Label>
                          <div className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                            <img
                              src={
                                isEditing
                                  ? tempUserData.cnicFront
                                  : userData.cnicFront
                              }
                              alt="CNIC Front"
                              className="w-full h-auto object-cover"
                            />
                            {isEditing && (
                              <div
                                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={() => triggerFileInput(cnicFrontRef)}
                              >
                                <Upload className="h-8 w-8 text-white" />
                                <input
                                  type="file"
                                  ref={cnicFrontRef}
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleImageUpload(e, "cnicFront")
                                  }
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-500 dark:text-slate-400">
                            CNIC Back
                          </Label>
                          <div className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                            <img
                              src={
                                isEditing
                                  ? tempUserData.cnicBack
                                  : userData.cnicBack
                              }
                              alt="CNIC Back"
                              className="w-full h-auto object-cover"
                            />
                            {isEditing && (
                              <div
                                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={() => triggerFileInput(cnicBackRef)}
                              >
                                <Upload className="h-8 w-8 text-white" />
                                <input
                                  type="file"
                                  ref={cnicBackRef}
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleImageUpload(e, "cnicBack")
                                  }
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {isEditing && (
                  <CardFooter className="border-t border-slate-200 dark:border-slate-700 pt-4 flex justify-end">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </CardFooter>
                )}
              </Card>

              {/* Additional Information Card */}
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   
                    <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 border border-purple-200/50 dark:border-purple-800/30">
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Member Since
                      </div>
                      <div className="text-lg font-medium text-purple-600 dark:text-purple-400">
                        {userData && userData.activeSince}
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5 border border-amber-200/50 dark:border-amber-800/30">
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Account Type
                      </div>
                      <div className="text-lg font-medium text-amber-600 dark:text-amber-400">
                        Investor
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
