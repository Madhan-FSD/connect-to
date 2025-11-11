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
} from "lucide-react";
import { aiApi } from "@/lib/api";

export default function AIGames() {
  const user = getAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [triviaQuestions, setTriviaQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [triviaScore, setTriviaScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const [storyText, setStoryText] = useState("");
  const [storyChoices, setStoryChoices] = useState<string[]>([]);
  const [storyHistory, setStoryHistory] = useState<string[]>([]);

  const [wordGame, setWordGame] = useState<any>(null);
  const [wordAnswers, setWordAnswers] = useState<any>({});

  const [mathProblems, setMathProblems] = useState<any[]>([]);
  const [mathAnswers, setMathAnswers] = useState<string[]>([]);
  const [mathResults, setMathResults] = useState<boolean[]>([]);

  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [puzzleAnswers, setPuzzleAnswers] = useState<number[]>([]);

  const handleStartTrivia = async (topic: string, difficulty: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await aiApi.games.generateTrivia(
        topic,
        difficulty,
        5,
        user.token
      );
      setTriviaQuestions(result.questions);
      setCurrentQuestion(0);
      setTriviaScore(0);
      setSelectedAnswer(null);
      setShowAnswer(false);
      toast.success("Trivia game started!");
    } catch (error: any) {
      toast.error(error.error || "Failed to start trivia");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriviaAnswer = (answerIndex: number) => {
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
      const result = await aiApi.games.playStoryAdventure(
        genre,
        "",
        "",
        user.token
      );
      setStoryText(result.story);
      setStoryChoices(result.choices);
      setStoryHistory([result.story]);
      toast.success("Adventure started!");
    } catch (error: any) {
      toast.error(error.error || "Failed to start adventure");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoryChoice = async (choice: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await aiApi.games.playStoryAdventure(
        "",
        storyHistory.join(" "),
        choice,
        user.token
      );
      setStoryText(result.story);
      setStoryChoices(result.choices);
      setStoryHistory((prev) => [...prev, result.story]);
    } catch (error: any) {
      toast.error(error.error || "Failed to continue story");
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
    try {
      const result = await aiApi.games.playWordMaster(
        gameType,
        difficulty,
        category,
        user.token
      );
      setWordGame({ ...result, gameType });
      setWordAnswers({});
      toast.success("Word game started!");
    } catch (error: any) {
      toast.error(error.error || "Failed to start word game");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartMath = async (difficulty: string, topics: string[]) => {
    if (!user) return;
    setIsLoading(true);
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
    } catch (error: any) {
      toast.error(error.error || "Failed to start math challenge");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPuzzle = async (puzzleType: string, difficulty: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const result = await aiApi.games.playCodeDetective(
        puzzleType,
        difficulty,
        user.token
      );
      setPuzzles(result.puzzles);
      setPuzzleAnswers(new Array(result.puzzles.length).fill(-1));
      toast.success("Puzzle loaded!");
    } catch (error: any) {
      toast.error(error.error || "Failed to load puzzle");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            AI Games Hub
          </h1>
          <p className="text-muted-foreground">
            Play educational games powered by artificial intelligence
          </p>
        </div>

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

          {/* Trivia Game */}
          <TabsContent value="trivia">
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
                {triviaQuestions.length === 0 ? (
                  <div className="space-y-4">
                    <TriviaSetup
                      onStart={handleStartTrivia}
                      isLoading={isLoading}
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">
                        Question {currentQuestion + 1} of{" "}
                        {triviaQuestions.length}
                      </Badge>
                      <Badge>Score: {triviaScore}</Badge>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        {triviaQuestions[currentQuestion].question}
                      </h3>
                      <div className="space-y-2">
                        {triviaQuestions[currentQuestion].options.map(
                          (option: string, idx: number) => (
                            <Button
                              key={idx}
                              variant={
                                showAnswer
                                  ? idx ===
                                    triviaQuestions[currentQuestion]
                                      .correctAnswer
                                    ? "default"
                                    : selectedAnswer === idx
                                    ? "destructive"
                                    : "outline"
                                  : selectedAnswer === idx
                                  ? "secondary"
                                  : "outline"
                              }
                              className="w-full justify-start text-left h-auto py-3"
                              onClick={() =>
                                !showAnswer && handleTriviaAnswer(idx)
                              }
                              disabled={showAnswer}
                            >
                              {option}
                              {showAnswer &&
                                idx ===
                                  triviaQuestions[currentQuestion]
                                    .correctAnswer && (
                                  <CheckCircle className="ml-auto h-4 w-4" />
                                )}
                              {showAnswer &&
                                selectedAnswer === idx &&
                                idx !==
                                  triviaQuestions[currentQuestion]
                                    .correctAnswer && (
                                  <XCircle className="ml-auto h-4 w-4" />
                                )}
                            </Button>
                          )
                        )}
                      </div>
                      {showAnswer && (
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm">
                            {triviaQuestions[currentQuestion].explanation}
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        {showAnswer &&
                          currentQuestion < triviaQuestions.length - 1 && (
                            <Button onClick={handleNextQuestion}>
                              Next Question
                            </Button>
                          )}
                        {showAnswer &&
                          currentQuestion === triviaQuestions.length - 1 && (
                            <div className="w-full text-center">
                              <p className="text-xl font-bold mb-4">
                                Game Over! Final Score: {triviaScore}/
                                {triviaQuestions.length}
                              </p>
                              <Button onClick={() => setTriviaQuestions([])}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Play Again
                              </Button>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Story Adventure */}
          <TabsContent value="story">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Interactive Story Adventure
                </CardTitle>
                <CardDescription>
                  Create your own adventure with AI-generated stories
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!storyText ? (
                  <StorySetup
                    onStart={handleStartStory}
                    isLoading={isLoading}
                  />
                ) : (
                  <div className="space-y-4">
                    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                      <div className="space-y-4">
                        {storyHistory.map((text, idx) => (
                          <p key={idx} className="text-foreground/90">
                            {text}
                          </p>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="space-y-2">
                      <Label>What do you do next?</Label>
                      {storyChoices.map((choice, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-3"
                          onClick={() => handleStoryChoice(choice)}
                          disabled={isLoading}
                        >
                          {choice}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setStoryText("");
                        setStoryChoices([]);
                        setStoryHistory([]);
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Start New Story
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Word Master */}
          <TabsContent value="words">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Word Master
                </CardTitle>
                <CardDescription>
                  Expand your vocabulary with word games
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!wordGame ? (
                  <WordGameSetup
                    onStart={handleStartWordGame}
                    isLoading={isLoading}
                  />
                ) : (
                  <div className="space-y-4">
                    <Badge>{wordGame.gameType}</Badge>
                    <WordGameDisplay game={wordGame} />
                    <Button
                      variant="secondary"
                      onClick={() => setWordGame(null)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      New Game
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Math Challenge */}
          <TabsContent value="math">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Math Challenge
                </CardTitle>
                <CardDescription>
                  Solve AI-generated math problems
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mathProblems.length === 0 ? (
                  <MathSetup onStart={handleStartMath} isLoading={isLoading} />
                ) : (
                  <div className="space-y-4">
                    {mathProblems.map((problem, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <p className="font-medium">{problem.problem}</p>
                              <Badge variant="outline">{problem.topic}</Badge>
                            </div>
                            <Input
                              placeholder="Your answer"
                              value={mathAnswers[idx]}
                              onChange={(e) => {
                                const newAnswers = [...mathAnswers];
                                newAnswers[idx] = e.target.value;
                                setMathAnswers(newAnswers);
                              }}
                            />
                            {mathResults[idx] !== undefined && (
                              <div
                                className={`p-3 rounded-lg ${
                                  mathResults[idx]
                                    ? "bg-green-500/10"
                                    : "bg-red-500/10"
                                }`}
                              >
                                <p className="text-sm font-medium mb-1">
                                  {mathResults[idx]
                                    ? "✓ Correct!"
                                    : "✗ Incorrect"}
                                </p>
                                <p className="text-sm">
                                  Answer: {problem.answer}
                                </p>
                                <p className="text-sm mt-2">
                                  {problem.solution}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button
                      onClick={() => {
                        const results = mathProblems.map(
                          (p, i) =>
                            mathAnswers[i].trim().toLowerCase() ===
                            p.answer.toLowerCase()
                        );
                        setMathResults(results);
                        const score = results.filter(Boolean).length;
                        toast.success(
                          `You got ${score}/${mathProblems.length} correct!`
                        );
                      }}
                      disabled={mathAnswers.some((a) => !a.trim())}
                    >
                      Submit Answers
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Code Detective */}
          <TabsContent value="puzzles">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Code Detective
                </CardTitle>
                <CardDescription>
                  Solve patterns, logic puzzles, and riddles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {puzzles.length === 0 ? (
                  <PuzzleSetup
                    onStart={handleStartPuzzle}
                    isLoading={isLoading}
                  />
                ) : (
                  <div className="space-y-4">
                    {puzzles.map((puzzle, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-6">
                          <PuzzleDisplay
                            puzzle={puzzle}
                            answer={puzzleAnswers[idx]}
                            onAnswer={(ansIdx) => {
                              const newAnswers = [...puzzleAnswers];
                              newAnswers[idx] = ansIdx;
                              setPuzzleAnswers(newAnswers);
                            }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                    <Button variant="secondary" onClick={() => setPuzzles([])}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      New Puzzles
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

// Setup Components
function TriviaSetup({ onStart, isLoading }: any) {
  const [topic, setTopic] = useState("general knowledge");
  const [difficulty, setDifficulty] = useState("medium");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Topic</Label>
        <Input
          placeholder="e.g., Science, History, Movies"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>
      <div className="space-y-2">
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
      </div>
      <Button onClick={() => onStart(topic, difficulty)} disabled={isLoading}>
        Start Trivia
      </Button>
    </div>
  );
}

function StorySetup({ onStart, isLoading }: any) {
  const [genre, setGenre] = useState("adventure");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Story Genre</Label>
        <Select value={genre} onValueChange={setGenre}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="adventure">Adventure</SelectItem>
            <SelectItem value="mystery">Mystery</SelectItem>
            <SelectItem value="fantasy">Fantasy</SelectItem>
            <SelectItem value="sci-fi">Sci-Fi</SelectItem>
            <SelectItem value="comedy">Comedy</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={() => onStart(genre)} disabled={isLoading}>
        Start Adventure
      </Button>
    </div>
  );
}

function WordGameSetup({ onStart, isLoading }: any) {
  const [gameType, setGameType] = useState("anagram");
  const [difficulty, setDifficulty] = useState("medium");
  const [category, setCategory] = useState("animals");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Game Type</Label>
        <Select value={gameType} onValueChange={setGameType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="anagram">Anagrams</SelectItem>
            <SelectItem value="word-association">Word Association</SelectItem>
            <SelectItem value="rhyme-time">Rhyme Time</SelectItem>
            <SelectItem value="vocabulary">Vocabulary</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
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
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Input
          placeholder="e.g., animals, food, sports"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>
      <Button
        onClick={() => onStart(gameType, difficulty, category)}
        disabled={isLoading}
      >
        Start Game
      </Button>
    </div>
  );
}

function MathSetup({ onStart, isLoading }: any) {
  const [difficulty, setDifficulty] = useState("medium");
  const [topics, setTopics] = useState(["addition", "subtraction"]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
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
      </div>
      <Button onClick={() => onStart(difficulty, topics)} disabled={isLoading}>
        Start Challenge
      </Button>
    </div>
  );
}

function PuzzleSetup({ onStart, isLoading }: any) {
  const [puzzleType, setPuzzleType] = useState("pattern");
  const [difficulty, setDifficulty] = useState("medium");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Puzzle Type</Label>
        <Select value={puzzleType} onValueChange={setPuzzleType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pattern">Pattern Recognition</SelectItem>
            <SelectItem value="logic">Logic Puzzles</SelectItem>
            <SelectItem value="riddle">Riddles</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
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
      </div>
      <Button
        onClick={() => onStart(puzzleType, difficulty)}
        disabled={isLoading}
      >
        Load Puzzles
      </Button>
    </div>
  );
}

function WordGameDisplay({ game }: any) {
  if (game.gameType === "anagram") {
    return (
      <div className="space-y-4">
        {game.gameData.map((item: any, idx: number) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-2xl font-bold text-center tracking-wider">
                  {item.scrambled}
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  Hint: {item.hint}
                </p>
                <Input placeholder="Your answer" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  return <p>Game data loaded</p>;
}

function PuzzleDisplay({ puzzle, answer, onAnswer }: any) {
  if (puzzle.riddle) {
    return (
      <div className="space-y-3">
        <p className="text-lg">{puzzle.riddle}</p>
        <p className="text-sm text-muted-foreground">Hint: {puzzle.hint}</p>
        <Input placeholder="Your answer" />
      </div>
    );
  }

  if (puzzle.options) {
    return (
      <div className="space-y-3">
        <p className="font-medium">{puzzle.puzzle || puzzle.question}</p>
        {puzzle.sequence && (
          <p className="text-muted-foreground">
            Pattern: {puzzle.sequence.join(", ")}
          </p>
        )}
        <RadioGroup
          value={answer?.toString()}
          onValueChange={(v) => onAnswer(parseInt(v))}
        >
          {puzzle.options.map((opt: string, idx: number) => (
            <div key={idx} className="flex items-center space-x-2">
              <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} />
              <Label htmlFor={`opt-${idx}`}>{opt}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  }

  return null;
}
