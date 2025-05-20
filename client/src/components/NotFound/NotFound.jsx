import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  useEffect(() => {
    // Update document title when component mounts
    document.title = '404 - Page Not Found';
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-800 px-6 py-8 text-center">
          <h1 className="text-6xl font-bold text-white">404</h1>
          <p className="text-xl text-gray-300 mt-2">Page Not Found</p>
        </div>
        
        <div className="px-6 py-8">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">The page you are looking for doesn't exist or has been moved.</p>
            <div className="flex justify-center">
              <svg 
                className="h-24 w-24 text-gray-400"
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="1.5" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Link to="/" className="inline-block px-6 py-3 bg-gray-800 text-white rounded-md shadow transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              <span className="font-bold">Return Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;