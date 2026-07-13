import path, { dirname } from "path";
import pool from "../utils/database.js";
import Queries from "../utils/queries.js";
import { fileURLToPath } from "url";
import brcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import 'dotenv/config';
import { decode } from "punycode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const addUser = async (req, res) => {

    const {username, password, role, team_id, email} = req.body;

    try {
        const result = await pool.query(Queries.checkUserExistsQuery, [username]);
        if(result.rows.length) {
            console.log("User is already exists!");
            return res.status(409).json({'message': 'User is already exists!'}); //Conflict
        }
        else{
            const hashedPassword = await brcrypt.hash(password, 10);
            const response = await pool.query(Queries.addUserQuery, [username, hashedPassword, role, email]);

            if(role === 1984){ //If the user is a supervisor
                const user_id = BigInt(response.rows[0].user_id);
                
                await pool.query(Queries.addSupervisorQuery, [user_id, team_id])
            }
            

            console.log("User created successfully");
            return res.status(201).json({"success": 'New user ${username} created!'});

        }
    }
    catch (error){
        console.log(error);
        res.status(500).json({'message': error.message});
    }
}


const getUsers = async (req, res) => {

    try {
        const results = await pool.query(Queries.getUsersQuery);

        return res.status(200).json(results.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({'message': error.message});
    }

}


const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const response = await pool.query(Queries.getUserQuery, [username]);
        if(!response.rows.length) {
            console.log("User does not exists!")
            res.sendStatus(401); //unauthorized
        }
        else{
            const user = response.rows[0];

            const match = await brcrypt.compare(password, user.password);
            
            if(match) {
                //create jwt
                const role = user.role;
                const user_id = user.user_id;
                
                const team_idResponse = await pool.query("SELECT * FROM supervisors WHERE user_id = $1", [user_id]);
                const team_id = team_idResponse.rows[0]?.team_id;

                let intern_id;
                if(role === 2001) {
                    const intern_idResponse = await pool.query("SELECT intern_id FROM interns WHERE id_no = $1", [username])
                    intern_id = intern_idResponse.rows[0].intern_id;
                }

                const accessToken = jsonwebtoken.sign(
                    { 
                        "UserInfo": {
                        "username": user.username,
                        "role": user.role,
                        "user_id": user.user_id,
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    {'expiresIn': '15m'}
                );

                const refreshToken = jsonwebtoken.sign(
                    {'username': user.username},
                    process.env.REFRESH_TOKEN_SECRET,
                    {'expiresIn': '1h'} //Decides the time that user no needs to login again
                );

                //Add jwt to the user
                await pool.query(Queries.addRefreshToken, [user.username, refreshToken]);

                console.log("User logged in");
                res.cookie('jwt', refreshToken, {httpOnly: true, maxAge: 24 * 60 * 60 * 1000}); //maxAge: 1 day
                res.json({accessToken, role, user_id, team_id, intern_id});
            }
            else{
                res.sendStatus(401);
            }
        }

    }
    catch (error){
        console.log(error);
        res.status(500).json({'message': error.message});
    }


}


const hadnleRefreshToken = async (req, res) => {
    const cookies = req.cookies;

    
    try {
        if(!cookies?.jwt) {
            return res.sendStatus(401); //unauthorized
        }
        
        
        const refreshToken = cookies.jwt;
        const response = await pool.query(Queries.getUserByRefreshToken, [refreshToken]);
        if(!response.rows.length) {
            console.log("User does not exists!")
            return res.sendStatus(403); //Forbidden
        }
        
        const user = response.rows[0];

        const user_id = user.user_id;
        const role = user.role;
        const username = user.username;
        
        const team_idResponse = await pool.query("SELECT * FROM supervisors WHERE user_id = $1", [user_id]);
        const team_id = team_idResponse.rows[0]?.team_id;

        let intern_id;
        if(role === 2001) {
            const intern_idResponse = await pool.query("SELECT intern_id FROM interns WHERE id_no = $1", [username])
            intern_id = intern_idResponse.rows[0].intern_id;
        }
            
        jsonwebtoken.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if(err || user.username !== decoded.username){
                    return res.sendStatus(403);
                } 
                const accessToken = jsonwebtoken.sign(
                    { 
                        "UserInfo": {
                        "username": user.username,
                        "role": user.role,
                        "user_id": user.user_id,
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    {'expiresIn': '15m'}

                );
                return res.json({accessToken, role,username, user_id, team_id, intern_id});
            }
        )
        
               
                
        

    }
    catch (error){
        console.log(error);
        res.status(500).json({'message': error.message});
    }


}

const handleLogout = async (req, res) => {
    //On client, also delete the accessToken

    const cookies = req.cookies;

    try {
        if(!cookies?.jwt) {
            return res.sendStatus(204); //No content
        }
        
        const refreshToken = cookies.jwt;
        const response = await pool.query(Queries.getUserByRefreshToken, [refreshToken]);
        if(!response.rows.length) {
            res.clearCookie("jwt", {httpOnly: true, maxAge: 24 * 60 * 60 * 1000});
            return res.sendStatus(204);
        }
        
        //Delete the refreshToken in dt
        await pool.query(Queries.deleteRefreshTokenQuery, [refreshToken]);

        console.log("User logged out");
        res.clearCookie("jwt", {httpOnly: true, maxAge: 24 * 60 * 60 * 1000}); //secure: true - only servers on https
        return res.sendStatus(204);
    }
    catch (error){
        console.log(error);
        return res.status(500).json({'message': error.message});
    }


}

const deleteUser = async (req, res) => {

    const user_id = req.params.user_id;

    try {
        await pool.query(Queries.deleteUserQuery, [user_id]);

        await pool.query(Queries.deleteSupervisorQuery, [user_id]);
        
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.status(500).json({'message': error.message});
    }
}

const updateUser = async (req, res) => {

    const {user_id, username, password, role, team_id, email} = req.body;

    try {
        const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [user_id]);
        if(!result.rows.length) {
            console.log("User does not exists!");
            return res.status(404).json({'message': 'User does not exists!'});
        }
        else{
            const hashedPassword = await brcrypt.hash(password, 10);
            const response = await pool.query(Queries.updateUserQuery, [user_id, username, hashedPassword, role, email]);

            try {
                await pool.query(Queries.deleteSupervisorQuery, [user_id])
            } catch (error) {
                
            }

            if(role === 1984){ //If the user is a supervisor
                await pool.query(Queries.addSupervisorQuery, [user_id, team_id])
            }
            

            console.log("User created successfully");
            return res.status(201).json({"success": 'New user ${username} created!'});

        }
    }
    catch (error){
        console.log(error);
        res.status(500).json({'message': error.message});
    }
}






const UserController = {
    addUser: addUser,
    login: login,
    hadnleRefreshToken: hadnleRefreshToken,
    handleLogout: handleLogout,
    getUsers: getUsers,
    deleteUser: deleteUser,
    updateUser: updateUser,
}

export default UserController;