import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Brain, TrendingUp, BookOpen, RefreshCw } from "lucide-react";
import { getAuth } from "@/lib/auth";
import { toast } from "sonner";
import { aiApi } from "@/lib/api";

interface AIInsightsPanelProps {
  childId: string;
  childName: string;
}

export const AIInsightsPanel = ({
  childId,
  childName,
}: AIInsightsPanelProps) => {
  const [insights, setInsights] = useState<any>(null);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [interests, setInterests] = useState("");
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isLoadingPath, setIsLoadingPath] = useState(false);
  const user = getAuth();

  const fetchInsights = async () => {
    if (!user) return;
    setIsLoadingInsights(true);
    try {
      const response = await aiApi.getActivityInsights(childId, user.token);
      setInsights(response);
    } catch (error: any) {
      toast.error(error.error || "Failed to fetch insights");
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const generateLearningPath = async () => {
    if (!user || !interests) {
      toast.error("Please enter interests first");
      return;
    }
    setIsLoadingPath(true);
    try {
      const response = await aiApi.generateLearningPath(
        childId,
        interests,
        user.token
      );
      setLearningPath(response);
      toast.success("Learning path generated successfully!");
    } catch (error: any) {
      toast.error(error.error || "Failed to generate learning path");
    } finally {
      setIsLoadingPath(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [childId]);

  return (
    <div className="space-y-6">
      {/* Activity Insights */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>AI Activity Insights</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInsights}
              disabled={isLoadingInsights}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoadingInsights ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
          <CardDescription>
            AI-powered analysis of {childName}'s activity patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingInsights ? (
            <p className="text-sm text-muted-foreground">
              Analyzing activity patterns...
            </p>
          ) : insights ? (
            <>
              {insights.summary && (
                <div>
                  <p className="text-sm font-medium mb-1">Overview:</p>
                  <p className="text-sm text-muted-foreground">
                    {insights.summary}
                  </p>
                </div>
              )}
              {insights.patterns && insights.patterns.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Key Patterns:</p>
                  <ul className="space-y-1">
                    {insights.patterns.map((pattern: string, idx: number) => (
                      <li
                        key={idx}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {insights.recommendations &&
                insights.recommendations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Recommendations:</p>
                    <ul className="space-y-1">
                      {insights.recommendations.map(
                        (rec: string, idx: number) => (
                          <li
                            key={idx}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <span className="text-primary">•</span>
                            <span>{rec}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No insights available yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Learning Path Generator */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>AI Learning Path Generator</CardTitle>
          </div>
          <CardDescription>
            Generate personalized learning recommendations for {childName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interests">Child's Interests</Label>
            <Textarea
              id="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g., science, coding, art, music, sports..."
              rows={3}
            />
          </div>
          <Button
            onClick={generateLearningPath}
            disabled={isLoadingPath || !interests}
            className="w-full"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            {isLoadingPath ? "Generating..." : "Generate Learning Path"}
          </Button>

          {learningPath && (
            <div className="mt-4 space-y-4">
              {learningPath.topics && learningPath.topics.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Recommended Topics:
                  </p>
                  <div className="space-y-2">
                    {learningPath.topics.map((topic: any, idx: number) => (
                      <Card key={idx} className="border-primary/10">
                        <CardContent className="pt-4">
                          <p className="font-medium text-sm">{topic.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {topic.description}
                          </p>
                          {topic.resources && (
                            <p className="text-xs text-primary mt-2">
                              Resources: {topic.resources}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
