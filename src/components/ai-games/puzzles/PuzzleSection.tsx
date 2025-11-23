import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code } from "lucide-react";
import PuzzleSetup from "./PuzzleSetup";
import PuzzleDisplay from "./PuzzleDisplay";
import { useState } from "react";
import { aiApi } from "@/lib/api";
import { toast } from "sonner";
import { getAuth } from "@/lib/auth";
import FinalScoreDisplay from "../shared/FinalScoreDisplay";

export default function PuzzleSection() {
  const user = getAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);

  const handleStart = async (type: string, difficulty: string) => {
    setIsLoading(true);
    setSubmitted(false);
    setGameResult(null);
    setAnswers({});
    try {
      const result = await aiApi.games.generateCodeDetective(
        type,
        difficulty,
        user.token
      );
      setPuzzles(result.puzzles);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    const solved = puzzles.map((p, i) => {
      const ans = answers[i];
      const isCorrect = p.options
        ? ans === p.correctIndex
        : ans?.trim().toLowerCase() === p.correctAnswer.toLowerCase();
      return { ...p, userAnswer: ans, isCorrect };
    });

    const score = solved.filter((s) => s.isCorrect).length;
    const result = await aiApi.games.submitCodeDetectiveAnswers(
      user.userId,
      "LOGIC",
      solved,
      user.token
    );

    setGameResult(result);
    setSubmitted(true);
    toast.success(`Solved ${score}/${puzzles.length}!`);
  };

  if (puzzles.length === 0 || submitted)
    return submitted ? (
      <FinalScoreDisplay
        score={gameResult?.score}
        maxScore={gameResult?.maxScore}
        gameResult={gameResult}
        onPlayAgain={() => window.location.reload()}
      />
    ) : (
      <PuzzleSetup onStart={handleStart} isLoading={isLoading} />
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Code className="h-5 w-5 text-primary" />
          Code Detective
        </CardTitle>
      </CardHeader>
      <CardContent>
        {puzzles.map((p: any, i: number) => (
          <PuzzleDisplay
            key={i}
            puzzle={p}
            answer={answers[i]}
            onAnswer={(v: any) => setAnswers((s: any) => ({ ...s, [i]: v }))}
            submitted={submitted}
          />
        ))}

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-white rounded-md mt-4"
        >
          Submit
        </button>
      </CardContent>
    </Card>
  );
}
