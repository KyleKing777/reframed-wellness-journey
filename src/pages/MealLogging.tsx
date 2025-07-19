import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Check, Heart, Utensils, Camera, FileText, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AddMealDialog } from '@/components/meal/AddMealDialog';

interface Ingredient {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface MealState {
  ingredients: Ingredient[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  mealType: string;
}

const mealTypes = [
  'Breakfast',
  'Lunch', 
  'Dinner',
  'Morning Snack',
  'Afternoon Snack',
  'Late Night Snack'
];

const MealLogging = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState(getMealTypeByTime());
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [currentMeal, setCurrentMeal] = useState<MealState>({
    ingredients: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    mealType: getMealTypeByTime()
  });

  // Update meal type if passed from navigation
  useEffect(() => {
    if (location.state?.mealType) {
      setSelectedMealType(location.state.mealType);
      setCurrentMeal(prev => ({
        ...prev,
        mealType: location.state.mealType
      }));
    }
  }, [location.state]);

  function getMealTypeByTime(): string {
    const hour = new Date().getHours();
    
    if (hour >= 4 && hour < 11) return 'Breakfast';
    if (hour >= 11 && hour < 15) return 'Lunch';
    if (hour >= 15 && hour < 18) return 'Afternoon Snack';
    if (hour >= 18 || hour < 4) return 'Dinner';
    
    return 'Morning Snack';
  }

  const handleAddMeal = () => {
    setSelectedMealType(getMealTypeByTime());
    setIsAddMealOpen(true);
  };

  const handleAddByIngredient = () => {
    setIsAddMealOpen(false);
    setShowIngredientForm(true);
  };

  const handleAddByDescription = () => {
    setIsAddMealOpen(false);
    // TODO: Implement description-based meal logging
    console.log('Add by description - to be implemented');
  };

  const handleAddByPhoto = () => {
    setIsAddMealOpen(false);
    // TODO: Implement photo-based meal logging
    console.log('Add by photo - to be implemented');
  };

