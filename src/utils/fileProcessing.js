import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromFile = async (file, isBackground = false) => {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  try {
    // If background processing, return placeholder immediately
    if (isBackground) {
      if (fileType.startsWith("image/")) {
        return "Processing image... Please wait while I analyze the visual content and extract any text.";
      } else {
        return "Processing document... Please wait while I extract the text content.";
      }
    } // Handle Images - both OCR and visual analysis

    if (fileType.startsWith("image/")) {
      return await extractContentFromImage(file);
    } // Handle PDFs

    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      return await extractTextFromPDF(file);
    } // Handle Word documents

    if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      return await extractTextFromDocx(file);
    } // Handle plain text files

    if (fileType === "text/plain" || fileName.endsWith(".txt")) {
      return await extractTextFromTxt(file);
    }

    throw new Error("Unsupported file type");
  } catch (error) {
    console.error("Error extracting text:", error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
};

// NEW: Extract both text and visual content from images
const extractContentFromImage = async (file) => {
  try {
    console.log("Processing image:", file.name); // Convert image to base64 for vision API

    const base64Image = await convertImageToBase64(file); // Try OCR first for any text content

    let ocrText = "";
    try {
      const {
        data: { text },
      } = await Tesseract.recognize(file, "eng", {
        logger: (m) => console.log("OCR Progress:", m),
      });
      ocrText = text?.trim() || "";
    } catch (ocrError) {
      console.log("OCR failed, will rely on vision analysis");
    } // Get visual description from AI

    const visualDescription = await analyzeImageWithAI(base64Image, file.type); // Combine OCR text and visual description

    let combinedContent = "";

    if (ocrText && ocrText.length > 10) {
      combinedContent += `TEXT CONTENT FOUND IN IMAGE:\n${ocrText}\n\n`;
    }

    combinedContent += `VISUAL CONTENT DESCRIPTION:\n${visualDescription}`;

    return combinedContent;
  } catch (error) {
    console.error("Image processing error:", error);
    throw new Error("Failed to process image. Please try again.");
  }
};

// Convert image file to base64
const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1]; // Remove data:image/...;base64, prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Analyze image with AI vision model
const analyzeImageWithAI = async (base64Image, mimeType) => {
  const OPENROUTER_CONFIG = {
    apiKey: import.meta.env.VITE_API_KEY,
    baseUrl: "https://openrouter.ai/api/v1",
    model: "google/gemini-flash-1.5", // Vision-capable model
    siteUrl: window.location.origin,
    siteName: "PDF Chat App",
  };

  if (!OPENROUTER_CONFIG.apiKey) {
    throw new Error("API key not configured");
  }

  try {
    const response = await fetch(
      `${OPENROUTER_CONFIG.baseUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_CONFIG.apiKey}`,
          "HTTP-Referer": OPENROUTER_CONFIG.siteUrl,
          "X-Title": OPENROUTER_CONFIG.siteName,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: OPENROUTER_CONFIG.model,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Please analyze this image and provide a detailed description of what you see. Include objects, people, text, colors, setting, activities, and any other relevant details. Be comprehensive and descriptive.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Vision API Error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from vision model");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Vision API error:", error); // Fallback description
    return "This is an image file. I can see it contains visual content, but I'm unable to provide a detailed description at the moment. Please describe what you see in the image, and I'll help you analyze it.";
  }
};

const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
    }).promise;
    let extractedText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      extractedText +=
        textContent.items.map((item) => item.str).join(" ") + " ";
    }

    console.log(
      "Extracted fullText from PDF:",
      extractedText.substring(0, Math.min(extractedText.length, 100)) + "..."
    );
    return extractedText;
  } catch (error) {
    console.error("PDF extraction error:", error.message, error.stack);
    throw new Error(
      "Failed to extract text from the PDF. Please use a text-based PDF or check the file."
    );
  }
};

const extractTextFromDocx = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const { value: docxText } = await mammoth.extractRawText({ arrayBuffer });
    const extractedText = docxText || "";
    console.log(
      "Extracted DOCX text:",
      extractedText.substring(0, Math.min(extractedText.length, 100)) + "..."
    );
    return extractedText;
  } catch (error) {
    console.error("DOCX extraction error:", error);
    throw new Error(
      "Failed to extract text from DOCX. File might be corrupted or unsupported."
    );
  }
};

const extractTextFromTxt = async (file) => {
  try {
    const reader = new FileReader();
    const promise = new Promise((resolve, reject) => {
      reader.onload = (event) => {
        const extractedText = event.target.result || "";
        console.log(
          "Extracted plain text:",
          extractedText.substring(0, Math.min(extractedText.length, 100)) +
            "..."
        );
        resolve(extractedText);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
    return await promise;
  } catch (error) {
    console.error("Error reading text file:", error);
    throw new Error("Failed to read text file.");
  }
};

// Background processing function that doesn't block UI
export const processFileInBackground = async (
  file,
  chatId,
  dispatch,
  updateChatFile,
  addMessage
) => {
  try {
    console.log("Starting background processing for:", file.name); // Process the file content

    const fullText = await extractTextFromFile(file, false); // KEY FIX: Create a serializable representation of the file object
    const fileData = await fileToBase64(file);

    const serializableFile = {
      name: file.name,
      type: file.type,
      size: file.size,
    }; // Update the chat with the processed content and the serializable file object

    dispatch(
      updateChatFile({
        chatId,
        file: serializableFile, // <-- Updated to use the serializable object
        fullText,
        processingComplete: true,
        data: fileData,
      })
    ); // Add completion message

    const completionMessage = file.type.startsWith("image/")
      ? "✅ Image analysis complete! I can now see and understand the content of your image. Feel free to ask me questions about what's in the image, any text I found, colors, objects, or anything else you'd like to know!"
      : "✅ Document processing complete! I've successfully extracted and analyzed the text content. You can now ask me questions about the document.";

    dispatch(
      addMessage({
        chatId,
        message: { sender: "ai", text: completionMessage },
      })
    );

    console.log("Background processing completed for:", file.name);
  } catch (error) {
    console.error("Background processing failed:", error); // KEY FIX: Create a serializable representation of the file object for the error state

    const serializableFile = {
      name: file.name,
      type: file.type,
      size: file.size,
    }; // Update chat with error state and the serializable file object

    dispatch(
      updateChatFile({
        chatId,
        file: serializableFile, // <-- Updated to use the serializable object
        fullText: `Error processing file: ${error.message}. Please try uploading again.`,
        processingComplete: true,
        processingError: true,
      })
    ); // Add error message

    dispatch(
      addMessage({
        chatId,
        message: {
          sender: "ai",
          text: `❌ Sorry, I encountered an error while processing your ${
            file.type.startsWith("image/") ? "image" : "document"
          }: ${error.message}. Please try uploading the file again.`,
        },
      })
    );
  }
};

export const validateFile = (file) => {
  const maxSize = 15 * 1024 * 1024; // 15MB
  const supportedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/",
  ];
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(
        2
      )}MB) exceeds the 15MB limit.`,
    };
  } // Check if file.type starts with any of the supported types (e.g., 'image/png' starts with 'image/')
  if (
    !supportedTypes.some((type) => file.type.startsWith(type.split("/")[0]))
  ) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Supported formats: PDF, DOCX, TXT, and images.`,
    };
  }
  return { valid: true };
};

// Generic: Convert any file to base64 Data URL
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // Full Data URL
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
