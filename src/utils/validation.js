/**
 * Frontend Validation Utilities
 * 
 * Client-side validation functions that mirror the backend validation rules.
 * These provide immediate feedback to users and help prevent unnecessary
 * API calls with invalid data.
 * 
 * Important: These validations are for UX purposes only. The backend
 * performs authoritative validation for security and data integrity.
 * 
 * @author Your Name
 * @version 1.0.0
 */

import { VALIDATION, PAGINATION } from './constants';

/**
 * Validates post data (title, body, and user ID)
 * 
 * Performs comprehensive client-side validation on post data before
 * submission. Checks for required fields, data types, length limits,
 * and ensures content is not just whitespace.
 * 
 * @param {any} title - The post title to validate
 * @param {any} body - The post body content to validate
 * @param {any} userId - The user ID to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 * 
 * @example
 * const validation = validatePostData('My Title', 'Post content', 1);
 * if (!validation.isValid) {
 *   console.log('Validation errors:', validation.errors);
 * }
 */
export const validatePostData = (title, body, userId) => {
  const errors = [];

  // Title validation
  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('Title is required');
  } else if (title.length > VALIDATION.POST_TITLE_MAX_LENGTH) {
    errors.push(`Title must be ${VALIDATION.POST_TITLE_MAX_LENGTH} characters or less`);
  }

  // Body validation
  if (!body || typeof body !== 'string' || !body.trim()) {
    errors.push('Content is required');
  } else if (body.length > VALIDATION.POST_BODY_MAX_LENGTH) {
    errors.push(`Content must be ${VALIDATION.POST_BODY_MAX_LENGTH} characters or less`);
  }

  // User ID validation
  if (!userId || userId < VALIDATION.MIN_USER_ID) {
    errors.push('Valid user ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitizes string input by trimming whitespace
 * 
 * Safely processes user input by removing leading and trailing whitespace.
 * Handles non-string values gracefully by returning an empty string.
 * 
 * @param {any} input - The input to sanitize
 * @returns {string} Trimmed string or empty string if input is not a string
 * 
 * @example
 * sanitizeInput('  hello world  ')  // returns 'hello world'
 * sanitizeInput(null)               // returns ''
 * sanitizeInput(123)                // returns ''
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim();
};

/**
 * Validates and sanitizes search terms
 * 
 * Processes search input to ensure it's safe and within reasonable limits.
 * Trims whitespace and limits length to prevent excessively long search queries.
 * 
 * @param {any} searchTerm - The search term to validate
 * @returns {string} Sanitized search term (empty string if invalid)
 * 
 * @example
 * validateSearchTerm('  react hooks  ')  // returns 'react hooks'
 * validateSearchTerm('x'.repeat(200))    // returns 'x'.repeat(100)
 * validateSearchTerm(null)               // returns ''
 */
export const validateSearchTerm = (searchTerm) => {
  if (!searchTerm || typeof searchTerm !== 'string') return '';
  return searchTerm.trim().slice(0, 100); // Limit search term length to 100 chars
};

/**
 * Validates and sanitizes pagination parameters
 * 
 * Ensures pagination parameters are within safe ranges and converts them
 * to valid integers. Prevents negative pages, zero limits, and excessively
 * large page sizes that could impact performance.
 * 
 * @param {any} page - The page number to validate
 * @param {any} limit - The items per page limit to validate
 * @returns {Object} Object with validated page and limit properties
 * 
 * @example
 * validatePaginationParams('2', '10')    // returns { page: 2, limit: 10 }
 * validatePaginationParams('-1', '200')  // returns { page: 1, limit: 100 }
 * validatePaginationParams('abc', 'xyz') // returns { page: 1, limit: 6 }
 */
export const validatePaginationParams = (page, limit) => {
  const validPage = Math.max(1, parseInt(page) || PAGINATION.DEFAULT_PAGE);
  const validLimit = Math.min(
    PAGINATION.MAX_LIMIT, 
    Math.max(1, parseInt(limit) || PAGINATION.DEFAULT_LIMIT)
  );
  
  return { page: validPage, limit: validLimit };
};