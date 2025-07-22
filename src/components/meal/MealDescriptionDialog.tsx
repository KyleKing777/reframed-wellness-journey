import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MealDescriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMealType: string;
  userId: string;
  onMealLogged: (mealData: any) => void;
}

interface NutritionEstimate {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export const MealDescriptionDialog = ({ 
  isOpen, 
  onClose, 
  selectedMealType, 
  userId,
  onMealLogged 
}: MealDescriptionDialogProps) => {
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionEstimate, setNutritionEstimate] = useState<NutritionEstimate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleAnalyzeMeal = async () => {
    if (!description.trim()) {
      toast({
        title: "Please describe your meal",
        description: "Enter a description of what you ate so we can analyze it.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Get user's therapy preferences for personalized support
      const { data: userProfile } = await supabase
        .from('Users')
        .select('therapy_style')
        .eq('user_id', userId)
        .single();

      const therapyMode = userProfile?.therapy_style || 'ACT';

      // Use the chat-ai function for both nutrition analysis and therapeutic support
      const response = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Please analyze this meal description and provide:
1. Nutritional breakdown in this exact JSON format:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fats": number
}

2. A supportive, encouraging message about this meal choice that aligns with ${therapyMode} therapy principles for eating disorder recovery.

Meal description: "${description}"

Please structure your response with the JSON first, followed by your supportive message.`,
          therapyMode,
          userId
        }
      });

      if (response.error) throw response.error;

      if (response.data?.response) {
        // Parse the response to extract JSON and message
        const responseText = response.data.response;
        
        // Try to extract JSON from the response
        const jsonMatch = responseText.match(/\{[^}]*"calories"[^}]*\}/);
        
        if (jsonMatch) {
          try {
            const nutritionData = JSON.parse(jsonMatch[0]);
            setNutritionEstimate(nutritionData);
            
            // Extract the supportive message (everything after the JSON)
            const messageStart = responseText.indexOf(jsonMatch[0]) + jsonMatch[0].length;
            const supportiveMessage = responseText.substring(messageStart).trim();
            
            if (supportiveMessage) {
              toast({
                title: "Meal analyzed! 💚",
                description: supportiveMessage,
                duration: 8000,
              });
            }
          } catch (parseError) {
            throw new Error('Failed to parse nutrition data');
          }
        } else {
          throw new Error('No nutrition data found in response');
        }
      } else {
        throw new Error('Failed to analyze meal');
      }
    } catch (error) {
      console.error('Error analyzing meal:', error);
      toast({
        title: "Analysis failed",
        description: "We couldn't analyze your meal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEditDescription = () => {
    setNutritionEstimate(null);
  };

  const handleSaveMeal = async () => {
    if (!nutritionEstimate) return;

    setIsSaving(true);
    try {
      const { data: mealData, error: mealError } = await supabase
        .from('Meals')
        .insert({
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          meal_type: selectedMealType,
          name: description.trim(),
          total_calories: nutritionEstimate.calories,
          total_protein: nutritionEstimate.protein,
          total_carbs: nutritionEstimate.carbs,
          total_fat: nutritionEstimate.fats
        })
        .select()
        .single();

      if (mealError) throw mealError;

      toast({
        title: "Perfect!",
        description: "Your meal has been logged successfully.",
      });

      // Call the celebration callback
      onMealLogged({
        mealType: selectedMealType,
        totalCalories: nutritionEstimate.calories,
        totalProtein: nutritionEstimate.protein,
        totalCarbs: nutritionEstimate.carbs,
        totalFats: nutritionEstimate.fats
      });

      // Reset and close
      setDescription('');
      setNutritionEstimate(null);
      onClose();

    } catch (error) {
      console.error('Error saving meal:', error);
      toast({
        title: "Error saving meal",
        description: "There was a problem saving your meal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setDescription('');
    setNutritionEstimate(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md space-y-6">
        <DialogHeader>
          <DialogTitle className="text-center">Describe Your {selectedMealType}</DialogTitle>
        </DialogHeader>

        {!nutritionEstimate ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                What did you eat?
              </label>
              <Textarea
                placeholder="e.g., Grilled chicken breast with quinoa and steamed broccoli..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24 resize-none border-border/50 focus:border-primary"
                disabled={isAnalyzing}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isAnalyzing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAnalyzeMeal}
                disabled={isAnalyzing || !description.trim()}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Log This Meal!
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="bg-gradient-subtle border-primary/20">
              <CardContent className="pt-4 space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold text-foreground mb-2">Nutrition Estimate</h3>
                  <p className="text-xs text-muted-foreground mb-4">"{description}"</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <div className="text-lg font-bold text-primary">{nutritionEstimate.calories}</div>
                    <div className="text-xs text-muted-foreground">Calories</div>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <div className="text-lg font-bold text-foreground">{nutritionEstimate.protein}g</div>
                    <div className="text-xs text-muted-foreground">Protein</div>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <div className="text-lg font-bold text-foreground">{nutritionEstimate.carbs}g</div>
                    <div className="text-xs text-muted-foreground">Carbs</div>
                  </div>
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <div className="text-lg font-bold text-foreground">{nutritionEstimate.fats}g</div>
                    <div className="text-xs text-muted-foreground">Fats</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleEditDescription}
                className="flex-1"
                disabled={isSaving}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={handleSaveMeal}
                disabled={isSaving}
                className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Sounds Good!'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};