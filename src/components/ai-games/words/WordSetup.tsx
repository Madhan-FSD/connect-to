import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WordSetup({ onStart, isLoading }: any) {
  const [gameType, setGameType] = useState("anagram");
  const [difficulty, setDifficulty] = useState("medium");
  const [category, setCategory] = useState("animals");

  return (
    <div className="space-y-4">
      <Label>Game Type</Label>
      <Select value={gameType} onValueChange={setGameType}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="anagram">Anagram</SelectItem>
          <SelectItem value="word-association">Word Association</SelectItem>
          <SelectItem value="rhyme-time">Rhyme Time</SelectItem>
          <SelectItem value="vocabulary">Vocabulary</SelectItem>
        </SelectContent>
      </Select>

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

      <Label>Category</Label>
      <Input value={category} onChange={(e) => setCategory(e.target.value)} />

      <Button
        onClick={() => onStart(gameType, difficulty, category)}
        disabled={isLoading}
      >
        Start Game
      </Button>
    </div>
  );
}
