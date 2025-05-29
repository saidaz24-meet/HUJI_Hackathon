"use client"

import { Button } from "@/components/ui/button"
import { Download, FileText, MousePointer, CheckCircle, ArrowDown, Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"

export default function ShamanLanding() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 transition-colors duration-300">
      {/* Header */}
      <header className="container mx-auto px-8 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-stone-800 dark:bg-stone-200 rounded-sm transition-colors duration-300"></div>
            <span className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Shaman</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium"
            >
              Download
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-8 pt-16 pb-28">
        <div className="max-w-5xl mx-auto text-center">
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
            <Button
              size="lg"
              className="bg-stone-800 dark:bg-stone-200 hover:bg-stone-900 dark:hover:bg-stone-100 text-white dark:text-stone-900 px-16 py-6 text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Download className="w-5 h-5 mr-3" />
              Get Shaman
            </Button>
            <div className="flex items-center space-x-2 text-stone-400 dark:text-stone-500">
              <ArrowDown className="w-4 h-4 animate-bounce" />
              <span className="text-sm font-medium">See how simple it is</span>
            </div>
          </div>
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

      {/* Download Section */}
      <section className="py-28 bg-white dark:bg-stone-800 transition-colors duration-300">
        <div className="container mx-auto px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-5xl font-extralight text-stone-900 dark:text-stone-100 mb-8 tracking-tight">
              Ready to simplify?
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-300 mb-16 font-light">
              Download Shaman and say goodbye to tedious paperwork
            </p>

            <div className="space-y-4 max-w-md mx-auto">
              <Button
                size="lg"
                className="w-full bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 hover:bg-stone-900 dark:hover:bg-stone-100 py-6 text-lg font-medium rounded-xl shadow-lg transition-all duration-300"
              >
                <Download className="w-5 h-5 mr-3" />
                Download for Windows
              </Button>
              <Button
                size="lg"
                className="w-full bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 hover:bg-stone-900 dark:hover:bg-stone-100 py-6 text-lg font-medium rounded-xl shadow-lg transition-all duration-300"
              >
                <Download className="w-5 h-5 mr-3" />
                Download for macOS
              </Button>
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
