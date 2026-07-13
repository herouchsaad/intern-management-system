# Intern Mangement System

Intern Management System is an React web application to manage internships in a company. It is used by HR, supervisors and interns. It makes internship manament easy for all three roles which can be efficient for both companies and interns.

**Used Tecnologies** 

-React.js with TypeScript (created by create-react-app)\
-Node.js\
-PostgreSQL\
-Nginx

You can watch the demo on YouTube: https://www.youtube.com/watch?v=2LeFBxvI2jw

## How to run?

Before running this project, go to https://github.com/ItsYusufDemir/intern-management-system-backend first, and run the backend. After that, follow these instructions;

1. Clone the repository
2. Run **npm install** to install all libraries
3. Create a .env file in the source directory and add these:\
   REACT_APP_API_KEY=AIzaSyChuSGkJ96STFxFGYKwEJhRLb5b1w820n4\
   REACT_APP_PROXY=http://localhost:5000
4. Run the project by **npm run start**
5. You can now access to the project from http://localhost:3000

## About the Project

The project has three roles as I mentioned above. Each role has its own panels and features in the system.

### Admin

Admin handles internship applications and can see the progress of interns. In the home page, there is team part which shows current teams and its details like number of interns and supervisor. Below that there is a calendar part which shows special days like internship starting or endding dates and holidays.

![home teams](https://github.com/ItsYusufDemir/intern-management-system-frontend/assets/104091838/a05086b2-f85a-4ba5-99f8-34f0333f2522)

Admin can see all the interns in the interns page. Interns are seperated by their teams. Admin can see the intern's information like university, department, email etc. Adminc can also see intern's CV or other uploaded documents. Ther is a assignments panel which shows the current and completed assignments which are given by her/his supervisor. There is also a attendance calendar which shows the atteandance of the intern.

![interns page](https://github.com/ItsYusufDemir/intern-management-system-frontend/assets/104091838/033cc34d-01b2-4b2e-8322-faf25e579b65)


Inten candidates can apply for internship in apply page. They enter their personal and educational data and upload their CV and photo to make the application. Admin can see those application in the applications page with a notification. She/he can see the profile of the candidate and can accept or reject the application. If the application is accepted, intern recieves an email about the succesfull application and login details.

![applications page](https://github.com/ItsYusufDemir/intern-management-system-frontend/assets/104091838/69745540-3f2d-44b9-b482-422a74440944)

Admin can add user or team to the company in the add page. There is also a intern adding page which adds manually just in case. Interns might be requested some documents and those document are customized in the document request page by the admin. Each role can change their passwords in change password page.

![add page](https://github.com/ItsYusufDemir/intern-management-system-frontend/assets/104091838/9b10eb86-cc70-4bf0-87c5-dd8843db4ada)


### Supervisor
Supervisor can see interns that in her/his team. Supervisor can give new assignments, or can grade them, and they can take attendance.

![new assignment](https://github.com/ItsYusufDemir/intern-management-system-frontend/assets/104091838/5a466e60-b9ca-4ddf-8be3-56d379da3719)


### Intern

Intern can see their own profile, given assignments and attendance. Intern can also upload requested documents from HR.

![document request](https://github.com/ItsYusufDemir/intern-management-system-frontend/assets/104091838/2ae57f79-0b32-4e66-a308-c5d1714b0722)













