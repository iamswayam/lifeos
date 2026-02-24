import api from './axios'

export const register       = (data) => api.post('/auth/register/', data)
export const login          = (data) => api.post('/auth/login/', data)
export const logout         = (data) => api.post('/auth/logout/', data)
export const getMe          = ()     => api.get('/auth/me/')
export const updateProfile = (data) => {
  const isFormData = data instanceof FormData
  return api.patch('/auth/me/', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
  })
}
export const changePassword = (data) => api.post('/auth/change-password/', data)