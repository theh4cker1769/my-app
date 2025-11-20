const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
    createGroup,
    getUserGroups,
    getGroupMembers,
    addMember,
    removeMember,
    leaveGroup,
    deleteGroup
} = require('../controllers/groupController');

// All routes require authentication
router.use(protect);

// Group routes
router.post('/', createGroup);
router.get('/', getUserGroups);
router.get('/:groupId/members', getGroupMembers);
router.post('/:groupId/members', addMember);
router.delete('/:groupId/members/:memberId', removeMember);
router.post('/:groupId/leave', leaveGroup);
router.delete('/:groupId', deleteGroup);

module.exports = router;
