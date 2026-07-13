import { Button, Form, Input, Select, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../utils/useAxiosPrivate";
import UserService from "../../services/UserService";
import { User } from "../../models/User";
import { NoticeType } from "antd/es/message/interface";
import { Team } from "../../models/Team";

interface PropType {
    teams: Team [];
    userToUpdate?: DataType;
    setIsDone?: React.Dispatch<React.SetStateAction<boolean>>;
        getData: () => void;
}

interface DataType {
email?: string;
    user_id: number;
    username: string;
    role: number;
    team_id?: number;
  }

const AddUserForm: React.FC<PropType> = ({teams, userToUpdate, getData, setIsDone}) => {
    
    const userNameErrorMessage = "Username must start with a letter and be 3 to 23 characters long, containing only letters, digits, underscores, and hyphens.";
    const passwordErrorMessage = "Password must be between 8 and 24 characters in length and contain at least one letter and one digit."
const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/;
    const ID_NO_REGEX = /^\d{11}$/;
    const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,24}$/;

        const [form] = Form.useForm();
    const [username, setUsername] = useState("");

    const axiosPrivate = useAxiosPrivate();
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<number>();

    const onFinish = () => {
        if(userToUpdate){
                        updateUser();
        }else{
            addUser();
        }
                    }

    
    const addUser = async () => {
        try {
            const formData = form.getFieldsValue();

            const newUser: User = {
                username: username,
                password: password,
                role: role,
                team_id: formData.team,
email: formData.email,
            }

           await UserService.addUser(axiosPrivate, newUser);

           form.resetFields();

           giveMessage("success", "User added");
           
        if(setIsDone) {
                setIsDone(true);
            }
                
        } 
        catch (error: any) {
console.log(error);
            if (!error?.response) {
                giveMessage("error", "No server response");
              }
            else if (error.response?.status === 409) {
                giveMessage("error", "User already exists");
              }
            else {
                giveMessage("error", "Error while adding user");
              }
        } finally {
            getData();
                    }
        
    }

    useEffect(() => {
        if(userToUpdate) {
            setRole(userToUpdate.role);
            setUsername(userToUpdate.username);
            form.setFieldsValue({
                username: userToUpdate.username,
                role: userToUpdate.role,
email: userToUpdate.email,
            })
            if(userToUpdate.team_id) {
                form.setFieldsValue({
                    team: userToUpdate.team_id,
                })
            }
        }

    }, [userToUpdate])

    const updateUser = async () => {
        try {
            const formData = form.getFieldsValue();

            const newUser: User = {
                user_id: userToUpdate?.user_id!,
                username: username,
                password: password,
                role: role,
                team_id: formData.team,
email: formData.email,
            }

           await UserService.updateUser(axiosPrivate, newUser);

           form.resetFields();

           giveMessage("success", "User updated");
           
        if(setIsDone){
                setIsDone(true); 
            }
           
        } 
        catch (error: any) {
console.log(error);
            if (!error?.response) {
                giveMessage("error", "No server response");
              }  else {
                giveMessage("error", "Error while updating user");
              }
        } 
        finally {
                getData();
            }
        }
        
        const giveMessage = (type: NoticeType, mssge: string) => {
        message.open({
          type: type,
          content: mssge,
        });
    };

    const handleSelectChange = (value: any) => {
        setRole(value);
    }

    
    return (
        <>
         <div>
                <Form style={{width: 400}}
                onFinish={onFinish}
                form={form}
                labelCol={{span: 10}}
                wrapperCol={{span: 14}}
                autoComplete="off">
                    
                <Form.Item
                label="Username"
                name="username"
                rules={[{ 
                    required: true,
                    message: userNameErrorMessage,
                    pattern: userToUpdate ? ID_NO_REGEX : USERNAME_REGEX },
                ]}
                hasFeedback
                >
                    <Input onChange={(e) => setUsername(e.target.value)} />
                </Form.Item>

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

<Form.Item label="E-mail" name="email" rules={[
			{ type: 'email', message: 'Please enter a valid email address', required: true },
			]} hasFeedback >
				<Input />
			</Form.Item>

                <Form.Item label="Role" name="role" rules={[{required: true, message: "Role is required!"}]}>
                    <Select onChange={handleSelectChange}>
                        <Select.Option value={2001}>Intern</Select.Option>
                        <Select.Option value={1984}>Supervisor</Select.Option>
                        <Select.Option value={5150}>Admin</Select.Option>
                    </Select>
                </Form.Item>

                {role === 1984  && <Form.Item  label="Responsible For" name="team" rules={[{required: true, message: "Team is required!"}]}>
                    <Select>
                        {teams.map(team => {
                            return (
                                <Select.Option value={team.team_id}>{team.team_name}</Select.Option>
                            )
                        })}
                    </Select>
                </Form.Item>}

                <Form.Item wrapperCol={{span: 24}}>
                    <Button block type="primary" htmlType="submit">{userToUpdate ? <>Update User</> : <>Add User</>}</Button>
                </Form.Item>
                

                </Form>

            </div>
        </>
      );
}
 
export default AddUserForm;