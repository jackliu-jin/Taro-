<template>
  <view class="taskContent">
    <AtSwipeAction
      class="task"
      autoClose
      :disabled="edit"
      :on-click="handleClicked"
      :options="[
        {
          text: '删除',
          style: {
            backgroundColor: '#FF4949',
          },
        },
        {
          text: '编辑',
          style: {
            backgroundColor: '#6190E8',
          },
        },
        {
          text: item.done == false ? '完成' : '待办',
          style: {
            backgroundColor: item.done == false ? '#48c450' : '#FFC82C',
          },
        },
      ]"
    >
      <view class="input" v-if="edit">
        <AtInput
          :border="false"
          focus
          required
          type="text"
          placeholder="输入任务，回车确认"
          :value="description"
          :onChange="handleInput"
          :onBlur="inputBlur"
        />
      </view>
      <AtListItem
        v-show="!edit"
        :class="{ taskdone: item.done, tasknot: !item.done }"
        :title="item.description"
      />
    </AtSwipeAction>
  </view>
</template>

<script>
import { AtSwipeAction, AtInput, AtListItem } from "taro-ui-vue";
import Taro from "@tarojs/taro";

import "./index.scss";

export default {
  name: "task",
  components: {
    AtSwipeAction,
    AtInput,
    AtListItem,
  },
  props: ["item", "id", "add"],
  data() {
    return {
      description: this.item.description,
      edit: false,
    };
  },

  created() {
    if (this.add) {
      this.edit = true;
    }
  },
  methods: {
    handleClicked(value) {
      if (value.text == "完成") {
        this.$emit("changeDone", this.id, true);
        // this.$forceUpdate();
      } else if (value.text == "待办") {
        this.$emit("changeDone", this.id, false);
        // this.$forceUpdate();
      } else if (value.text == "编辑") {
        this.edit = true;
      } else {
        this.$emit("deleteTask", this.id);
      }
    },
    handleInput(value) {
      this.description = value;
    },
    // 失焦
    inputBlur(){
      // 如果确认后是空任务，则触发删除
      if (!this.description.length) {
        this.$emit("deleteTask", this.id);
      }
      this.$emit("changeDescription", this.id, this.description);
      this.edit = false;
      this.$emit("update:add", false);
    }
  },
};
</script>
