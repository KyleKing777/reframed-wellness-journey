import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Scale, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, isToday, getDay } from 'date-fns';

interface WeightEntry {
  date: string;
  weight_kg: number;
}

interface MealData {
  date: string;
  total_calories: number;
}

const Health = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [macroData, setMacroData] = useState<MealData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHealthData();
    }
  }, [user]);

  // Sunday weight reminder system
  useEffect(() => {
    const checkSundayReminder = () => {
      const now = new Date();
      const dayOfWeek = getDay(now);
      const hour = now.getHours();
      
      // Sunday is 0, check if it's Sunday at 9 AM
      if (dayOfWeek === 0 && hour === 9) {
        const lastReminderDate = localStorage.getItem('lastWeightReminder');
        const today = format(now, 'yyyy-MM-dd');
        
        if (lastReminderDate !== today) {
          toast({
            title: "Weekly Weight Check-in",
            description: "It's time to record your weight for this week!",
            duration: 10000,
          });
          localStorage.setItem('lastWeightReminder', today);
        }
      }
    };

    // Check immediately and then every hour
    checkSundayReminder();
    const interval = setInterval(checkSundayReminder, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [toast]);

  const fetchHealthData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch weight tracking data for the last 8 weeks
      const eightWeeksAgo = format(subDays(new Date(), 56), 'yyyy-MM-dd');
      
      const { data: weightData, error: weightError } = await supabase
        .from('WeightTracking')
        .select('date, weight_kg')
        .eq('user_id', user.id)
        .gte('date', eightWeeksAgo)
        .order('date', { ascending: true });

      if (weightError) throw weightError;

      // Calculate average daily calories from meal logs for the last 2 weeks
      const twoWeeksAgo = format(subDays(new Date(), 14), 'yyyy-MM-dd');
      
      const { data: mealData, error: mealError } = await supabase
        .from('Meals')
        .select('date, total_calories')
        .eq('user_id', user.id)
        .gte('date', twoWeeksAgo)
        .order('date', { ascending: true });

      if (mealError) throw mealError;

      // Use real data if available, otherwise placeholder values
      setWeightData(weightData?.length ? weightData : [
        { date: format(subDays(new Date(), 49), 'yyyy-MM-dd'), weight_kg: 65.2 },
        { date: format(subDays(new Date(), 42), 'yyyy-MM-dd'), weight_kg: 65.8 },
        { date: format(subDays(new Date(), 35), 'yyyy-MM-dd'), weight_kg: 66.1 },
        { date: format(subDays(new Date(), 28), 'yyyy-MM-dd'), weight_kg: 66.7 },
        { date: format(subDays(new Date(), 21), 'yyyy-MM-dd'), weight_kg: 67.2 },
        { date: format(subDays(new Date(), 14), 'yyyy-MM-dd'), weight_kg: 67.8 },
        { date: format(subDays(new Date(), 7), 'yyyy-MM-dd'), weight_kg: 68.1 },
        { date: format(new Date(), 'yyyy-MM-dd'), weight_kg: 68.5 }
      ]);

      // Store meal data for average calculation
      const mealDataForAvg = mealData?.length ? mealData : [];
      setMacroData(mealDataForAvg);
    } catch (error) {
      console.error('Error fetching health data:', error);
      // Set placeholder data on error
      setWeightData([
        { date: format(subDays(new Date(), 49), 'yyyy-MM-dd'), weight_kg: 65.2 },
        { date: format(subDays(new Date(), 42), 'yyyy-MM-dd'), weight_kg: 65.8 },
        { date: format(subDays(new Date(), 35), 'yyyy-MM-dd'), weight_kg: 66.1 },
        { date: format(subDays(new Date(), 28), 'yyyy-MM-dd'), weight_kg: 66.7 },
        { date: format(subDays(new Date(), 21), 'yyyy-MM-dd'), weight_kg: 67.2 },
        { date: format(subDays(new Date(), 14), 'yyyy-MM-dd'), weight_kg: 67.8 },
        { date: format(subDays(new Date(), 7), 'yyyy-MM-dd'), weight_kg: 68.1 },
        { date: format(new Date(), 'yyyy-MM-dd'), weight_kg: 68.5 }
      ]);
      setMacroData([]);
    }
    setLoading(false);
  };


  const getWeightTrend = () => {
    if (weightData.length < 2) return null;
    
    const recent = weightData.slice(-2);
    const change = recent[1].weight_kg - recent[0].weight_kg;
    return {
      change,
      trend: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable'
    };
  };

  const getAverageCalories = () => {
    if (macroData.length === 0) return 2250; // Placeholder value for investors
    const total = macroData.reduce((sum, day) => sum + (day.total_calories || 0), 0);
    return Math.round(total / macroData.length);
  };

  const trend = getWeightTrend();
  const avgCalories = getAverageCalories();

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Health Overview</h1>
        <p className="text-muted-foreground">Track your progress and celebrate your journey</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-gentle">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Scale className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Current Weight</p>
                <p className="text-2xl font-bold">
                  {weightData.length > 0 ? `${weightData[weightData.length - 1].weight_kg} kg` : 'No data'}
                </p>
                {trend && (
                  <p className={`text-xs ${trend.change > 0 ? 'text-success' : trend.change < 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                    {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}kg from last entry
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-gentle">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Daily Calories</p>
                <p className="text-2xl font-bold">{avgCalories}</p>
                <p className="text-xs text-muted-foreground">Last 2 weeks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-gentle">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">
                  {trend ? (trend.trend === 'increasing' ? 'Up' : trend.trend === 'decreasing' ? 'Down' : 'Stable') : 'Tracking'}
                </p>
                <p className="text-xs text-muted-foreground">Weight trend</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Weight Chart */}
      <Card className="shadow-gentle">
        <CardHeader>
          <CardTitle>Weight Progress Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => format(new Date(date), 'MM/dd')}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                  formatter={(value: number) => [`${value} kg`, 'Weight']}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight_kg" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>


      {/* Encouragement */}
      <Card className="bg-gradient-healing border-primary/20 shadow-gentle">
        <CardContent className="pt-6 text-center">
          <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-foreground font-medium mb-2">You're making progress!</p>
          <p className="text-sm text-muted-foreground">
            Every data point represents your commitment to recovery. Your consistency is building a healthier relationship with your body.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Health;