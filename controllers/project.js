const { prisma } = require("../db/dbconfig.js");
const { StatusCodes } = require("http-status-codes");

const createProject = async (req, res) => {
  const { title, teamId, memberIds } = req.body;
  const creatorId = req.user.user_id;
  if (!title || !teamId || !memberIds || !creatorId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Title, team ID, member IDs, and creator ID are required",
    });
  }

  try {
    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create the project
      const newProject = await prisma.project.create({
        data: {
          title,
          teamId: Number(teamId),
          creatorId: Number(creatorId),
        },
      });

      // Create the ProjectMember entries
      const projectMembers = memberIds.map((memberId) => ({
        projectId: newProject.id,
        userId: Number(memberId),
      }));
      await prisma.projectMember.createMany({
        data: projectMembers,
      });

      // Create the TaskOrder entry for the project
      await prisma.taskOrder.create({
        data: {
          projectId: newProject.id,
          to_do_ids: [],
          in_progress_ids: [],
          completed_ids: [],
        },
      });

      return newProject;
    });

    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    console.error("Error creating project:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "An error occurred while creating the project" });
  }
};

const getAllMembersOfProject = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Project ID is required" });
  }

  try {
    const projectMembers = await prisma.projectMember.findMany({
      where: { projectId: Number(projectId) },
      include: {
        user: true, // Include user details in the response
      },
    });

    const members = projectMembers.map((pm) => pm.user);

    res.status(StatusCodes.OK).json(members);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "An error occurred while fetching project members" });
  }
};

module.exports = { createProject, getAllMembersOfProject };
