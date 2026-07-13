
const getNotifications = async (axiosInstance: any, user_id: number) => {

    try {
        const response = await axiosInstance.get(`/api/notifications/${user_id}`);

        return response.data
    } 
    catch (error) {
        throw error;
    }
}

const handleSeen = async (axiosInstance: any, user_id: number) => {
    try {
        await axiosInstance.post(`/api/notifications/seen/${user_id}`);
    } 
    catch (error) {
        throw error;
    }
}


const NotificationService = {
    getNotifications: getNotifications,
    handleSeen: handleSeen,
}

export default NotificationService