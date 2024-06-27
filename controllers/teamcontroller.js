const {prisma}=require('../db/dbconfig.js')

module.exports.createTeam = async (req, res, next) => {
    try {
      const { creatorId, title } = req.body;
  
      const team = await prisma.team.create({
        data: {
          title: title,
          creator: {
            connect: { id: parseInt(creatorId) }
          },
          members: {
            create: { userId: parseInt(creatorId) } 
          }
        }
      });
  
      res.json({ team });
    } catch (error) {
      next(error);
    }
  };


module.exports.addTeamMember = async (req, res, next) => {
  try {
    const { teamId, first_name } = req.body;

    // Find user by first name
    const user = await prisma.user.findMany({
      where: { first_name }
    });

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: parseInt(teamId) }
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is already a member of the team
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: parseInt(teamId),
          userId: user[0].id
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member of the team' });
    }

    // Add user to team
    const teamMember = await prisma.teamMember.create({
      data: {
        teamId: parseInt(teamId),
        userId: user[0].id
      }
    });

    res.json({ teamMember });
  } catch (error) {
    console.error('Error adding team member:', error);
    next(error);
  }
  };


module.exports.getTeamMembers = async (req, res, next) => {
    try {
      const { teamId } = req.params;
  
      const teamMembers = await prisma.teamMember.findMany({
        where: { teamId: parseInt(teamId) },
        include: {
          user: true
        }
      });
  
      if (!teamMembers) {
        return res.status(404).json({ error: 'Team not found' });
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
              team: true  
            }
          }
        }
      });
  
      if (!userWithTeams) {
        return res.status(404).json({ error: 'User not found' });
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