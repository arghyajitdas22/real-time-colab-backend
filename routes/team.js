const {
  createTeam,
  addTeamMember,
  getTeamMembers,
  getAllTeams,
  getNonCreatorMembers,
} = require("../controllers/teamcontroller");
const router = require("express").Router();
const { authenticate, authenticateToken } = require("../middleware/middleware");

router.post("/", authenticateToken, createTeam);
router.post("/add-member", authenticate, addTeamMember);
router.get("/:teamId/members", authenticate, getTeamMembers);
router.get("/allteam", authenticate, getAllTeams);
router.get(
  "/non-creator-members/:teamId",
  authenticateToken,
  getNonCreatorMembers
);

module.exports = router;
