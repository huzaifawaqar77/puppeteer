"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Calendar,
  Clock,
  Eye,
  ChevronRight,
  Loader,
  TrendingUp,
} from "lucide-react";
import { useBlogs, getCategories } from "@/hooks/useBlogs";

export default function BlogsPage() {
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [searchQuery, setSearchQuery] = useState("");
  const { blogs, loading } = useBlogs(selectedCategory, 20);
  const categories = getCategories();

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
        {/* Background gradient elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl opacity-20" />
        </div>

        <div className="relative container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent mb-6">
              PDF Knowledge Hub
            </h1>
            <p className="text-lg sm:text-xl text-secondary max-w-2xl mx-auto mb-8">
              Explore expert insights, tutorials, and best practices for
              mastering PDF processing, security, and optimization. Level up
              your document management skills.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-card border border-border rounded-lg text-foreground placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`px-4 sm:px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                !selectedCategory
                  ? "bg-primary text-white shadow-glow-orange"
                  : "bg-card border border-border text-secondary hover:border-primary/50 hover:text-primary"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 sm:px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-primary text-white shadow-glow-orange"
                    : "bg-card border border-border text-secondary hover:border-primary/50 hover:text-primary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blogs Grid */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <Loader className="h-12 w-12 text-primary animate-spin" />
                <p className="text-secondary">Loading articles...</p>
              </div>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-20">
              <Search className="h-16 w-16 text-secondary/30 mx-auto mb-4" />
              <p className="text-lg text-secondary">
                No articles found. Try different keywords or categories.
              </p>
            </div>
          ) : (
            <>
              {/* Featured Blog (First Blog) */}
              {filteredBlogs[0] && (
                <div className="mb-16 lg:mb-20">
                  <Link href={`/blog/${filteredBlogs[0].slug}`}>
                    <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* Featured Image */}
                        {filteredBlogs[0].featuredImage && (
                          <div className="relative h-80 lg:h-96 overflow-hidden">
                            <Image
                              src={filteredBlogs[0].featuredImage}
                              alt={filteredBlogs[0].title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="p-8 lg:p-10 flex flex-col justify-center">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                              Featured
                            </span>
                            <span className="px-3 py-1 bg-orange-500/10 text-orange-600 text-xs font-semibold rounded-full">
                              {filteredBlogs[0].category}
                            </span>
                          </div>
                          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mb-4 group-hover:text-primary transition-colors line-clamp-3">
                            {filteredBlogs[0].title}
                          </h2>
                          <p className="text-secondary mb-6 line-clamp-2">
                            {filteredBlogs[0].description}
                          </p>

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-secondary mb-6">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(filteredBlogs[0].publishedAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {filteredBlogs[0].readTime} min read
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {filteredBlogs[0].views.toLocaleString()} views
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                            Read Article
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Blog Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredBlogs.slice(1).map((blog) => (
                  <Link key={blog.$id} href={`/blog/${blog.slug}`}>
                    <div className="group h-full bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                      {/* Blog Image */}
                      {blog.featuredImage && (
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={blog.featuredImage}
                            alt={blog.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 bg-primary/90 text-white text-xs font-semibold rounded-full">
                              {blog.category}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Blog Content */}
                      <div className="p-6 flex flex-col h-full">
                        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                        <p className="text-secondary text-sm mb-4 line-clamp-2 flex-grow">
                          {blog.excerpt}
                        </p>

                        {/* Tags */}
                        {blog.tags && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {blog.tags
                              .split(",")
                              .slice(0, 2)
                              .map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-1 bg-primary/5 text-primary rounded"
                                >
                                  #{tag.trim()}
                                </span>
                              ))}
                          </div>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-xs text-secondary pt-4 border-t border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {blog.readTime} min
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {blog.views.toLocaleString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-linear-to-r from-primary/5 to-orange-500/5">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your PDFs?
          </h2>
          <p className="text-lg text-secondary mb-8">
            Start using OmniPDF now and unlock powerful document processing
            capabilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tools"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-glow-orange"
            >
              Explore All Tools
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
