import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import internsRoute from "./routes/InternsRouter.js";
import teamsRoute from "./routes/TeamsRouter.js";
import uploadRouter from "./routes/UploadRouter.js";
import userRouter from "./routes/UserRouter.js";
import loginRouter from "./routes/LoginRouter.js";
import AssignmentRouter from "./routes/AssignmentRouter.js";
import logout from "./routes/logout.js";
import apply from "./routes/Apply.js";
import fileUpload from "express-fileupload";
import chalk from 'chalk';
import verifyJWT from "./middleware/verifyJWT.js";
import cookieParser from "cookie-parser";
import verifyRole from "./middleware/verifyRole.js";
import ROLES_LIST from "../roles_list.js";
import ApplicationRouter from "./routes/ApplicationRouter.js";
import compression from "compression";
import AttendanceRouter from "./routes/AttendanceRouter.js";
import NotificationRouter from "./routes/NotificationRouter.js";
import { handleSchedule } from "./utils/Schedule.js";
import DocumentRequestRouter from "./routes/DocumentRequestRouter.js";

const app = express();

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.raw({ limit: '50mb', type: 'application/octet-stream' }));
app.use(fileUpload());

const corsOptions = {
  origin: [
    'http://localhost:3000',  // Dev React local
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost',       // Frontend Docker (port 80)
    'http://localhost:80',
    "http://85.31.236.188",   // Serveur de production
  ],
  credentials: true, // Allow sending cookies and other credentials
};


app.use(cookieParser()); //middleware for cookies

app.use(cors(corsOptions));

app.use(express.json());




//Print coming requests to the console
app.use(morgan(function (tokens, req, res){
  return [
    "\n\n\n--------------------------New Request---------------------------\n",
    chalk.hex('#1946BD').bold(tokens.method(req, res)),
    chalk.hex("#3A5FE9")(tokens.url(req, res)),
    chalk.hex("#2ed573").bold(tokens.status(req, res)),
    chalk.white(tokens['response-time'](req, res) + ' ms'),
    chalk.hex('#f78fb3').bold(' ' + tokens.date(req, res)),
  ].join(" ");
}));


app.use(bodyParser.json()); //converts body to json


handleSchedule(); //Create necessesary schedules to handle them in specific time


const server = http.createServer(app);
server.listen(5000, ()=>{
  console.log("Server running on port 5000");
})





/************************PUBLIC ROUTES************************** */

app.use("/auth", loginRouter); //Login
app.use("/refresh", loginRouter); //Refresh access token
app.use("/logout", logout); //Logout
app.use("/api/applications", apply); //Apply for internship

// Health check pour Docker
app.get("/health", (req, res) => res.sendStatus(200));


/******************************SEMI PRIVATE ROUTES**************************/

//Teams router
app.use("/api/teams", teamsRoute);

// Route publique pour le logo (accessible sans authentification)
// ⚠️ Doit être AVANT uploadRouter qui exige verifyJWT
app.get("/uploads/photos/issd_logo.png", (req, res) => {
  const logoPath = path.resolve(__dirname, "uploads", "photos", "issd_logo.png");
  res.sendFile(logoPath);
});

//Uploads
app.use("/uploads", uploadRouter);


/*****************************VERIFICATON**************************************/

//Verify before accessing private routes
app.use(verifyJWT);

/******************************PRIVATE ROUTES***********************************/


//Interns Router
app.use("/api/interns", internsRoute);

//Assignment Router
app.use("/api/assignments", AssignmentRouter);

//Register: post /user
app.use("/api/users", verifyRole(ROLES_LIST.Admin), userRouter);

//Application Router
app.use("/api/applications", verifyRole(ROLES_LIST.Admin), ApplicationRouter);

//Attendance Router
app.use("/api/attendances", AttendanceRouter);

//Notifications Router
app.use("/api/notifications", NotificationRouter)

//Document Requests Router
app.use("/api/document-requests", DocumentRequestRouter)

//Invalid Router
app.use((req, res) => {
  res.json({ message: "Opps! Invalid" });
})
