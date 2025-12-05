import { useEffect, useState } from "react";
import { databases } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/config";
import { Query } from "appwrite";

export interface Blog {
  $id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  featuredImage?: string;
  tags?: string;
  readTime: number;
  views: number;
  publishedAt: string;
  updatedAt?: string;
}

export function useBlogs(category?: string, limit: number = 10) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        setLoading(true);
        setError(null);

        const queries = [Query.orderDesc("publishedAt"), Query.limit(limit)];

        if (category) {
          queries.push(Query.equal("category", category));
        }

        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          "blogs",
          queries
        );

        setBlogs(response.documents as unknown as Blog[]);
      } catch (err: any) {
        console.error("Failed to fetch blogs:", err);
        setError(err.message || "Failed to fetch blogs");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, [category, limit]);

  return { blogs, loading, error };
}

export function useBlog(slug: string) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    async function fetchBlog() {
      try {
        setLoading(true);
        setError(null);

        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          "blogs",
          [Query.equal("slug", slug)]
        );

        if (response.documents.length === 0) {
          setError("Blog not found");
          setBlog(null);
        } else {
          setBlog(response.documents[0] as unknown as Blog);

          // Increment views
          try {
            const currentViews = response.documents[0].views || 0;
            await databases.updateDocument(
              appwriteConfig.databaseId,
              "blogs",
              response.documents[0].$id,
              { views: currentViews + 1 }
            );
          } catch (err) {
            console.error("Failed to increment views:", err);
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch blog:", err);
        setError(err.message || "Failed to fetch blog");
        setBlog(null);
      } finally {
        setLoading(false);
      }
    }

    fetchBlog();
  }, [slug]);

  return { blog, loading, error };
}

export function getCategories(): string[] {
  return ["PDF Tips", "Technology", "Development", "Security", "Tutorials"];
}

export function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}
