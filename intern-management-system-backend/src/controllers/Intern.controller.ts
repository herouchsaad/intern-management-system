import path, { dirname } from "path";
import pool from "../utils/database.js";
import Queries from "../utils/queries.js";
import { fileURLToPath } from "url";
import fs from "fs";
import { Intern } from "../models/Intern.js";
import schedule from "node-schedule";
import dayjs from "dayjs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '..', "uploads");


const getInterns = async (req, res) =>{

    try {
        if(req.role === 5150) {
            const response = await pool.query(Queries.getInternsQuery)
            return res.status(200).json(response.rows);
        }
        else {

            const response = await pool.query("SELECT team_id FROM supervisors WHERE user_id = $1", [req.user_id]);
            const team_idObject = response.rows[0];

            if(team_idObject) {

                const internsResponse = await pool.query("SELECT * FROM interns WHERE team_id = $1", [team_idObject.team_id]);

                return res.status(200).json(internsResponse.rows);
            }

            return res.status(200).json([]);
  
            
        }

    

    
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }

    
}

const getInternByUsername = async (req, res) =>{
    const username = req.params.username;
    console.log(username);
    
    try {
        const internResponse = await pool.query(Queries.getInternByUsernameQuery, [username]);
        const intern = internResponse.rows[0];

        if(!intern) {
            return res.sendStatus(404);
        }

        return res.status(200).json(intern);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
    
    
}

const addIntern = (req, res) => {
    const {first_name, last_name, id_no, phone_number, email, uni, major, grade, gpa, team_id, birthday, internship_starting_date, internship_ending_date, cv_url, photo_url, overall_success} = req.body;

    //Check if e mail exits
    pool.query(Queries.checkEmailExists, [email], (err, results) => {
        if(err){
            console.log("Could not check email exitst or not!");
            return res.end();
        }
        else{
            if(results.rows.length) {
                console.log("Intern with given email is already exists");
                return res.sendStatus(409);
            }
            else{
                //Add the intern to the database
                pool.query(Queries.addInternQuery, [first_name, last_name, id_no, phone_number, email, uni, major, grade, gpa, team_id, birthday, internship_starting_date, internship_ending_date, cv_url, photo_url, overall_success], (err, results) =>{
                    if(err){
                        console.log("Error happened while adding intern");
                        console.log(err);
                        return res.end();
                    }
                    else{
                        console.log("Intern Created Successfully");
                         return res.status(201).json(results.rows[0]);
                    }
                });
            }
        }

    });

    if(cv_url !== null){ //If the intern is added, then move the file from garbage
        const fileName = cv_url.split("/").pop()

        const sourceFilePath = path.join(__dirname, "../uploads/garbage", fileName);
        const destination = path.join(__dirname, "../uploads/cv", fileName);
        
        fs.rename(sourceFilePath, destination, (error) => {
            if(error){
                console.log("Error while moving CV from garbage");
            }
        });

    }

    if(photo_url !== null){ //If the intern is added, then move the file from garbage
        const fileName = photo_url.split("/").pop()

        const sourceFilePath = path.join(__dirname, "../uploads/garbage", fileName);
        const destination = path.join(__dirname, "../uploads/photos", fileName);
        
        fs.rename(sourceFilePath, destination, (error) => {
            if(error){
                console.log("Error while moving photo from garbage");
            }
        });
    }



    

}


const deleteIntern = async (req, res) => {
    const id = req.params.id;

    try {
        const result = await pool.query(Queries.deleteInternQuery, [id]);
        const intern: Intern = result.rows[0];

        await pool.query(Queries.deleteAttendancesQuery, [id]);
        await pool.query(Queries.deleteAssignmentsQuery, [id]);
        await pool.query("DELETE FROM users WHERE username = $1", [intern.id_no]);
        const document_urlsResponse = await pool.query("DELETE FROM documents WHERE intern_id = $1 RETURNING document_url", [intern.intern_id]);
        const document_urls = document_urlsResponse.rows;

        document_urls.map(document_urlObject => {
            console.log(document_urlObject?.document_url?.split("/").pop());
            deleteFile(document_urlObject?.document_url?.split("/").pop(), "documents");
        })



        //Delete the schedule
        schedule.cancelJob(intern.id_no);
        
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
    

}

const updateIntern = (req, res) => {
    const id = req.params.id;
    const { first_name, last_name, id_no, phone_number, email, uni, major, grade, gpa, team_id, birthday, internship_starting_date, internship_ending_date, cv_url, photo_url, overall_success} = req.body;

    pool.query(Queries.getInternByIdQuery, [id], (err, results) => {
        if(err) {
            console.log("Error happened while finding intern by id");
            res.end();
        }
        else{
            const noStudentFound = !results.rows.length;
            if(noStudentFound) {
                console.log("Intern Does Not Exist In the Database");
                res.send("Intern Does Not Exist In the Database");
            }
            else{
                pool.query(Queries.updateInternQuery, [id, first_name, last_name, id_no, phone_number, email, uni, major, grade, gpa, team_id, birthday, internship_starting_date, internship_ending_date, cv_url, photo_url, overall_success], (err, results) => {
                    if(err) {
                        console.log("Error happened while updating intern by id");
                        console.log(err);
                        res.end();
                    }
                    else{
                        console.log("Intern Updated Successfully");
                        res.status(200).send("Intern Updated Successfully");
                    }
                })
            }
        }

        

        const intern: Intern = {
            first_name: first_name,
            last_name: last_name,
            id_no: id_no,
            phone_number: phone_number,
            email: email,
            uni: uni,
            major: major,
            grade: grade,
            gpa: gpa,
            team_id: team_id,
            birthday: birthday,
            internship_starting_date: internship_starting_date,
            internship_ending_date: internship_ending_date,
            cv_url: cv_url,
            photo_url: photo_url,
            overall_success: overall_success
        };

        //Delete the schedule
        schedule.cancelJob(id_no);

        //Add schedule back with updated values
        const interval = dayjs(internship_ending_date * 1000).add(7, "day").toDate();
        const job = schedule.scheduleJob(id_no,interval, async () => {
            deleteInternManually(intern);
        })
        


    });


    if(cv_url !== null){ //If the intern is added, then move the file from garbage

        const fileName = cv_url.split("/").pop()

        const sourceFilePath = path.join(__dirname, "../uploads/garbage", fileName);
        const destination = path.join(__dirname, "../uploads/cv", fileName);
        
        fs.rename(sourceFilePath, destination, (error) => {
            if(error){
                console.log("Error while moving CV from garbage");
            }
        });

    }

    if(photo_url !== null){ //If the intern is added, then move the file from garbage
        const fileName = photo_url.split("/").pop()

        const sourceFilePath = path.join(__dirname, "../uploads/garbage", fileName);
        const destination = path.join(__dirname, "../uploads/photos", fileName);
        
        fs.rename(sourceFilePath, destination, (error) => {
            if(error){
                console.log("Error while moving photo from garbage");
            }
        });
    }


}

const deleteInternManually = async (intern: Intern) => {

    if(!intern){
        return;
    }
    try {
        
        await pool.query(Queries.deleteInternQuery, [intern.intern_id]);  //Delete Intern
        await pool.query("DELETE FROM users WHERE username = $1", [intern.id_no]); //Delete User
        await pool.query(Queries.deleteAssignmentsQuery, [intern.intern_id]); //Delete Assignments
        await pool.query(Queries.deleteAttendancesQuery, [intern.intern_id]); //Delete Attendance
        const document_urlsResponse = await pool.query("DELETE FROM documents WHERE intern_id = $1 RETURNING document_url", [intern.intern_id]);
        const document_urls = document_urlsResponse.rows;

        document_urls.map(document_urlObject => {
            console.log(document_urlObject?.document_url?.split("/").pop());
            deleteFile(document_urlObject?.document_url?.split("/").pop(), "documents");
        })


        console.log(intern.id_no + " is deleted");
        
    } catch (error) {
        console.log("Error happened while deleting scheduled intern");
    }
  }

  const getDocuments = async (req, res) => {
    const intern_id = req.params.intern_id;

    try {
        const documentsResponse = await pool.query(Queries.getDocumentsQuery, [intern_id]);
        const documents = documentsResponse.rows;

        return res.status(200).json(documents);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
  }

  const deleteFile = (fileName: string, type: "cv" | "photos" | "documents") => {

    if(!fileName) {
        return;
    }

    const filePath = path.join(uploadDir,`${type}/`, fileName);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if(err) {
            console.log("document not found");
            return;
        }
        else{
            fs.unlink(filePath, (err) => {
                if (err) {
                  console.error("Error deleting document");
                }
            });
        }
    });
  }



const InternController = {
    getInterns: getInterns,
    getInternByUsername: getInternByUsername,
    addIntern: addIntern,
    deleteIntern: deleteIntern,
    updateIntern: updateIntern,
    getDocuments: getDocuments,
}

export default InternController;

