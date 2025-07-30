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
  const { user } = useAuth();
  const { toast } = useToast();
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
  const [showMealOptions, setShowMealOptions] = useState(false);

  function getMealTypeByTime(): string {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Breakfast';
    if (hour >= 11 && hour < 15) return 'Lunch';
    if (hour >= 15 && hour < 19) return 'Dinner';
    if (hour >= 19 && hour < 22) return 'Late Night Snack';
    return 'Morning Snack';
  }

  // Simple meal statistics
  useEffect(() => {
    const fetchMealStats = async () => {
      if (!user?.id) return;

      try {
        // Get today's date (simple calendar date)
        const today = new Date().toISOString().split('T')[0];
        console.log('📅 Checking meals for date:', today);

        // Count today's meals
        const { data: todayMeals } = await supabase
          .from('Meals')
          .select('id')
          .eq('user_id', user.id)
          .eq('date', today);

        const todayCount = todayMeals?.length || 0;
        console.log('🍽️ Meals today:', todayCount);
        setMealsToday(todayCount);

        // Get all meal dates
        const { data: allMeals } = await supabase
          .from('Meals')
          .select('date')
          .eq('user_id', user.id);

        if (allMeals) {
          // Get unique dates sorted newest first
          const uniqueDates = [...new Set(allMeals.map(meal => meal.date))].sort((a, b) => b.localeCompare(a));
          console.log('📅 All unique meal dates:', uniqueDates);

          // Count consecutive days starting from today
          let consecutiveDays = 0;
          const todayDate = new Date(today);

          for (let i = 0; i < 365; i++) { // Check up to a year back
            const checkDate = new Date(todayDate);
            checkDate.setDate(checkDate.getDate() - i);
            const checkDateStr = checkDate.toISOString().split('T')[0];
            
            if (uniqueDates.includes(checkDateStr)) {
              consecutiveDays++;
              console.log(`✅ Found meals on ${checkDateStr} (${i} days ago)`);
            } else {
              console.log(`❌ No meals on ${checkDateStr} (${i} days ago) - stopping count`);
              break;
            }
          }

          console.log('🔥 Consecutive days:', consecutiveDays);
          setDaysStrong(consecutiveDays);
        }

      } catch (error) {
        console.error('Error fetching meal stats:', error);
      }
    };

    fetchMealStats();
  }, [user?.id]);

  const handleIngredientSelect = (ingredient: SelectedIngredient) => {
    setSelectedIngredients([...selectedIngredients, ingredient]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = [...selectedIngredients];
    newIngredients.splice(index, 1);
    setSelectedIngredients(newIngredients);
  };

  const calculateTotals = (ingredients: Ingredient[]) => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    ingredients.forEach(ingredient => {
      totalCalories += ingredient.calories;
      totalProtein += ingredient.protein;
      totalCarbs += ingredient.carbs;
      totalFats += ingredient.fats;
    });

    return { totalCalories, totalProtein, totalCarbs, totalFats };
  };

  const handleUpdateMeal = (updatedMeal: MealState) => {
    setCurrentMeal(updatedMeal);
  };
  
  const handleMealLogged = async () => {
    // Refresh stats after meal is added
    if (!user?.id) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data: todayMeals } = await supabase
      .from('Meals')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today);
    
    setMealsToday(todayMeals?.length || 0);
    
    const { data: allMeals } = await supabase
      .from('Meals')
      .select('date')
      .eq('user_id', user.id);

    if (allMeals) {
      const uniqueDates = [...new Set(allMeals.map(meal => meal.date))].sort((a, b) => b.localeCompare(a));
      let consecutiveDays = 0;
      const todayDate = new Date(today);

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(todayDate);
        checkDate.setDate(checkDate.getDate() - i);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        
        if (uniqueDates.includes(checkDateStr)) {
          consecutiveDays++;
        } else {
          break;
        }
      }
      
      setDaysStrong(consecutiveDays);
    }

    setIsDescriptionDialogOpen(false);
    
    // Generate and show encouragement
    try {
      const response = await supabase.functions.invoke('meal-encouragement', {
        body: {
          type: 'meal-celebration',
          mealData: {
            mealType: selectedMealType,
            totalCalories: currentMeal.totalCalories || 0,
            totalProtein: currentMeal.totalProtein || 0,
            totalCarbs: currentMeal.totalCarbs || 0,
            totalFats: currentMeal.totalFats || 0
          }
        }
      });
      
      if (response.data?.encouragement) {
        setEncouragementMessage(response.data.encouragement);
        setIsEncouragementOpen(true);
      }
    } catch (error) {
      console.error('Error generating encouragement:', error);
    }
  };

  const handleAddByDescription = () => {
    setIsAddMealOpen(false);
    setIsDescriptionDialogOpen(true);
  };

  const handleAddByIngredient = () => {
    setIsAddMealOpen(false);
    setShowIngredientForm(true);
  };

  const handleAddByPhoto = () => {
    setIsAddMealOpen(false);
    toast({
      title: "Coming Soon!",
      description: "Photo meal logging will be available soon.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10">
      <div className="max-w-md mx-auto px-6 py-12 space-y-8">
        {/* Hero Question */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-foreground">What are you having?</h1>
        </div>

        {/* Meal Type Selector */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Select meal type</label>
            <select
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-background text-foreground focus:border-primary focus:outline-none transition-colors"
            >
              {mealTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Dialog Box */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6 space-y-4">
          {!showMealOptions ? (
            <button
              onClick={() => setShowMealOptions(true)}
              className="w-full p-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors duration-200"
            >
              Add a meal
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleAddByDescription}
                className="w-full p-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors duration-200"
              >
                Add by Description
              </button>
              
              <button
                onClick={handleAddByIngredient}
                className="w-full p-4 rounded-xl border border-border hover:border-primary/50 bg-background hover:bg-accent/30 text-foreground font-medium transition-all duration-200"
              >
                Add by Ingredient
              </button>
              
              <button
                onClick={handleAddByPhoto}
                className="w-full p-4 rounded-xl border border-border hover:border-primary/50 bg-background hover:bg-accent/30 text-foreground font-medium transition-all duration-200"
              >
                Add by Photo
              </button>

              <button
                onClick={() => setShowMealOptions(false)}
                className="w-full p-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back
              </button>
            </div>
          )}
        </div>

        {/* Stats Below */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-6 bg-card rounded-xl border border-border shadow-sm">
            <div className="text-3xl font-bold text-primary">{daysStrong}</div>
            <p className="text-sm text-muted-foreground mt-1">Days Strong</p>
          </div>
          <div className="text-center p-6 bg-card rounded-xl border border-border shadow-sm">
            <div className="text-3xl font-bold text-primary">{mealsToday}</div>
            <p className="text-sm text-muted-foreground mt-1">Meals Today</p>
          </div>
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

      {/* Meal Description Dialog */}
      <MealDescriptionDialog 
        isOpen={isDescriptionDialogOpen} 
        onClose={() => setIsDescriptionDialogOpen(false)} 
        selectedMealType={selectedMealType} 
        userId={user?.id || ''} 
        onMealLogged={handleMealLogged} 
      />

      {/* Encouragement Bubble */}
      <EncouragementBubble
        isOpen={isEncouragementOpen}
        onClose={() => setIsEncouragementOpen(false)}
        message={encouragementMessage}
      />
    </div>
  );
};

export default MealLogging;
