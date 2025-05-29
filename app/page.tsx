"use client"

import { Button } from "@/components/ui/button"
import { FileText, MousePointer, CheckCircle, ArrowDown, Moon, Sun, MessageSquare, LogOut, Bell, User, FileSignature } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "@/hooks/use-theme"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function ShamanLanding() {
  const { darkMode, setDarkMode } = useTheme()
  const router = useRouter()
  const { user, signOut, isLoggedIn } = useAuth()
  const { toast } = useToast()
  const [openSignOutDialog, setOpenSignOutDialog] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      })
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 transition-colors duration-300">
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

              {isLoggedIn ? (
                  <>
                <span className="text-sm text-stone-700 dark:text-stone-300 hidden md:block">
                  Welcome, {user?.displayName || user?.email?.split('@')[0] || "User"}
                </span>
                    <Link href="/dashboard">
                      <Button
                          variant="ghost"
                          className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
                      >
                        <MessageSquare className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">Dashboard</span>
                      </Button>
                    </Link>
                    <Link href="/notifications">
                      <Button
                          variant="ghost"
                          className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800"
                      >
                        <Bell className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button
                          variant="ghost"
                          className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800"
                      >
                        <User className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSignOut}
                        className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 border-stone-200 dark:border-stone-700"
                    >
                      <LogOut className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Sign Out</span>
                    </Button>
                  </>
              ) : (
                  <Link href="/login">
                    <Button
                        variant="ghost"
                        className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
                    >
                      Login
                    </Button>
                  </Link>
              )}
            </div>
          </nav>
        </header>

        {/* Hero Section - Modified for logged-in users */}
        <section className="container mx-auto px-8 pt-16 pb-28">
          <div className="max-w-5xl mx-auto text-center">
            {isLoggedIn ? (
                <>
                  <div className="mb-8">
                    <h1 className="text-7xl md:text-8xl font-extralight text-stone-900 dark:text-stone-100 mb-8 tracking-tight leading-none">
                      Welcome
                      <br />
                      <span className="text-stone-500 dark:text-stone-400">back</span>
                    </h1>
                  </div>
                  <p className="text-2xl text-stone-600 dark:text-stone-300 mb-16 font-light max-w-3xl mx-auto leading-relaxed">
                    Your documents and tasks are ready. Pick up where you left off or start something new.
                  </p>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
                    <Link href="/dashboard">
                      <Button
                          size="lg"
                          className="bg-stone-800 dark:bg-stone-200 hover:bg-stone-900 dark:hover:bg-stone-100 text-white dark:text-stone-900 px-10 py-6 text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Go to Dashboard
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button
                          size="lg"
                          variant="outline"
                          className="border-stone-300 dark:border-stone-600 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 px-10 py-6 text-lg font-medium rounded-full transition-all duration-300"
                      >
                        <User className="w-5 h-5 mr-2" />
                        My Profile
                      </Button>
                    </Link>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6 text-left">
                    <div className="bg-white dark:bg-stone-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
                      <FileSignature className="w-8 h-8 text-stone-700 dark:text-stone-300 mb-4" />
                      <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">Sign Documents</h3>
                      <p className="text-stone-600 dark:text-stone-400 mb-4">
                        Upload and sign PDFs with a single click. No more printing and scanning.
                      </p>
                      <Link href="/dashboard?action=sign">
                        <Button variant="link" className="text-stone-800 dark:text-stone-200 p-0">
                          Sign a document →
                        </Button>
                      </Link>
                    </div>
                    <div className="bg-white dark:bg-stone-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
                      <FileText className="w-8 h-8 text-stone-700 dark:text-stone-300 mb-4" />
                      <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">Recent Documents</h3>
                      <p className="text-stone-600 dark:text-stone-400 mb-4">
                        Access your recent documents. Pick up where you left off.
                      </p>
                      <Link href="/dashboard?tab=documents">
                        <Button variant="link" className="text-stone-800 dark:text-stone-200 p-0">
                          View documents →
                        </Button>
                      </Link>
                    </div>
                    <div className="bg-white dark:bg-stone-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
                      <Bell className="w-8 h-8 text-stone-700 dark:text-stone-300 mb-4" />
                      <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">Notifications</h3>
                      <p className="text-stone-600 dark:text-stone-400 mb-4">
                        Stay updated on document processing and account activity.
                      </p>
                      <Link href="/notifications">
                        <Button variant="link" className="text-stone-800 dark:text-stone-200 p-0">
                          Check notifications →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </>
            ) : (
                <>
                  <div className="mb-8">
                    <h1 className="text-7xl md:text-8xl font-extralight text-stone-900 dark:text-stone-100 mb-8 tracking-tight leading-none">
                      Paperwork
                      <br />
                      <span className="text-stone-500 dark:text-stone-400">made simple</span>
                    </h1>
                  </div>
                  <p className="text-2xl text-stone-600 dark:text-stone-300 mb-16 font-light max-w-3xl mx-auto leading-relaxed">
                    Your personal assistant for signing documents and handling repetitive web tasks.
                    <br />
                    No more endless clicking and typing.
                  </p>
                  <div className="flex flex-col items-center space-y-8">
                    <Link href="/login">
                      <Button
                          size="lg"
                          className="bg-stone-800 dark:bg-stone-200 hover:bg-stone-900 dark:hover:bg-stone-100 text-white dark:text-stone-900 px-16 py-6 text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Get Started
                      </Button>
                    </Link>
                    <div className="flex items-center space-x-2 text-stone-400 dark:text-stone-500">
                      <ArrowDown className="w-4 h-4 animate-bounce" />
                      <span className="text-sm font-medium">See how simple it is</span>
                    </div>
                  </div>
                </>
            )}
          </div>
        </section>

        {/* Process Section */}
        <section className="bg-white dark:bg-stone-800 py-28 transition-colors duration-300">
          <div className="container mx-auto px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-5xl font-extralight text-stone-900 dark:text-stone-100 mb-8 tracking-tight">
                  Three steps, that's it
                </h2>
                <div className="w-24 h-px bg-stone-300 dark:bg-stone-600 mx-auto"></div>
              </div>

              <div className="grid md:grid-cols-3 gap-16">
                <div className="text-center group">
                  <div className="relative mb-10">
                    <div className="w-24 h-24 bg-stone-100 dark:bg-stone-700 rounded-3xl flex items-center justify-center mx-auto group-hover:bg-stone-200 dark:group-hover:bg-stone-600 transition-all duration-300 shadow-sm">
                      <FileText className="w-10 h-10 text-stone-700 dark:text-stone-300" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-stone-800 dark:bg-stone-200 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white dark:text-stone-900 text-sm font-bold">1</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-6 tracking-tight">
                    Upload or Ask
                  </h3>
                  <p className="text-stone-600 dark:text-stone-300 font-light leading-relaxed text-lg">
                    Drop a PDF to sign, or simply ask Shaman to find something on the web for you.
                  </p>
                </div>

                <div className="text-center group">
                  <div className="relative mb-10">
                    <div className="w-24 h-24 bg-stone-100 dark:bg-stone-700 rounded-3xl flex items-center justify-center mx-auto group-hover:bg-stone-200 dark:group-hover:bg-stone-600 transition-all duration-300 shadow-sm">
                      <MousePointer className="w-10 h-10 text-stone-700 dark:text-stone-300" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-stone-800 dark:bg-stone-200 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white dark:text-stone-900 text-sm font-bold">2</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-6 tracking-tight">
                    AI Processing
                  </h3>
                  <p className="text-stone-600 dark:text-stone-300 font-light leading-relaxed text-lg">
                    Shaman identifies what needs to be done - signature fields, form filling, or web navigation.
                  </p>
                </div>

                <div className="text-center group">
                  <div className="relative mb-10">
                    <div className="w-24 h-24 bg-stone-100 dark:bg-stone-700 rounded-3xl flex items-center justify-center mx-auto group-hover:bg-stone-200 dark:group-hover:bg-stone-600 transition-all duration-300 shadow-sm">
                      <CheckCircle className="w-10 h-10 text-stone-700 dark:text-stone-300" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-stone-800 dark:bg-stone-200 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white dark:text-stone-900 text-sm font-bold">3</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-6 tracking-tight">
                    Complete
                  </h3>
                  <p className="text-stone-600 dark:text-stone-300 font-light leading-relaxed text-lg">
                    Review the results, confirm any signatures or data, and you're done.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-28 bg-stone-50 dark:bg-stone-900 transition-colors duration-300">
          <div className="container mx-auto px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-5xl font-extralight text-stone-900 dark:text-stone-100 mb-8 tracking-tight">
                  Built for everyone
                </h2>
                <div className="w-24 h-px bg-stone-300 dark:bg-stone-600 mx-auto"></div>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-10">
                  <div className="border-l-2 border-stone-300 dark:border-stone-600 pl-8 transition-colors duration-300">
                    <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
                      Save Hours Daily
                    </h3>
                    <p className="text-stone-600 dark:text-stone-300 font-light leading-relaxed">
                      Stop spending hours on paperwork. Get back to what actually matters.
                    </p>
                  </div>
                  <div className="border-l-2 border-stone-300 dark:border-stone-600 pl-8 transition-colors duration-300">
                    <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
                      Completely Secure
                    </h3>
                    <p className="text-stone-600 dark:text-stone-300 font-light leading-relaxed">
                      Your documents stay private with military-grade encryption.
                    </p>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="border-l-2 border-stone-300 dark:border-stone-600 pl-8 transition-colors duration-300">
                    <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
                      Gets Smarter
                    </h3>
                    <p className="text-stone-600 dark:text-stone-300 font-light leading-relaxed">
                      The more you use it, the better it gets at predicting what you need.
                    </p>
                  </div>
                  <div className="border-l-2 border-stone-300 dark:border-stone-600 pl-8 transition-colors duration-300">
                    <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
                      Works Everywhere
                    </h3>
                    <p className="text-stone-600 dark:text-stone-300 font-light leading-relaxed">
                      PDFs, Word docs, web forms - if you can sign it, Shaman can handle it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 transition-colors duration-300">
          <div className="container mx-auto px-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-stone-800 dark:bg-stone-200 rounded-sm transition-colors duration-300"></div>
                <span className="text-lg font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Shaman</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
  )
}