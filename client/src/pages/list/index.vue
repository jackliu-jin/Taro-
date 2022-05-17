<template>
  <view class="index">
    <view class="body">
      <view class="time">
        <view class="day">{{ day }}</view>
        <view class="date">{{ date }}</view>
      </view>
      <view class="line"></view>
      <view>
        <view v-for="item in list" :key="item.id">
          <Task
            :item="item"
            :id="item.id"
            :add.sync="add"
            @changeDone="changeDone"
            @changeDescription="changeDescription"
            @deleteTask="deleteTask"
          />
        </view>
      </view>
      <Empty
        v-show="!list.length"
        :description="'任务为空，点击右下角添加键，添加任务吧~'"
      />
      <!-- 判断有任务且不为空，显示操作 -->
      <view class="done" v-if="list.length && list[0].description.length">
        <AtButton type="primary" size="small" circle :on-click="finishTasks"
          >结束finish</AtButton
        >
        <view
          :class="{
            number: number !== list.length,
            allDoneNumber: number == list.length,
          }"
          v-show="list.length"
          >Done: {{ number }}/{{ list.length }}</view
        >
      </view>
    </view>

    <!-- 新建 -->
    <AtFab class="fabAdd" :on-click="addTask">
      <text class="at-fab__icon at-icon at-icon-add"></text>
      <view class="text">添加</view>
    </AtFab>
    <!-- 一键清空 -->
    <AtFab class="fabClear" :on-click="clearTask">
      <text class="at-fab__icon at-icon at-icon-trash"></text>
      <view class="text">清空</view>
    </AtFab>

    <!-- finish弹窗 -->
    <AtModal :isOpened="finishModal" :onClose="closeAmodal">
      <AtModalHeader>提交计划表</AtModalHeader>
      <AtModalContent>
        <view class="finishText" v-if="number == list.length"
          >恭喜你！结束了今天定下的所有任务！保持下去，再接再厉哦！</view
        >
        <view class="finishText" v-else>
          恭喜你！完成了今天的定下的{{ number }}个任务，还有{{
            list.length - number
          }}个任务待完成，要继续加油哦！
        </view>
        <view class="finishText"
          >是否要提交该计划表？点击确认，保存到我的历史计划中，取消返回。</view
        >
      </AtModalContent>
      <AtModalAction>
        <button @tap="closeAmodal">取消</button
        ><button @tap="confirmAmodal">确认</button>
      </AtModalAction>
    </AtModal>

    <!-- 清空弹窗 -->
    <AtModal :isOpened="clearModal" :onClose="closeAmodal">
      <AtModalHeader>清空计划表</AtModalHeader>
      <AtModalContent>
        <view class="finishText"
          >确认是否清空计划表，清空后计划表无法复原。</view
        >
      </AtModalContent>
      <AtModalAction>
        <button @tap="closeAmodal">取消</button
        ><button @tap="clearAmodal" style="color: #ff4949">清空</button>
      </AtModalAction>
    </AtModal>
  </view>
</template>

<script>
import Task from "../../components/task/index.vue";
import Empty from "../../components/empty/index.vue";

import Taro from "@tarojs/taro";

import {
  AtButton,
  AtFab,
  AtList,
  AtSwipeAction,
  AtListItem,
  AtInput,
  AtToast,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
} from "taro-ui-vue";
import "./index.scss";

