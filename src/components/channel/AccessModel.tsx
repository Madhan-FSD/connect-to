import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AccessModal({ isOpen, onClose, content }) {
  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{content.body}</DialogDescription>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          <Button
            variant="default"
            onClick={() => {
              content.ctaAction();
              onClose();
            }}
          >
            {content.ctaLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
