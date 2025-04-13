
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Settings, Info } from 'lucide-react';
import { setApiKey, hasApiKey, loadApiKeyFromStorage } from '@/utils/deepSeekService';
import { useRole } from '@/context/RoleContext';
import { toast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type ChatSettingsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ChatSettings: React.FC<ChatSettingsProps> = ({ open, onOpenChange }) => {
  const [apiKey, setApiKeyState] = useState('');
  const { role } = useRole();
  const isConfigurable = role === 'owner' || role === 'admin';

  useEffect(() => {
    // Use the new loadApiKeyFromStorage method
    const savedKey = localStorage.getItem('deepseek_api_key');
    if (savedKey) {
      setApiKeyState(savedKey);
      loadApiKeyFromStorage(); // This ensures the key is loaded globally
    }
  }, []);

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
                      <p className="mt-1">When messaging as an Agent, enable the "Use DeepSeek AI" option to get AI-assisted responses. The AI will help craft better responses for customers based on your message history.</p>
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
