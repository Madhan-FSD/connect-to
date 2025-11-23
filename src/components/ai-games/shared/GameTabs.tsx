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
} from "lucide-react";

export default function GameTabs({ value, onValueChange }: any) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 gap-2">
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
        <TabsTrigger value="puzzle-cards">
          <Puzzle className="h-4 w-4 mr-2" />
          Puzzle Cards
        </TabsTrigger>
        <TabsTrigger value="emoji">
          <MessageSquare className="h-4 w-4 mr-2" />
          Emoji Story
        </TabsTrigger>
        <TabsTrigger value="mystery">
          <Search className="h-4 w-4 mr-2" />
          Mystery
        </TabsTrigger>
        <TabsTrigger value="matcher">
          <Layers className="h-4 w-4 mr-2" />
          Card Match
        </TabsTrigger>
        <TabsTrigger value="mistake">Spot Mistake</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
