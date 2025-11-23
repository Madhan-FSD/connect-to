import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  icon: Icon,
  message,
}: {
  icon: React.ElementType;
  message: string;
}) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-lg font-medium">{message}</p>
      </CardContent>
    </Card>
  );
}
