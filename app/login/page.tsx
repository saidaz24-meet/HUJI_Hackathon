// app/login/page.tsx
"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Moon, Sun, ArrowLeft, Loader2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useTheme } from "@/hooks/use-theme"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "../contexts/auth-context"

export default function LoginPage() {
  const { darkMode, setDarkMode } = useTheme()
  const [isSignUp, setIsSignUp] = useState(false)
  const [emailConsent, setEmailConsent] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { signIn, signUp, signInWithGoogle, setUserEmailConsent } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const MAX_EMAIL_LENGTH = 96
  const MAX_PASSWORD_LENGTH = 128

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= MAX_PASSWORD_LENGTH) {
      setPassword(value)
    } else {
      toast({
        title: "Character limit reached",
        description: `Password is limited to ${MAX_PASSWORD_LENGTH} characters.`,
      })
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please provide both email and password.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      if (isSignUp) {
        await signUp(email, password)
        setUserEmailConsent(emailConsent)
        toast({
          title: "Account created",
          description: "Your account has been created successfully."
        })
      } else {
        await signIn(email, password, rememberMe)
        toast({
          title: "Welcome back",
          description: "You've successfully signed in."
        })
      }
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Authentication error:", error)

      // Format Firebase error messages to be more user-friendly
      let errorMessage = error.message
      if (errorMessage.includes("auth/wrong-password") || errorMessage.includes("auth/user-not-found")) {
        errorMessage = "Invalid email or password."
      } else if (errorMessage.includes("auth/email-already-in-use")) {
        errorMessage = "This email is already registered. Please sign in instead."
      } else if (errorMessage.includes("auth/weak-password")) {
        errorMessage = "Password should be at least 6 characters."
      } else if (errorMessage.includes("auth/invalid-email")) {
        errorMessage = "Please provide a valid email address."
      }

      toast({
        title: "Authentication failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)

    try {
      await signInWithGoogle(rememberMe)
      if (isSignUp) {
        setUserEmailConsent(emailConsent)
      }
      toast({
        title: "Welcome",
        description: "You've successfully signed in with Google."
      })
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Google sign in error:", error)

      // Format Google sign-in errors
      let errorMessage = error.message
      if (errorMessage.includes("popup-closed-by-user")) {
        errorMessage = "Sign in was cancelled."
      }

      toast({
        title: "Google sign in failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsGoogleLoading(false)
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
              <Link href="/">
                <Button
                    variant="ghost"
                    className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Login Form */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            {/* Form Container */}
            <div className="bg-white dark:bg-stone-800 rounded-3xl shadow-xl border border-stone-100 dark:border-stone-700 overflow-hidden transition-colors duration-300">
              {/* Form Header */}
              <div className="px-10 pt-10 pb-8 text-center">
                <h1 className="text-4xl font-extralight text-stone-900 dark:text-stone-100 mb-3 tracking-tight">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </h1>
                <p className="text-stone-600 dark:text-stone-300 font-light">
                  {isSignUp ? "Start simplifying your paperwork today" : "Sign in to continue to Shaman"}
                </p>
              </div>

              {/* Form Body */}
              <div className="px-10 pb-10">
                {/* Google Sign In */}
                <div className="mb-6">
                  <Button
                      variant="outline"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                      className="w-full h-12 text-base font-medium rounded-xl border-stone-200 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all duration-300 flex items-center justify-center"
                  >
                    {isGoogleLoading ? (
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    ) : (
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                          <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                    )}
                    Continue with Google
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200 dark:border-stone-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-medium">
                    Or continue with email
                  </span>
                  </div>
                </div>

                {/* Email Form */}
                <form
                    className="space-y-5"
                    onSubmit={handleFormSubmit}
                >
                  <div className="space-y-2">
                    <Label htmlFor="email" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                      Email Address
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={handleEmailChange}
                        maxLength={MAX_EMAIL_LENGTH}
                        required
                        className="h-12 px-4 text-base rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 focus:ring-2 focus:ring-stone-800 dark:focus:ring-stone-200 transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                        Password
                      </Label>
                      {!isSignUp && (
                          <Link href="/forgot-password">
                        <span className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium transition-colors duration-300">
                          Forgot password?
                        </span>
                          </Link>
                      )}
                    </div>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={handlePasswordChange}
                        maxLength={MAX_PASSWORD_LENGTH}
                        required
                        className="h-12 px-4 text-base rounded-xl border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 focus:ring-2 focus:ring-stone-800 dark:focus:ring-stone-200 transition-all duration-300"
                    />
                  </div>

                  {!isSignUp && (
                      <div className="flex items-start space-x-3 pt-1">
                        <Checkbox
                            id="rememberMe"
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                            className="mt-0.5 border-stone-300 dark:border-stone-600 data-[state=checked]:bg-stone-800 dark:data-[state=checked]:bg-stone-200 data-[state=checked]:text-white dark:data-[state=checked]:text-stone-900"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label
                              htmlFor="rememberMe"
                              className="text-sm font-medium text-stone-700 dark:text-stone-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Remember me
                          </Label>
                          <p className="text-xs text-stone-500 dark:text-stone-400">
                            Stay signed in on this device
                          </p>
                        </div>
                      </div>
                  )}

                  {isSignUp && (
                      <div className="flex items-start space-x-3 pt-1">
                        <Checkbox
                            id="emailConsent"
                            checked={emailConsent}
                            onCheckedChange={(checked) => setEmailConsent(checked as boolean)}
                            className="mt-0.5 border-stone-300 dark:border-stone-600 data-[state=checked]:bg-stone-800 dark:data-[state=checked]:bg-stone-200 data-[state=checked]:text-white dark:data-[state=checked]:text-stone-900"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label
                              htmlFor="emailConsent"
                              className="text-sm font-medium text-stone-700 dark:text-stone-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Email Permission
                          </Label>
                          <p className="text-xs text-stone-500 dark:text-stone-400">
                            By signing up, you agree to allow Shaman to send emails on your behalf. You can opt-out by
                            unchecking this box.
                          </p>
                        </div>
                      </div>
                  )}

                  <div className="pt-2">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-stone-800 dark:bg-stone-200 hover:bg-stone-900 dark:hover:bg-stone-100 text-white dark:text-stone-900 text-base font-medium rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                      ) : isSignUp ? (
                          "Create Account"
                      ) : (
                          "Sign In"
                      )}
                    </Button>
                  </div>
                </form>

                {/* Switch between login/signup */}
                <div className="mt-6 text-center">
                <span className="text-stone-600 dark:text-stone-400">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}
                </span>
                  <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="ml-2 text-stone-800 dark:text-stone-200 hover:text-stone-900 dark:hover:text-stone-100 font-medium transition-colors duration-300"
                  >
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}