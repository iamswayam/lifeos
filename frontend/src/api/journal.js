import api from './axios'

export const getEntries    = (params) => api.get('/journal/entries/', { params })
export const getEntry      = (id)     => api.get(`/journal/entries/${id}/`)
export const createEntry   = (data)   => api.post('/journal/entries/', data)
export const updateEntry   = (id, data) => api.put(`/journal/entries/${id}/`, data)
export const deleteEntry   = (id)     => api.delete(`/journal/entries/${id}/`)
export const getMoodSummary = ()      => api.get('/journal/entries/moods/')