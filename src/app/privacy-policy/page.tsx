"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-secondary">Last updated: December 2024</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              1. Introduction
            </h2>
            <p className="text-secondary leading-relaxed">
              OmniPDF ("we," "our," or "us") is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our website
              and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              2. Information We Collect
            </h2>
            <p className="text-secondary leading-relaxed mb-4">
              We collect information in the following ways:
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Personal Information
                </h3>
                <p className="text-secondary leading-relaxed">
                  When you register for an account, we collect your name, email
                  address, and password. We may also collect additional
                  information such as your company name and usage preferences.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Document Information
                </h3>
                <p className="text-secondary leading-relaxed">
                  We temporarily process PDF files you upload to our service.
                  These files are automatically deleted after processing unless
                  you choose to save them.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Usage Data
                </h3>
                <p className="text-secondary leading-relaxed">
                  We collect information about how you interact with our
                  service, including the tools you use, processing times, and
                  error logs. This helps us improve our service.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Cookies
                </h3>
                <p className="text-secondary leading-relaxed">
                  We use cookies and similar tracking technologies to track
                  activity on our service and remember your preferences.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-secondary leading-relaxed mb-4">
              We use the collected information for various purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary">
              <li>To provide, maintain, and improve our services</li>
              <li>To create and manage your account</li>
              <li>To send you technical notices and support messages</li>
              <li>
                To respond to your inquiries and customer service requests
              </li>
              <li>To send marketing communications (with your consent)</li>
              <li>To monitor and analyze trends and usage patterns</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              4. Data Security
            </h2>
            <p className="text-secondary leading-relaxed">
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. However, no method of
              transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              5. Document Processing & Storage
            </h2>
            <p className="text-secondary leading-relaxed mb-4">
              Your PDF files are processed on our secure servers. We maintain
              the following practices:
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary">
              <li>Files are encrypted during transmission</li>
              <li>Processed files are automatically deleted after 24 hours</li>
              <li>We do not use your documents for training or analysis</li>
              <li>
                Enterprise clients can request custom data retention policies
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              6. Third-Party Services
            </h2>
            <p className="text-secondary leading-relaxed">
              We may use third-party services for analytics, payment processing,
              and email delivery. These services are subject to their own
              privacy policies. We do not disclose your personal information to
              third parties for marketing purposes without your explicit
              consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              7. Your Rights
            </h2>
            <p className="text-secondary leading-relaxed mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary">
              <li>Access to your personal information</li>
              <li>Correction of inaccurate data</li>
              <li>Deletion of your data (right to be forgotten)</li>
              <li>Data portability</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              8. Contact Us
            </h2>
            <p className="text-secondary leading-relaxed">
              If you have questions about this Privacy Policy or our privacy
              practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-card border border-border rounded-lg">
              <p className="text-foreground font-semibold">
                Email: huzaifawaqar77@gmail.com
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              9. Changes to This Policy
            </h2>
            <p className="text-secondary leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last Updated" date above.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
