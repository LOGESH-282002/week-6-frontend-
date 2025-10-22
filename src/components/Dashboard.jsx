import { useState } from 'react';
import PostsList from './PostsList';
import AddPost from './AddPost';
import './Dashboard.css';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('posts');
  const [refreshPosts, setRefreshPosts] = useState(0);

  const handlePostAdded = () => {
    setRefreshPosts(prev => prev + 1);
    setActiveTab('posts');
  };

  return (
    <div className="dashboard">
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

      <main className="dashboard-content">
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