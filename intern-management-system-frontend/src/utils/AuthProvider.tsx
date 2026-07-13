import React, { createContext, useState, ReactNode } from "react";

const AuthContext = createContext({});

interface AuthProviderType {
    children: React.ReactElement;
}
export const AuthProvider:React.FC<AuthProviderType> = ({children}) => {
    
    const [auth, setAuth] = useState({});

    return(
        <AuthContext.Provider value = {{auth, setAuth}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;
