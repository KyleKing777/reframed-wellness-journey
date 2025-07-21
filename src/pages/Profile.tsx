import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Edit3, Save, LogOut, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  age: number;
  height_cm: number;
  weight_kg: number;
  goal_weight_kg: number;
  weekly_weight_gain_goal: number;
  activity_level: string;
  avg_steps_per_day: number;
  therapy_style: string;
  therapist_description: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
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
      setProfile(data);
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

  const updateProfile = async () => {
    if (!profile || !user) return;

    setSaving(true);
    try {
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
          therapist_description: profile.therapist_description
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully.",
      });
      setIsEditing(false);
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

  const calculateBMR = () => {
    if (!profile) return 0;
    // Mifflin-St Jeor Equation (assuming female, can be made gender-specific later)
    return Math.round(10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + 5);
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
      <div className="p-4 max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <Card className="shadow-gentle">
          <CardContent className="pt-6 text-center py-8">
            <p className="text-muted-foreground">Profile not found. Please try refreshing the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bmr = calculateBMR();

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-3">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Your Profile</h1>
        <p className="text-muted-foreground">Manage your account and recovery preferences</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-gentle">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">BMR</p>
            <p className="text-2xl font-bold text-primary">{bmr}</p>
            <p className="text-xs text-muted-foreground">calories/day</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-gentle">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Goal Progress</p>
            <p className="text-2xl font-bold text-primary">
              {((profile.weight_kg / profile.goal_weight_kg) * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">to goal weight</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-gentle">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Therapy Style</p>
            <p className="text-2xl font-bold text-primary">{profile.therapy_style}</p>
            <p className="text-xs text-muted-foreground">preference</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      <Card className="shadow-gentle">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile Information</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => isEditing ? updateProfile() : setIsEditing(true)}
              disabled={saving}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email || user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={profile.height_cm}
                onChange={(e) => setProfile({ ...profile, height_cm: parseFloat(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Current Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={profile.weight_kg}
                onChange={(e) => setProfile({ ...profile, weight_kg: parseFloat(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goal-weight">Goal Weight (kg)</Label>
              <Input
                id="goal-weight"
                type="number"
                step="0.1"
                value={profile.goal_weight_kg}
                onChange={(e) => setProfile({ ...profile, goal_weight_kg: parseFloat(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight-gain-goal">Weekly Gain Goal (kg)</Label>
              <Input
                id="weight-gain-goal"
                type="number"
                step="0.1"
                value={profile.weekly_weight_gain_goal}
                onChange={(e) => setProfile({ ...profile, weekly_weight_gain_goal: parseFloat(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="steps">Average Daily Steps</Label>
              <Input
                id="steps"
                type="number"
                value={profile.avg_steps_per_day}
                onChange={(e) => setProfile({ ...profile, avg_steps_per_day: parseInt(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-level">Activity Level</Label>
              <Select
                value={profile.activity_level}
                onValueChange={(value) => setProfile({ ...profile, activity_level: value })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="lightly-active">Lightly Active</SelectItem>
                  <SelectItem value="moderately-active">Moderately Active</SelectItem>
                  <SelectItem value="very-active">Very Active</SelectItem>
                  <SelectItem value="extremely-active">Extremely Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="therapy-style">Therapy Style Preference</Label>
            <Select
              value={profile.therapy_style}
              onValueChange={(value) => setProfile({ ...profile, therapy_style: value })}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACT">Acceptance and Commitment Therapy (ACT)</SelectItem>
                <SelectItem value="CBT">Cognitive Behavioral Therapy (CBT)</SelectItem>
                <SelectItem value="DBT">Dialectical Behavior Therapy (DBT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="therapy-description">Therapy Preferences</Label>
            <Textarea
              id="therapy-description"
              placeholder="Describe what kind of support works best for you..."
              value={profile.therapist_description}
              onChange={(e) => setProfile({ ...profile, therapist_description: e.target.value })}
              disabled={!isEditing}
              rows={3}
            />
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  fetchProfile(); // Reset changes
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={updateProfile}
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
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
    </div>
  );
};

export default Profile;