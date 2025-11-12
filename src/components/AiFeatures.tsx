import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Shield,
  TrendingUp,
  Hash,
  FileText,
  Languages,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Copy,
  Check,
  Image,
  BookOpen,
} from "lucide-react";
import { getAuth } from "@/lib/auth";
import { toast } from "sonner";
import { aiApi } from "@/lib/api";

export const AIFeatures = () => {
  const [activeTab, setActiveTab] = useState("moderation");
  const [inputText, setInputText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [interests, setInterests] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const user = getAuth();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const executeAIFeature = async (
    featureName: string,
    apiCall: () => Promise<any>,
    clearText: boolean = true
  ) => {
    if (!user) {
      toast.error("User not authenticated.");
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await apiCall();
      setResult(response);
      toast.success(`${featureName} completed successfully!`);
      if (clearText) setInputText("");
    } catch (error: any) {
      toast.error(error.error || `Failed to execute ${featureName}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setInputText("");
    setImageUrl("");
    setInterests("");
    setResult(null);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle>AI-Powered Features</CardTitle>
          </div>
          <CardDescription>
            Explore advanced AI capabilities to enhance your content and
            experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2 h-auto">
              <TabsTrigger
                value="moderation"
                className="flex items-center gap-1"
              >
                <Shield className="h-3 w-3" />
                <span className="hidden sm:inline">Moderate</span>
              </TabsTrigger>
              <TabsTrigger
                value="sentiment"
                className="flex items-center gap-1"
              >
                <TrendingUp className="h-3 w-3" />
                <span className="hidden sm:inline">Sentiment</span>
              </TabsTrigger>
              <TabsTrigger value="hashtags" className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                <span className="hidden sm:inline">Hashtags</span>
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span className="hidden sm:inline">Summary</span>
              </TabsTrigger>
              <TabsTrigger
                value="translate"
                className="flex items-center gap-1"
              >
                <Languages className="h-3 w-3" />
                <span className="hidden sm:inline">Translate</span>
              </TabsTrigger>

              <TabsTrigger value="path" className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span className="hidden sm:inline">Learning Path</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="moderation" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="moderate-text">Content to Moderate</Label>
                <Textarea
                  id="moderate-text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter content to check for safety and appropriateness..."
                  rows={4}
                />
              </div>
              <Button
                onClick={() =>
                  executeAIFeature("Content Moderation", () =>
                    aiApi.moderate(inputText, user!.token)
                  )
                }
                disabled={isLoading || !inputText}
                className="w-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                {isLoading ? "Analyzing..." : "Moderate Content"}
              </Button>
              {result && (
                <Card
                  className={
                    result.isSafe
                      ? "border-success/20 bg-success/5"
                      : "border-destructive/20 bg-destructive/5"
                  }
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      {result.isSafe ? (
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-2 flex-1">
                        <p className="font-semibold">
                          {result.isSafe
                            ? "Content is Safe"
                            : "Content Flagged"}
                        </p>
                        <p className="text-sm">{result.reason}</p>
                        {result.suggestions && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Suggestions:</p>
                            <p className="text-sm text-muted-foreground">
                              {result.suggestions}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="sentiment" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="sentiment-text">Text to Analyze</Label>
                <Textarea
                  id="sentiment-text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text to analyze emotional tone..."
                  rows={4}
                />
              </div>
              <Button
                onClick={() =>
                  executeAIFeature("Sentiment Analysis", () =>
                    aiApi.analyzeSentiment(inputText, user!.token)
                  )
                }
                disabled={isLoading || !inputText}
                className="w-full"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {isLoading ? "Analyzing..." : "Analyze Sentiment"}
              </Button>
              {result && (
                <Card className="border-primary/20">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Overall Sentiment:</span>
                      <Badge
                        variant={
                          result.sentiment === "positive"
                            ? "default"
                            : result.sentiment === "negative"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {result.sentiment?.toUpperCase()}
                      </Badge>
                    </div>

                    {/* REMOVED: Confidence Display */}

                    {result.analysis && (
                      <p className="text-sm text-muted-foreground">
                        {result.analysis}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="hashtags" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="hashtag-text">Post Content</Label>
                <Textarea
                  id="hashtag-text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter your post content to get relevant hashtag suggestions..."
                  rows={4}
                />
              </div>
              <Button
                onClick={() =>
                  executeAIFeature("Hashtag Suggestions", () =>
                    aiApi.suggestHashtags(inputText, user!.token)
                  )
                }
                disabled={isLoading || !inputText}
                className="w-full"
              >
                <Hash className="h-4 w-4 mr-2" />
                {isLoading ? "Generating..." : "Suggest Hashtags"}
              </Button>
              {result && result.hashtags && (
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-2">
                      {result.hashtags.map((tag: string, idx: number) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => handleCopy(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="summary" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="summary-text">Long Content</Label>
                <Textarea
                  id="summary-text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter long content to get a concise summary..."
                  rows={6}
                />
              </div>
              <Button
                onClick={() =>
                  executeAIFeature("Post Summary", () =>
                    aiApi.summarizePost(inputText, user!.token)
                  )
                }
                disabled={isLoading || !inputText}
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                {isLoading ? "Summarizing..." : "Generate Summary"}
              </Button>
              {result && result.summary && (
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm">{result.summary}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(result.summary)}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="translate" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="translate-text">Text to Translate</Label>
                <Textarea
                  id="translate-text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text to translate..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-language">Target Language</Label>
                <Select
                  value={targetLanguage}
                  onValueChange={setTargetLanguage}
                >
                  <SelectTrigger id="target-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() =>
                  executeAIFeature(
                    "Translation",
                    () =>
                      aiApi.translate(inputText, targetLanguage, user!.token),
                    false // Don't clear text input after translation
                  )
                }
                disabled={isLoading || !inputText}
                className="w-full"
              >
                <Languages className="h-4 w-4 mr-2" />
                {isLoading ? "Translating..." : "Translate"}
              </Button>
              {result && result.translation && (
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">
                        {result.translation}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(result.translation)}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="media" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter a public image URL..."
                />
              </div>
              {imageUrl && (
                <div className="flex justify-center border rounded-lg p-2 bg-muted/20">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-h-48 object-contain rounded"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    executeAIFeature("Generate Caption", () =>
                      aiApi.generateCaption(imageUrl, user!.token)
                    )
                  }
                  disabled={isLoading || !imageUrl}
                  className="flex-1"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {isLoading ? "Generating..." : "Generate Caption"}
                </Button>
                <Button
                  onClick={() =>
                    executeAIFeature("Describe Image", () =>
                      aiApi.describeImage(imageUrl, user!.token)
                    )
                  }
                  disabled={isLoading || !imageUrl}
                  className="flex-1"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isLoading ? "Describing..." : "Describe Image"}
                </Button>
              </div>
              {result && (result.caption || result.description) && (
                <Card className="border-primary/20">
                  <CardContent className="pt-6 space-y-3">
                    {result.caption && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Caption Suggestion:
                        </p>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-foreground">
                            {result.caption}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(result.caption)}
                          >
                            {copied ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                    {result.description && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Image Description:
                        </p>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-muted-foreground">
                            {result.description}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(result.description)}
                          >
                            {copied ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="path" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="path-interests">My Career Interests</Label>
                <Textarea
                  id="path-interests"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g., Cloud Computing, Data Science, Frontend Development..."
                  rows={4}
                />
              </div>
              <Button
                onClick={() =>
                  executeAIFeature("Learning Path Generation", () =>
                    aiApi.generateLearningPath(interests, user!.token)
                  )
                }
                disabled={isLoading || !interests}
                className="w-full"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {isLoading ? "Generating Path..." : "Generate Learning Path"}
              </Button>

              {result && result.topics && (
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium mb-2">
                      Suggested Path for {interests}:
                    </p>
                    <div className="space-y-3">
                      {result.topics.map((step: any, index: number) => (
                        <div
                          key={index}
                          className="p-3 border rounded-md bg-secondary/20"
                        >
                          <p className="font-semibold text-sm">
                            {index + 1}. {step.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {step.description}
                          </p>

                          {step.resources && Array.isArray(step.resources) && (
                            <div className="text-xs mt-1 italic text-muted-foreground">
                              **Key Resources:** {step.resources.join(", ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
