// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hidden: true,
    str:'',
    tag:false,
    musiclist:[]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    //懒加载
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          clientHeight: res.windowHeight
        });
      }
    })
    // loading加载
    this.setData({
      hidden: false
    });
    setTimeout(function () {
      that.setData({
        hidden: true
      });
    }, 1000);
  },
  //获取值
  get_value:function(e){
    var that=this;
    this.setData({
      hidden: false
    });
    setTimeout(function () {
      that.setData({
        hidden: true
      });
    }, 1000);
    this.setData({
      str:e.detail.value
    })
    wx.request({
      url: 'https://api.itooi.cn/music/netease/search?key=579621905&s=' + this.data.str + '&limit=100&offset=0', // 仅为示例，并非真实的接口地址
      success: (res => {
        this.setData({
          musiclist: res.data.data
        })
        if (this.data.musiclist == '') {
          this.setData({
            tag: false
          })
        } else {
          this.setData({
            tag: true
          })
        }
        console.log(this.data.musiclist)
        console.log(this.data.tag)
      })

    })
  },
  //到歌曲页面
  to_detail:function(e){
    console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '../detail/detail?id=' + e.currentTarget.dataset.id + '&name=' + this.data.str
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
   
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})