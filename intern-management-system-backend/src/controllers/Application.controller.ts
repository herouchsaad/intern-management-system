import path from "path";
import pool from "../utils/database.js";
import Queries from "../utils/queries.js";
import crypto from "crypto";
import brcrypt from "bcrypt";
import nodemailer from "nodemailer";
import fs from "fs";
import { fileURLToPath } from "url";
import { User } from "../models/User.js";
import { Intern } from "../models/Intern.js";
import UserController from "./User.controller.js";
import UploadController from "./Upload.controller.js";
import dayjs from "dayjs";
import InternController from "./Intern.controller.js";
import shcedule from "node-schedule";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '..', "uploads");

const acceptMessage = "We'd like to tell you that your internship has been accepted! You can login from http://localhost:3000/login to your new account. We recommend you to change your password and then you can upload the required files. We wish success during this period :)\n"


const addApplication = async (req, res) => {
    const {first_name, last_name, id_no, phone_number, email, uni, major, grade, gpa, team_id, birthday, internship_starting_date, internship_ending_date, cv_url, photo_url, overall_success} = req.body;

    const date = Math.round(new Date().valueOf() / 1000);

    try {

        const check = await pool.query(Queries.checkEmailExists, [email]);

        if(check.rows.length !== 0){
            return res.sendStatus(409); //Conflict
        }

        const check2 = await pool.query("SELECT * FROM applications WHERE email = $1", [email]);

        if(check2.rows.length !== 0){
            return res.sendStatus(409); //Conflict
        }

        await pool.query(Queries.addApplicationQuery, ["waiting", date, first_name, last_name, id_no, phone_number, email, uni, major, grade, gpa, team_id, birthday, internship_starting_date, internship_ending_date, cv_url, photo_url, overall_success]);



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

        
        return res.sendStatus(200);
    }
    catch (error){
        console.log(error);
        return res.status(500).json({'message': error.message});
    }


    
}

const getApplications = async (req, res) => {

    try {
        const response = await pool.query(Queries.getApplicationsQuery);

        return res.status(200).json(response.rows);
    }
    catch (error){
        console.log(error);
        return res.status(500).json({'message': error.message});
    }
}

const emptyArchieve = async (req, res) => {

    try {

        const id_numbersResponse = await pool.query("SELECT id_no FROM interns");
        const id_numbers = id_numbersResponse.rows.map(row => row.id_no);

        const applicationsResponse = await pool.query(Queries.getApplicationsQuery);
        const applications: Intern [] = applicationsResponse.rows;

        const applicationsToDelete: Intern [] = applications.filter(application => {
            return !id_numbers.includes(application.id_no) && application.application_status !== "waiting";
        });

        for(const applicationToDelete of applicationsToDelete) {
            await pool.query(Queries.deleteApplicationQuery, [applicationToDelete.application_id]);

            const cvName = applicationToDelete.cv_url?.split("/").pop();
            const photoName = applicationToDelete.photo_url?.split("/").pop();

            deleteFile(cvName, "cv");
            deleteFile(photoName, "photos");
        }


        return res.sendStatus(200);
    }
    catch (error){
        console.log(error);
        return res.status(500).json({'message': error.message});
    }
}

const rejectApplication = async (req, res) => {
    const application_id = req.params.applications_id;

    try {
        const response = await pool.query(Queries.rejectApplicationQuery, [application_id]);
        const email = response.rows[0].email;

        
        const response2 = await pool.query("DELETE FROM interns WHERE email = $1 RETURNING *", [email]);
        const intern = response2.rows[0];
 
        if(intern) {
            await pool.query("DELETE FROM users WHERE username = $1", [intern.id_no]);
        }
        
   
        return res.sendStatus(200);
    }
    catch (error){
        console.log(error);
        return res.status(500).json({'message': error.message});
    }
}

