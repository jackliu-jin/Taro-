/* 
粉丝和关注人列表组件
 */
<template>
  <view class="userPostContent">
    <view class="head" @tap="toUserZoom">
      <view class="userImage">
        <image mode="heightFix" :src="userImage"></image>
      </view>
      <view class="userName">
        <view class="name">{{ userName }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import {} from "taro-ui-vue";

import Taro from "@tarojs/taro";

import "./index.scss";

export default {
  name: "FansAndFollows",
  components: {},
  props: ["userId"],
  data() {
    return {
      userImage: "",
      userName: "",
    };
  },
  created() {
    this.getUserInfo();
  },
  methods: {
    // 获取用户名和用户头像
    getUserInfo() {
      const db = Taro.cloud.database();
      const _ = db.command;
      db.collection("users")
        .doc(this.userId)
        .get()
        .then((res) => {
          this.userImage = res.data.userImage;
          this.userName = res.data.userName;
        });
    },
    // 跳转到用户的空间
    toUserZoom() {
      const id = this.userId;
      Taro.navigateTo({
        url: "/pages/zoom/index?id=" + id,
      });
    },
  },
};
</script>