  // Sample nutrition data - in a real app, this would come from an external API
  const sampleNutritionData: Record<string, Omit<Ingredient, 'quantity'>> = {
    'banana': { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fats: 0.4 },
    'apple': { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
    'oatmeal': { name: 'Oatmeal (1 cup)', calories: 147, protein: 5.3, carbs: 25, fats: 2.8 },
    'chicken breast': { name: 'Chicken Breast (100g)', calories: 231, protein: 43.5, carbs: 0, fats: 5 },
    'brown rice': { name: 'Brown Rice (1 cup)', calories: 216, protein: 5, carbs: 45, fats: 1.8 },
    'avocado': { name: 'Avocado (half)', calories: 234, protein: 2.9, carbs: 12, fats: 21.4 },
    'Greek yogurt': { name: 'Greek Yogurt (1 cup)', calories: 130, protein: 23, carbs: 9, fats: 0 },
    'almonds': { name: 'Almonds (28g)', calories: 164, protein: 6, carbs: 6, fats: 14 },
    'broccoli': { name: 'Broccoli (1 cup)', calories: 55, protein: 4, carbs: 11, fats: 0.6 },
    'sweet potato': { name: 'Sweet Potato (medium)', calories: 112, protein: 2, carbs: 26, fats: 0.1 }
  };

  const filteredIngredients = Object.keys(sampleNutritionData).filter(key =>
    key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addIngredient = (ingredientKey: string) => {
    const ingredient = sampleNutritionData[ingredientKey];
    if (!ingredient) return;

    const quantity = prompt(`How much ${ingredient.name}?`, '1 serving') || '1 serving';
    
    const newIngredient: Ingredient = {
      ...ingredient,
      quantity
    };

    setSelectedIngredients(prev => [...prev, newIngredient]);
    updateMealTotals([...selectedIngredients, newIngredient]);
    setSearchTerm('');
  };

  const updateMealTotals = (ingredients: Ingredient[]) => {
    const totals = ingredients.reduce(
      (acc, ingredient) => ({
        totalCalories: acc.totalCalories + ingredient.calories,
        totalProtein: acc.totalProtein + ingredient.protein,
        totalCarbs: acc.totalCarbs + ingredient.carbs,
        totalFats: acc.totalFats + ingredient.fats,
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 }
    );

    setCurrentMeal(prev => ({
      ...prev,
      ingredients,
      mealType: selectedMealType,
      ...totals
    }));
  };

  const completeMeal = async () => {
    if (selectedIngredients.length === 0) {
      toast({
        title: "No ingredients added",
        description: "Please add some ingredients to your meal first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Save meal to database
      const { data: mealData, error: mealError } = await supabase
        .from('Meals')
        .insert({
          user_id: user?.id,
          date: new Date().toISOString().split('T')[0],
          meal_type: currentMeal.mealType,
          total_calories: currentMeal.totalCalories,
          total_protein: currentMeal.totalProtein,
          total_carbs: currentMeal.totalCarbs,
          total_fat: currentMeal.totalFats
        })
        .select()
        .single();

      if (mealError) throw mealError;

      // Save ingredients
      const ingredientPromises = selectedIngredients.map(ingredient =>
        supabase.from('MealIngredients').insert({
          meal_id: mealData.id.toString(),
          name: ingredient.name,
          quantity: ingredient.quantity,
          calories: ingredient.calories,
          protein: ingredient.protein,
          carbs: ingredient.carbs,
          fats: ingredient.fats
        })
      );

      await Promise.all(ingredientPromises);

      // Show success message
      toast({
        title: "Perfect! 🎉",
        description: "Your meal has been logged successfully. You're doing great!",
      });

      // Generate GPT encouragement (placeholder for now)
      generateEncouragement();

      // Reset form
      setSelectedIngredients([]);
      setCurrentMeal({
        ingredients: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
        mealType: getMealTypeByTime()
      });
      setShowIngredientForm(false);

    } catch (error) {
      console.error('Error saving meal:', error);
      toast({
        title: "Error saving meal",
        description: "There was a problem saving your meal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateEncouragement = () => {
    // Placeholder for GPT integration
    const encouragements = [
      "Your body is grateful for the nourishment you've provided! The nutrients from this meal will help repair tissues and boost your energy.",
      "Well done! The protein you've consumed will help build and maintain your muscles, while the carbs will fuel your brain.",
      "This is fantastic progress! Each meal is a step forward in your recovery journey. Your body is learning to trust you again.",
      "You're doing an amazing job! The variety of nutrients in this meal will support your metabolism and overall health."
    ];

    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    
    setTimeout(() => {
      toast({
        title: "You're doing amazing! 💚",
        description: randomEncouragement,
        duration: 6000
      });
    }, 1000);
  };

  // If showing ingredient form, render the ingredient logging interface
  if (showIngredientForm) {
    return (
      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Log Your Meal</h1>
          <p className="text-muted-foreground">Every bite is a step forward in your journey</p>
        </div>

        {/* Meal Type Selector */}
        <Card className="shadow-gentle">
          <CardContent className="pt-6">
            <div className="flex gap-2 mb-4">
              {mealTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedMealType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedMealType(type);
                    setCurrentMeal(prev => ({ ...prev, mealType: type }));
                  }}
                >
                  {type}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <Card className="shadow-gentle">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Search Results */}
            {searchTerm && (
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {filteredIngredients.map((key) => {
                  const ingredient = sampleNutritionData[key];
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => addIngredient(key)}
                    >
                      <div>
                        <p className="font-medium">{ingredient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {ingredient.calories} cal, {ingredient.protein}g protein
                        </p>
                      </div>
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Ingredients */}
        {selectedIngredients.length > 0 && (
          <Card className="shadow-gentle">
            <CardHeader>
              <CardTitle>Your {selectedMealType}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedIngredients.map((ingredient, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <div>
                    <p className="font-medium">{ingredient.name}</p>
                    <p className="text-sm text-muted-foreground">{ingredient.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{ingredient.calories} cal</p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>P: {ingredient.protein}g</span>
                      <span>C: {ingredient.carbs}g</span>
                      <span>F: {ingredient.fats}g</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Meal Totals */}
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">{currentMeal.totalCalories} calories</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <Badge variant="secondary">Protein: {currentMeal.totalProtein.toFixed(1)}g</Badge>
                  <Badge variant="secondary">Carbs: {currentMeal.totalCarbs.toFixed(1)}g</Badge>
                  <Badge variant="secondary">Fat: {currentMeal.totalFats.toFixed(1)}g</Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedIngredients([]);
                    updateMealTotals([]);
                  }}
                >
                  Clear All
                </Button>
                <Button 
                  onClick={completeMeal}
                  className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Perfect!
                </Button>
              </div>

              {/* Back Button */}
              <Button 
                variant="ghost" 
                className="w-full mt-4"
                onClick={() => setShowIngredientForm(false)}
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Encouraging Message */}
        <Card className="bg-gradient-healing border-primary/20 shadow-gentle">
          <CardContent className="pt-6 text-center">
            <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
            <p className="text-foreground font-medium mb-2">You're doing amazing!</p>
            <p className="text-sm text-muted-foreground">
              Every meal is a loving act of self-care. Your body appreciates the nourishment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main home page interface
  return (
    <div className="p-6 max-w-lg mx-auto">
      {/* Minimal Header */}
      <div className="mb-12">
        <h1 className="text-lg font-medium text-foreground mb-1">ReframED</h1>
        <p className="text-muted-foreground text-sm">Track your progress</p>
      </div>

      {/* Main Action */}
      <div className="space-y-8">
        <Button
          onClick={handleAddMeal}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-base font-medium transition-fast"
        >
          Add Meal
        </Button>

        {/* Meal Type Pills */}
        <div className="flex flex-wrap gap-2">
          {mealTypes.map((type) => (
            <button
              key={type}
              className={`px-3 py-1.5 rounded-full text-sm transition-fast ${
                selectedMealType === type 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-border'
              }`}
              onClick={() => setSelectedMealType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Simple Stats */}
      <div className="grid grid-cols-2 gap-4 mt-12">
        <div className="text-center p-4">
          <div className="text-xl font-semibold text-foreground">3</div>
          <p className="text-xs text-muted-foreground">Meals</p>
        </div>
        <div className="text-center p-4">
          <div className="text-xl font-semibold text-foreground">7</div>
          <p className="text-xs text-muted-foreground">Days</p>
        </div>
      </div>

      {/* Add Meal Dialog */}
      <AddMealDialog
        isOpen={isAddMealOpen}
        onClose={() => setIsAddMealOpen(false)}
        selectedMealType={selectedMealType}
        onMealTypeChange={setSelectedMealType}
        onAddByDescription={handleAddByDescription}
        onAddByIngredient={handleAddByIngredient}
        onAddByPhoto={handleAddByPhoto}
      />
    </div>
  );
};

export default MealLogging;
