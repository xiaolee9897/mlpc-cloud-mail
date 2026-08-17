<template>
  <emailScroll ref="scroll"
               :cancel-success="cancelStar"
               :star-success="addStar"
               :getEmailList="getEmailList"
               :emailDelete="emailDelete"
               :star-add="starAdd"
               :star-cancel="starCancel"
               :time-sort="params.timeSort"
               :email-read="emailRead"
               :show-unread="true"
               :tag-list="tagStore.tags"
               :tag-bind="tagBindMails"
               :tag-unbind="tagUnbindMails"
               :show-tag-action="true"
               :tag-filter="params.tagId"
               actionLeft="4px"
               @jump="jumpContent"
  >
    <template #first>
      <Icon class="icon" @click="changeTimeSort" icon="material-symbols-light:timer-arrow-down-outline"
            v-if="params.timeSort === 0" width="28" height="28"/>
      <Icon class="icon" @click="changeTimeSort" icon="material-symbols-light:timer-arrow-up-outline" v-else
            width="28" height="28"/>
    </template>

  </emailScroll>
</template>

<script setup>
import {useAccountStore} from "@/store/account.js";
import {useEmailStore} from "@/store/email.js";
import {useSettingStore} from "@/store/setting.js";
import emailScroll from "@/components/email-scroll/index.vue"
import {emailList, emailDelete, emailLatest, emailRead} from "@/request/email.js";
import {starAdd, starCancel} from "@/request/star.js";
import {tagBind, tagUnbind} from "@/request/tag.js";
import {useTagStore} from "@/store/tag.js";
import {defineOptions, h, onMounted, reactive, ref, watch} from "vue";
import {sleep} from "@/utils/time-utils.js";
import router from "@/router/index.js";
import {Icon} from "@iconify/vue";
import { useRoute } from 'vue-router'

defineOptions({
  name: 'email'
})

const route = useRoute();
const emailStore = useEmailStore();
const accountStore = useAccountStore();
const settingStore = useSettingStore();
const tagStore = useTagStore();
const scroll = ref({})
const params = reactive({
  timeSort: 0,
  tagId: 0,
})

//tagId: -1=全部, 0=未分类(默认), >0=指定标签
const currentTagId = () => {
  const tagId = route.query.tagId;
  return tagId === undefined || tagId === '' ? 0 : Number(tagId);
}

onMounted(() => {
  emailStore.emailScroll = scroll;
  params.tagId = currentTagId();
  //页面加载即拉取标签列表，保证打标下拉有标签可选（无需先移出再添加）
  tagStore.load();
  latest()
})

watch(() => accountStore.currentAccountId, () => {
  scroll.value.refreshList();
})

watch(() => route.query.tagId, () => {
  params.tagId = currentTagId();
  scroll.value.refreshList();
})

function changeTimeSort() {
  params.timeSort = params.timeSort ? 0 : 1
  scroll.value.refreshList();
}

function jumpContent(email) {
  emailStore.contentData.email = email
  emailStore.contentData.delType = 'logic'
  emailStore.contentData.showUnread = true
  emailStore.contentData.showStar = true
  emailStore.contentData.showReply = true
  router.push('/message')
}

const existIds = new Set();

async function latest() {
  while (true) {

    let autoRefresh = settingStore.settings.autoRefresh;
    await sleep(autoRefresh > 1 ? autoRefresh * 1000 : 3000);

    if (route.name !== 'email') {
      continue;
    }

    const latestId = scroll.value.latestEmail?.emailId

    if (!scroll.value.firstLoad && autoRefresh > 1) {
      try {
        const accountId = accountStore.currentAccountId
        const allReceive = scroll.value.latestEmail?.allReceive
        const curTimeSort = params.timeSort
        const curTagId = params.tagId
        let list = []

        //确保发起请求时最后一个邮件是当前账号的,或者
        if (accountId === scroll.value.latestEmail?.reqAccountId) {
          list = await emailLatest(latestId, accountId, allReceive, curTagId);
        }

        //确保请求回来后，账号没有切换，时间排序没有改变，全部邮件类型没变
        if (accountId === accountStore.currentAccountId && params.timeSort === curTimeSort && allReceive === accountStore.currentAccount.allReceive && params.tagId === curTagId) {
          if (list.length > 0) {

            for (let email of list) {

              email.reqAccountId = accountId;
              email.allReceive = allReceive;

              if (!existIds.has(email.emailId)) {

                existIds.add(email.emailId)
                scroll.value.addItem(email)

                await sleep(50)
              }

            }

          }

        }
      } catch (e) {
        if (e.code === 401 || e.code === 403) {
          settingStore.settings.autoRefresh = 0;
        }
        console.error(e)
      }
    }
  }
}

function addStar(email) {
  emailStore.starScroll?.addItem(email)
}

function cancelStar(email) {
  emailStore.starScroll?.deleteEmail([email.emailId])
}

function getEmailList(emailId, size) {
  const accountId =  accountStore.currentAccountId;
  const allReceive = accountStore.currentAccount.allReceive;
  return emailList(accountId, allReceive, emailId, params.timeSort, size, 0, params.tagId).then(data => {
    data.latestEmail.reqAccountId = accountId;
    data.latestEmail.allReceive = allReceive;
    return data;
  })
}

function onTagChanged() {
  //批量打标后刷新 tag store（下拉列表+侧边栏计数实时更新）并刷新邮件列表
  tagStore.load(true);
  scroll.value.refreshList();
}

function tagBindMails(emailIds, tagId) {
  return tagBind(emailIds, tagId).then(() => {
    onTagChanged();
  })
}

function tagUnbindMails(emailIds) {
  return tagUnbind(emailIds).then(() => {
    onTagChanged();
  })
}

</script>
<style>
.icon {
  cursor: pointer;
}
</style>
