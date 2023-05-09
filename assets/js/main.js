const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  songs: [
    {
      name: "Sau Những Lần Đau",
      singer: "Dũng ft fhung",
      path: "/./assets/music/song1.mp3",
      image: "/./assets/img/song1.png",
    },
    {
      name: "Thủ Đô Cypher",
      singer: "RPT MCK, RPT Orijinn, RZMas, LOW G",
      path: "../assets/music/song2.mp3",
      image: "../assets/img/song2.png",
    },
    {
      name: "Lan Man",
      singer: "Ronboogz",
      path: "../assets/music/song3.mp3",
      image: "../assets/img/song3.png",
    },
    {
      name: "Độ Tộc 2",
      singer: "Pháo, Độ Mixi, Phúc Du",
      path: "../assets/music/song4.mp3",
      image: "../assets/img/song4.png",
    },
    {
      name: "Sau Những Lần Đau",
      singer: "Dũng ft fhung",
      path: "/./assets/music/song1.mp3",
      image: "/./assets/img/song1.png",
    },
    {
      name: "Thủ Đô Cypher",
      singer: "RPT MCK, RPT Orijinn, RZMas, LOW G",
      path: "../assets/music/song2.mp3",
      image: "../assets/img/song2.png",
    },
    {
      name: "Lan Man",
      singer: "Ronboogz",
      path: "../assets/music/song3.mp3",
      image: "../assets/img/song3.png",
    },
    {
      name: "Độ Tộc 2",
      singer: "Pháo, Độ Mixi, Phúc Du",
      path: "../assets/music/song4.mp3",
      image: "../assets/img/song4.png",
    },
  ],
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return /*html*/ `<div class='song ${
        index === this.currentIndex ? "active" : ""
      }' data-index = '${index}'>
        <div class="thumb" style="background-image: url('${song.image}')">
        </div>
        <div class="body">
          <h3 class="title">${song.name}</h3>
          <p class="author">${song.singer}</p>
        </div>
        <div class="option">
          <i class="fas fa-ellipsis-h"></i>
        </div>
      </div>`;
    });
    playlist.innerHTML = htmls.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    //Xử lý  CD quay / dừng
    const cdThumbAnimate = cdThumb.animate(
      [
        {
          transform: "rotate(360deg)",
        },
      ],
      {
        duration: 10000, // 10 seconds
        iterations: Infinity,
      }
    );
    cdThumbAnimate.pause();

    // Xử lý phóng to / thu nhỏ
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    //Xử lý khi click play
    playBtn.onclick = function () {
      _this.isPlaying ? audio.pause() : audio.play();
    };

    // Khi song được play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // Khi song bị pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    // Xử lý khi tua song
    progress.onchange = function (event) {
      const seekTime = (audio.duration / 100) * event.target.value;
      audio.currentTime = seekTime;
    };

    //Khi next song
    nextBtn.onclick = function () {
      _this.isRandom ? _this.playRandomSong() : _this.nextSong();
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    //Khi prev song
    prevBtn.onclick = function () {
      _this.isRandom ? _this.playRandomSong() : _this.prevSong();
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Xử lý bật / tắt random song
    randomBtn.onclick = function (event) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    //Xử lý lập lại một song
    repeatBtn.onclick = function (event) {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      repeatBtn.classList.toggle("active", _this.isRepeat);
    };

    //Xử lý next song khi audio ended
    audio.onended = function () {
      _this.isRepeat ? audio.play() : nextBtn.click();
    };

    // Lắng nghe hành vi click vào playlist
    playlist.onclick = function (event) {
      const songNode = event.target.closest(".song:not(.active)");
      const songOption = event.target.closest(".option");
      if (songNode || songOption) {
        //Xử lý khi click vào song
        if (songNode) {
          _this.currentIndex = +songNode.dataset.index;
          _this.loadCurrentSong();
          _this.render();
          audio.play();
          setTimeout(() => {
            $(".song.active").scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }, 300);
        }

        // Xử lý khi click vào song option
        if (songOption) {
          console.log("Option!");
        }
      }
    };
  },
  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 300);
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  start: function () {
    //Gán cấu hình từ config vào ứng dụng
    this.loadConfig();

    //Định nghĩa các thuộc tính
    this.defineProperties();

    //Lắng nghe / sử lý các sự kiện (DOM Event)
    this.handleEvents();

    //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();

    //Render Playlist
    this.render();

    // Hiển thị trạng thái ban đầu của repeat & random
    repeatBtn.classList.toggle("active", this.isRepeat);
    randomBtn.classList.toggle("active", this.isRandom);
  },
};
app.start();
