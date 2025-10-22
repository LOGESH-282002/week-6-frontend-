import { useEffect, useState } from 'react';
import './PostsList.css';

function PostsList({ refreshTrigger }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchPosts = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '6',
        search: search
      });
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchPosts(currentPage, searchTerm);
  }, [refreshTrigger, currentPage, searchTerm]);

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={fetchPosts}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="posts-list">
      <div className="posts-header">
        <h2>All Posts ({pagination.totalPosts || 0})</h2>
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
          <p>{searchTerm ? 'No posts found matching your search.' : 'No posts found. Create your first post!'}</p>
        </div>
      ) : (
        <>
          <div className="posts-grid">
            {posts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <h3>{post.title}</h3>
                  <span className="post-id">#{post.id}</span>
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
                ({pagination.totalPosts} total posts)
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