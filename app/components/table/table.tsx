'use client'
import * as React from 'react';
import { tableProps, headerObject } from './index';
import './styles.css';

const Table: React.FC<tableProps> = (props: tableProps) => {
    const [columnWidth, setColmunWidth] = React.useState<number>(0);
    const [rowHeight, setRowHeight] = React.useState<number>(0);
    const [dataRows, setDataRows] = React.useState(props.data);
    const [page, setPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const [preparedData, setPreparedData] = React.useState<(string | Element)[][][]>([]);
    const columnClassNames = React.useRef<Array<string>>([]);
    const emptyRowString = "-09234-0958uin;lk12j3;lmasd90887123450haskdasdl;kfj%!@%#!@#$!@#$^&^&";
    const [searchFilter, setSearchFilter] = React.useState<string>('');
    const [rowsPerPage, setRowsPerPage] = React.useState(40);

    React.useMemo(() => {
        if (props.rowsPerPage != undefined) {
            setRowsPerPage(props.rowsPerPage);
        }
    }, [props.rowsPerPage])

    React.useMemo(() => {
        function paginateData(): Array<Array<Array<string | Element>>> {
            let paginatedData: Array<Array<Array<string | Element>>> = [];
            let pageCounter = 1;
            let i = 0;
            let currentPageOfData: Array<Array<string | Element>> = [];
            dataRows.forEach((dataRow) => {
                if (i >= rowsPerPage) {
                    paginatedData.push(currentPageOfData);
                    pageCounter++;
                    i = 0;
                    currentPageOfData = [];
                }
                currentPageOfData.push(dataRow);
                i++;
            });
            // Insert empty rows at the end of the last page for paginated data to keep the table size consistent
            if (currentPageOfData.length < rowsPerPage) {
                let currentDataLength = currentPageOfData.length;
                for (let i = 0; i < (rowsPerPage - currentDataLength); i++) {
                    let emptyRow = [];
                    for (let x = 0; x < props.headers.length; x++) {
                        emptyRow.push(emptyRowString);
                    }
                    currentPageOfData.push(emptyRow);
                }
            }
            paginatedData.push(currentPageOfData);
            setTotalPages(pageCounter);
            return paginatedData;
        }
        if (dataRows != undefined) {
            setPreparedData(paginateData());
        }
    }, [dataRows]);

    React.useMemo(() => {
        // Determine the width for each column and the height for each Row. These by default will be evenly distributed.
        // However, manual tuning of the table should be done through styles calling Table using the !important tag
        let defaultColumnWidth = 100 / props.headers.length;
        setColmunWidth(defaultColumnWidth);

        let defaultRowHeight = 100 / rowsPerPage;
        setRowHeight(defaultRowHeight);
    }, []);

    React.useMemo(() => {
        if (searchFilter != undefined) {
            applySearchFilter();
        }
    }, [searchFilter]);

    React.useEffect(() => {
        function injectCSS() {  
            let styles = '';
            columnClassNames.current.forEach((columnClass: string) => {
                styles = styles + ' .' + columnClass + ' {width: ' + columnWidth + '%;';
                styles = styles + 'height: 100%; align-content: center;}';
            });
            styles = styles + ' .dataRow {height:' + rowHeight + '%;}';
            styles = styles + ' #' + props.tableId + ' { height: 100%; }';
            // If the element exists but the styles don't match what's in the DOM, remove it
            let styleElement = document.getElementById('tableAutoStyle');
            if (
                styleElement &&
                styleElement.textContent != styles
            ) {
                document.head.removeChild(styleElement);
            }

            if (
                document.getElementById('tableAutoStyle') == undefined
            ) {
                let element = document.createElement('style');
                element.setAttribute('id', 'tableAutoStyle');
                element.textContent = styles;
                document.head.appendChild(element);
            }
        }
        injectCSS();
    }, [columnClassNames, columnWidth]);

    const handleSort = (e: React.BaseSyntheticEvent) => {
        if (dataRows == undefined) {
            return;
        }
        const hideSortArrows = () => {
            let arrows = document.getElementsByClassName('sortArrow');
            if (arrows.length > 0) {
                for (let key = 0; key < arrows.length; key++) {
                    arrows[key].setAttribute('hidden', '');
                }
            }
        }

        setPage(1);
        let headerIndex: number = 0;

        for (let i = 0; i < e.target.classList.length ; i++) {
            if (e.target.classList[i].includes("headerIndex_")) {
                headerIndex = parseInt(e.target.classList[i].replace("headerIndex_", ""));
            }
        }
        
        function actuallyDoTheSorting(direction: string, headerIndex: number, element: HTMLButtonElement) {
            applySearchFilter();
            let dataToSort = [...dataRows];
            hideSortArrows();
            element.removeAttribute('hidden');
            (direction == 'asc') ? element.innerHTML = '\u2B06' : element.innerHTML = '\u2B07';
            dataToSort.sort((a, b) => {
                let valueA: any = (a[headerIndex]);
                let valueB: any = (b[headerIndex]);
                if (headerIndex == 1) {
                }
                if (
                    (Number.isFinite(valueA) || (Number.isFinite(Number(valueA)) && typeof valueA === 'string')) &&
                    (Number.isFinite(valueB) || (Number.isFinite(Number(valueB)) && typeof valueA === 'string'))
                   )
                {
                    if (valueA.includes('.') && valueB.includes('.')) {
                        valueA = parseFloat(valueA);
                        valueB = parseFloat(valueB);
                    } else {
                        valueA = parseInt(valueA);
                        valueB = parseInt(valueB);
                    }
                    return ((direction == 'asc') ? valueA - valueB : valueB - valueA);
                } else {
                    return ((direction == 'asc') ? valueA.toString().localeCompare(valueB) : valueB.toString().localeCompare(valueA));
                }
            });
            return dataToSort;
        }

        let sortArrow = e.target.lastChild as HTMLButtonElement;
    
        // If the className is missing then it's expected that the sort arrow was turned off by headerObject
        if (sortArrow.className != 'sortArrow') {
            return;
        }

        if (sortArrow.getAttribute('hidden') != null) {
            // Ascending
            setDataRows(actuallyDoTheSorting('asc', headerIndex, sortArrow));
        } else if (sortArrow.innerHTML == '\u2B06') {
            // Descending
            setDataRows(actuallyDoTheSorting('desc', headerIndex, sortArrow));
        } else if (sortArrow.innerHTML == '\u2B07')  {
            // Ascending
            setDataRows(actuallyDoTheSorting('asc', headerIndex, sortArrow));
        }
    }

    function applySearchFilter() {
        if (searchFilter != undefined && dataRows != undefined) {
            let query = searchFilter.toLowerCase();
            let applicableDataRows: Array<Array<string>> = [];
            props.data.forEach((dataRowArray: (string | Element)[]) => {
                dataRowArray.forEach((dataPoint: string | Element) => {
                    if (typeof dataPoint === 'string' && dataPoint.toLowerCase().includes(query)) {
                        applicableDataRows.push(dataRowArray as Array<string>);
                    }
                })
            })
            if (query != undefined && query != '') {
                setDataRows(applicableDataRows);
            } else {
                setDataRows(props.data);
            }
        }
    }

    function createHeaders(headerArray: Array<string | headerObject>) {
        let removeSpaces = new RegExp(/\s|\W/gm);
        function generateColumnClassName(headerName: string) {
            let className = headerName.replace(removeSpaces, '') + '_col';
            let currentClassNames: Array<string> = [...columnClassNames.current];
            if (!currentClassNames.includes(className)) {
                currentClassNames.push(className);
                columnClassNames.current = currentClassNames;
            }
            return className;
        }

        return (
            <div className='headerRow tableRow'>
            {headerArray.map((headerItem: string | headerObject, headerIndex: number) => {
                let header;
                let drawSortArrow = true;
                if (typeof headerItem === 'string') {
                    header = headerItem as string;
                } else {
                    header = headerItem.label;
                    drawSortArrow = headerItem.sortable;
                }
                return (
                    <div onClick={handleSort} key={header.replace(removeSpaces, '') + '_header_key'} className={generateColumnClassName(header) + " headerIndex_" + headerIndex}>
                        {header}
                        {drawSortArrow && <button className='sortArrow' inert hidden/>}
                    </div>
                )
            })}
            </div>
        )
    }

    function createDataRows(data: Array<string>, dataIndex: number) {
        function createDataCell(dataPoint: string, keyPosition: number) {
            let cellClass = columnClassNames.current[keyPosition];
            // If the dataPoint is the emptyRowString (defined above) make the dataPoint '' and set the class
            // Once the emptyCell class is set a Psudeoelement will exist within the cell and will draw an empty row
            (dataPoint == emptyRowString? cellClass = cellClass + ' emptyCell' : false);
            (dataPoint == emptyRowString? dataPoint = '' : false);
            return (
                <div key={'data_cell_' + dataIndex + '_' + keyPosition} className={cellClass}>
                    {dataPoint}
                </div>
            )
        }
        return (
            <div key={'row_data_' + dataIndex} className={'dataRow tableRow rowStyle' + dataIndex % 2}>
                {data.map((cellData, keyIndex) => { return createDataCell(cellData, keyIndex) })}
            </div>
        )
    }

    function createSearchFilter() {
        return (
            <div className="searchFilter">
                <input type="text" placeholder="search filter" onKeyUp={(e: React.BaseSyntheticEvent) => {setSearchFilter(e.target.value)}}></input>
            </div>
        )
    }

    function createPageControls() {
        function changePage(direction: string) {
            if (direction == 'prev' && page > 1) {
                setPage(page - 1);
            } else if (direction == 'next' && page < totalPages) {
                setPage(page + 1);
            }
        }
        return (
            <div className="pageControls">
                <div onClick={() => {changePage('prev')}}>{'\u2B05'}</div>
                <div>{"Page: " + page + "/" + totalPages}</div>
                <div onClick={() => {changePage('next')}}>{'\u27A1'}</div>
            </div>
        )
    }

    function createActionBar() {
        return (
            <div className='actionBar'>
                <div className='actionBarPropElement'>
                    {props.actionBarElement != undefined && props.actionBarElement()}
                </div>
                <div className='actionBarTableControls'>
                    {createSearchFilter()}
                    {createPageControls()}
                </div>
            </div>
        )
    }

    return (
        <>
            <div id={props.tableId}>
                {createHeaders(props.headers)}
                <div className="tableData">
                    {preparedData.length > 0 && preparedData[page - 1].map((rowData: (string | Element)[], rowIndex: number) => { return createDataRows(rowData as Array<string>, rowIndex) })}
                </div>
                {createActionBar()}
            </div>
        </>
    )
}

export default Table;