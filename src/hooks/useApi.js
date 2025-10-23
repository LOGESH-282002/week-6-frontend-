/**
 * Custom React Hooks for API State Management
 * 
 * This module provides reusable React hooks for managing API call state,
 * including loading states, error handling, and data management.
 * 
 * These hooks abstract common patterns for API interactions and provide
 * consistent state management across the application.
 * 
 * @author Your Name
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { handleApiError } from '../services/api';

/**
 * Generic API Call Hook
 * 
 * A reusable hook for managing the state of any API call. Provides loading
 * states, error handling, and a consistent interface for executing API operations.
 * 
 * @returns {Object} Hook state and methods
 * @returns {boolean} loading - True when an API call is in progress
 * @returns {string|null} error - Error message if the last call failed
 * @returns {Function} execute - Function to execute an API call
 * @returns {Function} clearError - Function to clear the current error
 * 
 * @example
 * function MyComponent() {
 *   const { loading, error, execute, clearError } = useApiCall();
 *   
 *   const handleSubmit = async () => {
 *     try {
 *       const result = await execute(() => postsApi.create(formData));
 *       console.log('Success:', result);
 *     } catch (err) {
 *       console.error('Failed:', err);
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       {loading && <p>Loading...</p>}
 *       {error && <p>Error: {error}</p>}
 *       <button onClick={handleSubmit}>Submit</button>
 *     </div>
 *   );
 * }
 */
export function useApiCall() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Executes an API call with automatic state management
   * 
   * @param {Function} apiCall - Function that returns a Promise (API call)
   * @returns {Promise<any>} The result of the API call
   * @throws {Error} Re-throws the original error after setting error state
   */
  const execute = useCallback(async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      throw err; // Re-throw for component-level handling
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clears the current error state
   * 
   * Useful for dismissing error messages or resetting form validation.
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError,
  };
}

/**
 * Posts-Specific API Hook
 * 
 * A specialized hook for managing posts data and operations. Provides state
 * management for posts list, pagination, and all CRUD operations with
 * optimistic updates for better user experience.
 * 
 * @returns {Object} Hook state and methods
 * @returns {Array} posts - Array of post objects
 * @returns {Object} pagination - Pagination metadata (currentPage, totalPages, etc.)
 * @returns {boolean} loading - True when an API call is in progress
 * @returns {string|null} error - Error message if the last call failed
 * @returns {Function} fetchPosts - Function to fetch posts with pagination/search
 * @returns {Function} createPost - Function to create a new post
 * @returns {Function} updatePost - Function to update an existing post
 * @returns {Function} deletePost - Function to delete a post (with optimistic update)
 * @returns {Function} clearError - Function to clear the current error
 * 
 * @example
 * function PostsList() {
 *   const {
 *     posts,
 *     pagination,
 *     loading,
 *     error,
 *     fetchPosts,
 *     deletePost
 *   } = usePostsApi();
 *   
 *   useEffect(() => {
 *     fetchPosts({ page: 1, limit: 10 });
 *   }, []);
 *   
 *   const handleDelete = async (postId) => {
 *     try {
 *       await deletePost(postId);
 *       // Post is automatically removed from local state
 *     } catch (err) {
 *       console.error('Delete failed:', err);
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       {loading && <p>Loading...</p>}
 *       {error && <p>Error: {error}</p>}
 *       {posts.map(post => (
 *         <div key={post.id}>
 *           <h3>{post.title}</h3>
 *           <button onClick={() => handleDelete(post.id)}>Delete</button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 */
export function usePostsApi() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const { loading, error, execute, clearError } = useApiCall();

  /**
   * Fetches posts with optional pagination and search parameters
   * 
   * @param {Object} [params={}] - Query parameters
   * @param {number} [params.page] - Page number for pagination
   * @param {number} [params.limit] - Number of posts per page
   * @param {string} [params.search] - Search term for filtering
   * @returns {Promise<Object>} The API response
   */
  const fetchPosts = useCallback(async (params = {}) => {
    const { postsApi } = await import('../services/api');
    
    const response = await execute(() => postsApi.getAll(params));
    
    // Update local state with fetched data
    if (response && response.success) {
      setPosts(response.data.posts || []);
      setPagination(response.data.pagination || {});
    }
    
    return response;
  }, [execute]);

  /**
   * Creates a new post
   * 
   * @param {Object} postData - The post data to create
   * @param {string} postData.title - Post title
   * @param {string} postData.body - Post content
   * @param {number} postData.user_id - User ID
   * @returns {Promise<Object>} The API response with created post data
   */
  const createPost = useCallback(async (postData) => {
    const { postsApi } = await import('../services/api');
    
    const response = await execute(() => postsApi.create(postData));
    return response;
  }, [execute]);

  /**
   * Updates an existing post
   * 
   * @param {string|number} id - The post ID to update
   * @param {Object} postData - The updated post data
   * @param {string} postData.title - Updated post title
   * @param {string} postData.body - Updated post content
   * @returns {Promise<Object>} The API response with updated post data
   */
  const updatePost = useCallback(async (id, postData) => {
    const { postsApi } = await import('../services/api');
    
    const response = await execute(() => postsApi.update(id, postData));
    return response;
  }, [execute]);

  /**
   * Deletes a post with optimistic UI update
   * 
   * Immediately removes the post from the local state for better UX,
   * then performs the actual deletion. If the deletion fails, the UI
   * will show an error but the post will remain removed from the list.
   * 
   * @param {string|number} id - The post ID to delete
   * @returns {Promise<Object>} The API response
   */
  const deletePost = useCallback(async (id) => {
    const { postsApi } = await import('../services/api');
    
    const response = await execute(() => postsApi.delete(id));
    
    // Optimistically remove the post from local state
    if (response.success) {
      setPosts(prev => prev.filter(post => post.id !== id));
    }
    
    return response;
  }, [execute]);

  return {
    posts,
    pagination,
    loading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    clearError,
  };
}