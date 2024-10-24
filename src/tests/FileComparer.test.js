// FileComparer.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FileComparer from '../component/FileComparer'; // Adjust the import based on your file structure
import '@testing-library/jest-dom/extend-expect';

// Mock FileReader
global.FileReader = jest.fn().mockImplementation(function () {
  this.readAsText = jest.fn((file) => {
    // Mock content for different file types
    if (file.name === 'file1.txt') {
      this.onload({ target: { result: 'File content 1' } });
    } else if (file.name === 'file2.txt') {
      this.onload({ target: { result: 'File content 1' } }); // Same content for identical test
    } else if (file.name === 'file2-diff.txt') {
      this.onload({ target: { result: 'File content 2' } }); // Different content for different test
    }
  });
});

describe('FileComparer Component', () => {
  beforeEach(() => {
    render(<FileComparer />);
  });

  test('renders the component correctly', () => {
    expect(screen.getByText(/Compare your files/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/File 1:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/File 2:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Compare Files/i })).toBeInTheDocument();
  });

  test('displays an error message when no files are selected', async () => {
    fireEvent.click(screen.getByRole('button', { name: /Compare Files/i }));
    expect(await screen.findByText(/Please upload both files/i)).toBeInTheDocument();
  });

 
  // Mocking FileReader
  const mockFileReader = (fileContents) => {
    const fileReaderSpy = jest.spyOn(global, 'FileReader').mockImplementation(() => {
      const reader = {
        readAsText: jest.fn(),
        onload: null,
        result: null,
      };
      // Trigger the onload event with the mock result
      setTimeout(() => {
        reader.result = fileContents;
        if (reader.onload) reader.onload({ target: { result: fileContents } });
      }, 100); // small delay to simulate async read
      return reader;
    });
    return fileReaderSpy;
  };

  test('displays result when files are identical', async () => {
    const file1 = new File(['File content 1'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['File content 1'], 'file2.txt', { type: 'text/plain' });

    // Mock FileReader to return identical file contents
    const fileReaderSpy = mockFileReader('File content 1');

    const fileInput1 = screen.getByLabelText(/File 1:/i);
    const fileInput2 = screen.getByLabelText(/File 2:/i);

    // Simulate file selection
    fireEvent.change(fileInput1, { target: { files: [file1] } });
    fireEvent.change(fileInput2, { target: { files: [file2] } });

    // Attempt to compare
    fireEvent.click(screen.getByRole('button', { name: /Compare Files/i }));

    expect(await screen.findByText(/Files are identical/i)).toBeInTheDocument();

    fileReaderSpy.mockRestore(); // Restore the original FileReader after the test
  });

  test('validates and handles file selection', async () => {
    const file1 = new File(['File content 1'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['File content 2'], 'file2.txt', { type: 'text/plain' });

    // Mock FileReader to return different file contents
    const fileReaderSpy = mockFileReader('File content 1');

    const fileInput1 = screen.getByLabelText(/File 1:/i);
    const fileInput2 = screen.getByLabelText(/File 2:/i);

    // Simulate file selection
    fireEvent.change(fileInput1, { target: { files: [file1] } });

    // Change FileReader result for file2
    fileReaderSpy.mockImplementationOnce(() => {
      const reader = {
        readAsText: jest.fn(),
        onload: null,
        result: null,
      };
      // Simulate different content
      setTimeout(() => {
        reader.result = 'File content 2';
        if (reader.onload) reader.onload({ target: { result: 'File content 2' } });
      }, 100);
      return reader;
    });

    fireEvent.change(fileInput2, { target: { files: [file2] } });

    // Attempt to compare
    fireEvent.click(screen.getByRole('button', { name: /Compare Files/i }));

    expect(await screen.findByText(/Files are different/i)).toBeInTheDocument();

    fileReaderSpy.mockRestore(); // Restore the original FileReader after the test
  });


  test('shows error message for invalid file type', async () => {
    const file = new File([''], 'file1.exe', { type: 'application/octet-stream' });
    const fileInput1 = screen.getByLabelText(/File 1:/i);

    // Simulate invalid file selection
    fireEvent.change(fileInput1, { target: { files: [file] } });

    expect(await screen.findByText(/Invalid file type. Only txt, csv, json files are allowed/i)).toBeInTheDocument();
  });
});
