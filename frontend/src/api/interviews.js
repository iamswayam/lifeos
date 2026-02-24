import api from './axios'

export const getInterviews  = (params)   => api.get('/interviews/', { params })
export const getInterview   = (id)       => api.get(`/interviews/${id}/`)
export const createInterview = (data)    => api.post('/interviews/', data)
export const updateInterview = (id, data) => api.put(`/interviews/${id}/`, data)
export const deleteInterview = (id)      => api.delete(`/interviews/${id}/`)
export const getUpcoming    = ()         => api.get('/interviews/upcoming/')
export const addFeedback    = (id, data) => api.patch(`/interviews/${id}/add-feedback/`, data)
export const getSummary     = ()         => api.get('/interviews/summary/')