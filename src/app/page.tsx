"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Server, BarChart3, Shield, Clock, Code, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1b2735] to-[#090a0f] text-white relative overflow-hidden">
      {/* Background animations and effects */}
      <div className="absolute inset-0 opacity-8">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(71, 85, 105, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(71, 85, 105, 0.3) 1px, transparent 1px),
              linear-gradient(rgba(100, 116, 139, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100, 116, 139, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: "100px 100px, 100px 100px, 20px 20px, 20px 20px",
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
        {/* Circuit nodes */}
        <div
          className="absolute top-20 left-20 w-2 h-2 bg-slate-400/60 rounded-full shadow-lg shadow-slate-400/30"
          style={{
            transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.02}px)`,
            transition: "transform 0.4s ease-out",
          }}
        />
        <div
          className="absolute top-40 right-32 w-1.5 h-1.5 bg-slate-300/70 rounded-full shadow-lg shadow-slate-300/40"
          style={{
            transform: `translate(${-mousePosition.x * 0.02}px, ${mousePosition.y * 0.03}px)`,
            transition: "transform 0.5s ease-out",
          }}
        />
        <div
          className="absolute bottom-32 left-1/3 w-2.5 h-2.5 bg-slate-500/50 rounded-full shadow-lg shadow-slate-500/25"
          style={{
            transform: `translate(${mousePosition.x * 0.025}px, ${-mousePosition.y * 0.02}px)`,
            transition: "transform 0.45s ease-out",
          }}
        />
      </div>

      <div
        className="absolute inset-0 opacity-15"
        style={{
          background: `radial-gradient(1000px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(71, 85, 105, 0.12), transparent 60%)`,
          transition: "background 0.4s ease-out",
        }}
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(800px circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, rgba(100, 116, 139, 0.08), transparent 60%)`,
          transition: "background 0.4s ease-out",
        }}
      />

      <div
        className="absolute top-16 left-8 w-16 h-0.5 bg-gradient-to-r from-slate-400/40 to-transparent animate-pulse"
        style={{
          transform: `translate(${mousePosition.x * 0.04}px, ${mousePosition.y * 0.02}px)`,
          transition: "transform 0.6s ease-out",
        }}
      />
      <div
        className="absolute top-32 right-16 w-0.5 h-12 bg-gradient-to-b from-slate-300/50 to-transparent animate-pulse"
        style={{
          transform: `translate(${-mousePosition.x * 0.03}px, ${mousePosition.y * 0.04}px)`,
          transition: "transform 0.7s ease-out",
          animationDelay: "1s",
        }}
      />
      <div
        className="absolute bottom-40 left-1/4 w-12 h-0.5 bg-gradient-to-r from-transparent via-slate-400/35 to-transparent animate-pulse"
        style={{
          transform: `translate(${mousePosition.x * 0.035}px, ${-mousePosition.y * 0.03}px)`,
          transition: "transform 0.5s ease-out",
        }}
      />
      <div
        className="absolute top-60 right-1/3 w-0.5 h-8 bg-gradient-to-b from-slate-500/30 to-transparent animate-pulse"
        style={{
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.025}px)`,
          transition: "transform 0.8s ease-out",
          animationDelay: "2s",
        }}
      />
      <div
        className="absolute bottom-20 right-12 w-8 h-0.5 bg-gradient-to-r from-slate-300/40 to-transparent animate-pulse"
        style={{
          transform: `translate(${-mousePosition.x * 0.025}px, ${-mousePosition.y * 0.02}px)`,
          transition: "transform 0.6s ease-out",
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center">
            {/* Animated Badge */}
            <div className="animate-fade-in-up">
              <Badge className="mb-6 bg-gradient-to-r from-slate-600/20 to-slate-700/20 text-slate-300 border-slate-500/30">
                <Server className="w-3 h-3 mr-1" />
                Optimize Your Serverless Functions
              </Badge>
            </div>

            {/* Main Heading with Signature Animation */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up animation-delay-200">
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                Supercharge Your
              </span>
              <br />
              <span className="relative">
                <span className="bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text text-transparent animate-pulse">
                  Lambda Functions
                </span>
                {/* Signature underline animation */}
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-slate-400 to-slate-500 transform scale-x-0 animate-scale-x origin-left"></div>
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-400">
              Automatically optimize your serverless functions for better performance, lower costs, and enhanced
              reliability. Get insights, recommendations, and automated optimizations through advanced analysis.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-600">
              <Link href='/login'>
              <Button
                size="lg"
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white border-0 group"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                Watch Demo
              </Button>
            </div>
          </div>

          <div
            className="absolute top-20 left-10 w-20 h-12 bg-slate-600/15 border border-slate-500/20 animate-pulse transition-transform duration-1000 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 0.08}px, ${mousePosition.y * 0.06}px)`,
              borderRadius: "4px",
              boxShadow: "inset 0 0 10px rgba(71, 85, 105, 0.3)",
            }}
          >
            <div className="absolute top-1 left-1 right-1 h-2 bg-slate-500/30 rounded-sm"></div>
            <div className="absolute top-4 left-1 right-1 h-2 bg-slate-400/25 rounded-sm"></div>
            <div className="absolute top-7 left-1 right-1 h-2 bg-slate-500/20 rounded-sm"></div>
          </div>

          <div
            className="absolute top-40 right-20 w-16 h-10 bg-slate-700/12 border border-slate-600/15 animate-pulse animation-delay-1000 transition-transform duration-1000 ease-out"
            style={{
              transform: `translate(${-mousePosition.x * 0.06}px, ${mousePosition.y * 0.08}px)`,
              borderRadius: "4px",
              boxShadow: "inset 0 0 8px rgba(100, 116, 139, 0.25)",
            }}
          >
            <div className="absolute top-1 left-1 right-1 h-1.5 bg-slate-600/25 rounded-sm"></div>
            <div className="absolute top-3.5 left-1 right-1 h-1.5 bg-slate-500/20 rounded-sm"></div>
            <div className="absolute top-6 left-1 right-1 h-1.5 bg-slate-600/15 rounded-sm"></div>
          </div>

          <div
            className="absolute bottom-20 left-1/4 w-18 h-8 bg-slate-500/10 border border-slate-400/12 animate-pulse animation-delay-2000 transition-transform duration-1200 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 0.04}px, ${-mousePosition.y * 0.05}px)`,
              borderRadius: "4px",
              boxShadow: "inset 0 0 6px rgba(148, 163, 184, 0.2)",
            }}
          >
            <div className="absolute top-1 left-1 right-1 h-1 bg-slate-400/20 rounded-sm"></div>
            <div className="absolute top-3 left-1 right-1 h-1 bg-slate-500/15 rounded-sm"></div>
            <div className="absolute top-5 left-1 right-1 h-1 bg-slate-400/10 rounded-sm"></div>
          </div>

          <div
            className="absolute top-60 right-1/3 w-14 h-6 bg-slate-600/8 border border-slate-500/10 animate-pulse animation-delay-3000 transition-transform duration-1100 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.04}px)`,
              borderRadius: "4px",
              boxShadow: "inset 0 0 5px rgba(71, 85, 105, 0.15)",
            }}
          >
            <div className="absolute top-0.5 left-0.5 right-0.5 h-1 bg-slate-500/15 rounded-sm"></div>
            <div className="absolute top-2.5 left-0.5 right-0.5 h-1 bg-slate-400/10 rounded-sm"></div>
          </div>

          <div
            className="absolute bottom-40 right-10 w-22 h-10 bg-slate-700/8 border border-slate-600/8 animate-pulse animation-delay-4000 transition-transform duration-1100 ease-out"
            style={{
              transform: `translate(${-mousePosition.x * 0.04}px, ${-mousePosition.y * 0.06}px)`,
              borderRadius: "4px",
              boxShadow: "inset 0 0 8px rgba(100, 116, 139, 0.12)",
            }}
          >
            <div className="absolute top-1 left-1 right-1 h-1.5 bg-slate-600/12 rounded-sm"></div>
            <div className="absolute top-3.5 left-1 right-1 h-1.5 bg-slate-500/8 rounded-sm"></div>
            <div className="absolute top-6 left-1 right-1 h-1.5 bg-slate-600/6 rounded-sm"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 animate-fade-in-up">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Why Choose Optifuse?
              </span>
            </h2>
            <p className="text-gray-400 text-lg animate-fade-in-up animation-delay-200">
              Advanced optimization techniques that make your serverless functions faster and more cost-effective
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Performance Analytics",
                description: "Real-time monitoring and detailed performance metrics for all your lambda functions",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Smart Optimization",
                description: "Intelligent recommendations to reduce cold starts and improve execution efficiency",
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Cost Reduction",
                description: "Automatically optimize memory allocation and execution time to minimize AWS costs",
              },
              {
                icon: <Code className="w-8 h-8" />,
                title: "Code Analysis",
                description: "Deep code analysis to identify bottlenecks and suggest performance improvements",
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Scalability Insights",
                description: "Understand how your functions perform under different load conditions",
              },
              {
                icon: <Server className="w-8 h-8" />,
                title: "Instant Deployment",
                description: "Deploy optimized versions of your functions with a single click",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 animate-fade-in-up group cursor-pointer"
                style={{
                  animationDelay: `${index * 100 + 400}ms`,
                  transform: `perspective(1000px) rotateX(${(mousePosition.y - 50) * 0.05}deg) rotateY(${(mousePosition.x - 50) * 0.05}deg)`,
                  transition: "transform 0.3s ease-out",
                }}
              >
                <CardContent className="p-6">
                  <div className="text-slate-300 mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-slate-600/20 to-slate-700/20 rounded-2xl p-12 border border-white/10 backdrop-blur-sm animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to Optimize?
              </span>
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Join thousands of developers who have already improved their serverless performance
            </p>
            <Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white border-0 group"
              >
                Start Optimizing Now
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                  <Server className="w-5 h-5 text-slate-200" />
                </div>
                <span className="text-xl font-bold">Optifuse</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Optimize your serverless Lambda functions for better performance, lower costs, and enhanced reliability.
              </p>
              <div className="flex space-x-4">
                <a href="mailto:contact@optifuse.com" className="text-gray-400 hover:text-white transition-colors">
                  contact@optifuse.com
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="text-gray-400 hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/integrations" className="text-gray-400 hover:text-white transition-colors">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-gray-400 hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@optifuse.com" className="text-gray-400 hover:text-white transition-colors">
                    Contact Support
                  </a>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">© 2025 Optifuse. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
              <a href="mailto:legal@optifuse.com" className="text-gray-400 hover:text-white transition-colors text-sm">
                Legal
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
