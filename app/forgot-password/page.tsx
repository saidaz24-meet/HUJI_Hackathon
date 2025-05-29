// app/forgot-password/page.tsx
"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Moon, Sun, ArrowLeft, Loader2, Check, Mail } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useTheme } from "@/hooks/use-theme"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "../contexts/auth-context"

export default function ForgotPasswordPage() {
  const { darkMode, setDarkMode } = useTheme()
  const { toast } = useToast()
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const MAX_EMAIL_LENGTH = 96

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= MAX_EMAIL_LENGTH) {
      setEmail(value)
    } else {
      toast({
        title: "Character limit reached",
        description: `Email is limited to ${MAX_EMAIL_LENGTH} characters.`,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      await resetPassword(email)
      setIsSuccess(true)
      toast({
        title: "Reset email sent",
        description: "Check your inbox for a password reset link.",
      })
    } catch (error: any) {
      console.error("Password reset error:", error)

      let errorMessage = error.message
      if (errorMessage.includes("auth/user-not-found")) {
        errorMessage = "No account found with this email address."
      } else if (errorMessage.includes("auth/invalid-email")) {
        errorMessage = "Please provide a valid email address."
      }

      toast({
        title: "Reset failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 transition-colors duration-300 flex flex-col">
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
              <Link href="/login">
                <Button
                    variant="ghost"
                    className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Password Reset Form */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            {/* Form Container */}
            <div className="bg-white dark:bg-stone-800 rounded-3xl shadow-xl border border-stone-100 dark:border-stone-700 overflow-hidden transition-colors duration-300">
              {/* Form Header */}
              <div className="px-10 pt-10 pb-8 text-center">
                <div className="w-16 h-16 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-stone-600 dark:text-stone-300" />
                </div>
                <h1 className="text-3xl font-extralight text-stone-900 dark:text-stone-100 mb-3 tracking-tight">
                  Reset Password
                </h1>
                <p className="text-stone-600 dark:text-stone-300 font-light">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Form Body */}
              <div className="px-10 pb-10">
                {isSuccess ? (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-2">
                        Check Your Email
                      </h3>
                      <p className="text-stone-600 dark:text-stone-300 mb-6">
                        We've sent a password reset link to <strong>{email}</strong>
                      </p>
                      <div className="space-y-4">
                        <Link href="/login">
                          <Button
                              variant="outline"
                              className="w-full h-12 border-stone-200 dark:border-stone-600 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 text-base font-medium rounded-xl transition-all duration-300"
                          >
                            Back to Login
                          </Button>
                        </Link>
                        <button
                            onClick={() => setIsSuccess(false)}
                            className="w-full text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium transition-colors duration-300"
                        >
                          Didn't receive the email? Try again
                        </button>
                      </div>
                    </div>
                ) : (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                          Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            placeholder="Enter your email"
                            required
                            maxLength={MAX_EMAIL_LENGTH}
                            className="h-12 px-4 text-base rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 focus:ring-2 focus:ring-stone-800 dark:focus:ring-stone-200 transition-all duration-300"
                        />
                      </div>

                      <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full h-12 bg-stone-800 dark:bg-stone-200 hover:bg-stone-900 dark:hover:bg-stone-100 text-white dark:text-stone-900 text-base font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
                      </Button>

                      <div className="mt-6 text-center">
                        <Link href="/login">
                      <span className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium transition-colors duration-300">
                        Remember your password? Sign in
                      </span>
                        </Link>
                      </div>
                    </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}