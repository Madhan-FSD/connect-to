import React, { useEffect, useState } from "react";
import { getAuth } from "@/lib/auth";
import { channelApi } from "@/lib/api";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChannelAnalyticsPage() {
  const { channelId } = useParams();
  const auth = getAuth();
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [channelId]);

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const resp = await channelApi.analytics(channelId, auth.token);
      setAnalytics(resp.analytics || {});
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  if (!analytics) return <div className="p-8">Loading analytics…</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Analytics</CardTitle>
      </CardHeader>

      <CardContent>
        {analyticsLoading && (
          <div className="text-sm text-gray-500">Fetching analytics…</div>
        )}

        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
              <div className="text-sm text-gray-500">Subscribers</div>
              <div className="text-xl font-bold">{analytics.subscribers}</div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
              <div className="text-sm text-gray-500">Videos</div>
              <div className="text-xl font-bold">{analytics.videos}</div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
              <div className="text-sm text-gray-500">Posts</div>
              <div className="text-xl font-bold">{analytics.posts}</div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
              <div className="text-sm text-gray-500">Total Likes</div>
              <div className="text-xl font-bold">{analytics.likes}</div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
              <div className="text-sm text-gray-500">Total Comments</div>
              <div className="text-xl font-bold">{analytics.comments}</div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
              <div className="text-sm text-gray-500">Total Views</div>
              <div className="text-xl font-bold">{analytics.views}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
