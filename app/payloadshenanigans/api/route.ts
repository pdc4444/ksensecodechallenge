const fs = require('fs');
const path = require('path');
const os = require('os');
import { resultDelimiter, resultObject } from '../index';
import { NextResponse } from 'next/server';

// curl -X POST -d '{"doesThisWork": true}' http://localhost:3000/payloadShenanigans/api
// curl -X POST http://localhost:3000/payloadShenanigans/api -H "Content-Type: application/json" -d '{"name": "Peter2"}'

export async function GET() {
	let homeDirectory: string = os.homedir();
    let resultPath: string = path.join(homeDirectory, '.ksensecodechallenge');
    let resultFile = path.join(resultPath, 'result.txt');
    
    try {
		let contents: string = '';
		if (fs.existsSync(resultFile)) {
			contents = fs.readFileSync(resultFile, 'utf-8');
		}
		return new NextResponse(contents, { status: 200 });
    } catch (error) {
        console.error('Unable to obtain results! Error: ', error);
        return new NextResponse(
			JSON.stringify({ error: 'Unable to obtain results!' }), { status: 500, headers: { 'Content-Type': 'application/json' }
		});
    }
}

export async function POST(request: any) {
	try {
		let contentType = request.headers.get('content-type');
		let data;
		if (contentType == 'application/json') {
			data = await request.json();
			console.log('here is data: ' + JSON.stringify(data));
		} else {
			data = await request.text();
			console.log('Payload is not JSON. Content Type: ' + contentType);
			console.log(data);
		}

		// Save the data to the disk
		if (contentType == 'application/json') {
			logResult(data, 'json');
		} else {
			logResult(data, '');
		}

		return new Response (JSON.stringify({ result: true}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	} catch (error) {
		console.error('Unable to process POST request: ' + error);
		return new Response (
			JSON.stringify({error: 'Invalid Request'}),
			{ status: 400 }
		)
	}
}

async function logResult(result: string, type: string) {
	let resultPath = await createResultStorage();
	let resultFile = path.join(resultPath, 'result.txt');
	let data: string;
	if (type == 'json') {
		data = JSON.stringify(result);
	} else {
		data = result;
	}

	let dataToLog: resultObject = {
		timeStamp: returnTimeStamp(),
		resultData: data
	}

	try {
		fs.appendFileSync(resultFile, JSON.stringify(dataToLog) + resultDelimiter);
	} catch (error) {
		console.error('Unable to write the POST result to disk! Error: ' + error);
	}
}

async function createResultStorage() {
	let homeDirectory: string = os.homedir();
	try {
		let resultPath: string = path.join(homeDirectory, '.ksensecodechallenge');
		await fs.promises.mkdir(resultPath, { recursive: true });
		return resultPath;
	} catch (error) {
		console.error('Unable to create result storage! Error: ' + error);
	}
}

function returnTimeStamp(): string {
	let options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	};

	let formatter = new Intl.DateTimeFormat('en-US', options);
	return formatter.format(new Date()).replace(',', '');
}