import { defineStore } from 'pinia'
import {tagList} from '@/request/tag.js'

export const useTagStore = defineStore('tag', {
    state: () => ({
        tags: [],
        loaded: false
    }),
    actions: {
        async load(force = false) {
            if (this.loaded && !force) {
                return
            }
            const data = await tagList()
            this.tags = data.list
            this.loaded = true
        },
        tagName(tagId) {
            const row = this.tags.find(item => item.tagId === tagId)
            return row ? row.tagName : ''
        },
        tagColor(tagId) {
            const row = this.tags.find(item => item.tagId === tagId)
            return row ? row.color : ''
        }
    }
})
