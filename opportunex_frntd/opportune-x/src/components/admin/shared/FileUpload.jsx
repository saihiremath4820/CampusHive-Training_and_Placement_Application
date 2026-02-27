import { useState } from 'react';
import { Upload, File, X, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from './Button';

/**
 * File Upload Component (for PDF files)
 * 
 * Props:
 * - onFileSelect: function(file) - called when file is selected
 * - onFileRemove: function() - called when file is removed
 * - accept: string (file types, default: 'application/pdf')
 * - maxSize: number (in MB, default: 10)
 * - label: string
 * - error: string
 */

export default function FileUpload({
  onFileSelect,
  onFileRemove,
  accept = 'application/pdf',
  maxSize = 10,
  label = 'Upload PDF',
  error = null,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const validateFile = (file) => {
    // Check file type
    if (!file.type.includes('pdf')) {
      setUploadError('Only PDF files are allowed');
      return false;
    }
    
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setUploadError(`File size must be less than ${maxSize}MB`);
      return false;
    }
    
    setUploadError(null);
    return true;
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };
  
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };
  
  const handleRemove = () => {
    setSelectedFile(null);
    setUploadError(null);
    onFileRemove();
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              Click to upload
            </span>{' '}
            or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            PDF files only (max {maxSize}MB)
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {uploadError ? (
                <AlertCircle className="h-8 w-8 text-red-500" />
              ) : (
                <File className="h-8 w-8 text-purple-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
          </div>
          <button
            onClick={handleRemove}
            className="ml-3 flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}
      
      {/* Error Messages */}
      {(uploadError || error) && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle size={16} />
          <span>{uploadError || error}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Usage Example:
 * 
 * import { useState } from 'react';
 * import FileUpload from './FileUpload';
 * 
 * function ReportsForm() {
 *   const [file, setFile] = useState(null);
 *   
 *   const handleFileSelect = (selectedFile) => {
 *     setFile(selectedFile);
 *   };
 *   
 *   const handleFileRemove = () => {
 *     setFile(null);
 *   };
 *   
 *   const handleSubmit = async () => {
 *     const formData = new FormData();
 *     formData.append('reportFile', file);
 *     formData.append('academicYear', '2024-25');
 *     
 *     await uploadReport(formData);
 *   };
 *   
 *   return (
 *     <FileUpload
 *       onFileSelect={handleFileSelect}
 *       onFileRemove={handleFileRemove}
 *       label="Upload Placement Report"
 *       maxSize={10}
 *     />
 *   );
 * }
 */
