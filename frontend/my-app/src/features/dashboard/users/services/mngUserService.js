import apiConst from '../../../../services/apiConst.js';

export const mngUserService = {
    getAll: () => apiConst.get('/users'),
    getById: (id) => apiConst.get(`/users/${id}`),
    create: (userData) => apiConst.post('/users/register', userData),
    update: (id, userData) => apiConst.put(`/users/${id}`, userData),
    delete: (id) => apiConst.delete(`/users/${id}`)
};

export default mngUserService;