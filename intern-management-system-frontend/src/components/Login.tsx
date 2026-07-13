import React, { useContext, useEffect, useState } from 'react';
import { Button, Checkbox, Form, Input, message } from 'antd';
import useAuth from '../utils/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthContext from "../utils/AuthProvider";
import UserService from '../services/UserService';
import { User } from '../models/User';
import useAxiosPrivate from '../utils/useAxiosPrivate';
import { NoticeType } from 'antd/es/message/interface';

function Login() {

    const { auth, setAuth }:any = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
        const [form] = Form.useForm();
    const axiosPrivate = useAxiosPrivate();
    const [shouldNavigate, setShouldNavigate] = useState<boolean>();
  
    const onFinish = () => {
        login();    
    }

    const login = async () => {
        const formValues = form.getFieldsValue();

        const user: User = {
            username:formValues.username,
            password: formValues.password,
        }

        try {
            const response = await UserService.login(axiosPrivate, user);

            if(response.accessToken !== undefined) {
                const user_id = response.user_id;
                const role = response.role;
                const accessToken = response.accessToken;
                const username = user.username;
                const team_id = response.team_id;
                const intern_id = response.intern_id;
    
                setShouldNavigate(true);
                setAuth({user_id, username, role, team_id, accessToken, intern_id});
                giveMessage("success", "Login successfull");
                
                form.resetFields();
                            }
        } catch (error:any ) {
console.log(error);
            if (!error?.response) {
                giveMessage("error", "No server response");
              } else if (error.response?.status === 401) {
                giveMessage("error", "Invalid Username or Password!");
              } else {
                giveMessage("error", "Login failed!");
              }
        }
    }

    const giveMessage = (type: NoticeType, mssge: string) => {
        message.open({
          type: type,
          content: mssge,
        });
      };

    useEffect(() => {
        if(auth && shouldNavigate) {

            var from: string;
            if(location.state?.from?.pathname) {
                from = location.state?.from?.pathname;
            }
            else if(auth?.role === 1984) {
                from = "/interns"
            }
            else if (auth?.role === 2001) {
                from = "/profile"
            }
            else {
                from = "/"
            }

            navigate(from, {replace: true});
            setShouldNavigate(false);
        }
    },[auth])


    return(
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',}}>

            <div style={{boxShadow: "rgba(0,0,0,0.25) 0 25px 50px -12px", background: "white", padding: "10px", paddingTop: "50px" , borderRadius: "10px" }}>
                <Form
                    name="login"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    style={{ maxWidth: 600 }}
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    autoComplete="off"
                    form={form}
                >
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: 'Please enter your username!' }]}
                        >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please enter your password!' }]}
                        >
                        <Input.Password />
                    </Form.Item>

                    

                    <Form.Item wrapperCol={{ offset: 5, span: 16 }}>
                        <Button type="primary" htmlType="submit" block>
                            Login
                        </Button>
                    </Form.Item>

                </Form>
             </div>

        </div>
    )
}

export default Login;