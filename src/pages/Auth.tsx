import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'signin' | 'signup' | 'profile' | 'therapy'>('signin');

  // Sign in form
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // Initial signup form (step 1)
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    username: ''
  });

  // Profile information form (step 2)
  const [profileData, setProfileData] = useState({
    age: '',
    height_cm: '',
    weight_kg: '',
    goal_weight_kg: '',
    weekly_weight_gain_goal: '',
    avg_steps_per_day: '',
    activity_level: ''
  });

  // Therapy preferences form (step 3)
  const [therapyData, setTherapyData] = useState({
    therapy_style: '',
    therapist_description: ''
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(signInData.email, signInData.password);
      
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
          variant: "default"
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  const handleInitialSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signUp(signUpData.email, signUpData.password, { username: signUpData.username });
      
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setCurrentStep('profile');
        toast({
          title: "Account created!",
          description: "Now let's set up your profile.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('therapy');
  };

  const handleTherapySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user profile in Users table
      const { data: authUser } = await supabase.auth.getUser();
      
      if (authUser.user) {
        const { error } = await supabase
          .from('Users')
          .insert({
            user_id: authUser.user.id,
            email: signUpData.email,
            username: signUpData.username,
            password: signUpData.password, // Note: In production, passwords should be hashed
            age: parseInt(profileData.age),
            height_cm: parseFloat(profileData.height_cm),
            weight_kg: parseFloat(profileData.weight_kg),
            goal_weight_kg: parseFloat(profileData.goal_weight_kg),
            weekly_weight_gain_goal: parseFloat(profileData.weekly_weight_gain_goal),
            avg_steps_per_day: parseInt(profileData.avg_steps_per_day),
            activity_level: profileData.activity_level,
            therapy_style: therapyData.therapy_style,
            therapist_description: therapyData.therapist_description
          });

        if (error) {
          toast({
            title: "Profile creation failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Welcome to ReframED!",
            description: "Your profile has been set up successfully.",
          });
          navigate('/');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div className="w-2 h-12 bg-primary rounded-full mx-auto mb-6"></div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">ReframED</h1>
          <p className="text-muted-foreground text-sm">Wellness platform</p>
        </div>

        <div className="border border-border rounded-lg p-8 bg-card">
          {currentStep === 'signin' && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-lg font-medium text-foreground">Sign In</h2>
              </div>
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-1">
                  <Label htmlFor="signin-email" className="text-sm text-muted-foreground">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    className="border-0 bg-muted focus:bg-background transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signin-password" className="text-sm text-muted-foreground">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    className="border-0 bg-muted focus:bg-background transition-colors"
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? "Signing in..." : "Continue"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setCurrentStep('signup')}
                    className="text-primary hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </form>
            </>
          )}

          {currentStep === 'signup' && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-lg font-medium text-foreground">Create Account</h2>
                <p className="text-sm text-muted-foreground">Step 1 of 3</p>
              </div>
              <form onSubmit={handleInitialSignUp} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    className="border-0 bg-muted focus:bg-background transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="username" className="text-sm text-muted-foreground">Username</Label>
                  <Input
                    id="username"
                    value={signUpData.username}
                    onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                    className="border-0 bg-muted focus:bg-background transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-sm text-muted-foreground">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    className="border-0 bg-muted focus:bg-background transition-colors"
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-11 mt-6" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setCurrentStep('signin')}
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            </>
          )}

          {currentStep === 'profile' && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-lg font-medium text-foreground">Profile Information</h2>
                <p className="text-sm text-muted-foreground">Step 2 of 3</p>
              </div>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="age" className="text-sm text-muted-foreground">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profileData.age}
                      onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                      className="border-0 bg-muted focus:bg-background transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="height" className="text-sm text-muted-foreground">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      value={profileData.height_cm}
                      onChange={(e) => setProfileData({ ...profileData, height_cm: e.target.value })}
                      className="border-0 bg-muted focus:bg-background transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="weight" className="text-sm text-muted-foreground">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={profileData.weight_kg}
                      onChange={(e) => setProfileData({ ...profileData, weight_kg: e.target.value })}
                      className="border-0 bg-muted focus:bg-background transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="goal-weight" className="text-sm text-muted-foreground">Goal Weight (kg)</Label>
                    <Input
                      id="goal-weight"
                      type="number"
                      step="0.1"
                      value={profileData.goal_weight_kg}
                      onChange={(e) => setProfileData({ ...profileData, goal_weight_kg: e.target.value })}
                      className="border-0 bg-muted focus:bg-background transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="weekly-goal" className="text-sm text-muted-foreground">Weekly Weight Gain Goal (kg)</Label>
                  <Input
                    id="weekly-goal"
                    type="number"
                    step="0.1"
                    value={profileData.weekly_weight_gain_goal}
                    onChange={(e) => setProfileData({ ...profileData, weekly_weight_gain_goal: e.target.value })}
                    className="border-0 bg-muted focus:bg-background transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="activity-level" className="text-sm text-muted-foreground">Activity Level</Label>
                  <Select
                    value={profileData.activity_level}
                    onValueChange={(value) => setProfileData({ ...profileData, activity_level: value })}
                    required
                  >
                    <SelectTrigger className="border-0 bg-muted focus:bg-background transition-colors">
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Sedentary</SelectItem>
                      <SelectItem value="2">2 - Lightly Active</SelectItem>
                      <SelectItem value="3">3 - Moderately Active</SelectItem>
                      <SelectItem value="4">4 - Very Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="steps" className="text-sm text-muted-foreground">Average Steps Per Day</Label>
                  <Input
                    id="steps"
                    type="number"
                    value={profileData.avg_steps_per_day}
                    onChange={(e) => setProfileData({ ...profileData, avg_steps_per_day: e.target.value })}
                    className="border-0 bg-muted focus:bg-background transition-colors"
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-11 mt-6">
                  Next
                </Button>
              </form>
            </>
          )}

          {currentStep === 'therapy' && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-lg font-medium text-foreground">Therapy Preferences</h2>
                <p className="text-sm text-muted-foreground">Step 3 of 3</p>
              </div>
              <form onSubmit={handleTherapySubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="therapy-style" className="text-sm text-muted-foreground">Preferred Therapy Style</Label>
                  <Select
                    value={therapyData.therapy_style}
                    onValueChange={(value) => setTherapyData({ ...therapyData, therapy_style: value })}
                    required
                  >
                    <SelectTrigger className="border-0 bg-muted focus:bg-background transition-colors">
                      <SelectValue placeholder="Select therapy style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Acceptance and Commitment Therapy">Acceptance and Commitment Therapy</SelectItem>
                      <SelectItem value="Dialectical Behavioral Therapy">Dialectical Behavioral Therapy</SelectItem>
                      <SelectItem value="Cognitive Behavioral Therapy">Cognitive Behavioral Therapy</SelectItem>
                      <SelectItem value="Family-Based Therapy">Family-Based Therapy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="therapist-description" className="text-sm text-muted-foreground">
                    Describe the type of therapist you feel you best get along with
                  </Label>
                  <Textarea
                    id="therapist-description"
                    value={therapyData.therapist_description}
                    onChange={(e) => setTherapyData({ ...therapyData, therapist_description: e.target.value })}
                    className="border-0 bg-muted focus:bg-background transition-colors min-h-20"
                    placeholder="Tell us about your preferred therapist style..."
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-11 mt-6" disabled={loading}>
                  {loading ? "Completing setup..." : "Complete Setup"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;