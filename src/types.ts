export interface ChatBubble {
	type: 'ai' | 'user';
	modelType?: string;
	text?: string;
	selections?: {
		text: string;
	}[];
}

export interface ChatTab {
	id: string;
	title: string;
	timestamp: string;
	bubbles: ChatBubble[];
}

export interface ComposerData {
	// Add composer data properties as needed
	[key: string]: any;
}
