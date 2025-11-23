import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import MathSetup from "./MathSetup";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuth } from "@/lib/auth";
import { aiApi } from "@/lib/api";
import { toast } from "sonner";
import FinalScoreDisplay from "../shared/FinalScoreDisplay";

export default function MathSection() {
  const user = getAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [mathProblems, setMathProblems] = useState<any[]>([]);
  const [mathAnswers, setMathAnswers] = useState<string[]>([]);
  const [mathSubmitted, setMathSubmitted] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);

  const handleStartMath = async (difficulty: string, topics: string[]) => {
    if (!user) return;
    setIsLoading(true);
    setMathSubmitted(false);
    try {
      const result = await aiApi.games.generateMathChallenge(
        difficulty,
        5,
        topics,
        user.token
      );
      setMathProblems(result.problems);
      setMathAnswers(new Array(result.problems.length).fill(""));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitMath = async () => {
    if (!user) return;
    const solved = mathProblems.map((p, i) => ({
      ...p,
      userAnswer: mathAnswers[i],
      isCorrect:
        mathAnswers[i].trim().toLowerCase() === p.correctAnswer.toLowerCase(),
    }));

    const score = solved.filter((p) => p.isCorrect).length;
    const result = await aiApi.games.submitMathAnswers(
      user.userId,
      solved,
      user.token
    );

    setGameResult(result);
    setMathSubmitted(true);
    toast.success(`You got ${score}/${mathProblems.length} correct!`);
  };

  if (mathProblems.length === 0 || mathSubmitted)
    return mathSubmitted ? (
      <FinalScoreDisplay
        score={gameResult?.score}
        maxScore={gameResult?.maxScore}
        gameResult={gameResult}
        onPlayAgain={() => window.location.reload()}
      />
    ) : (
      <MathSetup onStart={handleStartMath} isLoading={isLoading} />
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Calculator className="h-5 w-5 text-primary" />
          Math Challenge
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mathProblems.map((p: any, i: number) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <p>{p.problem}</p>
              <Input
                value={mathAnswers[i]}
                onChange={(e) => {
                  const a = [...mathAnswers];
                  a[i] = e.target.value;
                  setMathAnswers(a);
                }}
              />
            </CardContent>
          </Card>
        ))}

        <Button
          className="mt-4"
          onClick={handleSubmitMath}
          disabled={isLoading}
        >
          Submit
        </Button>
      </CardContent>
    </Card>
  );
}
