
import { useState, useEffect } from 'react';
import { checkApiHealth, fixJsonData, recreateJsonFromCsv } from '@/services/healthCheck';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const ApiHealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFixing, setIsFixing] = useState(false);
  const [isRecreating, setIsRecreating] = useState(false);
  const [recordLimit, setRecordLimit] = useState<number>(0);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await checkApiHealth();
        setHealthStatus('healthy');
      } catch (error) {
        setHealthStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    checkHealth();
  }, []);

  const handleFixJsonData = async (file?: string) => {
    setIsFixing(true);
    try {
      const result = await fixJsonData(file);
      toast.success(`JSON data ${file ? `for ${file}` : 'files'} fixed successfully`);
      console.log('Fix result:', result);
    } catch (error) {
      toast.error(`Failed to fix JSON data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsFixing(false);
    }
  };

  const handleRecreateFromCsv = async () => {
    setIsRecreating(true);
    try {
      const result = await recreateJsonFromCsv(recordLimit);
      toast.success(`Successfully recreated JSON data from CSV files${recordLimit > 0 ? ` (limit: ${recordLimit} records)` : ' (all records)'}`);
      console.log('Recreate result:', result);
    } catch (error) {
      toast.error(`Failed to recreate JSON data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRecreating(false);
    }
  };

  if (healthStatus === 'checking') {
    return <p className="text-center py-4">Checking API connection...</p>;
  }

  if (healthStatus === 'error') {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>API Connection Error</AlertTitle>
        <AlertDescription>
          {errorMessage || 'Could not connect to the API. Please make sure the server is running.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-green-50 border-green-200">
        <AlertTitle>API Connected</AlertTitle>
        <AlertDescription>Successfully connected to the API</AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Fix JSON Data</h3>
        <p className="text-sm text-muted-foreground">
          Fix issues with JSON data files including malformed arrays and missing brackets.
        </p>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => handleFixJsonData()} 
            disabled={isFixing}
            variant="outline"
          >
            {isFixing ? 'Fixing...' : 'Fix All JSON Files'}
          </Button>
          
          <Button
            onClick={() => handleFixJsonData('recipes')}
            disabled={isFixing}
            variant="outline"
          >
            Fix Recipes JSON
          </Button>
          
          <Button
            onClick={() => handleFixJsonData('reviews')}
            disabled={isFixing}
            variant="outline"
          >
            Fix Reviews JSON
          </Button>
          
          <Button
            onClick={() => handleFixJsonData('users')}
            disabled={isFixing}
            variant="outline"
          >
            Fix Users JSON
          </Button>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Recreate from CSV</h3>
        <p className="text-sm text-muted-foreground">
          Process all CSV files (recipes, reviews, users) simultaneously to create clean JSON files.
        </p>
        
        <div className="grid gap-4">
          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="recordLimit">Record Limit (0 = all records)</Label>
              <Input
                id="recordLimit"
                type="number"
                value={recordLimit}
                onChange={(e) => setRecordLimit(parseInt(e.target.value) || 0)}
                min="0"
                placeholder="Enter record limit (0 for all records)"
              />
            </div>
            
            <Button
              onClick={handleRecreateFromCsv}
              disabled={isRecreating}
              variant="secondary"
              className="mb-[1px]"
            >
              {isRecreating ? 'Processing...' : 'Recreate All from CSV'}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Note: Processing all records may take some time for very large CSV files.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiHealthCheck;
