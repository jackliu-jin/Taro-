<template>
  <view class="index">
    <view class="head">
      <view class="userinfo">
        <view class="user-image">
          <image :src="userImage" />
        </view>
        <view class="user-name">{{ userName + " " }} 的空间</view>
      </view>
      <AtButton
        v-if="userId == myUserId ? false : true"
        :class="{ followed: followed, unfollowed: !followed }"
        size="small"
        circle
        :on-click="follow"
        >{{ followed ? "已关注" : "关  注" }}</AtButton
      >
    </view>
    <view class="zoomBody">
      <view style="font-size: 18px" class="content">
        <ZoomPost
          v-for="item in postsList"
          :key="item._id"
          :item="item"
          :userId="userId"
        />
      </view>
      <Empty v-show="!postsList.length" :description="'还没有发布过动态呢~'" />
    </view>
  </view>
</template>

<script>
import { AtButton } from "taro-ui-vue";
import ZoomPost from "../../components/zoomPost/index";
import Empty from "../../components/empty/index.vue";

import Taro from "@tarojs/taro";

import "./index.scss";

export default {
  name: "zoom",
  components: {
    AtButton,
    ZoomPost,
    Empty,
  },
  data() {
    return {
      userId: "",
      userName: "",
      userImage: "",
      // 动态列表
      postsList: [],
      // 是否关注
      followed: false,
      // myid
      myUserId: "",
    };
  },
  created() {
    // 路由参数
    this.userId = Taro.getCurrentInstance().router.params.id;
    //
    this.myUserId = Taro.getStorageSync("useropenid");
    this.getUserAllPosts();
    // 获取我的关注列表
    this.getMyfollowedList();
    // 点赞缓存列表，用来缓存是否点赞
    Taro.setStorageSync("myLikes", []);
    // 取消点赞缓存
    Taro.setStorageSync("myDislikes", []);
  },
  onShareAppMessage(res) {},
  beforeDestroy() {
    // 更新
    this.updateLikes();
    this.updateFollows();
  },
  methods: {
    // 获取用户的所有动态
    getUserAllPosts() {
      const db = Taro.cloud.database();
      const _ = db.command;
      db.collection("posts")
        .doc(this.userId)
        .get()
        .then((res) => {
          this.postsList = res.data.post.reverse();
          this.userName = res.data.userName;
          this.userImage = res.data.userImage;
        });
    },
    // 获取关注列表
    getMyfollowedList() {
      const db = Taro.cloud.database();
      const _ = db.command;
      db.collection("users")
        .doc(this.myUserId)
        .get()
        .then((res) => {
          const follows = res.data.follows;
          follows.map((item) => {
            if (item == this.userId) {
              this.followed = true;
            }
          });
        });
    },
    // 关注
    follow() {
      this.followed = !this.followed;
    },
    // 更新点赞
    updateLikes() {
      // 将点赞列表更新
      const db = Taro.cloud.database();
      const _ = db.command;
      const likes = Taro.getStorageSync("myLikes");
      likes.map((item) => {
        db.collection("posts")
          .where({
            "post._id": item.postId,
          })
          .update({
            data: {
              "post.$.likes": _.push(this.myUserId),
            },
          })
          .then((res) => {});
      });
      // 将取消点赞列表更新
      const dislikes = Taro.getStorageSync("myDislikes");
      dislikes.map((item) => {
        db.collection("posts")
          .where({
            "post._id": item.postId,
          })
          .update({
            data: {
              "post.$.likes": _.pull(this.myUserId),
            },
          })
          .then((res) => {});
      });
    },
    // 更新关注
    updateFollows() {
      const db = Taro.cloud.database();
      const _ = db.command;
      if (this.followed) {
        db.collection("users")
          .doc(this.myUserId)
          .update({
            data: {
              follows: _.push(this.userId),
            },
          })
          .then((res) => {});
        // 在别人用户中添加粉丝
        db.collection("users")
          .doc(this.userId)
          .update({
            data: {
              fans: _.push(this.myUserId),
            },
          })
          .then((res) => {});
      } else {
        db.collection("users")
          .doc(this.myUserId)
          .update({
            data: {
              follows: _.pull(this.userId),
            },
          })
          .then((res) => {});
        // 从别人粉丝中删除
        db.collection("users")
          .doc(this.userId)
          .update({
            data: {
              fans: _.pull(this.myUserId),
            },
          })
          .then((res) => {});
      }
    },
  },
};
</script>
