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
import { MealDescriptionDialog } from '@/components/meal/MealDescriptionDialog';
import { EncouragementBubble } from '@/components/EncouragementBubble';
import { NutritionixIngredientSearch, type SelectedIngredient } from '@/components/meal/NutritionixIngredientSearch';
interface Ingredient {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  brand?: string;
}
interface MealState {
  ingredients: Ingredient[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  mealType: string;
}
const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Morning Snack', 'Afternoon Snack', 'Late Night Snack'];
const MealLogging = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const location = useLocation();
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
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [isEncouragementOpen, setIsEncouragementOpen] = useState(false);
  const [dynamicEncouragement, setDynamicEncouragement] = useState('Nourish your body with love today');
  const [mealsToday, setMealsToday] = useState(0);
  const [daysStrong, setDaysStrong] = useState(0);

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

  // Generate dynamic encouragement on load
  useEffect(() => {
    const generateDailyEncouragement = async () => {
      try {
        // Fetch today's meals for context
        const today = new Date().toISOString().split('T')[0];
        const { data: todayMeals } = await supabase
          .from('Meals')
          .select('meal_type, name, total_calories, total_protein, total_carbs, total_fat')
          .eq('user_id', user?.id)
          .eq('date', today);

        let mealContext = '';
        if (todayMeals && todayMeals.length > 0) {
          const mealsList = todayMeals.map(meal => 
            `${meal.meal_type}: ${meal.name || 'meal'}`
          ).join(', ');
          mealContext = ` Today you've already nourished yourself with: ${mealsList}. `;
        }

        const response = await supabase.functions.invoke('chat-ai', {
          body: {
            message: `Please provide a brief, encouraging message for someone starting their day of mindful eating and recovery.${mealContext}Keep it supportive and aligned with eating disorder recovery principles.`,
            therapyMode: 'ACT', // Default to ACT for daily encouragement
            userId: user?.id
          }
        });
        if (response.data?.response) {
          setDynamicEncouragement(response.data.response);
        }
      } catch (error) {
        console.error('Error generating encouragement:', error);
      }
    };
    
    if (user?.id) {
      generateDailyEncouragement();
    }
  }, [user?.id]);

  // Fetch meal statistics
  useEffect(() => {
    const fetchMealStats = async () => {
      if (!user?.id) return;

      try {
        // Get today's meals count
        const today = new Date().toISOString().split('T')[0];
        const { data: todayMeals, error: todayError } = await supabase
          .from('Meals')
          .select('id')
          .eq('user_id', user.id)
          .eq('date', today);

        if (todayError) throw todayError;
        setMealsToday(todayMeals?.length || 0);

        // Calculate consecutive days streak
        const { data: allMeals, error: allMealsError } = await supabase
          .from('Meals')
          .select('date')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (allMealsError) throw allMealsError;

        if (allMeals && allMeals.length > 0) {
          // Get unique dates and calculate streak
          const uniqueDates = [...new Set(allMeals.map(meal => meal.date))].sort((a, b) => b.localeCompare(a));
          
          let streak = 0;
          const today = new Date();
          
          for (let i = 0; i < uniqueDates.length; i++) {
            const mealDate = new Date(uniqueDates[i]);
            const daysDiff = Math.floor((today.getTime() - mealDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === i) {
              streak++;
            } else {
              break;
            }
          }
          
          setDaysStrong(streak);
        }
      } catch (error) {
        console.error('Error fetching meal stats:', error);
      }
    };

    fetchMealStats();
  }, [user?.id]);

  // Function to refresh meal stats (used after completing a meal)
  const refreshMealStats = async () => {
    if (!user?.id) return;

    try {
      // Get today's meals count
      const today = new Date().toISOString().split('T')[0];
      const { data: todayMeals, error: todayError } = await supabase
        .from('Meals')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today);

      if (todayError) throw todayError;
      setMealsToday(todayMeals?.length || 0);

      // Calculate consecutive days streak
      const { data: allMeals, error: allMealsError } = await supabase
        .from('Meals')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (allMealsError) throw allMealsError;

      if (allMeals && allMeals.length > 0) {
        // Get unique dates and calculate streak
        const uniqueDates = [...new Set(allMeals.map(meal => meal.date))].sort((a, b) => b.localeCompare(a));
        
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < uniqueDates.length; i++) {
          const mealDate = new Date(uniqueDates[i]);
          const daysDiff = Math.floor((today.getTime() - mealDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === i) {
            streak++;
          } else {
            break;
          }
        }
        
        setDaysStrong(streak);
      }
    } catch (error) {
      console.error('Error refreshing meal stats:', error);
    }
  };
  function getMealTypeByTime(): string {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Breakfast';
    if (hour >= 11 && hour < 15) return 'Lunch';
    if (hour >= 15 && hour < 18) return 'Afternoon Snack';
    if (hour >= 18 || hour < 4) return 'Dinner';
    return 'Morning Snack';
  }
  const handleAddMeal = () => {
    // Don't override user's meal type selection - only set if no selection exists
    if (!selectedMealType) {
      setSelectedMealType(getMealTypeByTime());
    }
    setIsAddMealOpen(true);
  };
  const handleAddByIngredient = () => {
    setIsAddMealOpen(false);
    setShowIngredientForm(true);
  };
  const handleAddByDescription = () => {
    setIsAddMealOpen(false);
    setIsDescriptionDialogOpen(true);
  };
  const handleAddByPhoto = () => {
    setIsAddMealOpen(false);
    // TODO: Implement photo-based meal logging
    console.log('Add by photo - to be implemented');
  };

