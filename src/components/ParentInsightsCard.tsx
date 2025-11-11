import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ParentInsightsCard = ({ data, targetChildId }) => {
  const targetChild = data?.children.find(
    (child) => child._id === targetChildId
  );

  const childInsights = targetChild ? targetChild.insights : [];

  const sortedInsights = childInsights.sort(
    (a, b) => new Date(b.generatedAt) - new Date(a.generatedAt)
  );

  const childName = targetChild ? targetChild.name : "Unknown Child";

  return (
    <Card className="p-4 border rounded-lg bg-blue-300 max-w-lg">
      <CardHeader>
        <CardTitle>{childName} Insights</CardTitle>
      </CardHeader>

      <CardContent>
        {sortedInsights.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            {targetChild
              ? `No recent insights found for ${childName}.`
              : "Child ID not found in the data."}
          </p>
        ) : (
          <div className="space-y-4">
            {sortedInsights.map((insight) => (
              <div
                key={insight._id}
                className="border-l-4 border-yellow-600 pl-4 py-2 bg-blue-200 rounded-sm shadow-sm"
              >
                <p className="text-sm font-medium text-gray-800">
                  {insight.summary}
                </p>

                <p className="text-xs text-blue-800/80 mt-1 italic">
                  Generated{" "}
                  {formatDistanceToNow(new Date(insight.generatedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ParentInsightsCard;
