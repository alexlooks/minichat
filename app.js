//app.js
App({
    onLaunch: function () {
      this.login().then((res)=>{
        this.globalData.code = res;
      }).catch(()=>{
        wx.showToast({
          title: '网络异常！',
          icon: "none",
          duration: 1000
        });

      });      
        // 获取系统状态栏信息
        wx.getSystemInfo({
            success: e => {
                this.globalData.StatusBar = e.statusBarHeight;
                let capsule = wx.getMenuButtonBoundingClientRect();
                if (capsule) {
                    this.globalData.Custom = capsule;
                    this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
                } else {
                    this.globalData.CustomBar = e.statusBarHeight + 50;
                }
            }
        })
    },
    globalData: {
        userInfo: null
    },
    login: function() {
      return new Promise((resolve,reject)=>{
        let token = wx.getStorageSync("token") || "";
        // 登录接口，没有token，那么获取到 code 存到 data 里面，使用code向服务器端获取token
        if (!token) {
          wx.login({
            success: codeInfo => {
              console.log("code: ",codeInfo);
              let code = codeInfo.code;
              resolve(code)
             
            },
            fail(err){
              console.log("登录异常");
              reject(err)
            }
          });
        } 
  
      })
     
    },
})