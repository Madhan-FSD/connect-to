import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function PuzzleDisplay({
  puzzle,
  answer,
  onAnswer,
  submitted,
}: any) {
  const isCorrect =
    submitted &&
    ((puzzle.options && answer === puzzle.correctIndex) ||
      (puzzle.riddle &&
        typeof answer === "string" &&
        answer.trim().toLowerCase() === puzzle.correctAnswer.toLowerCase()));

  if (puzzle.riddle)
    return (
      <div className="space-y-3">
        <p>{puzzle.riddle}</p>
        <Input
          value={answer || ""}
          disabled={submitted}
          onChange={(e) => onAnswer(e.target.value)}
        />
        {submitted && (
          <div
            className={`p-3 rounded-lg ${
              isCorrect ? "bg-green-500/10" : "bg-red-500/10"
            }`}
          >
            <p>{isCorrect ? "✓ Correct!" : "✗ Incorrect"}</p>
            <p>Answer: {puzzle.correctAnswer}</p>
          </div>
        )}
      </div>
    );

  return (
    <div className="space-y-3 mb-6">
      {puzzle.puzzle && <p>{puzzle.puzzle}</p>}
      {puzzle.question && <p>{puzzle.question}</p>}

      <RadioGroup
        value={answer?.toString()}
        onValueChange={(v) => onAnswer(parseInt(v))}
        disabled={submitted}
      >
        {puzzle.options.map((opt: string, i: number) => (
          <div key={i} className="flex items-center space-x-2">
            <RadioGroupItem value={i.toString()} id={`opt-${i}`} />
            <Label htmlFor={`opt-${i}`}>{opt}</Label>
          </div>
        ))}
      </RadioGroup>

      {submitted && (
        <div className="p-3 rounded-lg bg-muted">{puzzle.explanation}</div>
      )}
    </div>
  );
}
