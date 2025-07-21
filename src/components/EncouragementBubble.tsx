import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface EncouragementBubbleProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export const EncouragementBubble = ({ isOpen, onClose, message }: EncouragementBubbleProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-gradient-subtle border-primary/20 shadow-glow">
        <div className="relative p-6 text-center space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-primary/10"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <Heart className="w-12 h-12 text-primary animate-pulse" />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground">You're doing amazing!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {message}
              </p>
            </div>
            
            <Button 
              onClick={onClose}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
            >
              Thank you
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};