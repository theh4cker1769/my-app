const Friend = require('../models/Friend');
const User = require('../models/User');

// Send friend request
exports.sendFriendRequest = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { friend_id } = req.body;

        if (!friend_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Friend ID is required' 
            });
        }

        if (user_id === parseInt(friend_id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot send friend request to yourself' 
            });
        }

        // Check if friend exists
        const friend = await User.findById(friend_id);
        if (!friend) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Check if friendship already exists
        const existing = await Friend.checkFriendship(user_id, friend_id);
        if (existing) {
            return res.status(400).json({ 
                success: false, 
                message: 'Friend request already exists or you are already friends' 
            });
        }

        // Create friend request
        await Friend.sendRequest(user_id, friend_id);

        res.status(201).json({
            success: true,
            message: 'Friend request sent successfully'
        });

    } catch (error) {
        console.error('Send friend request error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get friend requests (received)
exports.getFriendRequests = async (req, res) => {
    try {
        const user_id = req.user.id;
        const requests = await Friend.getRequests(user_id);

        res.json({
            success: true,
            data: requests
        });

    } catch (error) {
        console.error('Get friend requests error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get sent friend requests
exports.getSentRequests = async (req, res) => {
    try {
        const user_id = req.user.id;
        const requests = await Friend.getSentRequests(user_id);

        res.json({
            success: true,
            data: requests
        });

    } catch (error) {
        console.error('Get sent requests error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Accept friend request
exports.acceptFriendRequest = async (req, res) => {
    try {
        const { friendship_id } = req.params;

        const success = await Friend.acceptRequest(friendship_id);

        if (!success) {
            return res.status(404).json({ 
                success: false, 
                message: 'Friend request not found' 
            });
        }

        res.json({
            success: true,
            message: 'Friend request accepted'
        });

    } catch (error) {
        console.error('Accept friend request error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Reject friend request
exports.rejectFriendRequest = async (req, res) => {
    try {
        const { friendship_id } = req.params;

        const success = await Friend.rejectRequest(friendship_id);

        if (!success) {
            return res.status(404).json({ 
                success: false, 
                message: 'Friend request not found' 
            });
        }

        res.json({
            success: true,
            message: 'Friend request rejected'
        });

    } catch (error) {
        console.error('Reject friend request error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Get all friends
exports.getFriends = async (req, res) => {
    try {
        const user_id = req.user.id;
        const friends = await Friend.getFriends(user_id);

        res.json({
            success: true,
            data: friends
        });

    } catch (error) {
        console.error('Get friends error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Remove friend
exports.removeFriend = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { friend_id } = req.params;

        const success = await Friend.removeFriend(user_id, friend_id);

        if (!success) {
            return res.status(404).json({ 
                success: false, 
                message: 'Friendship not found' 
            });
        }

        res.json({
            success: true,
            message: 'Friend removed successfully'
        });

    } catch (error) {
        console.error('Remove friend error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Search users
exports.searchUsers = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { query } = req.query;

        if (!query || query.length < 2) {
            return res.status(400).json({ 
                success: false, 
                message: 'Search query must be at least 2 characters' 
            });
        }

        const users = await Friend.searchUsers(user_id, query);

        res.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};