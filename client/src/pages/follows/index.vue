
<template>
  <view class="index">
    <view class="users" v-for="(item, index) in fans" :key="index">
      <Users :userId="item" />
    </view>
    <Empty v-show="!fans.length" :description="'还没有关注呢~'" />
  </view>
</template>

<script>
import Taro from "@tarojs/taro";
import Users from "../../components/fansAndFollows/index";
import Empty from "../../components/empty/index.vue";

import "./index.scss";

export default {
  name: "Follows",
  components: { Users, Empty },
  data() {
    return {
      fans: [],
    };
  },
  created() {
    // 获取用户粉丝列表
    this.getUserInfo();
  },
  methods: {
    getUserInfo() {
      const db = Taro.cloud.database();
      db.collection("users")
        .doc(Taro.getStorageSync("useropenid"))
        .get()
        .then((res) => {
          const list = [...new Set(res.data.follows)];
          this.fans = list;
        });
    },
  },
};
</script>
