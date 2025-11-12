import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as ImageIcon, FileText, Copy, Check } from "lucide-react";
import { getAuth } from "@/lib/auth";
import { toast } from "sonner";
import { aiApi } from "@/lib/api";
import { Badge } from "./ui/badge";

export const AIImageFeatures = () => {
  const [activeTab, setActiveTab] = useState("caption");
  const [imageUrl, setImageUrl] = useState("");
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

  const executeImageFeature = async (
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
            <ImageIcon className="h-6 w-6 text-primary" />
            <CardTitle>AI Image Analysis</CardTitle>
          </div>
          <CardDescription>
            Analyze images with AI to generate captions and descriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="caption">Caption Generator</TabsTrigger>
              <TabsTrigger value="describe">Image Description</TabsTrigger>
            </TabsList>

            {/* Caption Generator */}
            <TabsContent value="caption" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="caption-url">Image URL</Label>
                <Input
                  id="caption-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
              </div>
              {imageUrl && (
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={() => toast.error("Failed to load image")}
                  />
                </div>
              )}
              <Button
                onClick={() =>
                  executeImageFeature("Caption Generation", () =>
                    aiApi.generateCaption(imageUrl, user!.token)
                  )
                }
                disabled={isLoading || !imageUrl}
                className="w-full"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                {isLoading ? "Generating..." : "Generate Caption"}
              </Button>
              {result && result.caption && (
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm">{result.caption}</p>
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
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Image Description */}
            <TabsContent value="describe" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="describe-url">Image URL</Label>
                <Input
                  id="describe-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
              </div>
              {imageUrl && (
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={() => toast.error("Failed to load image")}
                  />
                </div>
              )}
              <Button
                onClick={() =>
                  executeImageFeature("Image Description", () =>
                    aiApi.describeImage(imageUrl, user!.token)
                  )
                }
                disabled={isLoading || !imageUrl}
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                {isLoading ? "Analyzing..." : "Describe Image"}
              </Button>
              {result && result.description && (
                <Card className="border-primary/20">
                  <CardContent className="pt-6 space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Detailed Description:
                      </p>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm">{result.description}</p>
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
                    {result.objects && result.objects.length > 0 && (
                      <div className="pt-3 border-t space-y-2">
                        <p className="text-sm font-medium text-primary">
                          Objects Detected:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.objects.map((obj: any, idx: number) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              title={obj.description}
                              className="cursor-help"
                            >
                              {obj.name.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
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
