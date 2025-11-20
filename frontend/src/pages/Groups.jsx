import { useState, useEffect } from 'react';
import { groupAPI, friendAPI } from '../api/apiServices';
import Layout from '../layout/Layout';
import Header from '../layout/Header';
import '../styles/Groups.css';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            fetchGroupMembers(selectedGroup.id);
        }
    }, [selectedGroup]);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const response = await groupAPI.getUserGroups();
            if (response && response.success) {
                setGroups(Array.isArray(response.data) ? response.data : []);
                if (response.data.length > 0 && !selectedGroup) {
                    setSelectedGroup(response.data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupMembers = async (groupId) => {
        setLoading(true);
        try {
            const response = await groupAPI.getGroupMembers(groupId);
            if (response && response.success) {
                setMembers(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error('Error fetching group members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;

        try {
            const response = await groupAPI.createGroup(newGroupName, newGroupDescription);
            if (response && response.success) {
                setShowCreateModal(false);
                setNewGroupName('');
                setNewGroupDescription('');
                fetchGroups();
            }
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Failed to create group');
        }
    };

    const getMotivationalMessage = (weeklyWorkouts) => {
        if (weeklyWorkouts >= 5) {
            return { emoji: '🔥', message: 'On fire! Keep crushing it!', class: 'fire' };
        } else if (weeklyWorkouts >= 3) {
            return { emoji: '💪', message: 'Strong work this week!', class: 'strong' };
        } else if (weeklyWorkouts >= 1) {
            return { emoji: '👍', message: 'Good start, keep going!', class: 'good' };
        } else {
            return { emoji: '😴', message: 'Wake up! Your group needs you!', class: 'sleepy' };
        }
    };

    const getRankEmoji = (index) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return `#${index + 1}`;
    };

    const workoutTypes = {
        'Chest': { emoji: '💪', color: '#FF6B6B' },
        'Back': { emoji: '🦾', color: '#4ECDC4' },
        'Shoulders': { emoji: '🏋️', color: '#FFE66D' },
        'Legs': { emoji: '🦵', color: '#95E1D3' },
        'Arms': { emoji: '💪', color: '#F38181' },
        'Core': { emoji: '🔥', color: '#AA96DA' },
        'Cardio': { emoji: '🏃', color: '#FCBAD3' },
        'Full Body': { emoji: '🎯', color: '#A8E6CF' },
        'Other': { emoji: '📝', color: '#A0AEC0' }
    };

    const getWorkoutIcon = (type) => {
        return workoutTypes[type] || workoutTypes['Other'];
    };

    const parseWorkouts = (detailsString) => {
        if (!detailsString) return [];
        return detailsString.split(';;').map(detail => {
            const [type, name] = detail.split('|');
            return { type, name };
        });
    };

    return (
        <Layout>
            <Header />
            <div className="groups-container">
                <div className="groups-header">
                    <h1 className="page-title">👥 Groups</h1>
                    <button className="btn-create-group" onClick={() => setShowCreateModal(true)}>
                        + Create Group
                    </button>
                </div>

                <div className="groups-content">
                    {/* Groups Sidebar */}
                    <div className="groups-sidebar">
                        <h3>My Groups</h3>
                        {loading && groups.length === 0 ? (
                            <div className="loading">Loading...</div>
                        ) : groups.length === 0 ? (
                            <div className="empty-state">
                                <p>No groups yet</p>
                                <p className="empty-hint">Create one to get started!</p>
                            </div>
                        ) : (
                            <div className="groups-list">
                                {groups.map((group) => (
                                    <div
                                        key={group.id}
                                        className={`group-card ${selectedGroup?.id === group.id ? 'active' : ''}`}
                                        onClick={() => setSelectedGroup(group)}
                                    >
                                        <h4>{group.name}</h4>
                                        <p className="group-meta">{group.member_count} members</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Group Details */}
                    <div className="group-details">
                        {selectedGroup ? (
                            <>
                                <div className="group-info">
                                    <h2>{selectedGroup.name}</h2>
                                    {selectedGroup.description && (
                                        <p className="group-description">{selectedGroup.description}</p>
                                    )}
                                    <p className="week-info">📅 This Week's Progress (Resets Sunday)</p>
                                </div>

                                <div className="members-leaderboard">
                                    {loading ? (
                                        <div className="loading">Loading members...</div>
                                    ) : members.length === 0 ? (
                                        <div className="empty-state">No members yet</div>
                                    ) : (
                                        members.map((member, index) => {
                                            const motivation = getMotivationalMessage(member.weekly_workouts);
                                            const workouts = parseWorkouts(member.workout_details);

                                            return (
                                                <div key={member.id} className={`member-card rank-${index + 1}`}>
                                                    <div className="member-rank">
                                                        <span className="rank-badge">{getRankEmoji(index)}</span>
                                                    </div>
                                                    <div className="member-info">
                                                        <div className="member-avatar">
                                                            {member.full_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="member-details">
                                                            <h3>{member.full_name}</h3>
                                                            <div className="member-stats">
                                                                <span className="workout-count">
                                                                    💪 {member.weekly_workouts} workout{member.weekly_workouts !== 1 ? 's' : ''} this week
                                                                </span>
                                                                <span className="streak">
                                                                    🔥 {member.current_streak} day streak
                                                                </span>
                                                            </div>
                                                            {workouts.length > 0 && (
                                                                <div className="member-workouts-list">
                                                                    {workouts.map((workout, idx) => {
                                                                        const icon = getWorkoutIcon(workout.type);
                                                                        return (
                                                                            <span
                                                                                key={idx}
                                                                                className="workout-tag"
                                                                                style={{
                                                                                    backgroundColor: `${icon.color}20`,
                                                                                    color: icon.color,
                                                                                    border: `1px solid ${icon.color}40`
                                                                                }}
                                                                                title={workout.type}
                                                                            >
                                                                                {icon.emoji} {workout.name}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={`motivation-badge ${motivation.class}`}>
                                                        <span className="motivation-emoji">{motivation.emoji}</span>
                                                        <span className="motivation-text">{motivation.message}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="empty-state">
                                <p>Select a group to view members</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Group Modal */}
                {showCreateModal && (
                    <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>Create New Group</h2>
                            <form onSubmit={handleCreateGroup}>
                                <div className="form-group">
                                    <label>Group Name *</label>
                                    <input
                                        type="text"
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        placeholder="e.g., Morning Warriors"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={newGroupDescription}
                                        onChange={(e) => setNewGroupDescription(e.target.value)}
                                        placeholder="What's this group about?"
                                        rows="3"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-submit">
                                        Create Group
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Groups;
