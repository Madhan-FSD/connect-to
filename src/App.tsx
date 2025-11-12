import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CreateChannel from "./pages/CreateChannel";
import AddChild from "./pages/AddChild";
import ChildDetails from "./pages/ChildDetails";
import Network from "./pages/Network";
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { VerifyOtp } from "./pages/auth/VerifyOtp";
import NotFound from "./pages/NotFound";
import { isAuthenticated } from "./lib/auth";
import "./App.css";
import AIHub from "./pages/AiHub";
import AIGames from "./pages/AiGames";
import ChildControlPage from "./pages/ChildControlPage";
import FeedPage from "./pages/FeedPage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/auth/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/feeds"
          element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/network"
          element={
            <ProtectedRoute>
              <Network />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-channel"
          element={
            <ProtectedRoute>
              <CreateChannel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-hub"
          element={
            <ProtectedRoute>
              <AIHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-games"
          element={
            <ProtectedRoute>
              <AIGames />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-child"
          element={
            <ProtectedRoute>
              <AddChild />
            </ProtectedRoute>
          }
        />
        <Route path="users/child/:childId" element={<ChildControlPage />} />
        <Route
          path="/child/profile/:childId"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:childId"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/verify-otp" element={<VerifyOtp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
