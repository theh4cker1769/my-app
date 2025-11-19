import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import '../styles/auth.css';

const Signup = () => {
    const navigate = useNavigate();
    const { signup, loading } = useContext(AuthContext);
    
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        bio: '',
        allow_friend_requests: true,
        show_workout_to_friends: true,
        compete_in_leaderboard: true
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.full_name || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        // Remove confirmPassword before sending
        const { confirmPassword, ...signupData } = formData;

        const result = await signup(signupData);
        
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '500px' }}>
                <div className="auth-header">
                    <div className="auth-icon">💪</div>
                    <h1>Join Our Gym Community!</h1>
                    <p>Track workouts, compete with friends, achieve together</p>
                </div>
                
                <div className="auth-body">
                    {error && <div className="error-message">{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="full_name"
                                placeholder="Enter your full name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address *</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Your phone number (optional)"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Create password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm Password *</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Bio (Optional)</label>
                            <textarea
                                name="bio"
                                placeholder="Tell us about your fitness journey..."
                                value={formData.bio}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    border: '2px solid #e0e0e0',
                                    borderRadius: '10px',
                                    fontSize: '15px',
                                    background: '#f8f9fa',
                                    minHeight: '80px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ 
                            background: '#f0f4ff', 
                            padding: '15px', 
                            borderRadius: '10px', 
                            marginBottom: '20px' 
                        }}>
                            <h4 style={{ marginBottom: '10px', color: '#667eea', fontSize: '16px' }}>🤝 Social Preferences</h4>
                            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="allow_friend_requests"
                                    checked={formData.allow_friend_requests}
                                    onChange={handleChange}
                                    style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '14px', color: '#333' }}>Allow friend requests</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="show_workout_to_friends"
                                    checked={formData.show_workout_to_friends}
                                    onChange={handleChange}
                                    style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '14px', color: '#333' }}>Show my workouts to friends</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="compete_in_leaderboard"
                                    checked={formData.compete_in_leaderboard}
                                    onChange={handleChange}
                                    style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '14px', color: '#333' }}>Compete in leaderboards</span>
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Account 🎉'}
                        </button>
                    </form>
                </div>

                <div className="auth-footer">
                    Already have an account?
                    <Link to="/login">Login here</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;