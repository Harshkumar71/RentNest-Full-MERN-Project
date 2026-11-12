import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return <header className="site-header"><Link className="logo" to="/">RentNest<span>.</span></Link><nav>
    <Link to="/properties">Explore</Link>
    {user && <Link to="/dashboard">{user.role === 'admin' ? 'Admin' : user.role === 'owner' ? 'Owner dashboard' : 'My bookings'}</Link>}
    {user?.role === 'owner' && <Link to="/owner/properties/new">List a property</Link>}
    {user ? <><span className="nav-user">Hi, {user.name?.split(' ')[0]}</span><button className="nav-logout" onClick={() => { logout(); navigate('/'); }}>Logout</button></> : <><Link to="/login">Login</Link><Link className="navbtn" to="/register">Get started</Link></>}
  </nav></header>;
}
