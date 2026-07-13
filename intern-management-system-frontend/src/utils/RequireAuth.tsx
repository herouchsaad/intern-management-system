import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "./useAuth";


const ROLES = {
        "Admin": 5150,
        "Supervisor": 1984,
        "Intern": 2001,
}

const allRoles = [ROLES.Admin, ROLES.Supervisor, ROLES.Intern];

const RequireAuth = ({allowedRoles}: any) => {
    const { auth }: any = useAuth();
    const location = useLocation(); 

    return(
        allowedRoles.includes(auth?.role) ? <Outlet />
         : auth?.accessToken
            ? (allRoles.includes(auth?.role) ? <Navigate to = "/unauthorized" state = {{from: location}} replace /> : <Navigate to = "/login" state = {{from: location}} replace />) 
            : <Navigate to = "/login" state = {{from: location}} replace /> 
    )

}

export default RequireAuth;