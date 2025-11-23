import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function WordGameDisplay({
  game,
  wordAnswers,
  setWordAnswers,
}: any) {
  const handleInputChange = (i: number, value: any) =>
    setWordAnswers((p: any) => ({ ...p, [i]: value }));

  if (game.gameType === "anagram")
    return (
      <div className="space-y-4">
        {game.gameData.map((item: any, i: number) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <p className="text-lg text-blue-600 mb-4">{item.scrambled}</p>
              <p className="text-gray-700 mb-2">Hint: {item.hint}</p>
              <Input
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
    const opts = [
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
            {opts.map((opt: string, j: number) => (
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
              <p className="mb-2">Example: {item.usageExample}</p>
              <Input
                value={wordAnswers[i] || ""}
                onChange={(e) => handleInputChange(i, e.target.value)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    );

  return <div />;
}
