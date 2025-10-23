// Frontend API Integration Test
// This file can be used to test the API service layer

import { apiService, postsApi, handleApiError, isApiSuccess } from '../services/api';

export const runApiTests = async () => {
  console.log('🧪 Running Frontend API Tests...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  const test = (name, condition, message = '') => {
    const passed = Boolean(condition);
    results.tests.push({ name, passed, message });
    if (passed) {
      results.passed++;
      console.log(`✅ ${name}`);
    } else {
      results.failed++;
      console.log(`❌ ${name}: ${message}`);
    }
  };

  try {
    // Test 1: Health Check
    console.log('Testing health endpoint...');
    const healthResponse = await apiService.checkHealth();
    test('Health check', isApiSuccess(healthResponse), 'Health endpoint failed');

    // Test 2: Get all posts
    console.log('Testing get all posts...');
    const postsResponse = await postsApi.getAll();
    test('Get all posts', isApiSuccess(postsResponse), 'Failed to fetch posts');
    test('Posts response has data', postsResponse.data && Array.isArray(postsResponse.data.posts), 'Posts data is not an array');

    // Test 3: Get posts with pagination
    console.log('Testing pagination...');
    const paginatedResponse = await postsApi.getAll({ page: 1, limit: 3 });
    test('Paginated posts', isApiSuccess(paginatedResponse), 'Pagination failed');
    test('Pagination data', paginatedResponse.data && paginatedResponse.data.pagination, 'Missing pagination data');

    // Test 4: Create a test post
    console.log('Testing post creation...');
    const testPost = {
      title: 'Frontend API Test Post',
      body: 'This post was created by the frontend API test suite.',
      user_id: 1
    };
    
    const createResponse = await postsApi.create(testPost);
    test('Create post', isApiSuccess(createResponse), 'Failed to create post');
    
    let createdPostId = null;
    if (isApiSuccess(createResponse)) {
      createdPostId = createResponse.data.id;
      test('Created post has ID', createdPostId, 'Created post missing ID');

      // Test 5: Get single post
      console.log('Testing get single post...');
      const singlePostResponse = await postsApi.getById(createdPostId);
      test('Get single post', isApiSuccess(singlePostResponse), 'Failed to get single post');

      // Test 6: Update post
      console.log('Testing post update...');
      const updateData = {
        title: 'Updated Frontend API Test Post',
        body: 'This post was updated by the frontend API test suite.'
      };
      
      const updateResponse = await postsApi.update(createdPostId, updateData);
      test('Update post', isApiSuccess(updateResponse), 'Failed to update post');

      // Test 7: Delete post
      console.log('Testing post deletion...');
      const deleteResponse = await postsApi.delete(createdPostId);
      test('Delete post', isApiSuccess(deleteResponse), 'Failed to delete post');
    }

    // Test 8: Error handling
    console.log('Testing error handling...');
    try {
      await postsApi.getById('invalid-id');
      test('Error handling for invalid ID', false, 'Should have thrown an error');
    } catch (error) {
      const errorInfo = handleApiError(error);
      test('Error handling for invalid ID', errorInfo.message, 'Error handling failed');
    }

    // Test 9: Validation
    console.log('Testing validation...');
    try {
      await postsApi.create({ title: '', body: '', user_id: 1 });
      test('Validation for empty fields', false, 'Should have thrown validation error');
    } catch (error) {
      const errorInfo = handleApiError(error);
      test('Validation for empty fields', errorInfo.message, 'Validation error handling failed');
    }

  } catch (error) {
    console.error('Test suite error:', error);
    test('Test suite execution', false, error.message);
  }

  // Summary
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  return results;
};

// Export for use in development
if (import.meta.env.DEV) {
  window.runApiTests = runApiTests;
  console.log('💡 Run window.runApiTests() in the browser console to test the API');
}