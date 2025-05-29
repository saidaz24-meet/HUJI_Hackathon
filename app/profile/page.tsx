"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTheme } from "@/hooks/use-theme"
import { ArrowLeft, Moon, Sun, Save, Upload, X, Shield, Camera, Lock, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface ProfileData {
  fullName: string
  phoneNumber: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  signature: string | null // Base64 encoded image
}

export default function ProfilePage() {
  const { darkMode, setDarkMode } = useTheme()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    phoneNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
    },
    signature: null,
  })
  const [isMounted, setIsMounted] = useState(false)

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    setIsMounted(true)
    const storedProfile = localStorage.getItem("shamanUserProfile")
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile)
        setProfileData(parsed)
      } catch (error) {
        console.error("Error parsing stored profile:", error)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1]
      setProfileData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }))
    } else {
      setProfileData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64String = event.target?.result as string
      setProfileData((prev) => ({ ...prev, signature: base64String }))
    }
    reader.readAsDataURL(file)
  }

  const removeSignature = () => {
    setProfileData((prev) => ({ ...prev, signature: null }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSaveProfile = () => {
    if (!isMounted) return

    // Basic validation
    if (!profileData.fullName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your full name",
        variant: "destructive",
      })
      return
    }

    localStorage.setItem("shamanUserProfile", JSON.stringify(profileData))
    toast({
      title: "Profile Saved",
      description: "Your profile information has been updated locally.",
    })
  }

  const handleChangePassword = () => {
    if (!passwordData.currentPassword.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your current password",
        variant: "destructive",
      })
      return
    }

    if (!passwordData.newPassword.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a new password",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      })
      return
    }

    // Simulate password change
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    })

    // Clear password fields
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 transition-colors duration-300 flex flex-col">
      <Toaster />
      {/* Header */}
      <header className="container mx-auto px-8 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-stone-800 dark:bg-stone-200 rounded-sm transition-colors duration-300"></div>
            <span className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Shaman</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Profile Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          <div className="bg-white dark:bg-stone-800 rounded-3xl shadow-xl border border-stone-100 dark:border-stone-700 overflow-hidden transition-colors duration-300">
            <div className="px-8 sm:px-10 pt-10 pb-8 text-center">
              <h1 className="text-4xl font-extralight text-stone-900 dark:text-stone-100 mb-3 tracking-tight">
                Your Profile
              </h1>
              <p className="text-stone-600 dark:text-stone-300 font-light">
                Complete your profile to enable automatic document filling and signing
              </p>
            </div>

            {/* Privacy Notice */}
            <div className="mx-8 sm:mx-10 mb-8 bg-stone-50 dark:bg-stone-700/50 rounded-xl p-4 border border-stone-200 dark:border-stone-600">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-stone-600 dark:text-stone-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">Privacy & Security</h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    We only store your email and hashed password on our servers. All personal information below is
                    stored locally in your browser and never transmitted to our servers.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-8 sm:px-10 pb-10 space-y-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-700 pb-2">
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5"
                    >
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={profileData.fullName}
                      onChange={handleInputChange}
                      className="h-12 px-4 text-base rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 focus:ring-2 focus:ring-stone-800 dark:focus:ring-stone-200 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={profileData.phoneNumber}
                      onChange={handleInputChange}
                      className="h-12 px-4 text-base rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 focus:ring-2 focus:ring-stone-800 dark:focus:ring-stone-200 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-700 pb-2">
                  Address
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="address.street"
                      className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5"
                    >
                      Street Address
                    </Label>
                    <Input
                      id="address.street"
                      name="address.street"
                      type="text"
                      placeholder="123 Main Street"
                      value={profileData.address.street}
                      onChange={handleInputChange}
                      className="h-12 px-4 text-base rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 focus:ring-2 focus:ring-stone-800 dark:focus:ring-stone-200 transition-all duration-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label
                        htmlFor="address.city"
                        className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5"
                      >
                        City
                      </Label>
                      <Input
                        id="address.city"
                        name="address.city"
                        type="text"
                        placeholder="New York"
                        value={profileData.address.city}
                        onChange={handleInputChange}
                        className="h-12 px-4 text-base rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 focus:ring-2 focus:ring-stone-800 dark:focus:ring-stone-200 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="address.state"
                        className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5"
                      >
                        State
                      </Label>
                      <Input
                        id="address.state"
                        name="address.state"
                        type="text"
                        placeholder="NY"
                        value={profileData.address.state}
                        onChange={handleInputChange}
                        className="h-12 px-4 text-base rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 focus:ring-2 focus:ring-stone-800 dark:focus:ring-stone-200 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="address.zipCode"
                        className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5"
                      >
                        ZIP Code
                      </Label>
                      <Input
                        id="address.zipCode"
                        name="address.zipCode"
                        type="text"
                        placeholder="10001"
                        value={profileData.address.zipCode}
                        onChange={handleInputChange}
                        className="h-12 px-4 text-base rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 focus:ring-2 focus:ring-stone-800 dark:focus:ring-stone-200 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="address.country"
                      className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5"
                    >
                      Country
                    </Label>
                    <Input
                      id="address.country"
                      name="address.country"
                      type="text"
                      placeholder="United States"
                      value={profileData.address.country}
                      onChange={handleInputChange}
                      className="h-12 px-4 text-base rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 focus:ring-2 focus:ring-stone-800 dark:focus:ring-stone-200 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Signature */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-700 pb-2">
                  Digital Signature
                </h2>

                <div className="space-y-4">
                  {profileData.signature ? (
                    <div className="space-y-4">
                      <div className="bg-stone-50 dark:bg-stone-700 rounded-xl p-6 border border-stone-200 dark:border-stone-600">
                        <div className="flex items-center justify-between mb-4">
                          <Label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                            Current Signature
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeSignature}
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                        <div className="bg-white dark:bg-stone-800 rounded-lg p-4 border border-stone-200 dark:border-stone-600">
                          <img
                            src={profileData.signature || "/placeholder.svg"}
                            alt="Your signature"
                            className="max-h-24 mx-auto"
                            style={{ maxWidth: "100%" }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-stone-50 dark:bg-stone-700 rounded-xl p-6 border-2 border-dashed border-stone-300 dark:border-stone-600 text-center">
                        <Camera className="w-12 h-12 mx-auto mb-4 text-stone-400 dark:text-stone-500" />
                        <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
                          Upload Your Signature
                        </h3>
                        <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
                          Upload an image of your signature for automatic document signing
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleSignatureUpload}
                          className="hidden"
                        />
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-stone-800 dark:bg-stone-200 hover:bg-stone-900 dark:hover:bg-stone-100 text-white dark:text-stone-900"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Image
                        </Button>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
                          Supported formats: PNG, JPG, GIF (max 2MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-700 pb-2">
                  Security
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5"
                    >
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="h-12 px-4 pr-12 text-base rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 focus:ring-2 focus:ring-stone-800 dark:focus:ring-stone-200 transition-all duration-300"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePasswordVisibility("current")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-600"
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5"
                      >
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          placeholder="Enter new password"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="h-12 px-4 pr-12 text-base rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 focus:ring-2 focus:ring-stone-800 dark:focus:ring-stone-200 transition-all duration-300"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility("new")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-600"
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5"
                      >
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="h-12 px-4 pr-12 text-base rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 focus:ring-2 focus:ring-stone-800 dark:focus:ring-stone-200 transition-all duration-300"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility("confirm")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    variant="outline"
                    className="w-full h-12 border-stone-200 dark:border-stone-600 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 text-base font-medium rounded-xl transition-all duration-300"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </div>

              {/* Save Profile Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSaveProfile}
                  className="w-full h-12 bg-stone-800 dark:bg-stone-200 hover:bg-stone-900 dark:hover:bg-stone-100 text-white dark:text-stone-900 text-base font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
