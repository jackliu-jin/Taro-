/* 
帖子： 广场的帖子
 */
<template>
  <view class="userPostContent">
    <view class="head">
      <view class="userImage" @tap="toUserZoom">
        <image mode="heightFix" :src="userImage"></image>
      </view>
      <view class="userName" @tap="toUserZoom">
        <view class="name">{{ userName }}</view>
        <view class="date">{{ date }}</view>
      </view>
    </view>
    <view class="body">
      <view class="title"> {{ post.title }}</view>
      <view class="context">{{ post.context }}</view>
      <view class="userTodo" v-if="post.showTodo">
        <Todo :todoId="post.todoId" :userId="userId" />
      </view>
      <view class="photos">
        <view
          class="image"
          v-for="(item, index) in images"
          :key="index"
          @tap="previewImage(item)"
        >
          <image lazy-load="true" mode="aspectFill" :src="item" />
        </view>
      </view>
    </view>
    <view class="foot">
      <view class="likes" @tap="like">
        <AtIcon
          value="heart"
          size="26"
          :color="liked ? '#FF4949' : '#a5a5a5'"
        />
        <view :class="liked ? 'like' : 'dislike'">{{ likesNumber }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { AtIcon } from "taro-ui-vue";
import Todo from "./component/todo/index.vue";

import Taro from "@tarojs/taro";

import "./index.scss";

export default {
  name: "userPost",
  components: {
    Todo,
    AtIcon,
  },
  props: ["item"],
  data() {
    return {
      userId: this.item.userId,
      postId: this.item.postId,
      date: "",
      likes: this.item.likes,
      userImage: "",
      userName: "",
      post: {},
      images: [],
      // 点赞
      liked: false,
      // 点赞数
      likesNumber: 0,
    };
  },
  created() {
    const duedate = this.item.due;
    this.date =
      duedate.getFullYear() +
      "-" +
      (1 + duedate.getMonth()) +
      "-" +
      duedate.getDate() +
      "  " +
      (duedate.getHours() < 10
        ? "0" + duedate.getHours()
        : duedate.getHours()) +
      ":" +
      (duedate.getMinutes() < 10
        ? "0" + duedate.getMinutes()
        : duedate.getMinutes());
    this.getPost();
  },
  methods: {
    // 获取动态用户的信息，用户名和用户头像,以及post部分
    getPost() {
      const db = Taro.cloud.database();
      const _ = db.command;
      db.collection("posts")
        .doc(this.userId)
        .get()
        .then((res) => {
          this.userName = res.data.userName;
          this.userImage = res.data.userImage;
          this.post = res.data.post.filter(
            (item) => item._id == this.postId
          )[0];
          this.likesNumber = [...new Set(this.post.likes)].length;
          this.liked = this.post.likes.includes(
            Taro.getStorageSync("useropenid")
          );
          this.getImages();
        });
    },
    // 下载照片downloadFile，缓存
    getImages() {
      const images = this.post.images;
      images.map((item) => {
        Taro.cloud.downloadFile({
          fileID:
            "cloud://cloud1-7gqpykhn23267cdd.636c-cloud1-7gqpykhn23267cdd-1311568411/" +
            item,
          success: (res) => {
            this.images.push(res.tempFilePath);
          },
          fail: console.error,
        });
      });
    },
    //previewImage预览图片
    previewImage(url) {
      Taro.previewImage({
        current: url, // 当前显示图片的http链接
        urls: this.images, // 需要预览的图片http链接列表
      });
    },
    //like点赞,和取消点赞
    // 使用本地缓存设计
    like() {
      // 获取点赞列表
      let likes = Taro.getStorageSync("myLikes");
      let dislikes = Taro.getStorageSync("myDislikes");
      this.liked = !this.liked;
      if (this.liked) {
        this.likesNumber++;
        const myDislikes = dislikes.filter((item) => {
          return item.postId !== this.postId || item.userId !== this.userId;
        });
        likes.push({
          userId: this.userId,
          postId: this.postId,
        });
        Taro.setStorageSync("myLikes", likes);
        Taro.setStorageSync("myDislikes", myDislikes);
      } else {
        this.likesNumber--;

        // 从数组中清空,并添加在mydislikes中
        const mylikes = likes.filter((item) => {
          return item.postId !== this.postId || item.userId !== this.userId;
        });
        dislikes.push({
          userId: this.userId,
          postId: this.postId,
        });
        Taro.setStorageSync("myLikes", mylikes);
        Taro.setStorageSync("myDislikes", dislikes);
      }
    },
    // 跳转到用户的空间
    toUserZoom() {
      const id = this.item.userId;
      Taro.navigateTo({
        url: "/pages/zoom/index?id=" + id,
      });
    },
  },
};
</script>
