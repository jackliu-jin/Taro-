/* 
该组件用于查看历史Todo
 */
<template>
  <view class="content">
    <AtAccordion
      :title="date"
      :open="isOpen"
      :icon="{ value: 'tags', color: '#ffff' }"
      :onClick="onClick"
    >
      <AtList :hasBorder="false">
        <AtListItem
          v-for="item in todoList"
          :key="item.id"
          :title="item.description"
          :class="{ taskdone: item.done, tasknot: !item.done }"
        />
      </AtList>
    </AtAccordion>
  </view>
</template>

<script>
import { AtAccordion, AtList, AtListItem } from "taro-ui-vue";

import "./index.scss";

export default {
  name: "historyTodo",
  components: {
    AtAccordion,
    AtList,
    AtListItem,
  },
  props: ["todoList", "title"],
  data() {
    return {
      isOpen: false,
      date: "",
    };
  },
  created() {
    const duedate = this.title;
    this.date =
      duedate.getFullYear() +
      "-" +
      (1 + duedate.getMonth()) +
      "-" +
      duedate.getDate();
  },
  methods: {
    onClick(e) {
      this.isOpen = e;
    },
  },
};
</script>
