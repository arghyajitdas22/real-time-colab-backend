const router = require("express").Router();
const { authenticateToken } = require("../middleware/middleware");
const {
  createProject,
  getAllMembersOfProject,
} = require("../controllers/project");

router.post("/", authenticateToken, createProject);
router.get("/members/:projectId", authenticateToken, getAllMembersOfProject);

module.exports = router;
