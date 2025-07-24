const NUTRITIONIX_API_KEY = 'ed0ec78a008c3fa2e91da84865d83a32';
const NUTRITIONIX_APP_ID = 'your-app-id'; // TODO: Replace with your actual Nutritionix App ID

export interface NutritionixFood {
  food_name: string;
  brand_name?: string;
  serving_qty: number;
  serving_unit: string;
  nf_calories: number;
  nf_total_fat: number;
  nf_saturated_fat: number;
  nf_cholesterol: number;
  nf_sodium: number;
  nf_total_carbohydrate: number;
  nf_dietary_fiber: number;
  nf_sugars: number;
  nf_protein: number;
  nf_potassium: number;
  nf_p: number;
  photo: {
    thumb: string;
  };
}

export interface NutritionixSearchResult {
  common: Array<{
    food_name: string;
    serving_unit: string;
    tag_name: string;
    serving_qty: number;
    common_type?: any;
    tag_id: string;
    photo: {
      thumb: string;
    };
    locale: string;
  }>;
  branded: Array<{
    food_name: string;
    serving_unit: string;
    nix_brand_id: string;
    brand_name_item_name: string;
    serving_qty: number;
    nf_calories: number;
    photo: {
      thumb: string;
    };
    brand_name: string;
    region: number;
    brand_type: number;
    nix_item_id: string;
    locale: string;
  }>;
}

class NutritionixAPI {
  private baseUrl = 'https://trackapi.nutritionix.com/v2';

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-app-id': NUTRITIONIX_APP_ID,
      'x-app-key': NUTRITIONIX_API_KEY,
    };
  }

  async searchFoods(query: string): Promise<NutritionixSearchResult> {
    const response = await fetch(`${this.baseUrl}/search/instant?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Nutritionix API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getNutritionDetails(query: string): Promise<NutritionixFood[]> {
    const response = await fetch(`${this.baseUrl}/natural/nutrients`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        query: query,
      }),
    });

    if (!response.ok) {
      throw new Error(`Nutritionix API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.foods;
  }

  async getNutritionForBrandedFood(nixItemId: string): Promise<NutritionixFood> {
    const response = await fetch(`${this.baseUrl}/search/item?nix_item_id=${nixItemId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Nutritionix API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.foods[0];
  }
}

export const nutritionixAPI = new NutritionixAPI();