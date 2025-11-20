const pool = require('../config/db');

class Group {
    // Create a new group
    static async create(name, description, createdBy) {
        const [result] = await pool.query(
            'INSERT INTO `groups` (name, description, created_by) VALUES (?, ?, ?)',
            [name, description, createdBy]
        );

        // Add creator as admin member
        await pool.query(
            'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
            [result.insertId, createdBy, 'admin']
        );

        return result.insertId;
    }

    // Get all groups for a user
    static async getUserGroups(userId) {
        const [groups] = await pool.query(
            `SELECT g.id, g.name, g.description, g.created_at,
                    u.full_name as creator_name,
                    gm.role,
                    COUNT(DISTINCT gm2.user_id) as member_count
             FROM \`groups\` g
             JOIN group_members gm ON g.id = gm.group_id
             JOIN users u ON g.created_by = u.id
             LEFT JOIN group_members gm2 ON g.id = gm2.group_id
             WHERE gm.user_id = ?
             GROUP BY g.id, g.name, g.description, g.created_at, u.full_name, gm.role
             ORDER BY g.created_at DESC`,
            [userId]
        );
        return groups;
    }

    // Get group details
    static async getGroupById(groupId) {
        const [groups] = await pool.query(
            `SELECT g.*, u.full_name as creator_name
             FROM \`groups\` g
             JOIN users u ON g.created_by = u.id
             WHERE g.id = ?`,
            [groupId]
        );
        return groups[0];
    }

    // Get group members with weekly workout stats
    static async getGroupMembers(groupId) {
        // Calculate start of current week (last Sunday)
        const [members] = await pool.query(
            `SELECT u.id, u.full_name, u.email, u.profile_picture, u.current_streak,
                    gm.role, gm.joined_at,
                    COUNT(DISTINCT CASE 
                        WHEN w.created_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) + 1 DAY)
                        THEN w.id 
                    END) as weekly_workouts,
                    GROUP_CONCAT(
                        DISTINCT CASE 
                            WHEN w.created_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) + 1 DAY)
                            THEN CONCAT(IFNULL(w.workout_type, 'Other'), '|', w.workout_name)
                        END SEPARATOR ';;'
                    ) as workout_details
             FROM group_members gm
             JOIN users u ON gm.user_id = u.id
             LEFT JOIN workouts w ON u.id = w.user_id 
                AND w.created_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) + 1 DAY)
             WHERE gm.group_id = ?
             GROUP BY u.id, u.full_name, u.email, u.profile_picture, u.current_streak, gm.role, gm.joined_at
             ORDER BY weekly_workouts DESC, u.full_name ASC`,
            [groupId]
        );
        return members;
    }

    // Add member to group
    static async addMember(groupId, userId, role = 'member') {
        const [result] = await pool.query(
            'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
            [groupId, userId, role]
        );
        return result.affectedRows > 0;
    }

    // Remove member from group
    static async removeMember(groupId, userId) {
        const [result] = await pool.query(
            'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
            [groupId, userId]
        );
        return result.affectedRows > 0;
    }

    // Check if user is member of group
    static async isMember(groupId, userId) {
        const [rows] = await pool.query(
            'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
            [groupId, userId]
        );
        return rows.length > 0;
    }

    // Check if user is admin of group
    static async isAdmin(groupId, userId) {
        const [rows] = await pool.query(
            'SELECT id FROM group_members WHERE group_id = ? AND user_id = ? AND role = ?',
            [groupId, userId, 'admin']
        );
        return rows.length > 0;
    }

    // Delete group (only by admin)
    static async deleteGroup(groupId) {
        const [result] = await pool.query(
            'DELETE FROM `groups` WHERE id = ?',
            [groupId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Group;
