import { Button, Divider, Form, Input, message } from "antd";
import { useEffect, useState } from "react";
import DocumentReqeustService from "../services/DocumentRequestService";
import useAxiosPrivate from "../utils/useAxiosPrivate";
import Loading from "./Loading";
import { NoticeType } from "antd/es/message/interface";
import { useForm } from "antd/es/form/Form";
import DocumentRequestTable from "./tables/DocumentRequestTable";

interface DataType  {
    id?: number,
    document_name: string,
}

const DocumentRequest = () => {

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [documents, setDocuments] = useState<DataType []>();
    const [form] = useForm();
    const axiosPrivate = useAxiosPrivate();


    const getData = async () => {

        try {
            const documentsData = await DocumentReqeustService.getDocuments(axiosPrivate);
            setDocuments(documentsData);
        } 
        catch (error: any) {
console.log(error);
            if (!error?.response) {
                giveMessage("error", "No server response");
            }
            else {
                giveMessage("error", "Error while fetchind data");
            }
        }

    }

    useEffect(() => {
        getData();
    },[])

    useEffect(() => {
        if(documents) {
            setIsLoading(false);
        }
    }, [documents])

    const giveMessage = (type: NoticeType, mssge: string) => {
        message.open({
          type: type,
          content: mssge,
        });
    };

    const onFinish = () => {
        const formData = form.getFieldsValue();
        addDocument(formData.document_name);
    }

    const addDocument = async (document_name: string) => {
        try {
            await DocumentReqeustService.addRequest(axiosPrivate, {document_name: document_name})

            giveMessage("success", "Document added");
            getData();
        } 
        catch (error: any) {
console.log(error);
            if (!error?.response) {
                giveMessage("error", "No server response");
            } 
            else if (error?.response.status === 403) {
                giveMessage("error", "Document is already exists");
            } 
            else {
                giveMessage("error", "Error while adding document");
            }
        }
    }

    return (
        <>
        
        {isLoading ? <Loading /> :
        <div>
            <Divider orientation="left">
                <h2 style={{fontWeight: "normal", textAlign: "center", fontSize: "25px"}}>Document Request</h2>
            </Divider>

            <div >
                <Form
                style={{width: 400}}
                onFinish={onFinish}
                labelCol={{span: 10}}
                wrapperCol={{span: 14}}
                form={form}
                >
                    <Form.Item label="Document Name" name="document_name" rules={[{required: true, message: "Document is required!"}]}>
                        <Input />
                    </Form.Item>

                    <Form.Item wrapperCol={{span: 24}}>
                        <Button  htmlType='submit' type='primary' block>Add Document</Button>
                    </Form.Item>
                </Form>
            </div>

            <br />

            <DocumentRequestTable documents={documents!} getData={getData}  />

        </div>}

        </>
              );
}
 
export default DocumentRequest;