import { Alert, Divider, Upload, UploadFile, message } from "antd";
import Loading from "./Loading";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../utils/useAxiosPrivate";
import DocumentReqeustService from "../services/DocumentRequestService";
import { NoticeType } from "antd/es/message/interface";
import { PlusOutlined } from '@ant-design/icons';
import UploadService from "../services/UploadService";
import useAuth from "../utils/useAuth";
import InternService from "../services/InternService";
import { Document } from "../models/Document";

interface DataType  {
    id?: number,
    document_name: string,
}


const UploadDocument = () => {

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [requiredDocuments, setRequiredDocuments] = useState<DataType []>();
    const [documents, setDocuments] = useState<Document []>();
    const { auth }: any = useAuth();
    const axiosPrivate = useAxiosPrivate();
    
    const getData = async () => {

        try {
            const requiredDocumentsData = await DocumentReqeustService.getDocuments(axiosPrivate);
            setRequiredDocuments(requiredDocumentsData);

            const documentsData = await InternService.getDocuments(axiosPrivate, auth.intern_id);
            setDocuments(documentsData);


        } 
        catch (error: any) {
console.log(error);
            if (!error?.response) {
                giveMessage("error", "No server response");
            }  else {
                giveMessage("error", "Error while fetchind data");
            }
        }

    }

    useEffect(() => {
        getData();
    },[])

    useEffect(() => {
        if(requiredDocuments) {
            setIsLoading(false);
        }
    }, [requiredDocuments])

    const giveMessage = (type: NoticeType, mssge: string) => {
        message.open({
          type: type,
          content: mssge,
        });
    };

    const handleUploadDocument = async (options: any, index: number) => {
        try {
            await UploadService.uploadDocument(axiosPrivate, options, auth.intern_id, requiredDocuments![index].document_name);
            
            getData();
            giveMessage("success", "Document uploaded");
          } 
        catch (error: any) {
console.log(error);
              if (!error?.response) {
                giveMessage("error", "No server response");
              } 
            else {
                giveMessage("error", "Error while uploading document");
              }
          }
    }


    const handleRemoveDocument = async (document_name: string) => {
        try {
            
            const documentName =  documents?.find(document => document.document_name === document_name)?.document_url.split("/").pop()!

            if(!documentName) {
                return;
            }

            await UploadService.deleteDocument(axiosPrivate, documentName);
            getData();
            giveMessage("success", "Document deleted");
            
          }
        catch (error:any) {
console.log(error);
              if (!error?.response) {
                giveMessage("error", "No server response");
              }  else {
                giveMessage("error", "Error while canceling upload");
              }
          }
        
    }

    const getFileList = (document_name: string) => {
        const document = documents?.find(document => document.document_name === document_name);
        const list: UploadFile [] = [];

        if(document) {
            const urlWithAccess = addAccessToken(document?.document_url);
            

            const newItem: UploadFile = {
                uid: "1",
                name: document_name,
                status: "done",
                url: urlWithAccess,
            }

            list.push(newItem);
        }

        return list.length === 0 ? undefined : list;
    }

    const addAccessToken = (url: string) => {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}access_token=${auth.accessToken}`;
    }


    return ( 
        <>
        
        {isLoading ? <Loading /> :
        <div>
            <Divider orientation="left">
                <h2 style={{fontWeight: "normal", textAlign: "center", fontSize: "25px"}}>Upload Document</h2>
            </Divider>

            <Alert message="Only upload pdf and docx files." type="info" style={{width: "400px"}} showIcon/> <br />

            <div>
                {requiredDocuments?.map((document, index) => {
                    return(
                        <Upload fileList={getFileList(document.document_name)} customRequest={(options) => handleUploadDocument(options, index)} listType="picture-card"  accept='.pdf,.docx'maxCount={1} onRemove={() => handleRemoveDocument(document.document_name)}>
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>{document.document_name}</div>
                            </div>
                        </Upload>
                    )
                })}

            </div>
        
        </div>}

        </>
     );
}
 
export default UploadDocument;