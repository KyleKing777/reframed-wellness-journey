import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Heart, Brain, Lightbulb } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
interface Message {
  id: number;
  message_user: string | null;
  message_bot: string | null;
  timestamp: string;
  context: string | null;
}
const Chat = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [therapyMode, setTherapyMode] = useState<'ACT' | 'CBT' | 'DBT'>('ACT');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    fetchChatHistory();
  }, [user]);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  const fetchChatHistory = async () => {
    if (!user) return;
    try {
      const {
        data,
        error
      } = await supabase.from('ChatbotLogs').select('*').eq('user_id', user.id).order('timestamp', {
        ascending: true
      }).limit(50);
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };
  const sendMessage = async () => {
    if (!currentMessage.trim() || !user) return;
    setIsLoading(true);
    try {
      console.log(`Sending message with ${therapyMode} mode`);

      // Call the AI chat function
      const {
        data,
        error
      } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: currentMessage,
          therapyMode: therapyMode,
          userId: user.id
        }
      });
      console.log("Function data:", data);
console.log("Function error:", error);

if (error) {
  throw error;
}
if (!data || !data.response) {
  throw new Error("No response returned from chat function");
}

const botResponse = data.response;

      // Save to database
      const {
        error: dbError
      } = await supabase.from('ChatbotLogs').insert({
        user_id: user.id,
        timestamp: new Date().toISOString(),
        message_user: currentMessage,
        message_bot: botResponse,
        context: therapyMode.toLowerCase()
      });
      if (dbError) throw dbError;

      // Update local state
      const newMessage: Message = {
        id: Date.now(),
        message_user: currentMessage,
        message_bot: botResponse,
        timestamp: new Date().toISOString(),
        context: therapyMode.toLowerCase()
      };
      setMessages(prev => [...prev, newMessage]);
      setCurrentMessage('');
      console.log('Message sent and saved successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  const therapyModeIcons = {
    ACT: Heart,
    CBT: Brain,
    DBT: Lightbulb
  };
  const therapyModeDescriptions = {
    ACT: "Acceptance & Commitment Therapy - Focus on values and mindful acceptance",
    CBT: "Cognitive Behavioral Therapy - Examine thoughts and change patterns",
    DBT: "Dialectical Behavior Therapy - Emotional regulation and distress tolerance"
  };
  return <div className="flex flex-col h-screen bg-gradient-calm">
      {/* Header */}
      <div className="p-4 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Support Chat</h1>
          </div>
          
          {/* Therapy Mode Selector */}
          <div className="flex gap-2">
            {(['ACT', 'CBT', 'DBT'] as const).map(mode => {
            const Icon = therapyModeIcons[mode];
            return <Button key={mode} variant={therapyMode === mode ? 'default' : 'outline'} size="sm" onClick={() => setTherapyMode(mode)} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {mode}
                </Button>;
          })}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {therapyModeDescriptions[therapyMode]}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 ? <Card className="shadow-gentle">
              
            </Card> : messages.map(message => <div key={message.id} className="space-y-3">
                {/* User Message */}
                {message.message_user && <div className="flex justify-end">
                    <Card className="max-w-[80%] bg-primary text-primary-foreground">
                      <CardContent className="p-3">
                        <p className="text-sm">{message.message_user}</p>
                      </CardContent>
                    </Card>
                  </div>}
                
                {/* Bot Message */}
                {message.message_bot && <div className="flex justify-start">
                    <Card className="max-w-[80%] shadow-gentle">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <Heart className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          <p className="text-sm">{message.message_bot}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>}
              </div>)}
          
          {/* Loading indicator */}
          {isLoading && <div className="flex justify-start">
              <Card className="max-w-[80%] shadow-gentle">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-card/95 backdrop-blur-sm border-t border-border">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <Input placeholder="Share what's on your mind..." value={currentMessage} onChange={e => setCurrentMessage(e.target.value)} onKeyPress={handleKeyPress} disabled={isLoading} className="flex-1" />
            <Button onClick={sendMessage} disabled={!currentMessage.trim() || isLoading} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default Chat;