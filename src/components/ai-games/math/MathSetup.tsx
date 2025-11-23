import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MathSetup({ onStart, isLoading }: any) {
  const [difficulty, setDifficulty] = useState("medium");
  const [topics] = useState(["arithmetic"]);

  return (
    <div className="space-y-4">
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

      <Button onClick={() => onStart(difficulty, topics)} disabled={isLoading}>
        Start
      </Button>
    </div>
  );
}
