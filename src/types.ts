export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface TableRow {
  [key: string]: string;
}