(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var video = document.querySelector("[data-player]");
        var button = document.querySelector("[data-play-button]");
        var note = document.querySelector("[data-player-note]");

        if (!video) {
            return;
        }

        var source = video.getAttribute("data-src");
        var hlsInstance = null;
        var initialized = false;

        function setNote(text) {
            if (note) {
                note.textContent = text;
            }
        }

        function initializePlayer() {
            if (initialized) {
                return Promise.resolve();
            }

            initialized = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                setNote("播放器已使用浏览器原生 HLS 能力加载。");
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);

                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setNote("播放源已加载，可以开始播放。");
                });

                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setNote("当前播放源加载受限，已尝试交给浏览器直接播放。");
                        if (hlsInstance) {
                            hlsInstance.destroy();
                            hlsInstance = null;
                        }
                        video.src = source;
                    }
                });

                return Promise.resolve();
            }

            video.src = source;
            setNote("当前浏览器未检测到 HLS 扩展，已尝试直接播放 m3u8 地址。");
            return Promise.resolve();
        }

        function playVideo() {
            initializePlayer().then(function () {
                if (button) {
                    button.classList.add("is-hidden");
                }

                var promise = video.play();

                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        if (button) {
                            button.classList.remove("is-hidden");
                        }

                        setNote("浏览器阻止了自动播放，请再次点击播放按钮。");
                    });
                }
            });
        }

        if (button) {
            button.addEventListener("click", playVideo);
        }

        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });

        video.addEventListener("pause", function () {
            if (video.currentTime === 0 && button) {
                button.classList.remove("is-hidden");
            }
        });
    });
})();
