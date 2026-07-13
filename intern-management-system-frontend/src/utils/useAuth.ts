import { useContext, useState } from "react";
import AuthContext from "../utils/AuthProvider";

const useAuth = () => {
    return useContext(AuthContext);
}

export default useAuth;