import { Assignment } from "../utils/Assignment.js";
import pool from "../utils/database.js";
import Queries from "../utils/queries.js";


const addAssignment = async (req, res) => {
    const {intern_id, description, deadline, weight, complete} = req.body;

    console.log(req.body);

    try {
        const response = await pool.query(Queries.addAssignmentQuery, [intern_id, description, deadline, weight, complete]);

        return res.status(200).json(response.rows);
    }
    catch (error){
        console.log(error);
        return res.status(500).json({'message': error.message});
    }
}

const updateAssignment = async (req, res) => {

    const {assignment_id, intern_id, description, deadline, grade, weight, complete} = req.body;

    try {
        console.log(1);
        await pool.query(Queries.updateAssignmenQuery, [assignment_id, intern_id, description, deadline, grade, weight, complete]);

        const results = await pool.query("SELECT weight, grade FROM assignments WHERE intern_id = $1", [intern_id]);
        const assignments = results.rows;

        let sumOfPoints = 0;
        let sumOfWeight = 0;
        for(let i = 0; i < assignments?.length; i++) {
            if(assignments[i].grade) {
                sumOfWeight += assignments[i].weight
                sumOfPoints += assignments[i].grade * assignments[i].weight;
            }
        }
        const overall_success = sumOfPoints === 0 ? 0 : Math.round((sumOfPoints / sumOfWeight));
        console.log("overall", overall_success);

        await pool.query("UPDATE interns SET overall_success = $1 WHERE intern_id = $2", [overall_success, intern_id]);
        
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.status(500).json({'message': error.message});
    }
}


const getAssignmentsForIntern = async (req, res) => {
    try {
        const intern_id = req.params.intern_id

        const results = await pool.query(Queries.getAssignmentsByInternIdQuery, [intern_id]);
        
       
        return res.status(200).json(results.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json({'message': error.message});
    }
}

const deleteAssignment = async (req, res) => {
    try {
        const assignment_id = req.params.assignment_id;

        const results = await pool.query(Queries.deleteAssignmentQuery, [assignment_id]);
        const intern_id = results.rows[0].intern_id;

        const results1 = await pool.query("SELECT weight, grade FROM assignments WHERE intern_id = $1", [intern_id]);
        const assignments = results1.rows;

        let sumOfPoints = 0;
        let sumOfWeight = 0;
        for(let i = 0; i < assignments?.length; i++) {
            if(assignments[i].grade) {
                sumOfWeight += assignments[i].weight
                sumOfPoints += assignments[i].grade * assignments[i].weight;
            }
        }
        const overall_success = sumOfPoints === 0 ? 0 : Math.round((sumOfPoints / sumOfWeight));
        console.log("overall", overall_success);

        await pool.query("UPDATE interns SET overall_success = $1 WHERE intern_id = $2", [overall_success, intern_id]);

        
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.status(500).json({'message': error.message});
    }
}

const markDone = async (req, res) => {

    const assignment_id = req.params.assignment_id;

    try {
        await pool.query("UPDATE assignments SET complete = $1 WHERE assignment_id = $2", [true, assignment_id]);

        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }

}









const AssignmentController = {
    addAssignment: addAssignment,
    updateAssignment: updateAssignment,
    getAssignmentsForIntern: getAssignmentsForIntern,
    deleteAssignment: deleteAssignment,
    markDone: markDone
}

export default AssignmentController;