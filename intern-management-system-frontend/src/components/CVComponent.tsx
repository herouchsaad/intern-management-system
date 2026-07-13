import React, { useEffect, useState } from 'react';
import { Descriptions, Image, Button, Select, Form, Input, Card, Progress, Space, Modal, Tabs, message, Calendar, ConfigProvider, Badge, Row, Col, Tooltip, Dropdown, MenuProps, Popover, Divider } from 'antd';
import {Intern} from "../models/Intern";
import {DownloadOutlined,
        DeleteOutlined,
        EditOutlined,
        ExclamationCircleFilled,
        CloseOutlined,
        PlusOutlined,
        MinusOutlined,
                ProfileOutlined,
    } from '@ant-design/icons';
import { Team } from '../models/Team';
import InternService from '../services/InternService';
import useAuth from '../utils/useAuth';
import useAxiosPrivate from '../utils/useAxiosPrivate';
import TabPane from 'antd/es/tabs/TabPane';
import Loading from './Loading';
import AssignmentTable from './tables/AssignmentTable';
import { Assignment } from '../models/Assignment';
import AddAssignmentForm from './forms/AddAssignmentForm';
import LoadingContainer from './LoadingContainer';
import InternAddingForm from './forms/InternAddingForm';
import { NoticeType } from 'antd/es/message/interface';
import dayjs, { Dayjs } from 'dayjs';
import type { CellRenderInfo } from 'rc-picker/lib/interface';
import "dayjs/locale/tr";
import { Attendance } from '../models/Attendance';
import AttendanceService from '../services/AttendanceService';
import moment from 'moment';
import LocaleDetector from './LocalDetecor';
import { SpecialDay } from '../models/SpecialDay';
import {Document} from "../models/Document"
import JSZip from 'jszip';
import { saveAs } from 'file-saver';


const browserLocale = navigator.language;
moment.locale(browserLocale);


interface PropType {
    intern: Intern,
    setIntern?: React.Dispatch<React.SetStateAction<Intern | undefined>>,
    teams: Team [],
    interns?: Intern [],
    refetchData?: () => void,
    getAssignments?: () => void,
    assignments: Assignment [] | undefined,
    attendances: Attendance [] | undefined,
    specialDays: SpecialDay [],
    getAttendances?: () => void,
    documents?: Document [],
}

