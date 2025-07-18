import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Auth from "./pages/Auth";
import MealLogging from "./pages/MealLogging";
import TodaysMeals from "./pages/TodaysMeals";
import Chat from "./pages/Chat";
import Health from "./pages/Health";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Layout><MealLogging /></Layout>} />
            <Route path="/meals" element={<Layout><TodaysMeals /></Layout>} />
            <Route path="/chat" element={<Layout><Chat /></Layout>} />
            <Route path="/health" element={<Layout><Health /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
