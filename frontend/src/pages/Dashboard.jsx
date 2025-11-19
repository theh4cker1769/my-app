import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>🏋️ Welcome to Gym Dashboard</h1>
            {user && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Hello, {user.full_name}!</h2>
                    <p>Email: {user.email}</p>
                    <p>Membership: {user.membership_type}</p>
                    <button 
                        onClick={handleLogout}
                        style={{
                            marginTop: '20px',
                            padding: '10px 30px',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default Dashboard;