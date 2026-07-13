import pool from "../utils/database.js";
import Queries from "../utils/queries.js";

const getTeams = (req, res) =>{
    pool.query(Queries.getTeamsQuery, (err, results) => {
        if(err) throw err;
        res.status(200).json(results.rows);
    })
}

const getTeamById = (req, res) =>{
    const id = req.params.id;;
    
    pool.query(Queries.getTeamByIdQuery, [id], (err, results) => {
        if(err){
            console.log("Team could Not found!");
            res.end();
        }
        else{
            if(results.rows.length == 0){
                console.log("Team does not exist with id: " + id);
                res.send("Team does not exist with id: " + id);
            }
            else{
                res.status(200).json(results.rows);
            }
        }
    })
    
}

const addTeam = (req, res) => {
    const {team_name} = req.body;

    //Check if same team exits
    pool.query(Queries.checkTeamExists, [team_name], (err, results) => {
        if(err){
            console.log("Could not check team exitst or not!");
            return res.end();
        }
        else{
            if(results.rows.length) {
                console.log("Team with given team_name is already exists");
                return res.sendStatus(409);
            }
            else{
                //Add the team to the database
                pool.query(Queries.addTeamQuery, [team_name], (err, results) =>{
                    if(err){
                        console.log("Error happened while adding team");
                        console.log(err);
                        return res.sendStatus(500);
                    }
                    else{
                        console.log("Team created successfully");
                        return res.status(201).json(results.rows[0]);
                    }
                });
            }
        }

    });
}


const deleteTeam = async (req, res) => {
    const team_id = req.params.team_id;

    console.log(team_id);
    try {
        const isUsedResponse = await pool.query("SELECT * FROM interns WHERE team_id = $1", [team_id]);
        if(isUsedResponse.rows.length > 0) {
            return res.sendStatus(403);
        }

        
        pool.query(Queries.deleteTeamQuery, [team_id], (err, results) => {
            if(err){
                console.log("Error happened while deleting");
                res.end();
            }
            else{
                console.log("Intern Deleted Successfully");
                res.end();
            }
        });
        
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }

    

}

const updateTeam = (req, res) => {
    const { team_id, team_name } = req.body;

    pool.query(Queries.getTeamByIdQuery, [team_id], (err, results) => {
        if(err) {
            console.log("Error happened while finding team by id");
            res.end();
        }
        else{
            const noTeamFound = !results.rows.length;
            if(noTeamFound) {
                console.log("Team Does Not Exist In the Database");
                return res.sendStatus(404);
            }
            else{
                pool.query(Queries.updateTeamQuery, [team_id, team_name], (err, results) => {
                    if(err) {
                        console.log("Error happened while updating team by id");
                        console.log(err);
                        return res.sendStatus(500);
                    }
                    else{
                        console.log("test", team_id, team_name)
                        console.log("Team Updated Successfully");
                        return res.status(200).send("Team Updated Successfully");
                    }
                })
            }
        }


    });
}



const TeamController = {
    getTeam: getTeams,
    getTeamById: getTeamById,
    addTeam: addTeam,
    deleteTeam: deleteTeam,
    updateTeam: updateTeam
}

export default TeamController;
