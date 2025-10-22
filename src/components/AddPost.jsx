import { useState } from 'react';
import './AddPost.css';

function AddPost({ onPostAdded }) {
  const [form, setForm] = useState({ 
    title: '', 
    body: '', 
    user_id: 1 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.body.trim()) {
      setError('Title and body are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const newPost = await response.json();
      
      setForm({ title: '', body: '', user_id: 1 });
      setSuccess(true);
      
      if (onPostAdded) {
        onPostAdded(newPost);
      }

      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      setError(err.message);
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
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
          Post created successfully!
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