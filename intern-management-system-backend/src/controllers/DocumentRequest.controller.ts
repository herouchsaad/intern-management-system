import { fileURLToPath } from "url";
import pool from "../utils/database.js";
import path from "path";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '..', "uploads");


const addRequest = async (req, res) => {

    const { document_name } = req.body;

    try {

        const checkResponse = await pool.query("SELECT * FROM document_requests WHERE document_name = $1", [document_name]);
        if(checkResponse.rows.length !== 0) {
            return res.sendStatus(403); //Forbidden
        } 

        await pool.query("INSERT INTO document_requests (document_name) VALUES ($1)", [document_name]);

        return res.sendStatus(200);
        
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

const deleteRequest = async (req, res) => {

    const id = req.params.id;

    try {
        const document_nameResponse = await pool.query("DELETE FROM document_requests WHERE id = $1 RETURNING document_name", [id]);
        const document_name = document_nameResponse.rows[0]?.document_name;
       
        const document_urlsResponse = await pool.query("DELETE FROM documents WHERE document_name = $1 RETURNING document_url ", [document_name]);
        const document_urls = document_urlsResponse.rows;

        document_urls.map(document_urlObject => {
            deleteFile(document_urlObject?.document_url?.split("/")?.pop(), "documents");
        })

        return res.sendStatus(200);
        
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

const getRequests = async (req, res) => {


    try {
        const requestsResponse = await pool.query("SELECT * FROM document_requests");
        const requests = requestsResponse.rows;

        return res.status(200).json(requests);
        
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


const DocumentRequestController = {
    addRequest: addRequest,
    deleteRequest: deleteRequest,
    getRequests: getRequests,
}

export default DocumentRequestController;