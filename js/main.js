/**
 * 1. Render songs => done
 * 2. Scroll top => done
 * 3. Play / pause / seek => done
 * 4. Cd rotated => done
 * 5. Next / prev => done
 * 6. Random => done
 * 7. Next / Repeat when ended => done
 * 8. Active song => done
 * 9. Scroll active song into view => done
 * 10. Play song when click => done
 */

const $ = document.querySelector.bind(document);

// Danh sách biến
const playlist = $('.playlist'); 
const audio = $('#audio');
const currentSong = $('.song-current');
const disk = $('.avatar');
const diskAvatar = $('.avatar-disk');
const btnToggle = $('.btn-toggle');
const btnPlay = $('.icon-play');
const btnPause = $('.icon-pause');
const progress = $('#progress');
const btnNext = $('.btn-forward');
const btnPrev = $('.btn-backward');
const btnRandom = $('.btn-random');
const btnRedo = $('.btn-redo');


const appMusicPlayer = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRedo: false,
    // Danh sách bài hát
    songs: [
        {
            songName: 'Yêu Là Cưới (Single)',
            singer: 'Phát Hồ',
            path: './music/yeulacuoi.mp3',
            avatar: 'https://photo-resize-zmp3.zadn.vn/w320_r1x1_jpeg/cover/4/9/d/a/49da6a1d6cf13a42e77bc3a945d9dd6b.jpg'
        },
        {
            songName: 'Thê Lương',
            singer: 'Phúc Chinh',
            path: './music/theluong.mp3',
            avatar: 'https://avatar-ex-swe.nixcdn.com/song/2021/03/12/e/2/9/e/1615554946033_500.jpg'
        },
        {
            songName: 'Cưới Thôi',
            singer: 'Masew, Masiu, B Ray, V.A',
            path: './music/cuoithoi.mp3',
            avatar: 'https://avatar-ex-swe.nixcdn.com/song/2021/09/09/f/c/f/d/1631181753902_500.jpg'
        },
        {
            songName: 'Hương',
            singer: 'Văn Mai Hương, Negav',
            path: './music/huong.mp3',
            avatar: 'https://avatar-ex-swe.nixcdn.com/song/2021/01/22/9/f/2/1/1611280898757_500.jpg'
        },
        {
            songName: 'Độ Tộc 2',
            singer: 'Masew, Độ Mixi, Phúc Du, V.A',
            path: './music/dotoc2.mp3',
            avatar: 'https://avatar-ex-swe.nixcdn.com/song/2021/08/10/b/2/e/0/1628579601228_500.jpg'
        },
        {
            songName: 'Thức Giấc',
            singer: 'Da LAB',
            path: './music/thucgiac.mp3',
            avatar: 'https://avatar-ex-swe.nixcdn.com/song/2021/07/14/8/c/f/9/1626231010810_500.jpg'
        },
    ],

    // Render ra màn hình
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song cursor ${index === this.currentIndex ? 'active' : '' }" data-index="${index}">
                    <div class="song-avatar" 
                        style="background-image: url('${song.avatar}')">
                    </div>
                    <div class="song-title">
                        <h2 class="song-name">${song.songName}</h2>
                        <h4 class="song-singer">${song.singer}</h4>
                    </div>
                    <div class="song-option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('');
    },

    handleEvent: function () {
        const diskWidth = disk.offsetWidth;
        
        // Xử lí scroll
        document.onscroll = function () {
            const scrollDown = window.scrollY || document.documentElement.scrollTop;
            const newAvatarWidth = diskWidth - scrollDown;

            disk.style.width = newAvatarWidth > 0 ? newAvatarWidth + 'px' : 0 ;
            disk.style.opacity = newAvatarWidth / diskWidth;
        };

        // Xử lí quay avatar 
        const rotateAvatar = diskAvatar.animate(
            [
                {
                    transform: 'rotate(360deg)',
                }
            ],
            {
                duration: 10000,
                iterations: Infinity,
            });
        rotateAvatar.pause();

        // Kiểm tra đang phát or dừng
        btnToggle.onclick = function () {
            if(appMusicPlayer.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        // Khi nhạc play
        audio.onplay = function () {
            appMusicPlayer.isPlaying = true;
            btnToggle.classList.add('playing');
            rotateAvatar.play();
        };

        // Khi nhạc pause
        audio.onpause = function () {
            appMusicPlayer.isPlaying = false;
            btnToggle.classList.remove('playing');
            rotateAvatar.pause();
        };

        // Xử lí tiên độ bài hát
        audio.ontimeupdate = function () {
            if(audio.duration) {
                const prosessPercent = Math.floor((audio.currentTime / audio.duration) * 100);
                progress.value = prosessPercent;
            }
        };

        // Xử lí khi tua bài hát
        progress.onchange = function (time) {
            const timeChange = (audio.duration / 100) * time.target.value;
            audio.currentTime = timeChange;
            audio.play()
        };

        // Xử lí khi next bài hát
        btnNext.onclick = function () {
            if (appMusicPlayer.isRandom){
                appMusicPlayer.randomSong();
            } else {
                appMusicPlayer.nextSong();
            }
            audio.play();
            appMusicPlayer.render();
            rotateAvatar.play();
            appMusicPlayer.scrollIntoCurrentSong(appMusicPlayer.currentIndex);
        };

        // Xử lí khi prev bài hát
        btnPrev.onclick = function () {
            if (appMusicPlayer.isRandom){
                appMusicPlayer.randomSong();
            } else {
                appMusicPlayer.prevSong();
            }
            audio.play();
            appMusicPlayer.render();
            rotateAvatar.play();
            appMusicPlayer.scrollIntoCurrentSong(appMusicPlayer.currentIndex);
        };

        // Xử lí khi hết bài hát
        audio.onended = function () {
            if (appMusicPlayer.isRedo) {
                audio.play();
            } else {
                btnNext.click();
            }
        };

        // Xử lí bật / tắt random bài hát
        btnRandom.onclick = function () {
            appMusicPlayer.isRandom = !appMusicPlayer.isRandom;
            btnRandom.classList.toggle("active", appMusicPlayer.isRandom);
        };

        // Xử lí bật / tắt redo bài hát
        btnRedo.onclick = function () {
            appMusicPlayer.isRedo = !appMusicPlayer.isRedo;
            btnRedo.classList.toggle("active", appMusicPlayer.isRedo);
        };

        // Xử lí khi click vào playlist
        playlist.onclick = function (event) {
            // Lấy node không chứa class active
            const songClick = event.target.closest('.song:not(.active)');

            if (songClick || event.target.closest('.option')) {
                
                // Xử lí khi click vào bài hát
                if (songClick) {
                    appMusicPlayer.currentIndex = Number(songClick.dataset.index);
                    appMusicPlayer.loadCurentSong();
                    appMusicPlayer.render();
                    audio.play();
                }

                // Xử lí khi click vào nút option
                if (event.target.closest('.option')) {

                }
            }

        };


    },

    // Load bài hát hiện tại
    loadCurentSong: function () {
        currentSong.textContent = this.songs[this.currentIndex].songName;
        diskAvatar.style.backgroundImage = `url('${this.songs[this.currentIndex].avatar}')`;
        audio.src = this.songs[this.currentIndex].path;
    },

    // Cuộn đến bài hát hiện tại
    scrollIntoCurrentSong: function () {
        if (appMusicPlayer.currentIndex === 0) {
            window.scrollTo(0,0);
        };
        $('.song.active').scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
        });
    },

    // Next bài hát
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurentSong();
    },

    // Prev bài hát
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurentSong();
    },

    // Random bài hát
    randomSong: function () {
        const newCurrentIndex = Math.floor(Math.random() * (this.songs.length + 1));
        this.currentIndex = newCurrentIndex;
        this.loadCurentSong();
    },

    // Redo bài hát
    redoSong: function () {
        this.loadCurentSong();
    },

    // Chạy ứng dụng
    start: function () {
        // Load bài hát hiện tại
        this.loadCurentSong();

        // Sử lí lăng nghe sự kiện
        this.handleEvent();

        // Render playlist
        this.render();
    }
}

appMusicPlayer.start();

