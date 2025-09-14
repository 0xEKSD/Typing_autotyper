# [Typing.com](Typing.com "Typing.com") Autotyper

This is a simple Puppeteer script that automates logging into typing.com (student) and complete available custom lessons by simulating human typing with random delays.

## Overview

This project launches a Chromium-compatible browser (configured to use Brave by default), logs in using credentials from a local `.env` file, navigates to the custom lessons tab and types through a lesson automatically.

## Requirements

- git
- Node.js >= 18 (the project uses top-level await and module type)
- npm
- Brave or Chromium/Chrome installed (path configured in `.env`)

## Installation

Clone this project on to your machine and move to root of the project:

```bash
git clone https://github.com/0xEKSD/Typing_autotyper.git
cd Typing_autotyper
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
Typing_USERNAME=your@email
Typing_PASSWORD=your_password
BROWSER_EXECUTABLE_PATH=your_chromium_browser_path
```

**Notes:**
- Use the `Typing_` prefix to avoid collisions with common OS environment variables (e.g. `USERNAME`).
- If you don't know what's your browser path is, check out the `browser_paths.txt` file. it have common browser executable paths for Linux and Windows.

## Configuration

### Speed
The typing speed is randomized between 150ms and 250ms per keystroke by default.
You can adjust this range in index.js: 

```javascript
const typingSpeed = getRandomSpeed(150, 250);
```

For example:

Faster typing:

```javascript
const typingSpeed = getRandomSpeed(50, 100);
```

Slower typing:

```javascript
const typingSpeed = getRandomSpeed(300, 500);
```

### Headless vs Non-Headless Mode
By default, the script runs Brave in headless mode (invisible).
If you want to watch the bot typing in real time, change this line in index.js:

```javascript
const browser = await puppeteer.launch({
    executablePath: browserExecutablePath,
    headless: true, // change this to false
    args: ["--no-sandbox"]
});
```
Set `headless: false` to run in visible mode.

## Usage

Run the script with:

```bash
node index.js
```

It will:

1. Open a browser in headless mode.
2. Log into your typing.com account.
3. Navigate to custom lessons.
4. Start or resume an available lesson.
5. Simulate typing until the lesson is complete.

## Logs

Logs are output in JSON format with timestamps and emoji indicators, e.g.:

```json
{"timestamp":"2025-09-14T12:00:00.000Z","message":"Login successful","emoji":"✅"}
```

## Dependencies

* [puppeteer-core](https://pptr.dev/) – Headless browser automation.
* [dotenv](https://github.com/motdotla/dotenv) – Loads environment variables from `.env`.

## License

This project is licensed under the **Apache-2.0 License**.