import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { VisitorManagement } from '@/pages/VisitorManagement';
import { AllVisitors } from '@/pages/AllVisitors';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <VisitorManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/all-visitors"
              element={
                <ProtectedRoute>
                  <AllVisitors />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