const acceptApplication = async (req, res) => {
    const application_id = req.params.applications_id

    try {
        
        const results = await pool.query(Queries.acceptApplicationQuery, [application_id]);
        await pool.query(Queries.updateApplicationStatusQuery, [application_id]);

        const intern: Intern = results.rows[0];
        const randomPassword = generateRandomPassword(8);
        const hashedPassword = await brcrypt.hash(randomPassword, 10);

        //Add a new user
        const newUser: User = {
            username: intern.id_no,
            password: randomPassword,
            role: 2001,
        };

        
        await pool.query(Queries.addUserQuery, [newUser.username, hashedPassword, newUser.role, intern.email]);
        await sendPasswordEmail(intern.email, newUser.username, randomPassword);

       
        const interval = dayjs(intern.internship_ending_date * 1000).add(7, "day").toDate();     
        const job = shcedule.scheduleJob(newUser.username,interval, async () => {
            await deleteIntern(intern);
        })

        
        return res.sendStatus(200);
    }
    catch (error){
        console.log(error);
        return res.status(500).json({'message': error.message});
    }
}



function generateRandomPassword(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const password = Array.from(crypto.randomFillSync(new Uint8Array(length)))
      .map((byte) => characters[byte % characters.length])
      .join('');
  
    return password;
}


async function sendPasswordEmail(internEmail, username,  password) {
    // Create a Nodemailer transporter using SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'internmanagementsystem@gmail.com',
        pass: 'apybtnqgppcesdvg',
      },
    });
  
    // Send email
    const mailOptions = {
      from: 'internmanagementsystem@gmail.com',
      to: internEmail,
      subject: 'Congratulations: Your Internship has been Accepted ',
      text: `${acceptMessage}\n Your username is: ${username}\n Your new password is: ${password}`,
    };
  
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent to: ', internEmail);
    } catch (error) {
      console.error('Error sending email: ', error);
    }
  }

  const deleteFile = (fileName: string, type: "cv" | "photos" | "documents") => {

    if(!fileName) {
        return;
    }

    const filePath = path.join(uploadDir,`${type}/`, fileName);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if(err) {
            console.log("cv not found");
            return;
        }
        else{
            fs.unlink(filePath, (err) => {
                if (err) {
                  console.error("Error deleting CV");
                }
            });
        }
    });
  }

  const deleteIntern = async (intern: Intern) => {

    if(!intern){
        return;
    }
    try {
        await pool.query(Queries.deleteInternQuery, [intern.intern_id]); //Delete intern
        await pool.query("DELETE FROM users WHERE username = $1", [intern.id_no]); //Delete user
        await pool.query(Queries.deleteAssignmentsQuery, [intern.intern_id]); //Delete Assignments
        await pool.query(Queries.deleteAttendancesQuery, [intern.intern_id]); //Delete Attendacne
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

  const deleteApplication = async (req, res) => {

    const application_id = req.params.application_id;
    
    try {

        const applicationResponse = await pool.query("SELECT * FROM applications WHERE application_id = $1", [application_id]);
        const application: Intern = applicationResponse.rows[0];

        if(!application) {
            return res.sendStatus(404); //Application not found
        }

        const internResponse = await pool.query("SELECT * FROM interns WHERE id_no = $1", [application.id_no]);
        const intern: Intern = internResponse.rows[0];

        if(intern) {
            return res.sendStatus(403); //Forbidden
        }

        await pool.query(Queries.deleteApplicationQuery, [application_id]);

        const cvName = application?.cv_url?.split("/").pop();
        const photoName = application?.photo_url?.split("/").pop();

        deleteFile(cvName, "cv");
        deleteFile(photoName, "photos");

        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
  }



const ApplicationController = {
    addApplication: addApplication,
    emptyArchieve: emptyArchieve,
    getApplications: getApplications,
    rejectApplication: rejectApplication,
    acceptApplication: acceptApplication,
    deleteApplication: deleteApplication,
}

export default ApplicationController;