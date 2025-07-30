import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar, ChevronDown, ChevronUp, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { MealDetailsDialog } from '@/components/meal/MealDetailsDialog';
import { EditMealDialog } from '@/components/meal/EditMealDialog';
import { DeleteMealDialog } from '@/components/meal/DeleteMealDialog';

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

const TodaysMeals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMeals, setOpenMeals] = useState<Record<number, boolean>>({});
  
  // Dialog states
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showMealDetails, setShowMealDetails] = useState(false);
  const [showEditMeal, setShowEditMeal] = useState(false);
  const [showDeleteMeal, setShowDeleteMeal] = useState(false);

  const getCurrentDateForApp = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // If it's before 4 AM, consider it the previous day
    if (currentHour < 4) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    }
    
    return now;
  };

  useEffect(() => {
    fetchMealsForDate(selectedDate);
  }, [selectedDate, user]);

  const fetchMealsForDate = async (date: Date) => {
    if (!user) return;

    setLoading(true);
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      
      // Fetch meals for the selected date
      const { data: mealsData, error: mealsError } = await supabase
        .from('Meals')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateString)
        .order('created_at', { ascending: true });

      if (mealsError) throw mealsError;

      // Fetch ingredients for each meal
      const mealsWithIngredients = await Promise.all(
        (mealsData || []).map(async (meal) => {
          const { data: ingredients, error: ingredientsError } = await supabase
            .from('MealIngredients')
            .select('*')
            .eq('meal_id', meal.id);

          if (ingredientsError) {
            console.error('Error fetching ingredients:', ingredientsError);
            return { ...meal, ingredients: [] };
          }

          return { ...meal, ingredients: ingredients || [] };
        })
      );

      setMeals(mealsWithIngredients);
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
    setLoading(false);
  };

  const toggleMeal = (mealId: number) => {
    setOpenMeals(prev => ({
      ...prev,
      [mealId]: !prev[mealId]
    }));
  };

  const getTotalMacros = () => {
    return meals.reduce(
      (totals, meal) => ({
        calories: totals.calories + (meal.total_calories || 0),
        protein: totals.protein + (meal.total_protein || 0),
        carbs: totals.carbs + (meal.total_carbs || 0),
        fat: totals.fat + (meal.total_fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const handleViewMealDetails = (meal: Meal) => {
    setSelectedMeal(meal);
    setShowMealDetails(true);
  };

  const handleEditMeal = (meal: Meal) => {
    setSelectedMeal(meal);
    setShowEditMeal(true);
    setShowMealDetails(false);
  };

  const handleDeleteMeal = (meal: Meal) => {
    setSelectedMeal(meal);
    setShowDeleteMeal(true);
    setShowMealDetails(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMeal) return;

    try {
      // Delete meal ingredients first
      const { error: ingredientsError } = await supabase
        .from('MealIngredients')
        .delete()
        .eq('meal_id', selectedMeal.id);

      if (ingredientsError) throw ingredientsError;

      // Delete the meal
      const { error: mealError } = await supabase
        .from('Meals')
        .delete()
        .eq('id', selectedMeal.id);

      if (mealError) throw mealError;

      toast({
        title: "Success",
        description: "Meal deleted successfully!"
      });

      // Refresh meals list
      fetchMealsForDate(selectedDate);
      setShowDeleteMeal(false);
      setSelectedMeal(null);
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast({
        title: "Error",
        description: "Failed to delete meal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const mealTypeOrder = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
  const sortedMeals = [...meals].sort((a, b) => {
    const aIndex = mealTypeOrder.indexOf(a.meal_type || '');
    const bIndex = mealTypeOrder.indexOf(b.meal_type || '');
    return aIndex - bIndex;
  });

  const dailyTotals = getTotalMacros();

  if (loading) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your meals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Your Meals</h1>
        <p className="text-muted-foreground">
          {format(selectedDate, 'EEEE, MMMM do, yyyy')}
        </p>
      </div>

      {/* Date Selector */}
      <Card className="shadow-gentle">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                const yesterday = new Date(selectedDate);
                yesterday.setDate(yesterday.getDate() - 1);
                setSelectedDate(yesterday);
              }}
            >
              Previous Day
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setSelectedDate(getCurrentDateForApp())}
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Today
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                const tomorrow = new Date(selectedDate);
                tomorrow.setDate(tomorrow.getDate() + 1);
                setSelectedDate(tomorrow);
              }}
              disabled={selectedDate >= getCurrentDateForApp()}
            >
              Next Day
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Meals List */}
      <div className="space-y-4">
        {sortedMeals.length === 0 ? (
          <Card className="shadow-gentle">
            <CardContent className="pt-6 text-center py-8">
              <div className="text-muted-foreground mb-4">
                <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No meals logged yet</p>
                <p className="text-sm">Start by adding your first meal of the day!</p>
              </div>
              <Button onClick={() => window.location.href = '/'}>
                Log a Meal
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedMeals.map((meal) => (
            <Card key={meal.id} className="shadow-gentle">
              <Collapsible>
                <CollapsibleTrigger 
                  className="w-full"
                  onClick={() => toggleMeal(meal.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{meal.meal_type}</CardTitle>
                        <Badge variant="secondary">
                          {meal.total_calories?.toFixed(0)} cal
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewMealDetails(meal);
                          }}
                          className="text-primary hover:text-primary"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditMeal(meal);
                          }}
                          className="text-primary hover:text-primary"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMeal(meal);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {openMeals[meal.id] ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div 
                      className="flex gap-2 text-sm cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewMealDetails(meal);
                      }}
                    >
                      <span className="text-muted-foreground hover:text-primary transition-colors">
                        P: {meal.total_protein?.toFixed(1)}g
                      </span>
                      <span className="text-muted-foreground hover:text-primary transition-colors">
                        C: {meal.total_carbs?.toFixed(1)}g
                      </span>
                      <span className="text-muted-foreground hover:text-primary transition-colors">
                        F: {meal.total_fat?.toFixed(1)}g
                      </span>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {meal.ingredients.map((ingredient) => (
                        <div
                          key={ingredient.id}
                          className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-sm">{ingredient.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {ingredient.quantity}
                            </p>
                          </div>
                          <div className="text-right text-xs">
                            <p className="font-medium">{ingredient.calories} cal</p>
                            <div className="flex gap-2 text-muted-foreground">
                              <span>P: {ingredient.protein}g</span>
                              <span>C: {ingredient.carbs}g</span>
                              <span>F: {ingredient.fats}g</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>

      {/* Daily Totals */}
      {sortedMeals.length > 0 && (
        <Card className="bg-gradient-calm border-primary/20 shadow-gentle">
          <CardHeader>
            <CardTitle className="text-center">Daily Totals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-primary">
                {dailyTotals.calories.toFixed(0)} calories
              </p>
            </div>
            <div className="flex justify-center gap-4 text-sm">
              <Badge variant="secondary">
                Protein: {dailyTotals.protein.toFixed(1)}g
              </Badge>
              <Badge variant="secondary">
                Carbs: {dailyTotals.carbs.toFixed(1)}g
              </Badge>
              <Badge variant="secondary">
                Fat: {dailyTotals.fat.toFixed(1)}g
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <MealDetailsDialog
        meal={selectedMeal}
        isOpen={showMealDetails}
        onClose={() => {
          setShowMealDetails(false);
          setSelectedMeal(null);
        }}
        onEdit={handleEditMeal}
        onDelete={handleDeleteMeal}
      />

      <EditMealDialog
        meal={selectedMeal}
        isOpen={showEditMeal}
        onClose={() => {
          setShowEditMeal(false);
          setSelectedMeal(null);
        }}
        onSave={() => {
          fetchMealsForDate(selectedDate);
          setShowEditMeal(false);
          setSelectedMeal(null);
        }}
      />

      <DeleteMealDialog
        meal={selectedMeal}
        isOpen={showDeleteMeal}
        onClose={() => {
          setShowDeleteMeal(false);
          setSelectedMeal(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default TodaysMeals;