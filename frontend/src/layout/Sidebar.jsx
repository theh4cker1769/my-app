import { useNavigate, useLocation } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../auth/AuthContext';
import '../styles/sidebar.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useContext(AuthContext);

    const menuItems = [
        { id: 'home', icon: '🏠', label: 'Home', path: '/dashboard' },
        { id: 'workouts', icon: '🏋️', label: 'My Workouts', path: '/my-workouts' },
        { id: 'friends', icon: '👥', label: 'Friends', path: '/friends' },
        { id: 'groups', icon: '👫', label: 'Groups', path: '/groups' },
        { id: 'leaderboard', icon: '🏆', label: 'Leaderboard', path: '/leaderboard' },
        { id: 'profile', icon: '⚙️', label: 'Profile', path: '/profile' }
    ];

    // Update active tab based on current location
    useEffect(() => {
        const currentItem = menuItems.find(item => item.path === location.pathname);
        if (currentItem) {
            setActiveTab(currentItem.id);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">💪 GymTracker</div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab(item.id);
                            navigate(item.path);
                        }}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <button className="logout-btn" onClick={handleLogout}>
                <span className="nav-icon">🚪</span>
                <span>Logout</span>
            </button>
        </aside>
    );
};

export default Sidebar;