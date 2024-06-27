const { createTeam, addTeamMember,getTeamMembers } = require("../controllers/teamcontroller");
const router = require("express").Router();

router.post('/create', createTeam);
router.post('/add-member', addTeamMember);
router.get('/:teamId/members', getTeamMembers);

module.exports = router;
