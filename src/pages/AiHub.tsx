import { AIFeatures } from "@/components/AiFeatures";
import { AIImageFeatures } from "@/components/AiImageFeatures";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Image, Wand2 } from "lucide-react";

export default function AIHub() {
  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Features Hub
          </h1>
          <p className="text-muted-foreground mt-2">
            Explore powerful AI capabilities to enhance your content and
            experience
          </p>
        </div>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Text AI Features
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Image AI Features
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-6">
            <AIFeatures />
          </TabsContent>

          <TabsContent value="image" className="mt-6">
            <AIImageFeatures />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
