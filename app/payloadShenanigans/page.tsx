'use client'
import * as React from 'react';
import Table from '../components/table/table';
import { tableProps } from '../components/table/index';
import './styles.css';
import { resultDelimiter, resultObject } from './index';

const Page: React.FC = () => {

    const [tableData, setTableData] = React.useState<string[][] | undefined>(undefined);

    const fetchData = async () => {
        try {
            let response = await fetch(`${window.location.origin}` + '/payloadShenanigans/api');
            let contents = await response.text();
            let contentArray: Array<resultObject> = contents.split(resultDelimiter).filter(result => result !== '').map(result => JSON.parse(result));
            return contentArray.map((row: resultObject) => { 
                let result: Array<string> = [row.timeStamp, row.resultData];
                return result;
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    React.useEffect(() => {
        const updateData = async () => {
            const data = await fetchData() as string[][];
            setTableData(data);
        };
        updateData();
    }, []);



    let props: tableProps = {
        headers: ['TimeStamp', 'Payload'],
        data: tableData as string[][],
        tableId: 'resultTable'
    }

    return (
        <>
        {(tableData != undefined) &&
            <Table {...props}/>
        }
        </>
    )
};

export default Page;