import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Send, Brain } from "lucide-react";
import TriviaSetup from "./TriviaSetup";
import TriviaQuestion from "./TriviaQuestion";
import { aiApi } from "@/lib/api";
import { toast } from "sonner";
import { getAuth } from "@/lib/auth";
import FinalScoreDisplay from "@/components/ai-games/shared/FinalScoreDisplay";

export default function TriviaSection() {
  const user = getAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [triviaQuestions, setTriviaQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [triviaScore, setTriviaScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [triviaSubmitted, setTriviaSubmitted] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);

  const resetTrivia = () => {
    setTriviaQuestions([]);
    setTriviaSubmitted(false);
    setGameResult(null);
  };

  const handleStartTrivia = async (topic: string, difficulty: string) => {
    if (!user) return;
    setIsLoading(true);
    resetTrivia();
    try {
      const result = await aiApi.games.generateTrivia(
        topic,
        difficulty,
        5,
        user.token
      );
      setTriviaQuestions(
        result.questions.map((q: any) => ({ ...q, userAnswerIndex: -1 }))
      );
      setCurrentQuestion(0);
      setTriviaScore(0);
      setSelectedAnswer(null);
      setShowAnswer(false);
      toast.success("Trivia game started!");
    } catch {
      toast.error("Failed to start trivia");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriviaAnswer = (answerIndex: number) => {
    if (triviaSubmitted) return;
    const newQuestions = [...triviaQuestions];
    newQuestions[currentQuestion].userAnswerIndex = answerIndex;
    setTriviaQuestions(newQuestions);
    setSelectedAnswer(answerIndex);
    setShowAnswer(true);
    if (answerIndex === triviaQuestions[currentQuestion].correctAnswer)
      setTriviaScore((prev) => prev + 1);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < triviaQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await aiApi.games.submitTriviaAnswers(
        user.userId,
        triviaQuestions,
        user.token
      );
      setGameResult(result);
      setTriviaSubmitted(true);
      toast.success(
        `Score submitted! Earned ${result.coinsEarned} coins and ${result.score} points.`
      );
    } catch (e: any) {
      toast.error(e.error || "Failed to submit TRIVIA score.");
    } finally {
      setIsLoading(false);
    }
  };

  if (triviaQuestions.length === 0 || triviaSubmitted) {
    return triviaSubmitted ? (
      <FinalScoreDisplay
        score={triviaScore}
        maxScore={triviaQuestions.length}
        onPlayAgain={resetTrivia}
        gameResult={gameResult}
      />
    ) : (
      <TriviaSetup onStart={handleStartTrivia} isLoading={isLoading} />
    );
  }

  const question = triviaQuestions[currentQuestion];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Trivia Challenge
        </CardTitle>
        <CardDescription>
          Test your knowledge with AI-generated questions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Badge variant="outline">
              Question {currentQuestion + 1} of {triviaQuestions.length}
            </Badge>
            <Badge>Score: {triviaScore}</Badge>
          </div>
          <h3 className="text-lg font-semibold">{question.question}</h3>
          <div className="space-y-2">
            <TriviaQuestion
              question={question}
              showAnswer={showAnswer}
              selectedAnswer={selectedAnswer}
              onAnswer={handleTriviaAnswer}
            />
          </div>
          {showAnswer && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Explanation:</p>
              <p className="text-sm">{question.explanation}</p>
            </div>
          )}
          <div className="flex gap-2">
            {showAnswer && currentQuestion < triviaQuestions.length - 1 && (
              <Button onClick={handleNextQuestion}>Next Question</Button>
            )}
            {showAnswer && currentQuestion === triviaQuestions.length - 1 && (
              <Button onClick={handleSubmit} disabled={isLoading}>
                <Send className="h-4 w-4 mr-2" />
                Submit Final Score
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
