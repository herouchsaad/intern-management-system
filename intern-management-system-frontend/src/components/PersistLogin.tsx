import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from "../utils/useRefreshToken";
import useAuth from "../utils/useAuth";
import Loading from "./Loading";


const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const { auth }: any = useAuth();

    useEffect(() => {
        const verifyRefreshToken = async () => {
            try {
                await refresh();
            } catch (error) {
                
            }
            finally{
                setIsLoading(false);
            }
        }

        !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);
    }, [auth?.accessToken, refresh])

    return(
        <>
            {isLoading
                ? <Loading />
                : <Outlet />}
        </>
    )

}

export default PersistLogin; 