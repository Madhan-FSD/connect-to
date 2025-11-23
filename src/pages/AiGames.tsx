import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  BookOpen,
  Sparkles,
  Calculator,
  Code,
  Puzzle,
  MessageSquare,
  Search,
  Layers,
  Eye,
} from "lucide-react";
import TriviaSection from "@/components/ai-games/trivia/TriviaSection";
import StorySection from "@/components/ai-games/story/StorySection";
import WordSection from "@/components/ai-games/words/WordSection";
import MathSection from "@/components/ai-games/math/MathSection";
import PuzzleSection from "@/components/ai-games/puzzles/PuzzleSection";
import ObjectBuilderSection from "@/components/ai-games/object-builder/ObjectBuilderSection";

export default function AIGames() {
  const [active, setActive] = useState("trivia");

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          AI Games Hub
        </h1>
        <p className="text-muted-foreground mb-6">
          Play creative and educational AI-powered games
        </p>

        <Tabs
          defaultValue={active}
          onValueChange={(v) => setActive(v)}
          className="space-y-6"
        >
          <TabsList
            className="
              flex flex-wrap 
              gap-2 
              w-full 
              bg-muted/40
              p-2 
              rounded-xl
            "
          >
            <TabsTrigger value="trivia">
              <Brain className="h-4 w-4 mr-2" />
              Trivia
            </TabsTrigger>

            <TabsTrigger value="story">
              <BookOpen className="h-4 w-4 mr-2" />
              Story
            </TabsTrigger>

            <TabsTrigger value="words">
              <Sparkles className="h-4 w-4 mr-2" />
              Words
            </TabsTrigger>

            <TabsTrigger value="math">
              <Calculator className="h-4 w-4 mr-2" />
              Math
            </TabsTrigger>

            <TabsTrigger value="puzzles">
              <Code className="h-4 w-4 mr-2" />
              Puzzles
            </TabsTrigger>

            <TabsTrigger value="object-builder">
              <Code className="h-4 w-4 mr-2" />
              3D Object Builder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trivia">
            <TriviaSection />
          </TabsContent>
          <TabsContent value="story">
            <StorySection />
          </TabsContent>
          <TabsContent value="words">
            <WordSection />
          </TabsContent>
          <TabsContent value="math">
            <MathSection />
          </TabsContent>
          <TabsContent value="puzzles">
            <PuzzleSection />
          </TabsContent>
          <TabsContent value="object-builder">
            <ObjectBuilderSection />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
