<template>
  <el-scrollbar class="scroll">
    <div>
      <div class="title" >
        <Icon icon="mdi:email-outline" width="24" height="24" />
        <div>{{settingStore.settings.title}}</div>
      </div>
      <el-menu :collapse="false" text-color="#fff" active-text-color="#fff" style="margin-top: 10px">
        <el-menu-item @click="router.push({name: 'email'})" index="email"
                      :class="route.meta.name === 'email' ? 'choose-item' : ''">
          <Icon icon="hugeicons:mailbox-01" width="20" height="20" />
          <span class="menu-name" style="margin-left: 16px">{{$t('inbox')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'send'})" index="send" v-perm="'email:send'"
                      :class="route.meta.name === 'send' ? 'choose-item' : ''">
          <Icon icon="cil:send" width="20" height="20" />
          <span class="menu-name" style="margin-left: 16px">{{$t('sent')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'draft'})" index="draft" v-perm="'email:send'"
                      :class="route.meta.name === 'draft' ? 'choose-item' : ''">
          <Icon icon="ep:document" width="19" height="19" />
          <span class="menu-name" style="margin-left: 17px">{{$t('drafts')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'star'})" index="star"
                      :class="route.meta.name === 'star' ? 'choose-item' : ''">
          <Icon icon="solar:star-line-duotone" width="20" height="20" />
          <span class="menu-name" style="margin-left: 16px">{{$t('starred')}}</span>
        </el-menu-item>
        <div class="manage-title tag-title">
          <div class="tag-title-left">{{$t('tags')}}</div>
          <Icon icon="fluent:tag-edit-24-regular" width="17" height="17" class="tag-manage-icon"
                @click.stop="router.push({name: 'tag'})"/>
        </div>
        <el-menu-item @click="router.push({name: 'email', query: {tagId: -1}})" index="tag-all"
                      :class="String(route.query.tagId) === '-1' ? 'choose-item' : ''">
          <Icon icon="fluent:mail-all-20-regular" width="20" height="20" />
          <span class="menu-name" style="margin-left: 21px">{{$t('tagAll')}}</span>
        </el-menu-item>
        <el-menu-item v-for="tag in tagStore.tags" :key="tag.tagId"
                      @click="router.push({name: 'email', query: {tagId: tag.tagId}})"
                      :index="'tag-' + tag.tagId"
                      :class="String(route.query.tagId) === String(tag.tagId) ? 'choose-item' : ''">
          <span class="tag-dot" :style="{background: tag.color || '#1890ff'}"></span>
          <span class="menu-name tag-menu-name">
            <span class="tag-menu-label">{{tag.tagName}}</span>
            <span class="tag-menu-count">{{tag.emailCount}}</span>
            <span class="tag-menu-actions">
              <Icon class="tag-menu-icon" icon="fluent:rename-16-regular" width="15" height="15"
                    @click.stop="rename(tag)"/>
              <Icon class="tag-menu-icon danger" icon="fluent:delete-16-regular" width="15" height="15"
                    @click.stop="remove(tag)"/>
            </span>
          </span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'setting'})" index="setting"
                      :class="route.meta.name === 'setting' ? 'choose-item' : ''">
          <Icon icon="fluent:settings-48-regular" width="20" height="20" />
          <span class="menu-name" style="margin-left: 16px">{{$t('settings')}}</span>
        </el-menu-item>
        <div class="manage-title" v-perm="['all-email:query','user:query','role:query','setting:query','analysis:query','reg-key:query']">
          <div>{{$t('manage')}}</div>
        </div>
        <el-menu-item @click="router.push({name: 'analysis'})" index="analysis" v-perm="'analysis:query'"
                      :class="route.meta.name === 'analysis' ? 'choose-item' : ''">
          <Icon icon="fluent:data-pie-20-regular" width="24" height="24" />
          <span class="menu-name" style="margin-left: 13px">{{$t('analytics')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'user'})" index="setting" v-perm="'user:query'"
                      :class="route.meta.name === 'user' ? 'choose-item' : ''">
          <Icon icon="si:user-alt-2-line" width="20" height="20" />
          <span class="menu-name" style="margin-left: 16px">{{$t('allUsers')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'all-email'})" index="all-email" v-perm="'all-email:query'"
                      :class="route.meta.name === 'all-email' ? 'choose-item' : ''">
          <Icon icon="fluent:mail-list-28-regular" width="22" height="22" />
          <span class="menu-name" style="margin-left: 15px">{{$t('allMail')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'role'})" index="setting" v-perm="'role:query'"
                      :class="route.meta.name === 'role' ? 'choose-item' : ''">
          <Icon icon="fluent:lock-closed-16-regular" width="22" height="22" />
          <span class="menu-name" style="margin-left: 15px">{{$t('permissions')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'reg-key'})" index="reg-key" v-perm="'reg-key:query'"
                      :class="route.meta.name === 'reg-key' ? 'choose-item' : ''">
          <Icon icon="fluent:fingerprint-20-filled" width="22" height="22" />
          <span class="menu-name" style="margin-left: 15px">{{$t('inviteCode')}}</span>
        </el-menu-item>
        <el-menu-item @click="router.push({name: 'sys-setting'})" index="sys-setting" v-perm="'setting:query'"
                      :class="route.meta.name === 'sys-setting' ? 'choose-item' : ''">
          <Icon icon="eos-icons:system-ok-outlined" width="18" height="18" style="margin-left: 2px" />
          <span class="menu-name" style="margin-left: 17px">{{$t('SystemSettings')}}</span>
        </el-menu-item>
      </el-menu>
    </div>
  </el-scrollbar>
