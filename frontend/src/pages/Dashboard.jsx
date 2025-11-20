import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { userAPI, workoutAPI } from '../api/apiServices';
import Layout from '../layout/Layout';
import Header from '../layout/Header';
import QuickLogWorkout from '../components/QuickLogWorkout';
import '../styles/dashboard.css';

const Dashboard = () => {
    const { user, token, initializing } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [todayWorkout, setTodayWorkout] = useState([]);
    const [friendsActivity, setFriendsActivity] = useState([]);
    const [weeklySummary, setWeeklySummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showQuickLog, setShowQuickLog] = useState(false);

    useEffect(() => {
        // Wait for auth to initialize before checking authentication
        if (initializing) return;

        if (!user || !token) {
            navigate('/login');
        } else {
            fetchDashboardData();
        }
    }, [user, token, initializing, navigate]);

    const handleWorkoutLogged = (data) => {
        fetchDashboardData();
        alert(`${data.workout_type} workout logged! 🔥\nStreak: ${data.current_streak} days`);
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, todayRes, friendsRes, weeklyRes] = await Promise.all([
                userAPI.getStats(),
                workoutAPI.getTodayWorkout(),
                workoutAPI.getFriendsFeed(10),
                userAPI.getWeeklySummary()
            ]);

            if (statsRes && statsRes.success) {
                const statsData = statsRes.data?.data || statsRes.data;
                setStats(statsData);
            }

            if (todayRes && todayRes.success) {
                const todayData = todayRes.data?.data || todayRes.data;
                setTodayWorkout(Array.isArray(todayData) ? todayData : []);
            }

            if (friendsRes && friendsRes.success) {
                const friendsData = friendsRes.data?.data || friendsRes.data;
                setFriendsActivity(Array.isArray(friendsData) ? friendsData : []);
            }

            if (weeklyRes && weeklyRes.success) {
                const weeklyData = weeklyRes.data?.data || weeklyRes.data;
                setWeeklySummary(Array.isArray(weeklyData) ? weeklyData : []);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (initializing || !user || !token || loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '5px solid #f3f3f3',
                    borderTop: '5px solid #667eea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <h2>Loading your dashboard...</h2>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // Create week chart data
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekData = weekDays.map(day => {
        if (!Array.isArray(weeklySummary)) {
            return { day, count: 0 };
        }

        const dayData = weeklySummary.find(d =>
            new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }) === day
        );
        return {
            day,
            count: dayData ? dayData.workout_count : 0
        };
    });
    const maxCount = Math.max(...weekData.map(d => d.count), 1);

    return (
        <Layout>
            <Header
                actionButton={
                    <button className="btn-add-workout" onClick={() => setShowQuickLog(true)}>
                        ➕ Log Workout
                    </button>
                }
            />

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-info">
                        <h3>{stats?.current_streak || 0}</h3>
                        <p>Current Streak</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💪</div>
                    <div className="stat-info">
                        <h3>{stats?.total_workouts || 0}</h3>
                        <p>Total Workouts</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-info">
                        <h3>{stats?.total_points || 0}</h3>
                        <p>Total Points</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>{stats?.friends_count || 0}</h3>
                        <p>Friends</p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="content-grid">
                {/* Today's Workout */}
                <section className="card">
                    <div className="card-header">
                        <h2>📅 Today's Activity</h2>
                        <span className="date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="card-body">
                        {todayWorkout.length > 0 ? (
                            <div className="workout-list">
                                {todayWorkout.map(workout => (
                                    <div key={workout.id} className="workout-item">
                                        <h4>{workout.workout_name}</h4>
                                        <p>{workout.duration} min • {workout.calories_burned || 0} cal</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p className="empty-icon">🏃</p>
                                <p>No workout logged yet today</p>
                                <button className="btn-primary-small">Log Your First Workout</button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Activity Feed */}
                <section className="card">
                    <div className="card-header">
                        <h2>🔔 Friends Activity</h2>
                    </div>
                    <div className="card-body">
                        {friendsActivity.length > 0 ? (
                            <div className="activity-list">
                                {friendsActivity.map(activity => (
                                    <div key={activity.id} className="activity-item">
                                        <strong>{activity.full_name}</strong>
                                        <p>{activity.workout_name}</p>
                                        <small>{new Date(activity.created_at).toLocaleString()}</small>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p className="empty-icon">👥</p>
                                <p>No friend activity yet</p>
                                <button className="btn-primary-small">Add Friends</button>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Weekly Progress */}
            <section className="card">
                <div className="card-header">
                    <h2>📊 Weekly Progress</h2>
                </div>
                <div className="card-body">
                    <div className="week-chart">
                        {weekData.map((item, index) => (
                            <div key={index} className="day-bar">
                                <div
                                    className="bar"
                                    style={{ height: `${(item.count / maxCount) * 100}%` }}
                                ></div>
                                <span className="day-label">{item.day}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick Log Modal */}
            <QuickLogWorkout
                isOpen={showQuickLog}
                onClose={() => setShowQuickLog(false)}
                onSuccess={handleWorkoutLogged}
            />
        </Layout>
    );
};

export default Dashboard;