  const handleNutritionixIngredientAdd = (ingredient: SelectedIngredient) => {
    const newIngredient: Ingredient = {
      name: ingredient.name,
      quantity: ingredient.quantity,
      calories: ingredient.calories,
      protein: ingredient.protein,
      carbs: ingredient.carbs,
      fats: ingredient.fats,
      brand: ingredient.brand
    };
    setSelectedIngredients(prev => [...prev, newIngredient]);
    updateMealTotals([...selectedIngredients, newIngredient]);
  };

  const updateIngredientQuantity = (index: number, newQuantity: string) => {
    setSelectedIngredients(prev => {
      const updatedIngredients = prev.map((ingredient, i) => {
        if (i === index) {
          // Parse the original quantity to get the multiplier
          const originalQuantity = parseFloat(ingredient.quantity.split(' ')[0]) || 1;
          const newQuantityNum = parseFloat(newQuantity) || 1;
          
          // Get the unit from the original quantity
          const unit = ingredient.quantity.split(' ').slice(1).join(' ') || 'serving';
          
          return {
            ...ingredient,
            quantity: `${newQuantity} ${unit}`,
            calories: Math.round((ingredient.calories / originalQuantity) * newQuantityNum),
            protein: Math.round(((ingredient.protein / originalQuantity) * newQuantityNum) * 10) / 10,
            carbs: Math.round(((ingredient.carbs / originalQuantity) * newQuantityNum) * 10) / 10,
            fats: Math.round(((ingredient.fats / originalQuantity) * newQuantityNum) * 10) / 10,
          };
        }
        return ingredient;
      });
      
      updateMealTotals(updatedIngredients);
      return updatedIngredients;
    });
  };
  const updateMealTotals = (ingredients: Ingredient[]) => {
    const totals = ingredients.reduce((acc, ingredient) => ({
      totalCalories: acc.totalCalories + ingredient.calories,
      totalProtein: acc.totalProtein + ingredient.protein,
      totalCarbs: acc.totalCarbs + ingredient.carbs,
      totalFats: acc.totalFats + ingredient.fats
    }), {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0
    });
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
      const {
        data: mealData,
        error: mealError
      } = await supabase.from('Meals').insert({
        user_id: user?.id,
        date: new Date().toISOString().split('T')[0],
        meal_type: currentMeal.mealType,
        total_calories: currentMeal.totalCalories,
        total_protein: currentMeal.totalProtein,
        total_carbs: currentMeal.totalCarbs,
        total_fat: currentMeal.totalFats
      }).select().single();
      if (mealError) throw mealError;

      // Save ingredients
      const ingredientPromises = selectedIngredients.map(ingredient => supabase.from('MealIngredients').insert({
        meal_id: mealData.id,
        name: ingredient.name,
        quantity: ingredient.quantity,
        calories: ingredient.calories,
        protein: ingredient.protein,
        carbs: ingredient.carbs,
        fats: ingredient.fats
      }));
      await Promise.all(ingredientPromises);

      // Show success message
      toast({
        title: "Perfect!",
        description: "Your meal has been logged successfully. You're doing great!"
      });

      // Generate GPT encouragement
      generateEncouragement();

      // Refresh meal stats
      refreshMealStats();

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
  const generateEncouragement = async (mealData?: any) => {
    try {
      // Get user's therapy preferences
      const { data: userProfile } = await supabase
        .from('Users')
        .select('therapy_style')
        .eq('user_id', user?.id)
        .maybeSingle();

      const therapyMode = userProfile?.therapy_style || 'ACT';
      const meal = mealData || currentMeal;

      // Create detailed meal description
      const ingredientsList = selectedIngredients.map(ing => `${ing.quantity} ${ing.name}`).join(', ');
      const mealDescription = `${meal.mealType}: ${ingredientsList}. Total nutrition: ${meal.totalCalories} calories, ${meal.totalProtein}g protein, ${meal.totalCarbs}g carbs, ${meal.totalFats}g fats.`;

      const response = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Please celebrate this meal I just logged: ${mealDescription}. Focus on why eating this meal supports my recovery and health. Be specific about the foods I ate and their nutritional benefits.`,
          therapyMode,
          userId: user?.id,
          isMealEncouragement: true,
          mealDetails: {
            type: meal.mealType,
            ingredients: selectedIngredients,
            nutrition: {
              calories: meal.totalCalories,
              protein: meal.totalProtein,
              carbs: meal.totalCarbs,
              fats: meal.totalFats
            }
          }
        }
      });
      
      if (response.data?.response) {
        setTimeout(() => {
          setEncouragementMessage(response.data.response);
          setIsEncouragementOpen(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error generating encouragement:', error);
      // Fallback to toast with specific meal details
      const ingredientsList = selectedIngredients.map(ing => ing.name).join(', ');
      const fallbackMessage = `Amazing work logging your ${currentMeal.mealType.toLowerCase()} with ${ingredientsList}! You're nourishing your body with ${Math.round(currentMeal.totalCalories)} calories of goodness. Every meal is a step forward! 💚`;
      setTimeout(() => {
        toast({
          title: "You're doing amazing! 💚",
          description: fallbackMessage,
          duration: 6000
        });
      }, 1000);
    }
  };
  const handleMealLogged = (mealData: any) => {
    generateEncouragement(mealData);
    refreshMealStats(); // Refresh stats after meal is logged
  };

  // If showing ingredient form, render the ingredient logging interface
  if (showIngredientForm) {
    return <div className="p-4 space-y-6 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Log Your Meal</h1>
          <p className="text-muted-foreground">Every bite is a step forward in your journey</p>
        </div>

        {/* Meal Type Selector */}
        <Card className="shadow-gentle">
          <CardContent className="pt-6">
            <div className="flex gap-2 mb-4">
              {mealTypes.map(type => <Button key={type} variant={selectedMealType === type ? 'default' : 'outline'} size="sm" onClick={() => {
              setSelectedMealType(type);
              setCurrentMeal(prev => ({
                ...prev,
                mealType: type
              }));
            }}>
                  {type}
                </Button>)}
            </div>
          </CardContent>
        </Card>

        {/* Nutritionix Search */}
        <NutritionixIngredientSearch onIngredientAdd={handleNutritionixIngredientAdd} />

        {/* Selected Ingredients */}
        {selectedIngredients.length > 0 && <Card className="shadow-gentle">
            <CardHeader>
              <CardTitle>Your {selectedMealType}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedIngredients.map((ingredient, index) => <div key={index} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{ingredient.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <label className="text-xs text-muted-foreground">
                        Quantity:
                      </label>
                      <Input
                        type="number"
                        value={parseFloat(ingredient.quantity.split(' ')[0]) || 1}
                        onChange={(e) => updateIngredientQuantity(index, e.target.value)}
                        className="w-16 h-6 text-xs"
                        min="0.1"
                        step="0.1"
                      />
                      <span className="text-xs text-muted-foreground">
                        {ingredient.quantity.split(' ').slice(1).join(' ') || 'serving'}
                      </span>
                    </div>
                    {ingredient.brand && (
                      <p className="text-xs text-muted-foreground/80 mt-1">{ingredient.brand}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{ingredient.calories} cal</p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>P: {ingredient.protein}g</span>
                      <span>C: {ingredient.carbs}g</span>
                      <span>F: {ingredient.fats}g</span>
                    </div>
                  </div>
                </div>)}

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
                <Button variant="outline" className="flex-1" onClick={() => {
              setSelectedIngredients([]);
              updateMealTotals([]);
            }}>
                  Clear All
                </Button>
                <Button onClick={completeMeal} className="flex-1 bg-success hover:bg-success/90 text-success-foreground">
                  <Heart className="w-4 h-4 mr-2" />
                  Perfect!
                </Button>
              </div>

              {/* Back Button */}
              <Button variant="ghost" className="w-full mt-4" onClick={() => setShowIngredientForm(false)}>
                Back to Home
              </Button>
            </CardContent>
          </Card>}

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
      </div>;
  }

  // Main home page interface
  return <div className="p-6 max-w-lg mx-auto">
      {/* Bubbly Header */}
      <div className="mb-8 text-center">
        <h1 className="font-bold bg-gradient-primary bg-clip-text text-transparent mb-4 text-3xl text-center">ReframED</h1>
        
        {/* Main Action - moved closer to header */}
        <Button onClick={handleAddMeal} className="w-full h-16 bg-gradient-primary hover:scale-105 text-primary-foreground rounded-2xl text-lg font-semibold shadow-gentle transition-all duration-300 transform">
          Add Meal
        </Button>
      </div>

      <div className="space-y-8">

        {/* Bubbly Meal Type Pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {mealTypes.map(type => <button key={type} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${selectedMealType === type ? 'bg-gradient-primary text-primary-foreground shadow-gentle' : 'bg-card text-card-foreground hover:bg-accent border border-border/50'}`} onClick={() => setSelectedMealType(type)}>
              {type}
            </button>)}
        </div>
      </div>

      {/* Bubbly Stats */}
      <div className="grid grid-cols-2 gap-4 mt-12">
        <div className="text-center p-6 bg-gradient-healing rounded-xl shadow-gentle border border-primary/10">
          <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">{mealsToday}</div>
          <p className="text-xs text-muted-foreground mt-1">Meals Today</p>
        </div>
        <div className="text-center p-6 bg-gradient-healing rounded-xl shadow-gentle border border-primary/10">
          <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">{daysStrong}</div>
          <p className="text-xs text-muted-foreground mt-1">Days Strong</p>
        </div>
      </div>

      {/* Add Meal Dialog */}
      <AddMealDialog isOpen={isAddMealOpen} onClose={() => setIsAddMealOpen(false)} selectedMealType={selectedMealType} onMealTypeChange={setSelectedMealType} onAddByDescription={handleAddByDescription} onAddByIngredient={handleAddByIngredient} onAddByPhoto={handleAddByPhoto} />

      {/* Meal Description Dialog */}
      <MealDescriptionDialog isOpen={isDescriptionDialogOpen} onClose={() => setIsDescriptionDialogOpen(false)} selectedMealType={selectedMealType} userId={user?.id || ''} onMealLogged={handleMealLogged} />

      {/* Encouragement Bubble */}
      <EncouragementBubble isOpen={isEncouragementOpen} onClose={() => setIsEncouragementOpen(false)} message={encouragementMessage} />
    </div>;
};
export default MealLogging;