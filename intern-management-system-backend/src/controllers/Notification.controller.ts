import path, { dirname } from "path";
import pool from "../utils/database.js";
import Queries from "../utils/queries.js";
import { fileURLToPath } from "url";
import fs from "fs";
import { Notification } from "../models/Notification.js";
import dayjs from "dayjs";
import { Intern } from "../models/Intern.js";
import { time } from "console";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import cron from "node-cron";
import { Assignment } from "../utils/Assignment.js";


const getNotifications = async (req, res) => {

    
    if(!req.role || !req.params.user_id){
        return res.end();
    }
    
    try {
        const notifications = await generateNotifications(req.role, parseInt(req.params.user_id), req.user);

        if(notifications) {
            return res.status(200).json(notifications);
        }
        return res.status(200).json([])

    } catch (error) {
        return res.sendStatus(500);
    }

}


const generateNotifications = async (role: number, user_id: number, username: string) => {

    try {

        const notificationsResponse = await pool.query(Queries.getNotificationsQuery,[user_id]);
        var oldNotifications: Notification [] = notificationsResponse.rows;
        const newNotifications: Notification [] = [];
            
        if(role === 5150) {

            const applicationsResponse = await pool.query(Queries.getApplicationsQuery);
            const internsResponse = await pool.query(Queries.getInternsQuery);

            const applications = applicationsResponse.rows;
            const interns = internsResponse.rows;


            const numberOfWaitingApplications = applications?.filter((application: Intern) => application.application_status === "waiting").length;
            if(numberOfWaitingApplications) {
                const content = `You have ${numberOfWaitingApplications} waiting application(s)`;
                const newNotification: Notification = {
                    user_id: user_id,
                    type_code: 3, //waiting application
                    content: content,
                    notification_date: dayjs().unix(),
                    is_seen: false,
                }
                newNotifications.push(newNotification);
            }

            const endingInternships = interns?.filter(intern =>
                intern.internship_ending_date - dayjs().unix() < 60 * 60 * 24 * 6 //if the internship is going to end in 6 days
            );

        
            if(endingInternships) {
                endingInternships.map(endingInternship => {
                    const name = endingInternship.first_name + " " + endingInternship.last_name;

                    const content = `${name}'s internship will end on `
                    const timestamp = endingInternship.internship_ending_date;

                    const newNotification: Notification = {
                        user_id: user_id,
                        type_code: 2, //ending internship
                        intern_id: endingInternship.intern_id,
                        content: content,
                        timestamp: timestamp,
                        notification_date: dayjs().unix(),
                        is_seen: false,
                    }
                    newNotifications.push(newNotification);
                })
            }

            if(numberOfWaitingApplications === 0) { //Delete the old waiting application notification not to confuse the user
                const garbage = oldNotifications.find(oldNotification => oldNotification.type_code === 3);

                if(garbage) {
                    oldNotifications = oldNotifications.filter(oldNotification => oldNotification.notification_id !== garbage.notification_id);
                    await pool.query("DELETE FROM notifications WHERE user_id = $1 AND type_code = 3", [user_id]);
                }
            }



        } else if (role === 1984) {

            const team_idResponse = await pool.query("SELECT * FROM supervisors WHERE user_id = $1", [user_id]);
            const team_id = team_idResponse?.rows[0]?.team_id;

            if(team_id) {
                const internsResponse = await pool.query("SELECT * FROM interns WHERE team_id = $1", [team_id]);
                const interns = internsResponse.rows;

                const endingInternships = interns?.filter(intern =>
                    intern.internship_ending_date - dayjs().unix() < 60 * 60 * 24 * 6 //if the internship is going to end in 6 days
                );
    
            
                if(endingInternships) {
                    endingInternships.map(endingInternship => {
                        const name = endingInternship.first_name + " " + endingInternship.last_name;
    
                        const content = `${name}'s internship will end on `
                        const timestamp = endingInternship.internship_ending_date;
    
                        const newNotification: Notification = {
                            user_id: user_id,
                            type_code: 2, //ending internship
                            intern_id: endingInternship.intern_id,
                            content: content,
                            timestamp: timestamp,
                            notification_date: dayjs().unix(),
                            is_seen: false,
                        }
                        newNotifications.push(newNotification);
                    })
                }


                const startingInternships = interns?.filter(intern =>
                    intern.internship_starting_date - dayjs().unix() > 60 * 60 * 24 * 6 //if the internship is going to end in 6 days
                );
    
            
                if(startingInternships) {
                    startingInternships.map(startingInternship => {
                        const name = startingInternship.first_name + " " + startingInternship.last_name;
    
                        const content = `${name}'s internship will start on `
                        const timestamp = startingInternship.internship_starting_date;
    
                        const newNotification: Notification = {
                            user_id: user_id,
                            type_code: 2, //ending internship
                            intern_id: startingInternship.intern_id,
                            content: content,
                            timestamp: timestamp,
                            notification_date: dayjs().unix(),
                            is_seen: false,
                        }
                        newNotifications.push(newNotification);
                    }) 

                    
                    
                }
            }



        } else if (role === 2001) {

            const internResponse = await pool.query("SELECT * FROM interns WHERE id_no = $1", [username]);
            const intern: Intern = internResponse.rows[0];

            const assignmentsResponse = await pool.query(Queries.getAssignmentsByInternIdQuery, [intern.intern_id]);
            const assignments: Assignment [] = assignmentsResponse.rows;

            if(assignments.length !== 0) {
                const numberOfWaitingAssignments = assignments.filter(assignment => !assignment.complete).length;

                if(numberOfWaitingAssignments !== 0) {
                    const content = `You have ${numberOfWaitingAssignments} waiting assignment(s)`;

                    const newNotification: Notification = {
                        user_id: user_id,
                        type_code: 4, //waiting assignments
                        intern_id: intern.intern_id,
                        content: content,
                        notification_date: dayjs().unix(),
                        is_seen: false,
                    }
                    newNotifications.push(newNotification);
                }
                
            } else {
                await pool.query("DELETE FROM notifications WHERE user_id $1 AND type_code = $2", [user_id, 4]);
            }

        }


        await Promise.all(newNotifications.map(async notification => {

            const duplicate = oldNotifications?.filter(oldNotification => oldNotification.user_id == notification.user_id && oldNotification.type_code == notification.type_code && oldNotification.intern_id == notification.intern_id);


            if(duplicate.length === 0) {
                await pool.query(Queries.addNotificationsQuery, [notification.user_id, notification.type_code, notification.intern_id, notification.notification_date, notification.content, notification.timestamp, false])
                oldNotifications.push(notification);
            } else { //update the notification if there is a difference>

                
                const notificationToUpdate = oldNotifications.find(oldNotification => (oldNotification.user_id === notification.user_id && oldNotification.type_code === notification.type_code 
                    && oldNotification?.intern_id == notification?.intern_id && oldNotification.content !== notification.content));
                

                if(notificationToUpdate) {

                    try {
                        await pool.query(Queries.updateNotificationQuery, [notification.user_id, notification.type_code, notification.intern_id, notification.notification_date, notification.content, notification.timestamp, false, notificationToUpdate.notification_id])

                    } catch (error) {
                        console.log(error);
                    }

                    notificationToUpdate.user_id = notification.user_id;
                    notificationToUpdate.type_code = notification.type_code;
                    notificationToUpdate.intern_id = notification.intern_id;
                    notificationToUpdate.content = notification.content;
                    notificationToUpdate.notification_date = notification.notification_date;
                    notificationToUpdate.timestamp = notification.timestamp;
                    notificationToUpdate.is_seen = false;
                }
            }

        }));


        oldNotifications = oldNotifications.filter(oldNotification => oldNotification.is_seen === false || oldNotification.notification_date > dayjs().subtract(7, "day").unix())

        const sortedNotifications = oldNotifications.sort(sortByUnseenFirst);

        return sortedNotifications;


    } catch (error) {
        console.log(error);
    }

    

    
}

function sortByUnseenFirst(a: Notification, b: Notification) {
    // Sort unseen notifications first
    if (!a.is_seen && b.is_seen) {
      return -1;
    } else if (a.is_seen && !b.is_seen) {
      return 1;
    }
    // Sort by notification_date if both are seen or both are unseen
    return dayjs(b.notification_date).diff(a.notification_date);
  }


const handleSeen = async (req, res) => {

    const user_id = req.params.user_id;

    try {
        await pool.query(Queries.handleSeenquery, [user_id]);

        return res.sendStatus(200);
    } catch (error) {
        return res.sendStatus(500);
    }
}




const NotificationController = {
 getNotifications: getNotifications,
 handleSeen: handleSeen,
}

export default NotificationController;