</template>

<script setup>
import router from "@/router/index.js";
import { useRoute } from "vue-router";
import {Icon} from "@iconify/vue";
import {useSettingStore} from "@/store/setting.js";
import {useTagStore} from "@/store/tag.js";
import {onMounted} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {useI18n} from "vue-i18n";
import {tagDelete, tagUpdate} from "@/request/tag.js";

const settingStore = useSettingStore();
const tagStore = useTagStore();
const route = useRoute();
const {t} = useI18n();

onMounted(() => {
  tagStore.load();
})

function rename(tag) {
  ElMessageBox.prompt(t('renameTag'), t('renameTag'), {
    inputValue: tag.tagName,
    inputPlaceholder: t('tagNamePlaceholder'),
    inputValidator: value => !!value && !!value.trim() ? true : t('tagNameRequiredMsg'),
    confirmButtonText: t('confirm'),
    cancelButtonText: t('cancel')
  }).then(({value}) => {
    tagUpdate(tag.tagId, {tagName: value.trim()}).then(() => {
      ElMessage({message: t('saveSuccessMsg'), type: 'success', plain: true});
      tagStore.load(true);
    })
  }).catch(() => {});
}

function remove(tag) {
  ElMessageBox.confirm(t('delTagConfirm'), {
    confirmButtonText: t('confirm'),
    cancelButtonText: t('cancel'),
    type: 'warning'
  }).then(() => {
    tagDelete(tag.tagId).then(() => {
      ElMessage({message: t('delSuccessMsg'), type: 'success', plain: true});
      // 正在看的就是这个标签时，回到「全部邮件」，避免停留在已失效的过滤条件上
      if (String(route.query.tagId) === String(tag.tagId)) {
        router.push({name: 'email', query: {tagId: -1}});
      }
      tagStore.load(true);
    })
  }).catch(() => {});
}

</script>

<style lang="scss" scoped>

.title {
  margin: 15px 10px;
  height: 45px;
  border-radius: 6px;
  display: flex;
  position: relative;
  font-size: 16px;
  font-weight: bold;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #ffffff;
  background: linear-gradient(135deg, #1890ff, #3a80dd);
  transition: all 0.3s ease;
  max-width: 240px;
  padding: 0 10px;
  > div {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: calc(240px - 20px - 30px);
  }

  :deep(.el-icon) {
    flex-shrink: 0;
    font-size: 20px;
  }

  .user-right-icon {
    align-self: center;
    position: absolute;
    font-size: 12px;
    right: 8px;
    color: #ffffff;
  }

}


.manage-title {
  margin-top: 10px;
  padding-left: 20px;
  color: #fff;
}

.tag-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 20px;

  .tag-title-left {
    font-size: 13px;
    opacity: 0.8;
  }

  .tag-manage-icon {
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }
}

.tag-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-left: 2px;
}

.tag-menu-name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  min-width: 0;

  .tag-menu-label {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .tag-menu-count {
    font-size: 12px;
    opacity: 0.7;
    margin-left: 8px;
  }
}

.tag-menu-actions {
  display: none;
  align-items: center;
  gap: 10px;
  margin-left: 8px;
  flex-shrink: 0;
}

.tag-menu-icon {
  cursor: pointer;
  opacity: 0.75;

  &:hover {
    opacity: 1;
  }

  &.danger:hover {
    color: #f56c6c;
  }
}

@media (hover: hover) {
  .el-menu-item:hover {
    .tag-menu-count {
      display: none;
    }

    .tag-menu-actions {
      display: inline-flex;
    }
  }
}

@media (hover: none) {
  .el-menu-item {
    .tag-menu-count {
      display: none;
    }

    .tag-menu-actions {
      display: inline-flex;
    }
  }
}

.el-menu-item {
  margin: 3px 10px !important;
  border-radius: 6px;
  height: 36px;
  padding: 10px !important;
}

.choose-item {
  font-weight: 400;
  background: var(--aside-menu-active-background) !important;
  backdrop-filter: blur(4px);
}

@media (hover: hover) {
  .el-menu-item:hover {
    background: rgba(255, 255, 255, 0.08) !important;
  }
}

.menu-name {
  user-select: none;
}


:deep(.el-scrollbar__wrap--hidden-default ) {
  background: var(--aside-backgound) !important;
}

:deep(.el-menu-item) {
  background: var(--aside-backgound);
}

:deep(.el-menu) {
  background: var(--aside-backgound);
}

.el-menu {
  border-right: 0;
  width: 260px;
}

:deep(.el-divider__text) {
  background: var(--aside-backgound);
  color: #FFFFFF;
}

.scroll {

}
</style>
