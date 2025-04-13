
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Settings, Info, Database } from 'lucide-react';
import { setApiKey, hasApiKey, loadApiKeyFromStorage, initializeDeepSeekConnection } from '@/utils/deepSeekService';
import { useRole } from '@/context/RoleContext';
import { toast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type ChatSettingsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ChatSettings: React.FC<ChatSettingsProps> = ({ open, onOpenChange }) => {
  const [apiKey, setApiKeyState] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { role } = useRole();
  const isConfigurable = role === 'owner' || role === 'admin';

  useEffect(() => {
    // Use the loadApiKeyFromStorage method
    const savedKey = localStorage.getItem('deepseek_api_key');
    if (savedKey) {
      setApiKeyState(savedKey);
      loadApiKeyFromStorage(); // This ensures the key is loaded globally
      
      // Check connection status
      checkConnection();
    }
  }, []);
  
  const checkConnection = async () => {
    if (hasApiKey()) {
      const success = await initializeDeepSeekConnection();
      setIsConnected(success);
    } else {
      setIsConnected(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // First save the API key
      setApiKey(apiKey);
      localStorage.setItem('deepseek_api_key', apiKey);
      
      // Then initialize the connection
      const success = await initializeDeepSeekConnection();
      setIsConnected(success);
      
      if (success) {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to DeepSeek with product database access.",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to DeepSeek. Please check your API key.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error connecting to DeepSeek:", error);
      toast({
        title: "Connection Error",
        description: "An error occurred while connecting to DeepSeek.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSave = () => {
    // Save to both state and utility
    setApiKey(apiKey);
    localStorage.setItem('deepseek_api_key', apiKey);
    toast({
      title: "Settings Saved",
      description: "DeepSeek API key has been saved.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Chat Settings
          </DialogTitle>
        </DialogHeader>
        
        {isConfigurable ? (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="api-key" className="text-sm font-medium">
                DeepSeek API Key
              </label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your DeepSeek API key"
                value={apiKey}
                onChange={(e) => setApiKeyState(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally and is never sent to our servers.
              </p>
              
              <div className="mt-3 flex items-center gap-2">
                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting || !apiKey} 
                  size="sm"
                  variant={isConnected ? "outline" : "default"}
                  className="flex gap-2 items-center"
                >
                  <Database className="h-4 w-4" />
                  {isConnecting ? "Connecting..." : isConnected ? "Connected to Database" : "Initialize Database Connection"}
                </Button>
                
                {isConnected && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Connected
                  </span>
                )}
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="chat-roles">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center">
                    <Info className="mr-2 h-4 w-4" />
                    About Chat Roles
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><span className="font-medium">Visitor:</span> Messages sent as a website visitor/customer</p>
                    <p><span className="font-medium">Agent:</span> Messages sent as a customer support agent</p>
                    <p><span className="font-medium">DeepSeek AI:</span> Enhance agent responses using AI (requires API key)</p>
                    <div className="mt-4 text-xs bg-blue-50 p-2 rounded border border-blue-100">
                      <p className="font-medium text-blue-700">How to use AI assistance:</p>
                      <p className="mt-1">When messaging as an Agent, enable the "Use DeepSeek AI" option to get AI-assisted responses. The AI will help craft better responses based on the entire conversation history, including product information and customer context.</p>
                      <p className="mt-1">The DeepSeek AI will see the full conversation history, including all messages from both visitors and agents.</p>
                      <p className="mt-2 font-medium text-blue-700">AI Product Database:</p>
                      <p className="mt-1">DeepSeek AI is now connected to our product database and can query it to provide accurate product recommendations based on customer queries. It can analyze customer messages to extract details like age, budget, and use case to find the most appropriate products.</p>
                      <p className="mt-1">When customers ask about products for specific age groups (e.g., "for my 8-year-old daughter"), the AI will automatically query the database and recommend age-appropriate items.</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            Only admin or owner roles can configure chat settings.
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {isConfigurable && (
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChatSettings;
