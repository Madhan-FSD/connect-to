import { Card, CardContent } from "@/components/ui/card";

export function CardLoader({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-lg font-medium text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
