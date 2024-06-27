const router = require("express").Router();
const { getTeamsForMember } = require("../controllers/teamcontroller");


router.get('/:userId/teams', getTeamsForMember);
module.exports = router;