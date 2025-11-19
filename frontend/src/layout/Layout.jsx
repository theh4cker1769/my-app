import { useState } from 'react';
import Sidebar from './Sidebar';
import '../styles/layout.css';

const Layout = ({ children }) => {
    const [activeTab, setActiveTab] = useState('home');

    return (
        <div className="layout">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;