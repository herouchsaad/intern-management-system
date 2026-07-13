import { Header } from "antd/es/layout/layout";
import InternAddingForm from "./forms/InternAddingForm";
import { useEffect, useState } from "react";
import Loading from "./Loading";
import TeamService from "../services/TeamService";
import useAxiosPrivate from "../utils/useAxiosPrivate";
import { Team } from "../models/Team";
import { Result } from "antd";

const ApplyPage = () => {

    const [teams, setTeams] = useState<Team []>();
    const [isLoading, setIsLoading] = useState(true);
    const [isDone, setIsDone] = useState<boolean>(false);
    const axiosPrivate = useAxiosPrivate();

     // GET ALL DATA FROM DATABASE
     const getData = async () => {
        const teamData = await TeamService.getTeams(axiosPrivate);
        setTeams(teamData);
    };
    
    useEffect(() => {
        if(isLoading){
            getData();
        }
    }, [isLoading]);

    useEffect(() => {
        if(teams) {
          setIsLoading(false);
        }
      }, [teams])

    if(isLoading) {
        return <Loading /> 
    }

    return (
        <>

        <div className="page" >

        <Header style={{marginBottom: "50px",alignItems: "center", display: "flex", justifyContent: "center", height: "100px", borderRadius: "10px"}}>
            <h1 style={{color: "white"}}>Apply Internship</h1>
        </Header>

        

        {!isDone &&
        <div style={{ margin: "auto", boxShadow: "rgba(0,0,0,0.25) 0 25px 50px -12px" ,background: "white", width: "900px", borderRadius: "10px"}}>     
                        <InternAddingForm setIsDone={setIsDone} teams={teams!} apply={true}/>
        </div>
}

        </div>

        {isDone &&
        <div>
            <Result
            status="success"
            title="You have successfully applied!"
            subTitle="We will inform you by email, do not forget to check your spam folder!"
            />
        </div>}
        
        </>
      );
}
 
export default ApplyPage;