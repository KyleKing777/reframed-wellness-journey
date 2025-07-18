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
  const { user } = useAuth();
  const { toast } = useToast();
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ChatbotLogs')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const generateBotResponse = (userMessage: string, mode: string): string => {
    // This is a placeholder for GPT integration
    // In a real app, this would call your GPT API
    
    const responses = {
      ACT: [
        "I hear you, and what you're feeling is completely valid. Remember, thoughts and feelings are like clouds - they come and go. What matters is how we choose to act in alignment with our values.",
        "Your recovery journey is unique to you. Every step forward, no matter how small, is an act of courage and self-compassion.",
        "It's natural to have difficult moments. What's one small thing you can do right now that aligns with caring for yourself?"
      ],
      CBT: [
        "Let's look at this thought together. Is there evidence for and against it? Sometimes our minds can play tricks on us, especially during recovery.",
        "I notice you might be having some challenging thoughts. Remember, thoughts are not facts. What would you tell a friend who was having this same thought?",
        "Recovery involves relearning how to think about food, your body, and yourself. Each positive choice you make is rewiring your brain for healing."
      ],
      DBT: [
        "What you're experiencing sounds really hard. Let's practice some grounding - can you name 5 things you can see around you right now?",
        "Your feelings are completely valid, and you're learning new ways to cope. What distress tolerance skill might be helpful right now?",
        "Recovery is about building a life worth living. You're doing the hard work of healing, and that takes incredible strength."
      ]
    };

    const modeResponses = responses[mode];
    return modeResponses[Math.floor(Math.random() * modeResponses.length)];
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !user) return;

    setIsLoading(true);
    
    try {
      // Generate bot response
      const botResponse = generateBotResponse(currentMessage, therapyMode);
      
      // Save to database
      const { error } = await supabase
        .from('ChatbotLogs')
        .insert({
          user_id: user.id,
          timestamp: new Date().toISOString(),
          message_user: currentMessage,
          message_bot: botResponse,
          context: 'support'
        });

      if (error) throw error;

      // Update local state
      const newMessage: Message = {
        id: Date.now(),
        message_user: currentMessage,
        message_bot: botResponse,
        timestamp: new Date().toISOString(),
        context: 'support'
      };

      setMessages(prev => [...prev, newMessage]);
      setCurrentMessage('');

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

  return (
    <div className="flex flex-col h-screen bg-gradient-calm">
      {/* Header */}
      <div className="p-4 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Support Chat</h1>
          </div>
          
          {/* Therapy Mode Selector */}
          <div className="flex gap-2">
            {(['ACT', 'CBT', 'DBT'] as const).map((mode) => {
              const Icon = therapyModeIcons[mode];
              return (
                <Button
                  key={mode}
                  variant={therapyMode === mode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTherapyMode(mode)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {mode}
                </Button>
              );
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
          {messages.length === 0 ? (
            <Card className="shadow-gentle">
              <CardContent className="pt-6 text-center py-8">
                <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Welcome to your safe space</h3>
                <p className="text-muted-foreground mb-4">
                  I'm here to provide support using {therapyMode} approaches. 
                  You can talk to me about anything - your feelings, challenges, or victories.
                </p>
                <p className="text-sm text-muted-foreground">
                  Remember: This is supplemental support. Please reach out to a healthcare 
                  professional if you're experiencing a crisis.
                </p>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="space-y-3">
                {/* User Message */}
                {message.message_user && (
                  <div className="flex justify-end">
                    <Card className="max-w-[80%] bg-primary text-primary-foreground">
                      <CardContent className="p-3">
                        <p className="text-sm">{message.message_user}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {/* Bot Message */}
                {message.message_bot && (
                  <div className="flex justify-start">
                    <Card className="max-w-[80%] shadow-gentle">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <Heart className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          <p className="text-sm">{message.message_bot}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ))
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
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
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-card/95 backdrop-blur-sm border-t border-border">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <Input
              placeholder="Share what's on your mind..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!currentMessage.trim() || isLoading}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;