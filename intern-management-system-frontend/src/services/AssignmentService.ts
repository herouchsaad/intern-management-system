import { Assignment } from "../models/Assignment";
const controller = new AbortController();

const addAssignment = async (axiosInstance: any, newAssignment: Assignment) => {
    try {
        await axiosInstance.post("/api/assignments", newAssignment)
    } 
    catch (error) {
        throw error;
    }
}

const getAssignmentsForIntern = async (axiosInstance: any, intern_id: number): Promise<Assignment []> => {
    try {
        const response = await axiosInstance.get(`/api/assignments/${intern_id}`);
    
      const assignments: Assignment [] = response.data;
      
        const assignmentsData: Assignment[] = assignments.map((assignment: any) => ({
          ...assignment,
          deadline: Number(assignment.deadline),
        }));
      
      return assignmentsData;
    } 
    catch (error: any) {
        throw error;
    }
}


const updateAssignment = async (axiosInstance: any, assignment: Assignment) => {
    try {
      await axiosInstance.put(`/api/assignments`, assignment);
  
    } 
    catch (error: any) {
        throw error;
    }
}

const deleteAssignment = async (axiosInstance: any, assignment_id: number) => {
  try {
    await axiosInstance.delete(`/api/assignments/${assignment_id}`)
      }
    catch (error) {
      throw error;
  }
}

const markDone = async (axiosInstance: any, assignment_id: number) => {
  try {
    await axiosInstance.post(`/api/assignments/${assignment_id}/done`)
      }
    catch (error) {
      throw error;
  }
}



const AssignmentService = {
    addAssignment: addAssignment,
    getAssignmentsForIntern: getAssignmentsForIntern,
    updateAssignment: updateAssignment,
    deleteAssignment: deleteAssignment,
    markDone: markDone,
}

export default AssignmentService;