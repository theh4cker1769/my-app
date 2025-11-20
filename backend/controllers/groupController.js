const Group = require('../models/Group');

// Create a new group
exports.createGroup = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Group name is required'
            });
        }

        const groupId = await Group.create(name, description || '', userId);

        res.status(201).json({
            success: true,
            message: 'Group created successfully',
            data: { id: groupId, name, description }
        });
    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get user's groups
exports.getUserGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        const groups = await Group.getUserGroups(userId);

        res.json({
            success: true,
            data: groups
        });
    } catch (error) {
        console.error('Get user groups error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get group details with members
exports.getGroupMembers = async (req, res) => {
    try {
        const userId = req.user.id;
        const { groupId } = req.params;

        // Check if user is member
        const isMember = await Group.isMember(groupId, userId);
        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this group'
            });
        }

        const members = await Group.getGroupMembers(groupId);

        res.json({
            success: true,
            data: members
        });
    } catch (error) {
        console.error('Get group members error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Add member to group
exports.addMember = async (req, res) => {
    try {
        const userId = req.user.id;
        const { groupId } = req.params;
        const { userId: newMemberId } = req.body;

        // Check if requester is admin
        const isAdmin = await Group.isAdmin(groupId, userId);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Only admins can add members'
            });
        }

        // Check if user already a member
        const alreadyMember = await Group.isMember(groupId, newMemberId);
        if (alreadyMember) {
            return res.status(400).json({
                success: false,
                message: 'User is already a member'
            });
        }

        await Group.addMember(groupId, newMemberId);

        res.json({
            success: true,
            message: 'Member added successfully'
        });
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Remove member from group
exports.removeMember = async (req, res) => {
    try {
        const userId = req.user.id;
        const { groupId, memberId } = req.params;

        // Check if requester is admin
        const isAdmin = await Group.isAdmin(groupId, userId);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Only admins can remove members'
            });
        }

        await Group.removeMember(groupId, memberId);

        res.json({
            success: true,
            message: 'Member removed successfully'
        });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Leave group
exports.leaveGroup = async (req, res) => {
    try {
        const userId = req.user.id;
        const { groupId } = req.params;

        // Check if user is the only admin
        const isAdmin = await Group.isAdmin(groupId, userId);
        if (isAdmin) {
            const members = await Group.getGroupMembers(groupId);
            const admins = members.filter(m => m.role === 'admin');

            if (admins.length === 1) {
                return res.status(400).json({
                    success: false,
                    message: 'You are the only admin. Please assign another admin before leaving or delete the group.'
                });
            }
        }

        await Group.removeMember(groupId, userId);

        res.json({
            success: true,
            message: 'Left group successfully'
        });
    } catch (error) {
        console.error('Leave group error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Delete group
exports.deleteGroup = async (req, res) => {
    try {
        const userId = req.user.id;
        const { groupId } = req.params;

        // Check if requester is admin
        const isAdmin = await Group.isAdmin(groupId, userId);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Only admins can delete groups'
            });
        }

        await Group.deleteGroup(groupId);

        res.json({
            success: true,
            message: 'Group deleted successfully'
        });
    } catch (error) {
        console.error('Delete group error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
