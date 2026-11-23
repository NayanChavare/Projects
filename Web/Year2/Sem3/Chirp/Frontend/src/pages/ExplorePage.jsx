import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, Sparkles, TrendingUp, Search } from 'lucide-react';
import { fetchExploreFeed, fetchTrendingHashtags } from '../services/api';
import { PostCard } from '../components/PostCard';

export function ExplorePage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [postsRes, trendingRes] = await Promise.all([
          fetchExploreFeed(1, 20),
          fetchTrendingHashtags(),
        ]);

        if (postsRes.ok && postsRes.data?.posts) {
          setPosts(postsRes.data.posts);
        }
        if (trendingRes.ok && trendingRes.data?.trending) {
          setTrending(trendingRes.data.trending);
        }
      } catch (err) {
        console.error('Error loading explore data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredPosts = posts.filter((p) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    const matchesContent = p.content?.toLowerCase().includes(q);
    const matchesAuthor = p.author?.name?.toLowerCase().includes(q) || p.author?.handle?.toLowerCase().includes(q);
    const matchesTag = Array.isArray(p.hashtags) && p.hashtags.some((t) => t.toLowerCase().includes(q));
    return matchesContent || matchesAuthor || matchesTag;
  });

  return (
    <div className="explore-view">
      <header className="explore-header-sticky">
        <h1 className="feed-title">Explore Campus</h1>
        <div className="explore-search-input-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search keywords, #hashtags, classmates..."
            className="search-input"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Trending Banner Carousel / Grid */}
      {trending.length > 0 && !filterQuery && (
        <section className="explore-trending-banner">
          <div className="banner-title-row">
            <TrendingUp size={20} className="banner-icon" />
            <h2>Trending on Campus in 24 Hours</h2>
          </div>
          <div className="trending-chips-row">
            {trending.map((t) => (
              <div
                key={t.tag}
                className="trending-chip-card"
                onClick={() => navigate(`/hashtag/${t.tag}`)}
              >
                <div className="chip-tag-title">#{t.tag}</div>
                <div className="chip-tag-sub">{t.count} {t.count === 1 ? 'chirp' : 'chirps'}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Explore Posts Feed */}
      <div className="feed-posts-list">
        {isLoading ? (
          <div className="feed-skeleton-loader">
            <div className="skeleton-item" />
            <div className="skeleton-item" />
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onDeleteSuccess={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
            />
          ))
        ) : (
          <div className="feed-empty-state">
            <Hash size={38} className="empty-icon" />
            <h3>No results found</h3>
            <p>Try searching for a different keyword or hashtag.</p>
          </div>
        )}
      </div>
    </div>
  );
}
