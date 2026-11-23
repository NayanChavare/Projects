import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Hash } from 'lucide-react';
import { fetchHashtagPosts } from '../services/api';
import { PostCard } from '../components/PostCard';

export function HashtagPage() {
  const { tag } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTagPosts() {
      if (!tag) return;
      setIsLoading(true);
      try {
        const res = await fetchHashtagPosts(tag);
        if (res.ok && res.data?.posts) {
          setPosts(res.data.posts);
          setTotalPosts(res.data.totalPosts || res.data.posts.length);
        }
      } catch (err) {
        console.error('Error loading hashtag posts:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTagPosts();
  }, [tag]);

  return (
    <div className="hashtag-view">
      <header className="page-header-sticky">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate(-1)}
          title="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="page-header-title-box">
          <h1 className="page-header-title">#{tag}</h1>
          <span className="page-header-subtitle">
            {totalPosts} {totalPosts === 1 ? 'Chirp' : 'Chirps'} with this hashtag
          </span>
        </div>
      </header>

      <div className="feed-posts-list">
        {isLoading ? (
          <div className="feed-skeleton-loader">
            <div className="skeleton-item" />
            <div className="skeleton-item" />
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onDeleteSuccess={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
            />
          ))
        ) : (
          <div className="feed-empty-state">
            <Hash size={40} className="empty-icon" />
            <h3>No chirps tagged with #{tag} yet</h3>
            <p>Be the first in your college community to post with this hashtag!</p>
          </div>
        )}
      </div>
    </div>
  );
}
