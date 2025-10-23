/**
 * Dashboard Component
 * 
 * Main dashboard interface that provides navigation between different views
 * of the posts management system. Handles tab switching and coordinates
 * data refresh between the AddPost and PostsList components.
 * 
 * Features:
 * - Tab-based navigation between posts list and add post form
 * - Automatic refresh of posts list when new posts are added
 * - Responsive design with clean navigation interface
 * 
 * @component
 * @example
 * return (
 *   <Dashboard />
 * )
 */

import { useState } from 'react';
import PostsList from './PostsList';
import AddPost from './AddPost';
import './Dashboard.css';

function Dashboard() {
  // State for managing active tab ('posts' or 'add')
  const [activeTab, setActiveTab] = useState('posts');
  
  // Counter to trigger refresh of posts list when new posts are added
  const [refreshPosts, setRefreshPosts] = useState(0);

  /**
   * Handles successful post creation
   * 
   * Called when a new post is successfully created. Increments the refresh
   * counter to trigger a re-fetch of the posts list and switches back to
   * the posts tab to show the newly created post.
   */
  const handlePostAdded = () => {
    setRefreshPosts(prev => prev + 1);
    setActiveTab('posts');
  };

  return (
    <div className="dashboard">
      {/* Dashboard Header with Navigation */}
      <header className="dashboard-header">
        <h1>Posts Dashboard</h1>
        <nav className="dashboard-nav">
          <button
            className={activeTab === 'posts' ? 'active' : ''}
            onClick={() => setActiveTab('posts')}
          >
            All Posts
          </button>
          <button
            className={activeTab === 'add' ? 'active' : ''}
            onClick={() => setActiveTab('add')}
          >
            Add Post
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="dashboard-content">
        {/* Conditionally render components based on active tab */}
        {activeTab === 'posts' && (
          <PostsList refreshTrigger={refreshPosts} />
        )}
        {activeTab === 'add' && (
          <AddPost onPostAdded={handlePostAdded} />
        )}
      </main>
    </div>
  );
}

export default Dashboard;