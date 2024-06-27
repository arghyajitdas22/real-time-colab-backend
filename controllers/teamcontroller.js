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
            create: { userId: parseInt(creatorId) } // Add creator as a member
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
      const { teamId, username } = req.body;
  
      // Find user by username
      const user = await prisma.user.findUnique({
        where: { username: username }
      });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Add user to team
      const teamMember = await prisma.teamMember.create({
        data: {
          teamId: parseInt(teamId),
          userId: user.id
        }
      });
  
      res.json({ teamMember });
    } catch (error) {
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
      next(error);
    }
  };


  // Fetch all teams a user is a member of
module.exports.getTeamsForMember = async (req, res, next) => {
    try {
      const { userId } = req.params;
  
      // Find user by userId and include teams they are members of
      const userWithTeams = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        include: {
          teams: {
            include: {
              team: true  // Include details of each team
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
  