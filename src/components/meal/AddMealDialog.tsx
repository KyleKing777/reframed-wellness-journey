
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, FileText, List, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AddMealDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMealType: string;
  onMealTypeChange: (type: string) => void;
}

const mealTypes = [
  'Breakfast',
  'Lunch', 
  'Dinner',
  'Morning Snack',
  'Afternoon Snack',
  'Late Night Snack'
];

export const AddMealDialog = ({ isOpen, onClose, selectedMealType, onMealTypeChange }: AddMealDialogProps) => {
  const navigate = useNavigate();

  const handleAddByIngredient = () => {
    onClose();
    navigate('/meal-logging', { state: { mealType: selectedMealType } });
  };

  const handleAddByDescription = () => {
    onClose();
    // TODO: Implement description-based meal logging
    console.log('Add by description - to be implemented');
  };

  const handleAddByPhoto = () => {
    onClose();
    // TODO: Implement photo-based meal logging
    console.log('Add by photo - to be implemented');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Add Your Meal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Meal Type Selector */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-center">Meal Type:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {mealTypes.map((type) => (
                <Badge
                  key={type}
                  variant={selectedMealType === type ? 'default' : 'outline'}
                  className={`cursor-pointer transition-colors text-xs ${
                    selectedMealType === type 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => onMealTypeChange(type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Add Methods */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-center text-muted-foreground">
              How would you like to add your meal?
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={handleAddByDescription}
                variant="outline"
                className="w-full h-16 flex-col gap-2 hover:bg-accent"
              >
                <FileText className="w-6 h-6" />
                <span className="text-sm">Add by Description</span>
              </Button>

              <Button
                onClick={handleAddByIngredient}
                variant="outline"
                className="w-full h-16 flex-col gap-2 hover:bg-accent"
              >
                <List className="w-6 h-6" />
                <span className="text-sm">Add by Ingredient</span>
              </Button>

              <Button
                onClick={handleAddByPhoto}
                variant="outline"
                className="w-full h-16 flex-col gap-2 hover:bg-accent"
              >
                <Camera className="w-6 h-6" />
                <span className="text-sm">Add by Photo</span>
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
