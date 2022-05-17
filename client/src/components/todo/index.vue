/* 
该组件用于只查看一个计划表，
用于发布动态和个人主页，以及首页帖子和他人主页中展示

无法用于历史计划表中使用！！
 */
<template>
  <view class="todoContent">
    <AtAccordion
      title="点击展开计划表"
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
import Taro from "@tarojs/taro";

import "./index.scss";

export default {
  name: "todo",
  components: {
    AtAccordion,
    AtList,
    AtListItem,
  },
  props: ["todoId", "userId"],
  data() {
    return {
      isOpen: false,
      todoList: [],
    };
  },
  created() {
    // 查找该计划表
    this.findTodo();
  },
  methods: {
    onClick(e) {
      this.isOpen = e;
    },
    findTodo() {
      const db = Taro.cloud.database();
      db.collection("users")
        .doc(this.userId)
        .get({
          success: (res) => {
            const todos = res.data.todos;
            const todo = todos.find((item) => item.id == this.todoId);
            this.todoList = todo.list;
          },
          fail: (e) => {},
        });
    },
  },
};
</script>
