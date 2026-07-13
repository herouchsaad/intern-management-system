import dayjs from "dayjs";
import { Intern } from "../models/Intern.js";
import pool from "./database.js";
import Queries from "./queries.js";
import cron from "node-cron";
import shcedule from "node-schedule";
import { emptyGarbegeFolder } from "./garbage.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '..', "uploads");



export const handleSchedule = async () => {
    try {
        const internsResponse = await pool.query(Queries.getInternsQuery);
        const interns = internsResponse.rows;
  
        //Delete the intern in 7 days after the internship ends
        interns.map(intern => {

            var interval;
            if(dayjs(intern.internship_ending_date * 1000).isBefore(dayjs())){ //Delete it if it is already passed
                interval = dayjs().add(15, "second").toDate();
            }else{
                interval = dayjs(intern.internship_ending_date * 1000).add(7, "day").toDate();
            }
             
            const username = (intern.id_no);
            const job = shcedule.scheduleJob(username, interval, async () => {
                await deleteIntern(intern);
            })
        })


      emptyGarbegeFolder();
      //Empty the garbade folder every midnight
      cron.schedule('0 0 * * *', () => {
        emptyGarbegeFolder();
      });

      console.log("Schedule completed");
    } catch (error) {
        console.log("Error happened while scheduling", error);    
    }
  }
  
  
  const deleteIntern = async (intern: Intern) => {

    if(!intern){
        return;
    }
    try {
        await pool.query(Queries.deleteInternQuery, [intern.intern_id]); //Delete intern
        await pool.query("DELETE FROM users WHERE username = $1", [intern.id_no]); //Delete user
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