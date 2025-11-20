import { useState, useEffect } from 'react';
import { friendAPI } from '../api/apiServices';
import Layout from '../layout/Layout';
import Header from '../layout/Header';
import '../styles/Friends.css';

const Friends = () => {
    const [activeTab, setActiveTab] = useState('friends');
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'friends') {
            fetchFriends();
        } else if (activeTab === 'requests') {
            fetchRequests();
        }
    }, [activeTab]);

    useEffect(() => {
        if (searchQuery.length >= 2) {
            const timer = setTimeout(() => {
                searchUsers();
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const response = await friendAPI.getFriends();
            if (response && response.success) {
                setFriends(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
            setFriends([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await friendAPI.getFriendRequests();
            if (response && response.success) {
                setRequests(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const searchUsers = async () => {
        setSearchLoading(true);
        try {
            const response = await friendAPI.searchUsers(searchQuery);
            if (response && response.success) {
                setSearchResults(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error('Error searching users:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSendRequest = async (friendId) => {
        try {
            const response = await friendAPI.sendRequest(friendId);
            if (response && response.success) {
                alert('Friend request sent! 🎉');
                searchUsers();
            }
        } catch (error) {
            console.error('Error sending request:', error);
            alert('Failed to send request');
        }
    };

    const handleAcceptRequest = async (friendshipId) => {
        try {
            const response = await friendAPI.acceptRequest(friendshipId);
            if (response && response.success) {
                alert('Friend request accepted! 🎉');
                fetchRequests();
                fetchFriends();
            }
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    const handleRejectRequest = async (friendshipId) => {
        try {
            const response = await friendAPI.rejectRequest(friendshipId);
            if (response && response.success) {
                fetchRequests();
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };

    const handleRemoveFriend = async (friendId, friendName) => {
        if (window.confirm(`Remove ${friendName} from friends?`)) {
            try {
                const response = await friendAPI.removeFriend(friendId);
                if (response && response.success) {
                    fetchFriends();
                }
            } catch (error) {
                console.error('Error removing friend:', error);
            }
        }
    };

    const leaderboard = Array.isArray(friends) && friends.length > 0
        ? [...friends].sort((a, b) => b.current_streak - a.current_streak).slice(0, 10)
        : [];

    return (
        <Layout>
            <Header />
            <div className="friends-container">
                <h1 className="page-title">👥 Friends</h1>
                <div className="friends-tabs">
                    <button className={`tab ${activeTab === 'friends' ? 'active' : ''}`} onClick={() => setActiveTab('friends')}>
                        My Friends ({Array.isArray(friends) ? friends.length : 0})
                    </button>
                    <button className={`tab ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
                        Requests {Array.isArray(requests) && requests.length > 0 && <span className="badge">{requests.length}</span>}
                    </button>
                    <button className={`tab ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>
                        Find Friends
                    </button>
                </div>
                <div className="tab-content">
                    {activeTab === 'friends' && (
                        <div className="friends-section">
                            {leaderboard.length > 0 && (
                                <div className="leaderboard-section">
                                    <h2>🏆 Streak Leaderboard</h2>
                                    <div className="leaderboard">
                                        {leaderboard.slice(0, 3).map((friend, index) => (
                                            <div key={friend.friend_id} className={`podium-card rank-${index + 1}`}>
                                                <div className="rank-badge">
                                                    {index === 0 && '🥇'}
                                                    {index === 1 && '🥈'}
                                                    {index === 2 && '🥉'}
                                                </div>
                                                <div className="friend-name">{friend.full_name}</div>
                                                <div className="streak-count">{friend.current_streak} days</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="friends-list">
                                {loading ? (
                                    <div className="loading">Loading friends...</div>
                                ) : !Array.isArray(friends) || friends.length === 0 ? (
                                    <div className="empty-state">
                                        <p className="empty-icon">👥</p>
                                        <p>No friends yet</p>
                                        <button className="btn-primary" onClick={() => setActiveTab('search')}>Find Friends</button>
                                    </div>
                                ) : (
                                    friends.map((friend) => (
                                        <div key={friend.friend_id} className="friend-card">
                                            <div className="friend-info">
                                                <div className="friend-avatar">{friend.full_name.charAt(0).toUpperCase()}</div>
                                                <div className="friend-details">
                                                    <h3>{friend.full_name}</h3>
                                                    <p className="friend-stats">🔥 {friend.current_streak} day streak • 💪 {friend.total_workouts} workouts</p>
                                                </div>
                                            </div>
                                            <button className="btn-remove" onClick={() => handleRemoveFriend(friend.friend_id, friend.full_name)}>Remove</button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'requests' && (
                        <div className="requests-section">
                            {loading ? (
                                <div className="loading">Loading requests...</div>
                            ) : !Array.isArray(requests) || requests.length === 0 ? (
                                <div className="empty-state">
                                    <p className="empty-icon">📭</p>
                                    <p>No pending requests</p>
                                </div>
                            ) : (
                                requests.map((request) => (
                                    <div key={request.id} className="request-card">
                                        <div className="friend-info">
                                            <div className="friend-avatar">{request.full_name.charAt(0).toUpperCase()}</div>
                                            <div className="friend-details">
                                                <h3>{request.full_name}</h3>
                                                <p className="friend-email">{request.email}</p>
                                            </div>
                                        </div>
                                        <div className="request-actions">
                                            <button className="btn-accept" onClick={() => handleAcceptRequest(request.id)}>Accept</button>
                                            <button className="btn-reject" onClick={() => handleRejectRequest(request.id)}>Reject</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                    {activeTab === 'search' && (
                        <div className="search-section">
                            <div className="search-bar">
                                <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </div>
                            {searchLoading ? (
                                <div className="loading">Searching...</div>
                            ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
                                <div className="empty-state"><p>No users found</p></div>
                            ) : (
                                <div className="search-results">
                                    {searchResults.map((user) => (
                                        <div key={user.id} className="search-result-card">
                                            <div className="friend-info">
                                                <div className="friend-avatar">{user.full_name.charAt(0).toUpperCase()}</div>
                                                <div className="friend-details">
                                                    <h3>{user.full_name}</h3>
                                                    <p className="friend-email">{user.email}</p>
                                                    <p className="friend-stats">🔥 {user.current_streak} day streak • 💪 {user.total_workouts} workouts</p>
                                                </div>
                                            </div>
                                            {user.friendship_status === 'friends' ? (
                                                <span className="status-badge friends">Friends ✓</span>
                                            ) : user.friendship_status === 'request_sent' ? (
                                                <span className="status-badge pending">Request Sent</span>
                                            ) : user.friendship_status === 'request_received' ? (
                                                <span className="status-badge pending">Pending</span>
                                            ) : (
                                                <button className="btn-add" onClick={() => handleSendRequest(user.id)}>Add Friend</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Friends;