import axios from '../utils/axios';
import { User } from "../models/User";

const addUser = async (axiosInstance: any, user: User) => {
    try {
        await axiosInstance.post('/api/users', user);
    }
    catch (error: any) {
        throw error;
      }

}

const updateUser = async (axiosInstance: any, user: User) => {
  try {
      await axiosInstance.put('/api/users', user);
    } 
    catch (error: any) {
      throw error;
    }

}

const getUsers = async (axiosInstance: any) => {
  try {
      const response = await axiosInstance.get('/api/users');
      
      return response.data;
    }
    catch (error: any) {
      throw error;
    }

}


const login = async (axiosInstance: any, user: User) => {

    try {
        const response = await axiosInstance.post('/auth', user);
    
        return response.data;
      }
    catch (error: any) {
        throw error;
      }

}

const logout = async () => {
  try {
      await axios.get('/logout', {
        headers: {'Content-Type': 'application/json'},
        withCredentials: true,
      });
    }
    catch (error: any) {
      throw error;
    }
}

const deleteUser = async (axiosInstance: any, user_id: number) => {
  try {
    await axiosInstance.delete(`/api/users/${user_id}`);
    return;
  }
    catch (error: any) {
    throw error;
  }
}


const UserService = {
    addUser: addUser,
    login: login,
    logout: logout,
    getUsers: getUsers,
    deleteUser: deleteUser,
    updateUser: updateUser,
}
export default UserService;