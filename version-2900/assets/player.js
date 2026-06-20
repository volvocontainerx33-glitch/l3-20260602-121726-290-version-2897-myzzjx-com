(function () {
    window.initMoviePlayer = function (options) {
        var root = document.querySelector(options.selector);
        if (!root) {
            return;
        }
        var video = root.querySelector("video");
        var overlay = root.querySelector(".player-overlay");
        var message = root.querySelector(".player-message");
        var stream = options.stream;
        var attached = false;
        var hls = null;

        function setMessage(text) {
            if (message) {
                message.textContent = text || "";
            }
        }

        function attachStream() {
            if (attached || !video || !stream) {
                return true;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                attached = true;
                return true;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        setMessage("影片暂时无法播放，请稍后重试");
                    }
                });
                attached = true;
                return true;
            }
            setMessage("影片暂时无法播放，请稍后重试");
            return false;
        }

        function begin() {
            if (!video || !attachStream()) {
                return;
            }
            video.controls = true;
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                    setMessage("点击画面继续播放");
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", begin);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (!attached) {
                    begin();
                    return;
                }
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                setMessage("");
            });
            video.addEventListener("ended", function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
