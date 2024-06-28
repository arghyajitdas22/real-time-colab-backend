const router = require("express").Router();
const { authenticateToken } = require("../middleware/middleware");
const { getTeamsForMember } = require("../controllers/teamcontroller");
const {
  getAllUsersOnPlatform,
  getAllCreatedTeams,
} = require("../controllers/user");

router.get("/:userId/teams", getTeamsForMember);
router.get("/", authenticateToken, getAllUsersOnPlatform);
router.get("/created-teams", authenticateToken, getAllCreatedTeams);
module.exports = router;
