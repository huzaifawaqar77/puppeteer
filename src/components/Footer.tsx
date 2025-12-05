import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-linear-to-br from-primary to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
                O
              </div>
              <span className="text-xl font-bold text-foreground">OmniPDF</span>
            </div>
            <p className="mt-4 text-secondary max-w-xs leading-relaxed">
              Transform your PDF workflows with intelligent automation, powerful
              tools, and enterprise-grade security.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/tools"
                  className="text-secondary hover:text-primary transition-colors"
                >
                  Tools
                </Link>
              </li>
              <li>
                <Link
                  href="/premium"
                  className="text-secondary hover:text-primary transition-colors"
                >
                  Premium
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-secondary hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/api-docs"
                  className="text-secondary hover:text-primary transition-colors"
                >
                  API Docs
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about-us"
                  className="text-secondary hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-secondary hover:text-primary transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/analytics"
                  className="text-secondary hover:text-primary transition-colors"
                >
                  Analytics
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="text-secondary hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-secondary hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal-notice"
                  className="text-secondary hover:text-primary transition-colors"
                >
                  Legal Notice
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-secondary hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-secondary text-sm">
            © {new Date().getFullYear()} OmniPDF. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link
              href="/privacy-policy"
              className="text-secondary hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/legal-notice"
              className="text-secondary hover:text-primary transition-colors"
            >
              Legal
            </Link>
            <Link
              href="/contact-us"
              className="text-secondary hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
