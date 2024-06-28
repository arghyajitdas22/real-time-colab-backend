const router = require("express").Router();
const { authenticateToken } = require("../middleware/middleware");
const { createProject } = require("../controllers/project");

router.post("/", authenticateToken, createProject);

module.exports = router;
