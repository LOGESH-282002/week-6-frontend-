/**
 * Application Constants and Configuration
 * 
 * Centralized configuration file containing all constants used throughout
 * the frontend application. This includes API configuration, validation rules,
 * UI messages, and HTTP status codes.
 * 
 * Benefits:
 * - Single source of truth for configuration values
 * - Easy to maintain and update across the application
 * - Consistent messaging and behavior
 * - Type safety and IDE autocomplete support
 * 
 * @author Your Name
 * @version 1.0.0
 */

/**
 * API Configuration
 * 
 * Settings related to API communication and network requests.
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  TIMEOUT: 10000, // Request timeout in milliseconds (10 seconds)
  RETRY_ATTEMPTS: 3, // Number of retry attempts for failed requests
};

/**
 * Pagination Configuration
 * 
 * Default values and limits for paginated data display.
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,        // Default page number for pagination
  DEFAULT_LIMIT: 6,       // Default number of items per page
  MAX_LIMIT: 100,         // Maximum allowed items per page
};

/**
 * Validation Rules
 * 
 * Validation constraints that match the backend validation rules.
 * These should be kept in sync with backend validation.
 */
export const VALIDATION = {
  POST_TITLE_MAX_LENGTH: 255,    // Maximum characters allowed in post title
  POST_BODY_MAX_LENGTH: 10000,   // Maximum characters allowed in post body
  MIN_USER_ID: 1,                // Minimum valid user ID value
};

/**
 * User Interface Messages
 * 
 * Standardized text messages used throughout the application.
 * Centralizing these makes it easy to maintain consistent messaging
 * and supports future internationalization efforts.
 */
export const UI_MESSAGES = {
  // Loading states
  LOADING: 'Loading...',

  // Empty states
  NO_POSTS: 'No posts found.',
  NO_SEARCH_RESULTS: 'No posts found matching your search.',
  CREATE_FIRST_POST: 'Create your first post!',

  // User confirmations
  DELETE_CONFIRMATION: 'Are you sure you want to delete this post?',

  // Success messages
  SUCCESS_POST_CREATED: 'Post created successfully!',
  SUCCESS_POST_UPDATED: 'Post updated successfully!',
  SUCCESS_POST_DELETED: 'Post deleted successfully!',

  // Error messages
  ERROR_NETWORK: 'Network error. Please check your connection.',
  ERROR_SERVER: 'Server error. Please try again later.',
  ERROR_VALIDATION: 'Please check your input and try again.',
};

/**
 * HTTP Status Codes
 * 
 * Standard HTTP status codes used for API response handling.
 * Using constants instead of magic numbers improves code readability.
 */
export const HTTP_STATUS = {
  OK: 200,                    // Successful GET, PUT, PATCH, DELETE
  CREATED: 201,               // Successful POST (resource created)
  BAD_REQUEST: 400,           // Client error (validation, malformed request)
  UNAUTHORIZED: 401,          // Authentication required
  FORBIDDEN: 403,             // Access denied (authorization failed)
  NOT_FOUND: 404,             // Resource not found
  INTERNAL_SERVER_ERROR: 500, // Server error
};