"use client";

import Link from "next/link";
import { ArrowLeft, Zap, Users, Award, Globe } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function AboutUs() {
  const values = [
    {
      icon: Zap,
      title: "Innovation",
      description:
        "We continuously innovate to provide the best PDF processing tools available.",
    },
    {
      icon: Users,
      title: "User-Centric",
      description:
        "Your needs drive our development. We listen and iterate based on feedback.",
    },
    {
      icon: Award,
      title: "Quality",
      description:
        "We maintain the highest standards of code quality and service reliability.",
    },
    {
      icon: Globe,
      title: "Accessibility",
      description:
        "PDF processing should be accessible to everyone, regardless of technical skill.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back Home
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
            About OmniPDF
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
            We're on a mission to make PDF processing effortless, powerful, and
            accessible to everyone.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-secondary leading-relaxed mb-6">
              OmniPDF was created to solve the frustration of complex PDF
              workflows. We believe that powerful document processing shouldn't
              require specialized skills or expensive software.
            </p>
            <p className="text-lg text-secondary leading-relaxed">
              Today, we serve thousands of users worldwide, from students and
              freelancers to enterprises processing millions of documents
              annually. Our platform has become the go-to solution for PDF
              manipulation, conversion, and automation.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-2xl p-12 border border-primary/20">
            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-bold text-primary mb-2">36+</h3>
                <p className="text-secondary">Advanced PDF Tools</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-primary mb-2">10K+</h3>
                <p className="text-secondary">Active Users</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-primary mb-2">99.9%</h3>
                <p className="text-secondary">Uptime SLA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">
            Our Values
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-secondary leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Timeline */}
        <div className="mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">
            Our Journey
          </h2>
          <div className="space-y-8">
            {[
              {
                year: "2024 Q1",
                title: "OmniPDF Launched",
                description:
                  "Launched with 30+ tools and basic PDF processing capabilities",
              },
              {
                year: "2024 Q2",
                title: "Added Premium Tools",
                description:
                  "Introduced advanced conversion tools, OCR, and API access",
              },
              {
                year: "2024 Q3",
                title: "Analytics & API",
                description:
                  "Launched analytics dashboard and expanded REST API",
              },
              {
                year: "2024 Q4",
                title: "Blog & SEO",
                description:
                  "Added comprehensive blog platform for content marketing",
              },
            ].map((item, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-primary mt-2"></div>
                  {index < 3 && (
                    <div className="w-0.5 h-24 bg-primary/30 mt-4"></div>
                  )}
                </div>
                <div className="pb-12">
                  <p className="text-sm font-semibold text-primary mb-2">
                    {item.year}
                  </p>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-secondary">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">
            Our Team
          </h2>
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <p className="text-lg text-secondary mb-6">
              OmniPDF is built by a passionate team of engineers, designers, and
              product specialists dedicated to making PDF processing simple and
              powerful.
            </p>
            <p className="text-secondary">
              We're always looking for talented individuals to join our mission.
              If you're interested in helping us transform document processing,
              we'd love to hear from you!
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-secondary mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust OmniPDF for their PDF processing
            needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all"
            >
              Get Started Free
            </Link>
            <Link
              href="/contact-us"
              className="inline-flex items-center justify-center px-8 py-4 border border-primary/20 text-primary font-semibold rounded-lg hover:border-primary/40 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
