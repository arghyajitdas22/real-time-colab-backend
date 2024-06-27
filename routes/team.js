const  {createTeam, addTeamMember,getTeamMembers , getAllTeams} = require("../controllers/teamcontroller");
const router = require("express").Router();
const authenticate = require('../middleware/middleware');

router.post('/create', authenticate, createTeam);
router.post('/add-member', authenticate, addTeamMember);
router.get('/:teamId/members', authenticate, getTeamMembers);
router.get('/allteam',authenticate, getAllTeams);



module.exports = router;
