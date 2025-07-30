import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { NutritionixIngredientSearch } from './NutritionixIngredientSearch';

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

interface EditMealDialogProps {
  meal: Meal | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const EditMealDialog = ({ meal, isOpen, onClose, onSave }: EditMealDialogProps) => {
  const [mealType, setMealType] = useState('');
  const [ingredients, setIngredients] = useState<MealIngredient[]>([]);
  const [showIngredientSearch, setShowIngredientSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (meal) {
      setMealType(meal.meal_type || '');
      setIngredients(meal.ingredients || []);
    }
  }, [meal]);

  const calculateTotals = () => {
    return ingredients.reduce(
      (totals, ingredient) => ({
        calories: totals.calories + (ingredient.calories || 0),
        protein: totals.protein + (ingredient.protein || 0),
        carbs: totals.carbs + (ingredient.carbs || 0),
        fats: totals.fats + (ingredient.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const removeIngredient = (ingredientId: number) => {
    setIngredients(prev => prev.filter(ing => ing.id !== ingredientId));
  };

  const addIngredient = (newIngredient: Omit<MealIngredient, 'id'>) => {
    const ingredient: MealIngredient = {
      ...newIngredient,
      id: Date.now() // Temporary ID for new ingredients
    };
    setIngredients(prev => [...prev, ingredient]);
    setShowIngredientSearch(false);
  };

  const handleSave = async () => {
    if (!meal || !mealType.trim()) {
      toast({
        title: "Error",
        description: "Please select a meal type",
        variant: "destructive"
      });
      return;
    }

    if (ingredients.length === 0) {
      toast({
        title: "Error", 
        description: "Please add at least one ingredient",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const totals = calculateTotals();
      
      // Update meal in database
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Update the meal
      const { error: mealError } = await supabase
        .from('Meals')
        .update({
          meal_type: mealType,
          total_calories: totals.calories,
          total_protein: totals.protein,
          total_carbs: totals.carbs,
          total_fat: totals.fats
        })
        .eq('id', meal.id);

      if (mealError) throw mealError;

      // Delete existing ingredients
      const { error: deleteError } = await supabase
        .from('MealIngredients')
        .delete()
        .eq('meal_id', meal.id);

      if (deleteError) throw deleteError;

      // Insert updated ingredients
      const ingredientsToInsert = ingredients.map(ingredient => ({
        meal_id: meal.id,
        name: ingredient.name,
        quantity: ingredient.quantity,
        calories: ingredient.calories,
        protein: ingredient.protein,
        carbs: ingredient.carbs,
        fats: ingredient.fats
      }));

      const { error: insertError } = await supabase
        .from('MealIngredients')
        .insert(ingredientsToInsert);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Meal updated successfully!"
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating meal:', error);
      toast({
        title: "Error",
        description: "Failed to update meal. Please try again.",
        variant: "destructive"
      });
    }
    setSaving(false);
  };

  if (!meal) return null;

  const totals = calculateTotals();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Meal</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Meal Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="meal-type">Meal Type</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Breakfast">Breakfast</SelectItem>
                  <SelectItem value="Lunch">Lunch</SelectItem>
                  <SelectItem value="Dinner">Dinner</SelectItem>
                  <SelectItem value="Snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Current Totals */}
            <div className="bg-gradient-calm p-4 rounded-lg border border-primary/20">
              <h3 className="font-semibold mb-2">Current Totals</h3>
              <div className="flex gap-3 flex-wrap">
                <Badge variant="secondary">
                  {totals.calories.toFixed(0)} calories
                </Badge>
                <Badge variant="secondary">
                  Protein: {totals.protein.toFixed(1)}g
                </Badge>
                <Badge variant="secondary">
                  Carbs: {totals.carbs.toFixed(1)}g
                </Badge>
                <Badge variant="secondary">
                  Fat: {totals.fats.toFixed(1)}g
                </Badge>
              </div>
            </div>

            {/* Ingredients List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Ingredients</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowIngredientSearch(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Ingredient
                </Button>
              </div>

              {ingredients.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No ingredients added yet
                </p>
              ) : (
                <div className="space-y-2">
                  {ingredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{ingredient.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {ingredient.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm">
                          <p className="font-medium">{ingredient.calories} cal</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>P: {ingredient.protein}g</span>
                            <span>C: {ingredient.carbs}g</span>
                            <span>F: {ingredient.fats}g</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIngredient(ingredient.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showIngredientSearch && (
        <Dialog open={showIngredientSearch} onOpenChange={(open) => setShowIngredientSearch(open)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Ingredient</DialogTitle>
            </DialogHeader>
            <NutritionixIngredientSearch
              onIngredientAdd={addIngredient}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};