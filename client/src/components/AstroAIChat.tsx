import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Clock, Brain, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  message: string;
  isFromUser: boolean;
  timestamp: Date;
}

export default function AstroAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      message: "🌟 Namaste! I'm Nakshatra AI, your celestial guide. Ask me about your astrology, compatibility, or cosmic influences. How can I illuminate your path today?",
      isFromUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", { message });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        message: data.response,
        isFromUser: false,
        timestamp: new Date(),
      }]);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        message: "✨ The stars are temporarily obscured. Please try again in a moment, and I'll be happy to share cosmic insights with you.",
        isFromUser: false,
        timestamp: new Date(),
      }]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = inputMessage.trim();
    
    if (!message) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message,
      isFromUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    // Get AI response
    chatMutation.mutate(message);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <section id="astroai" className="py-20 px-6 bg-card/20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Your Cosmic Confidante</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with our AI-powered astrologer for instant insights and guidance. Ask about your signs, compatibility, or any astrological questions.
          </p>
        </div>

        <Card className="cosmic-border overflow-hidden">
          {/* Chat Header */}
          <CardHeader className="bg-gradient-to-r from-secondary/20 to-accent/20 border-b border-border">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <Bot className="text-accent-foreground text-xl" />
              </div>
              <div>
                <CardTitle className="text-lg">Nakshatra AI</CardTitle>
                <p className="text-muted-foreground text-sm">Your celestial guide • Online</p>
              </div>
            </div>
          </CardHeader>

          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="h-96 overflow-y-auto p-6 space-y-4"
            data-testid="chat-container"
          >
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex items-start space-x-3 chat-message ${message.isFromUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  {message.isFromUser ? (
                    <User className="text-accent-foreground text-sm" />
                  ) : (
                    <Bot className="text-accent-foreground text-sm" />
                  )}
                </div>
                <div className={`rounded-2xl px-4 py-3 max-w-md ${
                  message.isFromUser 
                    ? 'bg-accent/20' 
                    : 'bg-secondary/20'
                }`}>
                  <p className="text-sm">{message.message}</p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {chatMutation.isPending && (
              <div className="flex items-start space-x-3 chat-message">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-accent-foreground text-sm" />
                </div>
                <div className="bg-secondary/20 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <CardContent className="p-6 border-t border-border">
            <form className="flex space-x-4" onSubmit={handleSubmit}>
              <Input
                type="text"
                placeholder="Ask about your signs, planets, or cosmic guidance..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1"
                disabled={chatMutation.isPending}
                data-testid="input-chat-message"
              />
              <Button 
                type="submit" 
                disabled={chatMutation.isPending || !inputMessage.trim()}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              ✨ Powered by advanced AI with deep astrological knowledge
            </p>
          </CardContent>
        </Card>

        {/* Chat Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <Clock className="text-2xl text-accent mb-3 mx-auto" />
              <h4 className="font-semibold mb-2">24/7 Availability</h4>
              <p className="text-muted-foreground text-sm">Get cosmic guidance anytime, day or night</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Brain className="text-2xl text-secondary mb-3 mx-auto" />
              <h4 className="font-semibold mb-2">Ancient Wisdom</h4>
              <p className="text-muted-foreground text-sm">AI trained on thousands of years of astrological knowledge</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Lock className="text-2xl text-accent mb-3 mx-auto" />
              <h4 className="font-semibold mb-2">Private & Secure</h4>
              <p className="text-muted-foreground text-sm">Your cosmic conversations remain confidential</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
