
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Utensils, Camera, FileText, List } from 'lucide-react';
import { AddMealDialog } from '@/components/meal/AddMealDialog';

const mealTypes = [
  'Breakfast',
  'Lunch', 
  'Dinner',
  'Morning Snack',
  'Afternoon Snack',
  'Late Night Snack'
];

const Home = () => {
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('Breakfast');

  const getMealTypeTime = () => {
    const hour = new Date().getHours();
    
    if (hour >= 4 && hour < 11) return 'Breakfast';
    if (hour >= 11 && hour < 15) return 'Lunch';
    if (hour >= 15 && hour < 18) return 'Afternoon Snack';
    if (hour >= 18 || hour < 4) return 'Dinner';
    
    return 'Morning Snack';
  };

  const handleAddMeal = () => {
    setSelectedMealType(getMealTypeTime());
    setIsAddMealOpen(true);
  };

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back!</h1>
        <p className="text-muted-foreground">Every meal is a step forward in your healing journey</p>
      </div>

      {/* Main Add Meal Section */}
      <Card className="shadow-gentle border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-gradient-healing rounded-full flex items-center justify-center mb-4">
              <Utensils className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Ready to nourish yourself?</h2>
              <p className="text-muted-foreground text-sm">Track your meal and celebrate this act of self-care</p>
            </div>

            <Button
              onClick={handleAddMeal}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg font-medium"
            >
              <Plus className="w-6 h-6 mr-2" />
              Add a Meal
            </Button>

            {/* Meal Type Selector */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Select meal type:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {mealTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={selectedMealType === type ? 'default' : 'outline'}
                    className={`cursor-pointer transition-colors ${
                      selectedMealType === type 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => setSelectedMealType(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-gentle">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">3</div>
              <p className="text-sm text-muted-foreground">Meals Today</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-gentle">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">7</div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Encouragement Card */}
      <Card className="bg-gradient-healing border-primary/20 shadow-gentle">
        <CardContent className="pt-6 text-center">
          <h3 className="font-semibold text-foreground mb-2">You're doing wonderful! 💚</h3>
          <p className="text-sm text-muted-foreground">
            Each meal you log is an act of kindness toward yourself. Your body appreciates the nourishment and care.
          </p>
        </CardContent>
      </Card>

      {/* Add Meal Dialog */}
      <AddMealDialog
        isOpen={isAddMealOpen}
        onClose={() => setIsAddMealOpen(false)}
        selectedMealType={selectedMealType}
        onMealTypeChange={setSelectedMealType}
      />
    </div>
  );
};

export default Home;
