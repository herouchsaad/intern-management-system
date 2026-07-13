//Delete the garbages when the server restarts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const emptyGarbegeFolder = () => {
    const garbageFolderPath = path.join(__dirname, "../uploads/garbage");

    fs.readdir(garbageFolderPath, (err, files) => {
        if(err) {
            console.log("Error while reading garbage folder:", err);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(garbageFolderPath, file);
            fs.unlink(filePath, (err) => {
                if(err){
                    console.log("Error while deleting file: ", filePath, err);
                }
            })
        })
        console.log("Garbage folder has been emptied");
        return;
    })


}
