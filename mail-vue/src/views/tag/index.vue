<template>
  <div class="tag">
    <div class="header-actions">
      <Icon class="icon" icon="ion:add-outline" width="23" height="23" @click="openAdd"/>
      <Icon class="icon" icon="ion:reload" width="18" height="18" @click="refresh"/>
    </div>

    <el-scrollbar class="scrollbar">
      <div class="tag-box">
        <div class="tag-item" v-for="item in tagList">
          <div class="tag-info">
            <span class="tag-dot" :style="{background: item.color || '#1890ff'}"></span>
            <span class="tag-name">{{ item.tagName }}</span>
            <span class="tag-count">{{ $t('tagEmailCount', {count: item.emailCount}) }}</span>
          </div>
          <div class="tag-actions">
            <el-dropdown class="setting">
              <Icon icon="fluent:settings-24-filled" width="21" height="21" color="#909399"/>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="openEdit(item)">{{ $t('edit') }}</el-dropdown-item>
                  <el-dropdown-item @click="deleteTag(item)">{{ $t('delete') }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
      <div class="empty" v-if="tagList.length === 0">
        <el-empty :image-size="isMobile ? 120 : null" :description="$t('noTagFound')"/>
      </div>
    </el-scrollbar>

    <el-dialog v-model="showDialog" :title="editForm.tagId ? $t('editTag') : $t('addTag')">
      <div class="container">
        <el-input v-model="editForm.tagName" :placeholder="$t('tagNamePlaceholder')" maxlength="20"/>
        <div class="color-row">
          <span>{{ $t('tagColor') }}</span>
          <el-color-picker v-model="editForm.color"/>
        </div>
        <el-button class="btn" type="primary" @click="submit" :loading="addLoading">{{ $t('save') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import {defineOptions, onMounted, reactive, ref} from "vue"
import {Icon} from "@iconify/vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {tagAdd, tagDelete, tagList as fetchTagList, tagUpdate} from "@/request/tag.js";
import {useTagStore} from "@/store/tag.js";
import {useI18n} from "vue-i18n";

defineOptions({
  name: 'tag'
})

const {t} = useI18n();
const tagStore = useTagStore();
const tagList = ref([]);
const isMobile = ref(innerWidth < 1367);
const showDialog = ref(false);
const addLoading = ref(false);
const editForm = reactive({
  tagId: null,
  tagName: '',
  color: '#1890ff'
})

onMounted(() => {
  refresh()
})

function refresh() {
  fetchTagList().then(data => {
    tagList.value = data.list;
    tagStore.load(true);
  })
}

function openAdd() {
  editForm.tagId = null;
  editForm.tagName = '';
  editForm.color = '#1890ff';
  showDialog.value = true;
}

function openEdit(item) {
  editForm.tagId = item.tagId;
  editForm.tagName = item.tagName;
  editForm.color = item.color || '#1890ff';
  showDialog.value = true;
}

function submit() {
  if (!editForm.tagName) {
    ElMessage.warning(t('tagNameRequiredMsg'));
    return;
  }
  addLoading.value = true;
  const params = {tagName: editForm.tagName, color: editForm.color};
  const req = editForm.tagId ? tagUpdate(editForm.tagId, params) : tagAdd(editForm.tagName, editForm.color);
  req.then(() => {
    ElMessage({message: t('saveSuccessMsg'), type: 'success', plain: true});
    showDialog.value = false;
    refresh();
  }).catch(() => {
  }).finally(() => {
    addLoading.value = false;
  })
}

function deleteTag(item) {
  ElMessageBox.confirm(t('delTagConfirm'), {
    confirmButtonText: t('confirm'),
    cancelButtonText: t('cancel'),
    type: 'warning'
  }).then(() => {
    tagDelete(item.tagId).then(() => {
      ElMessage({message: t('delSuccessMsg'), type: 'success', plain: true});
      refresh();
    })
  })
}
</script>

<style lang="scss" scoped>
.tag {
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;

  .header-actions {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 8px 15px;
    box-shadow: var(--header-actions-border);

    .icon {
      font-size: 18px;
      cursor: pointer;
    }
  }

  .scrollbar {
    height: 100%;
  }

  .tag-box {
    padding: 10px;
  }

  .tag-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-radius: 8px;
    margin-bottom: 8px;
    transition: background 0.15s ease-in-out;

    &:hover {
      background: var(--email-hover-background);
    }

    .tag-info {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;

      .tag-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .tag-name {
        font-size: 14px;
        color: var(--el-text-color-primary);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .tag-count {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .color-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      color: var(--el-text-color-primary);
    }

    .btn {
      align-self: flex-end;
    }
  }
}
</style>
