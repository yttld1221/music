// pages/singer/singer.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hidden: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
    var that = this;
    // loading加载
    this.setData({
      hidden: false
    });
    setTimeout(function () {
      that.setData({
        hidden: true
      });
    }, 1000);
    that.setData({
      music_id: options.id,
      music_name: options.name,
      music_singer: options.singer
    })
    wx.request({
      url: 'https://api.bzqll.com/music/netease/search?key=579621905&s=' + that.data.music_name + '&limit=40&offset=0',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        that.setData({
          music: res.data.data[that.data.music_id],
          music_src: res.data.data[that.data.music_id].pic
        })
      }
    })
    wx.request({
      url: 'https://api.bzqll.com/music/netease/search?key=579621905&s=' + that.data.music_singer + '&type=song&limit=40&offset=0',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        that.setData({
          musiclist: res.data.data
        })
      }
    })
  },
  //到歌曲页面
  to_detail: function (e) {
    console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '../detail/detail?id=' + e.currentTarget.dataset.id + '&name=' + this.data.music_singer
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