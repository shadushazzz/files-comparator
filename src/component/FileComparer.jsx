import React, { useState } from 'react';
import axios from 'axios';
import './FileComparer.css';

const FileComparer = () => {
  const ALLOWED_EXTENSIONS = ['txt', 'csv', 'json'];
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateFile = (file) => {
    if (!file) {
      return 'No file selected.';
    }
    const fileExtension = file.name.split('.').pop();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed.`;
    }
    return null;
  };

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      setFile(null);
    } else {
      setErrorMessage('');
      setFile(file);
    }
  };

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e) => {resolve(e.target.result)};
      reader.onerror = (e) => reject(e);
      
    });
  };

  const mockFileComparer = async () => {
   
    
      const [content1, content2] = await Promise.all([readFile(file1), readFile(file2)]);
      console.log(content1, content2 , );
      if (content1 === content2) {
        setComparisonResult("Files are identical.");
        return;
      } else {
        setComparisonResult( "Files are different.");
        return;
      }
    
  
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file1 || !file2) {
      setErrorMessage('Please upload both files.');
      return;
    }

    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    try {
      setLoading(true);
            // const response = await axios.post('/compare', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });
      // Api request is sent but adding a logic here ot compare as backend is not created;
      
      // Mocking API call
    mockFileComparer();
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Error comparing files. Please try again later.'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Compare your files</h1>
      <form className='formStyles' onSubmit={handleSubmit}>
        <div>
          <label htmlFor="file1">File 1:</label>
          <input id="file1" type="file" onChange={(e) => handleFileChange(e, setFile1)} />
        </div>
        <div>
          <label htmlFor="file2">File 2:</label>
          <input id="file2" type="file" onChange={(e) => handleFileChange(e, setFile2)} />
        </div>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <button className="buttonStyles" type="submit" disabled={loading}>
          {loading ? 'Comparing...' : 'Compare Files'}
        </button>
        {comparisonResult && (
          <div className="result">
            {comparisonResult}
          </div>
        )}
      </form>
    </div>
  );
};

export default FileComparer;
