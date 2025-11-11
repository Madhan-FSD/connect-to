import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import { getAuth } from "@/lib/auth";
import { toast } from "sonner";
import { aiApi } from "@/lib/api";

export const AIFeatures = () => {
  const [activeTab, setActiveTab] = useState("moderation");
  const [inputText, setInputText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
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
    apiCall: () => Promise<any>
  ) => {
    if (!user) return;
    setIsLoading(true);
    setResult(null);
    try {
      const response = await apiCall();
      setResult(response);
      toast.success(`${featureName} completed successfully!`);
    } catch (error: any) {
      toast.error(error.error || `Failed to execute ${featureName}`);
    } finally {
      setIsLoading(false);
    }
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 lg:grid-cols-6 gap-2 h-auto">
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
              <TabsTrigger value="enhance" className="flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                <span className="hidden sm:inline">Enhance</span>
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
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Confidence:</span>
                        <span className="font-medium">
                          {result.confidence}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${result.confidence}%` }}
                        />
                      </div>
                    </div>
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
                  executeAIFeature("Translation", () =>
                    aiApi.translate(inputText, targetLanguage, user!.token)
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
                      <p className="text-sm">{result.translation}</p>
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

            <TabsContent value="enhance" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="enhance-text">Text to Enhance</Label>
                <Textarea
                  id="enhance-text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text to improve grammar, style, and clarity..."
                  rows={4}
                />
              </div>
              <Button
                onClick={() =>
                  executeAIFeature("Text Enhancement", () =>
                    aiApi.enhanceText(inputText, user!.token)
                  )
                }
                disabled={isLoading || !inputText}
                className="w-full"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                {isLoading ? "Enhancing..." : "Enhance Text"}
              </Button>
              {result && result.enhanced && (
                <Card className="border-primary/20">
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Enhanced Version:
                      </p>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm">{result.enhanced}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(result.enhanced)}
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {result.improvements && (
                      <div>
                        <p className="text-sm font-medium mb-1">
                          Improvements Made:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {result.improvements}
                        </p>
                      </div>
                    )}
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
