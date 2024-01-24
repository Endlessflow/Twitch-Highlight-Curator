# Twitch Chat Analyzer and Clip Compiler

## Description
This Node.js script is designed for educational purposes as part of a personal project. It automates the process of downloading, parsing, and analyzing Twitch VOD chat logs. Key features include:
- **Chat Log Downloading**: Downloads the chat logs of a specified Twitch VOD.
- **Chat Analysis**: Parses the chat logs, calculating the frequency and increase of chat messages over time.
- **Clip Generation**: Based on the analysis, the script identifies and downloads key moments of the VOD as clips.
- **Clip Compilation**: Compiles these clips into a single video file.

## Technologies
- Node.js
- Libraries: `fs`, `objects-to-csv`, `child_process`, `video-stitch`

## Installation and Setup
1. Ensure Node.js is installed on your system.
2. Clone this repository or download the script.
3. Install the necessary Node.js packages:
   ```
   npm install fs objects-to-csv child_process video-stitch
   ```
5. Place the executable for [ffmpeg](https://ffmpeg.org/download.html) and [Twitch Downloader](https://github.com/lay295/TwitchDownloader) in the same directory as the script.
6. Set the `VOD_ID` variable in the script to the ID of the Twitch VOD you want to analyze.
5. (Optional) Adjust the `FACTOR` variable to change the sensitivity of the clip selection process.

## Usage
Run the script with Node.js:
```
node index.js
```
This will execute the script using the specified VOD ID. The script performs the following operations in order:
- Downloads the chat log of the VOD.
- Parses and analyzes the chat data.
- Filters and identifies key moments for clip generation.
- Downloads the clips and compiles them into a single video.

## Note
This project is intended for educational purposes and demonstrates the use of Node.js for automating content analysis and manipulation.