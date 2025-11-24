"use client";

import Link from "next/link";
import { ArrowRight, Play, FileText, ScanText, ShieldX, Wand2, Check, Building2, Users, Sparkles, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(
      titleRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power4.out" }
    )
    .fromTo(
      subtitleRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      "-=0.4"
    )
    .fromTo(
      ctaRef.current,
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" },
      "-=0.3"
    );
  }, []);

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      features: [
        "10 PDF operations/month",
        "Basic tools access",
        "5MB file size limit",
        "Email support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      features: [
        "Unlimited operations",
        "All advanced tools",
        "50MB file size limit",
        "Priority support",
        "Visual pipeline builder",
        "API access"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      features: [
        "Everything in Pro",
        "Unlimited file size",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee",
        "On-premise deployment"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="relative w-7 h-7 sm:w-8 sm:h-8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-400 to-primary opacity-80 rounded-full blur-sm"></div>
                <div className="relative bg-gradient-to-br from-primary to-orange-500 rounded-full w-full h-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                  O
                </div>
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground">OmniPDF</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link href="#features" className="text-secondary hover:text-foreground transition-colors text-sm font-medium">
                Features
              </Link>
              <Link href="#solutions" className="text-secondary hover:text-foreground transition-colors text-sm font-medium">
                Solutions
              </Link>
              <Link href="#pricing" className="text-secondary hover:text-foreground transition-colors text-sm font-medium">
                Pricing
              </Link>
              <Link href="/login" className="text-secondary hover:text-foreground transition-colors text-sm font-medium">
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 lg:px-5 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all hover:shadow-glow-orange text-sm"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col space-y-3">
                <Link href="#features" className="text-secondary hover:text-foreground transition-colors text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                  Features
                </Link>
                <Link href="#solutions" className="text-secondary hover:text-foreground transition-colors text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                  Solutions
                </Link>
                <Link href="#pricing" className="text-secondary hover:text-foreground transition-colors text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                  Pricing
                </Link>
                <Link href="/login" className="text-secondary hover:text-foreground transition-colors text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all text-sm text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-24 sm:pt-32 pb-12 sm:pb-20 lg:pt-40 lg:pb-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 
                ref={titleRef}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 sm:mb-6"
              >
                Master Your PDFs with{" "}
                <span className="text-foreground">Intelligent Workflows.</span>
              </h1>
              
              <p 
                ref={subtitleRef}
                className="text-base sm:text-lg text-secondary mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                Romanize your PDFs to accessories with a visual pipeline of intelligent workflows.
              </p>
              
              <div ref={ctaRef} className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all hover:shadow-glow-orange text-sm sm:text-base"
                >
                  Start Building Pipelines
                </Link>
                <button className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 text-primary font-medium hover:text-primary/80 transition-colors border border-primary/20 rounded-lg hover:border-primary/40 text-sm sm:text-base">
                  <Play className="h-4 w-4" />
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right Visual - Responsive */}
            <div className="relative flex items-center justify-center gap-4 sm:gap-6 lg:gap-8 py-8 sm:py-12 scale-90 sm:scale-100">
              {/* Input PDFs Stack */}
              <div className="flex flex-col gap-2 sm:gap-3">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className="w-16 h-20 sm:w-20 sm:h-24 lg:w-24 lg:h-28 bg-card border-2 border-border rounded-xl sm:rounded-2xl shadow-card flex items-center justify-center"
                  >
                    <FileText className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-secondary" strokeWidth={1.5} />
                  </div>
                ))}
              </div>

              {/* Arrow */}
              <ArrowRight className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary flex-shrink-0" strokeWidth={2.5} />

              {/* Processing Node */}
              <div className="relative flex-shrink-0">
                {/* Sparkle dots */}
                <div className="absolute -top-2 -right-1 sm:-top-3 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded-full"></div>
                <div className="absolute -bottom-2 -left-1 sm:-bottom-3 sm:-left-2 w-2 h-2 sm:w-3 sm:h-3 bg-orange-400 rounded-full"></div>
                
                {/* Main processing box */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-primary to-orange-500 rounded-2xl sm:rounded-3xl shadow-glow-orange flex items-center justify-center transform rotate-6">
                  <Wand2 className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-white" strokeWidth={2} />
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary flex-shrink-0" strokeWidth={2.5} />

              {/* Output PDF */}
              <div className="w-20 h-24 sm:w-24 sm:h-28 lg:w-28 lg:h-32 bg-gradient-to-br from-orange-50 to-amber-100 border-2 border-primary/50 rounded-xl sm:rounded-2xl shadow-card flex flex-col items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 flex-shrink-0">
                <FileText className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-primary" strokeWidth={1.5} />
                <div className="w-full space-y-1.5 sm:space-y-2">
                  <div className="h-0.5 sm:h-1 bg-primary/60 rounded-full"></div>
                  <div className="h-0.5 sm:h-1 bg-primary/40 rounded-full w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 bg-sidebar/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Powerful Tools, Simply Connected
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-card hover:shadow-glow-orange transition-all group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-400 to-primary rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Wand2 className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">Visual Builder</h3>
              <p className="text-sm sm:text-base text-secondary leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-card hover:shadow-glow-orange transition-all group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-400 to-primary rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <ScanText className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">OCR</h3>
              <p className="text-sm sm:text-base text-secondary leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-card hover:shadow-glow-orange transition-all group sm:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-400 to-primary rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <ShieldX className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">Redact</h3>
              <p className="text-sm sm:text-base text-secondary leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Solutions for Every Team
            </h2>
            <p className="text-base sm:text-lg text-secondary max-w-2xl mx-auto px-4">
              From individuals to enterprises, OmniPDF scales with your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* For Individuals */}
            <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-card">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">For Individuals</h3>
              <p className="text-sm sm:text-base text-secondary leading-relaxed mb-4 sm:mb-6">
                Perfect for freelancers and personal use. Process PDFs quickly with our intuitive tools.
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-center gap-2 text-sm sm:text-base text-secondary">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span>Easy-to-use interface</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base text-secondary">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span>Quick file processing</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base text-secondary">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span>Secure & private</span>
                </li>
              </ul>
            </div>

            {/* For Teams */}
            <div className="bg-card border-2 border-primary rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-glow-orange relative md:col-span-2 lg:col-span-1">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 bg-primary text-white text-xs font-semibold rounded-full whitespace-nowrap">
                POPULAR
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">For Teams</h3>
              <p className="text-sm sm:text-base text-secondary leading-relaxed mb-4 sm:mb-6">
                Collaborate seamlessly with shared workspaces and team pipelines.
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-center gap-2 text-sm sm:text-base text-secondary">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span>Team collaboration</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base text-secondary">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span>Shared pipelines</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base text-secondary">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span>Advanced analytics</span>
                </li>
              </ul>
            </div>

            {/* For Enterprise */}
            <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-card md:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-purple-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">For Enterprise</h3>
              <p className="text-sm sm:text-base text-secondary leading-relaxed mb-4 sm:mb-6">
                Enterprise-grade security, compliance, and dedicated support for large organizations.
              </p>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-center gap-2 text-sm sm:text-base text-secondary">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span>SSO & SAML</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base text-secondary">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span>On-premise deployment</span>
                </li>
                <li className="flex items-center gap-2 text-sm sm:text-base text-secondary">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span>24/7 dedicated support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 lg:py-20 bg-sidebar/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-base sm:text-lg text-secondary">
              Choose the plan that's right for you
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-sm md:max-w-none mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 ${
                  plan.popular
                    ? "border-2 border-primary shadow-glow-orange relative md:col-span-2 lg:col-span-1"
                    : "border border-border shadow-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 bg-primary text-white text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap">
                    MOST POPULAR
                  </div>
                )}
                
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="mb-5 sm:mb-6">
                  <span className="text-4xl sm:text-5xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm sm:text-base text-secondary">{plan.period}</span>
                </div>
                
                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/register"
                  className={`block text-center py-2.5 sm:py-3 px-6 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                    plan.popular
                      ? "bg-primary hover:bg-primary/90 text-white hover:shadow-glow-orange"
                      : "bg-sidebar hover:bg-border text-foreground"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                O
              </div>
              <span className="text-base sm:text-lg font-bold text-foreground">OmniPDF</span>
            </div>
            <p className="text-xs sm:text-sm text-secondary text-center">
              © 2025 UIFlexer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
