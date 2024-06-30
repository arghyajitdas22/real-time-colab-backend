const router = require("express").Router();
const { authenticateToken } = require("../middleware/middleware");
const {
  createTask,
  getAllTasksOfProject,
  updateTaskOrder,
  updatedTaskById,
  deleteTaskById,
} = require("../controllers/task.controller");

router.post("/", authenticateToken, createTask);
router.get("/:projectId", authenticateToken, getAllTasksOfProject);
router.patch("/:projectId", authenticateToken, updateTaskOrder);
router.patch("/update/:taskId", authenticateToken, updatedTaskById);
router.delete("/:taskId", authenticateToken, deleteTaskById);

module.exports = router;
