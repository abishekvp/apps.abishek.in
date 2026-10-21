import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import UpcomingRoadmap from './components/UpcomingRoadmap';
import CommunitySection from './components/CommunitySection';
import Footer from './components/Footer';

import RequestModal from './components/Modals/RequestModal';
import BugModal from './components/Modals/BugModal';
import ContactModal from './components/Modals/ContactModal';
import NotifyModal from './components/Modals/NotifyModal';
import AuthModal from './components/Modals/AuthModal';
import AccountDrawer from './components/Modals/AccountDrawer';

import { useToast } from './context/ToastContext';

export default function App() {
  const { showToast } = useToast();

  const [tools, setTools] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortOption, setSortOption] = useState('popular');

  // Modals state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [bugModalOpen, setBugModalOpen] = useState(false);
  const [selectedBugToolSlug, setSelectedBugToolSlug] = useState('');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [selectedNotifyTool, setSelectedNotifyTool] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('signin');
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);

  // Fetch initial tools and community requests
  const fetchTools = async () => {
    try {
      const res = await fetch('/api/tools');
      if (res.ok) {
        const data = await res.json();
        setTools(data.tools || []);
      }
    } catch (err) {
      console.error('Failed to load tools:', err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    }
  };

  useEffect(() => {
    Promise.all([fetchTools(), fetchRequests()]).finally(() => {
      setLoading(false);
    });
  }, []);

  // Filter and sort active tools for Catalog
  const filteredTools = useMemo(() => {
    let result = [...tools];

    // Filter by category
    if (activeCategory === 'upcoming') {
      result = result.filter((t) => t.is_upcoming);
    } else if (activeCategory !== 'all') {
      result = result.filter((t) => !t.is_upcoming && t.category === activeCategory);
    } else {
      // 'all' shows released active tools
      result = result.filter((t) => !t.is_upcoming);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => {
        const nameMatch = t.name?.toLowerCase().includes(q);
        const descMatch = t.short_desc?.toLowerCase().includes(q);
        const slugMatch = t.slug?.toLowerCase().includes(q);
        const tagMatch = Array.isArray(t.tags) && t.tags.some((tag) => tag.toLowerCase().includes(q));
        const featMatch = Array.isArray(t.features) && t.features.some((f) => f.toLowerCase().includes(q));
        const suggestedMatch = t.suggested_by && t.suggested_by.toLowerCase().includes(q);
        return nameMatch || descMatch || slugMatch || tagMatch || featMatch || suggestedMatch;
      });
    }

    // Sort tools
    if (sortOption === 'popular') {
      result.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));
    } else if (sortOption === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'newest') {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [tools, activeCategory, searchQuery, sortOption]);

  // Live tools for hero floating ribbon
  const liveTools = useMemo(() => {
    return tools.filter((t) => !t.is_upcoming && !t.is_hidden);
  }, [tools]);

  // Upcoming tools for roadmap section
  const upcomingTools = useMemo(() => {
    return tools.filter((t) => t.is_upcoming && !t.is_hidden);
  }, [tools]);

  // Tool voting / liking
  const handleLikeTool = async (toolId) => {
    try {
      const res = await fetch(`/api/tools/${toolId}/vote`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register upvote');

      setTools((prev) =>
        prev.map((t) =>
          t.id === toolId ? { ...t, votes_count: (t.votes_count || 0) + 1, has_voted: true } : t
        )
      );
      showToast('Thank you for upvoting this tool!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Community request voting
  const handleVoteRequest = async (requestId) => {
    try {
      const res = await fetch(`/api/requests/${requestId}/vote`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upvote request');

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, votes_count: (r.votes_count || 0) + 1, has_voted: true } : r
        )
      );
      showToast('Upvote counted for this tool request!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Open notification modal for a specific upcoming tool or general
  const handleOpenNotify = (slug, name) => {
    if (slug) {
      const tool = tools.find((t) => t.slug === slug) || { slug, name: name || slug };
      setSelectedNotifyTool(tool);
    } else {
      setSelectedNotifyTool(null);
    }
    setNotifyModalOpen(true);
  };

  // Open bug modal for a specific tool or general
  const handleOpenBug = (slug) => {
    setSelectedBugToolSlug(typeof slug === 'string' ? slug : '');
    setBugModalOpen(true);
  };

  return (
    <div className="hub-layout">
      {/* Header */}
      <Header
        onOpenRequest={() => setRequestModalOpen(true)}
        onOpenBug={() => handleOpenBug('')}
        onOpenContact={() => setContactModalOpen(true)}
        onOpenAuth={() => {
          setAuthModalTab('signin');
          setAuthModalOpen(true);
        }}
        onOpenAccount={() => setAccountDrawerOpen(true)}
      />

      <main className="hub-main">
        {/* Hero Section with Search Bar at bottom */}
        <Hero
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectTag={(tag) => setSearchQuery(tag)}
        />

        {/* Catalog Section with Category Filter Tabs, Sort, and Wide Tool Cards */}
        <Catalog
          tools={filteredTools}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          sortOption={sortOption}
          setSortOption={setSortOption}
          onLikeTool={handleLikeTool}
          onOpenNotify={handleOpenNotify}
          onOpenRequest={() => setRequestModalOpen(true)}
        />

        {/* Upcoming Tools & Roadmap */}
        <UpcomingRoadmap
          upcomingTools={upcomingTools}
          onOpenNotify={handleOpenNotify}
        />

        {/* Community Requests Section with Requester Profile Spotlight */}
        <CommunitySection
          requests={requests}
          onOpenRequest={() => setRequestModalOpen(true)}
          onVoteRequest={handleVoteRequest}
          liveTools={liveTools}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenRequest={() => setRequestModalOpen(true)}
        onOpenBug={() => handleOpenBug('')}
        onOpenContact={() => setContactModalOpen(true)}
      />

      {/* Modals & Dialogs */}
      <RequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onRequestSubmitted={fetchRequests}
      />

      <BugModal
        isOpen={bugModalOpen}
        onClose={() => setBugModalOpen(false)}
        initialToolSlug={selectedBugToolSlug}
        tools={tools}
      />

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />

      <NotifyModal
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
        tool={selectedNotifyTool}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />

      <AccountDrawer
        isOpen={accountDrawerOpen}
        onClose={() => setAccountDrawerOpen(false)}
      />
    </div>
  );
}
