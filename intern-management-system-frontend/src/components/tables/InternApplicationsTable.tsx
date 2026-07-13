import { SearchOutlined, QuestionCircleOutlined, DeleteOutlined, CheckOutlined, CloseOutlined} from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import type { InputRef, Pagination } from 'antd';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Tag, Tooltip, message } from 'antd';
import type { ColumnType, ColumnsType } from 'antd/es/table';
import type { FilterConfirmProps, SorterResult } from 'antd/es/table/interface';
import { User } from '../../models/User';
import Highlighter from 'react-highlight-words';
import UserService from '../../services/UserService';
import { useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../../utils/useAxiosPrivate';
import { NoticeType } from 'antd/es/message/interface';
import { Team } from '../../models/Team';
import TeamService from '../../services/TeamService';
import AddTeamForm from '../forms/AddTeamForm';
import { Assignment } from '../../models/Assignment';
import AddAssignmentForm from '../forms/AddAssignmentForm';
import LoadingContainer from '../LoadingContainer';
import AssignmentService from '../../services/AssignmentService';
import { useForm } from 'antd/es/form/Form';
import { Intern } from '../../models/Intern';
import CVComponent from '../CVComponent';
import InternProfile from '../InternProfile';
import ApplicationService from '../../services/ApplicationsService';
import dayjs from 'dayjs';
import AttendanceService from '../../services/AttendanceService';
import UploadService from '../../services/UploadService';

interface ChildProps {
    applications: Intern[];
    refetchData: () => void;
    teams: Team[],
}


type DataIndex = keyof Intern;

const InternApplicationsTable: React.FC<ChildProps> = ({applications, refetchData, teams}) => {

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<InputRef>(null);
    const axiosPrivate = useAxiosPrivate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [form] = useForm();

    const [isDone, setIsDone] = useState(false);
    const [intern, setIntern] = useState<Intern>();

    
    useEffect(() => {
        if(isDone){
          setIsModalOpen(false);
          refetchData();
          setIsDone(false);
        }
    }, [isDone])
    

    
      const handleSearch = (
        selectedKeys: string[],
        confirm: (param?: FilterConfirmProps) => void,
        dataIndex: DataIndex,
      ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
      };
    
      const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
      };

      const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<Intern> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
          <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
            <Input
              ref={searchInput}
              placeholder={`Search ${dataIndex}`}
              value={selectedKeys[0]}
              onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
              >
                Search
              </Button>
              <Button
                onClick={() => clearFilters && handleReset(clearFilters)}
                size="small"
                style={{ width: 90 }}
              >
                Reset
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  confirm({ closeDropdown: false });
                  setSearchText((selectedKeys as string[])[0]);
                  setSearchedColumn(dataIndex);
                }}
              >
                Filter
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  close();
                }}
              >
                close
              </Button>
            </Space>
          </div>
        ),
        filterIcon: (filtered: boolean) => (
          <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) =>
          record[dataIndex]!
            .toString()
            .toLowerCase()
            .includes((value as string).toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
          if (visible) {
            setTimeout(() => searchInput.current?.select(), 100);
          }
        },
        render: (text) =>
          searchedColumn === dataIndex ? (
            <Highlighter
              highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
              searchWords={[searchText]}
              autoEscape
              textToHighlight={text ? text.toString() : ''}
            />
          ) : (
            text
          ),
      });


      
      const columns: ColumnsType<Intern> = [
        {
          title: 'Name',
          key: 'first_name',
          width: '7%',
          ...getColumnSearchProps('first_name'),
          ellipsis: true,
          render: (text, record) => (
            <span style={{cursor: "pointer", color: "blue", fontWeight: "bold"}} onClick={() => viewProfile(record)}>
                {`${record.first_name} ${record.last_name}`}
            </span>
          ),
        },
        {
            title: 'University',
            dataIndex: 'uni',
            key: 'uni',
            width: '10%',
            ...getColumnSearchProps('uni'),
            ellipsis: true,
        },
        {
            title: 'Major',
            dataIndex: 'major',
            key: 'major',
            width: '10%',
            ...getColumnSearchProps('major'),
            ellipsis: true,
        },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
            width: '5%',
            ...getColumnSearchProps('grade'),
            ellipsis: true,
            render: (_, record) => {
              if(record.grade) {
                return <span>{`${record.grade}. Grade`}</span>
              }
            }
        },
        {
            title: 'GPA',
            dataIndex: 'gpa',
            key: 'gpa',
            width: '5%',
            ...getColumnSearchProps('grade'),
            ellipsis: true,
        },
        {
            title: 'Appllication Date',
            dataIndex: 'application_date',
            key: 'application_date',
            width: '9%',
            sorter: (a, b) => {
              if (a.application_date === null && b.application_date === null) {
                return 0; // Both records have no deadline, so they are equal
              }
              if (a.application_date === null) {
                return 1; // Null deadline should come after non-null deadline
              }
              if (b.application_date === null) {
                return -1; // Non-null deadline should come before null deadline
              }
              return a.application_date! - b.application_date!; // Compare timestamps
            }, 
            sortDirections: ['descend', 'ascend'],
            defaultSortOrder: "descend",
            ellipsis: true,
            render: (application_date: number | null, record) => {
              
                const formattedDeadline = new Date(application_date! * 1000).toLocaleString(undefined, {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                
                return <span>{formattedDeadline}</span>;
            }
        },

        {
            title: 'Status',
            key: 'application_status',
            dataIndex: 'application_status',
            width: "6%",
            ellipsis: true,
            render: (_, {application_status}) => {
              
                
                  let color: string;
                  
                  if(application_status === "waiting"){
                    color = "geekblue";
                  }
                  else if(application_status === "accepted") {
                    color = "green";
                  }
                  else {
                    color = "volcano";
                  }

                  return (
                    <Tag color={color} key={application_status}>
                      {application_status!.toUpperCase()}
                    </Tag>
                  );
                
            },
        },
        {
          title: 'Action',
          dataIndex: '',
          key: 'x',
          width: '6%',
          ellipsis: true,
          render: (_, record) => (
            <Space size="middle">
              
              <>

              {record.application_status === "waiting" && <Popconfirm
              title="Are you sure to accept?"
              icon={<QuestionCircleOutlined style={{ color: 'blue' }}/>}
              onConfirm={() => handleAcceptApplication(record)}
              okText="Yes"
              cancelText="No"
              >
                <Tooltip title="Accept">
                  <Button icon={<CheckOutlined />} type='primary' ghost></Button>
                </Tooltip>
              </Popconfirm>}

              {record.application_status === "waiting" && <Popconfirm
              title="Are you sure to reject?"
              icon={<QuestionCircleOutlined style={{ color: 'red' }}/>}
              onConfirm={() => handleRejectApplication(record)}
              okText="Yes"
              cancelText="No"
              >
                <Tooltip title="Reject">
                  <Button icon={<CloseOutlined />} type='primary' ghost danger></Button>
                </Tooltip>
              </Popconfirm>}

              {<Popconfirm
              title="Are you sure to delete?"
              icon={<QuestionCircleOutlined style={{ color: 'red' }}/>}
              onConfirm={() => handleDeleteApplication(record)}
              okText="Yes"
              cancelText="No"
              >
                <Tooltip title="Delete">
                  <Button icon={<DeleteOutlined />} type='primary' ghost danger></Button>
                </Tooltip>
              </Popconfirm>}

              </>
              
             </Space>
          ),
        },
        
      ];

      const viewProfile = (intern: Intern) => {
        setIntern(intern);
        showModal();
      }

      
    
      

      const handleAcceptApplication = async (application: Intern) => {

        if(dayjs(intern?.internship_ending_date).isAfter(dayjs())){
          giveMessage("error", "Applicant's internship date passed");
          return;
        }

        try {
            await ApplicationService.acceptApplication(axiosPrivate, application.application_id!);
  
            giveMessage("success", "Application accepted");
          } catch (error: any) {
            if (!error?.response) {
              giveMessage("error", "No server response");
            } else {
              giveMessage("error", "Error while accepting application!");
            }
          } finally {
              refetchData();
          }
          
      }

      const handleRejectApplication = async (application: Intern) => {
        
        try {
          await ApplicationService.rejectApplication(axiosPrivate, application.application_id!);
          
          giveMessage("success", "Application rejected");
        } catch (error: any) {
          if (!error?.response) {
            giveMessage("error", "No server response");
          } else {
            giveMessage("error", "Error while rejecting application!");
          }
        } finally {
            refetchData();
        }
      
      }
      
      const handleDeleteApplication = async (application: Intern) => {

        try {
          await ApplicationService.deleteApplication(axiosPrivate, application.application_id!);

          giveMessage("success", "Application deleted");
        } catch (error: any) {
          if (!error?.response) {
            giveMessage("error", "No server response");
          } else if(error.response.status === 403) {
            giveMessage("error", "Intern is currently working, cannot delete");
          }
          else {
            giveMessage("error", "Error while deleting application!");
          }
        } finally {
            refetchData();
        }
      
      } 

      

      const giveMessage = (type: NoticeType, mssge: string) => {
        message.open({
          type: type,
          content: mssge,
        });
      };

      const showModal = () => {
        setIsModalOpen(true);
      };
    
      const handleOk = () => {
        setIsModalOpen(false);
      };
    
      const handleCancel = () => {
        setIsModalOpen(false);
      };

      



    return (
        <>
            
            <Table size='middle' columns={columns} dataSource={applications} style={{ top: "0"}} scroll={{y: 1000}} pagination={{pageSize: 5}} />

            <Modal title="View Profile" open={isModalOpen} onCancel={handleCancel} onOk={handleOk} width={"70%"} footer={null}>
                <InternProfile intern={intern} teams={teams} apply={true}/>
            </Modal>
            
        </>
    )
}


export default InternApplicationsTable;