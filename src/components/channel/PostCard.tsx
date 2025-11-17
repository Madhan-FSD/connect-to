import React from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PostCard({ post, onOpen, onSubscribeCTA }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {post.title || "Untitled"}
            </h4>
            {post.restricted && (
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Lock className="h-4 w-4" />
                <span>
                  {post.visibility === "PAID_ONLY" ? "Premium" : "Subscribers"}
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
            {post.restricted
              ? "This content is locked. Subscribe to view."
              : post.content}
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={() =>
                post.restricted ? onSubscribeCTA(post) : onOpen(post)
              }
            >
              View
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
