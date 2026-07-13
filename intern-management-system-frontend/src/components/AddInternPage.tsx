import InternAddingForm from "./forms/InternAddingForm";
import { Team } from "../models/Team";
import { useEffect, useState } from "react";
import TeamService from "../services/TeamService";
import useAxiosPrivate from "../utils/useAxiosPrivate";
import Loading from "./Loading";

const AddInternPage = () => {

    const [teams, setTeams] = useState<Team []>();
    const axiosPrivate = useAxiosPrivate();
    const [isLoading, setIsLoading] = useState<boolean>(true);

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

    
    return ( 
        <>
        {isLoading ? <Loading /> : <InternAddingForm   teams={teams!}/>}
        </>
     );
}
 
export default AddInternPage;