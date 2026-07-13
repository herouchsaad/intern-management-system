const getDocuments = async (axiosInstance: any) => {
    try {
        const response = await axiosInstance.get("/api/document-requests")

        return response.data
    } catch (error) {
        throw error;
    }
}

const addRequest = async (axiosInstance: any, newRequest: any) => {
    try {
        await axiosInstance.post("/api/document-requests", newRequest)

    } catch (error) {
        throw error;
    }
}


const deleteRequest = async (axiosInstance: any, id: number) => {
    try {
        await axiosInstance.delete(`/api/document-requests/${id}`)

    } catch (error) {
        throw error;
    }
}

const DocumentReqeustService = {
    getDocuments: getDocuments,
    addRequest: addRequest,
    deleteRequest: deleteRequest,
}

export default DocumentReqeustService;