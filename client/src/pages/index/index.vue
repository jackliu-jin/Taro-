<template>
  <view class="index">
    <view class="banner">
      <swiper
        class="swiper"
        indicatorColor="#999"
        indicatorActiveColor="#333"
        current="bannerCurrent"
        :duration="500"
        :interval="8000"
        :circular="true"
        :autoplay="true"
        :indicatorDots="true"
      >
        <swiper-item
          v-for="(item, idx) in imgUrls"
          :key="idx"
          @tap="toWeb(item.url)"
        >
          <image :src="item.image" mode="scaleToFill" class="slide-image" />
        </swiper-item>
      </swiper>
    </view>
    <view class="square">
      <AtTabs
        animated
        :swipeable="true"
        :current="tabsCurrent"
        :tabList="tabList"
        :onClick="handleClick"
      >
        <AtTabsPane :current="tabsCurrent" :index="0">
          <view
            v-if="updateMark && tabsCurrent == 0"
            style="font-size: 18px"
            class="tab-content"
          >
            <UserPost
              v-for="item in postsList"
              :key="item.postId"
              :item="item"
            />
          </view>
        </AtTabsPane>
        <AtTabsPane :current="tabsCurrent" :index="1">
          <view
            v-if="updateMark && tabsCurrent == 1"
            style="font-size: 18px"
            class="tab-content"
          >
            <UserPost
              v-for="item in followedPostsList"
              :key="item.postId"
              :item="item"
            />
          </view>
          <Empty
            v-show="!followedPostsList.length"
            :description="'还没有关注呢~'"
          />
        </AtTabsPane>
      </AtTabs>
    </view>
  </view>
</template>

<script>
import { AtTabs, AtTabsPane } from "taro-ui-vue";
import UserPost from "../../components/userPost/index.vue";
import Empty from "../../components/empty/index.vue";

import Taro from "@tarojs/taro";

import "./index.scss";

export default {
  name: "Index",
  components: {
    AtTabs,
    AtTabsPane,
    UserPost,
    Empty,
  },
  data() {
    return {
      bannerCurrent: 1,
      imgUrls: [],
      tabsCurrent: 0,
      tabList: [{ title: "发现" }, { title: "我的关注" }],
      // 动态列表
      postsList: [],
      // 关注列表
      followedPostsList: [],
      // v-if用来更新列表
      updateMark: false,
    };
  },
  created() {
    this.getLogin();
    this.updateMark = false;
    // 获取banner图片
    this.getBanner();
  },
  onShow() {
    // 点赞缓存列表，用来缓存是否点赞
    Taro.setStorageSync("myLikes", []);
    // 取消点赞缓存
    Taro.setStorageSync("myDislikes", []);
    // 获取广场帖子
    this.getSquarePosts();
    // 获取关注用户帖子,滑到关注页，获取用户是否创建过角色，如果有则获取用户的关注列表，如果没有，则让用户登录创建角色
  },
  onHide() {
    this.updateLikes();
  },
  //
  onShareAppMessage(res) {},
  methods: {
    // 获取banner的图片
    getBanner() {
      const db = Taro.cloud.database();
      const _ = db.command;
      db.collection("square")
        .doc("banner")
        .get()
        .then((res) => {
          const bannerList = res.data.item;
          this.getImages(bannerList);
        });
    },
    // 下载照片downloadFile，缓存
    getImages(images) {
      images.map((item) => {
        Taro.cloud.downloadFile({
          fileID: item.image,
          success: (res) => {
            this.imgUrls.push({ image: res.tempFilePath, url: item.url });
          },
          fail: console.error,
        });
      });
    },
    //
    toWeb(url) {
      Taro.navigateTo({
        url: "/pages/webUrl/index?url=" + url,
      });
    },
    // 查询我的关注
    getUserInfo() {
      if (Taro.getStorageSync("login")) {
        this.addUser();
        return;
      }
      Taro.getUserProfile({
        desc: "用于完善用户资料",
        success: (res) => {
          Taro.setStorageSync("login", true);
          this.addUser(res.userInfo);
          this.hasUserPosts(res.userInfo);
        },
      });
    },
    // 判断是否存在这个用户的posts数据库
    hasUserPosts(data) {
      const db = Taro.cloud.database();
      db.collection("posts")
        .doc(Taro.getStorageSync("useropenid"))
        .get()
        .then((res) => {})
        .catch(() => {
          // 没有则新建
          db.collection("posts")
            .add({
              data: {
                _id: Taro.getStorageSync("useropenid"),
                userName: data.nickName,
                userImage: data.avatarUrl,
                post: [],
              },
            })
            .then(() => {})
            .catch(() => {});
        });
    },
    // 新建用户,加在数据库中
    addUser(info) {
      const db = Taro.cloud.database();
      db.collection("users")
        .doc(Taro.getStorageSync("useropenid"))
        .get({
          success: (res) => {
            // 如果有该用户数据则获取，获取关注列表
            this.getFollows(res.data.follows);
            // 创建post数据库
          },
          fail: (e) => {
            // 没有该用户数据则新建
            const id = Taro.getStorageSync("useropenid");
            db.collection("users").add({
              data: {
                _id: id, // openid
                userName: info.nickName,
                userImage: info.avatarUrl,
                todos: [],
                fans: [],
                follows: [],
              },
              success: (res) => {
                // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
                this.addUser();
              },
              fail: (e) => {},
            });
          },
        });
    },
    // 云函数获取用户openid
    async getLogin() {
      await Taro.cloud
        .callFunction({
          name: "login",
          data: {},
        })
        .then((res) => {
          Taro.setStorageSync("useropenid", res.result.openid);
        });
    },
    // 获取squareposts
    getSquarePosts() {
      const db = Taro.cloud.database();
      const _ = db.command;
      db.collection("square")
        .doc("squareposts")
        .get()
        .then((res) => {
          this.postsList = res.data.posts;
          this.updateMark = true;
        });
    },
    // 获取关注人的帖子
    getFollows(list) {
      const mylist = [...new Set(list)];
      for (let index = 0; index < mylist.length; index++) {
        this.postsList.map((item) => {
          if (item.userId == mylist[index]) {
            this.followedPostsList.push(item);
          }
        });
      }
    },
    //切换标签页
    handleClick(value) {
      this.updateLikes();
      if (this.tabsCurrent == value) {
        return;
      }
      this.tabsCurrent = value;
      if (value == 1) {
        this.followedPostsList = [];
        this.getUserInfo();
      }
    },
    //更新点赞列表
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
              "post.$.likes": _.push(Taro.getStorageSync("useropenid")),
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
              "post.$.likes": _.pull(Taro.getStorageSync("useropenid")),
            },
          })
          .then((res) => {});
      });
    },
  },
};
</script>
