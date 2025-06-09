import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import SharedNote from './pages/SharedNote';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useContext } from 'react';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/shared/:token" element={<SharedNote />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    
    return <div className="text-center py-10">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}


export default App;


