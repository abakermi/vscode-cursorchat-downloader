import path from 'path';
import fs from 'fs/promises';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { existsSync } from 'fs';
import os from 'os';

import { ChatTab } from './types';

export async function getWorkspaces() {
	const defaultPath = path.join(os.homedir(), 'Library/Application Support/Cursor/User/workspaceStorage');
	const workspacePath = process.env.WORKSPACE_PATH || defaultPath;
	const workspaces = [];
	
	const entries = await fs.readdir(workspacePath, { withFileTypes: true });
	
	for (const entry of entries) {
		if (entry.isDirectory()) {
			const dbPath = path.join(workspacePath, entry.name, 'state.vscdb');
			const workspaceJsonPath = path.join(workspacePath, entry.name, 'workspace.json');
			
			// Skip if state.vscdb doesn't exist
			if (!existsSync(dbPath)) {
				console.log(`Skipping ${entry.name}: no state.vscdb found`);
				continue;
			}
			
			try {
				const stats = await fs.stat(dbPath);
				const db = await open({
					filename: dbPath,
					driver: sqlite3.Database
				});
				
				const result = await db.get(`
					SELECT value FROM ItemTable 
					WHERE [key] IN ('workbench.panel.aichat.view.aichat.chatdata')
				`);
				
				// Parse the chat data and count tabs
				let chatCount = 0;
				if (result?.value) {
					try {
						const chatData = JSON.parse(result.value);
						chatCount = chatData.tabs?.length || 0;
					} catch (error) {
						console.error('Error parsing chat data:', error);
					}
				}
				
				// Try to read workspace.json
				let folder = undefined;
				try {
					const workspaceData = JSON.parse(await fs.readFile(workspaceJsonPath, 'utf-8'));
					folder = workspaceData.folder;
				} catch (error) {
					console.log(`No workspace.json found for ${entry.name}`);
				}
				
				workspaces.push({
					id: entry.name,
					path: dbPath,
					folder: folder,
					lastModified: stats.mtime.toISOString(),
					chatCount: chatCount
				});
				
				await db.close();
			} catch (error) {
				console.error(`Error processing workspace ${entry.name}:`, error);
			}
		}
	}
	
	return workspaces;
}

export function formatChatContent(chat: ChatTab): string {
	let content = `# ${chat.title}\n\n`;
	content += `Last Updated: ${new Date(chat.timestamp).toLocaleString()}\n\n`;

	if (chat.bubbles && chat.bubbles.length > 0) {
		chat.bubbles.forEach(bubble => {
			content += `## ${bubble.type === 'ai' ? `AI${bubble.modelType ? ` (${bubble.modelType})` : ''}` : 'User'}\n\n`;

			if (bubble.selections && bubble.selections.length > 0) {
				content += `### Selections:\n\n`;
				bubble.selections.forEach(selection => {
					content += '```\n';
					content += selection.text;
					content += '\n```\n\n';
				});
			}

			if (bubble.text) {
				content += bubble.text;
				content += '\n\n';
			}

			content += '---\n\n';
		});
	} else {
		content += 'No messages in this chat.\n';
	}

	return content;
}

export function safeParseTimestamp(timestamp: number | undefined): string {
	try {
		if (!timestamp) {
			return new Date().toISOString();
		}
		return new Date(timestamp).toISOString();
	} catch (error) {
		console.error('Error parsing timestamp:', error, 'Raw value:', timestamp);
		return new Date().toISOString();
	}
}