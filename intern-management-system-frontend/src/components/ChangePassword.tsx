import { Button, Form, Input, Divider, message } from "antd";
import useAuth from "../utils/useAuth";
import { useState } from "react";
import { User } from "../models/User";
import UserService from "../services/UserService";
import useAxiosPrivate from "../utils/useAxiosPrivate";
import { NoticeType } from "antd/es/message/interface";

const ChangePassword = () => {

    const { auth }: any = useAuth();
    const [password, setPassword] = useState<string>();
    const [form] = Form.useForm();
    const passwordErrorMessage = "Password must be between 8 and 24 characters in length and contain at least one letter and one digit."
    const axiosPrivate = useAxiosPrivate();
    const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,24}$/;


    const onFinish = () => {
        updatePassword();
    }

    const updatePassword = async () => {
        try {
            const newUser: User = {
                user_id: auth.user_id,
                username: auth.username,
                password: password!,
                role: auth.role,
                team_id: auth.team_id,
            }

           await UserService.updateUser(axiosPrivate, newUser);

           form.resetFields();

           giveMessage("success", "Password changed");
           
        } catch (error: any) {
            if (!error?.response) {
                giveMessage("error", "No server response");
              }  else {
                giveMessage("error", "Error while changing password");
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

        <Divider orientation="left">
            <h2 style={{fontWeight: "normal", textAlign: "center", fontSize: "25px"}}>Change Password</h2>
        </Divider>

        <div>
                <Form style={{width: 400}}
                onFinish={onFinish}
                form={form}
                labelCol={{span: 10}}
                wrapperCol={{span: 14}}
                autoComplete="off"
                >

                <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true,
                    message: passwordErrorMessage,
                    pattern: PASSWORD_REGEX }]}
                    hasFeedback
                >
                    <Input.Password onChange={(e) => setPassword(e.target.value)}/>
                </Form.Item>

                <Form.Item
                label="Confirm Password"
                name="confirm"
                rules={[{ required: true,
                    message: "Confirm password!"
                    },
                    ({getFieldValue}) => ({
                        validator(_, value) {
                            if(!value || getFieldValue("password") === value){
                                return Promise.resolve()
                            }
                            return Promise.reject("Password does not match!");
                        }
                    }) 
                ]}
                hasFeedback
                >
                    <Input.Password />
                </Form.Item>


                <Form.Item wrapperCol={{span: 24}}>
                    <Button block type="primary" htmlType="submit">Change Password</Button>
                </Form.Item>
                

                </Form>
            </div>
        </>
     );
}
 
export default ChangePassword;