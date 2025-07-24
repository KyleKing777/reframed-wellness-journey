import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Package } from 'lucide-react';
import { nutritionixAPI, type NutritionixSearchResult } from '@/lib/nutritionix';
import { useToast } from '@/hooks/use-toast';

export interface SelectedIngredient {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  brand?: string;
  nixItemId?: string;
}

interface NutritionixIngredientSearchProps {
  onIngredientAdd: (ingredient: SelectedIngredient) => void;
}

export const NutritionixIngredientSearch = ({ onIngredientAdd }: NutritionixIngredientSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<NutritionixSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const { toast } = useToast();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.length > 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await nutritionixAPI.searchFoods(searchTerm);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          toast({
            title: "Search Error",
            description: "Unable to search for foods. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsSearching(false);
        }
      }, 500);
    } else {
      setSearchResults(null);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, toast]);

  const handleSelectFood = (food: any, isBranded: boolean = false) => {
    setSelectedItem({ ...food, isBranded });
    setQuantity('1');
  };

  const handleAddIngredient = async () => {
    if (!selectedItem) return;

    try {
      let nutritionData;
      
      if (selectedItem.isBranded) {
        // For branded foods, get detailed nutrition info
        nutritionData = await nutritionixAPI.getNutritionForBrandedFood(selectedItem.nix_item_id);
      } else {
        // For common foods, use natural language query
        const query = `${quantity} ${selectedItem.serving_unit || ''} ${selectedItem.food_name}`.trim();
        const foods = await nutritionixAPI.getNutritionDetails(query);
        nutritionData = foods[0];
      }

      if (nutritionData) {
        const ingredient: SelectedIngredient = {
          name: nutritionData.food_name,
          quantity: `${quantity} ${nutritionData.serving_unit || selectedItem.serving_unit || 'serving'}`,
          calories: Math.round(nutritionData.nf_calories),
          protein: Math.round(nutritionData.nf_protein * 10) / 10,
          carbs: Math.round(nutritionData.nf_total_carbohydrate * 10) / 10,
          fats: Math.round(nutritionData.nf_total_fat * 10) / 10,
          brand: nutritionData.brand_name || selectedItem.brand_name,
          nixItemId: selectedItem.nix_item_id
        };

        onIngredientAdd(ingredient);
        setSelectedItem(null);
        setSearchTerm('');
        setSearchResults(null);
        setQuantity('1');

        toast({
          title: "Ingredient Added!",
          description: `${ingredient.name} has been added to your meal.`
        });
      }
    } catch (error) {
      console.error('Error getting nutrition details:', error);
      toast({
        title: "Error",
        description: "Unable to get nutrition information. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (selectedItem) {
    return (
      <Card className="shadow-gentle">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {selectedItem.photo?.thumb && (
                <img 
                  src={selectedItem.photo.thumb} 
                  alt={selectedItem.food_name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-medium">{selectedItem.food_name}</h3>
                {selectedItem.brand_name && (
                  <p className="text-sm text-muted-foreground">{selectedItem.brand_name}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Quantity:</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="flex-1"
                    min="0.1"
                    step="0.1"
                  />
                  <span className="px-3 py-2 bg-muted rounded-md text-sm flex items-center">
                    {selectedItem.serving_unit || 'serving'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddIngredient} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Meal
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedItem(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-gentle">
      <CardContent className="pt-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search for foods and brands..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="pl-10" 
          />
        </div>

        {isSearching && (
          <div className="mt-4 text-center text-muted-foreground">
            Searching...
          </div>
        )}

        {searchResults && (
          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
            {/* Common Foods */}
            {searchResults.common?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Common Foods</h4>
                <div className="space-y-2">
                  {searchResults.common.map((food, index) => (
                    <div 
                      key={`common-${index}`}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => handleSelectFood(food, false)}
                    >
                      <div className="flex items-center gap-3">
                        {food.photo?.thumb && (
                          <img 
                            src={food.photo.thumb} 
                            alt={food.food_name}
                            className="w-10 h-10 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{food.food_name}</p>
                          <p className="text-sm text-muted-foreground">
                            per {food.serving_qty} {food.serving_unit}
                          </p>
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Branded Foods */}
            {searchResults.branded?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Branded Products</h4>
                <div className="space-y-2">
                  {searchResults.branded.map((food, index) => (
                    <div 
                      key={`branded-${index}`}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => handleSelectFood(food, true)}
                    >
                      <div className="flex items-center gap-3">
                        {food.photo?.thumb && (
                          <img 
                            src={food.photo.thumb} 
                            alt={food.food_name}
                            className="w-10 h-10 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{food.food_name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Package className="w-3 h-3 mr-1" />
                              {food.brand_name}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {food.nf_calories} cal
                            </span>
                          </div>
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.common?.length === 0 && searchResults.branded?.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No foods found. Try a different search term.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};