(function ($) {
    ("use strict");

    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var player,
        progressDrag = false,
        soundDrag = false,
        isClicking = false,
        y_progress_timer,
        click_timer;

    window.initYoutubePlayer = function () {
        var videoId = $(document).find('#youtube-player-video').data('video-id');
        player = new YT.Player('youtube-player-video', {
            width: 853,
            height: 480,
            videoId: videoId,
            playerVars: {
                autoplay: 1,
                controls: 0,
                showinfo: 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    };

    function onPlayerReady(e) {
        const soundBar = $(document).find('.sound-bar');
        const progressBar = $(document).find('.progress-bar');
        const playButton = $(document).find('.play-button');
        const soundButton = $(document).find('.sound-button');
        const fullscreenButton = $(document).find('.fullscreen-button');
        const videoOverlayButton = $(document).find('.youtube-video-overBtn');

        player.setVolume(70);
        soundBar.val(70);
        $(document).find('.progress-text').html("00:00:00");
        player.setPlaybackQuality('hd1080');
        launch_y_progress_timer();

        playButton.on('click', togglePlayPause);
        videoOverlayButton.on('click', togglePlayPause);
        soundButton.on('click', toggleMute);
        fullscreenButton.on('click', toggleFullscreen);

        progressBar.on('mousedown', () => { progressDrag = true; });
        $(document).on('mouseup', function (e) {
            if (progressDrag) { setProgress(e); progressDrag = false; }
            if (soundDrag) { soundDrag = false; setVolume(e); }
        });
        $(document).on('mousemove', function (e) {
            if (progressDrag) { setProgress(e); }
            if (soundDrag) { setVolume(e); }
        });
        progressBar.on('click', updateProgress);

        soundBar.on('mousedown', function () { soundDrag = true; });
        soundBar.on('click', setVolume);
    }

    function onPlayerStateChange(e) {
        if (e.data === YT.PlayerState.PLAYING) {
            $(document).find('.youtube-video-overBtn').css('opacity', 0);
            $(document).find('.play-button').html('<i class="fa fa-pause"></i>');
        } else if (e.data === YT.PlayerState.PAUSED) {
            $(document).find('.youtube-video-overBtn').css('opacity', 1);
            $(document).find('.play-button').html('<i class="fa fa-play"></i>');
        } else if (e.data === YT.PlayerState.ENDED) {
            $(document).find('.youtube-video-overBtn').css('opacity', 1);
            player.stopVideo();
            $(document).find('.play-button').html('<i class="fa fa-play"></i>');
        }
    }

    function launch_y_progress_timer() {
        clearInterval(y_progress_timer);
        y_progress_timer = setInterval(updateProgress, 500);
    }

    function updateProgress() {
        if (player && player.getDuration()) {
            var percentage = Math.floor((100 / player.getDuration()) * player.getCurrentTime());
            $(document).find('.progress-bar').val(percentage);
            $(document).find('.progress-text').html(formatTime(player.getCurrentTime()) + ' / ' + formatTime(player.getDuration()));
        }
    }

    function setProgress(e) {
        var offsetLeft = $(document).find('.progress-bar').offset().left;
        var position = e.pageX - offsetLeft;
        var percentage = 100 * position / $(document).find('.progress-bar').width();
        percentage = Math.max(0, Math.min(percentage, 100));
        player.seekTo(player.getDuration() * percentage / 100);
    }

    function togglePlayPause() {
        launch_click_timer();
        var play_state = player.getPlayerState();
        if (play_state === -1 || play_state === 0 || play_state === 2 || play_state === 5) {
            player.playVideo();
        } else if (play_state === 1) {
            player.pauseVideo();
        }
    }

    function toggleMute() {
        launch_click_timer();
        if (player.isMuted()) {
            player.unMute();
            updateVolume_controls(player.getVolume());
        } else {
            player.mute();
            updateVolume_controls(0);
        }
    }

    function setVolume(e) {
        var offsetLeft = $(document).find('.sound-bar').offset().left;
        var position = e.pageX - offsetLeft;
        var volume = position / $(document).find('.sound-bar').width() * 100;
        volume = Math.max(0, Math.min(volume, 100));
        player.setVolume(volume);
        updateVolume_controls(volume);
    }

    function updateVolume_controls(volume) {
        var icon = volume === 0 ? 'fa-volume-mute' : volume < 50 ? 'fa-volume-down' : 'fa-volume-up';
        $(document).find('.sound-button').html('<i class="fa ' + icon + '"></i>');
        $(document).find('.sound-bar').val(volume);
    }

    function formatTime(time) {
        var hours = Math.floor(time / 3600),
            minutes = Math.floor((time - (hours * 3600)) / 60),
            seconds = Math.floor(time - (hours * 3600) - (minutes * 60));
        return [hours, minutes, seconds].map(v => (v < 10 ? '0' : '') + v).join(':');
    }

    function toggleFullscreen() {
        var youtubePlayer = $(document).find('.youtube-player')[0];
        var requestFullScreen = youtubePlayer.requestFullscreen ||
            youtubePlayer.mozRequestFullScreen ||
            youtubePlayer.webkitRequestFullscreen ||
            youtubePlayer.msRequestFullscreen;
        if (requestFullScreen) requestFullScreen.call(youtubePlayer);
    }

    function launch_click_timer() {
        isClicking = true;
        clearTimeout(click_timer);
        click_timer = setTimeout(() => { isClicking = false; }, 50);
    }

    $(document).on('hidden.bs.modal', '.modal', function () {
        if (player && player.pauseVideo) {
            player.pauseVideo();
        }
    });

    window.addEventListener('load', function () {
        initYoutubePlayer();
    })

})(jQuery);
