const app = getApp()
const dayjs = require('../../utils/dayjs.min.js')
const io = require('../../utils/weapp.socket.io.js')

var socket = null;

//=====================================
var service_end = true;

const hostname = "<YOUR HOST>";
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
        bt_send_txt:"发送",
        chat_engine:"GTP",

        myAvatar: "http://api.btstu.cn/sjtx/api.php?lx=c1&format=images&method=mobile",
        servicerAvatar: "https://api.uomg.com/api/rand.avatar?sort=%E5%A5%B3&format=images",

        openStickerPanel: false,
    },
    onLoad() {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      })
      if (!wx.getStorageSync("token")) {
        //没有token  进入登陆页面
        wx.redirectTo({
          url: "/pages/login/index"
        });
        return;
      }      
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
    setSendButtonEnable(flag){
      this.setData({
        bt_send_txt:flag?"发送":"等待"
      })
    },
    
    sendMsg() {
        if (!this.data.content) return;
        console.log("sending_status = " + wx.getStorageSync("sending_status"))
        if(wx.getStorageSync("sending_status")) return;
        wx.setStorageSync('sending_status', true)
        this.setSendButtonEnable(false)
        console.log('发送消息:' + this.data.content);
        if(this.data.content.startsWith("#bing")){
          this.setData({
            chat_engine: "EDGE",
          }) ;  
          let data = {
            "message":this.data.content,
            "calltype":"呼入",
            "msgtype":"text"
          }; 
          let data2 = {
            "message":"已经切换到#Bing。",
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
          this.setData({
            content: "",
            openStickerPanel: false,
          })
          wx.setStorageSync('sending_status', false)
          this.setSendButtonEnable(true)
          return
        }else if(this.data.content.startsWith("#gtp")){
          this.setData({
            chat_engine: "GTP",
          }) ; 
          let data = {
            "message":this.data.content,
            "calltype":"呼入",
            "msgtype":"text"
          };   
          let data2 = {
            "message":"已经切换到#GTP。",
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
          this.setData({
            content: "",
            openStickerPanel: false,
          })       
          wx.setStorageSync('sending_status', false)
          this.setSendButtonEnable(true)
          return            
        }

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
      console.log("chat_engine:" + _this.data.chat_engine)
      let response = await this.request({
        url: `${http_protocol}://${hostname}/api/chat`,
        method: "POST",
        header: {
            "Content-Type": "application/json"
        },
        data: {"data":msg,"request_engeine":_this.data.chat_engine,"openid":wx.getStorageSync('openid')},
      });
      console.log(response.data);
      let data = {

      }
      wx.setStorageSync('sending_status', false)
      this.setSendButtonEnable(true)
      if(response.data.code * 1 == 401 || response.data.code * 1 == 403){
        data = {
          "message":'无法连接服务器 - 未授权',
          "calltype":"呼出",
          "msgtype":"text"
        };
      }
      else{
        data = {
          "message":response.data['response'],
          "calltype":"呼出",
          "msgtype":"text"
        };
      }

      console.log(_this.data.messageList);
      let messageList = _this.data.messageList;
      messageList[messageList.length - 1] = data;
      console.log(messageList);
      _this.setData({
        messageList: messageList,
      }) ;  
      _this.pageScrollToBottom(); 
    },
     
    async connect() {
        let _this = this;
        wx.setStorageSync('sending_status', false)
        this.setSendButtonEnable(true)
        let cc = {
          "message":"正在连接后台服务，请稍后...",
          "messageType":"message"
        }
        this.setData({
          notice: cc,
      })
        let response = await this.request({
            url: `${http_protocol}://${hostname}/api/chat`,
            method: "POST",
            header: {
                "Content-Type": "application/json"
            },
            data: {"data":"你好","openid":wx.getStorageSync('openid')}
        })
        console.log(response.data);
        let vnotice = {

        }
        if(response.data.code * 1 == 401 || response.data.code * 1 == 403){
          vnotice = {
            "message":"无法连接服务器 - 未授权",
            "messageType":"message"
          }
          wx.setStorageSync('token', null)
        }
        else{
          vnotice = {
            "message":"已经连接至 - " + this.data.chat_engine,
            "messageType":"message"
          }
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