// pages/detail/detail.js
const innerAudioContext = wx.createInnerAudioContext('myAudio')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: '',
    tag:true,
    audioSeek: 0,
    audioDuration: 0,
    showTime1: '00:00',
    showTime2: '00:00',
    audioTime: 0,
    play_state:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this;
    innerAudioContext.autoplay = true
    innerAudioContext.loop = true
    // console.log(options.id)
    that.setData({
      music_id: options.id,
      music_name: options.name,
      tag:true,
      showTime1: '00:00'
    })
   
    wx.request({
      url: 'https://api.bzqll.com/music/netease/search?key=579621905&s=' + this.data.music_name+'&limit=40&offset=0', // 仅为示例，并非真实的接口地址
      header: {//请求头
        "Content-Type": "applciation/json"
      },
      method: "GET",
      success: (res => {
        innerAudioContext.src = res.data.data[this.data.music_id].url
        that.setData({
          music: res.data.data[this.data.music_id],
          music_length: res.data.data.length
        })
        //歌词
        var newArr = []
        wx.request({
          url: 'https://api.bzqll.com/music/netease/lrc?id=' + this.data.music.id + '&key=579621905', // 仅为示例，并非真实的接口地址
          success: (res => {
            this.setData({
              text: res.data
            })
            newArr = parseLyric(this.data.text);
            // console.log(newArr)
            function parseLyric(text) {
              //将文本分隔成一行一行，存入数组
              let lines = text.split('\n'),
                //n
                //用于匹配时间的正则表达式，匹配的结果类似[xx:xx.xxx]
                pattern = /\[\d{2}:\d{2}.\d{2,3}]/g,
                //保存最终结果的数组
                result = [];
              //去掉不含时间的行
              while (!pattern.test(lines[0])) {
                  lines = lines.slice(1);
              }
              lines.pop();
              // console.log(pattern);

              lines.forEach(function (v, i, a) {
                //提取时间
                let time = v.match(pattern);
                //提取歌词
                let value = v.replace(pattern, '');
                // console.log(time);
                time.forEach(function (v1, i1, a1) {
                  //去掉时间里的中括号得到xx:xx.xx
                  let t = v1.slice(1, -1).split(':');
                  //将结果压入最终数组
                  // console.log(parseInt(t[0], 10) * 60 + parseFloat(t[1]));
                  result[Math.floor(parseInt(t[0], 10) * 60 + parseFloat(t[1]))] = value;

                  // result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value]);
                });
              });
              //最后将结果数组中的元素按时间大小排序，以便保存之后正常显示歌词
              // result.sort(function (a, b) {
              //   return a[0] - b[0];
              // });
              // console.log(result)
              return result;
            }
          })
        })
        innerAudioContext.onTimeUpdate(() => {
        
          if (newArr[Math.floor(innerAudioContext.currentTime)]){
            this.setData({
              gc: newArr[Math.floor(innerAudioContext.currentTime)]
            })
          }
        
        })     
      })
    })
    //进度条
    //初始化duration
    innerAudioContext.duration
    setTimeout(function () {
      //延时获取音频真正的duration
      var duration = innerAudioContext.duration;
      var min = parseInt(duration / 60);
      var sec = parseInt(duration % 60);
      if (min.toString().length == 1) {
        min = `0${min}`;
      }
      if (sec.toString().length == 1) {
        sec = `0${sec}`;
      }
      that.setData({ audioDuration: innerAudioContext.duration, showTime2: `${min}:${sec}` });
    }, 1000)
  },
  //计步器
  loadaudio() {
    var that = this;
    //设置一个计步器
    this.data.durationIntval = setInterval(function () {
      //当歌曲在播放时执行
      if (that.data.tag == true) {
        //获取歌曲的播放时间，进度百分比
        var seek = that.data.audioSeek;
        var duration = innerAudioContext.duration;
        var time = that.data.audioTime;
        time = parseInt(100 * seek / duration);
        //当歌曲在播放时，每隔一秒歌曲播放时间+1，并计算分钟数与秒数
        var min = parseInt((seek + 1) / 60);
        var sec = parseInt((seek + 1) % 60);
        //填充字符串，使3:1这种呈现出 03：01 的样式
        if (min.toString().length == 1) {
          min = `0${min}`;
        }
        if (sec.toString().length == 1) {
          sec = `0${sec}`;
        }
        var min1 = parseInt(duration / 60);
        var sec1 = parseInt(duration % 60);
        if (min1.toString().length == 1) {
          min1 = `0${min1}`;
        }
        if (sec1.toString().length == 1) {
          sec1 = `0${sec1}`;
        }
        //当进度条完成，停止播放，并重设播放时间和进度条
        if (time >= 100) {
          innerAudioContext.stop();
          that.setData({ audioSeek: 0, audioTime: 0, audioDuration: duration, tag: false, showTime1: `00:00` });
          var mid = parseInt(that.data.music_id)+1;
          that.onLoad({ id: mid, name: that.data.music_name });
          
          return false;
        }
        //正常播放，更改进度信息，更改播放时间信息
        that.setData({ audioSeek: seek + 1, audioTime: time, audioDuration: duration, showTime1: `${min}:${sec}`, showTime2: `${min1}:${parseInt(sec1)+1}` });
      }
    }, 1000);
  },
  //更新时间
  
  //暂停
  stop_song:function(){
    innerAudioContext.pause()
    this.setData({
      tag:!this.data.tag
    })
  },
  //播放
  play_song:function(){
    innerAudioContext.play()
    this.setData({
      tag: !this.data.tag
    })
  },
  //拖动进度条事件
  sliderChange(e) {
    var that = this;
    //获取进度条百分比
    var value = e.detail.value;
    this.setData({ audioTime: value });
    var duration = this.data.audioDuration;
    //根据进度条百分比及歌曲总时间，计算拖动位置的时间
    value = parseInt(value * duration / 100);
    //更改状态
    this.setData({ audioSeek: value, tag: true });
    //调用seek方法跳转歌曲时间
    innerAudioContext.seek(value);
    //播放歌曲
    innerAudioContext.play();
  },
  //上一首
  prev_song:function(){
    var that = this;
    var duration = innerAudioContext.duration;
    that.setData({ audioSeek: 0, audioTime: 0, audioDuration: duration, tag: false, showTime1: `00:00` });
    console.log(this.data.music_id)
    if (parseInt(this.data.music_id) == 0){
      this.setData({
        music_id: parseInt(this.data.music_length) - 1
      })

      this.onLoad({ id: this.data.music_id, name: this.data.music_name });
      // wx.redirectTo({
      //   url: '../detail/detail?id=' + this.data.music_id + '&name=' + this.data.music_name
      // })
      console.log(this.data.music_id)
    }else{
      this.setData({
        music_id: parseInt(this.data.music_id)-1
      })
      this.onLoad({ id: this.data.music_id, name: this.data.music_name});
      // wx.redirectTo({
      //   url: '../detail/detail?id=' + this.data.music_id + '&name=' + this.data.music_name
      // })
      console.log(this.data.music_id)
    }
  },
  //下一首
  next_song: function () {
    var that=this;
    var duration = innerAudioContext.duration;
    that.setData({ audioSeek: 0, audioTime: 0, audioDuration: duration, tag: false, showTime1: `00:00` });
    console.log(this.data.music_id)
    if (parseInt(this.data.music_id) == parseInt(this.data.music_length)-1) {
      this.setData({
        music_id: 0
      })
      this.onLoad({ id: this.data.music_id, name: this.data.music_name });
      // wx.redirectTo({
      //   url: '../detail/detail?id=' + this.data.music_id + '&name=' + this.data.music_name
      // })
      console.log(this.data.music_id)
    } else {
      this.setData({
        music_id: parseInt(this.data.music_id) + 1
      })
      this.onLoad({ id: this.data.music_id, name: this.data.music_name });
      // wx.redirectTo({
      //   url: '../detail/detail?id=' + this.data.music_id + '&name=' + this.data.music_name
      // })
      console.log(this.data.music_id)
    }
  },
  //遍历歌手歌曲
  search_singer:function(e){
    console.log(e.currentTarget.dataset.singer)
    wx.navigateTo({
      url: '../singer/singer?id=' + this.data.music_id + '&name=' + this.data.music_name+'&singer=' + e.currentTarget.dataset.singer
    })
  },
  // 
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadaudio();
   
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