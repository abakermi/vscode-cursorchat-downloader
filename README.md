
# CursorChat History Viewer


[![Version](https://img.shields.io/visual-studio-marketplace/v/abdelhakakermi.cursorchat-downloader)](https://marketplace.visualstudio.com/items/abdelhakakermi.cursorchat-downloader/changelog) [![Installs](https://img.shields.io/visual-studio-marketplace/i/abdelhakakermi.cursorchat-downloader)](https://marketplace.visualstudio.com/items?itemName=abdelhakakermi.cursorchat-downloader) [![Downloads](https://img.shields.io/visual-studio-marketplace/d/abdelhakakermi.cursorchat-downloader)](https://marketplace.visualstudio.com/items?itemName=abdelhakakermi.cursorchat-downloader) [![Rating Star](https://img.shields.io/visual-studio-marketplace/stars/abdelhakakermi.cursorchat-downloader)](https://marketplace.visualstudio.com/items?itemName=abdelhakakermi.cursorchat-downloader&ssr=false#review-details) [![Last Updated](https://img.shields.io/visual-studio-marketplace/last-updated/abdelhakakermi.cursorchat-downloader)](https://github.com/abakermi/cursorchat-downloader)

<table>
<tr>
<td><img width="100" src="./images/icon.png" /></td>
<td>View and browse your Cursor AI chat history directly in VS Code. This extension allows you to access all your AI conversations across different workspaces, making it easy to reference past discussions and code solutions.</td>

</tr>
</table>



> Heavily inspired by [Cursor Chat Browser](https://github.com/thomas-pedersen/cursor-chat-browser) by Thomas Pedersen.



## Features

- 🔍 **Workspace Browser**: Access chat history from all your Cursor workspaces in one place
- 💬 **Complete Chat History**: View full conversations including:
  - AI responses with model details (GPT-4, Claude, etc.)
  - Code snippets and file selections
  - Your messages and queries
- ✨ **Clean Formatting**: 
  - Syntax-highlighted code blocks
  - Markdown-formatted conversations
  - Clear separation between messages
- 🚀 **Easy Access**: Quick command palette integration

## How to Use

1. Open Command Palette (`Cmd/Ctrl + Shift + P`)
2. Type "View Cursor Chat History"
3. Select a workspace from the list
4. Choose a chat to view its contents

The chat will open in a new editor tab with proper formatting and syntax highlighting.

## Requirements

- Visual Studio Code 1.95.0 or higher
- Cursor Editor installed locally
- Existing chat history in Cursor

## Known Limitations

- Currently supports macOS paths only

### No Workspaces Found
- Ensure Cursor is installed
- Check if you have any chat history in Cursor
- Verify the path: `~/Library/Application Support/Cursor/User/workspaceStorage`




## Contributing

Found a bug or have a suggestion? Please open an issue on our [GitHub repository](https://github.com/abakermi/cursorchat-downloader).

## License

This extension is licensed under the [MIT License](LICENSE).
