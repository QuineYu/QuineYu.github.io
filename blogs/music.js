$(function(){

    var audio = $('#audioTag').get(0);
    //播放暂停控制
    $('#playPause').click(function(){

        //监听音频播放时间并更新进度条
        audio.addEventListener('timeupdate',updateProgress,false);
        //监听播放完成事件
        audio.addEventListener('ended',audioEnded,false);


        //改变暂停/播放icon
        if(audio.paused){
            audio.play();
            $('.icon-btn').removeClass('icon-play').addClass('icon-pause')
        } else{
            audio.pause();
            $('.icon-btn').removeClass('icon-pause').addClass('icon-play')
        }
    })

    //读取视频长度,设置页面时长显示-loadedmetadata:指定视频/音频（audio/video）的元数据加载后触发
    //audio.duration 获取音频的时长，单位为秒
    $('#audioTag').on("loadedmetadata",function () {
        //alert(audio.duration)
        $('#audioTime').text(transTime(this.duration));
    });

    var pgsWidth = $('.pgs img').width()*0.907; //0.907是 进度条这个div和整个进度条图片宽度的比例
    //点击进度条跳到指定点播放
    $('.pgs img').click(function (e) {

        var rate = (e.offsetX - ($(this).width()-pgsWidth)/2)/pgsWidth;
        audio.currentTime = audio.duration * rate;
        updateProgress();
    });

})
//转换音频时长显示
function transTime(time) {
    var duration = parseInt(time);
    var minute = parseInt(duration/60);
    var sec = duration%60+'';
    var isM0 = ':';
    if(minute == 0){
        minute = '00';
    }else if(minute < 10 ){
        minute = '0'+minute;
    }
    if(sec.length == 1){
        sec = '0'+sec;
    }
    return minute+isM0+sec
}

//更新进度条
function updateProgress() {
    var audio =document.getElementsByTagName('audio')[0];
    var value = Math.round((Math.floor(audio.currentTime) / Math.floor(audio.duration)) * 100, 0);
    $('.pgs-play').css('width', value * 0.907 + '%');
    $('.played-time').html(transTime(audio.currentTime));


}
//播放完成
function audioEnded() {
    var audio =document.getElementsByTagName('audio')[0];
    audio.currentTime=0;
    audio.pause();
    $('.play-pause>span').removeClass('icon-pause').addClass('icon-play');
}
