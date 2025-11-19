import { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import '../styles/header.css';

const Header = ({ title, subtitle, actionButton }) => {
    const { user } = useContext(AuthContext);

    return (
        <header className="dashboard-header">
            <div className="header-content">
                <h1>{title || `Welcome back, ${user?.full_name}! 👋`}</h1>
                <p className="subtitle">{subtitle || "Let's crush today's workout!"}</p>
            </div>
            {actionButton && (
                <div className="header-actions">
                    {actionButton}
                </div>
            )}
        </header>
    );
};

export default Header;