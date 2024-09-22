import multer from 'multer';

// Set up Multer for handling file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to run the Multer middleware
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async (req, res) => {
  try {
    if (req.method === 'POST') {
      // Use the Multer middleware to handle the file upload
      await runMiddleware(req, res, upload.single('file'));

      // Check if req.body exists
      if (!req.body) {
        return res.status(400).json({ is_success: false, error: "Request body is missing" });
      }

      const { data, file_b64 } = req.body;

      // Check if data is an array
      if (!Array.isArray(data)) {
        return res.status(400).json({ is_success: false, error: "data must be an array" });
      }

      // Filter numbers and alphabets from the data array
      const numbers = data.filter(item => !isNaN(item));
      const alphabets = data.filter(item => isNaN(item));

      // Find all lowercase alphabets
      const lowerCaseAlphabets = alphabets.filter(item => /[a-z]/.test(item));
      const highestLowerCaseAlphabet = lowerCaseAlphabets.length
        ? [lowerCaseAlphabets.sort().pop()]
        : [];

      // File handling
      let file_valid = false;
      let file_mime_type = '';
      let file_size_kb = 0;

      if (req.file) {
        file_valid = true;
        file_mime_type = req.file.mimetype;
        file_size_kb = req.file.size / 1024;
      } else if (file_b64) {
        const buffer = Buffer.from(file_b64, 'base64');
        file_valid = true;
        file_size_kb = buffer.length / 1024;
        // MIME type detection based on file extension or content could be enhanced here
        file_mime_type = 'unknown'; 
      }

      // Generate response
      const response = {
        is_success: true,
        user_id: "john_doe_17091999", // Update with dynamic logic if necessary
        email: "john@xyz.com",        // Update with actual email
        roll_number: "ABCD123",       // Update with actual roll number
        numbers,
        alphabets,
        highest_lowercase_alphabet: highestLowerCaseAlphabet,
        file_valid,
        file_mime_type,
        file_size_kb,
      };

      res.status(200).json(response);
    } else if (req.method === 'GET') {
      res.status(200).json({ operation_code: 1 });
    } else {
      res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    res.status(500).json({ is_success: false, error: error.message });
  }
};

// Turn off the default bodyParser from Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};
