import * as mammoth from 'mammoth';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Correct way to import worker in Vite
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';
GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
console.log('Using pdfjs worker from URL:', pdfWorkerUrl);


export const extractTextFromFile = async (file) => {
  let extractedText = '';

  try {
    const arrayBuffer = await file.arrayBuffer();

    if (file.type === 'application/pdf') {
      try {
        const pdf = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((item) => item.str).join(' ') + ' ';
        }
        console.log('Extracted fullText from PDF:', extractedText.substring(0, Math.min(extractedText.length, 100)) + '...');
      } catch (error) {
        console.error('PDF extraction error:', error.message, error.stack);
        // Do not use alert here, let the calling component handle the error message display
        throw new Error('Failed to extract text from the PDF. Please use a text-based PDF or check the file.');
      }
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const { value: docxText } = await mammoth.extractRawText({ arrayBuffer });
        extractedText = docxText || '';
        console.log('Extracted DOCX text:', extractedText.substring(0, Math.min(extractedText.length, 100)) + '...');
      } catch (error) {
        console.error('DOCX extraction error:', error);
        throw new Error('Failed to extract text from DOCX. File might be corrupted or unsupported.');
      }
    } else if (file.type.startsWith('image/')) {
      try {
        // setLoading(true); // Remove this: loading state should be managed by the calling component
        const { data: { text } } = await Tesseract.recognize(
          file,
          'eng',
          { logger: (m) => console.log(m) }
        );
        extractedText = text || '';
        console.log('Extracted OCR text from image:', extractedText.substring(0, Math.min(extractedText.length, 100)) + '...');
      } catch (error) {
        console.error('OCR error:', error);
        throw new Error('Failed to perform OCR on image. Please try another image or ensure text is clear.');
      }
      // finally {
      //   setLoading(false); // Remove this
      // }
    } else if (file.type === 'text/plain') {
      try {
        const reader = new FileReader();
        const promise = new Promise((resolve, reject) => {
          reader.onload = (event) => {
            extractedText = event.target.result || '';
            console.log('Extracted plain text:', extractedText.substring(0, Math.min(extractedText.length, 100)) + '...');
            resolve();
          };
          reader.onerror = reject;
          reader.readAsText(file);
        });
        await promise; // Wait for the FileReader to complete
      } catch (error) {
        console.error('Error reading text file:', error);
        throw new Error('Failed to read text file.');
      }
    } else {
      extractedText = `File: ${file.name} attached. Type: ${file.type}. Text extraction not supported on frontend.`;
      console.log('Unsupported file type attached:', file.name);
      // You might want to throw an error here if you don't want to proceed with unsupported types
      // throw new Error(`Unsupported file type: ${file.type}.`);
    }
  } catch (error) {
    console.error('Error processing file in extractTextFromFile:', error);
    throw error; // Re-throw the error so ChatContainer can catch it and display an alert
  }

  return extractedText;
};

export const validateFile = (file) => {
  const maxSize = 15 * 1024 * 1024; // 15MB
  const supportedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/'];
  if (file.size > maxSize) {
    return { valid: false, error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the 15MB limit.` };
  }
  // Check if file.type starts with any of the supported types (e.g., 'image/png' starts with 'image/')
  if (!supportedTypes.some((type) => file.type.startsWith(type.split('/')[0]))) {
    return { valid: false, error: `Unsupported file type: ${file.type}. Supported formats: PDF, DOCX, TXT, and images.` };
  }
  return { valid: true };
};