export default {
  name: "list",
  components: {
    Task,
    AtButton,
    AtFab,
    AtSwipeAction,
    AtList,
    AtListItem,
    AtInput,
    AtToast,
    AtModal,
    AtModalHeader,
    AtModalContent,
    AtModalAction,
    Empty,
  },
  data() {
    return {
      day: "",
      date: "",
      changeNum: ["日", "一", "二", "三", "四", "五", "六"],
      list: [
        {
          id: 0,
          description: "hellow~这里是你的计划表。",
          done: true,
        },
        {
          id: 1,
          description: "<< 左滑任务所在方块，打开操作栏。",
          done: true,
        },
        {
          id: 2,
          description: "点击完成，绿色代表该任务已完成。",
          done: true,
        },
        {
          id: 3,
          description: "点击待办，黄色代表该任务未完成。",
          done: false,
        },
        {
          id: 4,
          description: "点击右下↘添加键，新增任务。",
          done: true,
        },
        {
          id: 5,
          description: "点击左下↙清空键，清空计划表。",
          done: true,
        },
        {
          id: 6,
          description: "点击结束finish按键，提交当前计划表。",
          done: true,
        },
        {
          id: 7,
          description: "快来创建今日的计划吧！(ง •̀_•́)ง",
          done: true,
        },
      ],
      // 用于新建任务
      add: false,
      // id
      taskId: 0,
      // 完成数
      number: 0,
      // 弹窗
      finishModal: false,
      // 清空弹窗
      clearModal: false,
    };
  },

  created() {
    const nowdate = new Date();
    this.day = "星期" + this.changeNum[nowdate.getDay()];
    this.date =
      nowdate.getFullYear() +
      "年" +
      (nowdate.getMonth() + 1) +
      "月" +
      nowdate.getDate() +
      "日";
    //获取list
    if (Taro.getStorageSync("mylist")) {
      this.list = Taro.getStorageSync("mylist");
    }
  },
  // 页面消失时
  onHide() {
    Taro.setStorageSync("mylist", this.list);
  },
  onShareAppMessage(res) {},

  watch: {
    list: {
      handler() {
        this.number = 0;
        this.list.map((item) => {
          if (item.done == true) {
            this.number++;
          }
        });
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    // 修改状态
    changeDone(id, mydone) {
      this.list.map((item) => {
        if (item.id == id) {
          item.done = mydone;
        }
      });
    },
    // 修改内容
    changeDescription(id, description) {
      this.list.map((item) => {
        if (item.id == id) {
          item.description = description;
        }
      });
    },
    // 新建任务
    addTask() {
      this.add = true;
      if (this.add) {
        Taro.getRandomValues({
          length: 4, // 生成 4 个字节长度的随机数,
          success: (res) => {
            const taskId = Taro.arrayBufferToBase64(res.randomValues); // 转换为 base64 字符串后打印
            this.list.push({
              id: taskId,
              description: "",
              done: false,
            });
          },
        });
      }
    },
    //一键清空
    clearTask() {
      this.clearModal = true;
    },
    // 清空任务表
    clearAmodal() {
      this.list = [];
      // 存储到内存中
      Taro.setStorageSync("mylist", []);
      this.clearModal = false;
    },
    // 删除任务
    deleteTask(id) {
      const temp = this.list.find((item) => item.id == id);
      this.list.splice(this.list.indexOf(temp), 1);
    },
    // 结束任务表
    finishTasks() {
      this.finishModal = true;
    },
    // 关闭弹窗
    closeAmodal() {
      this.finishModal = false;
      this.clearModal = false;
    },
    // 提交任务表确认
    confirmAmodal() {
      const db = Taro.cloud.database();
      const _ = db.command;

      // 生成id
      Taro.getRandomValues({
        length: 6, // 生成 6 个字节长度的随机数,
        success: (res) => {
          // 生成id
          const id = Taro.arrayBufferToBase64(res.randomValues); // 转换为 base64 字符串后打印
          db.collection("users")
            .doc(Taro.getStorageSync("useropenid"))
            .update({
              data: {
                todos: _.push({
                  id: id,
                  due: new Date(),
                  list: this.list,
                }),
              },
              success: (res) => {
                this.finishModal = false;
                // 成功保存跳转到新的路由，post路由
                Taro.navigateTo({
                  url: "/pages/post/index?id=" + id,
                });
              },
              fail: (e) => {},
            });
        },
      });
    },
  },
};
</script>
