import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import {
  GraduationCap,
  LogOut,
  Plus,
  Search,
  X,
  Edit3,
  Trash2,
  Briefcase,
  Calendar,
  Code,
  BookOpen,
  Users,
  FolderGit2,
  Megaphone,
  Loader2,
  FileText,
  Clock,
  User,
} from "lucide-react";

const API_URL = "http://localhost:5001/api";

const CATEGORIES = [
  { value: "all", label: "All", icon: Megaphone },
  { value: "event", label: "Event", icon: Calendar },
  { value: "internship", label: "Internship", icon: Briefcase },
  { value: "hackathon", label: "Hackathon", icon: Code },
  { value: "academic", label: "Academic", icon: BookOpen },
  { value: "club", label: "Club", icon: Users },
  { value: "project", label: "Project", icon: FolderGit2 },
  { value: "other", label: "Other", icon: Megaphone },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  event: "clay-pill-events",
  internship: "clay-pill-internships",
  hackathon: "clay-pill-hackathons",
  academic: "clay-pill-academics",
  club: "clay-pill-general",
  project: "clay-pill-events",
  other: "clay-pill-general",
};

type Category = "event" | "internship" | "hackathon" | "academic" | "club" | "project" | "other";

interface Notice {
  _id: string;
  title: string;
  description: string;
  category: string;
  userId: string;
  authorName: string;
  createdAt: string;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function Dashboard() {
  const { user, signOut, getToken } = useAuth();
  const navigate = useNavigate();

  // State
  const [notices, setNotices] = useState<Notice[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState<Category>("other");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch notices from Express API
  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (activeCategory !== "all") params.append("category", activeCategory);
      if (search.trim()) params.append("search", search.trim());

      const url = `${API_URL}/posts${params.toString() ? `?${params}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch notices");
      const data = await response.json();
      setNotices(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, search]);

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  // Reset form
  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormCategory("other");
    setFormError("");
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (notice: Notice) => {
    setEditingNotice(notice);
    setFormTitle(notice.title);
    setFormDescription(notice.description);
    setFormCategory(notice.category as Category);
    setFormError("");
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setEditingNotice(null);
    resetForm();
  };

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formTitle.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!formDescription.trim()) {
      setFormError("Description is required.");
      return;
    }
    if (!formCategory) {
      setFormError("Category is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription.trim(),
          category: formCategory,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create notice");
      }

      closeModals();
      fetchNotices();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create notice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formTitle.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!formDescription.trim()) {
      setFormError("Description is required.");
      return;
    }
    if (!formCategory) {
      setFormError("Category is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/posts/${editingNotice?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription.trim(),
          category: formCategory,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update notice");
      }

      closeModals();
      fetchNotices();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update notice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (noticeId: string) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/posts/${noticeId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) throw new Error("Failed to delete notice");
      setDeleteConfirm(null);
      fetchNotices();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const isModalOpen = showCreateModal || editingNotice !== null;

  return (
    <div className="min-h-screen clay-gradient-hero">
      {/* Navbar */}
      <nav className="clay-nav sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="clay-btn-primary w-9 h-9 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:block">
              UniQuest
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search notices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="clay-input pl-10 pr-4 py-2.5 text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-semibold text-muted-foreground hidden sm:block">
              {user?.name || "Student"}
            </span>
            <button
              className="clay-btn px-3 py-2 text-sm font-semibold flex items-center gap-1.5"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Header + Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Notice Board
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Browse and share campus notices
            </p>
          </div>
          <button
            className="clay-btn-primary px-5 py-2.5 text-sm font-bold flex items-center gap-2 self-start"
            onClick={openCreateModal}
          >
            <Plus className="w-4 h-4" />
            Create Post
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-1 px-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`clay-pill flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeCategory === cat.value
                  ? "ring-2 ring-primary shadow-lg"
                  : "opacity-70 hover:opacity-100"
              }`}
              onClick={() => setActiveCategory(cat.value)}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="clay text-center py-12 px-6 mb-6">
            <p className="text-destructive font-medium mb-2">⚠️ {error}</p>
            <button
              className="clay-btn-primary px-4 py-2 text-sm font-bold"
              onClick={fetchNotices}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground font-medium">
              Loading notices...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && notices.length === 0 && (
          <div className="clay text-center py-16 px-8">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-2">No notices yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              {search
                ? `No results found for "${search}". Try a different search term.`
                : "Be the first to share something with your campus community!"}
            </p>
            {!search && (
              <button
                className="clay-btn-primary px-5 py-2.5 text-sm font-bold inline-flex items-center gap-2"
                onClick={openCreateModal}
              >
                <Plus className="w-4 h-4" />
                Create First Post
              </button>
            )}
          </div>
        )}

        {/* Post Cards Grid */}
        {!isLoading && notices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {notices.map((notice) => (
              <div key={notice._id} className="clay-post">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className={`clay-pill text-xs ${CATEGORY_COLORS[notice.category] || "clay-pill-general"}`}
                  >
                    {notice.category.charAt(0).toUpperCase() +
                      notice.category.slice(1)}
                  </span>
                  {notice.userId === user?._id && (
                    <div className="flex items-center gap-1.5">
                      <button
                        className="clay-btn p-2 rounded-lg"
                        onClick={() => openEditModal(notice)}
                        title="Edit notice"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="clay-btn-danger px-2.5 py-2 rounded-lg"
                        onClick={() => setDeleteConfirm(notice._id)}
                        title="Delete notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold mb-2 leading-snug">
                  {notice.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                  {notice.description}
                </p>

                {/* Footer */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/50">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {notice.authorName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(notice.createdAt)}
                  </span>
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === notice._id && (
                  <div className="clay-inset mt-4 p-3">
                    <p className="text-sm font-medium mb-3">
                      Delete this notice?
                    </p>
                    <div className="flex gap-2">
                      <button
                        className="clay-btn-danger px-4 py-2 text-xs font-bold flex-1"
                        onClick={() => handleDelete(notice._id)}
                      >
                        Yes, Delete
                      </button>
                      <button
                        className="clay-btn px-4 py-2 text-xs font-bold flex-1"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 clay-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModals();
          }}
        >
          <div className="clay w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold">
                {editingNotice ? "Edit Notice" : "Create Notice"}
              </h2>
              <button
                className="clay-btn p-2 rounded-xl"
                onClick={closeModals}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingNotice ? handleEdit : handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hackathon 2025 Registration"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="clay-input"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Category)}
                    className="clay-select"
                  >
                    <option value="event">Event</option>
                    <option value="internship">Internship</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="academic">Academic</option>
                    <option value="club">Club</option>
                    <option value="project">Project</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Description *
                  </label>
                  <textarea
                    placeholder="Write the details of your notice..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="clay-textarea"
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {formDescription.length}/1000
                  </p>
                </div>

                {formError && (
                  <div className="clay-inset p-3 text-sm text-destructive font-medium">
                    {formError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="clay-btn-primary flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {editingNotice ? "Saving..." : "Posting..."}
                      </>
                    ) : (
                      <>
                        {editingNotice ? "Save Changes" : "Post Notice"}
                        <Plus className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="clay-btn px-6 py-3 text-sm font-semibold"
                    onClick={closeModals}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
