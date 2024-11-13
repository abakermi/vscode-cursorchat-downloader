// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { getWorkspaces } from './utils';
import { ChatTab } from "./types";
import { formatChatContent, safeParseTimestamp } from './utils';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('cursorchat-downloader.downloadChatHistory', async () => {
		try {
			const workspaces = await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "Loading workspaces...",
				cancellable: false,
			}, async (progress) => {
				// Get and filter workspaces
				let workspaces = await getWorkspaces();
				return workspaces.filter(ws => ws.chatCount > 0);
			});
	
			if (!workspaces || workspaces.length === 0) {
				vscode.window.showInformationMessage('No workspaces found with chat history.');
				return;
			}
	
			// Sort and display workspaces
			workspaces.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
			const workspaceItems = workspaces.map(ws => ({
				label: ws.folder ? path.basename(ws.folder) : ws.id,
				description: `${ws.chatCount} chats - Last modified: ${new Date(ws.lastModified).toLocaleDateString()}`,
				workspace: ws
			}));
	
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
	
	async function showChatList(workspace: any) {
		try {
			const chatResult = await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: `Loading chats for ${workspace.folder ? path.basename(workspace.folder) : workspace.id}...`,
				cancellable: false
			}, async () => {
				const db = await open({
					filename: workspace.path,
					driver: sqlite3.Database
				});
	
				const result = await db.get(`
					SELECT value FROM ItemTable 
					WHERE [key] = 'workbench.panel.aichat.view.aichat.chatdata'
				`);
	
				await db.close();
				return result;
			});
	
			if (!chatResult) {
				vscode.window.showInformationMessage('No chat data found for this workspace.');
				return;
			}
	
			const chatData = JSON.parse(chatResult.value);
			const tabs: ChatTab[] = chatData.tabs.map((tab: any) => ({
				id: tab.tabId,
				title: tab.chatTitle?.split('\n')[0] || `Chat ${tab.tabId.slice(0, 8)}`,
				timestamp: safeParseTimestamp(tab.lastSendTime),
				bubbles: tab.bubbles
			}));
	
			const chatItems = tabs.map(tab => ({
				label: tab.title,
				description: `Last updated: ${new Date(tab.timestamp).toLocaleString()}`,
				chat: tab
			}));
	
			const selectedChat = await vscode.window.showQuickPick(chatItems, {
				placeHolder: 'Select a chat to view',
				matchOnDescription: true
			});
	
			if (selectedChat) {
				await showChatDetails(selectedChat.chat);
			}
		} catch (error) {
			vscode.window.showErrorMessage('Failed to load chats: ' + error);
		}
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
