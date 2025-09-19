
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { csvApi } from '@/services/api';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, RefreshCw } from 'lucide-react';

type CsvUploadFormProps = {
  onSuccess?: (data?: any) => void;
};

const CsvUploadForm = ({ onSuccess }: CsvUploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [dataType, setDataType] = useState<'recipes' | 'reviews' | 'users'>('recipes');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage('');
      
      // Check file size and warn if large
      const fileSize = e.target.files[0].size / (1024 * 1024); // Size in MB
      if (fileSize > 10) {
        toast.info(`Large file detected (${fileSize.toFixed(1)}MB). Import may take longer.`);
      }
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a CSV file to import');
      setErrorMessage('Please select a CSV file to import');
      return;
    }
    
    if (!file.name.endsWith('.csv')) {
      toast.error('Only CSV files are allowed');
      setErrorMessage('Only CSV files are allowed');
      return;
    }
    
    setIsImporting(true);
    setErrorMessage('');
    setProcessingStatus('Uploading file...');
    
    try {
      // First status update
      toast.info('Processing CSV file. This may take a while for large files.');
      setProcessingStatus('Processing data and cleaning text...');
      
      const response = await csvApi.quickImport(file, dataType, importMode === 'append');
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setProcessingStatus(`Successfully processed ${response.recordCount || 'all'} records.`);
      setImportSuccess(true);
      toast.success(`CSV data imported and processed successfully!`);
      
      // Reset file input
      setFile(null);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Import error:', error);
      setErrorMessage('Failed to import data. Please check if the server is running.');
      toast.error('Failed to import data');
      setImportSuccess(false);
      setProcessingStatus('');
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setImportSuccess(false);
    setErrorMessage('');
    setProcessingStatus('');
    
    const fileInput = document.getElementById('csv-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Upload CSV File</CardTitle>
        <CardDescription>
          Import your recipes, reviews, or users data from a CSV file
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {importSuccess && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Data has been successfully imported and processed.
              <p className="text-sm text-green-600 mt-1">{processingStatus}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2" 
                onClick={resetForm}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Import another file
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {!importSuccess && (
          <form onSubmit={handleImport} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">Select CSV File</Label>
              <Input 
                id="csv-file" 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
                disabled={isImporting}
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected file: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Data Type</Label>
              <Select 
                value={dataType} 
                onValueChange={(value) => setDataType(value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recipes">Recipes</SelectItem>
                  <SelectItem value="reviews">Reviews</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Import Mode</Label>
              <RadioGroup 
                value={importMode} 
                onValueChange={(value) => setImportMode(value as 'replace' | 'append')}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="replace" id="dr1" />
                  <Label htmlFor="dr1">Replace all existing data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="append" id="dr2" />
                  <Label htmlFor="dr2">Append to existing data</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={!file || isImporting}>
                {isImporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {processingStatus || 'Importing...'}
                  </>
                ) : 'Import CSV'}
              </Button>
            </div>
            
            {isImporting && processingStatus && (
              <p className="text-sm text-center text-muted-foreground mt-2">
                {processingStatus}
              </p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default CsvUploadForm;
