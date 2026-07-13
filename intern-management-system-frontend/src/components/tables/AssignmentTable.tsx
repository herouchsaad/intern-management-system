import { SearchOutlined, QuestionCircleOutlined  } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import type { InputRef } from 'antd';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, message } from 'antd';
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
import useAuth from '../../utils/useAuth';

interface ChildProps {
    assignments: Assignment[];
    getAssignments?: () => void;
    refetchData?: () => void;
    readonly?: boolean;
    isComplete?: boolean;
}


type DataIndex = keyof Assignment;

const AssignmentTable: React.FC<ChildProps> = ({assignments, refetchData, getAssignments, readonly, isComplete}) => {

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<InputRef>(null);
    const axiosPrivate = useAxiosPrivate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [form] = useForm();
    const {auth }: any = useAuth();
        const [isDone, setIsDone] = useState(false);
    const [assignment, setAssignment] = useState<Assignment>();

    
    useEffect(() => {
        if(isDone){
          setIsModalOpen(false);
          getAssignments!();
          refetchData!();
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

   

      const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<Assignment> => ({
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


      
      const columns: ColumnsType<Assignment> = [
        {
          title: 'Description',
          dataIndex: 'description',
          key: 'description',
          width: '50%',
          ...getColumnSearchProps('description'),
        },
        {
            title: 'Deadline',
            dataIndex: 'deadline',
            key: 'deadline',
            width: '15%',
            sorter: (a, b) => {
              if (a.deadline === null && b.deadline === null) {
                return 0; // Both records have no deadline, so they are equal
              }
              if (a.deadline === null) {
                return 1; // Null deadline should come after non-null deadline
              }
              if (b.deadline === null) {
                return -1; // Non-null deadline should come before null deadline
              }
              return a.deadline! - b.deadline!; // Compare timestamps
            }, 
            sortDirections: ['descend', 'ascend'],
            defaultSortOrder: "ascend",
            ellipsis: true,
            render: (deadline: number | null, record) => {
              if (deadline) {
                const formattedDeadline = new Date(deadline * 1000).toLocaleString(undefined, {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                var color = (deadline * 1000 < new Date().valueOf()) ? "red" : "green";
                if(record.grade) {
                  color = "black";
                }
                return <span style={{color: color}}>{formattedDeadline}</span>;
              } else {
                return <span>No Deadline</span>;
              }
            }
        },
        {
            title: 'Weight',
            dataIndex: 'weight',
            key: 'weight',
            width: '10%',
            //add sorting
            ellipsis: true
        },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
            width: '10%',
            // add sorting
            ellipsis: true,
            render: (grade: number | null, record) => {
              if (grade) {
                return <span >{grade}</span>;
              } else {
                return readonly ? <>Not Graded</> : <Button onClick={ () => handleGrade(record)}>Grade</Button> ;
              }
            }
        },
        ...(readonly ? [] : [ {
          title: 'Action',
          dataIndex: '',
          key: 'x',
          width: '15%',
          render: (record: any) => (
            <Space size="middle">
              <Button onClick={() => handleUpdateAssignment(record)}>Update</Button>

              <Popconfirm
              title="Are you sure to delete this team?"
              icon={<QuestionCircleOutlined style={{ color: 'red' }}/>}
              onConfirm={() => handleDeleteAssignment(record)}
              >
                <Button type="primary" danger ghost>Delete</Button>
              </Popconfirm>
             </Space>
          ),
        }]),
        ...((auth.role === 2001 && !isComplete) ? [ {
          title: 'Action',
          dataIndex: '',
          key: 'x',
          width: '10%',
          render: (record: any) => (

            <Space size="middle">
            
              <Popconfirm
              title="Are you sure to mark as done?"
              icon={<QuestionCircleOutlined style={{ color: 'red' }}/>}
              onConfirm={() => handleMarkAsDone(record)}
              >
                <Button type="primary" ghost>Complete</Button>
              </Popconfirm>
             </Space>
          ),
        }] : [])
      ];

      
      const handleGrade = (assignment: Assignment) => {
        setAssignment(assignment);
        showModal2();
      }

      
      const handleDeleteAssignment = async (assignment: Assignment) => {
        
        try {
          await AssignmentService.deleteAssignment(axiosPrivate, assignment.assignment_id!);

          
          giveMessage("success", "Assignment deleted");
        } catch (error: any) {
          if (!error?.response) {
            giveMessage("error", "No server response");
          } else {
            giveMessage("error", "Error while deleting assignment!");
          }
        } finally {
            setIsDone(true);
        }
      
      }

      const giveMessage = (type: NoticeType, mssge: string) => {
        message.open({
          type: type,
          content: mssge,
        });
      };

      const handleUpdateAssignment = (assignment: Assignment) => {
          setAssignment(assignment);
          showModal();
      }


      const showModal = () => {
        setIsModalOpen(true);
      };
    
            const showModal2 = () => {
        setIsModalOpen2(true);
      };
    
      const handleOk2 = () => {
        form.submit();
      };
    
      const handleCancel2 = () => {
        setIsModalOpen2(false);
      };

      const onFinish = () => {
        grade();
      }

      const grade = async () => {
        const grade = form.getFieldsValue().grade;
        assignment!.grade = grade;
        assignment!.complete = true;
        try {
          await AssignmentService.updateAssignment(axiosPrivate, assignment!);

          giveMessage("success", "Assignment graded");
        } catch (error: any) {
          if (!error?.response) {
            giveMessage("error", "No server response");
          }  else {
            giveMessage("error", "Error while grading");
          }
        } finally {
          getAssignments!();
          refetchData!();
          setIsModalOpen2(false);
        }
        
      }

      const handleMarkAsDone =  async (record: Assignment) => {
        try {
          await AssignmentService.markDone(axiosPrivate, record.assignment_id!);
          refetchData!();
          giveMessage("success", "Assignment marked as done")
        } catch (error:any) {
          console.log(error);
          if (!error?.response) {
            giveMessage("error", "No server response");
          }  else {
            giveMessage("error", "Error while marking");
          }
        }
      }
    


    return (
        <>
            <Table size="middle" columns={columns} dataSource={assignments} style={{ top: "0"}} scroll={{y: 400}} pagination={{hideOnSinglePage: true}}/>

            <Modal title="Edit Assignment" open={isModalOpen} width={600} onCancel={() => setIsModalOpen(false)} footer={null}>
              <AddAssignmentForm assignment={assignment} setIsDone={setIsDone} />
                          </Modal>

            <Modal title="Grade" open={isModalOpen2} onCancel={handleCancel2} onOk={handleOk2}>
              <div>
                <Form 
                form={form}
                onFinish={onFinish} >
                  <Form.Item label="Grade" name="grade" rules={[{type: "integer", min: 0, max: 100, required: true, message: "Please enter a valid integer between 0 and 100" },]}>
                    <InputNumber />
                  </Form.Item>
                </Form>
              </div>
            </Modal>

        </>
    )
}


export default AssignmentTable;