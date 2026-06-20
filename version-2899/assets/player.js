(function () {
  function attachPlayer(box) {
    var video = box.querySelector('video[data-hls]');
    var button = box.querySelector('[data-play-button]');
    var muteButton = box.querySelector('[data-mute-button]');
    var fullButton = box.querySelector('[data-full-button]');
    var status = box.querySelector('[data-player-status]');
    var hls = null;
    var attached = false;

    if (!video) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function prepare() {
      if (attached) {
        return;
      }

      var source = video.getAttribute('data-hls');
      if (!source) {
        setStatus('播放源加载失败');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus('网络错误，正在重试');
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus('媒体错误，正在恢复');
            hls.recoverMediaError();
          } else {
            setStatus('当前播放不可用');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        setStatus('当前浏览器暂不支持播放');
        return;
      }

      attached = true;
      setStatus('');
    }

    function togglePlay() {
      prepare();
      if (!attached) {
        return;
      }
      if (video.paused) {
        video.play().catch(function () {
          setStatus('请再次点击播放');
        });
      } else {
        video.pause();
      }
    }

    if (button) {
      button.addEventListener('click', togglePlay);
    }

    video.addEventListener('click', togglePlay);

    if (muteButton) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '取消静音' : '静音';
      });
    }

    if (fullButton) {
      fullButton.addEventListener('click', function () {
        if (video.requestFullscreen) {
          video.requestFullscreen();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player-box]')).forEach(attachPlayer);
})();
