const fs = require('fs');
const ObjectsToCsv = require('objects-to-csv');
const childProcess = require('child_process');
const videoStitch = require('video-stitch');
 
let VOD_ID = 1517536644;
let FACTOR = 8;


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Download CHAT VOD
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
if (fs.existsSync(`${VOD_ID}.json`)) {
    console.log('File exist.');
} else {
    childProcess.execSync(`TwitchDownloaderCLI.exe -m ChatDownload --id ${VOD_ID} -o ${VOD_ID}.json`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
    console.log('Downloaded Successfully.');
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//PARSE CHAT VOD
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let rawData = fs.readFileSync(`${VOD_ID}.json`);
let chat = JSON.parse(rawData);

let firstMessage = Date.parse(chat.comments[0].created_at);
let csvContent = [];

chat.comments.forEach((comment) => {
    let row = {
        id: (Date.parse(comment.created_at) - firstMessage),
        timestamp: comment.content_offset_seconds,
        text: comment.message.body
    };
    csvContent.push(row); //row + "\r\n";
});

let countsData = [];

function formatTime(time) {
    let hour = Math.floor(time / (60 * 60));
    let min = Math.floor((time - (hour * 60 * 60)) / 60);
    let sec = Math.floor(time - (hour * 60 * 60) - (min * 60));
    return `${hour}h${min}m${sec}s`;
}

csvContent.forEach((row) => {
    second = Math.floor(row.id / 10000);
    const exist = (element) => element.x == second;
    let index = countsData.findIndex(exist);
    if (index == -1) {
        let newObj = {
            x: second,
            count: 1,
            increase: 1,
            timestamp: row.timestamp,
            startLink: formatTime(parseFloat(row.timestamp) - 10.0),
            start: Math.floor(parseFloat(row.timestamp) - 10.0),
            end: Math.floor(parseFloat(row.timestamp) + 20.0),
            link: ''
        };
        countsData.push(newObj);
    } else {
        countsData[index].count++;
    }
}
);

let data = countsData.map((value, index) => {
    let increase = 0;
    if (index == 0)
        increase = 0;
    else
        increase = (value.count / countsData[index - 1].count);
    return {
        x: value.x,
        count: value.count,
        increase: increase,
        timestamp: value.timestamp,
        startLink: value.startLink,
        start: value.start,
        end: value.end,
        link: `https://www.twitch.tv/videos/${VOD_ID}?t=${value.startLink}`
    };
});

console.log('Parse Success.');


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FILTER CHAT VOD
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
data = data.sort((a, b) => (b.increase - a.increase));
let result = data.filter(value => value.increase >= FACTOR);
if (result.data >20)
    result = result.slice(0,20);
if (result.length < 20)
    result = data.slice(0, 20);
    
result = result.sort((a, b) => (a.x - b.x));

console.log('Filter Success.');

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//DOWNLOAD CSV
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
(async () => {
    if (fs.existsSync(`output/${VOD_ID}.csv`)) {
        console.log('CSV exist.');
    }
    else {
        const csv = new ObjectsToCsv(result);
        // Save to file:
        await csv.toDisk(`./output/${VOD_ID}.csv`);
        console.log('Sucessfully generated CSV.');
    }

})();



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Download CLIPS VOD
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
if (fs.existsSync(`video/${VOD_ID}_0.mp4`)) {
    console.log('Clips exist.');
} else {
    result.forEach((element, index) => {
        childProcess.execSync(`TwitchDownloaderCLI.exe -m VideoDownload -q 720p60 -b ${element.start} -e ${element.end}  --id ${VOD_ID} -o video/${VOD_ID}_${index}.mp4`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        });
        console.log('Download...');
    });
    console.log('Clips Download Sucess.')
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//COMPILE CLIPS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let fileNames = [];

for (let i = 0; i < result.length; i++) {
    fileNames.push({
        fileName: `${__dirname}\\video\\${VOD_ID}_${i}.mp4`
    });
};

let videoConcat = videoStitch.concat;
videoConcat({
    //ffmpeg_path: "ffmpeg.exe", // Optional. Otherwise it will just use ffmpeg on your $PATH
    silent: true, // optional. if set to false, gives detailed output on console
    overwrite: true // optional. by default, if file already exists, ffmpeg will ask for overwriting in console and that pause the process. if set to true, it will force overwriting. if set to false it will prevent overwriting.
})
    .clips(fileNames)
    .output(`${VOD_ID}.mp4`) //optional absolute file name for output file
    .concat()
    .then((outputFileName) => {
        console.log(`Sucessfully created ${outputFileName}`);
    });



