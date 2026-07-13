import { SearchOutlined, QuestionCircleOutlined  } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import type { InputRef } from 'antd';
import { Button, Input, Modal, Popconfirm, Space, Table, message } from 'antd';
import type { ColumnType, ColumnsType } from 'antd/es/table';
import type { FilterConfirmProps, SorterResult } from 'antd/es/table/interface';
import { User } from '../../models/User';
import Highlighter from 'react-highlight-words';
import UserService from '../../services/UserService';
import { useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../../utils/useAxiosPrivate';
import { NoticeType } from 'antd/es/message/interface';
import AddUserForm from '../forms/AddUserForm';
import { Team } from '../../models/Team';

interface ChildProps {
    users: DataType [];
    teams: Team [],
    getData: () => void;
}


interface DataType {
    user_id: number;
    username: string;
email: string;
    role: number;
team_id: number;
  }

type DataIndex = keyof DataType;

const UserTable: React.FC<ChildProps> = ({users, teams, getData}) => {


    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<InputRef>(null);
        const axiosPrivate = useAxiosPrivate();

    const [user, setUser] = useState<DataType>();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isDone, setIsDone] = useState(false);
    

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

      const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<DataType> => ({
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
          record[dataIndex]
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


      
      const columns: ColumnsType<DataType> = [
        {
          title: 'Username',
          dataIndex: 'username',
          key: 'username',
          width: '30%',
          ...getColumnSearchProps('username'),
          sorter: (a, b) => a.username.localeCompare(b.username), // Corrected sorting function
          sortDirections: ['descend', 'ascend'],
          defaultSortOrder: "ascend",
          ellipsis: true
        },
        {
          title: 'Role',
          dataIndex: 'role',
          key: 'role',
          width: '10%',
          render: (_,record) => {
            let roleAsString = "";
            if(record.role === 2001) {
              roleAsString = "Intern"
            }
            else if (record.role === 1984) {
              roleAsString = "Supervisor" + " (" + teams.find(team => team.team_id === record?.team_id)?.team_name + ")";
            }
            else {
              roleAsString = "Admin";
            }

            return (<span>{roleAsString}</span>)
          }
        },
        {
          title: 'Action',
          dataIndex: '',
          key: 'x',
          width: '20%',
          render: (_, record) => (
            <Space size="middle">
              <Button onClick={() => handleUpdateUser(record)} type="primary">Update</Button>

              <Popconfirm
              title="Are you sure to delete this user?"
              icon={<QuestionCircleOutlined style={{ color: 'red' }}/>}
              onConfirm={() => handleDeleteUser(record.user_id)}
              >
                <Button type="primary" danger>Delete</Button>
              </Popconfirm>
             </Space>
          ),
        },
      ];

      
      const handleDeleteUser = async (user_id: number) => {
        try {
          const response = await UserService.deleteUser(axiosPrivate, user_id);

  
          giveMessage("success", "User deleted");
          
          getData();
        } catch (error: any) {
          if (!error?.response) {
            giveMessage("error", "No server response");
          } else {
            giveMessage("error", "Login failed!");
          }
        }
      
      }


      const giveMessage = (type: NoticeType, mssge: string) => {
        message.open({
          type: type,
          content: mssge,
        });
      };

  

      const handleUpdateUser = (user: DataType) => {
        setUser(user);
console.log(users);
        showModal();
      }

      const showModal = () => {
        setIsModalOpen(true);
      };
    
            
      useEffect(()=> {
        if(isDone) {
             setIsModalOpen(false);
             
             getData();
             
             setIsDone(false);
                     }
     }, [isDone])


    return (
          <>
            <Table size='middle' columns={columns} dataSource={users} style={{width: "600px", top: "0"}} scroll={{y: 250}} pagination={{hideOnSinglePage: true}}/>
       
            {isModalOpen && <Modal title="Edit User" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
              <AddUserForm  setIsDone={setIsDone} teams={teams} userToUpdate={user} getData={getData}/>
            </Modal>}

          </>
    )
}


export default UserTable;