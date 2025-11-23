export function DaySeparator({ label = "Today" }: { label?: string }) {
  return (
    <div className="w-full flex justify-center my-4">
      <span className="wa-day">{label}</span>
    </div>
  );
}
