
<template>
  <web-view :src="url"></web-view>
</template>

<script>
import Taro from "@tarojs/taro";

import "./index.scss";

export default {
  name: "WebUrl",
  data() {
    return {
      url: "",
    };
  },
  created() {
    // 路由参数
    this.url = Taro.getCurrentInstance().router.params.url;
  },
};
</script>
