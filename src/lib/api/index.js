import api from '@/lib/axios';

/**
 * Structured API service layer.
 * Single source of truth for all API endpoints — eliminates
 * inline URL string construction throughout pages.
 */

// ─── Auth API ───────────────────────────────────────────────

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth'),
  getUserByRoll: (roll) => api.get(`/auth/user/${roll}`),
  updatePlacementStatus: (data) => api.put('/auth/placement-status', data),
  updateSocialLinks: (data) => api.put('/auth/social-links', data),
};

// ─── Post API ───────────────────────────────────────────────

export const postApi = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page);
    if (params.company) searchParams.set('company', params.company);
    if (params.postType) searchParams.set('postType', params.postType);
    const query = searchParams.toString();
    return api.get(`/posts${query ? `?${query}` : ''}`);
  },
  getByStudent: (roll, params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page);
    if (params.limit) searchParams.set('limit', params.limit);
    const query = searchParams.toString();
    return api.get(`/posts/student/${roll}${query ? `?${query}` : ''}`);
  },
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),

  // Comments
  addComment: (postId, data) => api.post(`/posts/${postId}/comment`, data),
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comment/${commentId}`),

  // Replies
  addReply: (postId, commentId, data) =>
    api.post(`/posts/${postId}/comment/${commentId}/reply`, data),
  deleteReply: (postId, commentId, replyId) =>
    api.delete(`/posts/${postId}/comment/${commentId}/reply/${replyId}`),

  // Reactions
  togglePostReaction: (postId, data) => api.post(`/posts/${postId}/reaction`, data),
  toggleCommentReaction: (postId, commentId, data) =>
    api.post(`/posts/${postId}/comment/${commentId}/reaction`, data),
  toggleReplyReaction: (postId, commentId, replyId, data) =>
    api.post(`/posts/${postId}/comment/${commentId}/reply/${replyId}/reaction`, data),
};

// ─── Stats API ──────────────────────────────────────────────

export const statsApi = {
  get: () => api.get('/stats'),
};

// ─── User API ───────────────────────────────────────────────

export const userApi = {
  search: (id) => api.get(`/users/search/${id}`),
};
