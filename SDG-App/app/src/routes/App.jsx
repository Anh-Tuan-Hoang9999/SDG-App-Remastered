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
import ProtectedRoute from "../components/ProtectedRoute";

// Lazily loaded — deferred until first navigation, keeps initial bundle small
const Home = lazy(() => import("../screens/Home"));
const Activities = lazy(() => import("../screens/Activities"));
const ActivityLevels = lazy(() => import("../screens/ActivityLevels").then(m => ({ default: m.ActivityLevels })));
const LearningScreen = lazy(() => import("../screens/LearningScreen"));
const ActivityContainer = lazy(() => import("../screens/ActivityContainer"));
const Profile = lazy(() => import("../screens/Profile"));
const UserSettings = lazy(() => import("../screens/UserSettings"));
const ProgressScreen = lazy(() => import("../screens/ProgressScreen"));
const Resources = lazy(() => import("../screens/Resources"));
const Dashboard = lazy(() => import("../screens/Dashboard"));
const SDGCards = lazy(() => import("../screens/SDGCards"));
// Shown while a lazy chunk is loading
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
        <Route path="/" element={<AppLayout />}>
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
          <Route path="learning1" element={<ProtectedRoute><Introduction /></ProtectedRoute>} />
          <Route path="learning2" element={<ProtectedRoute><Introduction /></ProtectedRoute>} />

          <Route path="learning" element={<ProtectedRoute><LearningScreen /></ProtectedRoute>} />
          <Route path="activities" element={<ProtectedRoute><Activities /></ProtectedRoute>} />
          <Route path="activities/:sdgId" element={<ProtectedRoute><ActivityLevels /></ProtectedRoute>} />
          <Route path="activities/:sdgId/:activityId" element={<ProtectedRoute><ActivityContainer /></ProtectedRoute>} />
          <Route path="progress" element={<ProtectedRoute><ProgressScreen /></ProtectedRoute>} />
          <Route path="resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="sdg-cards" element={<ProtectedRoute><SDGCards /></ProtectedRoute>} />
        </Route>
        <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

