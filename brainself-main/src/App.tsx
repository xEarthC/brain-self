import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Dashboard from "@/pages/Dashboard";
import PPP from "@/pages/PPP";
import AuthPage from "@/pages/AuthPage";
import CoursesPage from "@/pages/CoursesPage";

import Ainote from "@/pages/Ainote";
import SchedulePage from "@/pages/SchedulePage";
import AIAssistantPage from "@/pages/AIAssistantPage";
import AchievementsPage from "@/pages/AchievementsPage";
import AddResultsPage from "@/pages/AddResultsPage";
import StudentAnalysisPage from "@/pages/StudentAnalysisPage";
import HWTDPage from "@/pages/HWTDPage";
import Contact from "@/pages/Contact";
import GiveAccessPage from "@/pages/GiveAccessPage";
import MarksPage from "@/pages/MarksPage";
import NotFound from "./pages/NotFound";
import SchoolTagsPage from "@/pages/SchoolTagsPage";
import AssignSchoolsPage from "@/pages/AssignSchoolsPage";
import MSGPage from "@/pages/MSGPage";
import GroupsPage from "@/pages/GroupsPage";
import About from "@/pages/About";
import GroupChatPage from "@/pages/GroupChatPage";
import MyGroupsPage from "@/pages/MyGroupsPage";
import ShortnoteGenerator from "@/pages/Ainote";


    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <ShortnoteGenerator />
    </div>




const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background particle-bg">
            <Navigation />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/auth" element={<AuthPage />} />
                <Route path="/ppp" element={<PPP />} />
                <Route path="/ainote" element={<Ainote />} />

              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />
        
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/about" element={<About/>} />
              <Route path="/contact" element={<Contact/>} />
              <Route path="/marks" element={<MarksPage />} />
              <Route path="/add-results" element={<AddResultsPage />} />
              <Route path="/student-analysis" element={<StudentAnalysisPage />} />
              <Route path="/hwtd" element={<HWTDPage />} />

                   <Route path="/admin/access" element={<GiveAccessPage />} />
 <Route path="*" element={<NotFound />} />
               <Route path="/school-tags" element={<SchoolTagsPage />} />
              <Route path="/assign-schools" element={<AssignSchoolsPage />} />
              <Route path="/msg" element={<MSGPage />} />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/my-groups" element={<MyGroupsPage />} />
              <Route path="/group-chat/:groupId" element={<GroupChatPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;