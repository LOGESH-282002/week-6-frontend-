import { useEffect, useState } from 'react';
import { usePostsApi } from '../hooks/useApi';
import { UI_MESSAGES, PAGINATION } from '../utils/constants';
import { validateSearchTerm } from '../utils/validation';
import './PostsList.css';

function PostsList({ refreshTrigger }) {
  const {
    posts,
    pagination,
    loading,
    error,
    fetchPosts,
    deletePost,
    clearError
  } = usePostsApi();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const loadPosts = async (page = 1, search = '') => {
    try {
      await fetchPosts({
        page,
        limit: PAGINATION.DEFAULT_LIMIT,
        search: validateSearchTerm(search)
      });
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm(UI_MESSAGES.DELETE_CONFIRMATION)) {
      try {
        await deletePost(postId);
        // Refresh the current page if it becomes empty
        if (posts.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          loadPosts(currentPage, searchTerm);
        }
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  const handleRetry = () => {
    clearError();
    loadPosts(currentPage, searchTerm);
  };

  useEffect(() => {
    loadPosts(currentPage, searchTerm);
  }, [refreshTrigger, currentPage, searchTerm]);

  if (loading) {
    return <div className="loading">{UI_MESSAGES.LOADING}</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={handleRetry}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="posts-list">
      <div className="posts-header">
        <h2>All Posts ({pagination.totalItems || 0})</h2>
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search posts by title or content..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              Search
            </button>
            {searchTerm && (
              <button type="button" onClick={clearSearch} className="clear-btn">
                Clear
              </button>
            )}
          </div>
        </form>

        {searchTerm && (
          <div className="search-info">
            Showing results for: "<strong>{searchTerm}</strong>"
          </div>
        )}
      </div>
      
      {posts.length === 0 ? (
        <div className="no-posts">
          <p>{searchTerm ? UI_MESSAGES.NO_SEARCH_RESULTS : `${UI_MESSAGES.NO_POSTS} ${UI_MESSAGES.CREATE_FIRST_POST}`}</p>
        </div>
      ) : (
        <>
          <div className="posts-grid">
            {posts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <h3>{post.title}</h3>
                  <div className="post-actions">
                    <span className="post-id">#{post.id}</span>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeletePost(post.id)}
                      title="Delete post"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <p className="post-body">{post.body}</p>
                <div className="post-footer">
                  <span className="user-id">User: {post.user_id}</span>
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Page {pagination.currentPage} of {pagination.totalPages} 
                ({pagination.totalItems} total posts)
              </div>
              
              <div className="pagination-controls">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="pagination-btn"
                >
                  Previous
                </button>
                
                <div className="page-numbers">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === pagination.totalPages || 
                      Math.abs(page - currentPage) <= 2
                    )
                    .map((page, index, array) => (
                      <span key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="pagination-ellipsis">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`page-btn ${page === currentPage ? 'active' : ''}`}
                        >
                          {page}
                        </button>
                      </span>
                    ))
                  }
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PostsList;