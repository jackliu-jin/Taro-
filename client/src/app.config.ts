export default {
  pages: [
    'pages/index/index',
    'pages/list/index',
    'pages/user/index',
    'pages/post/index',
    'pages/history/index',
    'pages/zoom/index',
    'pages/follows/index',
    'pages/fans/index',
    'pages/webUrl/index',

  ],
  tabBar: {
    //字体颜色
    color: "#8a8a8a",
    // 选择后字体颜色
    selectedColor: "#6190E8",
    //背景颜色
    backgroundColor: "#FFF",
    // 边框颜色
    borderStyle: 'black',
    "list": [{
      "pagePath": "pages/index/index",
      "iconPath": 'image/icon/energy.png',
      "selectedIconPath": 'image/icon/energy-blue.png',
      "text": "首页"
    }, {
      "pagePath": "pages/list/index",
      "iconPath": 'image/icon/task.png',
      "selectedIconPath": 'image/icon/task-blue.png',
      "text": "计划表"
    }, {
      "pagePath": "pages/user/index",
      "iconPath": 'image/icon/user.png',
      "selectedIconPath": 'image/icon/user-blue.png',
      "text": "用户"
    }]
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  cloud: true
}
