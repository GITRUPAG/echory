import api from './api';

export const userApi = {

  // 📝 REGISTER USER
  // POST /api/users/register
  register: (userData) =>
    api.post('/users/register', userData),

  // 🔐 LOGIN (username OR email)
  // POST /api/users/login
  login: (usernameOrEmail, password) =>
    api.post('/users/login', {
      usernameOrEmail,
      password,
    }),

  // 👤 GET PUBLIC USER PROFILE (by username)
  // GET /api/users/{username}
  getUserByUsername: (username) =>
    api.get(`/users/${username}`),

  // 🙋‍♀️ GET CURRENT LOGGED-IN USER
  // GET /api/users/me
  getCurrentUser: () =>
    api.get('/users/me'),

  uploadProfilePicture: (formData) =>
  api.post('/users/me/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  // ✏️ Update profile (username/email/password)
    updateProfile: (data) =>
    api.put('/users/me', data),

    // 🗑️ REMOVE PROFILE PICTURE (auth)
    // DELETE /api/users/me/profile-picture
    removeProfilePicture: () =>
      api.delete('/users/me/profile-picture'),



};
