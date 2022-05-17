/* 
empty组件
 */
<template>
  <view class="emptyContent">
    <image src="../../image/picture/empty.png"></image>
    <view class="emptyDescription">{{ description }}</view>
  </view>
</template>

<script>
import Taro from "@tarojs/taro";

import "./index.scss";

export default {
  name: "FansAndFollows",
  components: {},
  props: ["description"],
  data() {
    return {};
  },
};
</script>
