import api from './axios'

export const getTodos      = (params) => api.get('/todos/', { params })
export const createTodo    = (data)   => api.post('/todos/', data)
export const updateTodo    = (id, data) => api.put(`/todos/${id}/`, data)
export const deleteTodo    = (id)     => api.delete(`/todos/${id}/`)
export const toggleStatus  = (id)     => api.patch(`/todos/${id}/toggle_status/`)
export const getTodoSummary = ()      => api.get('/todos/summary/')