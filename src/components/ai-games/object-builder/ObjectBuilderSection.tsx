import { useEffect, useMemo, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, CheckCircle, X } from "lucide-react";
import { aiApi } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import { toast } from "sonner";

type Part = {
  id: number;
  label: string;
  image?: string;
  imagePrompt?: string;
};

export default function ObjectBuilderSection() {
  const user = getAuth();
  const [loading, setLoading] = useState(false);
  const [puzzle, setPuzzle] = useState<{
    title: string;
    description?: string;
    fullImage?: string;
    parts: Part[];
  } | null>(null);
  const [placed, setPlaced] = useState<Record<number, number | null>>({});
  const [startTs, setStartTs] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  const dropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (puzzle) {
      const initial: Record<number, number | null> = {};
      puzzle.parts.forEach((p, i) => (initial[p.id] = null));
      setPlaced(initial);
      setStartTs(Date.now());
    } else {
      setPlaced({});
      setStartTs(null);
    }
  }, [puzzle]);

  const unplacedParts = useMemo(() => {
    if (!puzzle) return [];
    return puzzle.parts.filter((p) => placed[p.id] === null);
  }, [puzzle, placed]);

  const loadPuzzle = async (theme = "forest", partsCount = 6) => {
    if (!user) return toast.error("Login required");
    setLoading(true);
    setPuzzle(null);
    setSubmitted(false);
    setResult(null);
    try {
      const res = await aiApi.games.generateObjectBuilder(
        theme,
        partsCount,
        user.token
      );
      const p = res.puzzle;
      setPuzzle(p);
      toast.success("3D Builder Loaded!");
    } catch (e) {
      toast.error("Failed to load puzzle");
    } finally {
      setLoading(false);
    }
  };

  const onDragStart = (e: React.DragEvent, partId: number) => {
    e.dataTransfer.setData("text/plain", String(partId));
    e.dataTransfer.effectAllowed = "move";
  };

  const onDropSlot = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    const partId = Number(e.dataTransfer.getData("text/plain"));
    if (!puzzle) return;
    if (!partId) return;
    // if that part already placed somewhere else, remove from that slot
    const prevPlaced = { ...placed };
    const existingSlotForPart = Object.keys(prevPlaced).find(
      (k) => prevPlaced[Number(k)] === slotIndex
    );
    // remove any part currently in this slot (swap)
    const partAlreadyInSlot = Object.keys(prevPlaced).find(
      (k) => prevPlaced[Number(k)] === slotIndex
    );
    // find slot index where this part currently is (if any)
    const currentSlotForPart = Object.keys(prevPlaced).find((k) =>
      Number(k) === partId ? prevPlaced[partId] !== null : false
    );
    // simpler: placed map is partId -> slotIndex|null
    const targetPartIdPlaced = Object.entries(prevPlaced).find(
      ([pid, s]) => s === slotIndex
    )?.[0];
    // remove targetPartIdPlaced from slot
    if (targetPartIdPlaced) prevPlaced[Number(targetPartIdPlaced)] = null;
    prevPlaced[partId] = slotIndex;
    setPlaced(prevPlaced);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const clickPlace = (partId: number) => {
    if (!puzzle) return;
    const emptySlot = findFirstEmptySlot();
    if (emptySlot === -1) return;
    setPlaced((prev) => ({ ...prev, [partId]: emptySlot }));
  };

  const findFirstEmptySlot = () => {
    if (!puzzle) return -1;
    const usedSlots = Object.values(placed).filter(
      (s) => s !== null
    ) as number[];
    for (let i = 0; i < puzzle.parts.length; i++) {
      if (!usedSlots.includes(i)) return i;
    }
    return -1;
  };

  const removeFromSlot = (partId: number) => {
    setPlaced((prev) => ({ ...prev, [partId]: null }));
  };

  const allPlaced = useMemo(() => {
    if (!puzzle) return false;
    return puzzle.parts.every((p) => placed[p.id] !== null);
  }, [puzzle, placed]);

  const handleSubmit = async () => {
    if (!user || !puzzle) return toast.error("Missing context");
    setLoading(true);
    try {
      const assembled = puzzle.parts.map((p) => ({
        id: p.id,
        placedAtSlot: placed[p.id],
      }));
      const timeTaken = startTs
        ? Math.max(0, Math.floor((Date.now() - startTs) / 1000))
        : 0;
      const res = await aiApi.games.submitObjectBuilder(
        user.userId,
        { assembled, timeTaken, totalParts: puzzle.parts.length },
        user.token
      );
      setResult(res);
      setSubmitted(true);
      toast.success("Submitted!");
    } catch {
      toast.error("Submit failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPuzzle(null);
    setPlaced({});
    setSubmitted(false);
    setResult(null);
    setStartTs(null);
  };

  return (
    <div className="space-y-6">
      {!puzzle && !submitted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              3D Object Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="text-sm text-muted-foreground max-w-xl">
              Create a character by placing parts into a template. Tap a piece
              or drag it into the board. Generated in a single high-quality
              scene for speed.
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => loadPuzzle("forest", 6)}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Start 3D Builder
              </Button>
              <Button
                variant="ghost"
                onClick={() => loadPuzzle("space", 6)}
                disabled={loading}
              >
                Space
              </Button>
              <Button
                variant="ghost"
                onClick={() => loadPuzzle("ocean", 6)}
                disabled={loading}
              >
                Ocean
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {puzzle && !submitted && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {puzzle.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 mb-4">
                {puzzle.description}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="w-full aspect-[1.1] rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-100 flex items-center justify-center overflow-hidden relative">
                    {!allPlaced && (
                      <div className="text-gray-400">
                        Drop pieces into the slots to assemble
                      </div>
                    )}
                    {allPlaced && puzzle.fullImage && (
                      <img
                        src={puzzle.fullImage}
                        alt="completed"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div
                      ref={dropRef}
                      className="absolute inset-4 pointer-events-none"
                      aria-hidden
                    >
                      <div className={`w-full h-full grid grid-cols-3 gap-3`}>
                        {Array.from({ length: puzzle.parts.length }).map(
                          (_, i) => {
                            const placedPart = puzzle.parts.find(
                              (p) => placed[p.id] === i
                            );
                            return (
                              <div
                                key={i}
                                className="w-full h-full p-2 bg-white/60 rounded-lg border border-dashed border-gray-200 pointer-events-auto"
                                onDragOver={onDragOver}
                                onDrop={(e) => onDropSlot(e, i)}
                              >
                                <div className="w-full h-full rounded-md bg-white flex items-center justify-center overflow-hidden relative">
                                  {placedPart ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center">
                                      <img
                                        src={
                                          placedPart.image ??
                                          `https://image.pollinations.ai/prompt/${encodeURIComponent(
                                            placedPart.imagePrompt ?? ""
                                          )}`
                                        }
                                        alt={placedPart.label}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="text-xs text-gray-400">
                                      Slot {i + 1}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="text-sm font-medium">Progress</div>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${
                            (Object.values(placed).filter((v) => v !== null)
                              .length /
                              puzzle.parts.length) *
                            100
                          }%`,
                        }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                      />
                    </div>
                    <div className="text-sm w-12 text-right">
                      {Object.values(placed).filter((v) => v !== null).length}/
                      {puzzle.parts.length}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-3 text-sm font-medium">
                    Available Parts
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {puzzle.parts.map((part) => {
                      const isPlaced = placed[part.id] !== null;
                      return (
                        <div
                          key={part.id}
                          className={`p-2 rounded-lg bg-white border ${
                            isPlaced ? "opacity-50" : "hover:scale-105"
                          } transition transform`}
                        >
                          <button
                            draggable={!isPlaced}
                            onDragStart={(e) => onDragStart(e, part.id)}
                            onClick={() => !isPlaced && clickPlace(part.id)}
                            className="w-full h-full flex flex-col items-center gap-2"
                          >
                            <div className="w-20 h-20 bg-gray-50 rounded-md flex items-center justify-center overflow-hidden">
                              <img
                                src={
                                  part.image ??
                                  `https://image.pollinations.ai/prompt/${encodeURIComponent(
                                    part.imagePrompt ?? ""
                                  )}`
                                }
                                alt={part.label}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="text-xs text-gray-700">
                              {part.label}
                            </div>
                            {isPlaced && (
                              <button
                                onClick={() => removeFromSlot(part.id)}
                                className="mt-1 text-xs text-red-500"
                              >
                                Remove
                              </button>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={reset} disabled={loading}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={
                loading ||
                Object.values(placed).filter((v) => v !== null).length === 0
              }
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Finish Puzzle
            </Button>
          </div>
        </>
      )}

      {submitted && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <CardTitle>Puzzle Completed</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm mb-4">
              Well done! Here are your results.
            </div>
            <div className="flex gap-4 items-center">
              <div className="text-lg font-semibold">
                Score: {result?.score ?? "—"}
              </div>
              <div className="text-lg font-semibold text-amber-600">
                Coins: {result?.coinsEarned ?? "—"}
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() =>
                  loadPuzzle("forest", puzzle ? puzzle.parts.length : 6)
                }
              >
                Play Again
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSubmitted(false);
                  setPuzzle(null);
                }}
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
