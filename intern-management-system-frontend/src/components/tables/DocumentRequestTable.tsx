import { SearchOutlined, QuestionCircleOutlined  } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import type { InputRef } from 'antd';
import { Button, Input, Popconfirm, Space, Table, message } from 'antd';
import type { ColumnType, ColumnsType } from 'antd/es/table';
import type { FilterConfirmProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import useAxiosPrivate from '../../utils/useAxiosPrivate';
import { NoticeType } from 'antd/es/message/interface';
import DocumentReqeustService from '../../services/DocumentRequestService';

interface DataType  {
    id?: number,
    document_name: string,
}

interface ChildProps {
    documents: DataType [];
    getData?: () => void;
}

type DataIndex = keyof DataType;

const DocumentRequestTable: React.FC<ChildProps> = ({documents, getData}) => {

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<InputRef>(null);
        const axiosPrivate = useAxiosPrivate();


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


      
      const columns: ColumnsType<DataType> = [
        {
          title: 'Document Name',
          dataIndex: 'document_name',
          key: 'document_name',
          width: '30%',
          ...getColumnSearchProps('document_name'),
          sorter: (a, b) => a.document_name.localeCompare(b.document_name), // Corrected sorting function
          sortDirections: ['descend', 'ascend'],
          defaultSortOrder: "ascend",
          ellipsis: true
        },
        {
          title: 'Action',
          dataIndex: '',
          key: 'x',
          width: '10%',
          render: (_, record) => (
            <Space size="middle">

              <Popconfirm
              title="Are you sure to delete this team?"
              icon={<QuestionCircleOutlined style={{ color: 'red' }}/>}
              onConfirm={() => handleDeleteDocument(record.id!)}
              >
                <Button type="primary" danger>Delete</Button>
              </Popconfirm>
             </Space>
          ),
        },
      ];


      const handleDeleteDocument = async (id: number) => {
        try {
          await DocumentReqeustService.deleteRequest(axiosPrivate,id);

          giveMessage("success", "Document deleted");
          
          getData!();
        } 
        catch (error: any) {
console.log(error);
          if (!error?.response) {
            giveMessage("error", "No server response");
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

    

    return (
        <>
                       
<Table size='middle' columns={columns} dataSource={documents} style={{width: "600px", top: "0"}} scroll={{y: 250}} pagination={{hideOnSinglePage: true}}/>

        </>
    )
}


export default DocumentRequestTable;