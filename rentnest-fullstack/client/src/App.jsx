import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import Dashboard from './pages/Dashboard';
import PropertyForm from './pages/PropertyForm';
import { useAuth } from './context/AuthContext';

function Protected({ children }) { const { user } = useAuth(); return user ? children : <Navigate to="/login" replace />; }
export default function App() {
  return <><Navbar /><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Auth mode="login" />} />
    <Route path="/register" element={<Auth mode="register" />} />
    <Route path="/properties" element={<Properties />} />
    <Route path="/properties/:id" element={<PropertyDetails />} />
    <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
    <Route path="/owner/properties/new" element={<Protected><PropertyForm /></Protected>} />
    <Route path="*" element={<main className="container"><h1>Page not found</h1></main>} />
  </Routes></>;
}
