import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';

interface MealIngredient {
  id: number;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface Meal {
  id: number;
  meal_type: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  ingredients: MealIngredient[];
}

interface MealDetailsDialogProps {
  meal: Meal | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
}

export const MealDetailsDialog = ({ 
  meal, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: MealDetailsDialogProps) => {
  if (!meal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{meal.meal_type} Details</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(meal)}
                className="flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(meal)}
                className="flex items-center gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Meal Summary */}
          <div className="bg-gradient-calm p-4 rounded-lg border border-primary/20">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold mb-2">{meal.meal_type}</h3>
              <p className="text-2xl font-bold text-primary">
                {meal.total_calories?.toFixed(0)} calories
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Badge variant="secondary">
                Protein: {meal.total_protein?.toFixed(1)}g
              </Badge>
              <Badge variant="secondary">
                Carbs: {meal.total_carbs?.toFixed(1)}g
              </Badge>
              <Badge variant="secondary">
                Fat: {meal.total_fat?.toFixed(1)}g
              </Badge>
            </div>
          </div>

          {/* Ingredients List */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Ingredients</h4>
            <div className="space-y-3">
              {meal.ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center justify-between p-4 bg-accent/30 rounded-lg border"
                >
                  <div className="flex-1">
                    <h5 className="font-medium">{ingredient.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {ingredient.quantity}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">{ingredient.calories} cal</p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>P: {ingredient.protein}g</span>
                      <span>C: {ingredient.carbs}g</span>
                      <span>F: {ingredient.fats}g</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};