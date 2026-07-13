import { SearchOutlined, QuestionCircleOutlined  } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import type { InputRef } from 'antd';
import { Button, Input, Modal, Popconfirm, Space, Table, message } from 'antd';
import type { ColumnType, ColumnsType } from 'antd/es/table';
import type { FilterConfirmProps, SorterResult } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import { useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../../utils/useAxiosPrivate';
import { NoticeType } from 'antd/es/message/interface';
import { Team } from '../../models/Team';
import TeamService from '../../services/TeamService';
import AddTeamForm from '../forms/AddTeamForm';
import { Intern } from '../../models/Intern';

interface ChildProps {
    teams: Team [];
    interns?: Intern [];
    getData?: () => void;
    isDashboard?: boolean;
}


type DataIndex = keyof Team;

const TeamTable: React.FC<ChildProps> = ({teams, getData, isDashboard, interns}) => {

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<InputRef>(null);
        const axiosPrivate = useAxiosPrivate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [team, setTeam] = useState<Team>();

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

      const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<Team> => ({
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


            const columns: ColumnsType<Team> = [
        {
          title: 'Team Name',
          dataIndex: 'team_name',
          key: 'team_name',
          width: '30%',
          ...getColumnSearchProps('team_name'),
          sorter: (a, b) => a.team_name.localeCompare(b.team_name), // Corrected sorting function
          sortDirections: ['descend', 'ascend'],
          defaultSortOrder: "ascend",
          ellipsis: true
        },
        {
          title: 'Action',
          dataIndex: '',
          key: 'x',
          width: '20%',
          render: (_, record) => (
            <Space size="middle">
              <Button onClick={() => handleUpdateTeam(record)} type="primary">Update</Button>

              <Popconfirm
              title="Are you sure to delete this team?"
              icon={<QuestionCircleOutlined style={{ color: 'red' }}/>}
              onConfirm={() => handleDeleteTeam(record.team_id!)}
              >
                <Button type="primary" danger>Delete</Button>
              </Popconfirm>
             </Space>
          ),
        },
      ];


      const columnsDashboard: ColumnsType<Team> = [
        {
          title: 'Team Name',
          dataIndex: 'team_name',
          key: 'team_name',
          width: '30%',
          ...getColumnSearchProps('team_name'),
          sorter: (a, b) => a.team_name.localeCompare(b.team_name), // Corrected sorting function
          sortDirections: ['descend', 'ascend'],
          defaultSortOrder: "ascend",
          ellipsis: true
        },
        {
          title: 'Supervisor(s)',
          key: 'supervisors',
          width: '30%',
          ...getColumnSearchProps('team_name'),
          //sorter: (a, b) => a.team_name.localeCompare(b.team_name), // Corrected sorting function
          //sortDirections: ['descend', 'ascend'],
          //defaultSortOrder: "ascend",
          ellipsis: true,
          render: (record) => {
            return (<>
              {record.supervisors?.map((supervisor: string) => {
                        return(
                            <>
                            {supervisor && <span>{supervisor +"\n"} </span>}
                            </>
                        )
                    })}
            </>)
          }
        },
        {
          title: 'Number of Interns',
          key: 'number_of_interns',
          width: '30%',
          ...getColumnSearchProps('team_name'),
          //sorter: (a, b) => a.team_name.localeCompare(b.team_name), // Corrected sorting function
          //sortDirections: ['descend', 'ascend'],
          //defaultSortOrder: "ascend",
          //
          ellipsis: true,
          render: (record) => {
            return (
              <span>{interns?.filter(intern => intern.team_id === record.team_id).length}</span>
            )
          }
        },
        
      ];

      

      const handleDeleteTeam = async (team_id: number) => {
        try {
          await TeamService.deleteTeam(axiosPrivate, team_id);

          giveMessage("success", "Team deleted");
          
          getData!();
        } 
        catch (error: any) {
console.log(error);
          if (!error?.response) {
            giveMessage("error", "No server response");
          } 
            else if (error.response.status === 403) {
            giveMessage("error", "Team is used by some interns, cannot delete");
          }
           else {
            giveMessage("error", "Deletion failed!");
          }
        }
      }


      const giveMessage = (type: NoticeType, mssge: string) => {
        message.open({
          type: type,
          content: mssge,
        });
      };

      const handleUpdateTeam = (team: Team) => {
          setTeam(team);
          showModal();
      }

      
        const showModal = () => {
        setIsModalOpen(true);
      };
    
      
      useEffect(()=> {
        if(isDone) {
             setIsModalOpen(false);
             
             getData!();
             
             setIsDone(false);
                     }
     }, [isDone])
    


    return (
        <>
            <Table size='middle' columns={isDashboard ? columnsDashboard : columns} dataSource={teams} style={{width: "600px", top: "0"}} scroll={{y: 250}} pagination={{hideOnSinglePage: true}}/>

            <Modal title="Basic Modal" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
              <AddTeamForm setIsDone={setIsDone} team={team} getData={getData!} />
            </Modal>

        </>
    )
}


export default TeamTable;