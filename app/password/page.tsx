'use client'
import * as React from 'react';
import { veryLongPassword } from '../webhookchallenge';
import './styles.css';

const Password: React.FC = () => {
    
    let passOne = veryLongPassword.split('row=').map((passString: string) => {
        return 'row=' + passString.replace('\n', '');
    }).filter(passString => passString !== 'row=');

    passOne.sort((a, b) => {
        let rowA = findRowValue(a);
        let rowB = findRowValue(b);
        let columnA = findColumnValue(a);
        let columnB = findColumnValue(b);
        if (rowA == null || rowB == null || columnA == null || columnB == null) {
            // If null (which there shouldn't be null push to the end of the array)
            return 1;
        }

        // rowA === rowB sort by column instead
        return parseInt(rowA) - parseInt(rowB) || parseInt(columnA) - parseInt(columnB);
    })

    function findRowValue(stringToSearch: string) {
        let search = new RegExp("row=\\d+\\b", "gm");
        let result = search.exec(stringToSearch);
        if (result != null) {
            return result[0].replace('row=', '');
        }
        return null;
    }

    function findColumnValue(stringToSearch: string) {
        let search = new RegExp("column=\\d+\\b", "gm");
        let result = search.exec(stringToSearch);
        if (result != null) {
            return result[0].replace('column=', '');
        }
        return null;
    }

    const stitchTogetherTheCode = () => {
        let code: string = '';
        passOne.forEach((codePart) => {
            let codePartArray = codePart.split(': ');
            code = code + codePartArray[1];
        })
        return code;
    }

    return (
        <>
            <div id="code">{stitchTogetherTheCode()}</div>
        </>
    )
}

export default Password;