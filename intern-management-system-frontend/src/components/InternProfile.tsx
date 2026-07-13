import React, { useEffect, useState } from 'react';
import { Descriptions, Image, Button, Select, Form, Input, Card, Progress, Space, Modal, Tabs, message } from 'antd';
import {Intern} from "../models/Intern";
import {DownloadOutlined, DeleteOutlined, EditOutlined, ExclamationCircleFilled} from '@ant-design/icons';
import { Team } from '../models/Team';
import useAuth from '../utils/useAuth';
import { NoticeType } from 'antd/es/message/interface';






interface PropType {
    intern: Intern | undefined,
    teams: Team [],
    apply?: boolean,
}

const InternProfile: React.FC<PropType> = ({intern, teams, apply}) => {

    const { auth }: any = useAuth();



    if(intern === undefined){
        return (<></>);
    }

     //Percentage of complete of internship
    const completePercentage = Math.round(((Date.now() - intern.internship_starting_date * 1000) / 
    (intern.internship_ending_date * 1000 - intern.internship_starting_date * 1000)) * 100);
 
 
     const findTeam = (temp: Intern) => {
         const team = teams.filter(team => team.team_id === temp.team_id)[0];
         console.log("team", teams, intern);
         return team;
     }
 
     const findInternshipPeriod = (start: number, end: number) => {
         return Math.round(((end - start)/( 60 * 60 * 24 * 7)));
     }


    const downloadCv =  (event: any) => {
        if(intern.cv_url !== null){   
             window.open(addAccessToken(intern.cv_url), "_blank");
        } else{
            giveMessage("info", "Intern has not uploaded CV");
        }
    }   

    const addAccessToken = (url: string) => {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}access_token=${auth.accessToken}`;
    }

    const giveMessage = (type: NoticeType, mssge: string) => {
        message.open({
          type: type,
          content: mssge,
        });
    }

    return (
        <>
            <Image width={150} height={180} style={{border: "2px solid black", borderRadius: "10px"}}
        src={intern.photo_url !== null ? addAccessToken(intern.photo_url) : addAccessToken("/uploads/photos/no-photo.png")}/>

        {!apply && <Space wrap style={{float: 'right'}}>
            <Progress type="circle" percent={completePercentage} format={(percent) => `${percent}% Complete`} size={100}></Progress>  
            <Progress type="circle" percent={intern.overall_success ? intern.overall_success : 0} format={(percent) => `${percent}% Success`} size={100}></Progress>
        </Space>}

        <br /><br />
    
        

        <Descriptions>
            <Descriptions.Item label="Name">{intern.first_name + " " + intern.last_name}</Descriptions.Item>
            <Descriptions.Item label="University">{intern.uni}</Descriptions.Item>
            <Descriptions.Item label="Major">{intern.major + " (GPA: " + intern.gpa + ")"}</Descriptions.Item>
            <Descriptions.Item label="Grade">{intern.grade + ". Grade"}</Descriptions.Item>
            <Descriptions.Item label="Team">{findTeam(intern).team_name}</Descriptions.Item>
            <Descriptions.Item label="Internship Date">
            {new Date(intern.internship_starting_date * 1000).toLocaleDateString() + " - " + new Date(intern.internship_ending_date * 1000).toLocaleDateString() +
            " (" + findInternshipPeriod(intern.internship_starting_date, intern.internship_ending_date) + " Weeks)"}
            </Descriptions.Item>
            <Descriptions.Item label="E-mail">{intern.email}</Descriptions.Item>
            <Descriptions.Item label="Personal ID">{intern.id_no}</Descriptions.Item>
            <Descriptions.Item label="Tel">{intern.phone_number}</Descriptions.Item>
        </Descriptions>

        <div className='Buttons' style={{display: 'flex'}}>
            <Button  onClick={downloadCv} type="primary" shape="round" icon={<DownloadOutlined />} size={"middle"}>Download CV</Button>
        </div>
        </>
      );
}
 
export default InternProfile;