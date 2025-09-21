import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Upload, 
  FileText, 
  Sparkles, 
  Send, 
  Bot,
  User,
  Languages,
  BookOpen,
  Download
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AIAssistantPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your AI learning assistant. I can help you create study notes from PDFs, answer questions, translate content, and much more. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [notePrompt, setNotePrompt] = useState('');
  const [translationText, setTranslationText] = useState('');
  const [translationResult, setTranslationResult] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('si');
  const fileInputRef = useRef(null);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response (in real implementation, this would call your AI service)
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: generateAIResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (message) => {
    const responses = [
      "I understand you're asking about that topic. Let me break it down for you in a clear and structured way...",
      "That's a great question! Here's what I can tell you about that subject...",
      "Based on your question, I'd recommend focusing on these key points...",
      "Let me help you understand this concept step by step...",
      "That's an interesting topic. Here are the main points you should know..."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      toast({
        title: "File Uploaded",
        description: `Successfully uploaded ${file.name}`,
      });
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file only",
        variant: "destructive",
      });
    }
  };

  const generateNotes = async () => {
    if (!uploadedFile && !notePrompt.trim()) {
      toast({
        title: "Missing Input",
        description: "Please upload a PDF or enter a prompt to generate notes",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate note generation
    setTimeout(() => {
      const notes = generateSampleNotes();
      const botMessage = {
        id: Date.now(),
        type: 'bot',
        content: `Here are your generated notes:\n\n${notes}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
      
      toast({
        title: "Notes Generated",
        description: "Your study notes have been created successfully!",
      });
    }, 2000);
  };

  const generateSampleNotes = () => {
    return `📝 **Study Notes Summary**

**Key Topics:**
• Introduction to the main concepts
• Important definitions and terminology
• Core principles and theories
• Practical applications and examples

**Main Points:**
1. **Concept A**: Brief explanation of the first major concept
2. **Concept B**: Overview of the second important topic
3. **Concept C**: Summary of the third key area

**Important Formulas/Facts:**
• Formula 1: Description and usage
• Formula 2: When and how to apply
• Key Fact: Important information to remember

**Study Tips:**
• Focus on understanding the core concepts
• Practice with examples and exercises
• Review regularly to reinforce learning
• Connect new information to existing knowledge

**Quick Review Questions:**
1. What is the main purpose of Concept A?
2. How does Concept B relate to Concept C?
3. When would you use Formula 1?

💡 **Remember**: These notes are a starting point. Make sure to review the original material for complete understanding.`;
  };

  const handleTranslation = async () => {
    if (!translationText.trim()) {
      toast({
        title: "Missing Text",
        description: "Please enter text to translate",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate translation
    setTimeout(() => {
      const mockTranslation = selectedLanguage === 'si' 
        ? "මෙය සිංහල පරිවර්තනයකි. (This is a Sinhala translation.)"
        : "This is an English translation of the Sinhala text.";
      
      setTranslationResult(mockTranslation);
      setIsLoading(false);
      
      toast({
        title: "Translation Complete",
        description: "Text has been translated successfully!",
      });
    }, 1000);
  };

  const downloadNotes = (content) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "study-notes.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="glass-effect rounded-xl p-6 neon-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">AI Learning Assistant</h1>
              <p className="text-muted-foreground">
                Your intelligent study companion powered by artificial intelligence {!user && '- Free to try!'}
              </p>
              {!user && (
                <div className="mt-2 p-2 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm text-accent">
                    🎉 Try our AI assistant for free! Sign up to save your chat history and unlock advanced features.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 glass-effect">
            <TabsTrigger value="chat" className="hover-glow">AI Chat</TabsTrigger>
            <TabsTrigger value="notes" className="hover-glow">Note Generator</TabsTrigger>
            <TabsTrigger value="translate" className="hover-glow">Translator</TabsTrigger>
          </TabsList>

          {/* AI Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Card className="glass-effect neon-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span>AI Chat Assistant</span>
                </CardTitle>
                <CardDescription>
                  Ask questions, get explanations, and receive study guidance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Messages */}
                <div className="h-96 overflow-y-auto space-y-4 p-4 glass-effect rounded-lg">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div className={`p-2 rounded-full ${
                        message.type === 'user' 
                          ? 'bg-primary/20' 
                          : 'bg-accent/20'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div className={`flex-1 p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-primary/10 text-right'
                          : 'bg-muted/50'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-accent/20">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex-1 p-3 rounded-lg bg-muted/50">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything about your studies..."
                    className="flex-1 neon-border hover-glow"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="neon-glow hover-glow"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Note Generator Tab */}
          <TabsContent value="notes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-effect neon-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-accent" />
                    <span>Generate Study Notes</span>
                  </CardTitle>
                  <CardDescription>
                    Upload a PDF or enter a topic to generate comprehensive study notes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload PDF Document</label>
                    <div className="flex items-center space-x-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="hover-glow"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose PDF
                      </Button>
                      {uploadedFile && (
                        <Badge variant="secondary" className="neon-glow">
                          {uploadedFile.name}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-center text-muted-foreground">OR</div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enter Topic/Prompt</label>
                    <Textarea
                      value={notePrompt}
                      onChange={(e) => setNotePrompt(e.target.value)}
                      placeholder="Enter a topic or specific questions you'd like notes on..."
                      className="neon-border hover-glow"
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={generateNotes}
                    disabled={isLoading}
                    className="w-full neon-glow hover-glow"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    {isLoading ? 'Generating Notes...' : 'Generate Notes'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-effect neon-border">
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm">PDF content extraction and analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <span className="text-sm">AI-powered summarization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-secondary" />
                      <span className="text-sm">Structured study notes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Download className="h-4 w-4 text-primary" />
                      <span className="text-sm">Downloadable formats</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Translator Tab */}
          <TabsContent value="translate" className="space-y-6">
            <Card className="glass-effect neon-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Languages className="h-5 w-5 text-primary" />
                  <span>Language Translator</span>
                </CardTitle>
                <CardDescription>
                  Translate between English and Sinhala for better understanding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">From</label>
                      <select 
                        className="w-full p-2 rounded-lg bg-background border border-border neon-border hover-glow"
                        value={selectedLanguage === 'si' ? 'en' : 'si'}
                        onChange={(e) => setSelectedLanguage(e.target.value === 'si' ? 'en' : 'si')}
                      >
                        <option value="en">English</option>
                        <option value="si">Sinhala</option>
                      </select>
                    </div>
                    <Textarea
                      value={translationText}
                      onChange={(e) => setTranslationText(e.target.value)}
                      placeholder="Enter text to translate..."
                      className="neon-border hover-glow"
                      rows={6}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">To</label>
                      <select 
                        className="w-full p-2 rounded-lg bg-background border border-border neon-border"
                        value={selectedLanguage}
                        disabled
                      >
                        <option value="si">Sinhala</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div className="min-h-[150px] p-3 rounded-lg glass-effect neon-border">
                      {translationResult ? (
                        <p className="whitespace-pre-wrap">{translationResult}</p>
                      ) : (
                        <p className="text-muted-foreground italic">Translation will appear here...</p>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleTranslation}
                  disabled={isLoading || !translationText.trim()}
                  className="w-full neon-glow hover-glow"
                >
                  <Languages className="h-4 w-4 mr-2" />
                  {isLoading ? 'Translating...' : 'Translate'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIAssistantPage;