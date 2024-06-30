const { prisma } = require("../db/dbconfig.js");
const { StatusCodes } = require("http-status-codes");

const createTask = async (req, res) => {
  const { status, content, due_date, assigneeId, projectId } = req.body;
  const creatorId = req.user.user_id;

  if (
    !status ||
    !content ||
    !due_date ||
    !creatorId ||
    !assigneeId ||
    !projectId
  ) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error:
        "Status, content, due_date, creatorId, assigneeId, and projectId are required",
    });
  }

  try {
    const newTask = await prisma.task.create({
      data: {
        status,
        content,
        due_date: new Date(due_date),
        creatorId: Number(creatorId),
        assigneeId: Number(assigneeId),
        projectId: Number(projectId),
      },
    });

    const taskOrder = await prisma.taskOrder.update({
      where: {
        projectId: Number(projectId),
      },
      data: {
        [status.toLowerCase() + "_ids"]: {
          push: newTask.task_id,
        },
      },
    });

    res.status(StatusCodes.CREATED).json(newTask);
  } catch (error) {
    console.error("Error creating task and updating task order:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error:
        "An error occurred while creating the task and updating the task order",
    });
  }
};

const getAllTasksOfProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.user_id;

  if (!projectId || !userId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "projectId and userId are required" });
  }

  try {
    // Fetch all tasks in the project
    const tasks = await prisma.task.findMany({
      where: {
        projectId: parseInt(projectId),
      },
      include: {
        assignee: true, // Include assignee information
      },
    });

    // Fetch task order for the specific user in the project
    const taskOrder = await prisma.taskOrder.findUnique({
      where: {
        projectId: parseInt(projectId),
      },
    });

    // Send the response
    res.status(StatusCodes.OK).json({
      tasks,
      taskOrder,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "An error occurred while fetching tasks" });
  }
};

const updateTaskOrder = async (req, res) => {
  const { projectId } = req.params;
  const { taskId, status, to_do_ids, in_progress_ids, completed_ids } =
    req.body;

  if (
    !projectId ||
    !taskId ||
    !status ||
    !to_do_ids ||
    !in_progress_ids ||
    !completed_ids
  ) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error:
        "projectId, taskId, status, to_do_ids, in_progress_ids, and completed_ids are required",
    });
  }

  try {
    // Ensure all IDs are integers
    const toDoIds = to_do_ids.map((id) => parseInt(id));
    const inProgressIds = in_progress_ids.map((id) => parseInt(id));
    const completedIds = completed_ids.map((id) => parseInt(id));

    // Update the task's status
    const updatedTask = await prisma.task.update({
      where: { task_id: parseInt(taskId) },
      data: { status },
    });

    // Update the task order arrays
    const updatedTaskOrder = await prisma.taskOrder.update({
      where: { projectId: parseInt(projectId) },
      data: {
        to_do_ids: { set: toDoIds },
        in_progress_ids: { set: inProgressIds },
        completed_ids: { set: completedIds },
      },
    });

    // Send the response
    res.status(StatusCodes.OK).json({
      updatedTask,
      updatedTaskOrder,
    });
  } catch (error) {
    console.error("Error updating task status and order:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "An error occurred while updating the task status and order",
    });
  }
};

const updatedTaskById = async (req, res) => {
  const { taskId } = req.params;
  const { content, due_date } = req.body;

  try {
    // Update the task's content and due date
    const updatedTask = await prisma.task.update({
      where: { task_id: parseInt(taskId) },
      data: {
        content,
        due_date: new Date(due_date),
      },
    });

    // Send the response
    res.status(StatusCodes.OK).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "An error occurred while updating the task" });
  }
};

const deleteTaskById = async (req, res) => {
  const { taskId } = req.params;
  const { projectId, status } = req.body;
  if (!taskId || !projectId || !status) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "taskId, projectId, and status are required",
    });
  }
  try {
    // Convert taskId to integer
    const taskIdInt = parseInt(taskId);

    // Delete the task
    const deletedTask = await prisma.task.delete({
      where: { task_id: taskIdInt },
    });

    // Fetch the TaskOrder for the project
    const taskOrder = await prisma.taskOrder.findUnique({
      where: { projectId: parseInt(projectId) },
    });

    if (!taskOrder) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "TaskOrder not found for the project" });
    }

    // Update the appropriate status array
    let updatedOrder;
    switch (status) {
      case "TO_DO":
        updatedOrder = {
          to_do_ids: taskOrder.to_do_ids.filter((id) => id !== taskIdInt),
        };
        break;
      case "IN_PROGRESS":
        updatedOrder = {
          in_progress_ids: taskOrder.in_progress_ids.filter(
            (id) => id !== taskIdInt
          ),
        };
        break;
      case "COMPLETED":
        updatedOrder = {
          completed_ids: taskOrder.completed_ids.filter(
            (id) => id !== taskIdInt
          ),
        };
        break;
      default:
        return res.status(400).json({ error: "Invalid status provided" });
    }

    // Update the TaskOrder in the database
    await prisma.taskOrder.update({
      where: { projectId: parseInt(projectId) },
      data: updatedOrder,
    });

    // Send the response
    res.json({
      message: "Task deleted and task order updated successfully",
      deletedTask,
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    res
      .status(StatusCodes.OK)
      .json({ error: "An error occurred while deleting the task" });
  }
};

module.exports = {
  createTask,
  getAllTasksOfProject,
  updateTaskOrder,
  updatedTaskById,
  deleteTaskById,
};
