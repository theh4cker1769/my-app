import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { userAPI } from '../api/apiServices';
import Layout from '../layout/Layout';
import Header from '../layout/Header';
import '../styles/profile.css';

const Profile = () => {
    const { user, token, initializing, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [stats, setStats] = useState(null);
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        phone: '',
        bio: '',
        fitness_level: 'Beginner',
        allow_friend_requests: true,
        show_workout_to_friends: true,
        compete_in_leaderboard: true
    });
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        if (initializing) return;

        if (!user || !token) {
            navigate('/login');
        } else {
            fetchProfileData();
        }
    }, [user, token, initializing, navigate]);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const [statsRes, profileRes] = await Promise.all([
                userAPI.getStats(),
                userAPI.getUserProfile(user.id)
            ]);

            if (statsRes && statsRes.success) {
                setStats(statsRes.data?.data || statsRes.data);
            }

            if (profileRes && profileRes.success) {
                const profileData = profileRes.data?.data || profileRes.data;
                setProfile(profileData);
                setEditForm(profileData);
            }

        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel edit
            setEditForm(profile);
        }
        setIsEditing(!isEditing);
    };

    const handleSaveProfile = async () => {
        try {
            const res = await userAPI.updateProfile(editForm);
            if (res && res.success) {
                const updatedData = res.data?.data || res.data;
                setProfile(updatedData);
                setUser({ ...user, ...updatedData });
                setIsEditing(false);
                alert('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    const handleToggleSetting = async (setting) => {
        const newValue = !profile[setting];
        try {
            const res = await userAPI.updateProfile({ [setting]: newValue });
            if (res && res.success) {
                setProfile({ ...profile, [setting]: newValue });
            }
        } catch (error) {
            console.error('Error updating setting:', error);
        }
    };

    const getFitnessLevelBadge = (level) => {
        const badges = {
            'Beginner': { icon: '🌱', color: '#10b981' },
            'Intermediate': { icon: '💪', color: '#3b82f6' },
            'Advanced': { icon: '🔥', color: '#f59e0b' },
            'Expert': { icon: '👑', color: '#8b5cf6' }
        };
        return badges[level] || badges['Beginner'];
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
                <h2>Loading profile...</h2>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    const badge = getFitnessLevelBadge(profile.fitness_level);

    return (
        <Layout>
            <Header
                actionButton={
                    <button
                        className={`btn-${isEditing ? 'save' : 'edit'}`}
                        onClick={isEditing ? handleSaveProfile : handleEditToggle}
                    >
                        {isEditing ? '💾 Save Profile' : '✏️ Edit Profile'}
                    </button>
                }
            />

            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-avatar">
                    <div className="avatar-circle">
                        {profile.profile_picture ? (
                            <img src={profile.profile_picture} alt="Profile" />
                        ) : (
                            <span className="avatar-initials">
                                {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                        )}
                    </div>
                    <div className="fitness-badge" style={{ backgroundColor: badge.color }}>
                        <span>{badge.icon}</span>
                    </div>
                </div>
                <div className="profile-header-info">
                    <h1>{profile.full_name}</h1>
                    <p className="profile-email">{profile.email}</p>
                    {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">🏋️</div>
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
                    <div className="stat-icon">🔥</div>
                    <div className="stat-info">
                        <h3>{stats?.current_streak || 0}</h3>
                        <p>Current Streak</p>
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

            {/* Content Grid */}
            <div className="profile-content-grid">
                {/* Personal Information */}
                <section className="card">
                    <div className="card-header">
                        <h2>📋 Personal Information</h2>
                    </div>
                    <div className="card-body">
                        {isEditing ? (
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.full_name || ''}
                                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                    className="form-input"
                                />

                                <label>Phone</label>
                                <input
                                    type="tel"
                                    value={editForm.phone || ''}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    className="form-input"
                                />

                                <label>Bio</label>
                                <textarea
                                    value={editForm.bio || ''}
                                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                    className="form-textarea"
                                    rows="3"
                                    placeholder="Tell us about your fitness journey..."
                                />

                                <label>Fitness Level</label>
                                <select
                                    value={editForm.fitness_level || 'Beginner'}
                                    onChange={(e) => setEditForm({ ...editForm, fitness_level: e.target.value })}
                                    className="form-select"
                                >
                                    <option value="Beginner">🌱 Beginner</option>
                                    <option value="Intermediate">💪 Intermediate</option>
                                    <option value="Advanced">🔥 Advanced</option>
                                    <option value="Expert">👑 Expert</option>
                                </select>
                            </div>
                        ) : (
                            <div className="info-list">
                                <div className="info-item">
                                    <span className="info-label">Email</span>
                                    <span className="info-value">{profile.email}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Phone</span>
                                    <span className="info-value">{profile.phone || 'Not provided'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Fitness Level</span>
                                    <span className="info-value fitness-badge-inline" style={{ backgroundColor: badge.color }}>
                                        {badge.icon} {profile.fitness_level}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Privacy Settings */}
                <section className="card">
                    <div className="card-header">
                        <h2>🔒 Privacy Settings</h2>
                    </div>
                    <div className="card-body">
                        <div className="settings-list">
                            <div className="setting-item">
                                <div className="setting-info">
                                    <h4>Allow Friend Requests</h4>
                                    <p>Others can send you friend requests</p>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={profile.allow_friend_requests}
                                        onChange={() => handleToggleSetting('allow_friend_requests')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <h4>Show Workouts to Friends</h4>
                                    <p>Friends can see your workout activities</p>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={profile.show_workout_to_friends}
                                        onChange={() => handleToggleSetting('show_workout_to_friends')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="setting-item">
                                <div className="setting-info">
                                    <h4>Compete in Leaderboard</h4>
                                    <p>Appear in rankings and competitions</p>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={profile.compete_in_leaderboard}
                                        onChange={() => handleToggleSetting('compete_in_leaderboard')}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default Profile;
