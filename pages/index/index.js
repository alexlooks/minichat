const app = getApp()
const dayjs = require('../../utils/dayjs.min.js')
const io = require('../../utils/weapp.socket.io.js')

var socket = null;

//=====================================
var service_end = true;

const hostname = "YOUR HOST";
const http_protocol = "https";
const http_port = "443";
const socket_protocol = "ws";
const socket_port = "8036";
const service_appid = "09xqjd"; //渠道ID，添加渠道后获得

Page({
    data: {
        content: "", //输入框值
        InputBottom: 0,
        config: {},

        messageList: [],
        notice: "",

        myAvatar: "http://api.btstu.cn/sjtx/api.php?lx=c1&format=images&method=mobile",
        servicerAvatar: "https://api.uomg.com/api/rand.avatar?sort=%E5%A5%B3&format=images",

        openStickerPanel: false,
    },
    onLoad() {
        this.connect();
    },
    InputFocus(e) {
        this.setData({
            InputBottom: e.detail.height
        })
    },
    InputBlur(e) {
        this.setData({
            InputBottom: 0
        })
    },
    inputing() {
        if (!socket) return;
        socket.emit('message', {
            appid: this.data.config.appid,
            userid: this.data.config.userid,
            type: "writing",
            session: this.data.config.sessionid,
            orgi: this.data.config.orgi,
            message: this.data.content,
        });
    },
    /**
     * 选择图片并上传发送
     */
    chooseImage() {
        let _this = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            success: (res) => {
                const tempFilePath = res.tempFilePaths[0];
                wx.uploadFile({
                    url: `${http_protocol}://${hostname}:${http_port}/im/image/upload.html?userid=${_this.data.config.userid}&appid=${_this.data.config.appid}&username=${_this.data.config.name}&orgi=${_this.data.config.orgi}`,
                    name: 'imgFile',
                    filePath: tempFilePath,
                })
            },
            fail: (res) => {},
            complete: (res) => {},
        })
    },
    sendMsg() {
        if (!this.data.content) return;
        console.log('发送消息:' + this.data.content);
        let data = {
          "message":this.data.content,
          "calltype":"呼入",
          "msgtype":"text"
        };
        let data2 = {
          "message":"好的，我看看，请稍等。",
          "calltype":"呼出",
          "msgtype":"text"
        };      
        console.log(this.data.messageList);
        let messageList = this.data.messageList;
        messageList[messageList.length] = data;
        messageList[messageList.length] = data2;
        console.log(messageList);
        this.setData({
          messageList: messageList,
        }) ;  
        this.pageScrollToBottom(); 
        this.send(this.data.content); 
        this.setData({
          content: "",
          openStickerPanel: false,
        })
        return
        

    },
    async send(msg) {
      let _this = this;
 
      let response = await this.request({
        url: `${http_protocol}://${hostname}/release/chat`,
        method: "POST",
        header: {
            "Content-Type": "application/json"
        },
        data: {"data":msg},
    });
    console.log(response.data['text']);
    let data = {
      "message":response.data['text'],
      "calltype":"呼出",
      "msgtype":"text"
    };
    console.log(_this.data.messageList);
    let messageList = _this.data.messageList;
    messageList[messageList.length] = data;
    console.log(messageList);
    _this.setData({
      messageList: messageList,
    }) ;  
    _this.pageScrollToBottom(); 
    },
     
    async connect() {
        let _this = this;
        let cc = {
          "message":"正在连接后台服务，请稍后...",
          "messageType":"message"
        }
        this.setData({
          notice: cc,
      })
        let response = await this.request({
            url: `${http_protocol}://${hostname}/release/chat`,
            method: "POST",
            header: {
                "Content-Type": "application/json"
            },
            data: {"data":"你好"},
        })
        console.log(response.data['text']);
        let vnotice = {
          "message":response.data['text'],
          "messageType":"message"
        }
        this.setData({
            notice: vnotice,
        })
    },

    request: (options) => {
        return new Promise((resolve, reject) => {
            options.success = (e) => {
                resolve(e);
            }
            options.fail = (e) => {
                reject(e);
            }
            wx.request(options);
        })

    },

    // 获取容器高度，使页面滚动到容器底部
    pageScrollToBottom: function () {
        wx.createSelectorQuery().select('#page').boundingClientRect(function (rect) {
            if (rect) {
                // 使页面滚动到底部
                console.log(rect.height);
                wx.pageScrollTo({
                    scrollTop: rect.height
                })
            }
        }).exec()
    },

    /**
     * 图片预览
     */
    previewImage(e) {
        let src = e.currentTarget.dataset.src;
        wx.previewImage({
            current: src,
            urls: [src],
        })
    },
    /**
     * 表情面板开关
     */
    switchStickerPanel() {
        this.setData({
            openStickerPanel: !this.data.openStickerPanel,
        })
    },
    chooseSticker(e) {
        let idx = e.currentTarget.dataset.idx;
        this.setData({
            content: this.data.content + `[${idx}]`,
        })
    },
})