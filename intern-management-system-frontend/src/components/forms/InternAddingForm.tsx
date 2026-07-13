import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
    DatePicker,
    Form,
  Input,
  InputNumber,
    Select,
    Steps,
    Upload,
  UploadFile,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import {Intern} from "../../models/Intern";
import { Team } from '../../models/Team';
import dayjs, { Dayjs } from 'dayjs';
import InternService from '../../services/InternService';
import UploadService from "../../services/UploadService";
import useAxiosPrivate from '../../utils/useAxiosPrivate';
import { NoticeType } from 'antd/es/message/interface';
import useAuth from '../../utils/useAuth';
import ApplicationService from '../../services/ApplicationsService';


const { RangePicker } = DatePicker;

interface PropType {
  intern?: Intern,
  teams: Team[],
    setIsDone?: React.Dispatch<React.SetStateAction<boolean>>,
  apply?: boolean,
}

const InternAddingForm: React.FC<PropType> = ({intern, teams, setIsDone, apply}) => {

  const [form] = Form.useForm();
    const axiosPrivate = useAxiosPrivate();
  const [photoList, setPhotoList] = useState<UploadFile []>([]);
  const [cvList, setCvList] = useState<UploadFile []>([]);
  const { auth }: any = useAuth();
    const [cv_url, setCv_url] = useState<string | null>();
  const [photo_url, setPhoto_url] = useState<string | null>();
  const [currentStep, setCurrentStep] = useState(0);

  const onFinish = (formValues: any) => {

    const start = formValues.internshipDate[0].startOf("day");
    const end = formValues.internshipDate[1].startOf("day");

        const newIntern: Intern = {
      intern_id: intern ? intern.intern_id : undefined,
      first_name: formValues.first_name,
      last_name: formValues.last_name,
      id_no: formValues.id_no,
      phone_number: formValues.phone_number,
      email: formValues.email,
      uni: formValues.uni,
      major: formValues.major,
      grade: formValues.grade,
      gpa: formValues.gpa,
      team_id: formValues.team_id,
      birthday: formValues.birthday ? formValues.birthday.unix() : undefined,
      internship_starting_date: start.unix(),
      internship_ending_date: end.unix(),
      cv_url: cv_url ? cv_url : (intern ? intern.cv_url : null),
      photo_url: photo_url ? photo_url : (intern ? intern.photo_url : null),
      overall_success: intern ? intern.overall_success : null,
    }

    if(intern){
      updateIntern(newIntern);
    }
    else{
      if(apply) {
        applyIntern(newIntern);
      }
      else{
        addIntern(newIntern);
      }
    }
  
  };


  const addIntern = async (newIntern: Intern) => {
    try {
      await InternService.addIntern(axiosPrivate, newIntern);
      
      giveMessage("success", "Intern added");
      form.resetFields();
    
			if(intern) {
				setIsDone!(true); 
			}
		}
		catch (error: any) {
console.log(error);
      if (!error?.response) {
        giveMessage("error","No server response");
      } else if (error.response?.status === 409) {
        giveMessage("error", "Intern with given email is already exists");
      } else {
        giveMessage("error", "Error happened while adding intern");
      } 
        }

  }

  const applyIntern = async (newIntern: Intern) => {
    try {
      await ApplicationService.addApplication(newIntern);
      
      form.resetFields();
      setIsDone!(true);
    }
		catch (error: any) {
console.log(error);
      if (!error?.response) {
        giveMessage("error","No server response");
      } else if (error.response?.status === 409) {
        giveMessage("error", "An application with this email already exists!");
      } else {
        giveMessage("error", "Error happened while applying");
      } 
    }

  }



  const updateIntern = async (newIntern: Intern) => {
    try {
      await InternService.updateIntern(axiosPrivate, newIntern);

      giveMessage("success", "Intern updated");
    
			if(intern) {
				setIsDone!(true); 
			}
		}
		catch (error: any) {
console.log(error);
        if (!error?.response) {
          giveMessage("error","No server response");
        } else {
          giveMessage("error", "Error happened while adding intern");
        }
        }

  }


  const addAccessToken = (url: string) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}access_token=${auth.accessToken}`;
}

  

  useEffect(() => {

    if (intern) {

      const birthday = dayjs(intern.birthday! * 1000);
      const internshipStartDate = dayjs(intern.internship_starting_date * 1000);
      const internshipEndDate = dayjs(intern.internship_ending_date * 1000);

      if(intern.photo_url) {
        const urlWithAccess = addAccessToken(intern.photo_url);
        setPhotoList([
          {
            uid: "-5",
            name: "photo",
            status: "done",
            url: urlWithAccess,
          },
        ])
      }

      if(intern.cv_url) {
        const urlWithAccess = addAccessToken(intern.cv_url);
        setCvList([
          {
            uid: "-5",
            name: "cv",
            status: "done",
            url: urlWithAccess,
          },
        ])
      }

      form.setFieldsValue({
        first_name: intern.first_name,
        last_name: intern.last_name,
        id_no: intern.id_no,
        email: intern.email,
        phone_number: intern.phone_number,
        uni: intern.uni ? intern.uni : undefined,
        major: intern.major ? intern.major : undefined,
        grade: intern.grade ? (intern.grade + "") : undefined,
        gpa: intern.gpa ? intern.gpa : undefined,
        team_id: intern.team_id,
        birthday: intern.birthday ? birthday : undefined,
        internshipDate: [internshipStartDate, internshipEndDate],
      });
           
    } 
  }, [intern]);

 

  const handlePhotoUpload = async (options: any) => {
    try {
      const url = await UploadService.uploadPhoto(axiosPrivate, options);
      setPhoto_url(url);
    }
		catch (error:any) {
console.log(error)
      if (!error?.response) {
        giveMessage("error", "No server response");
      }  else {
        giveMessage("error", "Error while uploading photo");
      }
    }
    
  }

  const handleCvUpload = async (options: any) => {
    try {
      const url = await UploadService.uploadCv(axiosPrivate, options);
      setCv_url(url);
    }
		catch (error: any) {
console.log(error);
        if (!error?.response) {
          giveMessage("error", "No server response");
        } 
			else {
          giveMessage("error", "Error while fetchind data");
        }
    }
    
  }

  const handleCancelCvUpload = async () => {
    try {
      if(intern) { //If we are in edit mode
        await UploadService.deleteCv(axiosPrivate, intern.cv_url!.split("/").pop()!, "cv");
        setCvList([]);
        intern.cv_url = null;
        await InternService.updateIntern(axiosPrivate, intern);
      }
      else{
        await UploadService.deleteCv(axiosPrivate, cv_url!.split("/").pop()!, "garbage");
      }
    }
		catch (error:any ) {
console.log(error);
        if (!error?.response) {
          giveMessage("error", "No server response");
        } 
			else {
          giveMessage("error", "Error while canceling upload");
        }
    }
    
      
  }

  const handleCancelPhotoUpload = async () => {
    try {
      if(intern) { //If we are in edit mode
        UploadService.deletePhoto(axiosPrivate, intern.photo_url!.split("/").pop()!, "photos");
        setPhotoList([]);
        intern.photo_url = null;
        await InternService.updateIntern(axiosPrivate, intern);
      }
      else{
        UploadService.deletePhoto(axiosPrivate, photo_url!.split("/").pop()!, "garbage");
      }
    } catch (error:any) {
        if (!error?.response) {
          giveMessage("error", "No server response");
        }  
			else {
          giveMessage("error", "Error while canceling upload");
        }
    }
      }

  const giveMessage = (type: NoticeType, mssge: string) => {
    message.open({
      type: type,
      content: mssge,
    });
  };

  


  const handleNext = async () => {
      try {
        await form.validateFields();
        setCurrentStep(currentStep + 1);
      } catch (error) {
        giveMessage("warning", "Enter all required fields before proceeding");
      }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  }

  const submitForm = async () => {
    try {
      await form.validateFields();

      const formData = form.getFieldsValue(true);
      onFinish(formData);
    } catch (error) {
      console.log(error);
      giveMessage("error", "Fill the required parts of the form");
    }
  }


  const formSections = [
    {
      title: "Personal Information",
      fields: (
        <>

        <Form.Item label="Name" name="first_name" rules={[{ required: true, message: "Name is required" }]} hasFeedback>
          <Input required/>
        </Form.Item>
        
        <Form.Item label="Last Name" name="last_name" rules={[{ required: true, message: "Last name is required" }]} hasFeedback>
          <Input required/>
        </Form.Item>
        
			<Form.Item label="Personal ID" name="id_no" rules={[{ required: true, message: "Personal ID should ne 11 digits", len: 11}]} hasFeedback >
          <Input />
        </Form.Item>

        <Form.Item label="E-mail" name="email" rules={[
          { type: 'email', message: 'Please enter a valid email address', required: true },
        ]} hasFeedback >
          <Input />
        </Form.Item>
        
			<Form.Item label="Tel" name="phone_number" rules={[{ required: true, message: "Tel is required" }]} hasFeedback >
          <Input />
        </Form.Item>
        
        <Form.Item label="Birthday" name="birthday" rules={[{ required: true, message: "Birthday is required" }]} hasFeedback>
          <DatePicker format="DD-MM-YYYY" />
        </Form.Item>

        </>
      )
    },
    {
      title: "Education",
      fields: (
        <>
        
			<Form.Item label="University" name="uni"  rules={[{ required: true, message: "University is required" }]} hasFeedback>
          <Input />
        </Form.Item>
        
			<Form.Item label="Major" name="major"  rules={[{ required: true, message: "Major is required" }]} hasFeedback>
          <Input/>
        </Form.Item>

        <Form.Item label="Grade" name="grade"  rules={[{ required: true, message: "Grade is required" }]}>
            <Select>
                <Select.Option value="1">1. Grade</Select.Option>
                <Select.Option value="2">2. Grade</Select.Option>
                <Select.Option value="3">3. Grade</Select.Option>
                <Select.Option value="4">4. Grade</Select.Option>
            </Select>
        </Form.Item>
        
			<Form.Item label="GPA" name="gpa"  rules={[{type: "number", required: true, message: "GPA must be between 0 and 4", min: 0, max: 4}]} hasFeedback>
          <InputNumber/>
        </Form.Item>

        <Form.Item label="Team" name="team_id"  rules={[{ required: true, message: "Team is required" }]}>
            <Select>
                {teams.map(team => {
                  return(
                    <Select.Option value={team.team_id}>{team.team_name}</Select.Option>
                  )
                })}
            </Select>
        </Form.Item>
                
        <Form.Item label="Internship Date" name="internshipDate"  rules={[{ required: true, message: "Internship date is required" }]}>
          <RangePicker disabledDate={(value: Dayjs) => {
              if(intern) {
                if(value.isAfter(dayjs())){
                  return false;
                }

                if(value.isBefore(dayjs(intern.internship_starting_date * 1000))) {
                  return true;
                }
                return false;
              }
              if(value.isBefore(dayjs())) {
                return true;
              }
              return false;
          }} 
          format="DD-MM-YYYY"/>
        </Form.Item>

        </>
      )
    },
    {
      title: "Uploads",
      fields: (
        <>

        <div style={{marginLeft: "100px"}}>
        <Form.Item  >
          <Upload customRequest={handleCvUpload} fileList={intern?.cv_url ? cvList : undefined}  listType="picture-card" accept='.pdf,.docx,doc'maxCount={1} onRemove={handleCancelCvUpload}>
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload CV</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item >
          <Upload customRequest={handlePhotoUpload} fileList={intern?.photo_url ? photoList : undefined} listType="picture-card"  accept='.jpg,.png'maxCount={1} onRemove={handleCancelPhotoUpload}>
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload Photo</div>
            </div>
          </Upload>
        </Form.Item>
        </div>

        </>
      )
    }
  ]

  
  return (
    <>

      <div style={{height: "500px"}}>

      <br /><br />  

      <Steps
        current={currentStep}
        items={[
          {
                title: 'Personal Information',
          },
          {
                title: 'Education',
          },
          {
            title: 'Uploads',
          },
        ]}
        style={{width: "80%", margin: "auto"}}
      />

      <br /><br />

            <div style={{height: "350px"}}>
      <Form
        layout="horizontal"
        style={{maxWidth: "500px"}}
        onFinish={onFinish}
        labelCol={{span: 8}}
        wrapperCol={{span: 14}}
                form={form}>
          {formSections[currentStep].fields}
        
                
      </Form>
      </div>

      <div style={{display: "block", height: "50px", width: "100%"}}>
        {currentStep <= formSections.length - 1 && currentStep > 0 &&
        <Button ghost onClick={handlePrevious} type='primary' style={{left: "30px", marginBottom: "30px"}}>Previous</Button>
        }

        {currentStep < formSections.length - 1 &&
        <Button ghost onClick={handleNext} type='primary' style={{float: "right", marginRight: "30px"}}>Next</Button>
        }

        {currentStep === formSections.length - 1 &&
        <Button onClick={submitForm} type='primary' style={{float: "right", marginRight: "30px"}}>{intern ? <>Update</> : (apply ? <>Submit</> : <>Add Intern</>)}</Button>
        }
      
      </div>

      </div>
    </>
  );
};

export default InternAddingForm;