import { Team } from "../models/Team";

const getTeams = async (axiosInstance: any): Promise<Team[]> => {
    try {
        const response = await axiosInstance.get("/api/teams")
        
        const data: Team[] = response.data;

        const teamsData: Team[] = data.map((team: any) => ({
          ...team,
          team_id: parseInt(team.team_id),
        }));

        return teamsData;
      }
    catch (error) {
        throw error;
      }
}


const addTeam= async (axiosInstance: any, newTeam: Team) => {
  try {
    await axiosInstance.post("/api/teams", newTeam);
  } catch (error) {
        throw error;
  }
}


const updateTeam = async (axiosInstance: any, updatedTeam: Team) => {
try {
    await axiosInstance.put(`/api/teams/${updatedTeam.team_id}`, updatedTeam);
  } catch (error) {
        throw error;
  }
}

const deleteTeam = async (axiosInstance: any, team_id: number) => {
  try {
await axiosInstance.delete(`/api/teams/${team_id}`);
  } catch (error) {
        throw error;
  }
}


const TeamService = {
    getTeams: getTeams,
    addTeam: addTeam,
    updateTeam: updateTeam,
    deleteTeam: deleteTeam,
}
export default TeamService;