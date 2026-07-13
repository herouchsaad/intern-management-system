import { Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "./axios";
import useAuth from "./useAuth";
import { NoticeType } from "antd/es/message/interface";
import { message } from "antd";
 
const useRefreshToken = () => {
    const { auth, setAuth }: any = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const refresh = async () => {
        try {
            const response = await axios.get("/refresh", {
                withCredentials: true,
            });

            setAuth(
                {
                    user_id: response.data.user_id,
                    username: response.data.username,
                    accessToken:response.data.accessToken,
                    role: response.data.role,
                    team_id: response.data.team_id,
                    intern_id: response.data.intern_id,
                 })
            return response.data.accessToken; 
        } catch (error) {

            setAuth(null);

            if (location.pathname !== "/login") {
                await navigate("/login", { state: { from: location }, replace: true });
                giveMessage("error", "Session expired, please login");
            }
            
            throw new Error("Refresh token expired");
        }
        
    }

    const giveMessage = (type: NoticeType, mssge: string) => {
        message.open({
          type: type,
          content: mssge,
        });
      };

    return refresh;

}


export default useRefreshToken;
