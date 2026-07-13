import { Button, DatePicker, Form, Input, InputNumber, message } from "antd";
import { useForm } from "antd/es/form/Form";
import { Assignment } from "../../models/Assignment";
import { useEffect } from "react";
import AssignmentService from "../../services/AssignmentService";
import useAxiosPrivate from "../../utils/useAxiosPrivate";
import dayjs, { Dayjs } from "dayjs";
import { Intern } from "../../models/Intern";
import InternService from "../../services/InternService";
import { NoticeType } from "antd/es/message/interface";
import moment from "moment";

interface PropType {
    assignment?: Assignment,
    setIsDone: React.Dispatch<React.SetStateAction<boolean>>
        intern_id?: number,
}

const AddAssignmentForm: React.FC<PropType> = ({assignment, setIsDone, intern_id}) => {


    const [form] = useForm();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        if(assignment) {
            
            const deadline = dayjs(assignment.deadline! * 1000);

            form.setFieldsValue({
                description: assignment.description,
                deadline: assignment.deadline ? deadline : undefined,
                weight: assignment.weight,
                grade: assignment.grade,
            })
        }
    }, [assignment])

    const onFinish = () => {

        const formValues = form.getFieldsValue();  

        if(assignment) { //Do the update
            const newAssignement: Assignment = {
                assignment_id: assignment.assignment_id,
                intern_id:  assignment.intern_id,
                description: formValues.description,
                deadline: formValues.deadline ? formValues.deadline.unix() : undefined,
                weight: formValues.weight,
                complete: assignment.complete,
            }

            if(assignment.grade) {
                newAssignement.grade =  formValues.grade;
            }
            
            
            updateAssignment(newAssignement);
        }
        else{
            const newAssignemnt: Assignment = {
                intern_id: intern_id!,
                description: formValues.description,
                deadline: formValues.deadline ? formValues.deadline.unix() : undefined,
                weight: formValues.weight,
                complete: false,
            }

            addAssignment(newAssignemnt);
            form.resetFields();
        }
    }

    const addAssignment = async (newAssignment: Assignment) => {
        try {
            await AssignmentService.addAssignment(axiosPrivate, newAssignment);

            giveMessage("success", "Assignment added");
setIsDone(true);
        } catch (error: any) {
            if (!error?.response) {
                giveMessage("error", "No server response");
              }  else {
                giveMessage("error", "Error while adding assignment");
              }
        }
            }

    const updateAssignment = async (newAssignment: Assignment) => {
        try {
            await AssignmentService.updateAssignment(axiosPrivate, newAssignment);

            giveMessage("success", "Assignment updated");
setIsDone(true);
        } catch (error: any) {
            if (!error?.response) {
                giveMessage("error", "No server response");
              }  else {
                giveMessage("error", "Error while updating assignment");
              }
        }
            }

    const giveMessage = (type: NoticeType, mssge: string) => {
        message.open({
          type: type,
          content: mssge,
        });
    };

    return (
        <>
        <Form
            style={{width: 400}}
            onFinish={onFinish}
            labelCol={{span: 6}}
            wrapperCol={{span: 14}}
                        form={form}>

            <Form.Item label="Description" name="description" rules={[{required: true, message: "Describe the assignment!"}]}>
                <Input.TextArea showCount
                    maxLength={250}
                    style={{ height: 200, marginBottom: 10, width: 400}}/>
            </Form.Item>

            <Form.Item label="Deadline" name="deadline">
                <DatePicker showTime format="DD-MM-YYYY HH:mm" />
            </Form.Item>

            <Form.Item label="Coefficient" name="weight" rules={[{required: true, message: "Enter the coefficient"}]}>
                <InputNumber/>
            </Form.Item>

            {assignment?.grade && <Form.Item label="Grade" name="grade" rules={[{type: "integer", min: 0, max: 100, message: "Please enter a valid integer between 0 and 100" },]}>
                <InputNumber />
            </Form.Item>}

<Form.Item wrapperCol={{span: 16}}>
                <Button block type="primary" htmlType="submit">{assignment ? <>Update Assignment</> : <>Add Assignment</>}</Button>
            </Form.Item>
        </Form>
        
        </>
      );
}
 
export default AddAssignmentForm;

