// components/CSVImport.tsx - Fixed version
import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  History
} from 'lucide-react';
import { apiService } from '@/lib/api';
import type { CSVImportPreview, CSVImportResult } from '@/lib/api';
interface CSVImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CSVImport: React.FC<CSVImportProps> = ({ open, onOpenChange, onSuccess }) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<CSVImportPreview | null>(null);
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setCsvFile(file);
      setPreview(null);
      setImportResult(null);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handlePreview = async () => {
    if (!csvFile) {
      alert('Please select a CSV file first');
      return;
    }

    setIsLoading(true);
    setUploadProgress(30);

    try {
      const response = await apiService.importCSV(csvFile, { preview: true });

      if (response.success) {
        setPreview(response.data as CSVImportPreview);
        setActiveTab('preview');
      } else {
        alert(response.message || 'Failed to preview CSV');
      }
    } catch (error) {
      console.error('Preview error:', error);
      alert('Failed to preview CSV file');
    } finally {
      setIsLoading(false);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleImport = async (updateExisting: boolean = false, skipDuplicates: boolean = true) => {
    if (!csvFile) return;

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const response = await apiService.importCSV(csvFile, {
        preview: false,
        updateExisting,
        skipDuplicates
      });

      if (response.success) {
        setImportResult(response.data as CSVImportResult);
        setActiveTab('result');
        if (onSuccess) onSuccess();
      } else {
        alert(response.message || 'Failed to import CSV');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import CSV file');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      await apiService.downloadCSVTemplate();
    } catch (error) {
      console.error('Template download error:', error);
      alert('Failed to download template');
    }
  };

  const resetForm = () => {
    setCsvFile(null);
    setPreview(null);
    setImportResult(null);
    setActiveTab('upload');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            <span>Import Products from CSV</span>
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import products. Download the template for correct format.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
         {/* <TabsTrigger value="preview" disabled={!preview}>Preview</TabsTrigger>
            <TabsTrigger value="result" disabled={!importResult}>Result</TabsTrigger> */}
          </TabsList>

          <TabsContent value="upload" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 1: Download Template</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={downloadTemplate} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Download the template to see the correct format. Fill in your product data.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 2: Upload CSV File</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    csvFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {csvFile ? (
                    <>
                      <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-3" />
                      <p className="font-medium text-green-700">{csvFile.name}</p>
                      <p className="text-sm text-green-600 mt-1">
                        {(csvFile.size / 1024).toFixed(2)} KB
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetForm();
                        }}
                        className="mt-2"
                      >
                        Change File
                      </Button>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="font-medium">Click to select CSV file</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Maximum file size: 10MB
                      </p>
                    </>
                  )}
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-4">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-sm text-gray-500 mt-1 text-center">
                      Processing...
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePreview}
                    disabled={!csvFile || isLoading}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 mt-4">
            {preview && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-500">Total Rows</p>
                      <p className="text-2xl font-bold">{preview.summary.totalRows}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-500">Valid Products</p>
                      <p className="text-2xl font-bold text-green-600">
                        {preview.summary.validProducts}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-500">Duplicates Found</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {preview.summary.duplicateCount}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-500">Errors</p>
                      <p className="text-2xl font-bold text-red-600">
                        {preview.summary.errorCount}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Sample Products */}
                {preview.sampleProducts && preview.sampleProducts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Sample Products (First 10)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Name</th>
                              <th className="text-left py-2">SKU</th>
                              <th className="text-right py-2">Price</th>
                              <th className="text-right py-2">Stock</th>
                              <th className="text-left py-2">Category</th>
                            </tr>
                          </thead>
                          <tbody>
                            {preview.sampleProducts.slice(0, 10).map((product, idx) => (
                              <tr key={idx} className="border-b">
                                <td className="py-2">{product.name}</td>
                                <td className="py-2 font-mono text-xs">{product.sku}</td>
                                <td className="py-2 text-right">₹{product.sellingPrice}</td>
                                <td className="py-2 text-right">{product.currentStock}</td>
                                <td className="py-2">{product.category}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Duplicates */}
                {preview.duplicates && preview.duplicates.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                        Duplicate Products ({preview.duplicates.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Product</th>
                              <th className="text-left py-2">Reason</th>
                            </tr>
                          </thead>
                          <tbody>
                            {preview.duplicates.slice(0, 10).map((dup, idx) => (
                              <tr key={idx} className="border-b">
                                <td className="py-2">{dup.product.name}</td>
                                <td className="py-2 text-yellow-600">{dup.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Errors */}
                {preview.errors && preview.errors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <XCircle className="h-4 w-4 text-red-600 mr-2" />
                        Validation Errors ({preview.errors.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {preview.errors.slice(0, 10).map((error, idx) => (
                          <div key={idx} className="p-2 bg-red-50 rounded text-sm">
                            <p className="font-medium">Row {error.row}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {error.errors.map((err, i) => (
                                <Badge key={i} variant="destructive">
                                  {err}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setActiveTab('upload')}>
                    Back
                  </Button>
                  <Button
                    onClick={() => handleImport(false, true)}
                    disabled={isLoading || preview.summary.validProducts === 0}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import New Products Only
                      </>
                    )}
                  </Button>
                  {preview.summary.duplicateCount > 0 && (
                    <Button
                      onClick={() => handleImport(true, false)}
                      disabled={isLoading}
                      variant="outline"
                      className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                    >
                      Import & Update Duplicates
                    </Button>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="result" className="space-y-4 mt-4">
            {importResult && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-500">Inserted</p>
                      <p className="text-2xl font-bold text-green-600">
                        {importResult.summary.inserted}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-500">Updated</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {importResult.summary.updated}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-500">Failed</p>
                      <p className="text-2xl font-bold text-red-600">
                        {importResult.summary.failed}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-gray-500">Duplicates Skipped</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {importResult.summary.duplicatesSkipped}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Inserted Products */}
                {importResult.insertedProducts && importResult.insertedProducts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        New Products Added ({importResult.insertedProducts.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Name</th>
                              <th className="text-left py-2">SKU</th>
                              <th className="text-right py-2">Price</th>
                              <th className="text-right py-2">Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importResult.insertedProducts.slice(0, 20).map((product, idx) => (
                              <tr key={idx} className="border-b">
                                <td className="py-2">{product.name}</td>
                                <td className="py-2 font-mono text-xs">{product.sku}</td>
                                <td className="py-2 text-right">₹{product.sellingPrice}</td>
                                <td className="py-2 text-right">{product.currentStock}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Failed Products */}
                {importResult.failedProducts && importResult.failedProducts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <XCircle className="h-4 w-4 text-red-600 mr-2" />
                        Failed to Import ({importResult.failedProducts.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {importResult.failedProducts.slice(0, 10).map((fail, idx) => (
                          <div key={idx} className="p-2 bg-red-50 rounded text-sm">
                            <p className="font-medium">{fail.product?.name || 'Unknown'}</p>
                            <p className="text-red-600 text-xs">{fail.reason}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={resetForm}>
                    Import Another File
                  </Button>
                  <Button onClick={handleClose} className="bg-green-500 hover:bg-green-600">
                    Done
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CSVImport;