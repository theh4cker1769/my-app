const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
    sendFriendRequest,
    getFriendRequests,
    getSentRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriends,
    removeFriend,
    searchUsers
} = require('../controllers/friendController');

router.use(protect); // All routes require authentication

router.post('/request', sendFriendRequest);
router.get('/requests', getFriendRequests);
router.get('/requests/sent', getSentRequests);
router.put('/requests/:friendship_id/accept', acceptFriendRequest);
router.delete('/requests/:friendship_id/reject', rejectFriendRequest);
router.get('/', getFriends);
router.delete('/:friend_id', removeFriend);
router.get('/search', searchUsers);

module.exports = router;