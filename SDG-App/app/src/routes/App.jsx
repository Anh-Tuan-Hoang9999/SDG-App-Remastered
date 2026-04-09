import React from "react";
import { Suspense, lazy } from "react";
import { Route, Routes, Navigate } from "react-router";

//import layouts
import DefaultLayout from "../components/layouts/DefaultLayout";
import AppLayout from "../components/layouts/Layout";
// Eagerly loaded — lightweight, needed immediately
import Login from "../screens/Login";
import Register from "../screens/Register";
import Introduction from "../screens/Introduction";
import ForgotPassword from "../screens/ForgotPassword";
import ProtectedRoute from "../components/ProtectedRoute";

// Lazily loaded — deferred until first navigation, keeps initial bundle small
const Home = lazy(() => import("../screens/Home"));
const CardSort = lazy(() => import("../screens/CardSort"));
const Activities = lazy(() => import("../screens/Activities"));
const ActivityLevels = lazy(() => import("../screens/ActivityLevels").then(m => ({ default: m.ActivityLevels })));
const LearningScreen = lazy(() => import("../screens/LearningScreen"));
const ActivityContainer = lazy(() => import("../screens/ActivityContainer"));
const Profile = lazy(() => import("../screens/Profile"));
const UserSettings = lazy(() => import("../screens/UserSettings"));
const RealProgress = lazy(() => import("../screens/RealProgress"));
const ReflectionLog = lazy(() => import("../screens/ReflectionLog"));
const Resources = lazy(() => import("../screens/Resources"));
const Dashboard = lazy(() => import("../screens/Dashboard"));
const SDGCards = lazy(() => import("../screens/SDGCards"));
const Coordinator = lazy(() => import("../screens/Coordinator"));
const TestAPI = lazy(() => import("../screens/TestAPI"));
const PageLoader = () => (
  <div className="flex items-center justify-center w-full h-full">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#36656B]" />
  </div>
);

export default function AppNavigator() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route index element={<Introduction />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<AppLayout />}>
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
          <Route path="learning" element={<ProtectedRoute><LearningScreen /></ProtectedRoute>} />
          <Route path="learning1" element={<ProtectedRoute><SDGCards /></ProtectedRoute>} />
          <Route path="activities" element={<ProtectedRoute><Activities /></ProtectedRoute>} />
          <Route path="activities/:sdgId" element={<ProtectedRoute><ActivityLevels /></ProtectedRoute>} />
          <Route path="activities/:sdgId/:activityId" element={<ProtectedRoute><ActivityContainer /></ProtectedRoute>} />
          <Route path="progress" element={<ProtectedRoute><RealProgress /></ProtectedRoute>} />
          <Route path="reflection-log" element={<ProtectedRoute><ReflectionLog /></ProtectedRoute>} />
          <Route path="resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="sdg-cards" element={<ProtectedRoute><SDGCards /></ProtectedRoute>} />
          <Route path="coordinator" element={<ProtectedRoute><Coordinator /></ProtectedRoute>} />
          <Route path="card-sort" element={<ProtectedRoute><CardSort /></ProtectedRoute>} />
          <Route path="testapi" element={<ProtectedRoute><TestAPI /></ProtectedRoute>} />
        </Route>
        <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
