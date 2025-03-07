import { NextApiRequest, NextApiResponse } from 'next';
const fs = require('fs');
const path = require('path');
const os = require('os');

export default function handler(request: NextApiRequest, response: NextApiResponse) {
    let homeDirectory: string = os.homedir();
    let resultPath: string = path.join(homeDirectory, '.ksensecodechallenge');
    let resultFile = path.join(resultPath, 'result.txt');
    
    try {
        let contents: string = fs.readFileSync(resultFile, 'utf-8');
        response.status(200).send(contents);
    } catch (error) {
        console.error('Unable to obtain results! Error: ', error);
        response.status(500).json({ error: 'Unable to obtain results!' });
    }
}
