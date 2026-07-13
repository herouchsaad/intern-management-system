import React from 'react';
import "./styles.css";
import HomePage from "./components/HomePage";
import InternsPage from './components/InternsPage';
import AddInternPage from './components/AddInternPage';
import NotFound from './components/Notfound';
import Login from "./components/Login";
import AddPage from './components/AddPage';
import { Route, Routes } from "react-router-dom";
import RequireAuth from './utils/RequireAuth';
import LayoutComponent from './components/LayoutComponent';
import Unauthorized from './components/Unauthorized';
import PersistLogin from './components/PersistLogin';
import Applications from './components/ApplicationsPage';
import ApplyPage from './components/ApplyPage';
import ChangePassword from './components/ChangePassword';
import MyProfile from './components/MyProfile';
import DocumentRequest from './components/DocumentRequest';
import UploadDocument from './components/UploadDocument';


const App: React.FC = () => {
  const ROLES = {
    "Admin": 5150,
    "Supervisor": 1984,
    "Intern": 2001,
  }

  return (
        
        <Routes>

          {/* Public route for login */}
          <Route path="/login" element={<Login />}></Route>

          <Route path="/apply" element={<ApplyPage />} />
          
          
          {/* Protected routes*/}
          
          <Route path='/' element={<PersistLogin />}>
              <Route element={<LayoutComponent />}>
                <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
                  <Route path='' element={ <HomePage />} />
                </Route>

                <Route element={<RequireAuth  allowedRoles={[ROLES.Admin, ROLES.Supervisor]} />}>
                  <Route path="interns" element={ <InternsPage />} />
                </Route>

                <Route element={<RequireAuth  allowedRoles={[ROLES.Admin,ROLES.Supervisor]} />}>
                  <Route path="add-intern" element={ <AddInternPage/>} />
                </Route> 

                <Route element={<RequireAuth  allowedRoles={[ROLES.Admin]} />}>
                  <Route path="add" element={<AddPage />} />
                </Route>

                <Route element={<RequireAuth  allowedRoles={[ROLES.Admin]} />}>
                  <Route path="intern-applications" element={<Applications />} />
                </Route>

                <Route element={<RequireAuth  allowedRoles={[ROLES.Admin, ROLES.Supervisor, ROLES.Intern]} />}>
                  <Route path="change-password" element={<ChangePassword />} />
                </Route>

                <Route element={<RequireAuth  allowedRoles={[ROLES.Admin, ROLES.Supervisor, ROLES.Intern]} />}>
                  <Route path="profile" element={<MyProfile />} />
                </Route>

                <Route element={<RequireAuth  allowedRoles={[ROLES.Admin]} />}>
                  <Route path="document-request" element={<DocumentRequest />} />
                </Route>

                <Route element={<RequireAuth  allowedRoles={[ROLES.Intern]} />}>
                  <Route path="upload-document" element={<UploadDocument />} />
                </Route>


              </Route>
          </Route>
          
            
          {/*All other routes*/}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path='*' element={<NotFound />} />
              
                  </Routes>
  );

  
};

export default App;