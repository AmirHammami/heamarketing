(function ($) {
    ("use strict");

    // Variables to store Plyr instances
    let videoPlayerInstance, audioPlayerInstance;

    // Function to initialize Plyr for video
    window.initVideoPlayer = function () {
        if ($('#video-player').length) {
            videoPlayerInstance = new Plyr('#video-player');
        }
    };

    // Function to initialize Plyr for audio
    window.initAudioPlayer = function () {
        if ($('#audio-player').length) {
            audioPlayerInstance = new Plyr('#audio-player');
        }
    };

    // Event listener for modal close to pause audio and video
    $(document).on('hidden.bs.modal', function (e) {
        if (videoPlayerInstance) {
            videoPlayerInstance.pause(); // Pause the video
        }
        if (audioPlayerInstance) {
            audioPlayerInstance.pause(); // Pause the audio
        }
    });

})(jQuery);
