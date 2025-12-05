"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function LegalNotice() {
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
            Legal Notice
          </h1>
          <p className="text-secondary">Last updated: December 2024</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              1. Terms of Service
            </h2>
            <p className="text-secondary leading-relaxed">
              By accessing and using OmniPDF, you accept and agree to be bound
              by the terms and provision of this agreement. If you do not agree
              to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              2. License to Use
            </h2>
            <p className="text-secondary leading-relaxed mb-4">
              OmniPDF grants you a limited, non-exclusive, non-transferable
              license to use the service. You may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary">
              <li>Reproduce or copy materials without permission</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service for illegal or harmful purposes</li>
              <li>Transmit malware or viruses</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>
                Use automated tools to access the service without permission
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              3. User Responsibilities
            </h2>
            <p className="text-secondary leading-relaxed mb-4">
              As a user of OmniPDF, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary">
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Only upload files that you have the right to process</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not engage in any form of harassment or abuse</li>
              <li>
                Accept responsibility for all activities under your account
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              4. Intellectual Property
            </h2>
            <p className="text-secondary leading-relaxed">
              The content, features, and functionality of OmniPDF are owned by
              us, our licensors, and other providers of content. All rights are
              reserved. You may not reproduce, distribute, or transmit any
              content without our prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              5. Limitation of Liability
            </h2>
            <p className="text-secondary leading-relaxed">
              To the fullest extent permitted by law, OmniPDF shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages resulting from your use of or inability to use
              the service, including but not limited to data loss or business
              interruption.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              6. Disclaimer of Warranties
            </h2>
            <p className="text-secondary leading-relaxed">
              OmniPDF is provided on an "as is" and "as available" basis without
              warranties of any kind, either express or implied. We do not
              warrant that the service will be uninterrupted or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              7. Acceptable Use Policy
            </h2>
            <p className="text-secondary leading-relaxed mb-4">
              You agree not to use OmniPDF for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-secondary">
              <li>Processing copyrighted material without authorization</li>
              <li>Creating malware or engaging in hacking</li>
              <li>Spamming or phishing activities</li>
              <li>Processing classified or sensitive government documents</li>
              <li>Any illegal activities or content</li>
              <li>Reverse engineering or attempting to discover source code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              8. Termination
            </h2>
            <p className="text-secondary leading-relaxed">
              We reserve the right to terminate or suspend your account and
              access to the service at any time, for any reason, with or without
              notice, including if you violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              9. Governing Law
            </h2>
            <p className="text-secondary leading-relaxed">
              These terms and conditions are governed by and construed in
              accordance with the laws of Pakistan, and you irrevocably submit
              to the exclusive jurisdiction of the courts located in Pakistan.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              10. Contact Information
            </h2>
            <p className="text-secondary leading-relaxed mb-4">
              For questions about these legal notices:
            </p>
            <div className="p-4 bg-card border border-border rounded-lg">
              <p className="text-foreground font-semibold">
                Email: huzaifawaqar77@gmail.com
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              11. Modifications
            </h2>
            <p className="text-secondary leading-relaxed">
              We reserve the right to modify these terms at any time. Continued
              use of the service after modifications constitutes your acceptance
              of the updated terms.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