const CVComponent: React.FC<PropType> = ({documents, intern, teams, interns, refetchData, assignments, getAssignments, setIntern, attendances, getAttendances, specialDays}) => {
    
    const [form] = Form.useForm();
    const { auth }: any = useAuth();
    const [isDone, setIsDone] = useState(false);
        const [selectedDate, setSelectedDate] = useState<Dayjs>()
    const [isOpen, setIsOpen] = useState(false);
    var workingDays: number [] = [];

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isModalOpen2, setIsModalOpen2] = useState(false)
    const [isModalOpen3, setIsModalOpen3] = useState(false)
    const [totalNumberOfWorkingDays, setTotalNumberOfWorkingDays ] = useState<number>();
    const [numberOfAbsenteeism, setNumberOfAbsenteeism ] = useState<number>();
    const [remainingDays, setRemainingDays ] = useState<number>();
    
    const [isHidden, setIsHidden] = useState<boolean>(true);
    const [form2] = Form.useForm()
    const [form3] = Form.useForm();
    const axiosPrivate = useAxiosPrivate();  
 
    const handleUpdateValue = () => {
        form.setFieldsValue({
        weekSelect: "Select week",
        });
    };

    useEffect(() => {
        setIsHidden(true);
        handleUpdateValue();
    }, [intern]);

    
    useEffect(()=> {
       if(isDone) {
            setIsModalOpen(false);
            setIsModalOpen2(false);

            refetchData!();
            getAssignments!(); 
            
            setIsDone(false);
                   }
    }, [isDone])

    useEffect(() => {
        if(attendances) {
            calculateWorkingDays();
        }
            },[attendances])
      

      

    const findTeam = (temp: Intern) => {
        const team = teams.filter(team => team.team_id === temp.team_id)[0];
        return team;
    }

    const findInternshipPeriod = (start: number, end: number) => {
        return Math.round(((end - start)/( 60 * 60 * 24 * 7)));
    }
    
    
    //Percentage of complete of internship
    const completePercentage = Math.round(((Date.now() - intern.internship_starting_date * 1000) / 
    (intern.internship_ending_date * 1000 - intern.internship_starting_date * 1000)) * 100);

    const calculateWorkingDays = () => {
        let workingDays = 0;
        let absenteeism = 0;
        let counter = 0;

        let currentDay = dayjs(intern.internship_starting_date * 1000);

        while(currentDay.isBefore(dayjs(intern.internship_ending_date * 1000))) {

            const specialDay: SpecialDay | undefined = specialDays.find(specialDay => {
                return specialDay.date === currentDay.startOf("day").unix();
            })

            if(currentDay.day() !== 0 && currentDay.day() !== 6 && !specialDay) {
                workingDays++;

                if(currentDay.isBefore(dayjs())) {
                    counter++;
                }
            }

            

            attendances?.map(attendance => {
                if(attendance.attendance_date === currentDay.startOf("day").unix() && attendance.status === "absent") {
                    absenteeism++;
                }
            })

            currentDay = currentDay.add(1, "day");
        }

        setTotalNumberOfWorkingDays(workingDays);
        setNumberOfAbsenteeism(absenteeism);
        setRemainingDays(workingDays - counter);
    }

    //Delete Modal
    const {confirm} = Modal;

    const showDeleteConfirm = () => {
        confirm({
          title: 'Warning!',
          icon: <ExclamationCircleFilled />,
          content: 'Are you sure to delete this intern?',
          okText: 'Yes',
          okType: 'danger',
          cancelText: 'No',
          onOk() {
            deleteIntern();
          },
          onCancel() {
            
          },
        });
    };


    const deleteIntern =  () =>  {
        const index = interns!.indexOf(intern);
        if (index > -1) { // only splice array when item is found
            interns!.splice(index, 1); // 2nd parameter means remove one item only
        };
        try {
            
            InternService.deleteIntern(axiosPrivate, intern);
     
            setIntern!(undefined);
 
            giveMessage("success", "Intern deleted");
        }
        catch (error: any) {
console.log(error);
            if (!error?.response) {
                giveMessage("error", "No server response");
              } 
            else {
                giveMessage("error", "Error while deleting intern");
              }
        }
        
    };
   
    const downloadCv =  () => {
        if(intern.cv_url !== null){   
             window.open(addAccessToken(intern.cv_url), "_blank");
        } 
        else{
            giveMessage("info", "Intern has not uploaded CV");
        }
    }   

    const addAccessToken = (url: string) => {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}access_token=${auth.accessToken}`;
    }


    const handleNewAssignment = () => {
        showModal2();
    }


    //Edit Intern Modal
    const showModal = () => {
        console.log(interns);
        setIsModalOpen(true);
    };
    
    //Assignment modal
    const showModal2 = () => {
        setIsModalOpen2(true);
    };
    
    //Note modal
    const showModal3 = () => {
        setIsModalOpen3(true);
    };
    const handleOk3 = (e: any) => {
        form3.submit();
    };
    const handleCancel3 = () => {
        setIsModalOpen3(false);
    };

    const onFinish = () => {
        const formData = form3.getFieldsValue();
        handleAbsent(formData.note)
        form3.resetFields();
    }


    const giveMessage = (type: NoticeType, mssge: string) => {
        message.open({
          type: type,
          content: mssge,
        });
      }

    
    const dateCellRender = (value: Dayjs) => {

        if (selectedDate && value.isSame(selectedDate)) { 
            return (
                <div>    
                <Button //cancel button
                    type="primary"
                    icon={<CloseOutlined />}
                    size='small'
                    style={{marginLeft: "70%"}}
                    onClick={() => {
                        setSelectedDate(undefined);
                        setIsOpen(false); 
                    }}
                    
                    danger
                    ghost
                />
                <br />           
                <Button //Present button
                    type="primary"
                    icon={<PlusOutlined />}
                    size='small'
                    onClick={handlePresent}
                    style={{marginTop: "5px"}}
                    ghost
                >Present</Button>
                <br />
                <Button //Absent button
                    type="primary"
                    icon={<MinusOutlined />}
                    size='small'
                    onClick={showModal3}
                    style={{marginTop: "5px"}}
                    danger
                    ghost
                >Absent</Button>
                </div>
            );
        } 

        const specialDay: SpecialDay | undefined = specialDays.find(specialDay => {
            return specialDay.date === value.startOf("day").unix();
        })


                if(specialDay) {
            return <Badge status="default" text={specialDay.title} />
        }
        
        
       if(value.day() === 6 || value.day() === 0 || value.unix() < intern.internship_starting_date ||
        value.isAfter(dayjs(intern.internship_ending_date * 1000)) || value.isAfter(dayjs())) { //if the day is weekend
            return;
       }

       const attendance = getListData(value);
       
       if(attendance?.status === "present") {
            return <Badge status='success' text="Present"></Badge>
       }
       else if(attendance?.status === "absent") {
            return <Tooltip title={attendance.note}><Badge status='error' text="Absent" style={{height: "100%", width:"100%"}}></Badge></Tooltip>
       } 
       else{
        return <Badge status="warning" text="Not Taken"></Badge>
       }
    };

    const cellRender = (current: Dayjs, info: CellRenderInfo<Dayjs>) => {
        if (info.type === 'date'){ 
            return dateCellRender(current);
}

        return info.originNode;
    }

    const getListData = (value: Dayjs) => {
        value = value.set("hour", 0).set("minute", 0).set("second", 0);
        
        const attendance = attendances?.find(attendance => {
            return dayjs(attendance.attendance_date * 1000).isSame(value, 'day');
        });
            
        return attendance;
    }

    const handleSelectDate = (value: Dayjs) => {

        if(auth.role !== 1984) {
            return;
        }

        if(value.isAfter(dayjs())) {
            giveMessage("error", "You cannot take attendance for future dates");
        }
        else if(!value.isSame(selectedDate)) {
            setSelectedDate(value);
            setIsOpen(true);
        } else if (!isOpen && value.isSame(selectedDate)) {
            setSelectedDate(undefined);
        }
        else if(!isOpen) {
            setSelectedDate(undefined);
        }  
    };

    const handlePresent = async () => {
        try {
            //Mark Present
            const date = selectedDate!.set("hour", 0).set("minute", 0).set("second", 0);
            const newAttendance: Attendance = {
                intern_id: intern.intern_id!,
                attendance_date: date.unix(),
                status: "present"
            }

            await AttendanceService.addAttendance(axiosPrivate, newAttendance);

            setSelectedDate(undefined);
            setIsOpen(false);
            giveMessage("success", "Attendance taken");
        } catch (error: any) {
console.log(error);
            if (!error?.response) {
                giveMessage("error", "No server response");
              }
            else {
                giveMessage("error", "Error while taking attendance");
              }
        } finally {
            getAttendances!();
            calculateWorkingDays();
        }
    }

    const handleAbsent = async (note: string) => {
        try {
            //Mark absent
            const date = selectedDate!.set("hour", 0).set("minute", 0).set("second", 0);
            const newAttendance: Attendance = {
                intern_id: intern.intern_id!,
                attendance_date: date.unix(),
                status: "absent",
                note: note
            }
            
            await AttendanceService.addAttendance(axiosPrivate, newAttendance);

            setSelectedDate(undefined);
            setIsOpen(false);
            giveMessage("success", "Attendance taken");
        } catch (error: any) {
            if (!error?.response) {
                giveMessage("error", "No server response");
              }  else {
                giveMessage("error", "Error while taking attendance");
              }
        } finally {
            setIsModalOpen3(false);
            getAttendances!();
                    }
    }

    const openFile = (url: string) => {
        if(url !== null){   
            window.open(addAccessToken(url), "_blank");
       }
    }

    const downloadFilesAsZip = async (zipFileName: string) => {
        if (!documents || documents.length === 0) {
          giveMessage("info", "There is no document to download");
          return;
        }
      
        const zip = new JSZip();
      
        try {

            if(intern.cv_url) {
                const response = await fetch(addAccessToken(intern.cv_url));
                const blob = await response.blob();
                zip.file("CV.pdf", blob);
            }

            await Promise.all(
                documents.map(async (document) => {
                const response = await fetch(addAccessToken(document.document_url));
                const blob = await response.blob();
                zip.file(`${document.document_name}.pdf`, blob);
                })
            );
      
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, zipFileName);
        } catch (error) {
          console.error('Error downloading files:', error);
giveMessage("error", "Error while downloading files");
        }
      };

if(intern === undefined){
        return (<></>);
    }

    return (

        <>
        
        <Image width={150} height={180} style={{border: "2px solid black", borderRadius: "10px"}}
        src={intern.photo_url !== null ? addAccessToken(intern.photo_url) : addAccessToken("/uploads/photos/no-photo.png")}/>

        <Space wrap style={{float: 'right'}}>
            <Progress type="circle" percent={completePercentage} format={(percent) => `${percent}% Complete`} size={100}></Progress>  
            <Progress style={{marginRight: "15px"}} type="circle" percent={intern.overall_success ? intern.overall_success : 0} format={(percent) => `${percent}% Success`} size={100}></Progress>
        </Space>

        <br /><br />
    
                <Descriptions size='small'>
            <Descriptions.Item label="Name">{intern.first_name + " " + intern.last_name}</Descriptions.Item>
            <Descriptions.Item label="University">{intern.uni}</Descriptions.Item>
            <Descriptions.Item label="Major">{intern.major + " (GPA: " + intern.gpa + ")"}</Descriptions.Item>
            <Descriptions.Item label="Grade">{intern.grade + ". Grade"}</Descriptions.Item>
            <Descriptions.Item label="Team">{findTeam(intern)?.team_name}</Descriptions.Item>
            <Descriptions.Item label="Internship Date">
            {new Date(intern.internship_starting_date * 1000).toLocaleDateString() + " - " + new Date(intern.internship_ending_date * 1000).toLocaleDateString() +
            " (" + findInternshipPeriod(intern.internship_starting_date, intern.internship_ending_date) + " Weeks)"}
            </Descriptions.Item>
            <Descriptions.Item label="E-mail">{intern.email}</Descriptions.Item>
            <Descriptions.Item label="Personal ID">{intern.id_no}</Descriptions.Item>
            <Descriptions.Item label="Tel">{intern.phone_number}</Descriptions.Item>
        </Descriptions>

        <br />

        {auth.role === 5150 && 
        <Popover placement="rightTop" content={
              <>
                <div style={{width: "200px"}}>
                {intern.cv_url && <><Button onClick={downloadCv} size='small' type='dashed' block> CV</Button> <br /><br /></>}

                {documents?.map((document: Document) => {
                    return(
                        <>
                        <Button onClick={() => openFile(document.document_url)} size='small' type='dashed' block>{document.document_name}</Button>
                        <br /><br />
                        </>
                    )
                })}

                <Button onClick={() => downloadFilesAsZip(`${intern.id_no}.zip`)} size='small' type="primary" block>Download All</Button>
                </div>
              </>
            } 
        trigger="click" >
              
                <Button
                  size='middle'
                  type='primary'
                  shape='round'
                  icon={<ProfileOutlined />}
                >Documents</Button>
            

        </Popover>}

        <div className='Buttons' style={{display: 'flex'}}>
            {auth.role !== 5150 && <Button  onClick={downloadCv} type="primary" shape="round" icon={<DownloadOutlined />} >Download CV</Button>}
            {auth.role === 5150 && <Button ghost onClick={showModal} type="primary" shape="round" icon={<EditOutlined />} style={{marginLeft: 'auto', marginRight: 10}}>Edit</Button>}
            {auth.role === 5150 && <Button ghost onClick={showDeleteConfirm} type="primary" shape="round" icon={<DeleteOutlined />} style={{float: 'right', marginRight: "15px"}} danger>Delete</Button>}
        </div>

        
        <br /><br /><br /><br />

        <Tabs defaultActiveKey='1' size='middle' type='card'>
        <TabPane tab="Assignments" key="1">
        <div className='assignment-table'>
            <Tabs defaultActiveKey='1' size='middle' tabBarExtraContent={auth.role === 1984 ? <Button type='primary' onClick={handleNewAssignment}>New Assignment</Button> : <></>}>
                <TabPane tab="Waiting" key="1">
                    {!assignments ? <Loading /> : <AssignmentTable readonly={auth.role === 1984 ? false : true} getAssignments={getAssignments} refetchData={refetchData} isComplete={false} assignments={assignments.filter(assignment => !assignment.complete)}/>}
                </TabPane>
                <TabPane tab="Done" key="2">
                    {!assignments ? <Loading /> : <AssignmentTable readonly={auth.role === 1984 ? false : true} getAssignments={getAssignments} refetchData={refetchData} isComplete={true} assignments={assignments.filter(assignment => assignment.complete)}/>}
                </TabPane>
            </Tabs>
        </div>
        </TabPane>

        
        <TabPane tab="Attendance" key="2">
            <div>
            <Row gutter={16} justify={'center'}>
                <Col span={5}>
                    <Card title="Total Working Days" bordered={false} style={{textAlign: "center"}} hoverable>
                        {totalNumberOfWorkingDays}
                    </Card>
                </Col>
                <Col span={5}>
                    <Card title="Absenteeism" bordered={false} style={{textAlign: "center"}} hoverable>
                        {numberOfAbsenteeism}
                    </Card>
                </Col>
                <Col span={5}>
                    <Card title="Remaining Days" bordered={false} style={{textAlign: "center"}} hoverable>
                        {remainingDays}
                    </Card>
                </Col>
            </Row>
            </div>

            <br />

            <div style={{display: "flex", justifyContent: "center"}}>
            <div className='calendar'>
            <LocaleDetector>
            <Calendar onSelect={handleSelectDate} disabledDate={(date) => {
                const specialDay = specialDays.find(specialDay => {
                    return specialDay.date === date.startOf("day").unix();
                })
                if(date.day() === 6 || date.day() === 0 || specialDay){ //Disable selecting weekends
                    return true;
                }
                return false;
            }}
                            style={{margin: "15px"}}  cellRender={cellRender} validRange={[dayjs(intern.internship_starting_date * 1000), dayjs(intern.internship_ending_date * 1000)]}/>
            </LocaleDetector>
            </div>
            </div>
                    </TabPane>

        </Tabs>

        {/*Modals Here*/}
        <div>
            {isModalOpen && <Modal title="Edit" open={isModalOpen} width={"800px"} onCancel={() => setIsModalOpen(false)} footer={null}>
                 <InternAddingForm teams={teams} intern={intern} setIsDone={setIsDone}/>
            </Modal>}

            {isModalOpen2 && <Modal title="New Assignment" open={isModalOpen2} width={600} onCancel={() => setIsModalOpen2(false)} footer={null}>
                 <AddAssignmentForm  intern_id={intern.intern_id!} setIsDone={setIsDone}/>
                 </Modal>}
            
            {isModalOpen3 &&
            <Modal title="Note" open={isModalOpen3} onOk={handleOk3} onCancel={handleCancel3}>
                <Form
                style={{width: 400}}
                onFinish={onFinish}
                labelCol={{span: 6}}
                wrapperCol={{span: 14}}
                form={form3}
                >
                    <Form.Item label="Note" name="note">
                    <Input.TextArea showCount
                        maxLength={250}
                        style={{ height: 100, marginBottom: 10, width: 300}}/>
                    </Form.Item>
                </Form>
            </Modal>}
        </div>

        </>
      );
}

 
export default CVComponent;