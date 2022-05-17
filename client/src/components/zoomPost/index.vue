/* 
帖子： 空间的帖子
和首页有区别，无头像
 */
<template>
  <view class="zoomPostContent">
    <view class="head">
      <view class="date">{{ date }}</view>
    </view>
    <view class="body">
      <view class="title"> {{ item.title }}</view>
      <view class="context">{{ item.context }}</view>
      <view class="userTodo" v-if="item.showTodo">
        <Todo :todoId="item.todoId" :userId="userId" />
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
  props: ["item", "userId"],
  data() {
    return {
      date: "",
      likes: this.item.likes,
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
    this.getImages();
    // 获取like
    this.liked = this.item.likes.includes(Taro.getStorageSync("useropenid"));
    this.likesNumber = [...new Set(this.item.likes)].length;;
  },
  methods: {
    // 下载照片downloadFile，缓存
    getImages() {
      const images = this.item.images;
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
          return item.postId !== this.item._id || item.userId !== this.userId;
        });
        likes.push({
          userId: this.userId,
          postId: this.item._id,
        });
        Taro.setStorageSync("myLikes", likes);
        Taro.setStorageSync("myDislikes", myDislikes);
      } else {
        this.likesNumber--;

        // 从数组中清空,并添加在mydislikes中
        const mylikes = likes.filter((item) => {
          return item.postId !== this.item._id || item.userId !== this.userId;
        });
        dislikes.push({
          userId: this.userId,
          postId: this.item._id,
        });
        Taro.setStorageSync("myLikes", mylikes);
        Taro.setStorageSync("myDislikes", dislikes);
      }
    },
  },
};
</script>
