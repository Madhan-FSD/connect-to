import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy } from "lucide-react";

export default function FinalScoreDisplay({
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
      <div className="flex justify-center gap-3">
        <Button onClick={onPlayAgain}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Play Again
        </Button>
        <Button variant="link" className="ml-0">
          <Trophy className="h-4 w-4 mr-2" />
          View Report
        </Button>
      </div>
    </div>
  );
}
