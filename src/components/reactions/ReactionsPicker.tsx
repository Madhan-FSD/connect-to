import { LINKEDIN_REACTIONS } from "@/constants/reactions";

export function ReactionsPicker({
  onSelect,
  onMouseEnter,
  onMouseLeave,
}: {
  onSelect: (id: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <div
      className="absolute bottom-8 left-0 flex gap-3 bg-white border border-border shadow-xl rounded-full px-4 py-2 z-50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {LINKEDIN_REACTIONS.map((r) => (
        <button
          key={r.id}
          onClick={() => onSelect(r.id)}
          className="
            text-2xl 
            transition-all 
            duration-200 
            hover:scale-150 
            hover:-translate-y-1
          "
        >
          {r.emoji}
        </button>
      ))}
    </div>
  );
}
