import "dotenv/config.js";

class APIError extends Error {
   constructor(message, statusCode) {
      super(message || 'An error occurred'); // Default message if none is provided
      this.statusCode = statusCode;
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
   }
}

const handleError = (err, res) => {

   const status = err.statusCode || 500;
   const stack = process.env.NODE_ENV === 'development' ? err.stack: null;
   const message = process.env.NODE_ENV === 'production' ? getDefaultMessage(status): err.message;

   res.status(status).json({
      status: 'error',
      statusCode: status,
      message: message
   });
};

// Helper function to return default messages based on status code
const getDefaultMessage = (statusCode) => {
   switch (statusCode) {
      case 400:
         return 'Bad Request';
      case 401:
         return 'Unauthorized';
      case 403:
         return 'Forbidden';
      case 404:
         return 'Not Found';
      case 500:
         return 'Internal Server Error';
      default:
         return 'An error occurred';
   }
};

export {
   APIError,
   handleError
};