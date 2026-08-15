import http from '@/axios/index.js';

export function tagList() {
    return http.get('/tag/list')
}

export function tagAdd(tagName, color) {
    return http.post('/tag/add', {tagName, color})
}

export function tagUpdate(tagId, params) {
    return http.put('/tag/update', {tagId, ...params})
}

export function tagDelete(tagId) {
    return http.delete('/tag/delete', {params: {tagId}})
}

export function tagBind(emailIds, tagId) {
    return http.post('/tag/bind', {emailIds, tagId})
}

export function tagUnbind(emailIds) {
    return http.post('/tag/unbind', {emailIds})
}
