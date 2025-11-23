import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import WordSetup from "./WordSetup";
import WordGameDisplay from "./WordGameDisplay";
import { useState } from "react";
import { aiApi } from "@/lib/api";
import { toast } from "sonner";
import { getAuth } from "@/lib/auth";
import FinalScoreDisplay from "../shared/FinalScoreDisplay";

export default function WordSection() {
  const user = getAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [wordGame, setWordGame] = useState<any>(null);
  const [wordAnswers, setWordAnswers] = useState<any>({});
  const [wordSubmitted, setWordSubmitted] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);

  const handleStartWordGame = async (
    gameType: string,
    difficulty: string,
    category: string
  ) => {
    if (!user) return;
    setIsLoading(true);
    setWordSubmitted(false);
    setGameResult(null);
    setWordAnswers({});
    try {
      const result = await aiApi.games.generateWordMaster(
        gameType,
        difficulty,
        category,
        user.token
      );
      setWordGame({ ...result, gameType });
      toast.success("Word game started!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitWordGame = async () => {
    if (wordSubmitted || !user || !wordGame) return;
    let score = 0;
    let answersToSend;
    let totalQuestions;

    if (wordGame.gameType === "word-association") {
      const d = wordGame.gameData;
      const selected = wordAnswers[0];
      const isCorrect = d.correctWords.some(
        (w: string) => w.toLowerCase() === selected?.toLowerCase()
      );
      if (isCorrect) score = 1;
      answersToSend = [
        {
          mainWord: d.mainWord,
          userAnswer: selected,
          isCorrect,
          correctWords: d.correctWords,
          distractors: d.distractors,
        },
      ];
      totalQuestions = 1;
    } else {
      answersToSend = wordGame.gameData.map((item: any, i: number) => {
        let isCorrect = false;
        const userAnswer = wordAnswers[i];
        if (
          item.correctAnswer &&
          typeof userAnswer === "string" &&
          userAnswer.trim().toLowerCase() === item.correctAnswer.toLowerCase()
        )
          isCorrect = true;
        if (item.correctIndex !== undefined && userAnswer === item.correctIndex)
          isCorrect = true;
        if (isCorrect) score++;
        return { ...item, userAnswer, isCorrect };
      });
      totalQuestions = wordGame.gameData.length;
    }

    const result = await aiApi.games.submitWordMasterAnswers(
      user.userId,
      "ANAGRAM",
      answersToSend,
      user.token
    );

    setGameResult(result);
    setWordSubmitted(true);
    toast.success(`You got ${score}/${totalQuestions} correct!`);
  };

  if (!wordGame || wordSubmitted)
    return wordSubmitted ? (
      <FinalScoreDisplay
        score={gameResult?.score}
        maxScore={gameResult?.maxScore}
        gameResult={gameResult}
        onPlayAgain={() => window.location.reload()}
      />
    ) : (
      <WordSetup onStart={handleStartWordGame} isLoading={isLoading} />
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Sparkles className="h-5 w-5 text-primary" />
          Word Master
        </CardTitle>
      </CardHeader>
      <CardContent>
        <WordGameDisplay
          game={wordGame}
          wordAnswers={wordAnswers}
          setWordAnswers={setWordAnswers}
        />
        <div className="mt-4">
          <button
            className="px-4 py-2 bg-primary text-white rounded-md"
            disabled={isLoading}
            onClick={handleSubmitWordGame}
          >
            Submit
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
