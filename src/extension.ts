// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { getWorkspaces } from './utils';
import {  ChatTab } from "./types";
import { formatChatContent, safeParseTimestamp } from './utils';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "cursorchat-downloader" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('cursorchat-downloader.downloadChatHistory', async () => {
		try {
			// Show loading message
			vscode.window.showInformationMessage('Loading workspace list...');

			// Get workspaces
			const workspaces = await getWorkspaces();

			// Create QuickPick items for workspaces
			const workspaceItems = workspaces.map(ws => ({
				label: ws.folder || ws.id,
				description: `${ws.chatCount} chats - Last modified: ${new Date(ws.lastModified).toLocaleDateString()}`,
				workspace: ws
			}));

			// Show workspace QuickPick
			const selectedWorkspace = await vscode.window.showQuickPick(workspaceItems, {
				placeHolder: 'Select a workspace to view chats'
			});

			if (selectedWorkspace) {
				await showChatList(selectedWorkspace.workspace);
			}
		} catch (error) {
			vscode.window.showErrorMessage('Failed to load workspaces: ' + error);
		}
	});

	context.subscriptions.push(disposable);
}

async function showChatList(workspace: any) {
	try {
		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: `Loading chats for ${workspace.folder || workspace.id}...`,
			cancellable: false
		}, async (progress) => {
			const db = await open({
				filename: workspace.path,
				driver: sqlite3.Database
			});

			// Get chat data
			const chatResult = await db.get(`
				SELECT value FROM ItemTable 
				WHERE [key] = 'workbench.panel.aichat.view.aichat.chatdata'
			`);

			// Get composer data
			const composerResult = await db.get(`
				SELECT value FROM ItemTable 
				WHERE [key] = 'composer.composerData'
			`);

			await db.close();

			if (!chatResult && !composerResult) {
				vscode.window.showInformationMessage('No chat data found for this workspace.');
				return;
			}

			const chatData = chatResult ? JSON.parse(chatResult.value) : { tabs: [] };
			const composerData = composerResult ? JSON.parse(composerResult.value) : undefined;
			console.log('Chat data:', chatData.tabs[0]);

			// Process chat tabs
			const tabs: ChatTab[] = chatData.tabs.map((tab: any) => ({
				id: tab.tabId,
				title: tab.chatTitle?.split('\n')[0] || `Chat ${tab.tabId.slice(0, 8)}`,
				timestamp: safeParseTimestamp(tab.lastSendTime),
				bubbles: tab.bubbles
			}));

			// Create QuickPick items for chats
			const chatItems = tabs.map(tab => ({
				label: tab.title,
				description: `Last updated: ${new Date(tab.timestamp).toLocaleString()}`,
				chat: tab
			}));

			// Show chat QuickPick
			const selectedChat = await vscode.window.showQuickPick(chatItems, {
				placeHolder: 'Select a chat to view',
				matchOnDescription: true
			});

			if (selectedChat) {
				await showChatDetails(selectedChat.chat);
			}
		});
	} catch (error) {
		vscode.window.showErrorMessage('Failed to load chats: ' + error);
	}
}



async function showChatDetails(chat: ChatTab) {
	try {
		const document = await vscode.workspace.openTextDocument({
			content: formatChatContent(chat),
			language: 'markdown'
		});

		await vscode.window.showTextDocument(document);
	} catch (error) {
		vscode.window.showErrorMessage('Failed to show chat details: ' + error);
	}
}



// This method is called when your extension is deactivated
export function deactivate() { }
