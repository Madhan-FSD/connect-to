import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, RefreshCw } from "lucide-react";
import StorySetup from "./StorySetup";
import { useState } from "react";
import { aiApi } from "@/lib/api";
import { toast } from "sonner";
import { getAuth } from "@/lib/auth";

export default function StorySection() {
  const user = getAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [storyChoices, setStoryChoices] = useState<string[]>([]);
  const [storyHistory, setStoryHistory] = useState<string[]>([]);
  const [storyCorrectAnswer, setStoryCorrectAnswer] = useState<number | null>(
    null
  );

  const handleStartStory = async (genre: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await aiApi.games.generateStoryAdventure(
        genre,
        "",
        "",
        user.token
      );
      setStoryText(result.story);
      setStoryChoices(result.choices);
      setStoryHistory([result.story]);
      setStoryCorrectAnswer(result.correctAnswer);
      toast.success("Adventure started!");
    } catch {
      toast.error("Failed to start adventure");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoryChoice = async (choice: string) => {
    if (!user) return;
    setIsLoading(true);
    const userChoiceIndex = storyChoices.indexOf(choice);
    const isChoiceCorrect =
      userChoiceIndex !== -1 && userChoiceIndex === storyCorrectAnswer;
    try {
      await aiApi.games.submitStoryChoice(
        user.userId,
        { storySegment: storyText, choice, isCorrect: isChoiceCorrect },
        user.token
      );
      toast.info(isChoiceCorrect ? "Correct choice!" : "Wrong choice!");
      const result = await aiApi.games.generateStoryAdventure(
        "",
        storyHistory.join(" "),
        choice,
        user.token
      );
      setStoryText(result.story);
      setStoryChoices(result.choices);
      setStoryHistory((prev) => [...prev, choice, result.story]);
      setStoryCorrectAnswer(result.correctAnswer);
    } catch {
      toast.error("Failed to continue story");
    } finally {
      setIsLoading(false);
    }
  };

  if (!storyText)
    return <StorySetup onStart={handleStartStory} isLoading={isLoading} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <BookOpen className="h-5 w-5 text-primary" />
          Interactive Story
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {storyHistory.map((text: string, i: number) => (
              <p key={i}>{text}</p>
            ))}
          </div>
        </ScrollArea>
        <div className="space-y-2 mt-4">
          {storyChoices.map((choice: string, i: number) => (
            <Button
              key={i}
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleStoryChoice(choice)}
              disabled={isLoading}
            >
              {choice}
            </Button>
          ))}
        </div>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Start New Story
        </Button>
      </CardContent>
    </Card>
  );
}
