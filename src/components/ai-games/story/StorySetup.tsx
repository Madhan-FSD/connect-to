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

export default function StorySetup({ onStart, isLoading }: any) {
  const [genre, setGenre] = useState("adventure");
  return (
    <div className="space-y-4">
      <Label>Genre</Label>
      <Select value={genre} onValueChange={setGenre}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="adventure">Adventure</SelectItem>
          <SelectItem value="mystery">Mystery</SelectItem>
          <SelectItem value="fantasy">Fantasy</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={() => onStart(genre)} disabled={isLoading}>
        Start Adventure
      </Button>
    </div>
  );
}
