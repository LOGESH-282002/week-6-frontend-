/**
 * API Service Layer
 * 
 * Centralized API communication service that provides consistent error handling,
 * response formatting, and request/response transformation for the frontend application.
 * 
 * This service layer abstracts all HTTP communication with the backend API and ensures
 * consistent handling of success/error responses across the entire frontend application.
 * 
 * Features:
 * - Consistent error handling and transformation
 * - Automatic request/response validation
 * - Type-safe API methods for all CRUD operations
 * - Built-in network error detection
 * - Matches backend response format: { success: boolean, data: any, error: string | null }
 * 
 * @author Your Name
 * @version 1.0.0
 */

// API base URL from environment variables with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Custom API Error Class
 * 
 * Extends the native Error class to provide additional context about API failures.
 * Includes HTTP status codes and original response data for better error handling.
 */
class ApiError extends Error {
  /**
   * Creates a new ApiError instance
   * 
   * @param {string} message - Human-readable error message
   * @param {number} status - HTTP status code (0 for network errors)
   * @param {Object} response - Original response data from the API
   */
  constructor(message, status, response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

/**
 * Generic API Request Handler
 * 
 * Handles all HTTP requests to the backend API with consistent error handling
 * and response transformation. Automatically adds appropriate headers and
 * handles both successful responses and various error conditions.
 * 
 * @param {string} endpoint - API endpoint path (e.g., '/posts', '/posts/123')
 * @param {Object} [options={}] - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Object>} Promise that resolves to the API response data
 * @throws {ApiError} Throws ApiError for HTTP errors or network failures
 * 
 * @example
 * // GET request
 * const posts = await apiRequest('/posts');
 * 
 * // POST request
 * const newPost = await apiRequest('/posts', {
 *   method: 'POST',
 *   body: JSON.stringify({ title: 'New Post', body: 'Content' })
 * });
 */
async function apiRequest(endpoint, options = {}) {
  // Construct the full API URL
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  // Merge default headers with any provided headers
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    // Make the HTTP request
    const response = await fetch(url, config);
    const data = await response.json();

    // Handle non-2xx HTTP status codes
    if (!response.ok) {
      throw new ApiError(
        data.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    // Re-throw ApiError instances as-is
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors, JSON parsing errors, etc.
    throw new ApiError(
      error.message || 'Network error occurred',
      0, // Status 0 indicates network error
      null
    );
  }
}

/**
 * API Service Methods
 * 
 * Organized collection of API methods grouped by functionality.
 * Provides a clean interface for all backend communication.
 */
export const apiService = {
  /**
   * Health Check API
   * 
   * Checks if the backend server is running and responsive.
   * Useful for monitoring and connection testing.
   * 
   * @returns {Promise<Object>} Server health status and uptime info
   */
  async checkHealth() {
    return apiRequest('/health');
  },

  /**
   * Posts API Methods
   * 
   * Complete CRUD operations for managing posts.
   */
  posts: {
    /**
     * Get all posts with pagination and search
     * 
     * Retrieves a paginated list of posts with optional search filtering.
     * Search is performed on both title and body fields.
     * 
     * @param {Object} [params={}] - Query parameters
     * @param {number} [params.page=1] - Page number for pagination
     * @param {number} [params.limit=10] - Number of posts per page
     * @param {string} [params.search=''] - Search term for filtering
     * @returns {Promise<Object>} Posts array with pagination metadata
     * 
     * @example
     * const result = await postsApi.getAll({ page: 1, limit: 10, search: 'react' });
     * console.log(result.data.posts); // Array of posts
     * console.log(result.data.pagination); // Pagination info
     */
    async getAll(params = {}) {
      const searchParams = new URLSearchParams();
      
      // Build query string from parameters
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.search) searchParams.set('search', params.search);
      
      const queryString = searchParams.toString();
      const endpoint = queryString ? `/posts?${queryString}` : '/posts';
      
      return apiRequest(endpoint);
    },

    /**
     * Get a single post by ID
     * 
     * Retrieves detailed information for a specific post.
     * 
     * @param {string|number} id - The unique identifier of the post
     * @returns {Promise<Object>} Single post data
     * @throws {ApiError} If ID is missing or post not found
     * 
     * @example
     * const post = await postsApi.getById(123);
     * console.log(post.data.title); // Post title
     */
    async getById(id) {
      if (!id) {
        throw new ApiError('Post ID is required', 400, null);
      }
      return apiRequest(`/posts/${id}`);
    },

    /**
     * Create a new post
     * 
     * Creates a new post with the provided data. All fields are required.
     * 
     * @param {Object} postData - The post data
     * @param {string} postData.title - Post title (max 255 characters)
     * @param {string} postData.body - Post content (max 10000 characters)
     * @param {number} postData.user_id - ID of the user creating the post
     * @returns {Promise<Object>} Created post data
     * @throws {ApiError} If required fields are missing or validation fails
     * 
     * @example
     * const newPost = await postsApi.create({
     *   title: 'My New Post',
     *   body: 'This is the content of my post.',
     *   user_id: 1
     * });
     */
    async create(postData) {
      if (!postData.title || !postData.body || !postData.user_id) {
        throw new ApiError('Title, body, and user_id are required', 400, null);
      }

      return apiRequest('/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
      });
    },

    /**
     * Update an existing post
     * 
     * Updates the title and body of an existing post. The user_id cannot be changed.
     * 
     * @param {string|number} id - The unique identifier of the post to update
     * @param {Object} postData - The updated post data
     * @param {string} postData.title - New post title (max 255 characters)
     * @param {string} postData.body - New post content (max 10000 characters)
     * @returns {Promise<Object>} Updated post data
     * @throws {ApiError} If ID is missing, required fields are missing, or post not found
     * 
     * @example
     * const updatedPost = await postsApi.update(123, {
     *   title: 'Updated Title',
     *   body: 'Updated content here.'
     * });
     */
    async update(id, postData) {
      if (!id) {
        throw new ApiError('Post ID is required', 400, null);
      }
      
      if (!postData.title || !postData.body) {
        throw new ApiError('Title and body are required', 400, null);
      }

      return apiRequest(`/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(postData),
      });
    },

    /**
     * Delete a post
     * 
     * Permanently removes a post from the database. This action cannot be undone.
     * 
     * @param {string|number} id - The unique identifier of the post to delete
     * @returns {Promise<Object>} Success confirmation message
     * @throws {ApiError} If ID is missing or deletion fails
     * 
     * @example
     * await postsApi.delete(123);
     * console.log('Post deleted successfully');
     */
    async delete(id) {
      if (!id) {
        throw new ApiError('Post ID is required', 400, null);
      }
      
      return apiRequest(`/posts/${id}`, {
        method: 'DELETE',
      });
    },
  },
};

/**
 * Convenience Exports
 * 
 * Export commonly used API methods and utilities for easier importing.
 */
export const { posts: postsApi } = apiService;
export { ApiError };

/**
 * API Response Utility Functions
 * 
 * Helper functions for working with API responses and errors.
 */

/**
 * Handles API errors and transforms them into a consistent format
 * 
 * Converts ApiError instances and other errors into a standardized format
 * that can be easily consumed by UI components.
 * 
 * @param {Error|ApiError} error - The error to handle
 * @returns {Object} Standardized error information
 * 
 * @example
 * try {
 *   await postsApi.getAll();
 * } catch (error) {
 *   const errorInfo = handleApiError(error);
 *   console.log(errorInfo.message); // User-friendly error message
 *   console.log(errorInfo.isNetworkError); // true if network error
 * }
 */
export const handleApiError = (error) => {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.status,
      isNetworkError: error.status === 0,
    };
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
    status: 500,
    isNetworkError: false,
  };
};

/**
 * Checks if an API response indicates success
 * 
 * @param {Object} response - The API response object
 * @returns {boolean} True if the response indicates success
 * 
 * @example
 * const response = await postsApi.getAll();
 * if (isApiSuccess(response)) {
 *   console.log('Request succeeded');
 * }
 */
export const isApiSuccess = (response) => {
  return response && response.success === true;
};

/**
 * Extracts data from a successful API response
 * 
 * @param {Object} response - The API response object
 * @returns {any|null} The response data or null if not successful
 * 
 * @example
 * const response = await postsApi.getAll();
 * const posts = getApiData(response)?.posts || [];
 */
export const getApiData = (response) => {
  return isApiSuccess(response) ? response.data : null;
};

/**
 * Extracts error message from a failed API response
 * 
 * @param {Object} response - The API response object
 * @returns {string|null} The error message or null if successful
 * 
 * @example
 * const response = await postsApi.getAll();
 * const error = getApiError(response);
 * if (error) {
 *   console.error('API Error:', error);
 * }
 */
export const getApiError = (response) => {
  return response && !response.success ? response.error : null;
};