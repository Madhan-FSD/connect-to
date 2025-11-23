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

export default function PuzzleSetup({ onStart, isLoading }: any) {
  const [puzzleType, setPuzzleType] = useState("pattern");
  const [difficulty, setDifficulty] = useState("medium");

  return (
    <div className="space-y-4">
      <Label>Puzzle Type</Label>
      <Select value={puzzleType} onValueChange={setPuzzleType}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pattern">Pattern</SelectItem>
          <SelectItem value="logic">Logic</SelectItem>
          <SelectItem value="riddle">Riddle</SelectItem>
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

      <Button
        onClick={() => onStart(puzzleType, difficulty)}
        disabled={isLoading}
      >
        Start
      </Button>
    </div>
  );
}
