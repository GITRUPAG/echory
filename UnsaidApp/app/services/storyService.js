import api from './api';

export const storyService = {

  // 📝 CREATE STORY (auth)
  // POST /api/stories
createStory: async ({
  title,
  content,
  visibility = 'PUBLIC',
  category = 'GENERAL',
  anonymous = false,
  images = [], // array of selected images (optional)
}) => {
  const formData = new FormData();

  // Send story as JSON string
  formData.append(
    "story",
    JSON.stringify({
      title,
      content,
      visibility,
      category,
      anonymous,
    })
  );

  // Attach images only if provided
  images.forEach((img, index) => {
    formData.append("images", {
      uri: img.uri,
      name: `image_${index}.jpg`,
      type: "image/jpeg",
    });
  });

  return api.post("/stories", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
},



  // 🏠 GET PUBLIC STORIES (paginated)
  // GET /api/stories/paged
  getStories: (page = 0, size = 10) =>
    api.get(`/stories/paged?page=${page}&size=${size}`),

  // 🔖 GET STORIES BY HASHTAG (public)
  // GET /api/stories/hashtag/{tag}
  getStoriesByHashtag: (tag) =>
    api.get(`/stories/hashtag/${tag}`),

  // ❤️ REACT TO STORY (auth)
  // POST /api/stories/{storyId}/reactions
  reactToStory: (storyId, type = 'like') =>
    api.post(`/stories/${storyId}/reactions`, { type }),

  // 💬 ADD COMMENT (auth)
  // POST /api/stories/{storyId}/comments
  addComment: (storyId, text) =>
    api.post(`/stories/${storyId}/comments`, { text }),
  
  deleteComment: (storyId, commentId) =>
  api.delete(`/stories/${storyId}/comments/${commentId}`),

  // 💬 GET COMMENTS (paginated)
  // GET /api/stories/{storyId}/comments/paged
  getComments: (storyId, page = 0, size = 5) =>
    api.get(
      `/stories/${storyId}/comments/paged?page=${page}&size=${size}`
    ),

  // ❤️ LIKE / UNLIKE COMMENT (auth)
  // POST /api/stories/{storyId}/comments/{commentId}/like
  toggleCommentLike: (storyId, commentId) =>
    api.post(`/stories/${storyId}/comments/${commentId}/like`),

  // GET /api/stories/my/public
  getMyPublicStories: () =>
    api.get('/stories/my/public'),

  // 🔒 GET MY PRIVATE STORIES (auth)
  // GET /api/stories/my/private
  getMyPrivateStories: () =>
    api.get('/stories/my/private'),

  getStoryById: (id) => api.get(`/stories/${id}`),

  editStory: (id, data) =>
  api.put(`/stories/${id}`, data),

deleteStory: (id) =>
  api.delete(`/stories/${id}`),
// 🔒 Toggle story visibility
toggleVisibility: (storyId) =>
  api.patch(`/stories/${storyId}/visibility`),
// 🗂️ GET STORIES BY CATEGORY (public)
  getStoriesByCategory: (category) =>
    api.get(`/stories/category/${category}`),
searchStories: (query, page = 0, size = 10) =>
  api.get(`/stories/search?q=${query}&page=${page}&size=${size}`),
// 🔖 Toggle bookmark
toggleBookmark: (storyId) =>
  api.post(`/bookmarks/${storyId}`),

// 📚 Get my bookmarks
getMyBookmarks: () =>
  api.get('/bookmarks/me'),

getTrendingStories: () =>
  api.get('/stories/trending'),

getMostLikedStories: () =>
  api.get('/stories/most-liked'),

getPersonalizedFeed: () => api.get('/stories/feed'),


};
