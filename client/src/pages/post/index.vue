<template>
  <view class="index">
    <view class="inputArea">
      <AtInput
        title="标题"
        type="text"
        :maxLength="20"
        placeholder="请输入标题（最大20个字）"
        :value="titelValue"
        :onChange="handleInput"
      />
      <AtTextarea
        :value="contextValue"
        :onChange="handleChange"
        :maxLength="500"
        placeholder="写写你今天的收获和成果吧~"
      />
    </view>
    <!-- 是否展示该计划表 -->
    <view class="showTodo">
      <view class="showTodo-title">
        <view class="title">是否展示我的计划表</view>
        <AtSwitch
          :title="showValue ? '是' : '否'"
          :checked="showValue"
          :onChange="showChange"
        />
      </view>

      <Todo :todoId="todoId" :userId="userId" />
    </view>
    <view class="imagePicker">
      <view class="uploadImage">点击上传照片 {{ this.files.length }}/4</view>
      <AtImagePicker
        multiple
        :showAddBtn="showAdd"
        :length="3"
        :count="4"
        :files="files"
        :onChange="onChange"
        :onFail="onFail"
      />
    </view>

    <!-- 发布 -->
    <AtFab class="fabPost" :on-click="post">
      <text class="at-fab__icon at-icon at-icon-external-link"></text>
      <view class="text">发布</view>
    </AtFab>

    <!-- 创建成功弹窗 -->
    <!-- 清空弹窗 -->
    <AtModal :isOpened="postModal" :onClose="closeAmodal">
      <AtModalHeader>发布成功！</AtModalHeader>
      <AtModalContent>
        <view class="finishText">发布成功，可以在我的空间查看已发布动态~</view>
      </AtModalContent>
      <AtModalAction>
        <button style="color: #ff8200" @tap="closeAmodal">完成</button>
      </AtModalAction>
    </AtModal>
  </view>
</template>

<script>
import {
  AtButton,
  AtInput,
  AtTextarea,
  AtImagePicker,
  AtFab,
  AtSwitch,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
} from "taro-ui-vue";
import Taro from "@tarojs/taro";
import Todo from "../../components/todo/index.vue";

import "./index.scss";

export default {
  name: "Index",
  components: {
    AtButton,
    AtInput,
    AtTextarea,
    AtImagePicker,
    AtFab,
    Todo,
    AtSwitch,
    AtModal,
    AtModalHeader,
    AtModalContent,
    AtModalAction,
  },
  data() {
    return {
      //id
      postId: "",
      // todoid
      todoId: "",
      // userId
      userId: "",
      titelValue: "",
      contextValue: "",
      // 图片
      showAdd: true,
      // 图片临时地址
      files: [],
      // 图片fileId
      imagesFileId: [],
      // 是否展示计划表
      showValue: true,
      //完成弹窗
      postModal: false,
    };
  },
  created() {
    // 路由参数
    this.todoId = Taro.getCurrentInstance().router.params.id;
    this.getUserInfo();
    //生成一个id
    Taro.getRandomValues({
      length: 6, // 生成 6 个字节长度的随机数,
      success: (res) => {
        this.postId = Taro.arrayBufferToBase64(res.randomValues); // 转换为 base64 字符串后打印
      },
    });
    this.userId = Taro.getStorageSync("useropenid");
  },

  // 监听图片
  watch: {
    files: {
      handler() {
        if (this.files.length >= 4) {
          this.showAdd = false;
        } else {
          this.showAdd = true;
        }
      },
    },
  },

  methods: {
    // 获取用户信息
    getUserInfo() {
      const db = Taro.cloud.database();
      db.collection("users")
        .doc(Taro.getStorageSync("useropenid"))
        .get({
          success: (res) => {
            // 如果有该用户数据则获取
            this.hasUserPosts(res.data);
          },
          fail: (e) => {},
        });
    },
    // 输入标题
    handleInput(value) {
      this.titelValue = value;
    },
    // 输入内容
    showChange(e) {
      this.showValue = e;
    },
    handleChange(value) {
      this.contextValue = value;
    },
    // 图片修改
    onChange(res) {
      this.files = res;
    },
    // 选择失败的回调
    onFail(e) {},
    // 发布
    post() {
      if (this.contextValue.length) {
        // 上传图片
        Taro.showLoading({
          title: "正在上传......",
        });
        this.uploadImages(this.files)
          .then(() => {
            // 添加
            this.addDataToUserPosts();
          })
          .catch((e) => {});
      } else {
        Taro.showToast({
          title: "内容不能为空哦",
          icon: "error",
          duration: 2000,
        });
      }
    },
    // 上传多张图片uploadImages
    async uploadImages(arr) {
      arr.map((item) => {
        const url = this.userId + "/photo/" + Date.now() + ".jpg";
        this.imagesFileId.push(url);
        Taro.cloud
          .uploadFile({
            cloudPath: url,
            filePath: item.url,
          })
          .then((res) => {});
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
                userName: data.userName,
                userImage: data.userImage,
                post: [],
              },
            })
            .then(() => {})
            .catch(() => {});
        });
    },
    // 将post添加到数据库中
    addDataToUserPosts() {
      const db = Taro.cloud.database();
      const _ = db.command;
      db.collection("posts")
        .doc(Taro.getStorageSync("useropenid"))
        .update({
          data: {
            post: _.push({
              _id: this.postId,
              due: new Date(),
              todoId: this.todoId,
              showTodo: this.showValue,
              title: this.titelValue,
              context: this.contextValue,
              images: this.imagesFileId,
              likes: [],
            }),
          },
        })
        .then((res) => {
          // 添加到square-posts中
          db.collection("square")
            .doc("squareposts")
            .update({
              data: {
                posts: _.unshift({
                  userId: this.userId,
                  postId: this.postId,
                  due: new Date(),
                  likes: [],
                }),
              },
            })
            .then(() => {
              Taro.hideLoading();
              this.postModal = true;
            });
        })
        .catch(() => {});
    },
    // 创建成功跳转到计划表页
    closeAmodal() {
      Taro.navigateBack({
        delta: 1,
      });
    },
  },
};
</script>
