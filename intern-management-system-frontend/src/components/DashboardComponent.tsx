import {Team} from "../models/Team";
import {Intern} from "../models/Intern";
import { Progress } from "antd";
import SizeContext from "antd/es/config-provider/SizeContext";


const DashboardComponent = (props: {team: Team, interns: Intern[]}) => {

    const team = props.team;
    const interns = props.interns;

    return (

        <>
        {/*
        <div style={{ width: "500px", height: "400px", margin: "10px", display: "inline-block",
            borderRadius: "10px", boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', marginRight: "50px"}}>
            <h2 style={{textAlign: "center"}}>{team.team_name}</h2>

            <div style={{marginLeft: "190px", width: "50%", padding: 0}}>
                <Progress type="circle" percent={team} strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} size={120} format={(percent) => `${percent}% Success`}></Progress>
            </div>
            <br /><br />
            <div className="info">
                <h1 style={{color: "GrayText"}}>{"Number of Interns: " + interns.length}</h1>
            </div>

        </div>
    */}
        
        
        </>
      );
}
 
export default DashboardComponent;