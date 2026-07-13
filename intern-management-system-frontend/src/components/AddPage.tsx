import { Divider, Form, Space, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "../services/UserService";
import useAxiosPrivate from "../utils/useAxiosPrivate";
import { NoticeType } from "antd/es/message/interface";
import { Team } from "../models/Team";
import TeamService from "../services/TeamService";
import Loading from "./Loading";
import UserTable from "./tables/UserTable";
import TeamTable from "./tables/TeamTable";
import AddTeamForm from "./forms/AddTeamForm";
import AddUserForm from "./forms/AddUserForm";


interface DataType {
    user_id: number;
    username: string;
email: string;
    role: number;
    team_id: number;
  }


const AddPage = () => {

    
        const [isModalOpen, setIsModalOpen] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const [isLoading, setIsLoading] = useState(true);
    const [teams, setTeams] = useState<Team []>([]);
    const [users, setUsers] = useState<DataType []>([]);
    const [isDone, setIsDone] = useState(false);
    
    // GET ALL DATA FROM DATABASE
    const getData = async () => {
        try {
            const teamData = await TeamService.getTeams(axiosPrivate);
            setTeams(teamData);

            const userData = await UserService.getUsers(axiosPrivate);
            setUsers(userData);
        } catch (error: any) {
console.log(error);
            if (!error?.response) {
                giveMessage("error", "No server response");
              } 
            else {
                giveMessage("error", "Error while fetchind data");
              }
        }
            };
    
    useEffect(() => {
        if(isLoading){
            getData();
        }
    }, [isLoading]);
    

    useEffect(() => {
      if(teams && users) {
                setIsLoading(false);
      }
    }, [teams, users])

    const giveMessage = (type: NoticeType, mssge: string) => {
        message.open({
          type: type,
          content: mssge,
        });
    };

    useEffect(()=> {
        if(isDone) {
             setIsModalOpen(false);
                          getData();
                          setIsDone(false);
                     }
     }, [isDone])


    return (
        <>
        {isLoading ? <Loading /> : <>
        
        <Divider orientation="left">
                <h2 style={{fontWeight: "normal", textAlign: "center", fontSize: "25px"}}>Add User</h2>
        </Divider>

        {/*Add User*/}
        <Space align="start">
           
            <AddUserForm teams={teams} getData={getData}/>
                    
            <div style={{marginLeft: 100}}>
                <UserTable users={users} teams={teams} getData={getData} />
            </div>
        </Space>

  

        {/*Add Team*/}
        <Divider orientation="left">
                <h2 style={{fontWeight: "normal", textAlign: "center", fontSize: "25px"}}>Add Team</h2>
        </Divider>


        <Space align="start">
            <AddTeamForm getData={getData}/>
          
            <div style={{marginLeft: "100px"}}>
                <TeamTable teams={teams} getData={getData}/>
            </div>
        </Space>

        </>}

        <br /><br />
        </>
    )

}

export default AddPage;