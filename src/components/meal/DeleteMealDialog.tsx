import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Meal {
  id: number;
  meal_type: string;
  total_calories: number;
}

interface DeleteMealDialogProps {
  meal: Meal | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteMealDialog = ({ 
  meal, 
  isOpen, 
  onClose, 
  onConfirm 
}: DeleteMealDialogProps) => {
  if (!meal) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Meal</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this {meal.meal_type.toLowerCase()} 
            ({meal.total_calories?.toFixed(0)} calories)? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Meal
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};