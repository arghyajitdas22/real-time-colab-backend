const { prisma } = require("../db/dbconfig.js");
const { StatusCodes } = require("http-status-codes");

module.exports.createTeam = async (req, res) => {
  const { title, memberIds } = req.body;
  const creatorId = req.user.user_id;
  if (!title || !memberIds || !creatorId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Title, member IDs, and creator ID are required" });
  }

  try {
    // Start a transaction
    const team = await prisma.$transaction(async (prisma) => {
      // Create the team
      const newTeam = await prisma.team.create({
        data: {
          title,
          creator: { connect: { id: Number(creatorId) } },
        },
      });

      // Create team members
      const teamMembers = memberIds.map((memberId) => ({
        teamId: newTeam.id,
        userId: Number(memberId),
      }));

      await prisma.teamMember.createMany({ data: teamMembers });

      return newTeam;
    });

    res.status(StatusCodes.CREATED).json(team);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "An error occurred while creating the team" });
  }
};

module.exports.addTeamMember = async (req, res, next) => {
  try {
    const { teamId, first_name } = req.body;

    // Find user by first name
    const user = await prisma.user.findMany({
      where: { first_name },
    });

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: parseInt(teamId) },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Check if user is already a member of the team
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: parseInt(teamId),
          userId: user[0].id,
        },
      },
    });

    if (existingMember) {
      return res
        .status(400)
        .json({ error: "User is already a member of the team" });
    }

    // Add user to team
    const teamMember = await prisma.teamMember.create({
      data: {
        teamId: parseInt(teamId),
        userId: user[0].id,
      },
    });

    res.json({ teamMember });
  } catch (error) {
    console.error("Error adding team member:", error);
    next(error);
  }
};

module.exports.getTeamMembers = async (req, res, next) => {
  try {
    const { teamId } = req.params;

    const teamMembers = await prisma.teamMember.findMany({
      where: { teamId: parseInt(teamId) },
      include: {
        user: true,
      },
    });

    if (!teamMembers) {
      return res.status(404).json({ error: "Team not found" });
    }

    const members = teamMembers.map((tm) => tm.user);

    res.json({ members });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports.getTeamsForMember = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const userWithTeams = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!userWithTeams) {
      return res.status(404).json({ error: "User not found" });
    }

    // Extract team details from the response
    const teams = userWithTeams.teams.map((teamMember) => teamMember.team);

    res.json({ teams });
  } catch (error) {
    next(error);
  }
};

module.exports.getAllTeams = async (req, res, next) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    const teamsWithMembers = teams.map((team) => ({
      ...team,
      members: team.members.map((member) => member.user),
    }));

    res.json({ teams: teamsWithMembers });
  } catch (error) {
    next(error);
  }
};

module.exports.getNonCreatorMembers = async (req, res) => {
  const { teamId } = req.params;
  const creatorId = req.user.user_id;

  if (!teamId || !creatorId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Team ID and Creator ID are required" });
  }

  try {
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        teamId: Number(teamId),
        userId: {
          not: Number(creatorId),
        },
      },
      include: {
        user: true,
      },
    });

    const users = teamMembers.map((member) => member.user);

    res.status(StatusCodes.OK).json(users);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "An error occurred while fetching team members" });
  }
};
