import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

export default function TriviaQuestion({
  question,
  showAnswer,
  selectedAnswer,
  onAnswer,
}: any) {
  return (
    <div className="space-y-2">
      {question.options.map((option: string, idx: number) => (
        <Button
          key={idx}
          variant={
            showAnswer
              ? idx === question.correctAnswer
                ? "default"
                : selectedAnswer === idx
                ? "destructive"
                : "outline"
              : selectedAnswer === idx
              ? "secondary"
              : "outline"
          }
          className="w-full justify-start text-left h-auto py-3"
          onClick={() => !showAnswer && onAnswer(idx)}
          disabled={showAnswer}
        >
          {option}
          {showAnswer && idx === question.correctAnswer && (
            <CheckCircle className="ml-auto h-4 w-4" />
          )}
          {showAnswer &&
            selectedAnswer === idx &&
            idx !== question.correctAnswer && (
              <XCircle className="ml-auto h-4 w-4" />
            )}
        </Button>
      ))}
    </div>
  );
}
