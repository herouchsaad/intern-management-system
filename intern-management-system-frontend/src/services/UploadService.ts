
const uploadPhoto = async (axiosInstance: any, options: any): Promise<string> => {

    const { file, onSuccess, onError } = options; 

    try {
      const formData = new FormData();
      formData.append("file", file);
  
      const response = await axiosInstance.post("/uploads/photos", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      
        onSuccess();
          
        const photo_url = response.data.photo_url;
  
        return photo_url;
      
    } 
    catch (error) {
                onError(new Error('Upload failed'));
        throw error;
    }
  }

  
const uploadCv = async (axiosInstance: any, options: any): Promise<string> => {

    const { file, onSuccess, onError } = options; 

    try {
      const formData = new FormData();
      formData.append("file", file);
  
      const response = await axiosInstance.post("/uploads/cv", formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      
        onSuccess();
                const cv_url = response.data.cv_url;
                return cv_url;
      } 
    catch (error) {
                onError(new Error('Upload failed'));
        throw error;
    }
  }

const uploadDocument = async (axiosInstance: any, options: any, intern_id: string, document_name: string) => {

  const { file, onSuccess, onError } = options; 
  const document_info = {
    intern_id: intern_id,
    document_name: document_name
  }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_info", JSON.stringify(document_info))
  
      const response = await axiosInstance.post(`/uploads/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      
        onSuccess();
        
        return response.data.document_url;
      
    } 
    catch (error) {
        onError(new Error('Upload failed'));
              throw error;
    }
  
}


const deleteDocument = async (axiosInstance: any, fileName: string) => {
  try {
    await axiosInstance.delete(`/uploads/documents/${fileName}`);
}
    catch (error) {
    throw error;
  }
}


const deleteCv = async (axiosInstance: any, uid: string, from: "garbage" | "cv") => {
  try {
    await axiosInstance.delete(`/uploads/${from}/${uid}`, {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
}
    catch (error) {
    throw error;
  }
}


const deletePhoto = async (axiosInstance: any, uid: string, from: "garbage" | "photos") => {
  try {
    await axiosInstance.delete(`/uploads/${from}/${uid}`, {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });

    }
    catch (error) {
        throw error;
  }
}


  const UploadService = {
    uploadPhoto: uploadPhoto,
    uploadCv: uploadCv,
    deleteCv: deleteCv,
    deletePhoto: deletePhoto,
    uploadDocument: uploadDocument,
    deleteDocument: deleteDocument,
  }


  export default UploadService;