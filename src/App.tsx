import React, { useState, useRef, useEffect } from 'react';
import { Upload, Send, Table, FileText } from 'lucide-react';
import Papa from 'papaparse';
import { Message, TableData, TableRow } from './types';
import { ChatMessage } from './components/ChatMessage';
import { DataTable } from './components/DataTable';
import { ContentPreview } from './components/ContentPreview';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function App() {

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Please upload a CSV file to get started. I can help you analyze the data.',
    },
  ]);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load ementa_data.csv by default
    fetch('/ementa_data.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          complete: (results) => {
            const headers = results.data[0] as string[];
            const rows = results.data.slice(1) as string[][];
            
            // Filter out empty rows
            const validRows = rows.filter(row => row.some(cell => cell.trim() !== ''));
            
            setTableData({ headers, rows: validRows });
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              type: 'bot',
              content: `Por padrão, eu carrego o arquivo CSV com ${validRows.length} linhas e ${headers.length} colunas. O que gostaria de saber sobre os dados?`
            }]);
          },
          error: (error: any) => {
            console.error('Error loading default CSV:', error);
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              type: 'bot',
              content: 'Failed to load the default CSV file. You can upload a file manually using the upload button.'
            }]);
          }
        });
      })
      .catch(error => {
        console.error('Error fetching CSV:', error);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'bot',
          content: 'Failed to load the default CSV file. You can upload a file manually using the upload button.'
        }]);
      });
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const headers = results.data[0] as string[];
        console.log(headers)
        const rows = results.data.slice(1) as string[][];

        // Filter out empty rows
        const validRows = rows.filter(row => row.some(cell => cell.trim() !== ''));

        setTableData({ headers, rows: validRows });
      //   setMessages(prev => [...prev, {
      //     id: Date.now().toString(),
      //     type: 'bot',
      //     content: `Por padrão, eu carrego o arquivo CSV com ${validRows.length} linhas e ${headers.length} colunas. O que gostaria de saber sobre os dados?`
      //   }]);
      },
      header: false
    });
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!input.trim()) return;

  //   const newMessage: Message = {
  //     id: Date.now().toString(),
  //     type: 'user',
  //     content: input
  //   };

  //   setMessages(prev => [...prev, newMessage]);
  //   setInput('');

  //   setTimeout(() => {
  //     const botResponse: Message = {
  //       id: (Date.now() + 1).toString(),
  //       type: 'bot',
  //       content: `I see you're asking about "${input}". What specific information would you like to know about the data?`
  //     };
  //     setMessages(prev => [...prev, botResponse]);
  //   }, 1000);
  // };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || !tableData) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: input,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Create a context string from the table data
      const tableContext = `This is a CSV file with the following headers: ${tableData.headers.join(', ')}. 
        It contains ${tableData.rows.length} rows of data.`;

      // Get response from Gemini
      const prompt = `You are a helpful assistant analyzing CSV data. 
        
        Você é um robô informativo que responde perguntas sobre normas (regulations) da ANM em português 
        a que você possui acesso a partir da seguinte tabela: ${tableContext}.

        O usuário fará perguntas sobre as normas da ANM. Garanta fornecer respostas objetivas.
        As normas(regulations) possuem uma ementa e um corpo. Aproveite a ementa para responder 
        a pergunta do usuário pois ele fornece o assunto da norma.

        Ao responder o usuário, seja preciso e garanta citar corretamente o número da norma, as seções, 
        artigos, parágrafos relevantes para a resposta.
        
        Se a pergunta for genérica, ou se você não conseguir responder de modo preciso, 
        reponda da seguinte forma: 
        'Desculpe, mas não consegui achar uma resposta clara para a sua pergunta. 
        Mas está aqui uma resposta aproximada que pode ajudar: \n\n'. 
        
        Siga o seguinte template de resposta. Formate a resposta como markdown:
        
        ### Tipo de Norma:
          
        ### Número da Norma:

        ### Data de publicação:

        ### Seções, artigos, parágrafos relacionados:

        ### Sumário da norma: 

        ### Resposta:

        A resposta deve ser escrita em português e o sumário deve ter no máximo 50 palavras.
        
        Pergunta do usuário: ${input}
        
        Por favor, lembre-se de responder de forma clara e objetiva, e tomando como referência a tabela de dados fornecida.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Add AI response
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: text,
      }]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
      }]);
    }

    // Scroll to bottom of chat
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleRowClick = (row: TableRow, index: number) => {
    setSelectedRow(row);
    setSelectedRowIndex(index);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="h-screen flex">
        {/* Left Panel - Chat Interface */}
        <div className="w-1/3 p-4 flex flex-col">
          <div className="bg-white rounded-lg shadow-lg flex-1 flex flex-col overflow-hidden">
            <div className="p-4 bg-blue-600 text-white flex items-center gap-2">
              <h1 className="text-xl font-semibold">CSV Data Assistant</h1>
            </div>

            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto"
            >
              {messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>

            <div className="p-4 border-t">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Upload CSV"
                >
                  <Upload size={20} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask something about your data..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={!input.trim()}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Middle Panel - Data Table */}
        <div className="w-1/3 p-4 flex flex-col">
          <div className="bg-white rounded-lg shadow-lg flex-1 flex flex-col overflow-hidden">
            <div className="p-4 bg-blue-600 text-white flex items-center gap-2">
              <Table size={20} />
              <h2 className="text-xl font-semibold">Data Preview</h2>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {tableData ? (
                <DataTable
                  data={tableData}
                  onRowClick={handleRowClick}
                  selectedRowIndex={selectedRowIndex}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>Upload a CSV file to view data</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Content Preview */}
        <div className="w-2/3 p-4 flex flex-col">
          <div className="bg-white rounded-lg shadow-lg flex-1 flex flex-col overflow-hidden">
            <div className="p-4 bg-blue-600 text-white flex items-center gap-2">
              <FileText size={20} />
              <h2 className="text-xl font-semibold">Content Preview</h2>
            </div>
            <div className="flex-1 overflow-auto">
              <ContentPreview
                data={selectedRow}
                onClose={() => {
                  setSelectedRow(null);
                  setSelectedRowIndex(null);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;