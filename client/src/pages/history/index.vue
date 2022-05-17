/* 
历史任务
 */
<template>
  <view class="index">
    <view class="todos" v-for="item in todos" :key="item.id">
      <History :title="item.due" :todoList="item.list" />
    </view>
    <Empty v-show="!todos.length" :description="'还没有历史计划呢呢~'" />
  </view>
</template>

<script>
import History from "../../components/historyTodo/index";
import Empty from "../../components/empty/index.vue";


import Taro from "@tarojs/taro";

import "./index.scss";

export default {
  name: "History",
  components: {
    History,
    Empty
  },
  data() {
    return {
      isOpen: false,
      todos: [],
    };
  },
  created() {
    this.getUserInfo();
  },
  onShow() {},
  onHide() {},
  methods: {
    getUserInfo() {
      const db = Taro.cloud.database();
      db.collection("users")
        .doc(Taro.getStorageSync("useropenid"))
        .get()
        .then((res) => {
          this.todos = res.data.todos;
        });
    },
    onClick(e) {
      this.isOpen = e;
    },
  },
};
</script>
