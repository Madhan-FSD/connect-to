import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function TriviaSetup({ onStart, isLoading }: any) {
  const [topic, setTopic] = useState("general knowledge");
  const [difficulty, setDifficulty] = useState("medium");
  return (
    <div className="space-y-4">
      <Label>Topic</Label>
      <Input
        placeholder="e.g., Science, History, Movies"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <Label>Difficulty</Label>
      <Select value={difficulty} onValueChange={setDifficulty}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="easy">Easy</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="hard">Hard</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={() => onStart(topic, difficulty)} disabled={isLoading}>
        Start Trivia
      </Button>
    </div>
  );
}
