
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import HangulLearning from "@/pages/HangulLearning";
import LessonDetail from "@/pages/LessonDetail";
import Lessons from "@/pages/Lessons";
import { useAppState } from "@/hooks/useAppState";

export function AppRoutes() {
  const { userData, isInitialized } = useAppState();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-korean-600"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Auth />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/hangul" element={<HangulLearning />} />
      <Route path="/hangul/vowels" element={<HangulLearning />} />
      <Route path="/hangul/consonants" element={<HangulLearning />} />
      <Route path="/lessons" element={<Lessons />} />
      <Route path="/lessons/:lessonId" element={<LessonDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
