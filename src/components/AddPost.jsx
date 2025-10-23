import { useState } from 'react';
import { useApiCall } from '../hooks/useApi';
import { postsApi, isApiSuccess } from '../services/api';
import { validatePostData, sanitizeInput } from '../utils/validation';
import { UI_MESSAGES } from '../utils/constants';
import './AddPost.css';

function AddPost({ onPostAdded }) {
  const [form, setForm] = useState({ 
    title: '', 
    body: '', 
    user_id: 1 
  });
  const [success, setSuccess] = useState(false);
  const { loading, error, execute, clearError } = useApiCall();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    const validation = validatePostData(form.title, form.body, form.user_id);
    if (!validation.isValid) {
      return; // Let the form validation handle the display
    }

    try {
      const sanitizedForm = {
        title: sanitizeInput(form.title),
        body: sanitizeInput(form.body),
        user_id: form.user_id
      };

      const response = await execute(() => postsApi.create(sanitizedForm));
      
      if (isApiSuccess(response)) {
        setForm({ title: '', body: '', user_id: 1 });
        setSuccess(true);
        
        if (onPostAdded) {
          onPostAdded(response.data);
        }

        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  return (
    <div className="add-post">
      <h2>Create New Post</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          {UI_MESSAGES.SUCCESS_POST_CREATED}
        </div>
      )}

      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            placeholder="Enter post title..."
            value={form.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="body">Content</label>
          <textarea
            id="body"
            placeholder="Write your post content..."
            value={form.body}
            onChange={(e) => handleInputChange('body', e.target.value)}
            required
            disabled={loading}
            rows={6}
          />
        </div>

        <div className="form-group">
          <label htmlFor="user_id">User ID</label>
          <input
            id="user_id"
            type="number"
            placeholder="Enter user ID"
            value={form.user_id}
            onChange={(e) => handleInputChange('user_id', parseInt(e.target.value) || 1)}
            required
            min="1"
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading || !form.title.trim() || !form.body.trim()}
        >
          {loading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
}

export default AddPost;