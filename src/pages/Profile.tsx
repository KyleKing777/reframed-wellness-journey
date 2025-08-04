import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Edit3, Save, LogOut, Heart, Target, Utensils, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProfileEditDialog } from '@/components/ProfileEditDialog';

interface UserProfile {
  id: number;
  username: string | null;
  email: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal_weight_kg: number | null;
  weekly_weight_gain_goal: number | null;
  activity_level: string | null;
  avg_steps_per_day: number | null;
  therapy_style: string | null;
  therapist_description: string | null;
  gender: string | null;
  fear_foods: string[];
  bmr: number | null;
  tdee: number | null;
  daily_caloric_goal: number | null;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('Users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) throw error;
      
      // Handle the type conversion for fear_foods
      const profileData: UserProfile = {
        ...data,
        fear_foods: Array.isArray(data.fear_foods) ? data.fear_foods.filter((food): food is string => typeof food === 'string') : []
      };
      
      setProfile(profileData);
      
      // Auto-calculate and store health metrics if missing or if base data has changed
      await calculateAndStoreHealthMetrics(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const calculateAndStoreHealthMetrics = async (profileData: UserProfile) => {
    if (!profileData || !profileData.weight_kg || !profileData.height_cm || !profileData.age || !profileData.gender) {
      return; // Cannot calculate without required data
    }

    // Calculate the metrics using the provided data
    const calculatedBMR = calculateBMRFromData(profileData);
    const calculatedTDEE = calculateTDEEFromData(profileData, calculatedBMR);
    const calculatedCaloricGoal = calculateCaloricGoalFromData(profileData, calculatedTDEE);

    // Only update if values are missing or different
    if (profileData.bmr !== calculatedBMR || 
        profileData.tdee !== calculatedTDEE || 
        profileData.daily_caloric_goal !== calculatedCaloricGoal) {
      
      try {
        const { error } = await supabase
          .from('Users')
          .update({
            bmr: calculatedBMR,
            tdee: calculatedTDEE,
            daily_caloric_goal: calculatedCaloricGoal
          })
          .eq('id', profileData.id);

        if (error) throw error;

        // Update local state
        setProfile(prev => prev ? {
          ...prev,
          bmr: calculatedBMR,
          tdee: calculatedTDEE,
          daily_caloric_goal: calculatedCaloricGoal
        } : null);

      } catch (error) {
        console.error('Error updating health metrics:', error);
      }
    }
  };

  const updateProfile = async () => {
    if (!profile || !user) return;

    setSaving(true);
    try {
      // Calculate the health metrics
      const bmr = calculateBMR();
      const tdee = calculateTDEE();
      const dailyCaloricGoal = calculateCaloricGoal();

      const { error } = await supabase
        .from('Users')
        .update({
          username: profile.username,
          age: profile.age,
          height_cm: profile.height_cm,
          weight_kg: profile.weight_kg,
          goal_weight_kg: profile.goal_weight_kg,
          weekly_weight_gain_goal: profile.weekly_weight_gain_goal,
          activity_level: profile.activity_level,
          avg_steps_per_day: profile.avg_steps_per_day,
          therapy_style: profile.therapy_style,
          therapist_description: profile.therapist_description,
          gender: profile.gender,
          fear_foods: profile.fear_foods,
          bmr: bmr,
          tdee: tdee,
          daily_caloric_goal: dailyCaloricGoal
        })
        .eq('id', profile.id);

      if (error) throw error;

      // Update local state with calculated values
      setProfile({
        ...profile,
        bmr: bmr,
        tdee: tdee,
        daily_caloric_goal: dailyCaloricGoal
      });

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully.",
      });
      // Dialog will handle closing
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
    setSaving(false);
  };

  // Mifflin-St Jeor BMR calculation
  const calculateBMR = () => {
    if (!profile) return 0;
    return calculateBMRFromData(profile);
  };

  const calculateBMRFromData = (data: UserProfile) => {
    if (!data.weight_kg || !data.height_cm || !data.age || !data.gender) return 0;
    
    // Mifflin-St Jeor equation: more accurate than Harris-Benedict
    if (data.gender === 'male') {
      return Math.round((10 * data.weight_kg) + (6.25 * data.height_cm) - (5 * data.age) + 5);
    } else if (data.gender === 'female') {
      return Math.round((10 * data.weight_kg) + (6.25 * data.height_cm) - (5 * data.age) - 161);
    }
    return 0;
  };

  // Calculate Total Daily Energy Expenditure (TDEE)
  const calculateTDEE = () => {
    if (!profile) return 0;
    const bmr = calculateBMR();
    return calculateTDEEFromData(profile, bmr);
  };

  const calculateTDEEFromData = (data: UserProfile, bmr: number) => {
    if (!bmr) return 0;

    // Activity level multipliers based on standard TDEE calculations
    const activityMultipliers = {
      'sedentary': 1.2,         // Little to no exercise
      'lightly-active': 1.375,  // Light exercise 1-3 days/week
      'moderately-active': 1.55, // Moderate exercise 3-5 days/week
      'very-active': 1.725,     // Hard exercise 6-7 days/week
      'extremely-active': 1.9   // Very hard exercise, physical job
    };

    let tdee = bmr * (activityMultipliers[data.activity_level as keyof typeof activityMultipliers] || 1.2);

    // Additional step-based adjustment if steps significantly deviate from activity level expectations
    if (data.avg_steps_per_day) {
      const steps = data.avg_steps_per_day;
      let stepAdjustment = 0;
      
      // Adjust based on step count relative to activity level
      if (data.activity_level === 'sedentary' && steps > 5000) {
        stepAdjustment = steps * 0.03; // Extra calories for more steps than expected
      } else if (data.activity_level === 'lightly-active' && steps > 7500) {
        stepAdjustment = steps * 0.03;
      } else {
        stepAdjustment = steps * 0.03;
      }
      
      tdee += stepAdjustment;
    }

    return Math.round(tdee);
  };

  // Calculate daily caloric goal including surplus for weight gain
  const calculateCaloricGoal = () => {
    if (!profile) return 0;
    const tdee = calculateTDEE();
    return calculateCaloricGoalFromData(profile, tdee);
  };

  const calculateCaloricGoalFromData = (data: UserProfile, tdee: number) => {
    if (!tdee) return 0;

    let caloricGoal = tdee;

    // Add caloric surplus based on weekly weight gain goal
    if (data.weekly_weight_gain_goal) {
      // 1 kg = 2.2 lbs, 1 lb = ~3500 calories
      // So 1 kg = ~7700 calories
      const weeklyGoalKg = data.weekly_weight_gain_goal;
      const dailySurplus = (weeklyGoalKg * 7700) / 7; // Convert weekly goal to daily surplus
      caloricGoal += Math.round(dailySurplus);
    }

    return Math.round(caloricGoal);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "Take care of yourself! 💚",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <Card className="shadow-gentle">
          <CardContent className="pt-6 text-center py-8">
            <p className="text-muted-foreground">Profile not found. Please try refreshing the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use stored values from database, fallback to calculated values
  const bmr = profile.bmr || calculateBMR();
  const tdee = profile.tdee || calculateTDEE();
  const caloricGoal = profile.daily_caloric_goal || calculateCaloricGoal();

  // Debug logging
  console.log('Profile data:', profile);
  console.log('isEditDialogOpen:', isEditDialogOpen);

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-3">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Your Profile</h1>
        <p className="text-muted-foreground">Track your health metrics and recovery progress</p>
      </div>

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-gentle">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">BMR</p>
            <p className="text-2xl font-bold text-primary">{bmr}</p>
            <p className="text-xs text-muted-foreground">basal metabolic rate</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-gentle">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">TDEE</p>
            <p className="text-2xl font-bold text-primary">{tdee}</p>
            <p className="text-xs text-muted-foreground">maintenance calories</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-gentle">
          <CardContent className="pt-6 text-center">
            <Heart className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Daily Caloric Goal</p>
            <p className="text-2xl font-bold text-success">{caloricGoal}</p>
            <p className="text-xs text-muted-foreground">with weight gain surplus</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-gentle">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Weight Goal</p>
            <p className="text-2xl font-bold text-primary">{profile.goal_weight_kg || 0}</p>
            <p className="text-xs text-muted-foreground">kg target</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-gentle">
          <CardContent className="pt-6 text-center">
            <User className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Therapy Style</p>
            <p className="text-lg font-bold text-primary">{profile.therapy_style || 'Not set'}</p>
            <p className="text-xs text-muted-foreground">preference</p>
          </CardContent>
        </Card>
      </div>

      {/* Fear Foods Section */}
      <Card className="shadow-gentle">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            <CardTitle>Fear Foods</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Foods you're working to overcome:</p>
            <div className="text-sm text-muted-foreground italic">
              Coming soon - This feature will help you track and gradually overcome challenging foods in your recovery journey.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Encouraging Message */}
      <Card className="bg-gradient-healing border-primary/20 shadow-gentle">
        <CardContent className="pt-6 text-center">
          <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-foreground font-medium mb-2">Your recovery journey is unique</p>
          <p className="text-sm text-muted-foreground">
            These preferences help us provide personalized support that aligns with your healing process.
          </p>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="shadow-gentle">
        <CardContent className="pt-6">
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Prominent Edit Button at Bottom */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <Button
          onClick={() => {
            console.log('Edit button clicked, opening dialog');
            setIsEditDialogOpen(true);
          }}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg px-8 py-3 rounded-full"
        >
          <Edit3 className="w-5 h-5 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Edit Dialog */}
      {profile && (
        <ProfileEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          profile={profile}
          onProfileChange={setProfile}
          onSave={updateProfile}
          saving={saving}
          userEmail={user?.email}
        />
      )}
    </div>
  );
};

export default Profile;