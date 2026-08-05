import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout Wrappers
import StudentLayout from './components/layout/StudentLayout.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';

// Auth Screens
import Login from './pages/student/Login.jsx';
import Register from './pages/student/Register.jsx';

// Student Learning Curriculum Screens (Reference 1, 2, 3, 4)
import SubjectHome from './pages/student/SubjectHome.jsx';
import CategoryBranchMap from './pages/student/CategoryBranchMap.jsx';
import TopicMindMap from './pages/student/TopicMindMap.jsx';
import LessonMaterials from './pages/student/LessonMaterials.jsx';
import MaterialPlaylist from './pages/student/MaterialPlaylist.jsx';

// Interactive Learning Engines
import VideoPlayer from './pages/student/VideoPlayer.jsx';
import NoteReader from './pages/student/NoteReader.jsx';
import QuizPlayer from './pages/student/QuizPlayer.jsx';
import Flashcards from './pages/student/Flashcards.jsx';
import Dashboard from './pages/student/Dashboard.jsx';
import Bookmarks from './pages/student/Bookmarks.jsx';
import MyNotes from './pages/student/MyNotes.jsx';

// Admin Management Portal
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageCategories from './pages/admin/ManageCategories.jsx';
import ManageTopics from './pages/admin/ManageTopics.jsx';
import ManageMaterials from './pages/admin/ManageMaterials.jsx';

const App = () => {
  return (
    <Routes>
      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Resident Student Application Shell & Medical Mind Maps */}
      <Route path="/" element={<StudentLayout />}>
        <Route index element={<SubjectHome />} />
        <Route path="learn/:subjectSlug/:categorySlug" element={<CategoryBranchMap />} />
        <Route path="topic/:slug" element={<TopicMindMap />} />
        <Route path="lesson/:topicSlug" element={<LessonMaterials />} />
        <Route path="playlist/:type/:topicSlug" element={<MaterialPlaylist />} />

        {/* Interactive Modules */}
        <Route path="video/:id" element={<VideoPlayer />} />
        <Route path="notes/:id" element={<NoteReader />} />
        <Route path="quiz/:topicSlug" element={<QuizPlayer />} />
        <Route path="flashcards/:topicSlug" element={<Flashcards />} />
        
        {/* Student Workspace Vault & Analytics */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="bookmarks" element={<Bookmarks />} />
        <Route path="my-notes" element={<MyNotes />} />
        <Route path="recent" element={<Dashboard />} />
        <Route path="resources" element={<Dashboard />} />
        <Route path="settings" element={<Dashboard />} />
      </Route>

      {/* Admin Portal (Content Management & Hydraulics) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="categories" element={<ManageCategories />} />
        <Route path="topics" element={<ManageTopics />} />
        <Route path="materials/upload" element={<ManageMaterials />} />
        <Route path="materials/table" element={<ManageMaterials />} />
        <Route path="materials" element={<Navigate to="/admin/materials/table" replace />} />
        <Route path="subjects" element={<ManageCategories />} />
        <Route path="mcqs/create" element={<ManageMaterials />} />
        <Route path="mcqs/table" element={<ManageMaterials />} />
        <Route path="mcqs" element={<Navigate to="/admin/mcqs/table" replace />} />
      </Route>

      {/* Fallback routing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
