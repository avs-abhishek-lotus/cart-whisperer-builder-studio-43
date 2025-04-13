
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import { setApiKey, hasApiKey } from '@/utils/deepSeekService';
import { useRole } from '@/context/RoleContext';
import { toast } from '@/hooks/use-toast';

type ChatSettingsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ChatSettings: React.FC<ChatSettingsProps> = ({ open, onOpenChange }) => {
  const [apiKey, setApiKeyState] = useState('');
  const { role } = useRole();
  const isConfigurable = role === 'owner' || role === 'admin';

  useEffect(() => {
    // Initialize from local storage if available
    const savedKey = localStorage.getItem('deepseek_api_key');
    if (savedKey) {
      setApiKeyState(savedKey);
      setApiKey(savedKey);
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
