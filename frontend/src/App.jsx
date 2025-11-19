import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import Signup from './auth/Signup';
import { AuthProvider } from './auth/AuthContext';
import Dashboard from './pages/Dashboard';
import MyWorkouts from './pages/MyWorkouts';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-workouts" element={<MyWorkouts />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;