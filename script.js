(() => {
    const videoContainer = document.getElementsByClassName('video-container')[0];
    
    const video = document.querySelector("video");
    const videoControls = document.getElementsByClassName("controls");
    const subtitleContainer = document.getElementById('subtitleContainer');
    
    const playBtn = document.getElementById('playBtn');
    const muteBtn = document.getElementById('muteBtn');
    const subtitleBtn = document.getElementById('subtitleBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    const seekBar = document.getElementById("seek-bar");
    const volumeBar = document.getElementById("volume-bar");
    
    let controlsTimeout = null;
    let subtitlesCheckInterval = null;
    let subtitles = [];
    let areSubtitlesOn = false;
    
    video.controls = false;
    
    const showControls = e => {
        clearTimeout(controlsTimeout); 
        videoControls[0].style.transform = "translateY(0)"
        subtitleContainer.style.bottom = "30px";
        
       controlsTimeout = setTimeout(() => {
            videoControls[0].style.transform = "translateY(100%)"
            subtitleContainer.style.bottom = "18px";
        }, 3000)
    };
    
    const showSubtitles = () => {
        if(!subtitles) {
            return;
        }
        let currentSubtitle = null;
        
        subtitlesCheckInterval = setInterval(()=>{
            
            let index = subtitles.findIndex(subtitle => 
                    (subtitle.timeStart <= video.currentTime 
                    && subtitle.timeEnd >= video.currentTime)
                );
            
            if(index >= 0) {
                if(currentSubtitle !== index) {
                    currentSubtitle = index;
                    subtitleContainer.firstElementChild.innerText = subtitles[index].text;
                    subtitleContainer.firstElementChild.style.visibility = "visible";
                }
            } else {
                subtitleContainer.firstElementChild.style.visibility = "hidden";
            }
        },400);
    }
    
    //EventListeners
    
    playBtn.addEventListener('click', () => {
        const buttonIcon = playBtn.children[0];
        
        if (video.paused == true) {
            video.play();
            playBtn.firstElementChild.className = 'fas fa-pause';
        } else {
            video.pause();
            playBtn.firstElementChild.className = 'fas fa-play';
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.keyCode === 32 && video.paused == true) {
            video.play();
            playBtn.firstElementChild.className = 'fas fa-pause';
        } else {
            video.pause();
            playBtn.firstElementChild.className = 'fas fa-play';
        }
    });
    
    muteBtn.addEventListener('click', () => {
        const buttonIcon = muteBtn.firstElementChild;
        
        buttonIcon.className = buttonIcon.className === 'fas fa-volume-up' 
            ? 'fas fa-volume-off' 
            : 'fas fa-volume-up'; 
        
        if (video.muted == false) {
            video.muted = true;
        } else {
            video.muted = false;
        }
    });
    
    subtitleBtn.addEventListener('click', () => {
        const buttonIcon = subtitleBtn.firstElementChild;
        areSubtitlesOn = buttonIcon.className === 'fas fa-not-equal';
        
        buttonIcon.className = areSubtitlesOn ? 'fas fa-equals' : 'fas fa-not-equal'; 
        subtitleContainer.style.display = areSubtitlesOn ? 'none' : 'block';
         
        if (areSubtitlesOn) {
            clearInterval(subtitlesCheckInterval);
            areSubtitlesOn = false;
        } else {
            showSubtitles();
            areSubtitlesOn = true;
        }
    });
    
    fullscreenBtn.addEventListener('click', () => {
        const buttonIcon = fullscreenBtn.firstElementChild;
        
        const isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
            (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
            (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
            (document.msFullscreenElement && document.msFullscreenElement !== null);
        
        buttonIcon.className = buttonIcon.className === 'fas fa-expand-arrows-alt' 
            ? 'fas fa-compress' 
            : 'fas fa-expand-arrows-alt'; 
        
        if(!isInFullScreen) {
            if (videoContainer.requestFullscreen) {
                videoContainer.requestFullscreen();
            } else if (videoContainer.mozRequestFullScreen) {
                videoContainer.mozRequestFullScreen();
            } else if (videoContainer.webkitRequestFullscreen) {
                videoContainer.webkitRequestFullscreen();
            } else if (videoContainer.msRequestFullscreen) {
                videoContainer.msRequestFullscreen(); 
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
        
    });
    
    document.addEventListener("webkitfullscreenchange", function () {
        const isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
            (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
            (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
            (document.msFullscreenElement && document.msFullscreenElement !== null);
         
        if(!isInFullScreen) {
            subtitleContainer.style.fontSize = '22px';
            videoContainer.style.maxWidth = '800px';
        } else {
            subtitleContainer.style.fontSize = '35px';
            videoContainer.style.maxWidth = '100%'
        }
    });
    
    seekBar.addEventListener("change", function() {
        const time = video.duration * (seekBar.value / 100);
        video.currentTime = time;
    });
    
    seekBar.addEventListener("mousedown", () => {
        video.pause();
    });
    
    seekBar.addEventListener("mouseup", () => {
        video.play();
        playBtn.firstElementChild.className = 'fas fa-pause';
    });
    
    video.addEventListener("timeupdate", () => {
        const value = (100 / video.duration) * video.currentTime;
        seekBar.value = value;
    });
    
    volumeBar.addEventListener("change", function() {
        const buttonIcon = muteBtn.firstElementChild;
        video.volume = volumeBar.value;
        
        buttonIcon.className = volumeBar.value <= 0.1 
            ? 'fas fa-volume-off' 
            : 'fas fa-volume-up'; 
    });
    
    video.addEventListener("mousemove", showControls);
    videoControls[0].addEventListener("mousemove", showControls);
    
    //Utils
    
    const getTimeInSeconds = (time) => {
        const splittedTime = time.split(/(\d+)/);
        
        return Number(splittedTime[1]) * 3600 + Number(splittedTime[3]) * 60 + Number(splittedTime[5])
    };
    
    //Get subtitles
    
    (async () => {
        const textURL = 'http://n-0-122.dcs.redcdn.pl/file/o2/atendesoftware/portal/video/atendesoftware/atendesoftware_2a.txt';
        const fetchedText = await fetch(textURL)
            .then((response) => response.text());
        
        let lines = fetchedText.match(/[^\r\n]+/g);
        
        for(line of lines) {
            let splittedLine = line.split(/(\d+:\d+:\d+\.\d+)\s(\d+:\d+:\d+\.\d+)/);
             
            subtitles.push({
                timeStart: getTimeInSeconds(splittedLine[1]), 
                timeEnd: getTimeInSeconds(splittedLine[2]),
                text: splittedLine[3].slice(1)
            })
        }
    })();
    
})();