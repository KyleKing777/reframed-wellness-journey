import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X } from 'lucide-react';

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

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  userEmail?: string;
}

export const ProfileEditDialog = ({
  open,
  onOpenChange,
  profile,
  onProfileChange,
  onSave,
  saving,
  userEmail
}: ProfileEditDialogProps) => {
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);

  const handleSave = async () => {
    onProfileChange(localProfile);
    await onSave();
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalProfile(profile); // Reset to original
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={localProfile.username || ''}
                onChange={(e) => setLocalProfile({ ...localProfile, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={localProfile.email || userEmail || ''}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={localProfile.gender || ''}
                onValueChange={(value) => setLocalProfile({ ...localProfile, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={localProfile.age || ''}
                onChange={(e) => setLocalProfile({ ...localProfile, age: parseInt(e.target.value) || null })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={localProfile.height_cm || ''}
                onChange={(e) => setLocalProfile({ ...localProfile, height_cm: parseFloat(e.target.value) || null })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Current Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={localProfile.weight_kg || ''}
                onChange={(e) => setLocalProfile({ ...localProfile, weight_kg: parseFloat(e.target.value) || null })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-weight">Goal Weight (kg)</Label>
              <Input
                id="goal-weight"
                type="number"
                step="0.1"
                value={localProfile.goal_weight_kg || ''}
                onChange={(e) => setLocalProfile({ ...localProfile, goal_weight_kg: parseFloat(e.target.value) || null })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight-gain-goal">Weekly Gain Goal (kg)</Label>
              <Input
                id="weight-gain-goal"
                type="number"
                step="0.1"
                value={localProfile.weekly_weight_gain_goal || ''}
                onChange={(e) => setLocalProfile({ ...localProfile, weekly_weight_gain_goal: parseFloat(e.target.value) || null })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="steps">Average Daily Steps</Label>
              <Input
                id="steps"
                type="number"
                value={localProfile.avg_steps_per_day || ''}
                onChange={(e) => setLocalProfile({ ...localProfile, avg_steps_per_day: parseInt(e.target.value) || null })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-level">Activity Level</Label>
            <Select
              value={localProfile.activity_level || ''}
              onValueChange={(value) => setLocalProfile({ ...localProfile, activity_level: value })}
            >
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
            <Label htmlFor="therapy-style">Therapy Style Preference</Label>
            <Select
              value={localProfile.therapy_style || ''}
              onValueChange={(value) => setLocalProfile({ ...localProfile, therapy_style: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select therapy style" />
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
              value={localProfile.therapist_description || ''}
              onChange={(e) => setLocalProfile({ ...localProfile, therapist_description: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};