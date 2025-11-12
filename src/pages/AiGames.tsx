import { useState } from "react";
import { Layout } from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  Brain,
  BookOpen,
  Sparkles,
  Calculator,
  Code,
  Trophy,
  RefreshCw,
  CheckCircle,
  XCircle,
  Send,
} from "lucide-react";
import { aiApi } from "@/lib/api";

export default function AIGames() {
  const user = getAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);

  const [triviaQuestions, setTriviaQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [triviaScore, setTriviaScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [triviaSubmitted, setTriviaSubmitted] = useState(false);

  const [storyText, setStoryText] = useState("");
  const [storyChoices, setStoryChoices] = useState<string[]>([]);
  const [storyHistory, setStoryHistory] = useState<string[]>([]);
  const [storyCorrectAnswer, setStoryCorrectAnswer] = useState<number | null>(
    null
  );

  const [wordGame, setWordGame] = useState<any>(null);
  const [wordAnswers, setWordAnswers] = useState<any>({});
  const [wordSubmitted, setWordSubmitted] = useState(false);

  const [mathProblems, setMathProblems] = useState<any[]>([]);
  const [mathAnswers, setMathAnswers] = useState<string[]>([]);
  const [mathResults, setMathResults] = useState<boolean[]>([]);
  const [mathSubmitted, setMathSubmitted] = useState(false);

  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [puzzleAnswers, setPuzzleAnswers] = useState<number[]>([]);
  const [puzzleSubmitted, setPuzzleSubmitted] = useState(false);

  const resetTrivia = () => {
    setTriviaQuestions([]);
    setTriviaSubmitted(false);
    setGameResult(null);
  };

  const handleGameCompletion = async (
    gameType: string,
    answers: any,
    childId: string
  ) => {
    if (!user || !childId) return;
    setIsLoading(true);
    setGameResult(null);
    try {
      let result;
      switch (gameType) {
        case "TRIVIA":
          result = await aiApi.games.submitTriviaAnswers(
            childId,
            answers,
            user.token
          );
          setTriviaSubmitted(true);
          break;
        case "MATH":
          result = await aiApi.games.submitMathAnswers(
            childId,
            answers,
            user.token
          );
          setMathSubmitted(true);
          break;
        case "CODE_DETECTIVE":
          result = await aiApi.games.submitCodeDetectiveAnswers(
            childId,
            "LOGIC",
            answers,
            user.token
          );
          setPuzzleSubmitted(true);
          break;
        case "WORD_MASTER":
          result = await aiApi.games.submitWordMasterAnswers(
            childId,
            "ANAGRAM",
            answers,
            user.token
          );
          setWordSubmitted(true);
          break;
        case "STORY_ADVENTURE":
          result = await aiApi.games.submitStoryChoice(
            childId,
            answers,
            user.token
          );
          break;
        default:
          throw new Error("Unknown game type.");
      }
      setGameResult(result);
      toast.success(
        `Score submitted! Earned ${result.coinsEarned} coins and ${result.score} points.`
      );
    } catch (error: any) {
      toast.error(error.error || `Failed to submit ${gameType} score.`);
    } finally {
      setIsLoading(false);
    }
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
    if (answerIndex === triviaQuestions[currentQuestion].correctAnswer) {
      setTriviaScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < triviaQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  const handleStartStory = async (genre: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await aiApi.games.generateStoryAdventure(
        genre,
        "",
        "",
        user.token
      );
      setStoryText(result.story);
      setStoryChoices(result.choices);
      setStoryHistory([result.story]);
      setStoryCorrectAnswer(result.correctAnswer);
      toast.success("Adventure started!");
    } catch {
      toast.error("Failed to start adventure");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoryChoice = async (choice: string) => {
    if (!user) return;
    setIsLoading(true);
    const userChoiceIndex = storyChoices.indexOf(choice);
    const isChoiceCorrect =
      userChoiceIndex !== -1 && userChoiceIndex === storyCorrectAnswer;
    try {
      await handleGameCompletion(
        "STORY_ADVENTURE",
        { storySegment: storyText, choice, isCorrect: isChoiceCorrect },
        user.userId
      );
      toast.info(isChoiceCorrect ? "Correct choice!" : "Wrong choice!");
      const result = await aiApi.games.generateStoryAdventure(
        "",
        storyHistory.join(" "),
        choice,
        user.token
      );
      setStoryText(result.story);
      setStoryChoices(result.choices);
      setStoryHistory((prev) => [...prev, choice, result.story]);
      setStoryCorrectAnswer(result.correctAnswer);
      setGameResult(null);
    } catch {
      toast.error("Failed to continue story");
    } finally {
      setIsLoading(false);
    }
  };

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
    } catch {
      toast.error("Failed to start word game");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartMath = async (difficulty: string, topics: string[]) => {
    if (!user) return;
    setIsLoading(true);
    setMathSubmitted(false);
    setGameResult(null);
    try {
      const result = await aiApi.games.generateMathChallenge(
        difficulty,
        5,
        topics,
        user.token
      );
      setMathProblems(result.problems);
      setMathAnswers(new Array(result.problems.length).fill(""));
      setMathResults([]);
      toast.success("Math challenge started!");
    } catch {
      toast.error("Failed to start math challenge");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPuzzle = async (puzzleType: string, difficulty: string) => {
    if (!user) return;
    setIsLoading(true);
    setPuzzleSubmitted(false);
    setGameResult(null);
    setWordAnswers({});
    try {
      const result = await aiApi.games.generateCodeDetective(
        puzzleType,
        difficulty,
        user.token
      );
      setPuzzles(result.puzzles);
      setPuzzleAnswers(new Array(result.puzzles.length).fill(-1));
      toast.success("Puzzle loaded!");
    } catch {
      toast.error("Failed to load puzzle");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitMath = () => {
    if (mathSubmitted || !user) return;
    const problemsWithAnswers = mathProblems.map((p, i) => ({
      ...p,
      userAnswer: mathAnswers[i],
      isCorrect:
        mathAnswers[i].trim().toLowerCase() === p.correctAnswer.toLowerCase(),
    }));
    const results = problemsWithAnswers.map((p) => p.isCorrect);
    setMathResults(results);
    const score = results.filter(Boolean).length;
    toast.success(`You got ${score}/${mathProblems.length} correct!`);
    handleGameCompletion("MATH", problemsWithAnswers, user.userId);
  };

  const handleSubmitWordGame = () => {
    if (wordSubmitted || !user || !wordGame) return;
    let score = 0;
    let answersToSend;
    let totalQuestions;

    if (wordGame.gameType === "word-association") {
      const mainWordData = wordGame.gameData;

      const selectedWord = wordAnswers[0];

      const isCorrect = mainWordData.correctWords.some(
        (correctWord: string) =>
          correctWord.toLowerCase() === selectedWord?.toLowerCase()
      );

      if (isCorrect) score = 1;

      answersToSend = [
        {
          mainWord: mainWordData.mainWord,
          userAnswer: selectedWord,
          isCorrect: isCorrect,
          correctWords: mainWordData.correctWords,
          distractors: mainWordData.distractors,
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

    toast.success(`You got ${score}/${totalQuestions} correct!`);
    handleGameCompletion("WORD_MASTER", answersToSend, user.userId);
  };

  const handleSubmitPuzzles = () => {
    if (puzzleSubmitted || !user) return;
    const puzzlesWithAnswers = puzzles.map((p, i) => {
      let isCorrect = false;
      let userAnswer: any;
      if (p.options) {
        userAnswer = puzzleAnswers[i];
        isCorrect = userAnswer === p.correctIndex;
      } else if (p.riddle) {
        userAnswer = wordAnswers[i];
        isCorrect =
          userAnswer?.trim().toLowerCase() === p.correctAnswer.toLowerCase();
      }
      return {
        ...p,
        userAnswerIndex: p.options ? userAnswer : undefined,
        userAnswerText: p.riddle ? userAnswer : undefined,
        isCorrect,
      };
    });
    const score = puzzlesWithAnswers.filter((p) => p.isCorrect).length;
    toast.success(`You solved ${score}/${puzzles.length} puzzles!`);
    handleGameCompletion("CODE_DETECTIVE", puzzlesWithAnswers, user.userId);
  };

  const FinalScoreDisplay = ({ score, maxScore, onPlayAgain }: any) => (
    <div className="w-full text-center p-6 bg-primary/10 rounded-lg">
      <h3 className="text-xl font-bold mb-4">
        Game Over! Final Score: <span className="text-primary">{score}</span>/
        {maxScore}
      </h3>
      {gameResult && (
        <p className="text-lg text-green-700 dark:text-green-300 mb-4">
          + {gameResult.coinsEarned} Coins | + {gameResult.score} Points
        </p>
      )}
      <Button onClick={onPlayAgain}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Play Again
      </Button>
    </div>
  );

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          AI Games Hub
        </h1>
        <p className="text-muted-foreground mb-6">
          Play educational games powered by AI
        </p>
        <Tabs defaultValue="trivia" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="trivia">
              <Brain className="h-4 w-4 mr-2" />
              Trivia
            </TabsTrigger>
            <TabsTrigger value="story">
              <BookOpen className="h-4 w-4 mr-2" />
              Story
            </TabsTrigger>
            <TabsTrigger value="words">
              <Sparkles className="h-4 w-4 mr-2" />
              Words
            </TabsTrigger>
            <TabsTrigger value="math">
              <Calculator className="h-4 w-4 mr-2" />
              Math
            </TabsTrigger>
            <TabsTrigger value="puzzles">
              <Code className="h-4 w-4 mr-2" />
              Puzzles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trivia">
            <TriviaSection
              {...{
                triviaQuestions,
                triviaSubmitted,
                handleStartTrivia,
                isLoading,
                triviaScore,
                currentQuestion,
                selectedAnswer,
                showAnswer,
                handleTriviaAnswer,
                handleNextQuestion,
                handleGameCompletion,
                user,
                resetTrivia,
              }}
            />
          </TabsContent>

          <TabsContent value="story">
            <StorySection
              {...{
                storyText,
                storyChoices,
                storyHistory,
                handleStartStory,
                handleStoryChoice,
                storyCorrectAnswer,
                isLoading,
              }}
            />
          </TabsContent>

          <TabsContent value="words">
            <WordSection
              {...{
                wordGame,
                wordAnswers,
                setWordAnswers,
                handleStartWordGame,
                isLoading,
                handleSubmitWordGame,
                wordSubmitted,
                gameResult,
              }}
            />
          </TabsContent>

          <TabsContent value="math">
            <MathSection
              {...{
                mathProblems,
                mathSubmitted,
                handleStartMath,
                isLoading,
                mathAnswers,
                setMathAnswers,
                mathResults,
                handleSubmitMath,
                gameResult,
              }}
            />
          </TabsContent>

          <TabsContent value="puzzles">
            <PuzzleSection
              {...{
                puzzles,
                puzzleSubmitted,
                handleStartPuzzle,
                isLoading,
                puzzleAnswers,
                setPuzzleAnswers,
                wordAnswers,
                setWordAnswers,
                handleSubmitPuzzles,
                gameResult,
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function TriviaSection({
  triviaQuestions,
  triviaSubmitted,
  handleStartTrivia,
  isLoading,
  triviaScore,
  currentQuestion,
  selectedAnswer,
  showAnswer,
  handleTriviaAnswer,
  handleNextQuestion,
  handleGameCompletion,
  user,
  resetTrivia,
}: any) {
  if (triviaQuestions.length === 0 || triviaSubmitted)
    return triviaSubmitted ? (
      <FinalScoreDisplay
        score={triviaScore}
        maxScore={triviaQuestions.length}
        onPlayAgain={resetTrivia}
      />
    ) : (
      <TriviaSetup onStart={handleStartTrivia} isLoading={isLoading} />
    );

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
                onClick={() => !showAnswer && handleTriviaAnswer(idx)}
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
              <Button
                onClick={() =>
                  handleGameCompletion("TRIVIA", triviaQuestions, user?.userId)
                }
                disabled={isLoading}
              >
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

function TriviaSetup({ onStart, isLoading }: any) {
  const [topic, setTopic] = useState("general knowledge");
  const [difficulty, setDifficulty] = useState("medium");
  return (
    <div className="space-y-4">
      <Label>Topic</Label>
      <Input
        placeholder="e.g., Science, History, Movies"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
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
      <Button onClick={() => onStart(topic, difficulty)} disabled={isLoading}>
        Start Trivia
      </Button>
    </div>
  );
}

function StorySection({
  storyText,
  storyChoices,
  storyHistory,
  handleStartStory,
  handleStoryChoice,
  storyCorrectAnswer,
  isLoading,
}: any) {
  if (!storyText)
    return <StorySetup onStart={handleStartStory} isLoading={isLoading} />;
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <BookOpen className="h-5 w-5 text-primary" />
          Interactive Story
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {storyHistory.map((text: string, i: number) => (
              <p key={i}>{text}</p>
            ))}
          </div>
        </ScrollArea>
        <div className="space-y-2 mt-4">
          {storyChoices.map((choice: string, i: number) => (
            <Button
              key={i}
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleStoryChoice(choice)}
              disabled={isLoading}
            >
              {choice}
            </Button>
          ))}
        </div>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Start New Story
        </Button>
      </CardContent>
    </Card>
  );
}

function StorySetup({ onStart, isLoading }: any) {
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

function WordSection({
  wordGame,
  wordAnswers,
  setWordAnswers,
  handleStartWordGame,
  isLoading,
  handleSubmitWordGame,
  wordSubmitted,
  gameResult,
}: any) {
  if (!wordGame || wordSubmitted)
    return wordSubmitted ? (
      <FinalScoreDisplay
        score={gameResult?.score}
        maxScore={gameResult?.maxScore}
        onPlayAgain={() => window.location.reload()}
      />
    ) : (
      <WordGameSetup onStart={handleStartWordGame} isLoading={isLoading} />
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
        <Button onClick={handleSubmitWordGame} disabled={isLoading}>
          <Send className="h-4 w-4 mr-2" />
          Submit
        </Button>
      </CardContent>
    </Card>
  );
}

function WordGameSetup({ onStart, isLoading }: any) {
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

function WordGameDisplay({ game, wordAnswers, setWordAnswers }: any) {
  const handleInputChange = (idx: number, value: string | number) =>
    setWordAnswers((prev: any) => ({ ...prev, [idx]: value }));
  if (game.gameType === "anagram" && Array.isArray(game.gameData))
    return (
      <div className="space-y-4">
        {game.gameData.map((item: any, i: number) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <p className="text-lg text-pretty text-blue-600 mb-5">
                {item.scrambled}
              </p>
              <p className="text-gray-800 mb-2">Hint: {item.hint}</p>
              <Input
                placeholder="Your answer"
                value={wordAnswers[i] || ""}
                onChange={(e) => handleInputChange(i, e.target.value)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  if (game.gameType === "rhyme-time")
    return (
      <div className="space-y-4">
        {game.gameData.map((item: any, i: number) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <p>
                Which word rhymes with <b>{item.word}</b>?
              </p>
              <RadioGroup
                value={wordAnswers[i]?.toString()}
                onValueChange={(v) => handleInputChange(i, parseInt(v))}
              >
                {item.options.map((opt: string, j: number) => (
                  <div key={j} className="flex items-center space-x-2">
                    <RadioGroupItem value={j.toString()} id={`opt-${i}-${j}`} />
                    <Label htmlFor={`opt-${i}-${j}`}>{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  if (game.gameType === "word-association") {
    const allOptions = [
      ...game.gameData.correctWords,
      ...game.gameData.distractors,
    ].sort(() => Math.random() - 0.5);
    return (
      <Card>
        <CardContent className="pt-6">
          <p>
            Select a word associated with <b>{game.gameData.mainWord}</b>
          </p>
          <RadioGroup
            value={wordAnswers[0] || ""}
            onValueChange={(v) => handleInputChange(0, v)}
          >
            {allOptions.map((opt: string, j: number) => (
              <div key={j} className="flex items-center space-x-2">
                <RadioGroupItem value={opt} id={`assoc-${j}`} />
                <Label htmlFor={`assoc-${j}`}>{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    );
  }
  if (game.gameType === "vocabulary")
    return (
      <div className="space-y-4">
        {game.gameData.map((item: any, i: number) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <p className="text-lg mb-4">Definition: {item.definition}</p>
              <p className="mb-2">Example: {item?.usageExample}</p>
              <Input
                placeholder="Your answer"
                value={wordAnswers[i] || ""}
                onChange={(e) => handleInputChange(i, e.target.value)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  return <p>Unsupported game type</p>;
}

function MathSection({
  mathProblems,
  mathSubmitted,
  handleStartMath,
  isLoading,
  mathAnswers,
  setMathAnswers,
  mathResults,
  handleSubmitMath,
  gameResult,
}: any) {
  if (mathProblems.length === 0 || mathSubmitted)
    return mathSubmitted ? (
      <FinalScoreDisplay
        score={mathResults.filter(Boolean).length}
        maxScore={mathProblems.length}
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
                placeholder="Your answer"
                value={mathAnswers[i]}
                onChange={(e) => {
                  const a = [...mathAnswers];
                  a[i] = e.target.value;
                  setMathAnswers(a);
                }}
                disabled={mathSubmitted}
              />
            </CardContent>
          </Card>
        ))}
        <Button onClick={handleSubmitMath} disabled={isLoading}>
          Submit
        </Button>
      </CardContent>
    </Card>
  );
}

function MathSetup({ onStart, isLoading }: any) {
  const [difficulty, setDifficulty] = useState("medium");
  const [topics] = useState(["addition", "subtraction"]);
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

function PuzzleSection({
  puzzles,
  puzzleSubmitted,
  handleStartPuzzle,
  isLoading,
  puzzleAnswers,
  setPuzzleAnswers,
  wordAnswers,
  setWordAnswers,
  handleSubmitPuzzles,
  gameResult,
}: any) {
  if (puzzles.length === 0 || puzzleSubmitted)
    return puzzleSubmitted ? (
      <FinalScoreDisplay
        score={gameResult?.score}
        maxScore={gameResult?.maxScore}
        onPlayAgain={() => window.location.reload()}
      />
    ) : (
      <PuzzleSetup onStart={handleStartPuzzle} isLoading={isLoading} />
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
            answer={p.riddle ? wordAnswers[i] : puzzleAnswers[i]}
            onAnswer={(val: any) => {
              if (p.riddle)
                setWordAnswers((prev: any) => ({ ...prev, [i]: val }));
              else {
                const a = [...puzzleAnswers];
                a[i] = parseInt(val);
                setPuzzleAnswers(a);
              }
            }}
            submitted={puzzleSubmitted}
          />
        ))}
        <Button onClick={handleSubmitPuzzles} disabled={isLoading}>
          Submit
        </Button>
      </CardContent>
    </Card>
  );
}

function PuzzleSetup({ onStart, isLoading }: any) {
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

function PuzzleDisplay({ puzzle, answer, onAnswer, submitted }: any) {
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
          placeholder="Your answer"
          value={answer || ""}
          onChange={(e) => onAnswer(e.target.value)}
          disabled={submitted}
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
    <div className="space-y-3 mb-10">
      {puzzle?.puzzle && <p className="text-left">{puzzle.puzzle}</p>}
      {puzzle?.question && <p>{puzzle.question}</p>}
      <RadioGroup
        value={answer?.toString()}
        onValueChange={(v) => onAnswer(v)}
        disabled={submitted}
      >
        {puzzle.options.map((opt: string, i: number) => (
          <div key={i} className="flex  items-center space-x-2">
            <RadioGroupItem value={i.toString()} id={`opt-${i}`} />
            <Label htmlFor={`opt-${i}`}>{opt}</Label>
          </div>
        ))}
      </RadioGroup>
      {submitted && (
        <div className="p-3 bg-muted rounded-lg">
          <p>{puzzle.explanation}</p>
        </div>
      )}
    </div>
  );
}

export function FinalScoreDisplay({
  score,
  maxScore,
  onPlayAgain,
  gameResult,
}: any) {
  return (
    <div className="w-full text-center p-6 bg-primary/10 rounded-lg">
      <h3 className="text-xl font-bold mb-4">
        Game Over! Final Score: <span className="text-primary">{score}</span>/
        {maxScore}
      </h3>
      {gameResult && (
        <p className="text-lg text-green-700 dark:text-green-300 mb-4">
          + {gameResult.coinsEarned} Coins | + {gameResult.score} Points
        </p>
      )}
      <Button onClick={onPlayAgain}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Play Again
      </Button>
      <Button variant="link" className="ml-4">
        <Trophy className="h-4 w-4 mr-2" />
        View Report
      </Button>
    </div>
  );
}
