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

const Auth = () => {
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Sign in form
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // Sign up form
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    username: '',
    age: '',
    height_cm: '',
    weight_kg: '',
    goal_weight_kg: '',
    weekly_weight_gain_goal: '',
    avg_steps_per_day: '',
    activity_level: '',
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = {
        username: signUpData.username,
        age: parseInt(signUpData.age),
        height_cm: parseFloat(signUpData.height_cm),
        weight_kg: parseFloat(signUpData.weight_kg),
        goal_weight_kg: parseFloat(signUpData.goal_weight_kg),
        weekly_weight_gain_goal: parseFloat(signUpData.weekly_weight_gain_goal),
        avg_steps_per_day: parseInt(signUpData.avg_steps_per_day),
        activity_level: signUpData.activity_level,
        therapy_style: signUpData.therapy_style,
        therapist_description: signUpData.therapist_description
      };

      const { error } = await signUp(signUpData.email, signUpData.password, userData);
      
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome to ReframED!",
          description: "Your account has been created successfully.",
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

  return (
    <div className="min-h-screen bg-gradient-calm flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">ReframED</h1>
          <p className="text-muted-foreground">Your journey to recovery starts here</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Join our supportive community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={signUpData.username}
                        onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={signUpData.age}
                        onChange={(e) => setSignUpData({ ...signUpData, age: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={signUpData.height_cm}
                        onChange={(e) => setSignUpData({ ...signUpData, height_cm: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={signUpData.weight_kg}
                        onChange={(e) => setSignUpData({ ...signUpData, weight_kg: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-weight">Goal Weight (kg)</Label>
                      <Input
                        id="goal-weight"
                        type="number"
                        step="0.1"
                        value={signUpData.goal_weight_kg}
                        onChange={(e) => setSignUpData({ ...signUpData, goal_weight_kg: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight-gain-goal">Weekly Weight Gain Goal (kg)</Label>
                      <Input
                        id="weight-gain-goal"
                        type="number"
                        step="0.1"
                        value={signUpData.weekly_weight_gain_goal}
                        onChange={(e) => setSignUpData({ ...signUpData, weekly_weight_gain_goal: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="steps">Average Daily Steps</Label>
                      <Input
                        id="steps"
                        type="number"
                        value={signUpData.avg_steps_per_day}
                        onChange={(e) => setSignUpData({ ...signUpData, avg_steps_per_day: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activity-level">Activity Level</Label>
                    <Select onValueChange={(value) => setSignUpData({ ...signUpData, activity_level: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
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

                  <div className="space-y-2">
                    <Label htmlFor="therapy-style">Preferred Therapy Style</Label>
                    <Select onValueChange={(value) => setSignUpData({ ...signUpData, therapy_style: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your therapy preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACT">Acceptance and Commitment Therapy (ACT)</SelectItem>
                        <SelectItem value="CBT">Cognitive Behavioral Therapy (CBT)</SelectItem>
                        <SelectItem value="DBT">Dialectical Behavior Therapy (DBT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="therapist-description">Tell us about your therapy preferences</Label>
                    <Textarea
                      id="therapist-description"
                      placeholder="Describe what kind of support works best for you..."
                      value={signUpData.therapist_description}
                      onChange={(e) => setSignUpData({ ...signUpData, therapist_description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;