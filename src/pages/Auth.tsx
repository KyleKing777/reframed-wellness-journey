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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div className="w-2 h-12 bg-primary rounded-full mx-auto mb-6"></div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">ReframED</h1>
          <p className="text-muted-foreground text-sm">Wellness platform</p>
        </div>

        <div className="border border-border rounded-lg p-8 bg-card">
          <div className="text-center mb-8">
            <h2 className="text-lg font-medium text-foreground">Access</h2>
          </div>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted">
              <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
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
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6">
              <form onSubmit={handleSignUp} className="space-y-4">
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
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;