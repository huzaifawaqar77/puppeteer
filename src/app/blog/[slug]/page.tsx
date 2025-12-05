"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  Calendar,
  Clock,
  Eye,
  User,
  ChevronLeft,
  Share2,
  Loader,
  ArrowRight,
} from "lucide-react";
import { useBlog, useBlogs } from "@/hooks/useBlogs";
import Markdown from "react-markdown";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { blog, loading, error } = useBlog(slug);
  const { blogs: relatedBlogs } = useBlogs(blog?.category, 3);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = blog?.title || "Check out this article";

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);

    const shareLinks = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };

    window.open(
      shareLinks[platform as keyof typeof shareLinks] || shareUrl,
      "_blank",
      "width=600,height=400"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-12 w-12 text-primary animate-spin" />
          <p className="text-secondary">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Article Not Found
          </h1>
          <p className="text-secondary mb-8">
            The article you're looking for doesn't exist.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-4 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary hover:gap-4 transition-all font-medium"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Hero Section with Featured Image */}
      {blog.featuredImage && (
        <div className="relative w-full h-96 sm:h-[28rem] lg:h-[32rem] overflow-hidden">
          <Image
            src={blog.featuredImage}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
      )}

      {/* Article Content */}
      <article className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Header */}
        <header className="mb-12 sm:mb-16">
          {/* Category & Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              {blog.category}
            </span>
            <span className="text-xs text-secondary">•</span>
            <span className="text-xs text-secondary">
              Updated {formatDate(blog.updatedAt || blog.publishedAt)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Description */}
          <p className="text-xl text-secondary mb-8 leading-relaxed">
            {blog.description}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-secondary pb-8 border-b border-border">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">{blog.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(blog.publishedAt)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {blog.readTime} min read
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {blog.views.toLocaleString()} views
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-4 mt-8">
            <span className="text-sm font-semibold text-foreground">
              Share:
            </span>
            <button
              onClick={() => handleShare("twitter")}
              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
              title="Share on Twitter"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleShare("facebook")}
              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
              title="Share on Facebook"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleShare("linkedin")}
              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
              title="Share on LinkedIn"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Blog Content with Markdown Rendering */}
        <div className="prose prose-invert max-w-none mb-16 sm:mb-20">
          <div className="text-foreground leading-relaxed">
            <Markdown
              components={{
                h1: ({ node, ...props }) => (
                  <h1
                    className="text-3xl sm:text-4xl font-bold mt-12 mb-6 text-foreground"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className="text-2xl sm:text-3xl font-bold mt-10 mb-4 text-foreground"
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    className="text-xl sm:text-2xl font-bold mt-8 mb-3 text-foreground"
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p
                    className="text-base sm:text-lg text-secondary leading-relaxed mb-4"
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul
                    className="list-disc list-inside text-secondary mb-4 space-y-2"
                    {...props}
                  />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    className="list-decimal list-inside text-secondary mb-4 space-y-2"
                    {...props}
                  />
                ),
                li: ({ node, ...props }) => (
                  <li
                    className="text-base sm:text-lg text-secondary mb-2"
                    {...props}
                  />
                ),
                code: ({ node, inline, ...props }: any) =>
                  inline ? (
                    <code
                      className="bg-sidebar text-orange-400 px-2 py-1 rounded text-sm font-mono"
                      {...props}
                    />
                  ) : (
                    <code
                      className="bg-sidebar text-secondary p-4 rounded-lg block overflow-x-auto mb-4 text-sm font-mono"
                      {...props}
                    />
                  ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="border-l-4 border-primary pl-4 py-2 my-4 italic text-secondary"
                    {...props}
                  />
                ),
                a: ({ node, href, ...props }: any) => (
                  <a
                    href={href}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
              }}
            >
              {blog.content}
            </Markdown>
          </div>
        </div>

        {/* Tags */}
        {blog.tags && (
          <div className="mb-16 sm:mb-20 pb-16 sm:pb-20 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
              Tags
            </h3>
            <div className="flex flex-wrap gap-3">
              {blog.tags.split(",").map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?search=${tag.trim()}`}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary hover:text-white transition-colors"
                >
                  #{tag.trim()}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Author Info */}
        <div className="mb-16 sm:mb-20 pb-16 sm:pb-20 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {blog.author}
              </h3>
              <p className="text-sm text-secondary">
                PDF Expert & Content Writer
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedBlogs.length > 0 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs
                .filter((b) => b.$id !== blog.$id)
                .slice(0, 3)
                .map((relatedBlog) => (
                  <Link
                    key={relatedBlog.$id}
                    href={`/blog/${relatedBlog.slug}`}
                  >
                    <div className="group h-full bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all">
                      {relatedBlog.featuredImage && (
                        <div className="relative h-40 overflow-hidden">
                          <Image
                            src={relatedBlog.featuredImage}
                            alt={relatedBlog.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedBlog.title}
                        </h3>
                        <p className="text-xs text-secondary mb-3">
                          {formatDate(relatedBlog.publishedAt)}
                        </p>
                        <div className="flex items-center gap-1 text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          Read More
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </article>

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
          <Link
            href="/tools"
            className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-glow-orange"
          >
            Explore All Tools <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
