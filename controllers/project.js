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
    const project = await prisma.$transaction(async (prisma) => {
      // Create the project
      const newProject = await prisma.project.create({
        data: {
          title,
          team: { connect: { id: Number(teamId) } },
          creator: { connect: { id: Number(creatorId) } },
        },
      });

      // Create project members
      const projectMembers = memberIds.map((memberId) => ({
        projectId: newProject.id,
        userId: Number(memberId),
      }));

      await prisma.projectMember.createMany({ data: projectMembers });

      return newProject;
    });

    res.status(StatusCodes.CREATED).json(project);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "An error occurred while creating the project" });
  }
};

module.exports = { createProject };
