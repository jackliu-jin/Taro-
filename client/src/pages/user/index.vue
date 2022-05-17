/* 
  登录逻辑
  1、用户getlogin云函数，获取用户openid
  2、用户getuserinfo得到用户头像，用户名等信息
  3、创建或读取用户数据库

 */
<template>
  <view class="index">
    <image class="background-image" src="../../image/picture/background.png" />
    <view class="head">
      <view class="userinfo">
        <view class="user-image">
          <image :src="userImage" />
        </view>
        <view @tap="getUserInfo" class="user-name">{{ userName }}</view>
      </view>

      <view class="stars">
        <view class="level">{{ level }}</view>
        <view class="score">
          <view class="score-number">{{ scoreNumber }}</view>
          <AtIcon
            class="icon"
            value="lightning-bolt"
            size="14"
            color="#6190E8"
          ></AtIcon>

          <AtProgress :percent="scoreNumber" isHidePercent :strokeWidth="6" />
        </view>
      </view>
    </view>
    <view class="body">
      <view class="icon">
        <image
          mode="scaleToFill"
          @tap="toZoom"
          src="../../image/icon/homepage.png"
        />
        <view class="text">我的空间</view>
      </view>
      <view class="icon" @tap="toFollows">
        <image mode="scaleToFill" src="../../image/icon/like.png" />
        <view class="text">我的关注</view>
      </view>
      <view class="icon" @tap="toFans">
        <image mode="scaleToFill" src="../../image/icon/fans.png" />
        <view class="text">我的粉丝</view>
      </view>
      <view class="icon" @tap="toHistory">
        <image mode="scaleToFill" src="../../image/icon/history.png" />
        <view class="text">历史计划</view>
      </view>
    </view>
    <view class="calendar">
      <AtCalendar class="AtCalendar" minDate="2022/4/1" :marks="dates" />
    </view>
  </view>
</template>

<script>
import { AtCalendar, AtProgress, AtIcon, AtBadge } from "taro-ui-vue";
import Taro from "@tarojs/taro";

import "./index.scss";
import Login from "../../components/login/index.weapp";

export default {
  name: "User",
  components: {
    Login,
    AtCalendar,
    AtProgress,
    AtIcon,
    AtBadge,
  },
  data() {
    return {
      userImage: "../../image/icon/user.png",
      userName: "点击登录/注册 ›",
      level: "欢迎~xduer新朋友",
      scoreNumber: 0,
      dates: [],
    };
  },
  onShow() {
    if (Taro.getStorageSync("login")) {
      try {
        this.addUser();
      } catch (e) {}
    }
  },
  onShareAppMessage(res) {},

  methods: {
    // 点击登录
    getUserInfo() {
      if (Taro.getStorageSync("login")) {
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
    // 新建用户,加在数据库中
    addUser(info) {
      const db = Taro.cloud.database();
      db.collection("users")
        .doc(Taro.getStorageSync("useropenid"))
        .get({
          success: (res) => {
            // 如果有该用户数据则获取
            this.showInfo(res.data);
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
    // 展示信息
    showInfo(data) {
      // 如果有该用户数据则获取
      this.userImage = data.userImage;
      this.userName = data.userName;
      this.level = "Lv " + Math.trunc(data.todos.length / 10);
      this.scoreNumber = 10 * (data.todos.length % 10);
      data.todos.map((item) => {
        this.dates.push({
          value: item.due,
        });
      });
    },
    // 跳转到历史任务页面
    toHistory() {
      Taro.navigateTo({
        url: "/pages/history/index",
      });
    },
    // 跳转到关注页面
    toFollows() {
      Taro.navigateTo({
        url: "/pages/follows/index",
      });
    },
    // 跳转到粉丝页面
    toFans() {
      Taro.navigateTo({
        url: "/pages/fans/index",
      });
    },
    //toZoom
    toZoom() {
      const id = Taro.getStorageSync("useropenid");
      Taro.navigateTo({
        url: "/pages/zoom/index?id=" + id,
      });
    },
  },
};
</script>
