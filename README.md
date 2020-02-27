# Solution Assistant

Dynamics 365 Solution Assistant is an Electron.js based app to provide a UI solution packager with additional feature planned. (WIP)

# Development Build

Simply run the following command.
<code> npm run electron:dev </code>

Note that your browser will display an error related to electron and will not display the site, only the Electron shell will display the application.

To debug Electron run the command above and then launch the debugger via Visual Studio Code using the included launch settings.

# Production Build

Split production build into multiple steps due to errors when combining the steps as one script.

<code> npm run webpack:Production </code>
<code> npm run build </code>
<code> npm run electron:pack </code>

# Demo

![Solution Assistant Demo](https://github.com/paulbreuler/SolutionAssistant/blob/master/github-wiki-media/sa_final_draft.gif)
