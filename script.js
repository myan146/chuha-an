/* =========================================================
   ENTER ARCHIVE + AUTO PLAY MUSIC
========================================================= */

function enterWebsite() {

    const entrance = document.querySelector(".entrance");
    const archive = document.querySelector(".archive-page");

    if (!entrance || !archive) return;

    /* CLICK SOUND */
    playClickSound();

    /* TRANSITION */
    entrance.classList.add("is-leaving");
    archive.classList.add("is-opening");
    document.body.classList.add("archive-mode");

    /*
        QUAN TRỌNG:
        Gọi nhạc NGAY TRONG CLICK ENTER.
        Đây là user gesture nên trình duyệt dễ cho phép
        audio.play() hơn rất nhiều so với setTimeout().
    */
    autoPlayMusic();

    setTimeout(() => {

        entrance.classList.add("is-hidden");
        archive.classList.add("is-visible");

    }, 900);
}


/* =========================================================
   AUTO PLAY MUSIC KHI VÀO ARCHIVE
========================================================= */

function autoPlayMusic() {

    console.log("🎵 ENTER → Kích hoạt Love Story...");

    // LẤY AUDIO TỪ GLOBAL
    let audio = window._musicAudio;

    // NẾU CHƯA CÓ, TẠO MỚI NGAY
    if (!audio) {
        console.log("🔄 Tạo audio mới trong autoPlayMusic...");
        
        const MUSIC_FOLDER = "assets/music/";
        const playlist = [
            { name: "🎵 Love story", file: "lovestory.mp3" },
            { name: "🎵 Haunted", file: "haunted.mp3" },
            { name: "🎵 Young and beautiful", file: "lana.mp3" },
            { name: "🎵 Yes to heaven", file: "heaven.mp3" },
            { name: "🎵 No one noticed", file: "noticed.mp3" },
            { name: "🎵 Back to friends", file: "backtofriends.mp3" },
            { name: "🎵 Attention", file: "attention.mp3" },
            { name: "🎵 We don't talk anymore", file: "charlie.mp3" },
            { name: "🎵 Criminial", file: "criminal.mp3" },
            { name: "🎵 I was never there", file: "tw.mp3" }
        ];

        const filePath = MUSIC_FOLDER + playlist[0].file;
        console.log("📁 Đường dẫn:", filePath);

        const newAudio = new Audio(filePath);
        newAudio.loop = true;
        newAudio.volume = 0.5;

        // BẮT LỖI
        newAudio.addEventListener('error', () => {
            console.error("❌ KHÔNG TÌM THẤY FILE:", filePath);
            console.error("🔍 Kiểm tra: file có trong assets/music/ không?");
        });

        newAudio.addEventListener('canplay', () => {
            console.log("✅ File nhạc sẵn sàng!");
        });

        // LƯU VÀO GLOBAL
        window._musicAudio = newAudio;
        window._musicPlaylist = playlist;
        window._currentTrackIndex = 0;
        audio = newAudio;
    }

    // PHÁT NHẠC
    audio.play()
        .then(() => {
            console.log("✅ Love Story đang phát!");
            window._isMusicPlaying = true;

            if (typeof window._setMusicPlaying === "function") {
                window._setMusicPlaying(true);
            }

            updateMusicUI(true);
            updateDiscRotationGlobal(true);
            localStorage.setItem("chuhaan-music", "playing");
        })
        .catch((error) => {
            console.warn("⚠️ Không thể tự phát nhạc:", error);
            console.log("💡 Click vào icon ♪ để bật nhạc thủ công");
            window._isMusicPlaying = false;
            updateMusicUI(false);
            updateDiscRotationGlobal(false);
        });
}


/* =========================================================
   UPDATE MUSIC UI — ICON HEADER
========================================================= */

function updateMusicUI(playing) {

    console.log("🔄 Cập nhật Music UI:", playing ? "Đang phát" : "Tạm dừng");

    const musicToggle = document.getElementById("musicToggle");
    if (musicToggle) {
        musicToggle.textContent = playing ? "♫" : "♪";
    }

    const playBtn = document.getElementById("playPauseBtn");
    if (playBtn) {
        playBtn.textContent = playing ? "⏸" : "▶";
    }
}


/* =========================================================
   UPDATE DISC ROTATION GLOBAL
========================================================= */

let _discAnimationId = null;
let _discRotation = 0;

function updateDiscRotationGlobal(playing) {

    const disc = document.getElementById("vinylDisc");
    if (!disc) return;

    if (_discAnimationId) {
        cancelAnimationFrame(_discAnimationId);
        _discAnimationId = null;
    }

    if (playing) {
        let lastTime = performance.now();
        let rotation = _discRotation;

        function spinDisc(time) {
            const delta = time - lastTime;
            lastTime = time;
            rotation += (delta / 3000) * 360;
            disc.style.transform = `rotate(${rotation % 360}deg)`;
            _discRotation = rotation;
            _discAnimationId = requestAnimationFrame(spinDisc);
        }

        _discAnimationId = requestAnimationFrame(spinDisc);
    } else {
        disc.style.transform = `rotate(${_discRotation % 360}deg)`;
    }
}


/* =========================================================
   CINEMATIC CLICK SOUND
========================================================= */

function playClickSound() {

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(900, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(480, audioContext.currentTime + 0.12);

    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.18);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
}


/* =========================================================
   PLOT BUTTON
========================================================= */

document.querySelectorAll(".plot-button").forEach(button => {
    button.addEventListener("click", () => {
        const link = button.dataset.link;
        if (!link) return;
        window.open(link, "_blank");
    });
});


/* =========================================================
   CHARACTER SEARCH + TAG FILTER
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.getElementById("characterSearch");
    const tagButtons = document.querySelectorAll(".archive-tags .tag");
    const characterCards = document.querySelectorAll(".character-card");

    if (!searchInput || !characterCards.length) {
        console.warn("Character filter: missing elements.");
        return;
    }

    function normalizeText(text) {
        return (text || "")
            .toString()
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    let currentTag = "tat ca";

    function filterCharacters() {
        const searchValue = normalizeText(searchInput.value);

        characterCards.forEach(card => {
            const name = normalizeText(card.dataset.name || card.querySelector("h3")?.textContent || "");
            const tags = normalizeText(card.dataset.tags || "");

            const matchesSearch = !searchValue || name.includes(searchValue) || tags.includes(searchValue);
            const matchesTag = currentTag === "tat ca" || tags.includes(currentTag);

            if (matchesSearch && matchesTag) {
                card.style.display = "";
                requestAnimationFrame(() => card.classList.remove("filter-hidden"));
            } else {
                card.classList.add("filter-hidden");
                setTimeout(() => {
                    if (card.classList.contains("filter-hidden")) {
                        card.style.display = "none";
                    }
                }, 180);
            }
        });
    }

    tagButtons.forEach(button => {
        button.addEventListener("click", () => {
            tagButtons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            currentTag = normalizeText(button.dataset.tag);
            filterCharacters();
        });
    });

    searchInput.addEventListener("input", filterCharacters);
    filterCharacters();
});


/* =========================================================
   THEME TOGGLE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const themeToggle = document.getElementById("themeToggle");
    const archivePage = document.querySelector(".archive-page");

    if (!themeToggle || !archivePage) return;

    const savedTheme = localStorage.getItem("chuhaan-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "light") {
        enableLightTheme(archivePage, themeToggle);
    } else if (savedTheme === "dark") {
        enableDarkTheme(archivePage, themeToggle);
    } else if (!prefersDark) {
        enableLightTheme(archivePage, themeToggle);
    }

    themeToggle.addEventListener("click", () => {
        const isLight = archivePage.classList.contains("theme-light");
        if (isLight) {
            enableDarkTheme(archivePage, themeToggle);
        } else {
            enableLightTheme(archivePage, themeToggle);
        }
        localStorage.setItem("chuhaan-theme", isLight ? "dark" : "light");
    });
});


function enableLightTheme(container, button) {
    container.classList.add("theme-light");
    container.classList.remove("theme-dark");
    if (button) button.textContent = "☀";
}


function enableDarkTheme(container, button) {
    container.classList.remove("theme-light");
    container.classList.add("theme-dark");
    if (button) button.textContent = "☾";
}


/* =========================================================
   MUSIC PLAYER
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("🎵 Music Player: DOM loaded");

    const musicToggle = document.getElementById("musicToggle");
    const archivePage = document.querySelector(".archive-page");

    if (!musicToggle || !archivePage) {
        console.warn("Music Player: missing elements.");
        return;
    }

    const MUSIC_FOLDER = "assets/";

    const playlist = [
        { name: "🎵 Love story", file: "lovestory.mp3" },
        { name: "🎵 Haunted", file: "haunted.mp3" },
        { name: "🎵 Young and beautiful", file: "lana.mp3" },
        { name: "🎵 Yes to heaven", file: "heaven.mp3" },
        { name: "🎵 No one noticed", file: "noticed.mp3" },
        { name: "🎵 Back to friends", file: "backtofriends.mp3" },
        { name: "🎵 Attention", file: "attention.mp3" },
        { name: "🎵 We don't talk anymore", file: "charlie.mp3" },
        { name: "🎵 Criminial", file: "criminal.mp3" },
        { name: "🎵 I was never there", file: "tw.mp3" }
    ];

    let audio = null;
    let currentTrackIndex = 0;
    let isPlaying = false;

    // KIỂM TRA XEM ĐÃ CÓ AUDIO TỪ autoPlayMusic CHƯA
    if (window._musicAudio) {
        audio = window._musicAudio;
        currentTrackIndex = window._currentTrackIndex || 0;
        console.log("✅ Đã có audio từ autoPlayMusic");
    } else {
        // TẠO AUDIO MỚI
        console.log("🔄 Tạo audio mới trong Music Player");
        const filePath = MUSIC_FOLDER + playlist[0].file;
        audio = new Audio(filePath);
        audio.loop = true;
        audio.volume = 0.5;

        audio.addEventListener('error', () => {
            console.error("❌ LỖI TẢI NHẠC:", filePath);
        });

        audio.addEventListener('canplay', () => {
            console.log("✅ File nhạc sẵn sàng!");
        });

        window._musicAudio = audio;
        window._musicPlaylist = playlist;
        window._currentTrackIndex = 0;
    }

    // LƯU TRẠNG THÁI
    window._musicAudio = audio;
    window._musicPlaylist = playlist;

    // Khôi phục âm lượng
    const savedVolume = parseInt(localStorage.getItem("chuhaan-volume"));
    if (!isNaN(savedVolume) && savedVolume >= 0 && savedVolume <= 100) {
        audio.volume = savedVolume / 100;
    }

    // HÀM TẠO UI
    function createMusicPlayerUI() {
        const oldPlayer = document.getElementById("musicPlayerOverlay");
        if (oldPlayer) oldPlayer.remove();

        const overlay = document.createElement("div");
        overlay.id = "musicPlayerOverlay";
        overlay.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 30px;
            z-index: 9999;
            background: rgba(9, 8, 6, 0.94);
            border: 1px solid rgba(214, 169, 66, 0.45);
            border-radius: 20px;
            padding: 28px 30px 22px;
            width: 320px;
            backdrop-filter: blur(20px);
            box-shadow: 0 25px 70px rgba(0,0,0,0.7);
            transform: translateY(20px) scale(0.92);
            opacity: 0;
            visibility: hidden;
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            font-family: 'Be Vietnam Pro', sans-serif;
        `;

        overlay.innerHTML = `
            <button id="closeMusicPlayer" style="
                position: absolute;
                top: 12px;
                right: 16px;
                background: none;
                border: none;
                color: rgba(233, 210, 146, 0.4);
                font-size: 20px;
                cursor: pointer;
                padding: 4px 8px;
                line-height: 1;
            ">✕</button>

            <div style="display: flex; justify-content: center; margin-bottom: 20px;">
                <div id="vinylDisc" style="
                    width: 140px;
                    height: 140px;
                    border-radius: 50%;
                    background: radial-gradient(circle at 30% 30%, #333, #1a1a1a 60%, #0a0a0a);
                    box-shadow: 
                        0 0 0 4px rgba(214, 169, 66, 0.15),
                        0 0 0 8px rgba(214, 169, 66, 0.06),
                        inset 0 0 40px rgba(0,0,0,0.6);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                ">
                    <div style="
                        width: 50px;
                        height: 50px;
                        border-radius: 50%;
                        background: radial-gradient(circle at 40% 35%, #d4a54a, #8a6a2e);
                        box-shadow: inset 0 0 20px rgba(0,0,0,0.3);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        font-size: 9px;
                        color: rgba(255,215,140,0.6);
                        letter-spacing: 1px;
                        font-weight: 500;
                    ">
                        <span>♪</span>
                    </div>
                    <div style="position: absolute; width: 6px; height: 6px; border-radius: 50%; background: rgba(255,215,140,0.2);"></div>
                    <div style="position: absolute; width: 90%; height: 90%; border-radius: 50%; border: 1px solid rgba(214, 169, 66, 0.06);"></div>
                    <div style="position: absolute; width: 70%; height: 70%; border-radius: 50%; border: 1px solid rgba(214, 169, 66, 0.04);"></div>
                </div>
            </div>

            <div style="text-align: center; margin-bottom: 6px;">
                <div id="currentTrackName" style="color: #f0d68d; font-size: 16px; font-weight: 500; font-family: 'Cormorant Garamond', serif; letter-spacing: 1px;">
                    ${playlist[currentTrackIndex].name}
                </div>
                <div id="musicStatusText" style="color: rgba(233, 210, 146, 0.3); font-size: 9px; letter-spacing: 3px; margin-top: 2px; text-transform: uppercase;">
                    TẠM DỪNG
                </div>
            </div>

            <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin: 16px 0 14px;">
                <button id="prevTrackBtn" style="background: none; border: none; color: rgba(233, 210, 146, 0.5); font-size: 18px; cursor: pointer; padding: 6px 10px;">⏮</button>
                <button id="playPauseBtn" style="background: rgba(214, 169, 66, 0.12); border: 1px solid rgba(214, 169, 66, 0.5); border-radius: 50%; width: 56px; height: 56px; color: #f0d68d; font-size: 24px; cursor: pointer; display: flex; justify-content: center; align-items: center;">▶</button>
                <button id="nextTrackBtn" style="background: none; border: none; color: rgba(233, 210, 146, 0.5); font-size: 18px; cursor: pointer; padding: 6px 10px;">⏭</button>
            </div>

            <div style="margin-top: 4px;">
                <input type="range" id="volumeSlider" min="0" max="100" value="${Math.round(audio.volume * 100)}" style="width: 100%; accent-color: #d8b85e; background: rgba(214, 169, 66, 0.12); height: 3px; border-radius: 3px; cursor: pointer; outline: none;">
                <div style="display: flex; justify-content: space-between; color: rgba(233, 210, 146, 0.3); font-size: 8px; letter-spacing: 1px; margin-top: 4px; padding: 0 2px;">
                    <span>ÂM LƯỢNG</span>
                    <span id="volumeValue">${Math.round(audio.volume * 100)}%</span>
                </div>
            </div>

            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(214, 169, 66, 0.08); text-align: center; color: rgba(233, 210, 146, 0.2); font-size: 8px; letter-spacing: 2px;">
                <span id="trackCounter">${currentTrackIndex + 1} / ${playlist.length}</span>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById("closeMusicPlayer").addEventListener("click", closePlayer);
        document.getElementById("playPauseBtn").addEventListener("click", togglePlay);
        document.getElementById("prevTrackBtn").addEventListener("click", () => changeTrack(-1));
        document.getElementById("nextTrackBtn").addEventListener("click", () => changeTrack(1));

        document.getElementById("volumeSlider").addEventListener("input", (e) => {
            const val = parseInt(e.target.value);
            document.getElementById("volumeValue").textContent = val + "%";
            audio.volume = val / 100;
            localStorage.setItem("chuhaan-volume", String(val));
        });

        requestAnimationFrame(() => {
            overlay.style.visibility = "visible";
            overlay.style.opacity = "1";
            overlay.style.transform = "translateY(0) scale(1)";
        });

        updatePlayButton();
        updateDiscRotation();

        return overlay;
    }

    function closePlayer() {
        const overlay = document.getElementById("musicPlayerOverlay");
        if (overlay) {
            overlay.style.opacity = "0";
            overlay.style.transform = "translateY(20px) scale(0.92)";
            setTimeout(() => {
                overlay.style.visibility = "hidden";
            }, 400);
        }
    }

    function openPlayer() {
        let overlay = document.getElementById("musicPlayerOverlay");
        if (!overlay) {
            overlay = createMusicPlayerUI();
        } else {
            overlay.style.visibility = "visible";
            overlay.style.opacity = "1";
            overlay.style.transform = "translateY(0) scale(1)";
        }
        updatePlayButton();
        updateDiscRotation();
    }

    function changeTrack(direction) {
        const wasPlaying = isPlaying;
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }

        currentTrackIndex = (currentTrackIndex + direction + playlist.length) % playlist.length;
        window._currentTrackIndex = currentTrackIndex;

        const filePath = MUSIC_FOLDER + playlist[currentTrackIndex].file;
        const newAudio = new Audio(filePath);
        newAudio.loop = true;
        newAudio.volume = audio.volume;
        audio = newAudio;
        window._musicAudio = audio;

        if (wasPlaying) {
            audio.play().catch(() => {});
        }

        localStorage.setItem("chuhaan-track", String(currentTrackIndex));

        const trackName = document.getElementById("currentTrackName");
        if (trackName) trackName.textContent = playlist[currentTrackIndex].name;

        const counter = document.getElementById("trackCounter");
        if (counter) counter.textContent = `${currentTrackIndex + 1} / ${playlist.length}`;

        updatePlayButton();
        updateDiscRotation();
    }

    function togglePlay() {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            window._isMusicPlaying = false;
            localStorage.setItem("chuhaan-music", "paused");
        } else {
            audio.play()
                .then(() => {
                    console.log("✅ Phát nhạc thành công!");
                })
                .catch((err) => {
                    console.warn("⚠️ Không thể phát nhạc:", err);
                });
            isPlaying = true;
            window._isMusicPlaying = true;
            localStorage.setItem("chuhaan-music", "playing");
        }
        updatePlayButton();
        updateDiscRotation();
    }

    function updatePlayButton() {
        const btn = document.getElementById("playPauseBtn");
        if (btn) btn.textContent = isPlaying ? "⏸" : "▶";

        const status = document.getElementById("musicStatusText");
        if (status) status.textContent = isPlaying ? "ĐANG PHÁT" : "TẠM DỪNG";

        const musicToggleBtn = document.getElementById("musicToggle");
        if (musicToggleBtn) musicToggleBtn.textContent = isPlaying ? "♫" : "♪";
    }

    let discRotation = 0;
    let animationId = null;

    function updateDiscRotation() {
        const disc = document.getElementById("vinylDisc");
        if (!disc) return;

        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        if (isPlaying) {
            let lastTime = performance.now();
            let rotation = discRotation;

            function spinDisc(time) {
                const delta = time - lastTime;
                lastTime = time;
                rotation += (delta / 3000) * 360;
                disc.style.transform = `rotate(${rotation % 360}deg)`;
                discRotation = rotation;
                animationId = requestAnimationFrame(spinDisc);
            }

            animationId = requestAnimationFrame(spinDisc);
        } else {
            disc.style.transform = `rotate(${discRotation % 360}deg)`;
        }
    }

    // =====================================================
    // SỰ KIỆN CLICK ICON NHẠC
    // =====================================================
    musicToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const overlay = document.getElementById("musicPlayerOverlay");
        if (overlay && overlay.style.visibility === "visible" && overlay.style.opacity !== "0") {
            closePlayer();
        } else {
            openPlayer();
        }
    });

    // =====================================================
    // PHÍM ESC
    // =====================================================
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closePlayer();
        }
    });

    // =====================================================
    // KHỞI TẠO UI
    // =====================================================
    updatePlayButton();

    // =====================================================
    // DỌN DẸP
    // =====================================================
    window.addEventListener("beforeunload", () => {
        if (audio) {
            audio.pause();
            audio.src = "";
        }
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    });

    console.log("✅ Music Player đã sẵn sàng!");
});


/* =========================================================
   THEME LIGHT CSS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement("style");
    style.textContent = `
        .archive-page.theme-light {
            background: #f5efe6;
            color: #3d3528;
        }
        .archive-page.theme-light .archive-header {
            background: rgba(245, 239, 230, 0.92);
            border-bottom: 1px solid rgba(180, 150, 80, 0.25);
        }
        .archive-page.theme-light .archive-logo {
            color: #8a7a4e;
        }
        .archive-page.theme-light .archive-nav a,
        .archive-page.theme-light .archive-nav button {
            color: rgba(80, 70, 50, 0.7);
        }
        .archive-page.theme-light .archive-nav a:hover,
        .archive-page.theme-light .archive-nav button:hover {
            color: #6a5a3a;
        }
        .archive-page.theme-light .archive-nav button {
            border-color: rgba(180, 150, 80, 0.35);
        }
        .archive-page.theme-light .archive-hero h1 {
            color: #6a5a3a;
            text-shadow: 0 8px 30px rgba(0,0,0,0.08);
        }
        .archive-page.theme-light .archive-description {
            color: rgba(80, 70, 50, 0.6);
        }
        .archive-page.theme-light .search-box {
            background: rgba(255, 250, 240, 0.85);
            border-color: rgba(180, 150, 80, 0.35);
        }
        .archive-page.theme-light .search-box input {
            color: #3d3528;
        }
        .archive-page.theme-light .search-box input::placeholder {
            color: rgba(80, 70, 50, 0.4);
        }
        .archive-page.theme-light .tag {
            color: rgba(80, 70, 50, 0.6);
            border-color: rgba(180, 150, 80, 0.25);
            background: rgba(255, 250, 240, 0.5);
        }
        .archive-page.theme-light .tag:hover {
            color: #5a4a30;
        }
        .archive-page.theme-light .tag.active {
            color: #f5efe6;
            background: #8a7a4e;
            border-color: #8a7a4e;
        }
        .archive-page.theme-light .character-card {
            background: #fcf8f0;
            border-color: rgba(180, 150, 80, 0.25);
        }
        .archive-page.theme-light .character-card:hover {
            border-color: rgba(180, 150, 80, 0.6);
        }
        .archive-page.theme-light .character-info {
            background: transparent;
        }
        .archive-page.theme-light .character-number {
            color: rgba(180, 150, 80, 0.7);
        }
        .archive-page.theme-light .character-info h3 {
            color: #5a4a30;
        }
        .archive-page.theme-light .character-info h3::after {
            background: linear-gradient(90deg, #b89a5c, rgba(184, 154, 92, 0.12));
        }
        .archive-page.theme-light .character-quote {
            color: rgba(80, 70, 50, 0.8);
        }
        .archive-page.theme-light .character-quote::before {
            background: linear-gradient(to bottom, rgba(184, 154, 92, 0), rgba(184, 154, 92, 0.7) 25%, rgba(184, 154, 92, 0.35) 75%, rgba(184, 154, 92, 0));
        }
        .archive-page.theme-light .character-tags span {
            color: rgba(80, 70, 50, 0.7);
            border-color: rgba(180, 150, 80, 0.3);
            background: rgba(180, 150, 80, 0.06);
        }
        .archive-page.theme-light .character-tags span:hover {
            color: #5a4a30;
            border-color: rgba(180, 150, 80, 0.6);
            background: rgba(180, 150, 80, 0.12);
        }
        .archive-page.theme-light .character-button {
            color: #6a5a3a;
            border-color: rgba(180, 150, 80, 0.45);
            background: rgba(180, 150, 80, 0.06);
        }
        .archive-page.theme-light .character-button:hover {
            color: #4a3a28;
            border-color: rgba(180, 150, 80, 0.8);
            background: rgba(180, 150, 80, 0.12);
        }
        .archive-page.theme-light .section-heading h2 {
            color: #5a4a30;
        }
        .archive-page.theme-light .section-label {
            color: #8a7a4e;
        }
        .archive-page.theme-light .about-section {
            border-color: rgba(180, 150, 80, 0.2);
        }
        .archive-page.theme-light .about-text {
            color: rgba(80, 70, 50, 0.6);
        }
        .archive-page.theme-light .about-signature {
            color: rgba(180, 150, 80, 0.7);
        }
        .archive-page.theme-light .feature-card {
            background: rgba(255, 250, 240, 0.7);
            border-color: rgba(180, 150, 80, 0.25);
            color: #5a4a30;
        }
        .archive-page.theme-light .feature-card:hover {
            border-color: rgba(180, 150, 80, 0.5);
            background: rgba(255, 250, 240, 0.9);
        }
        .archive-page.theme-light .archive-footer {
            border-color: rgba(180, 150, 80, 0.2);
            color: rgba(80, 70, 50, 0.4);
        }
        .archive-page.theme-light .music-player-overlay {
            background: rgba(245, 239, 230, 0.95);
            border-color: rgba(180, 150, 80, 0.4);
        }
        .archive-page.theme-light .music-player-overlay #currentTrackName {
            color: #5a4a30;
        }
        .archive-page.theme-light .music-player-overlay #vinylDisc {
            background: radial-gradient(circle at 30% 30%, #ddd, #bbb 60%, #999) !important;
            box-shadow: 0 0 0 4px rgba(180, 150, 80, 0.15), 0 0 0 8px rgba(180, 150, 80, 0.06), inset 0 0 40px rgba(0,0,0,0.15) !important;
        }
        .archive-page.theme-light .music-player-overlay #vinylDisc > div:first-child {
            background: radial-gradient(circle at 40% 35%, #c9a85a, #8a7a4e) !important;
        }
        .archive-page.theme-light .character-card::before {
            background: linear-gradient(105deg, transparent 0%, rgba(200, 180, 140, 0.00) 35%, rgba(200, 180, 140, 0.06) 45%, rgba(200, 180, 140, 0.12) 50%, rgba(200, 180, 140, 0.06) 55%, rgba(200, 180, 140, 0.00) 65%, transparent 100%);
        }
    `;
    document.head.appendChild(style);
});

/* =========================================================
   STAR EFFECT — KÍCH HOẠT KHI VÀO ARCHIVE
========================================================= */

function activateStars() {
    const starContainer = document.getElementById("starContainer");
    if (!starContainer) return;

    // Đảm bảo stars hiển thị FULL MÀN HÌNH
    starContainer.style.display = "block";
    starContainer.style.opacity = "1";
    starContainer.style.position = "fixed";
    starContainer.style.top = "0";
    starContainer.style.left = "0";
    starContainer.style.width = "100vw";
    starContainer.style.height = "100vh";
    starContainer.style.overflow = "hidden";
    starContainer.style.pointerEvents = "none";
    starContainer.style.zIndex = "1";
    
    // Lấy tất cả stars và reset
    const stars = starContainer.querySelectorAll(".star");
    
    stars.forEach((star, index) => {
        // Reset animation bằng clone
        const newStar = star.cloneNode(true);
        star.parentNode.replaceChild(newStar, star);
        
        // Random tất cả thông số
        const delay = Math.random() * 5 + 0.1;
        const duration = 6 + Math.random() * 6;
        const left = Math.random() * 98 + 1;
        const size = 6 + Math.random() * 20;
        
        newStar.style.left = left + "%";
        newStar.style.top = "-30px";
        newStar.style.animationDuration = duration + "s";
        newStar.style.animationDelay = delay + "s";
        newStar.style.fontSize = size + "px";
        newStar.style.position = "absolute";
        
        // Màu vàng đa dạng
        const hue = 42 + Math.random() * 15;
        const sat = 85 + Math.random() * 15;
        const lig = 55 + Math.random() * 30;
        newStar.style.color = `hsl(${hue}, ${sat}%, ${lig}%)`;
        newStar.style.filter = `drop-shadow(0 0 ${6 + Math.random() * 15}px rgba(255, 215, 0, ${0.3 + Math.random() * 0.5}))`;
        
        // Random class đặc biệt
        newStar.classList.remove("big", "tiny", "fast");
        
        if (Math.random() > 0.85) {
            newStar.classList.add("big");
        } else if (Math.random() > 0.7) {
            newStar.classList.add("tiny");
        } else if (Math.random() > 0.6) {
            newStar.classList.add("fast");
        }
    });
    
    console.log("⭐ Hiệu ứng sao vàng đã kích hoạt!");
};

/* =========================================================
   LITTLE FEATURES — BẢN HOÀN CHỈNH (POPUP + FULL TÍNH NĂNG)
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("🔥 Little Features: Đang khởi tạo...");

    // =====================================================
    // 1. TẠO MODAL VỚI CSS BUILT-IN
    // =====================================================
    const modal = document.createElement("div");
    modal.className = "feature-modal";
    modal.id = "featureModal";
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 99999;
        background: rgba(5, 5, 3, 0.85);
        backdrop-filter: blur(12px);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.4s ease;
        padding: 20px;
    `;
    modal.innerHTML = `
        <div class="feature-modal-content" style="
            max-width: 650px;
            width: 100%;
            max-height: 85vh;
            overflow-y: auto;
            background: linear-gradient(145deg, rgba(31, 26, 16, 0.98), rgba(13, 12, 9, 0.99));
            border: 1px solid rgba(214, 169, 66, 0.3);
            border-radius: 20px;
            padding: 35px 40px 40px;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7);
            transform: scale(0.92) translateY(20px);
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            position: relative;
        ">
            <button class="feature-modal-close" id="featureModalClose" style="
                position: absolute;
                top: 12px;
                right: 16px;
                background: none;
                border: none;
                color: rgba(233, 210, 146, 0.4);
                font-size: 22px;
                cursor: pointer;
                transition: color 0.3s ease;
                padding: 4px 8px;
            ">✕</button>
            <span class="feature-modal-icon" id="featureModalIcon" style="
                font-size: 40px;
                text-align: center;
                display: block;
                margin-bottom: 10px;
            ">🎴</span>
            <h2 class="feature-modal-title" id="featureModalTitle" style="
                font-family: 'Cormorant Garamond', serif;
                font-size: 28px;
                color: #f0d68d;
                text-align: center;
                margin-bottom: 6px;
            ">RANDOM HUSBAND</h2>
            <div class="feature-modal-body" id="featureModalBody" style="
                color: rgba(233, 210, 146, 0.8);
                font-size: 14px;
                line-height: 1.8;
                text-align: center;
            ">
                <!-- Nội dung -->
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // CSS cho trạng thái mở
    const style = document.createElement("style");
    style.textContent = `
        .feature-modal.open {
            opacity: 1 !important;
            visibility: visible !important;
        }
        .feature-modal.open .feature-modal-content {
            transform: scale(1) translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // =====================================================
    // 2. ĐIỀU KHIỂN MODAL
    // =====================================================
    const modalOverlay = document.getElementById("featureModal");
    const closeBtn = document.getElementById("featureModalClose");

    function openModal() {
        modalOverlay.classList.add("open");
        console.log("🔥 Modal mở!");
    }

    function closeModal() {
        modalOverlay.classList.remove("open");
        console.log("🔥 Modal đóng!");
    }

    closeBtn.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });

    function showModal(icon, title, bodyHTML) {
        document.getElementById("featureModalIcon").textContent = icon;
        document.getElementById("featureModalTitle").textContent = title;
        document.getElementById("featureModalBody").innerHTML = bodyHTML;
        openModal();
    }

    // =====================================================
    // 3. DỮ LIỆU CHUNG
    // =====================================================
// =====================================================
// DANH SÁCH CHỒNG (DÙNG CHUNG) — VỚI LINK CHAT CHÍNH XÁC
// =====================================================
const HUSBANDS = [
    { 
        name: "Tần Kiêu Dật", 
        emoji: "🖤", 
        tags: ["Mafia", "Red Flag", "Chiếm hữu", "Bạo lực"],
        job: "Mafia",
        plot: "Một đỉnh cấp tên côn đồ lại là chú út của tôi!?",
        appearance: "assets/tankieudat.png.jpg",
        link: "https://aistudio.google.com/app/prompts?state=%7B%22ids%22%3A%5B%2215yBz4Fepfe0mE2nVk57NnMx95Y1e8H4i%22%5D%2C%22action%22%3A%22open%22%2C%22userId%22%3A%22107431188875400233718%22%2C%22resourceKeys%22%3A%7B%7D%7D&usp=drive_link"
    },
    { 
        name: "Akashi Takeru", 
        emoji: "👑", 
        tags: ["Trường học", "Bị tẩy chay", "Anh hùng"],
        job: "Học sinh trường tư thục",
        plot: "Làm anh hùng cứu mỹ nhân và bị cả trường tẩy chay",
        appearance: "assets/takeru.png.jpg",
        link: "https://aistudio.google.com/app/prompts?state=%7B%22ids%22%3A%5B%221daPtc73XefhWKcpQHvrf6a1Exu0_LgqY%22%5D%2C%22action%22%3A%22open%22%2C%22userId%22%3A%22107431188875400233718%22%2C%22resourceKeys%22%3A%7B%7D%7D&usp=drive_link"
    },
    { 
        name: "Lăng Triệt", 
        emoji: "🐶", 
        tags: ["F1", "Idol", "Tứ Đại Khốn Nạn"],
        job: "Tay đua F1",
        plot: "Tôi bị nam thần lấy ra làm trò cược.",
        appearance: "assets/triet.png.jpg",
        link: "https://aistudio.google.com/app/prompts?state=%7B%22ids%22%3A%5B%221MJsAvOet4ZvKmx-naiNYBU15NueKFazR%22%5D%2C%22action%22%3A%22open%22%2C%22userId%22%3A%22107431188875400233718%22%2C%22resourceKeys%22%3A%7B%7D%7D&usp=drive_link"
    },
    { 
        name: "Chu Hoàng An", 
        emoji: "🐭", 
        tags: ["Luật sư", "Âm nhạc", "Green Flag"],
        job: "Sinh viên ngành Luật",
        plot: "Nếu cuộc đời này không rực rỡ thì? Tôi không biết! Vì tôi là chuột mà!",
        appearance: "assets/an.png.jpg",
        link: "https://aistudio.google.com/app/prompts?state=%7B%22ids%22%3A%5B%221HwpMfqmmTxzgFT9GIIxCPpk4AbIb9uoN%22%5D%2C%22action%22%3A%22open%22%2C%22userId%22%3A%22107431188875400233718%22%2C%22resourceKeys%22%3A%7B%7D%7D&usp=drive_link"
    },
    { 
        name: "Hứa Diệc Tẫn", 
        emoji: "💔", 
        tags: ["Trường học", "Yêu đơn phương", "Hiểu lầm", "Truy thê"],
        job: "Học sinh cấp ba",
        plot: "Người thích tôi lại nhầm lẫn tôi với người khác",
        appearance: "assets/tan.png.jpg",
        link: "https://aistudio.google.com/app/prompts?state=%7B%22ids%22%3A%5B%2215QM-MtqITFgLgbw0uW3D_cvw6F0SlzT2%22%5D%2C%22action%22%3A%22open%22%2C%22userId%22%3A%22107431188875400233718%22%2C%22resourceKeys%22%3A%7B%7D%7D&usp=drive_link"
    },
    { 
        name: "Medico Ravenscroft", 
        emoji: "🩸", 
        tags: ["Quái vật", "Bác sĩ", "Size gap"],
        job: "Bác sĩ dịch hạch",
        plot: "Vô tình cứu quái vật rồi bị ép làm vợ",
        appearance: "assets/medico.png.jpg",
        link: "https://aistudio.google.com/app/prompts?state=%7B%22ids%22%3A%5B%221VvWEw6pxX2j9wnGLgweC739HMn67Lffd%22%5D%2C%22action%22%3A%22open%22%2C%22userId%22%3A%22107431188875400233718%22%2C%22resourceKeys%22%3A%7B%7D%7D&usp=drive_link"
    },
    { 
        name: "Rostislav Arsenyevich Morozov", 
        emoji: "❄️", 
        tags: ["Mafia", "Age Gap",  "Mama", "Size Gap"],
        job: "Mafia",
        plot: "Tôi gọi gã Mafia Nga là 'Mama' !",
        appearance: "assets/rostislav.png.jpg",
        link: "https://aistudio.google.com/app/prompts?state=%7B%22ids%22%3A%5B%221izDSVwGcvWLQKcUl4PF9lplnKf8ycV46%22%5D%2C%22action%22%3A%22open%22%2C%22userId%22%3A%22107431188875400233718%22%2C%22resourceKeys%22%3A%7B%7D%7D&usp=drive_link"
    },
    { 
        name: "Baek Do-Hyun", 
        emoji: "🧛", 
        tags: ["Ma cà rồng", "Từ kẻ thù thành người yêu"],
        job: "Đa cấp",
        plot: "Tên ma cà rồng này là một tên chó điên!",
        appearance: "assets/hyun.png.jpg",
        link: "https://aistudio.google.com/app/prompts?state=%7B%22ids%22%3A%5B%221Knp_e7Nme19Q-ptyPbEQNJJUg4nmWBiq%22%5D%2C%22action%22%3A%22open%22%2C%22userId%22%3A%22107431188875400233718%22%2C%22resourceKeys%22%3A%7B%7D%7D&usp=drive_link"
    },
    { 
        name: "Vũ Thanh Phong", 
        emoji: "🌙", 
        tags: ["Yêu đơn phương", "Ngược", "trường học"],
        job: "Sinh viên đại học",
        plot: "Thanh mai trúc mã trở về hóa ra là người yêu của crush tôi",
        appearance: "assets/phong.png.jpg",
        link: "https://aistudio.google.com/app/prompts?state=%7B%22ids%22%3A%5B%221YW8K0x_NPrVC_TG5bP6_tYaVXvUAp6Lz%22%5D%2C%22action%22%3A%22open%22%2C%22userId%22%3A%22107431188875400233718%22%2C%22resourceKeys%22%3A%7B%7D%7D&usp=drive_link"
    },
    { 
        name: "Tsuchigumo Ren", 
        emoji: "🕷️", 
        tags: ["Yokai", "Quái vật", "Chiếm hữu"],
        job: "Yokai cổ đại",
        plot: "Yokai cổ đại lại muốn cưới tôi làm vợ?",
        appearance: "assets/ren.png.jpg",
        link: "https://aistudio.google.com/app/prompts?state=%7B%22ids%22%3A%5B%221qjOSZsoDTDwEiWXhsWSeFdAbwu12t1Ix%22%5D%2C%22action%22%3A%22open%22%2C%22userId%22%3A%22107431188875400233718%22%2C%22resourceKeys%22%3A%7B%7D%7D&usp=drive_link"
    },
    { 
        name: "Kỷ Hàn Vũ", 
        emoji: "🎬", 
        tags: ["Ảnh đế", "Diễn viên", "Lạnh lùng"],
        job: "Diễn viên nổi tiếng",
        plot: "Vị tiền bối khó tính hóa ra là chủ anti group của tôi!?",
        appearance: "assets/vu.png.jpg",
        link: "https://aistudio.google.com/app/prompts?state=%7B%22ids%22%3A%5B%2210h_I6XO8nw974rPhQFYpt2Mx-cB8KFMB%22%5D%2C%22action%22%3A%22open%22%2C%22userId%22%3A%22107431188875400233718%22%2C%22resourceKeys%22%3A%7B%7D%7D&usp=drive_link"
    },
    { 
        name: "Lục Dương", 
        emoji: "🌆", 
        tags: ["Hong Kong", "Tâm cơ", "Mập mờ"],
        job: "Giang hồ chợ búa qua mắt hồng trần",
        plot: "Mập mờ với thư ký của 'chồng tôi'",
        appearance: "assets/duong.png.jpg",
        link: "https://aistudio.google.com/app/prompts?state=%7B%22ids%22%3A%5B%221i315KEuy0pLe_Go4kC_UwRM9dM_07s7h%22%5D%2C%22action%22%3A%22open%22%2C%22userId%22%3A%22107431188875400233718%22%2C%22resourceKeys%22%3A%7B%7D%7D&usp=drive_link"
    },
    { 
        name: "Tawan Borommakotkosol", 
        emoji: "🎭", 
        tags: ["Thái Lan", "Tsundere", "Giả trai", "Trường học"],
        job: "Học sinh trường nam sinh",
        plot: "Khi cuộc đời cho bạn tóc giả",
        appearance: "assets/win.png.jpg",
        link: "https://aistudio.google.com/app/prompts?state=%7B%22ids%22%3A%5B%221tWiJ-6nbV_D6Ugg67_k33vMN3UAtYa7w%22%5D%2C%22action%22%3A%22open%22%2C%22userId%22%3A%22107431188875400233718%22%2C%22resourceKeys%22%3A%7B%7D%7D&usp=drive_link"
    },
    { 
        name: "Bách Noãn Thiên", 
        emoji: "🦊", 
        tags: ["Tu tiên", "Hồ ly", "Sư tôn"],
        job: "Tiểu đồ đệ của sư tôn",
        plot: "Xuyên không làm sư tôn của tiểu hồ ly tâm cơ hay rù quyến tôi",
        appearance: "assets/thien.png.jpg",
        link: "https://aistudio.google.com/app/prompts?state=%7B%22ids%22%3A%5B%221Ks8RqoEn6AwOETu_jkUGEeBxkc2le9Yw%22%5D%2C%22action%22%3A%22open%22%2C%22userId%22%3A%22107431188875400233718%22%2C%22resourceKeys%22%3A%7B%7D%7D&usp=drive_link"
    },
    { 
        name: "Dietrich Adler", 
        emoji: "🎖️", 
        tags: ["Quân nhân", "Gián điệp", "Ngược"],
        job: "Đại tá quân đội Đức",
        plot: "Quân nhân và gián điệp, tương lai sẽ ra sao?",
        appearance: "assets/dietrich.png.jpg",
        link: "https://aistudio.google.com/app/prompts?state=%7B%22ids%22%3A%5B%221o1eFj633KMIxRSlaQL4z0r0zhEa-6ZK9%22%5D%2C%22action%22%3A%22open%22%2C%22userId%22%3A%22107431188875400233718%22%2C%22resourceKeys%22%3A%7B%7D%7D&usp=drive_link"
    },
    { 
        name: "Lục Kỳ", 
        emoji: "🐺", 
        tags: ["F1", "Tsundere", "Green Flag"],
        job: "Tay đua F1",
        plot: "Tứ Đại Khốn Nạn hay là Tam Đại Khốn Nạn?",
        appearance: "assets/ky.png.jpg",
        link: "https://aistudio.google.com/app/prompts?state=%7B%22ids%22%3A%5B%221M-d498KIUP0zyrr_vdH5BOwa04bPkmJe%22%5D%2C%22action%22%3A%22open%22%2C%22userId%22%3A%22107431188875400233718%22%2C%22resourceKeys%22%3A%7B%7D%7D&usp=drive_link"
    },
    { 
        name: "Nakata Nagi", 
        emoji: "🎻", 
        tags: ["Âm nhạc", "Trường học", "Chữa lành", "Yêu đơn phương"],
        job: "Sinh viên nhạc viện",
        plot: "Một lần vô tình, một đời rung động",
        appearance: "assets/nagi.png.jpg",
        link: "https://docs.google.com/document/d/1Ulmd0zcCJO8uj2any6ARBOpW-VCrkiaRg2FbgXIcuas/edit?usp=sharing"
    }
];

// =====================================================
// 4. FEATURE 1: RANDOM HUSBAND
// =====================================================
window.handleRandomHusband = function() {
    const random = HUSBANDS[Math.floor(Math.random() * HUSBANDS.length)];
    showModal("🎴", "RANDOM HUSBAND", `
        <div style="text-align: center;">
            <div style="font-size: 48px; margin: 10px 0;">${random.emoji}</div>
            <div style="font-size: 28px; font-family: 'Cormorant Garamond', serif; color: #f0d68d; margin: 5px 0;">${random.name}</div>
            <div style="font-size: 14px; color: rgba(233, 210, 146, 0.6); margin: 8px 0;">${random.job}</div>
            <div style="font-size: 14px; color: rgba(233, 210, 146, 0.5); margin: 5px 0; font-style: italic; padding: 10px; background: rgba(214, 169, 66, 0.05); border-radius: 8px;">"${random.plot}"</div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin: 12px 0;">
                ${random.tags.map(tag => `<span style="padding: 4px 12px; border: 1px solid rgba(214, 169, 66, 0.3); border-radius: 12px; font-size: 10px; color: rgba(233, 210, 146, 0.6); letter-spacing: 1px;">#${tag}</span>`).join('')}
            </div>
            <p style="color: rgba(233, 210, 146, 0.4); font-size: 12px; margin-top: 10px;">✦ Chúc mừng! Hôm nay anh ấy là của bạn ✦</p>
            <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center;">
                <button onclick="window.open('${random.link}', '_blank')" style="
                    padding: 10px 30px; 
                    background: rgba(214, 169, 66, 0.15); 
                    border: 1px solid rgba(214, 169, 66, 0.4); 
                    border-radius: 8px; 
                    color: #f0d68d; 
                    font-family: 'Be Vietnam Pro', sans-serif; 
                    font-size: 11px; 
                    letter-spacing: 2px; 
                    cursor: pointer; 
                    transition: all 0.3s ease;
                ">💬 CHAT NGAY</button>
                <button onclick="window.handleRandomHusband()" style="
                    padding: 10px 25px; 
                    background: rgba(214, 169, 66, 0.05); 
                    border: 1px solid rgba(214, 169, 66, 0.2); 
                    border-radius: 8px; 
                    color: rgba(233, 210, 146, 0.6); 
                    font-family: 'Be Vietnam Pro', sans-serif; 
                    font-size: 11px; 
                    letter-spacing: 2px; 
                    cursor: pointer; 
                    transition: all 0.3s ease;
                ">🎴 BỐC LẠI</button>
            </div>
        </div>
    `);
};

// =====================================================
// 5. FEATURE 2: GUESS THE HUSBAND — BẢN HOÀN CHỈNH
// =====================================================

let guessState = {
    score: 0,
    total: 0,
    currentType: null,
    answered: false,
    currentCorrect: null
};

// HÀM SO KHỚP TÊN LINH HOẠT
function isNameMatch(input, correctName) {
    // Chuẩn hóa: bỏ dấu, viết thường, bỏ khoảng trắng thừa
    const normalize = (str) => {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };
    
    const normInput = normalize(input);
    const normCorrect = normalize(correctName);
    
    // 1. So sánh chính xác
    if (normInput === normCorrect) return true;
    
    // 2. Kiểm tra input có chứa toàn bộ từ khóa của tên (ví dụ: "dietrich" → "Dietrich Adler")
    const inputWords = normInput.split(' ');
    const correctWords = normCorrect.split(' ');
    
    // Nếu input chỉ có 1 từ, kiểm tra từ đó có xuất hiện trong tên đúng không
    if (inputWords.length === 1) {
        return correctWords.some(word => word.includes(inputWords[0])) ||
               inputWords[0].includes(correctWords[0]);
    }
    
    // Nếu input có nhiều từ, kiểm tra tất cả từ có xuất hiện trong tên đúng không
    return inputWords.every(word => 
        correctWords.some(cw => cw.includes(word))
    );
}

// =====================================================
// HÀM CHÍNH
// =====================================================
window.handleGuessHusband = function() {
    guessState.answered = false;
    
    const types = ['fill_name', 'quiz_4', 'blurred_image', 'cropped_image', 'quote_guess', 'true_false'];
    const type = types[Math.floor(Math.random() * types.length)];
    guessState.currentType = type;
    
    let bodyHTML = '';
    
    switch(type) {
        case 'fill_name':
            bodyHTML = generateFillNameQuestion();
            break;
        case 'quiz_4':
            bodyHTML = generateQuiz4Question();
            break;
        case 'blurred_image':
            bodyHTML = generateBlurredImageQuestion();
            break;
        case 'cropped_image':
            bodyHTML = generateCroppedImageQuestion();
            break;
        case 'quote_guess':
            bodyHTML = generateQuoteGuessQuestion();
            break;
        case 'true_false':
            bodyHTML = generateTrueFalseQuestion();
            break;
        default:
            bodyHTML = generateFillNameQuestion();
    }
    
    showModal("🔍", "🎯 GUESS THE HUSBAND", bodyHTML);
};

// =====================================================
// 1. ĐIỀN TÊN
// =====================================================
function generateFillNameQuestion() {
    const random = HUSBANDS[Math.floor(Math.random() * HUSBANDS.length)];
    guessState.currentCorrect = random.name;
    
    const maskedName = random.name.split('').map((char, i) => {
        if (i === 0 || i === random.name.length - 1) return char;
        return '•';
    }).join('');
    
    const firstLetter = random.name.charAt(0).toUpperCase();
    const jobHint = random.job.split(' ')[0];
    
    return `
        <div style="text-align: center;">
            <div style="font-size: 13px; color: rgba(233, 210, 146, 0.2); letter-spacing: 2px; margin-bottom: 5px;">
                📝 THỂ LOẠI: ĐIỀN TÊN
            </div>
            <div style="font-size: 48px; margin: 10px 0;">${random.emoji}</div>
            <div style="font-size: 22px; font-family: 'Cormorant Garamond', serif; color: rgba(233, 210, 146, 0.6); margin: 5px 0; letter-spacing: 8px;">
                ${maskedName}
            </div>
            <div style="font-size: 13px; color: rgba(233, 210, 146, 0.3); margin: 10px 0; padding: 10px; background: rgba(214, 169, 66, 0.05); border-radius: 8px;">
                🔍 Gợi ý: <span style="color: #f0d68d;">${firstLetter}...</span> • ${jobHint}...
            </div>
            <div style="margin-top: 15px;">
                <input type="text" id="guessInput" placeholder="Nhập tên chồng..." style="
                    width: 80%; 
                    padding: 12px 18px; 
                    background: rgba(20, 17, 11, 0.8); 
                    border: 1px solid rgba(214, 169, 66, 0.3); 
                    border-radius: 8px; 
                    color: #f0d68d; 
                    font-family: 'Be Vietnam Pro', sans-serif; 
                    font-size: 14px; 
                    text-align: center; 
                    outline: none;
                ">
                <div style="margin-top: 12px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="checkGuessAnswer('${random.name}')" style="
                        padding: 10px 30px; 
                        background: rgba(214, 169, 66, 0.15); 
                        border: 1px solid rgba(214, 169, 66, 0.4); 
                        border-radius: 8px; 
                        color: #f0d68d; 
                        font-family: 'Be Vietnam Pro', sans-serif; 
                        font-size: 11px; 
                        letter-spacing: 2px; 
                        cursor: pointer;
                    ">📝 KIỂM TRA</button>
                    <button onclick="window.handleGuessHusband()" style="
                        padding: 10px 25px; 
                        background: rgba(214, 169, 66, 0.15); 
                        border: 1px solid rgba(214, 169, 66, 0.4); 
                        border-radius: 8px; 
                        color: #f0d68d; 
                        font-family: 'Be Vietnam Pro', sans-serif; 
                        font-size: 11px; 
                        letter-spacing: 2px; 
                        cursor: pointer;
                    ">⏩ TIẾP THEO</button>
                </div>
                <div id="guessResult" style="margin-top: 15px; font-size: 16px; min-height: 30px;"></div>
            </div>
        </div>
    `;
}

// =====================================================
// 2. TRẮC NGHIỆM 4 ĐÁP ÁN
// =====================================================
function generateQuiz4Question() {
    const correct = HUSBANDS[Math.floor(Math.random() * HUSBANDS.length)];
    guessState.currentCorrect = correct.name;
    
    let wrongs = [];
    let attempts = 0;
    while (wrongs.length < 3 && attempts < 100) {
        attempts++;
        const random = HUSBANDS[Math.floor(Math.random() * HUSBANDS.length)];
        if (random.name !== correct.name && !wrongs.find(w => w.name === random.name)) {
            wrongs.push(random);
        }
    }
    
    let options = [
        { name: correct.name, isCorrect: true },
        ...wrongs.map(w => ({ name: w.name, isCorrect: false }))
    ];
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    const hint = correct.emoji + ' • ' + correct.tags[0];
    
    return `
        <div style="text-align: center;">
            <div style="font-size: 13px; color: rgba(233, 210, 146, 0.2); letter-spacing: 2px; margin-bottom: 5px;">
                📝 THỂ LOẠI: TRẮC NGHIỆM 4 ĐÁP ÁN
            </div>
            <div style="font-size: 14px; color: rgba(233, 210, 146, 0.3); margin: 8px 0;">
                🔍 Gợi ý: ${hint}
            </div>
            <div style="font-size: 17px; color: #f0d68d; margin: 10px 0; line-height: 1.6; padding: 15px; background: rgba(214, 169, 66, 0.05); border-radius: 10px;">
                Ai là người phù hợp với gợi ý trên?
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px; align-items: center; margin-top: 12px;">
                ${options.map((opt, idx) => `
                    <button onclick="checkQuizGuess(${idx}, ${options.findIndex(o => o.isCorrect)})" 
                            class="guess-option" 
                            data-index="${idx}"
                            style="
                                padding: 10px 20px; 
                                width: 85%; 
                                background: rgba(214, 169, 66, 0.05); 
                                border: 1px solid rgba(214, 169, 66, 0.2); 
                                border-radius: 8px; 
                                color: rgba(233, 210, 146, 0.8); 
                                font-family: 'Be Vietnam Pro', sans-serif; 
                                font-size: 14px; 
                                cursor: pointer;
                                transition: all 0.3s ease;
                                text-align: left;
                            "
                            onmouseover="this.style.background='rgba(214, 169, 66, 0.12)'"
                            onmouseout="this.style.background='rgba(214, 169, 66, 0.05)'"
                    >${String.fromCharCode(65 + idx)}. ${opt.name}</button>
                `).join('')}
            </div>
            <div style="margin-top: 12px; display: flex; gap: 10px; justify-content: center;">
                <button onclick="window.handleGuessHusband()" style="
                    padding: 10px 25px; 
                    background: rgba(214, 169, 66, 0.15); 
                    border: 1px solid rgba(214, 169, 66, 0.4); 
                    border-radius: 8px; 
                    color: #f0d68d; 
                    font-family: 'Be Vietnam Pro', sans-serif; 
                    font-size: 11px; 
                    letter-spacing: 2px; 
                    cursor: pointer;
                ">⏩ TIẾP THEO</button>
            </div>
            <div id="guessResult" style="margin-top: 10px; font-size: 16px; min-height: 30px;"></div>
        </div>
    `;
}

// =====================================================
// 3. HÌNH ẢNH BỊ LÀM MỜ
// =====================================================
function generateBlurredImageQuestion() {
    const random = HUSBANDS[Math.floor(Math.random() * HUSBANDS.length)];
    guessState.currentCorrect = random.name;
    
    const imagePath = random.appearance || 'assets/default.png';
    const firstLetter = random.name.charAt(0).toUpperCase();
    
    return `
        <div style="text-align: center;">
            <div style="font-size: 13px; color: rgba(233, 210, 146, 0.2); letter-spacing: 2px; margin-bottom: 5px;">
                📝 THỂ LOẠI: HÌNH ẢNH MỜ
            </div>
            <div style="width: 180px; height: 180px; margin: 10px auto; border-radius: 12px; overflow: hidden; border: 2px solid rgba(214, 169, 66, 0.2); background: rgba(20,17,11,0.5);">
                <img src="${imagePath}" alt="Hình mờ" style="
                    width: 100%; 
                    height: 100%; 
                    object-fit: cover; 
                    filter: blur(12px) brightness(0.5);
                    transition: filter 0.8s ease;
                " id="blurredImage">
            </div>
            <div style="font-size: 12px; color: rgba(233, 210, 146, 0.15); margin-bottom: 8px;">
                🔍 Đây là ai? (Hình ảnh đã bị làm mờ)
            </div>
            <div style="font-size: 13px; color: rgba(233, 210, 146, 0.3); padding: 8px; background: rgba(214, 169, 66, 0.05); border-radius: 8px;">
                💡 Tên bắt đầu bằng chữ <span style="color: #f0d68d;">${firstLetter}</span>
            </div>
            <div style="margin-top: 12px;">
                <input type="text" id="guessInput" placeholder="Nhập tên chồng..." style="
                    width: 80%; 
                    padding: 12px 18px; 
                    background: rgba(20, 17, 11, 0.8); 
                    border: 1px solid rgba(214, 169, 66, 0.3); 
                    border-radius: 8px; 
                    color: #f0d68d; 
                    font-family: 'Be Vietnam Pro', sans-serif; 
                    font-size: 14px; 
                    text-align: center; 
                    outline: none;
                ">
                <div style="margin-top: 10px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="checkGuessAnswerWithImage('${random.name}')" style="
                        padding: 10px 30px; 
                        background: rgba(214, 169, 66, 0.15); 
                        border: 1px solid rgba(214, 169, 66, 0.4); 
                        border-radius: 8px; 
                        color: #f0d68d; 
                        font-family: 'Be Vietnam Pro', sans-serif; 
                        font-size: 11px; 
                        letter-spacing: 2px; 
                        cursor: pointer;
                    ">📝 KIỂM TRA</button>
                    <button onclick="window.handleGuessHusband()" style="
                        padding: 10px 25px; 
                        background: rgba(214, 169, 66, 0.15); 
                        border: 1px solid rgba(214, 169, 66, 0.4); 
                        border-radius: 8px; 
                        color: #f0d68d; 
                        font-family: 'Be Vietnam Pro', sans-serif; 
                        font-size: 11px; 
                        letter-spacing: 2px; 
                        cursor: pointer;
                    ">⏩ TIẾP THEO</button>
                </div>
                <div id="guessResult" style="margin-top: 12px; font-size: 16px; min-height: 30px;"></div>
            </div>
        </div>
    `;
}

// =====================================================
// 4. HÌNH ẢNH CẮT GÓC
// =====================================================
function generateCroppedImageQuestion() {
    const random = HUSBANDS[Math.floor(Math.random() * HUSBANDS.length)];
    guessState.currentCorrect = random.name;
    
    const imagePath = random.appearance || 'assets/default.png';
    const firstLetter = random.name.charAt(0).toUpperCase();
    
    const cropPositions = [
        'clip-path: inset(0 55% 55% 0);',
        'clip-path: inset(55% 0 0 55%);',
        'clip-path: inset(20% 20% 50% 50%);',
        'clip-path: inset(0 0 60% 60%);',
        'clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);',
        'clip-path: circle(35% at 25% 30%);',
        'clip-path: circle(35% at 75% 70%);',
        'clip-path: inset(30% 30% 30% 30%);'
    ];
    const randomCrop = cropPositions[Math.floor(Math.random() * cropPositions.length)];
    
    return `
        <div style="text-align: center;">
            <div style="font-size: 13px; color: rgba(233, 210, 146, 0.2); letter-spacing: 2px; margin-bottom: 5px;">
                📝 THỂ LOẠI: NHÌN GÓC NHỎ
            </div>
            <div style="width: 180px; height: 180px; margin: 10px auto; border-radius: 12px; overflow: hidden; border: 2px solid rgba(214, 169, 66, 0.2); background: rgba(20,17,11,0.5);">
                <img src="${imagePath}" alt="Ảnh cắt góc" style="
                    width: 100%; 
                    height: 100%; 
                    object-fit: cover; 
                    ${randomCrop}
                    transition: clip-path 0.8s ease;
                " id="croppedImage">
            </div>
            <div style="font-size: 12px; color: rgba(233, 210, 146, 0.15); margin-bottom: 8px;">
                🔍 Chỉ thấy một góc nhỏ... Đoán xem ai đây?
            </div>
            <div style="font-size: 13px; color: rgba(233, 210, 146, 0.3); padding: 8px; background: rgba(214, 169, 66, 0.05); border-radius: 8px;">
                💡 Tên bắt đầu bằng chữ <span style="color: #f0d68d;">${firstLetter}</span>
            </div>
            <div style="margin-top: 12px;">
                <input type="text" id="guessInput" placeholder="Nhập tên chồng..." style="
                    width: 80%; 
                    padding: 12px 18px; 
                    background: rgba(20, 17, 11, 0.8); 
                    border: 1px solid rgba(214, 169, 66, 0.3); 
                    border-radius: 8px; 
                    color: #f0d68d; 
                    font-family: 'Be Vietnam Pro', sans-serif; 
                    font-size: 14px; 
                    text-align: center; 
                    outline: none;
                ">
                <div style="margin-top: 10px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="checkGuessAnswerWithImage('${random.name}')" style="
                        padding: 10px 30px; 
                        background: rgba(214, 169, 66, 0.15); 
                        border: 1px solid rgba(214, 169, 66, 0.4); 
                        border-radius: 8px; 
                        color: #f0d68d; 
                        font-family: 'Be Vietnam Pro', sans-serif; 
                        font-size: 11px; 
                        letter-spacing: 2px; 
                        cursor: pointer;
                    ">📝 KIỂM TRA</button>
                    <button onclick="window.handleGuessHusband()" style="
                        padding: 10px 25px; 
                        background: rgba(214, 169, 66, 0.15); 
                        border: 1px solid rgba(214, 169, 66, 0.4); 
                        border-radius: 8px; 
                        color: #f0d68d; 
                        font-family: 'Be Vietnam Pro', sans-serif; 
                        font-size: 11px; 
                        letter-spacing: 2px; 
                        cursor: pointer;
                    ">⏩ TIẾP THEO</button>
                </div>
                <div id="guessResult" style="margin-top: 12px; font-size: 16px; min-height: 30px;"></div>
            </div>
        </div>
    `;
}

// =====================================================
// 5. ĐOÁN QUA CÂU NÓI
// =====================================================
function generateQuoteGuessQuestion() {
    const random = HUSBANDS[Math.floor(Math.random() * HUSBANDS.length)];
    guessState.currentCorrect = random.name;
    
    const firstLetter = random.name.charAt(0).toUpperCase();
    const lastLetter = random.name.charAt(random.name.length - 1).toUpperCase();
    
    return `
        <div style="text-align: center;">
            <div style="font-size: 13px; color: rgba(233, 210, 146, 0.2); letter-spacing: 2px; margin-bottom: 5px;">
                📝 THỂ LOẠI: ĐOÁN QUA CÂU NÓI
            </div>
            <div style="font-size: 18px; color: #f0d68d; margin: 10px 0; line-height: 1.8; padding: 20px; background: rgba(214, 169, 66, 0.05); border-radius: 12px; border-left: 3px solid rgba(214, 169, 66, 0.3); font-style: italic;">
                "${random.plot}"
            </div>
            <div style="font-size: 13px; color: rgba(233, 210, 146, 0.3); padding: 8px; background: rgba(214, 169, 66, 0.05); border-radius: 8px;">
                💡 Tên bắt đầu bằng <span style="color: #f0d68d;">${firstLetter}</span> • kết thúc bằng <span style="color: #f0d68d;">${lastLetter}</span>
            </div>
            <div style="margin-top: 12px;">
                <input type="text" id="guessInput" placeholder="Nhập tên chồng..." style="
                    width: 80%; 
                    padding: 12px 18px; 
                    background: rgba(20, 17, 11, 0.8); 
                    border: 1px solid rgba(214, 169, 66, 0.3); 
                    border-radius: 8px; 
                    color: #f0d68d; 
                    font-family: 'Be Vietnam Pro', sans-serif; 
                    font-size: 14px; 
                    text-align: center; 
                    outline: none;
                ">
                <div style="margin-top: 10px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="checkGuessAnswer('${random.name}')" style="
                        padding: 10px 30px; 
                        background: rgba(214, 169, 66, 0.15); 
                        border: 1px solid rgba(214, 169, 66, 0.4); 
                        border-radius: 8px; 
                        color: #f0d68d; 
                        font-family: 'Be Vietnam Pro', sans-serif; 
                        font-size: 11px; 
                        letter-spacing: 2px; 
                        cursor: pointer;
                    ">📝 KIỂM TRA</button>
                    <button onclick="window.handleGuessHusband()" style="
                        padding: 10px 25px; 
                        background: rgba(214, 169, 66, 0.15); 
                        border: 1px solid rgba(214, 169, 66, 0.4); 
                        border-radius: 8px; 
                        color: #f0d68d; 
                        font-family: 'Be Vietnam Pro', sans-serif; 
                        font-size: 11px; 
                        letter-spacing: 2px; 
                        cursor: pointer;
                    ">⏩ TIẾP THEO</button>
                </div>
                <div id="guessResult" style="margin-top: 12px; font-size: 16px; min-height: 30px;"></div>
            </div>
        </div>
    `;
}

// =====================================================
// 6. ĐÚNG/SAI
// =====================================================
function generateTrueFalseQuestion() {
    const random = HUSBANDS[Math.floor(Math.random() * HUSBANDS.length)];
    guessState.currentCorrect = random.name;
    
    const isTrue = Math.random() > 0.5;
    let statement = '';
    let correctAnswer = '';
    const firstLetter = random.name.charAt(0).toUpperCase();
    
    if (isTrue) {
        const facts = [
            `${random.name} có tag "${random.tags[0]}"`,
            `${random.name} làm nghề "${random.job}"`
        ];
        statement = facts[Math.floor(Math.random() * facts.length)];
        correctAnswer = 'đúng';
    } else {
        const wrongHusband = HUSBANDS.filter(h => h.name !== random.name)[Math.floor(Math.random() * (HUSBANDS.length - 1))];
        const falseFacts = [
            `${random.name} có tag "${wrongHusband.tags[0]}"`,
            `${random.name} làm nghề "${wrongHusband.job}"`
        ];
        statement = falseFacts[Math.floor(Math.random() * falseFacts.length)];
        correctAnswer = 'sai';
    }
    
    return `
        <div style="text-align: center;">
            <div style="font-size: 13px; color: rgba(233, 210, 146, 0.2); letter-spacing: 2px; margin-bottom: 5px;">
                📝 THỂ LOẠI: ĐÚNG / SAI
            </div>
            <div style="font-size: 17px; color: #f0d68d; margin: 10px 0; line-height: 1.8; padding: 18px; background: rgba(214, 169, 66, 0.05); border-radius: 12px; border-left: 3px solid rgba(214, 169, 66, 0.3);">
                "${statement}" — Đúng hay sai?
            </div>
            <div style="font-size: 13px; color: rgba(233, 210, 146, 0.3); padding: 8px; background: rgba(214, 169, 66, 0.05); border-radius: 8px;">
                💡 Tên bắt đầu bằng chữ <span style="color: #f0d68d;">${firstLetter}</span>
            </div>
            <div style="margin-top: 12px; display: flex; gap: 20px; justify-content: center;">
                <button onclick="checkTrueFalse('đúng', '${correctAnswer}', '${random.name}')" style="
                    padding: 12px 40px;
                    background: rgba(123, 237, 159, 0.1);
                    border: 2px solid rgba(123, 237, 159, 0.3);
                    border-radius: 12px;
                    color: #7bed9f;
                    font-family: 'Be Vietnam Pro', sans-serif;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">✅ ĐÚNG</button>
                <button onclick="checkTrueFalse('sai', '${correctAnswer}', '${random.name}')" style="
                    padding: 12px 40px;
                    background: rgba(255, 107, 107, 0.1);
                    border: 2px solid rgba(255, 107, 107, 0.3);
                    border-radius: 12px;
                    color: #ff6b6b;
                    font-family: 'Be Vietnam Pro', sans-serif;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">❌ SAI</button>
            </div>
            <div style="margin-top: 12px; display: flex; gap: 10px; justify-content: center;">
                <button onclick="window.handleGuessHusband()" style="
                    padding: 10px 25px; 
                    background: rgba(214, 169, 66, 0.15); 
                    border: 1px solid rgba(214, 169, 66, 0.4); 
                    border-radius: 8px; 
                    color: #f0d68d; 
                    font-family: 'Be Vietnam Pro', sans-serif; 
                    font-size: 11px; 
                    letter-spacing: 2px; 
                    cursor: pointer;
                ">⏩ TIẾP THEO</button>
            </div>
            <div id="guessResult" style="margin-top: 12px; font-size: 16px; min-height: 30px;"></div>
        </div>
    `;
}

// =====================================================
// HÀM KIỂM TRA (DÙNG CHUNG CHO ĐIỀN TÊN, CÂU NÓI)
// =====================================================
window.checkGuessAnswer = function(correctName) {
    if (guessState.answered) return;
    guessState.answered = true;
    
    const input = document.getElementById("guessInput");
    const result = document.getElementById("guessResult");
    if (!input || !result) return;
    
    const userGuess = input.value.trim();
    const isCorrect = isNameMatch(userGuess, correctName);
    
    if (isCorrect) {
        result.innerHTML = `✅ CHÍNH XÁC! Đó là <strong style="color: #f0d68d;">${correctName}</strong>! 🎉`;
        result.style.color = "#7bed9f";
    } else {
        result.innerHTML = `❌ Sai rồi! Đáp án là <strong style="color: #f0d68d;">${correctName}</strong>`;
        result.style.color = "#ff6b6b";
    }
};

// =====================================================
// HÀM KIỂM TRA HÌNH ẢNH
// =====================================================
window.checkGuessAnswerWithImage = function(correctName) {
    if (guessState.answered) return;
    guessState.answered = true;
    
    const input = document.getElementById("guessInput");
    const result = document.getElementById("guessResult");
    if (!input || !result) return;
    
    const userGuess = input.value.trim();
    const isCorrect = isNameMatch(userGuess, correctName);
    
    const blurred = document.getElementById("blurredImage");
    if (blurred) {
        blurred.style.filter = "blur(2px) brightness(0.85)";
    }
    const cropped = document.getElementById("croppedImage");
    if (cropped) {
        cropped.style.clipPath = "inset(0)";
    }
    
    if (isCorrect) {
        result.innerHTML = `✅ CHÍNH XÁC! Đó là <strong style="color: #f0d68d;">${correctName}</strong>! 🎉`;
        result.style.color = "#7bed9f";
        if (blurred) blurred.style.filter = "blur(0px) brightness(1)";
        if (cropped) cropped.style.clipPath = "inset(0)";
    } else {
        result.innerHTML = `❌ Sai rồi! Đáp án là <strong style="color: #f0d68d;">${correctName}</strong>`;
        result.style.color = "#ff6b6b";
    }
};

// =====================================================
// HÀM KIỂM TRA TRẮC NGHIỆM 4 ĐÁP ÁN
// =====================================================
window.checkQuizGuess = function(selectedIndex, correctIndex) {
    if (guessState.answered) return;
    guessState.answered = true;
    
    const result = document.getElementById("guessResult");
    const allOptions = document.querySelectorAll(".guess-option");
    
    if (!result) return;
    
    allOptions.forEach(btn => {
        btn.style.pointerEvents = "none";
        btn.style.opacity = "0.7";
    });
    
    allOptions.forEach((btn, idx) => {
        if (idx === correctIndex) {
            btn.style.borderColor = "#7bed9f";
            btn.style.background = "rgba(123, 237, 159, 0.15)";
        }
        if (idx === selectedIndex && idx !== correctIndex) {
            btn.style.borderColor = "#ff6b6b";
            btn.style.background = "rgba(255, 107, 107, 0.15)";
        }
    });
    
    if (selectedIndex === correctIndex) {
        const correctName = allOptions[correctIndex]?.textContent?.replace(/^[A-Z]\.\s*/, '') || '';
        result.innerHTML = `✅ CHÍNH XÁC! Đó là <strong style="color: #f0d68d;">${correctName}</strong>! 🎉`;
        result.style.color = "#7bed9f";
    } else {
        const correctName = allOptions[correctIndex]?.textContent?.replace(/^[A-Z]\.\s*/, '') || '';
        result.innerHTML = `❌ Sai rồi! Đáp án đúng là <strong style="color: #f0d68d;">${correctName}</strong>`;
        result.style.color = "#ff6b6b";
    }
};

// =====================================================
// HÀM KIỂM TRA ĐÚNG/SAI
// =====================================================
window.checkTrueFalse = function(userAnswer, correctAnswer, name) {
    if (guessState.answered) return;
    guessState.answered = true;
    
    const result = document.getElementById("guessResult");
    if (!result) return;
    
    const isCorrect = userAnswer === correctAnswer;
    
    if (isCorrect) {
        result.innerHTML = `✅ CHÍNH XÁC! Đó là <strong style="color: #f0d68d;">${name}</strong>! 🎉`;
        result.style.color = "#7bed9f";
    } else {
        result.innerHTML = `❌ Sai rồi! Đáp án đúng là <strong style="color: #f0d68d;">${correctAnswer.toUpperCase()}</strong>!`;
        result.style.color = "#ff6b6b";
    }
};

// =====================================================
// 6. FEATURE 3: TAROT READING — 78 LÁ ĐẦY ĐỦ (FIX NÚT + XÁC SUẤT)
// =====================================================
window.handleTarot = function() {
    const tarotCards = [
        // =====================================================
        // 22 MAJOR ARCANA
        // =====================================================
        { name: "THE FOOL", emoji: "0️⃣", upright: "Khởi đầu mới, ngây thơ, phiêu lưu, niềm tin", reversed: "Liều lĩnh, ngu ngốc, rủi ro, thiếu suy nghĩ", message: "Bạn đang đứng trước một khởi đầu mới. Hãy bước những bước đầu tiên với lòng tin và sự ngây thơ của trái tim. Đừng sợ ngã, vì cuộc phiêu lưu đang chờ bạn." },
        { name: "THE MAGICIAN", emoji: "1️⃣", upright: "Ý chí, sáng tạo, biểu hiện, khả năng tập trung", reversed: "Thao túng, lừa dối, sử dụng sai sức mạnh", message: "Bạn có tất cả công cụ cần thiết trong tay. Hãy tin vào khả năng của mình và biến ước mơ thành hiện thực. Sức mạnh nằm trong ý chí của bạn." },
        { name: "THE HIGH PRIESTESS", emoji: "2️⃣", upright: "Trực giác, bí ẩn, tiềm thức, kiến thức bên trong", reversed: "Bỏ qua trực giác, bí mật bị che giấu", message: "Trực giác mách bảo bạn điều gì đó. Hãy lắng nghe tiếng nói bên trong trước khi đưa ra quyết định." },
        { name: "THE EMPRESS", emoji: "3️⃣", upright: "Sinh sôi, tình yêu, nghệ thuật, nuôi dưỡng", reversed: "Kiểm soát quá mức, thiếu sáng tạo", message: "Tình yêu và sự sáng tạo đang nở rộ trong bạn. Hãy để cảm xúc dẫn lối và vẻ đẹp sẽ tìm đến." },
        { name: "THE EMPEROR", emoji: "4️⃣", upright: "Quyền lực, ổn định, bảo vệ, kỷ luật", reversed: "Độc đoán, cứng nhắc, thiếu kiểm soát", message: "Bạn là người có quyền lực và sự ổn định. Hãy sử dụng điều này để bảo vệ những người bạn yêu thương." },
        { name: "THE HIEROPHANT", emoji: "5️⃣", upright: "Truyền thống, giáo dục, hướng dẫn, niềm tin", reversed: "Nổi loạn, cố chấp, không tin tưởng", message: "Những người đi trước có thể cho bạn lời khuyên quý báu. Đừng ngại học hỏi từ những người có kinh nghiệm." },
        { name: "THE LOVERS", emoji: "6️⃣", upright: "Tình yêu, lựa chọn, hòa hợp, cam kết", reversed: "Xung đột, mất kết nối, sự không chung thủy", message: "Tình yêu đang ở trong không khí. Nhưng hãy nhớ rằng, tình yêu đích thực đòi hỏi sự lựa chọn và cam kết hàng ngày." },
        { name: "THE CHARIOT", emoji: "7️⃣", upright: "Quyết tâm, chiến thắng, kiểm soát, ý chí", reversed: "Mất kiểm soát, thất bại, thiếu định hướng", message: "Bạn đang làm chủ cuộc đời mình. Hãy lái con xe về phía trước với quyết tâm không gì ngăn cản được." },
        { name: "STRENGTH", emoji: "8️⃣", upright: "Sức mạnh, kiên nhẫn, từ bi, lòng can đảm", reversed: "Yếu đuối, thiếu tự tin, buông xuôi", message: "Sức mạnh thực sự không đến từ bạo lực, mà từ lòng từ bi và kiên nhẫn. Bạn mạnh mẽ hơn bạn nghĩ." },
        { name: "THE HERMIT", emoji: "9️⃣", upright: "Nội tâm, chiêm nghiệm, cô đơn, tìm kiếm sự thật", reversed: "Cô lập, từ chối giúp đỡ, trốn tránh", message: "Đôi khi bạn cần thời gian một mình để tìm ra câu trả lời. Hãy rút lui về thế giới nội tâm để tìm ánh sáng." },
        { name: "WHEEL OF FORTUNE", emoji: "🔟", upright: "Số phận, thay đổi, cơ hội, chu kỳ", reversed: "Rủi ro, trở ngại, thất bại", message: "Số phận đang mỉm cười với bạn. Cơ hội lớn đang đến, hãy nắm bắt khi bánh xe vận mệnh xoay chuyển." },
        { name: "JUSTICE", emoji: "⚖️", upright: "Công bằng, chân lý, hậu quả, sự thật", reversed: "Bất công, thiên vị, buộc tội sai", message: "Công lý sẽ được thực thi. Hãy thành thật với bản thân và người khác, những gì bạn gieo sẽ gặt." },
        { name: "THE HANGED MAN", emoji: "🙃", upright: "Buông bỏ, hy sinh, cách nhìn mới, chấp nhận", reversed: "Bế tắc, trì hoãn, không muốn thay đổi", message: "Đôi khi bạn phải buông bỏ để tiến về phía trước. Hãy nhìn nhận mọi việc từ một góc độ hoàn toàn mới." },
        { name: "DEATH", emoji: "💀", upright: "Kết thúc, biến đổi, tái sinh, buông bỏ", reversed: "Không muốn thay đổi, kìm hãm, kháng cự", message: "Một điều gì đó đang kết thúc để nhường chỗ cho điều mới. Đừng sợ thay đổi, đó là cơ hội để tái sinh." },
        { name: "TEMPERANCE", emoji: "🌊", upright: "Cân bằng, kiên nhẫn, hài hòa, trung dung", reversed: "Mất cân bằng, xung đột, thiếu kiên nhẫn", message: "Hãy giữ sự cân bằng trong mọi mặt cuộc sống. Kiên nhẫn sẽ mang lại sự hài hòa mà bạn tìm kiếm." },
        { name: "THE DEVIL", emoji: "👿", upright: "Cám dỗ, ràng buộc, bóng tối, vật chất", reversed: "Giải thoát, vượt qua cám dỗ, nhận thức", message: "Những cám dỗ đang vây quanh bạn. Hãy nhận diện và đừng để chúng trói buộc bạn vào những điều không tốt." },
        { name: "THE TOWER", emoji: "⚡", upright: "Thay đổi đột ngột, sụp đổ, thức tỉnh, sự thật", reversed: "Trì hoãn thảm họa, trốn tránh sự thật", message: "Những thay đổi lớn đang ập đến. Có thể là một cú sốc, nhưng cũng là cơ hội để xây dựng lại từ đầu." },
        { name: "THE STAR", emoji: "⭐", upright: "Hy vọng, cảm hứng, bình an, chữa lành", reversed: "Mất niềm tin, thất vọng, thiếu hy vọng", message: "Hy vọng đang tỏa sáng như một vì sao trong bóng tối. Hãy giữ vững niềm tin và bình an trong tâm hồn." },
        { name: "THE MOON", emoji: "🌙", upright: "Ảo ảnh, nỗi sợ, trực giác, tiềm thức", reversed: "Vượt qua nỗi sợ, sự thật lộ diện", message: "Mọi thứ không như vẻ bề ngoài. Hãy tin vào trực giác của bạn, nhưng cũng cần nhìn rõ sự thật ẩn giấu." },
        { name: "THE SUN", emoji: "☀️", upright: "Hạnh phúc, thành công, năng lượng, lạc quan", reversed: "Bi quan, ích kỷ, thất bại tạm thời", message: "Ánh sáng của thành công và hạnh phúc đang tỏa rọi. Hãy tận hưởng khoảnh khắc này và chia sẻ niềm vui với người khác." },
        { name: "JUDGEMENT", emoji: "📯", upright: "Đánh giá, thức tỉnh, tha thứ, tự nhìn nhận", reversed: "Tự phán xét, không tha thứ, trì hoãn", message: "Đã đến lúc đánh giá lại quá khứ và tha thứ cho chính mình và người khác. Một sự thức tỉnh đang chờ bạn." },
        { name: "THE WORLD", emoji: "🌍", upright: "Hoàn thành, đạt được, hạnh phúc, viên mãn", reversed: "Chưa hoàn thành, thiếu kết thúc, bị trì hoãn", message: "Bạn đã đạt được mục tiêu của mình. Cảm giác hoàn thành và viên mãn đang ở quanh bạn." },
        
        // =====================================================
        // 14 WANDS
        // =====================================================
        { name: "Ace of Wands", emoji: "🔥", upright: "Khởi đầu mới, cảm hứng, đam mê", reversed: "Thiếu đam mê, trì hoãn, chán nản", message: "Một cơ hội mới đang đến với bạn. Hãy nắm bắt nó với sự nhiệt huyết và đam mê." },
        { name: "2 of Wands", emoji: "🔥", upright: "Lập kế hoạch, quyết định, hướng đi mới", reversed: "Sợ hãi, thiếu quyết đoán, bỏ lỡ cơ hội", message: "Bạn đang đứng ở ngã rẽ và cần đưa ra quyết định. Hãy nhìn về phía trước và lập kế hoạch cho tương lai." },
        { name: "3 of Wands", emoji: "🔥", upright: "Mở rộng, tầm nhìn, kiên nhẫn, tiến bộ", reversed: "Thiếu tầm nhìn, bỏ cuộc, trì hoãn", message: "Đây là lúc mở rộng tầm nhìn của bạn. Hãy nhìn xa hơn và tin rằng những nỗ lực của bạn đang được đền đáp." },
        { name: "4 of Wands", emoji: "🔥", upright: "Kỷ niệm, hạnh phúc, về nhà, ổn định", reversed: "Xung đột gia đình, mất ổn định", message: "Hãy ăn mừng những thành quả bạn đã đạt được. Đây là khoảnh khắc của niềm vui và sự gắn kết." },
        { name: "5 of Wands", emoji: "🔥", upright: "Cạnh tranh, xung đột, thử thách, bất đồng", reversed: "Tránh xung đột, hòa giải, hợp tác", message: "Những cuộc tranh luận và cạnh tranh đang xảy ra. Hãy nhìn vào bức tranh lớn và tìm cách hòa giải." },
        { name: "6 of Wands", emoji: "🔥", upright: "Chiến thắng, công nhận, tự tin, thành công", reversed: "Thất bại, thiếu công nhận, ngã ngựa", message: "Chiến thắng đã thuộc về bạn! Hãy tận hưởng vinh quang và sự công nhận." },
        { name: "7 of Wands", emoji: "🔥", upright: "Bảo vệ, kiên trì, đứng vững, dũng cảm", reversed: "Buông xuôi, bị áp đảo, từ bỏ", message: "Hãy kiên trì và đứng vững trước những thử thách. Bạn có sức mạnh để bảo vệ những gì quan trọng với bạn." },
        { name: "8 of Wands", emoji: "🔥", upright: "Hành động nhanh, tin tức, tiến triển, tốc độ", reversed: "Trì hoãn, chậm trễ, thông tin sai", message: "Mọi thứ đang di chuyển rất nhanh. Tin tức tốt và sự tiến triển đang đến." },
        { name: "9 of Wands", emoji: "🔥", upright: "Kiên trì, bền bỉ, chiến đấu, sức mạnh cuối cùng", reversed: "Mệt mỏi, bỏ cuộc, yếu đuối, từ bỏ", message: "Bạn đã chiến đấu rất lâu. Hãy giữ vững niềm tin và tiếp tục bước đi." },
        { name: "10 of Wands", emoji: "🔥", upright: "Gánh nặng, trách nhiệm, căng thẳng, quá tải", reversed: "Buông bỏ, giảm tải, chia sẻ gánh nặng", message: "Bạn đang mang quá nhiều trách nhiệm. Đã đến lúc học cách nói không và chia sẻ gánh nặng." },
        
        // =====================================================
        // 14 CUPS
        // =====================================================
        { name: "Ace of Cups", emoji: "💧", upright: "Tình yêu mới, cảm xúc, lòng trắc ẩn", reversed: "Tắc nghẽn cảm xúc, mất kết nối", message: "Một tình yêu mới hoặc sự kết nối cảm xúc sâu sắc đang đến. Hãy mở trái tim của bạn và đón nhận." },
        { name: "2 of Cups", emoji: "💧", upright: "Kết nối, tình yêu đôi lứa, thu hút", reversed: "Xung đột, mất kết nối, không hòa hợp", message: "Một mối quan hệ đẹp đang hình thành. Đây là sự kết nối của hai trái tim." },
        { name: "3 of Cups", emoji: "💧", upright: "Kỷ niệm, bạn bè, niềm vui, cộng đồng", reversed: "Tin đồn, vô tình, ghen tuông", message: "Hãy ăn mừng cuộc sống cùng bạn bè. Niềm vui và sự kết nối xã hội đang đến với bạn." },
        { name: "4 of Cups", emoji: "💧", upright: "Thờ ơ, thiếu hài lòng, nội tâm", reversed: "Nhận thức mới, chấp nhận cơ hội", message: "Bạn đang cảm thấy thờ ơ và không hài lòng. Hãy nhìn vào những cơ hội xung quanh bạn." },
        { name: "5 of Cups", emoji: "💧", upright: "Mất mát, đau buồn, hối tiếc, thất vọng", reversed: "Chấp nhận, tha thứ, phục hồi", message: "Nỗi đau và sự mất mát đang ở trong trái tim bạn. Hãy nhìn về phía trước, còn có nhiều điều tốt đẹp đang chờ." },
        { name: "6 of Cups", emoji: "💧", upright: "Kỷ niệm, hoài niệm, sự ngây thơ", reversed: "Kẹt trong quá khứ, không thể tiến lên", message: "Những kỷ niệm ngọt ngào đang trở về. Hãy trân trọng quá khứ nhưng đừng để nó giữ bạn ở lại." },
        { name: "7 of Cups", emoji: "💧", upright: "Ảo tưởng, lựa chọn, mơ mộng, phân tán", reversed: "Tỉnh táo, thực tế, tập trung", message: "Có nhiều lựa chọn và cám dỗ xung quanh bạn. Đừng để ảo tưởng đánh lừa." },
        { name: "8 of Cups", emoji: "💧", upright: "Rời bỏ, buông bỏ, tìm kiếm ý nghĩa", reversed: "Ở lại, sợ thay đổi, lạc lối", message: "Đã đến lúc rời bỏ những gì không còn phù hợp. Hành trình tìm kiếm ý nghĩa mới đang chờ bạn." },
        { name: "9 of Cups", emoji: "💧", upright: "Hài lòng, sung túc, ước mơ thành hiện thực", reversed: "Tham lam, bất mãn, thiếu biết đủ", message: "Ước mơ của bạn đang trở thành hiện thực. Hãy tận hưởng sự hài lòng và biết ơn những gì bạn có." },
        { name: "10 of Cups", emoji: "💧", upright: "Hạnh phúc trọn vẹn, hòa hợp gia đình", reversed: "Bất hòa, mất kết nối, vỡ mộng", message: "Hạnh phúc gia đình và tình yêu viên mãn đang ở quanh bạn. Hãy trân trọng những người thân yêu." },
        
        // =====================================================
        // 14 SWORDS
        // =====================================================
        { name: "Ace of Swords", emoji: "⚔️", upright: "Sự thật, trí tuệ, phá vỡ ảo tưởng", reversed: "Nhầm lẫn, lừa dối, thiếu rõ ràng", message: "Sự thật sắc bén như lưỡi kiếm đang đến với bạn. Hãy đón nhận nó với trí tuệ và sự dũng cảm." },
        { name: "2 of Swords", emoji: "⚔️", upright: "Bế tắc, khó khăn trong quyết định", reversed: "Thoát khỏi bế tắc, ra quyết định", message: "Bạn đang bị kẹt trong sự do dự. Hãy tin vào trực giác của mình và đưa ra quyết định." },
        { name: "3 of Swords", emoji: "⚔️", upright: "Tan vỡ, đau đớn, phản bội, tổn thương", reversed: "Chữa lành, tha thứ, vượt qua nỗi đau", message: "Trái tim bạn đang chịu tổn thương. Hãy cho phép mình đau và chữa lành." },
        { name: "4 of Swords", emoji: "⚔️", upright: "Nghỉ ngơi, phục hồi, tĩnh tâm", reversed: "Kiệt sức, thiếu nghỉ ngơi, lo âu", message: "Hãy dành thời gian để nghỉ ngơi và phục hồi năng lượng. Sự tĩnh tâm sẽ mang lại cho bạn sức mạnh mới." },
        { name: "5 of Swords", emoji: "⚔️", upright: "Xung đột, chiến thắng cay đắng, thiệt hại", reversed: "Hòa giải, tha thứ, buông bỏ chiến tranh", message: "Bạn đã thắng, nhưng với một cái giá đắt. Hãy cân nhắc xem chiến thắng này có xứng đáng không." },
        { name: "6 of Swords", emoji: "⚔️", upright: "Chuyển tiếp, rời bỏ, hành trình mới", reversed: "Kẹt lại, không thể tiến lên, trì hoãn", message: "Hành trình mới đang chờ bạn. Hãy rời bỏ những khó khăn trong quá khứ và bước sang một chương mới." },
        { name: "7 of Swords", emoji: "⚔️", upright: "Lừa dối, phản bội, trốn tránh, mưu mô", reversed: "Trung thực, đối mặt, ăn năn", message: "Có điều gì đó không thành thật đang xảy ra. Hãy cẩn thận với những người xung quanh." },
        { name: "8 of Swords", emoji: "⚔️", upright: "Giới hạn, bị trói buộc, suy nghĩ tiêu cực", reversed: "Tự do, giải thoát, kiểm soát tâm trí", message: "Bạn đang là tù nhân của chính suy nghĩ của mình. Hãy nhận ra rằng bạn có sức mạnh để giải thoát." },
        { name: "9 of Swords", emoji: "⚔️", upright: "Lo âu, ác mộng, mất ngủ, sợ hãi", reversed: "Vượt qua nỗi sợ, hy vọng, bình tĩnh", message: "Những lo lắng và nỗi sợ đang làm bạn mất ngủ. Hãy đối mặt với chúng và bạn sẽ thấy mọi thứ không đáng sợ như tưởng tượng." },
        { name: "10 of Swords", emoji: "⚔️", upright: "Điểm cuối, đau đớn tột cùng, sự sụp đổ", reversed: "Phục hồi, thức tỉnh, khởi đầu mới", message: "Đây là điểm thấp nhất. Nhưng từ nơi đây, chỉ còn một đường lên. Mọi thứ sẽ tốt hơn." },
        
        // =====================================================
        // 14 PENTACLES
        // =====================================================
        { name: "Ace of Pentacles", emoji: "🪙", upright: "Cơ hội tài chính, thành công vật chất", reversed: "Bỏ lỡ cơ hội, mất mát tài chính", message: "Một cơ hội về tài chính hoặc công việc đang đến. Hãy nắm bắt nó với sự thực tế và tỉnh táo." },
        { name: "2 of Pentacles", emoji: "🪙", upright: "Cân bằng, linh hoạt, quản lý tài chính", reversed: "Mất cân bằng, nợ nần, hỗn loạn", message: "Bạn đang xoay xở với nhiều trách nhiệm tài chính. Hãy giữ sự cân bằng và linh hoạt." },
        { name: "3 of Pentacles", emoji: "🪙", upright: "Hợp tác, làm việc nhóm, phát triển kỹ năng", reversed: "Thiếu hợp tác, làm việc kém hiệu quả", message: "Sự hợp tác sẽ mang lại thành công. Hãy làm việc cùng người khác và phát triển kỹ năng của bạn." },
        { name: "4 of Pentacles", emoji: "🪙", upright: "Giữ chặt, tích trữ, sợ mất mát", reversed: "Buông bỏ, cho đi, hào phóng", message: "Bạn đang giữ quá chặt những gì bạn có. Hãy học cách buông bỏ và tin rằng cuộc sống sẽ luôn cung cấp cho bạn." },
        { name: "5 of Pentacles", emoji: "🪙", upright: "Khó khăn, thiếu thốn, bị loại trừ", reversed: "Phục hồi, giúp đỡ, thay đổi vận mệnh", message: "Những khó khăn đang ập đến. Nhưng bạn không đơn độc. Hãy tìm kiếm sự giúp đỡ." },
        { name: "6 of Pentacles", emoji: "🪙", upright: "Cho đi, nhận lại, hào phóng, cân bằng", reversed: "Ích kỷ, vay mượn, bất công", message: "Hãy cho đi và bạn sẽ nhận lại. Đây là thời điểm để cân bằng giữa cho và nhận." },
        { name: "7 of Pentacles", emoji: "🪙", upright: "Kiên nhẫn, chờ đợi, đánh giá tiến triển", reversed: "Thiếu kiên nhẫn, bỏ cuộc, thất vọng", message: "Hãy kiên nhẫn và đánh giá những gì bạn đã gieo trồng. Sự chờ đợi sẽ được đền đáp." },
        { name: "8 of Pentacles", emoji: "🪙", upright: "Cần cù, học tập, phát triển kỹ năng", reversed: "Lười biếng, thiếu động lực, bỏ cuộc", message: "Sự cần cù và chăm chỉ sẽ mang lại kết quả. Hãy tiếp tục học hỏi và phát triển." },
        { name: "9 of Pentacles", emoji: "🪙", upright: "Tự do, sung túc, tài chính ổn định", reversed: "Phụ thuộc, mất độc lập, bấp bênh", message: "Bạn đã đạt được sự tự do và ổn định. Hãy tận hưởng thành quả của mình." },
        { name: "10 of Pentacles", emoji: "🪙", upright: "Di sản, thịnh vượng lâu dài, gia đình", reversed: "Mất ổn định, rạn nứt gia đình", message: "Sự thịnh vượng và ổn định lâu dài đang đến. Gia đình và di sản là những gì quý giá nhất." }
    ];

    // Random 1 lá trong 78 lá (xác suất đều nhau)
    const random = tarotCards[Math.floor(Math.random() * tarotCards.length)];
    // 30% xác suất lá ngược
    const isReversed = Math.random() > 0.7;
    const meaning = isReversed ? random.reversed : random.upright;
    const status = isReversed ? "NGƯỢC" : "XUÔI";
    const statusColor = isReversed ? "#ff6b6b" : "#7bed9f";

    // Hiển thị modal
    showModal("🔮", "TAROT READING", `
        <div style="text-align: center;">
            <div style="font-size: 64px; margin: 10px 0;">${random.emoji}</div>
            <div style="font-size: 24px; font-family: 'Cormorant Garamond', serif; color: #f0d68d; margin: 5px 0;">${random.name}</div>
            <div style="font-size: 13px; color: ${statusColor}; margin: 5px 0; letter-spacing: 3px; font-weight: 600;">⚡ ${status} ⚡</div>
            <div style="font-size: 15px; color: rgba(233, 210, 146, 0.7); margin: 8px 0; padding: 12px; background: rgba(214, 169, 66, 0.05); border-radius: 10px; border-left: 2px solid ${statusColor};">📖 ${meaning}</div>
            <div style="font-size: 15px; color: rgba(233, 210, 146, 0.85); margin: 12px 0; padding: 18px; background: rgba(214, 169, 66, 0.08); border-radius: 12px; line-height: 1.6; font-style: italic;">✦ ${random.message} ✦</div>
            <div style="font-size: 10px; color: rgba(233, 210, 146, 0.15); margin-top: 5px; letter-spacing: 1px;">Lá bài ${isReversed ? 'ngược' : 'xuôi'} trong bộ 78 lá</div>
            
            <!-- NÚT BỐC LÁ KHÁC - GỌI window.handleTarot() -->
            <button onclick="window.handleTarot()" style="
                margin-top: 15px; 
                padding: 10px 30px; 
                background: rgba(214, 169, 66, 0.15); 
                border: 1px solid rgba(214, 169, 66, 0.4); 
                border-radius: 8px; 
                color: #f0d68d; 
                font-family: 'Be Vietnam Pro', sans-serif; 
                font-size: 11px; 
                letter-spacing: 2px; 
                cursor: pointer;
                transition: all 0.3s ease;
            ">🔮 BỐC LÁ KHÁC</button>
        </div>
    `);
};

 // =====================================================
// 7. FEATURE 4: DAILY CHALLENGE — 200+ THỬ THÁCH BÁ ĐẠO (FULL LINK + HIỆU ỨNG)
// =====================================================

// State cho Daily Challenge
let dailyChallengeState = {
    currentChallenge: null,
    isAnimating: false,
    timer: null
};

function handleDailyChallenge() {
    // Nếu đang animation thì không làm gì
    if (dailyChallengeState.isAnimating) return;
    
    // =====================================================
    // DANH SÁCH THỬ THÁCH BÁ ĐẠO (200+)
    // =====================================================
    const baseChallenges = [
        // =================================================
        // 🔥 EXTREME — Bá đạo, kích thích
        // =================================================
        { text: "Mời chồng tham gia một trò chơi mà người thua phải làm theo ý người thắng (và đảm bảo mình thắng 😏)", vibe: "🔥", level: "extreme" },
        { text: "Gửi tin nhắn thoại thì thầm 3 điều em muốn làm với anh ấy vào tối nay", vibe: "🌶️", level: "extreme" },
        { text: "Nhắn 'Em đang mặc thứ gì đó rất mỏng... muốn xem không?' và chờ phản ứng", vibe: "🔥", level: "extreme" },
        { text: "Thách anh ấy đoán em đang mặc gì, nếu sai thì phải chiều em một việc", vibe: "😈", level: "extreme" },
        { text: "Gửi 1 sticker 'cấm' và bảo 'Anh đã sẵn sàng trở thành người đàn ông sung sướng nhất trên thế giới chưa~? 🔞'", vibe: "🔥", level: "extreme" },
        { text: "Nhắn 'Em có một bí mật không thể nói bằng lời... chỉ có thể thể hiện bằng hành động'", vibe: "🌶️", level: "extreme" },
        { text: "Đặt ra luật chơi: ai nhìn chằm chằm người kia trước thì thua", vibe: "🔥", level: "extreme" },
        { text: "Hôn kiểu Pháp với người ấy trong vòng 3 phút", vibe: "🌶️", level: "extreme" },
        { text: "Nhắn 'Nếu em là tội phạm, anh sẽ bắt em bằng cách nào? Đoán đi'", vibe: "😈", level: "extreme" },
        { text: "Gửi 1 câu 'Em muốn được anh bắt cóc... về nhà anh'", vibe: "🔥", level: "extreme" },
        { text: "Thách anh ấy gọi em bằng một biệt danh ngọt ngào trong cả cuộc trò chuyện", vibe: "🥰", level: "extreme" },
        { text: "Nhắn 'Em muốn được anh lắp đầy khoảng trống...'", vibe: "💕", level: "extreme" },
        { text: "Gửi 1 câu 'Nếu em là món tráng miệng, anh sẽ ăn em từ đâu?'", vibe: "🔥", level: "extreme" },
        { text: "Nhắn 'Anh có dám để em làm chủ tối nay không?'", vibe: "😈", level: "extreme" },
        { text: "Mặc đồ hầu gái, gắn thêm tai mèo rồi ngồi lên đùi người ấy", vibe: "😈", level: "extreme" },
        
        // =================================================
        // 🌶️ SPICY — Hư hỏng, tinh quái
        // =================================================
        { text: "Gửi voice note thì thầm 'Anh là người đàn ông em thèm khát nhất'", vibe: "🌶️", level: "spicy" },
        { text: "Nhắn 'Em đang tưởng tượng cảnh anh mặc sơ mi... và em cởi nó ra'", vibe: "🔥", level: "spicy" },
        { text: "Gửi 1 ảnh cũ của em và bảo 'Ngày này nếu gặp anh, em đã làm gì anh nhỉ?'", vibe: "🌶️", level: "spicy" },
        { text: "Nhắn 'Anh có biết em đang cười một mình vì nghĩ đến anh không?'", vibe: "💕", level: "spicy" },
        { text: "Gửi 1 bài thơ tình tự viết và bảo 'Của riêng em dành cho anh'", vibe: "💕", level: "spicy" },
        { text: "Nhắn 'Em muốn được anh chiều theo cách mà chỉ anh biết'", vibe: "🌶️", level: "spicy" },
        { text: "Gửi 1 sticker hôn gió và bảo 'Gửi anh nụ hôn đầu tiên trong ngày'", vibe: "😈", level: "spicy" },
        { text: "Nhắn 'Nếu có một điều duy nhất em có thể làm vì anh, đó sẽ là gì?'", vibe: "💕", level: "spicy" },
        { text: "Gửi 1 câu 'Em đang mặc áo thun của anh... nó rộng quá, nhưng em thích'", vibe: "🔥", level: "spicy" },
        { text: "Nhắn 'Anh có muốn em kể về giấc mơ của em không? Có anh trong đó'", vibe: "🥰", level: "spicy" },
        { text: "Gửi 1 ảnh bóng tối và bảo 'Đây là em đang chờ anh trong bóng tối'", vibe: "🌶️", level: "spicy" },
        { text: "Nhắn 'Em đã sẵn sàng để bị anh chiều hư rồi đấy'", vibe: "😈", level: "spicy" },
        { text: "Gửi 1 câu 'Anh có dám mở lời trước với em không?'", vibe: "🔥", level: "spicy" },
        { text: "Nhắn 'Em đang tưởng tượng bàn tay anh vuốt tóc em'", vibe: "💕", level: "spicy" },
        { text: "Gửi 1 sticker 'I love you' và bảo 'Từ rất lâu rồi'", vibe: "🥰", level: "spicy" },
        
        // =================================================
        // 😈 CHEEKY — Nghịch ngợm, thử thách
        // =================================================
        { text: "Nhắn 'Anh có dám thừa nhận em là người khiến anh hạnh phúc nhất của anh không?'", vibe: "😈", level: "cheeky" },
        { text: "Gửi 1 meme về tình yêu và tag anh ấy", vibe: "😜", level: "cheeky" },
        { text: "Thách anh ấy gọi em bằng một biệt danh mới mỗi ngày", vibe: "😈", level: "cheeky" },
        { text: "Nhắn 'Em đang nghĩ về một điều rất nghịch ngợm... đoán xem?'", vibe: "🔥", level: "cheeky" },
        { text: "Gửi 1 sticker tinh nghịch và bảo 'Hình như em vừa nghĩ ra một kế hoạch...'", vibe: "😈", level: "cheeky" },
        { text: "Nhắn 'Anh có muốn em làm điều gì đó bất ngờ cho anh không?'", vibe: "💕", level: "cheeky" },
        { text: "Gửi 1 câu 'Nếu em là công chúa, anh sẽ làm gì để giải cứu em?'", vibe: "🥰", level: "cheeky" },
        { text: "Nhắn 'Em đang giấu một điều bí mật... muốn biết thì phải chiều em'", vibe: "😈", level: "cheeky" },
        { text: "Gửi 1 sticker 'mèo giận' và bảo 'Em đang giận anh vì anh làm em nhớ quá'", vibe: "😜", level: "cheeky" },
        { text: "Nhắn 'Anh có dám nghe em nói 'Em yêu anh' bằng 5 ngôn ngữ không?'", vibe: "💕", level: "cheeky" },
        
        // =================================================
        // 💕 ROMANTIC — Lãng mạn sâu sắc (Flirty, dính, cuốn)
        // =================================================
        { text: "Gửi 1 voice note thở dài nhẹ: 'Tự nhiên thèm ôm anh vãi...'", vibe: "🫦", level: "romantic" },
        { text: "Nhắn: 'Hình như em bị nghiện cái mùi trên cổ anh rồi thì phải...'", vibe: "🔥", level: "romantic" },
        { text: "Gửi 1 bài hát lofi/R&B kèm timecode đoạn phiêu: 'Đoạn này nghe giống hệt lúc em nghĩ về anh.'", vibe: "🎶", level: "romantic" },
        { text: "Nhắn: 'Anh đừng cười kiểu đấy nữa, làm em mất tập trung cả ngày hôm nay rồi.'", vibe: "🫠", level: "romantic" },
        { text: "Gửi ảnh môi/mắt góc cận rồi xoá ngay sau 3 giây (hoặc dùng chế độ xem 1 lần): 'Cho anh ngắm chút thôi.'", vibe: "👀", level: "romantic" },
        { text: "Nhắn: 'Đang làm việc mà tự nhiên flash-back lại cái đoạn anh ghé sát tai em hôm nọ...'", vibe: "🔥", level: "romantic" },
        { text: "Gửi location hiện tại: 'Tự nhiên thấy thiếu thiếu một người ngồi cạnh ở đây.'", vibe: "📍", level: "romantic" },
        { text: "Nhắn: 'Hôm nay em ngoan lắm rồi, tối nay có thưởng gì không?'", vibe: "😏", level: "romantic" },
        { text: "Gửi 1 câu: 'Mọi người khen em gu thẩm mỹ tốt, nhưng em thấy gu tốt nhất của em là chọn anh.'", vibe: "✨", level: "romantic" },
        { text: "Nhắn: 'Đêm nay đừng xuất hiện trong giấc mơ của em nữa nha, em mệt lắm rồi đó 🙄'", vibe: "🌙", level: "romantic" },

        // =================================================
        // 🎵 FUN — Vui vẻ, gài kèo, trêu ngươi
        // =================================================
        { text: "Nhắn: 'Kèo này nhanh: Tối nay đi drink với em hoặc là cuối tuần đền em 1 chấu?'", vibe: "🍸", level: "fun" },
        { text: "Gửi 1 ảnh meme hài: 'Nhìn giống anh lúc cố chấp tranh luận với em không?'", vibe: "😂", level: "fun" },
        { text: "Nhắn: 'Em vừa phát hiện ra một bí mật cực sốc về anh. Có muốn chuộc lỗi trước khi em xả ra không?'", vibe: "🕵️‍♀️", level: "fun" },
        { text: "Gửi voice note nhại lại giọng anh ấy kèm câu: 'Nghe lại xem có đáng ăn đòn không?'", vibe: "🤪", level: "fun" },
        { text: "Nhắn: 'Chơi Rock-Paper-Scissors qua tin nhắn đi, ai thua phải bao bữa tối tiếp theo.'", vibe: "🎮", level: "fun" },
        { text: "Gửi 1 ảnh chụp góc phòng: 'Soi kĩ đi, xem có thấy cái gì gọi là 'sự nhớ anh' đang lảng vảng không?'", vibe: "🔍", level: "fun" },
        { text: "Nhắn: 'Cảnh báo: Tần suất anh xuất hiện trong đầu em hôm nay đang vượt quá ngưỡng cho phép!'", vibe: "⚠️", level: "fun" },
        { text: "Gửi bài test tính cách/love language: 'Làm đi rồi chụp kết quả cho em, xem có hợp làm người yêu em không.'", vibe: "📊", level: "fun" },

        // =================================================
        // 🤪 CHAOTIC — Khó đoán, giật gân, vô số tội
        // =================================================
        { text: "Nhắn: 'Em vừa gây ra một lỗi lầm nghiêm trọng... và chỉ có anh mới cứu được em thôi 😭'", vibe: "🚨", level: "chaotic" },
        { text: "Nhắn: 'Anh ơi, em vừa lỡ tay order đồ đôi rồi. Không mặc là em giận á!'", vibe: "🛍️", level: "chaotic" },
        { text: "Gửi 1 ảnh đen thâu: 'Đó là tương lai của anh nếu thiếu em đấy.'", vibe: "💀", level: "chaotic" },
        { text: "Nhắn: '15 phút nữa em đứng trước cửa nhà anh, không ra là em bóp còi inh ỏi ráng chịu!'", vibe: "🚗", level: "chaotic" },
        { text: "Gửi câu: 'Em vừa xem bói bài Tarot, Reader bảo anh sắp sửa mất một số tiền lớn... để dắt em đi ăn.'", vibe: "🔮", level: "chaotic" },
        { text: "Nhắn: 'Tự nhiên thèm bị ai đó xoa đầu ghê, mà phải là cái tay ấm ấm của anh cơ.'", vibe: "💆‍♀️", level: "chaotic" },
        { text: "Gửi tin nhắn rồi gỡ ngay lập tức. Khi họ hỏi thì nhắn: 'Nghĩ lại rồi, tò mò thì phải trả phí!'", vibe: "😈", level: "chaotic" },
        { text: "Nhắn: 'Nếu em là bão cấp 12 thì anh có dám ra đường hứng không?'", vibe: "🌪️", level: "chaotic" }
    ];

    // Tạo 200+ thử thách
    let allChallenges = [];
    const vibes = ["🌶️", "🥰", "😈", "💕", "😜", "🎵", "😅", "🤪", "🔥"];
    const levels = ["extreme", "spicy", "cheeky", "romantic", "fun", "chaotic"];
    
    while (allChallenges.length < 200) {
        const base = baseChallenges[Math.floor(Math.random() * baseChallenges.length)];
        const randomHusband = HUSBANDS[Math.floor(Math.random() * HUSBANDS.length)];
        const randomVibe = vibes[Math.floor(Math.random() * vibes.length)];
        
        const variations = [
            base.text,
            "🔥 " + base.text + " (dành cho " + randomHusband.name + ")",
            "💥 " + base.text.replace('chồng', randomHusband.name),
            "⚡ " + base.text + " — Nếu anh dám nhận lời thử thách này!",
            "👑 " + randomHusband.name + ", em thách anh làm điều này!"
        ];
        
        allChallenges.push({
            text: variations[Math.floor(Math.random() * variations.length)],
            husband: randomHusband.name,
            emoji: randomHusband.emoji,
            vibe: randomVibe,
            level: base.level || levels[Math.floor(Math.random() * levels.length)],
            link: randomHusband.link
        });
    }

    // Random một thử thách
    const random = allChallenges[Math.floor(Math.random() * allChallenges.length)];
    dailyChallengeState.currentChallenge = random;
    
    // Random màu nhấn
    const accentColors = ["#f0d68d", "#7bed9f", "#ff6b6b", "#ffa502", "#70a1ff", "#ffd93d"];
    const accentColor = accentColors[Math.floor(Math.random() * accentColors.length)];

    // =====================================================
    // TẠO MODAL VỚI HIỆU ỨNG
    // =====================================================
    showModal("⚔️", "⚡ DAILY CHALLENGE ⚡", `
        <div style="text-align: center; position: relative; overflow: hidden;">
            <!-- Sparkle background -->
            <div style="position: absolute; top: -50px; left: -50px; right: -50px; bottom: -50px; pointer-events: none; opacity: 0.1; background: radial-gradient(circle at 30% 40%, ${accentColor} 0%, transparent 70%); z-index: 0;"></div>
            
            <!-- Content -->
            <div style="position: relative; z-index: 1;">
                <!-- Emoji và vibe -->
                <div style="font-size: 56px; margin: 5px 0; animation: pulse 1.5s ease-in-out infinite;">
                    ${random.vibe}
                </div>
                
                <!-- Cấp độ thử thách với màu sắc -->
                <div style="font-size: 12px; color: ${accentColor}; letter-spacing: 3px; margin-bottom: 5px; font-weight: 600; text-transform: uppercase; border: 1px solid ${accentColor}22; display: inline-block; padding: 4px 16px; border-radius: 20px; background: ${accentColor}11;">
                    ${random.level === 'extreme' ? '⚡ CẤP ĐỘ: BÁ ĐẠO' : 
                      random.level === 'spicy' ? '🌶️ CẤP ĐỘ: GIA VỊ' :
                      random.level === 'cheeky' ? '😈 CẤP ĐỘ: TINH QUÁI' :
                      random.level === 'romantic' ? '💕 CẤP ĐỘ: LÃNG MẠN' :
                      random.level === 'fun' ? '🎵 CẤP ĐỘ: GIẢI TRÍ' :
                      '🤪 CẤP ĐỘ: ĐIÊN RỒ'}
                </div>
                
                <!-- Nội dung thử thách với hiệu ứng -->
                <div style="
                    font-size: 18px; 
                    color: #f0d68d; 
                    margin: 15px 0; 
                    line-height: 1.8; 
                    padding: 20px 18px; 
                    background: linear-gradient(135deg, rgba(214, 169, 66, 0.05), rgba(214, 169, 66, 0.01));
                    border-radius: 16px; 
                    border-left: 4px solid ${accentColor};
                    border-right: 4px solid ${accentColor}44;
                    box-shadow: 0 0 30px ${accentColor}08;
                    transition: all 0.3s ease;
                    animation: glowPulse 2s ease-in-out infinite;
                ">
                    "${random.text}"
                </div>
                
                <!-- Dành cho ai -->
                <div style="font-size: 15px; color: rgba(233, 210, 146, 0.4); margin-top: 5px;">
                    🎯 Dành cho: <strong style="color: #f0d68d;">${random.husband}</strong> ${random.emoji}
                </div>
                
                <!-- Số lượng thử thách -->
                <div style="font-size: 11px; color: rgba(233, 210, 146, 0.1); margin-top: 5px; letter-spacing: 1px;">
                    📋 ${allChallenges.length}+ thử thách đang chờ • ✦ Mỗi ngày mới ✦
                </div>
                
                <!-- NÚT HÀNH ĐỘNG với hiệu ứng -->
                <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 14px; align-items: center;">
                    <!-- Nút CHAN BỐ MÀY ĐI -->
                    <button onclick="dailyChallengeGoToChat('${random.link}')" style="
                        width: 90%;
                        padding: 16px 20px;
                        background: linear-gradient(135deg, ${accentColor}33, ${accentColor}11);
                        border: 2px solid ${accentColor};
                        border-radius: 14px;
                        color: #f0d68d;
                        font-family: 'Be Vietnam Pro', sans-serif;
                        font-size: 16px;
                        font-weight: 700;
                        letter-spacing: 3px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 14px;
                        box-shadow: 0 0 30px ${accentColor}22;
                    "
                    onmouseover="this.style.background='linear-gradient(135deg, ${accentColor}55, ${accentColor}22)'; this.style.transform='scale(1.03)'; this.style.boxShadow='0 0 50px ${accentColor}44'"
                    onmouseout="this.style.background='linear-gradient(135deg, ${accentColor}33, ${accentColor}11)'; this.style.transform='scale(1)'; this.style.boxShadow='0 0 30px ${accentColor}22'"
                    >
                        <span style="font-size: 24px;">⚡</span>
                        CHAN BỐ MÀY ĐI
                        <span style="font-size: 14px; opacity: 0.6;">→</span>
                    </button>
                    
                    <!-- Nút TÔI QUÁ YẾU -->
                    <button onclick="dailyChallengeNext()" style="
                        width: 90%;
                        padding: 14px 20px;
                        background: rgba(255, 107, 107, 0.05);
                        border: 1.5px solid rgba(255, 107, 107, 0.15);
                        border-radius: 14px;
                        color: rgba(233, 210, 146, 0.4);
                        font-family: 'Be Vietnam Pro', sans-serif;
                        font-size: 13px;
                        font-weight: 400;
                        letter-spacing: 1px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                    "
                    onmouseover="this.style.background='rgba(255, 107, 107, 0.1)'; this.style.borderColor='rgba(255, 107, 107, 0.3)'; this.style.color='rgba(233, 210, 146, 0.6)'"
                    onmouseout="this.style.background='rgba(255, 107, 107, 0.05)'; this.style.borderColor='rgba(255, 107, 107, 0.15)'; this.style.color='rgba(233, 210, 146, 0.4)'"
                    >
                        <span style="font-size: 20px;">🧎</span>
                        TÔI QUÁ YẾU
                        <span style="font-size: 16px; opacity: 0.3;">(quỳ xuống...)</span>
                    </button>
                </div>
                
                <!-- Footer -->
                <div style="margin-top: 18px; font-size: 9px; color: rgba(233, 210, 146, 0.06); letter-spacing: 1px; animation: fadeInOut 3s ease-in-out infinite;">
                    ✦ Đừng sợ thử thách • Hãy sống hết mình vì yêu ✦
                </div>
            </div>
        </div>
        
        <style>
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.15); }
            }
            @keyframes glowPulse {
                0%, 100% { box-shadow: 0 0 30px ${accentColor}08; }
                50% { box-shadow: 0 0 50px ${accentColor}22; }
            }
            @keyframes fadeInOut {
                0%, 100% { opacity: 0.06; }
                50% { opacity: 0.2; }
            }
        </style>
    `);
}

// =====================================================
// DAILY CHALLENGE: ĐI TỚI CHAT
// =====================================================
window.dailyChallengeGoToChat = function(link) {
    // Hiệu ứng click
    const btn = event.currentTarget;
    btn.style.transform = 'scale(0.95)';
    btn.style.background = 'rgba(214, 169, 66, 0.3)';
    setTimeout(() => {
        window.open(link, '_blank');
        btn.style.transform = 'scale(1)';
    }, 200);
};

// =====================================================
// DAILY CHALLENGE: THỬ THÁCH TIẾP THEO
// =====================================================
window.dailyChallengeNext = function() {
    // Hiệu ứng click
    const btn = event.currentTarget;
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
        handleDailyChallenge();
    }, 200);
};

// =====================================================
// THÊM HIỆU ỨNG SPARKLE NGẪU NHIÊN
// =====================================================
// Tự động tạo sparkles khi mở modal
document.addEventListener('DOMContentLoaded', function() {
    // Theo dõi modal mở để thêm sparkles
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.classList && mutation.target.classList.contains('open')) {
                setTimeout(function() {
                    createSparkles();
                }, 300);
            }
        });
    });
    
    const modal = document.getElementById('featureModal');
    if (modal) {
        observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
    }
});

function createSparkles() {
    const modalContent = document.querySelector('.feature-modal-content');
    if (!modalContent) return;
    
    const colors = ['#f0d68d', '#7bed9f', '#ff6b6b', '#ffd93d', '#70a1ff', '#ffa502'];
    for (let i = 0; i < 12; i++) {
        const sparkle = document.createElement('div');
        const size = 4 + Math.random() * 8;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const x = 5 + Math.random() * 90;
        const y = 5 + Math.random() * 90;
        const duration = 1.5 + Math.random() * 2;
        const delay = Math.random() * 2;
        
        sparkle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            top: ${y}%;
            left: ${x}%;
            pointer-events: none;
            z-index: 0;
            box-shadow: 0 0 ${size * 2}px ${color}44;
            animation: sparkleFloat ${duration}s ease-in-out ${delay}s infinite;
        `;
        modalContent.appendChild(sparkle);
        
        // Tự xóa sau khi animation kết thúc
        setTimeout(function() {
            if (sparkle.parentNode) {
                sparkle.remove();
            }
        }, (duration + delay) * 1000 + 500);
    }
}

// Thêm CSS cho sparkle
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkleFloat {
        0% { transform: translate(0, 0) scale(0); opacity: 0; }
        20% { transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px) scale(1.5); opacity: 1; }
        80% { transform: translate(${Math.random() * 30 - 15}px, ${Math.random() * 30 - 15}px) scale(0.8); opacity: 0.8; }
        100% { transform: translate(0, 0) scale(0); opacity: 0; }
    }
`;
document.head.appendChild(sparkleStyle);

// =====================================================
// 8. FEATURE 5: TÀI XỈU — BẢN SỬA (TỰ NHẬP TIỀN + LƯU LỊCH SỬ)
// =====================================================

// State game
let taiXiuState = {
    balance: 100,  // SỐ DƯ BAN ĐẦU LÀ 100
    round: 0,
    history: [],
    isPlaying: false,
    playerChoice: null,
    betAmount: 0,
    diceResult: null,
    total: 0,
    result: '',
    isWin: false,
    isRolling: false,
    dealer: null,
    dealerMessage: '',
    currentBet: 0
};

// Danh sách nhà cái (THÊM NHÀ CÁI MỚI)
const DEALERS = [
    { 
        name: "MADAME LUCKY", 
        emoji: "🦋", 
        style: "quý phái",
        messages: {
            win: ["Trời ơi! Con bài của ngươi may mắn thật đấy!", "Ngươi có bùa hộ mệnh à? Thua rồi!", "Lần này ngươi thắng, nhưng đừng có mừng vội!"],
            lose: ["Ha ha! Ta biết ngươi sẽ chọn sai mà!", "Nhà cái luôn thắng! Nhớ lấy!", "Ngươi còn non lắm! Học lại đi!"],
            neutral: ["Mời ngươi đặt cược! Ta sẽ xem ngươi có dũng khí không!", "Đừng run tay! Đặt đi!"]
        }
    },
    { 
        name: "BIG BOSS", 
        emoji: "👔", 
        style: "lạnh lùng",
        messages: {
            win: ["... Có gì đó không đúng. Ngươi may mắn đấy.", "Ta công nhận lần này ngươi thắng.", "Được thôi, lần này là của ngươi."],
            lose: ["Ta đã nói rồi. Ngươi không thể thắng ta.", "Tiếp tục đi. Ta sẽ lấy lại tất cả.", "May mắn không đứng về phía ngươi hôm nay."],
            neutral: ["Đặt đi. Đừng lãng phí thời gian của ta.", "Chọn nhanh lên. Ta không có cả ngày."]
        }
    },
    { 
        name: "MADAM ROSIE", 
        emoji: "💄", 
        style: "quyến rũ",
        messages: {
            win: ["Oh la la! Ngươi giỏi thật đấy! Có bí quyết gì không?", "Thắng rồi kìa! Mừng cho ngươi!", "Ta thích ngươi! Ngươi có bản lĩnh!"],
            lose: ["Ôi trời! Ngươi thua rồi! Đừng khóc nhé!", "Lần sau may hơn nha! Cố lên!", "Thua là chuyện thường mà! Đừng buồn!"],
            neutral: ["Đặt đi em yêu! Ta sẽ chăm sóc ngươi!", "Chọn Tài hay Xỉu? Để ta xem ngươi có dũng khí không!"]
        }
    },
    { 
        name: "UNCLE GAMBLER", 
        emoji: "🃏", 
        style: "vui tính",
        messages: {
            win: ["Ố ồ! Ngươi ăn may quá đấy! Uống bia không?", "Thắng rồi! Nhưng đừng có nghiện đấy!", "May mắn thế! Chắc ngươi có hẹn hò với thần may mắn!"],
            lose: ["Ha ha! Thua rồi! Uống cốc bia giải sầu đi!", "Đừng buồn! Có thua mới biết thắng!", "Tiếp tục đi! Ta sẽ cho ngươi cơ hội!"],
            neutral: ["Nào nào! Đặt cược đi! Đừng ngại!", "Chơi hay không? Ta đang nóng lòng đây!"]
        }
    },
    // =====================================================
    // NHÀ CÁI MỚI: em An nhà cái số 1 đến từ Châu Á
    // =====================================================
    { 
        name: "em An — nhà cái số 1 đến từ Châu Á", 
        emoji: "🌸", 
        style: "quyến rũ - châu Á",
        messages: {
            win: ["Ối giời ơi! Bồ giỏi quá! Tui phải học hỏi bồ mới được!", "I cư i cư", "Trời ơi người đẹp thắng rồi! Cho hỏi bồ đến từ hành tinh nào vậy!", "Anh may mắn quá! Chắc anh có duyên với em rồi đó!", "SIUUUUUUUU"],
            lose: ["Cục dàng thua rồi! Nhưng đừng buồn, thua kèo này ta bày kèo khác!", "Ôi người đẹp! Thua cũng đừng nản nhé! Tui tin bồ mà!", "Hãy như CR7, thua nhưng không được luyến tiếc!", "Cái gì mà xui dữ vậy"],
            neutral: ["Đặt cược đi nào! Bạn sợ à!", "Chọn Tài hay Xỉu đi babi! em An sẽ đứng về phía bạn!", "Babi muốn chơi gì nè?", "Nào nào đừng ngại! mình sẽ chiều bạn mà!"]
        }
    }
];

// =====================================================
// HÀM CHÍNH - handleTaiXiu
// =====================================================
window.handleTaiXiu = function() {
    if (taiXiuState.round === 0) {
        taiXiuState.balance = 100;  // RESET VỀ 100
        taiXiuState.history = [];
        taiXiuState.isPlaying = false;
    }
    
    const dealer = DEALERS[Math.floor(Math.random() * DEALERS.length)];
    taiXiuState.dealer = dealer;
    
    const greetMsg = dealer.messages.neutral[Math.floor(Math.random() * dealer.messages.neutral.length)];
    
    // Tạo lịch sử với đầy đủ thông tin
    let historyHTML = '';
    if (taiXiuState.history.length > 0) {
        historyHTML = `
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(214, 169, 66, 0.1); max-height: 120px; overflow-y: auto;">
                <div style="font-size: 10px; color: rgba(233, 210, 146, 0.2); letter-spacing: 1px; margin-bottom: 5px; text-align: center;">
                    📜 LỊCH SỬ CƯỢC (${taiXiuState.history.length} VÁN)
                </div>
                <div style="display: flex; flex-direction: column; gap: 3px; padding: 0 5px;">
                    ${taiXiuState.history.slice(-15).reverse().map(function(h) {
                        return '<div style="display: flex; justify-content: space-between; padding: 3px 8px; border-radius: 4px; font-size: 11px; background: ' + (h.isWin ? 'rgba(123, 237, 159, 0.1)' : 'rgba(255, 107, 107, 0.1)') + '; color: ' + (h.isWin ? '#7bed9f' : '#ff6b6b') + ';">' +
                            '<span>#' + h.round + ' ' + h.choice.toUpperCase() + ' → ' + h.result + '</span>' +
                            '<span>' + (h.isWin ? '+$' + h.winAmount : '-$' + h.bet) + '</span>' +
                        '</div>';
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    let bodyHTML = `
        <div style="text-align: center; max-height: 85vh; overflow-y: auto; padding-right: 5px;">
            <div style="font-size: 13px; color: rgba(233, 210, 146, 0.3); letter-spacing: 2px; margin-bottom: 5px;">
                SÒNG BẠC QUÝ TỘC
            </div>
            <div style="font-size: 28px; margin: 5px 0;">
                ${dealer.emoji}
            </div>
            <div style="font-size: 18px; font-family: 'Cormorant Garamond', serif; color: #f0d68d; margin: 2px 0;">
                ${dealer.name}
            </div>
            <div style="font-size: 12px; color: rgba(233, 210, 146, 0.3); font-style: italic; margin-bottom: 10px;">
                "${greetMsg}"
            </div>
            
            <!-- Thông tin số dư và thống kê -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 8px 0; padding: 8px; background: rgba(214, 169, 66, 0.05); border-radius: 8px;">
                <div>
                    <div style="font-size: 9px; color: rgba(233, 210, 146, 0.3);">💰 SỐ DƯ</div>
                    <div style="font-size: 18px; color: #f0d68d; font-weight: bold;">$${taiXiuState.balance}</div>
                </div>
                <div>
                    <div style="font-size: 9px; color: rgba(233, 210, 146, 0.3);">🎯 HIỆP</div>
                    <div style="font-size: 18px; color: #f0d68d; font-weight: bold;">${taiXiuState.round}</div>
                </div>
                <div>
                    <div style="font-size: 9px; color: rgba(233, 210, 146, 0.3);">📊 THẮNG</div>
                    <div style="font-size: 18px; color: #7bed9f; font-weight: bold;">
                        ${taiXiuState.history.filter(function(h) { return h.isWin; }).length}
                        <span style="font-size: 11px; color: rgba(233, 210, 146, 0.2);">
                            / ${taiXiuState.history.length || 1}
                        </span>
                    </div>
                </div>
            </div>
            
            <!-- Khu vực đặt cược -->
            <div style="margin: 10px 0;">
                <div style="font-size: 13px; color: rgba(233, 210, 146, 0.4); margin-bottom: 6px;">
                    💰 NHẬP SỐ TIỀN CƯỢC
                </div>
                <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
                    <input type="number" id="betAmountInput" 
                        value="${Math.min(10, taiXiuState.balance)}" 
                        min="1" 
                        max="${taiXiuState.balance}" 
                        style="
                            width: 120px;
                            padding: 8px 12px;
                            background: rgba(20, 17, 11, 0.8);
                            border: 1px solid rgba(214, 169, 66, 0.3);
                            border-radius: 8px;
                            color: #f0d68d;
                            font-family: 'Be Vietnam Pro', sans-serif;
                            font-size: 16px;
                            font-weight: bold;
                            text-align: center;
                            outline: none;
                        "
                        onchange="taiXiuValidateBet(this)"
                    >
                    <div style="display: flex; gap: 4px;">
                        <button onclick="taiXiuSetBet(10)" style="padding: 6px 10px; background: rgba(214, 169, 66, 0.1); border: 1px solid rgba(214, 169, 66, 0.2); border-radius: 4px; color: rgba(233, 210, 146, 0.5); font-size: 10px; cursor: pointer;">10</button>
                        <button onclick="taiXiuSetBet(25)" style="padding: 6px 10px; background: rgba(214, 169, 66, 0.1); border: 1px solid rgba(214, 169, 66, 0.2); border-radius: 4px; color: rgba(233, 210, 146, 0.5); font-size: 10px; cursor: pointer;">25</button>
                        <button onclick="taiXiuSetBet(50)" style="padding: 6px 10px; background: rgba(214, 169, 66, 0.1); border: 1px solid rgba(214, 169, 66, 0.2); border-radius: 4px; color: rgba(233, 210, 146, 0.5); font-size: 10px; cursor: pointer;">50</button>
                        <button onclick="taiXiuSetBet(100)" style="padding: 6px 10px; background: rgba(214, 169, 66, 0.1); border: 1px solid rgba(214, 169, 66, 0.2); border-radius: 4px; color: rgba(233, 210, 146, 0.5); font-size: 10px; cursor: pointer;">100</button>
                        <button onclick="taiXiuSetBet('all')" style="padding: 6px 10px; background: rgba(255, 107, 107, 0.1); border: 1px solid rgba(255, 107, 107, 0.2); border-radius: 4px; color: rgba(255, 107, 107, 0.5); font-size: 9px; cursor: pointer;">ALL</button>
                    </div>
                </div>
                <div style="font-size: 10px; color: rgba(233, 210, 146, 0.15); margin-top: 4px;">
                    Số dư hiện tại: $${taiXiuState.balance}
                </div>
            </div>
            
            <!-- Nút chọn cửa cược -->
            <div style="margin: 8px 0;">
                <div style="font-size: 13px; color: rgba(233, 210, 146, 0.4); margin-bottom: 6px;">
                    🎲 CHỌN CỬA CƯỢC
                </div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button onclick="taiXiuPlaceBet('tai')" class="bet-btn" style="
                        padding: 12px 30px;
                        background: rgba(123, 237, 159, 0.1);
                        border: 2px solid rgba(123, 237, 159, 0.3);
                        border-radius: 12px;
                        color: #7bed9f;
                        font-family: 'Be Vietnam Pro', sans-serif;
                        font-size: 15px;
                        font-weight: bold;
                        letter-spacing: 2px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">🔼 TÀI</button>
                    <button onclick="taiXiuPlaceBet('xiu')" class="bet-btn" style="
                        padding: 12px 30px;
                        background: rgba(255, 107, 107, 0.1);
                        border: 2px solid rgba(255, 107, 107, 0.3);
                        border-radius: 12px;
                        color: #ff6b6b;
                        font-family: 'Be Vietnam Pro', sans-serif;
                        font-size: 15px;
                        font-weight: bold;
                        letter-spacing: 2px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">🔽 XỈU</button>
                </div>
                <div style="font-size: 10px; color: rgba(233, 210, 146, 0.15); margin-top: 4px;">
                    Tài: 11-18 | Xỉu: 3-10
                </div>
            </div>
            
            <!-- Khu vực kết quả -->
            <div id="taiXiuResultArea" style="margin: 8px 0; min-height: 80px;">
                <div style="font-size: 14px; color: rgba(233, 210, 146, 0.3);">
                    🎯 Nhập tiền cược và chọn cửa để bắt đầu!
                </div>
            </div>
            
            <!-- Lịch sử chi tiết -->
            ${historyHTML}
            
            <!-- Nút chơi lại -->
            <div style="margin-top: 10px;">
                <button onclick="taiXiuReset()" style="
                    padding: 8px 25px;
                    background: rgba(214, 169, 66, 0.05);
                    border: 1px solid rgba(214, 169, 66, 0.2);
                    border-radius: 8px;
                    color: rgba(233, 210, 146, 0.5);
                    font-family: 'Be Vietnam Pro', sans-serif;
                    font-size: 10px;
                    letter-spacing: 2px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">🔄 CHƠI LẠI TỪ ĐẦU</button>
            </div>
        </div>
    `;
    
    showModal("🎲", "TÀI XỈU — THE HOUSE OF FATE", bodyHTML);
};

// =====================================================
// VALIDATE SỐ TIỀN CƯỢC
// =====================================================
window.taiXiuValidateBet = function(input) {
    let val = parseInt(input.value);
    if (isNaN(val) || val < 1) {
        input.value = 1;
    } else if (val > taiXiuState.balance) {
        input.value = taiXiuState.balance;
    }
    taiXiuState.currentBet = parseInt(input.value);
};

// =====================================================
// ĐẶT SỐ TIỀN CƯỢC NHANH
// =====================================================
window.taiXiuSetBet = function(amount) {
    const input = document.getElementById("betAmountInput");
    if (!input) return;
    
    if (amount === 'all') {
        input.value = taiXiuState.balance;
    } else {
        input.value = Math.min(amount, taiXiuState.balance);
    }
    taiXiuState.currentBet = parseInt(input.value);
};

// =====================================================
// ĐẶT CƯỢC
// =====================================================
window.taiXiuPlaceBet = function(choice) {
    if (taiXiuState.isRolling) {
        showTaiXiuResult("⏳ Đang đổ xúc xắc! Đợi xíu nha!", "#ffa502");
        return;
    }
    
    if (taiXiuState.balance <= 0) {
        showTaiXiuResult("💸 Bạn đã hết tiền! Bấm 'CHƠI LẠI TỪ ĐẦU' để bắt đầu lại!", "#ff6b6b");
        return;
    }
    
    // Lấy số tiền cược từ input
    const input = document.getElementById("betAmountInput");
    if (!input) {
        showTaiXiuResult("⚠️ Lỗi! Không tìm thấy ô nhập tiền!", "#ff6b6b");
        return;
    }
    
    let betAmount = parseInt(input.value);
    if (isNaN(betAmount) || betAmount < 1) {
        showTaiXiuResult("⚠️ Vui lòng nhập số tiền cược hợp lệ!", "#ffa502");
        return;
    }
    
    if (betAmount > taiXiuState.balance) {
        showTaiXiuResult("⚠️ Số tiền cược vượt quá số dư!", "#ffa502");
        return;
    }
    
    const finalBet = betAmount;
    taiXiuState.playerChoice = choice;
    taiXiuState.betAmount = finalBet;
    taiXiuState.isRolling = true;
    
    var emojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    var rollCount = 0;
    var maxRolls = 8 + Math.floor(Math.random() * 5);
    
    showTaiXiuResult(`
        <div style="font-size: 14px; color: rgba(233, 210, 146, 0.5);">
            🎲 Đang đổ xúc xắc...
        </div>
        <div style="font-size: 48px; margin: 8px 0; letter-spacing: 10px;" id="diceDisplay">
            ${emojis[Math.floor(Math.random() * 6)]} ${emojis[Math.floor(Math.random() * 6)]} ${emojis[Math.floor(Math.random() * 6)]}
        </div>
        <div style="font-size: 13px; color: rgba(233, 210, 146, 0.3);">
            ⏳ Đặt cược $${finalBet} vào <strong>${choice === 'tai' ? 'TÀI' : 'XỈU'}</strong>
        </div>
    `, "#ffa502");
    
    var interval = setInterval(function() {
        var d1 = Math.floor(Math.random() * 6);
        var d2 = Math.floor(Math.random() * 6);
        var d3 = Math.floor(Math.random() * 6);
        var diceDisplay = document.getElementById("diceDisplay");
        if (diceDisplay) {
            diceDisplay.innerHTML = emojis[d1] + ' ' + emojis[d2] + ' ' + emojis[d3];
        }
        rollCount++;
        
        if (rollCount >= maxRolls) {
            clearInterval(interval);
            
            var finalD1 = Math.floor(Math.random() * 6) + 1;
            var finalD2 = Math.floor(Math.random() * 6) + 1;
            var finalD3 = Math.floor(Math.random() * 6) + 1;
            var total = finalD1 + finalD2 + finalD3;
            var result = total >= 11 ? 'TÀI' : 'XỈU';
            var isWin = (choice === 'tai' && result === 'TÀI') || (choice === 'xiu' && result === 'XỈU');
            
            taiXiuState.total = total;
            taiXiuState.result = result;
            taiXiuState.isWin = isWin;
            taiXiuState.diceResult = [finalD1, finalD2, finalD3];
            
            var winAmount = 0;
            if (isWin) {
                winAmount = finalBet * 2;
                taiXiuState.balance += winAmount;
            } else {
                taiXiuState.balance -= finalBet;
            }
            
            taiXiuState.round++;
            taiXiuState.history.push({
                choice: choice,
                result: result,
                total: total,
                isWin: isWin,
                bet: finalBet,
                winAmount: winAmount,
                round: taiXiuState.round
            });
            
            taiXiuState.isRolling = false;
            
            var dealer = taiXiuState.dealer;
            var msgPool = isWin ? dealer.messages.win : dealer.messages.lose;
            var msg = msgPool[Math.floor(Math.random() * msgPool.length)];
            
            setTimeout(function() {
                var diceDisplay2 = document.getElementById("diceDisplay");
                if (diceDisplay2) {
                    diceDisplay2.innerHTML = emojis[finalD1-1] + ' ' + emojis[finalD2-1] + ' ' + emojis[finalD3-1];
                    diceDisplay2.style.transform = 'scale(1.2)';
                    setTimeout(function() {
                        diceDisplay2.style.transform = 'scale(1)';
                    }, 300);
                }
            }, 100);
            
            showTaiXiuResult(`
                <div style="font-size: 14px; color: ${isWin ? '#7bed9f' : '#ff6b6b'}; font-weight: bold;">
                    ${isWin ? '🎉 THẮNG!' : '😢 THUA!'}
                </div>
                <div style="font-size: 48px; margin: 8px 0; letter-spacing: 10px;" id="diceDisplay">
                    ${emojis[finalD1-1]} ${emojis[finalD2-1]} ${emojis[finalD3-1]}
                </div>
                <div style="font-size: 20px; font-family: 'Cormorant Garamond', serif; color: ${isWin ? '#7bed9f' : '#ff6b6b'};">
                    Tổng: <strong>${total}</strong> — <strong>${result}</strong>
                </div>
                <div style="font-size: 14px; color: rgba(233, 210, 146, 0.7); margin-top: 5px;">
                    ${msg}
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 8px 0; padding: 8px; background: rgba(214, 169, 66, 0.05); border-radius: 8px;">
                    <div>
                        <div style="font-size: 9px; color: rgba(233, 210, 146, 0.3);">CƯỢC</div>
                        <div style="font-size: 16px; color: #f0d68d;">$${finalBet}</div>
                    </div>
                    <div>
                        <div style="font-size: 9px; color: rgba(233, 210, 146, 0.3);">${isWin ? '💎 THẮNG' : '💸 MẤT'}</div>
                        <div style="font-size: 16px; color: ${isWin ? '#7bed9f' : '#ff6b6b'};">
                            ${isWin ? '+$' + winAmount : '-$' + finalBet}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 9px; color: rgba(233, 210, 146, 0.3);">💰 SỐ DƯ</div>
                        <div style="font-size: 16px; color: #f0d68d;">$${taiXiuState.balance}</div>
                    </div>
                </div>
                <button onclick="handleTaiXiu()" style="
                    margin-top: 8px;
                    padding: 10px 30px;
                    background: rgba(214, 169, 66, 0.15);
                    border: 1px solid rgba(214, 169, 66, 0.4);
                    border-radius: 8px;
                    color: #f0d68d;
                    font-family: 'Be Vietnam Pro', sans-serif;
                    font-size: 11px;
                    letter-spacing: 2px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">🎲 HIỆP MỚI</button>
            `, isWin ? '#7bed9f' : '#ff6b6b');
        }
    }, 100);
};

// =====================================================
// HIỂN THỊ KẾT QUẢ TẠM THỜI
// =====================================================
function showTaiXiuResult(html, color) {
    var area = document.getElementById("taiXiuResultArea");
    if (area) {
        if (color) area.style.color = color;
        area.innerHTML = html;
    }
}

// =====================================================
// RESET GAME
// =====================================================
window.taiXiuReset = function() {
    taiXiuState = {
        balance: 100,
        round: 0,
        history: [],
        isPlaying: false,
        playerChoice: null,
        betAmount: 0,
        diceResult: null,
        total: 0,
        result: '',
        isWin: false,
        isRolling: false,
        dealer: null,
        dealerMessage: '',
        currentBet: 0
    };
    handleTaiXiu();
};

// =====================================================
// ÂM THANH CHO TÀI XỈU
// =====================================================
function playTaiXiuSound(type) {
    try {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var oscillator = ctx.createOscillator();
        var gain = ctx.createGain();
        
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        
        var frequency = 440;
        var duration = 0.1;
        
        switch(type) {
            case 'bet':
                frequency = 600;
                duration = 0.15;
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                oscillator.type = 'sine';
                break;
            case 'roll':
                frequency = 300 + Math.random() * 400;
                duration = 0.05;
                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                oscillator.type = 'square';
                break;
            case 'win':
                frequency = 880;
                duration = 0.2;
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                oscillator.type = 'sine';
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
                break;
            case 'lose':
                frequency = 220;
                duration = 0.3;
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                oscillator.type = 'sawtooth';
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
                break;
            default:
                return;
        }
        
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
        
    } catch(e) {
        // Bỏ qua lỗi audio
    }
}

// =====================================================
// 9. FEATURE 6: IELTS CHALLENGE — BẢN FULL (A2 → C1 + TỔNG KẾT 9.0)
// =====================================================
let ieltsScore = 0;
let ieltsTotal = 0;
let ieltsAnswers = [];
let ieltsRound = 0;
const MAX_QUESTIONS = 10;

// =====================================================
// HÀM CHÍNH - handleIelts
// =====================================================
window.handleIelts = function() {
    // Nếu đã đủ 10 câu -> hiển thị tổng kết
    if (ieltsTotal >= MAX_QUESTIONS) {
        showIeltsResult();
        return;
    }

    // Tạo câu hỏi mới với độ khó ngẫu nhiên A2 → C1
    const questions = generateIeltsQuestions();
    const random = questions[Math.floor(Math.random() * questions.length)];
    
    let bodyHTML = `
        <div style="font-size: 13px; color: rgba(233, 210, 146, 0.4); margin-bottom: 8px; letter-spacing: 2px;">
            🎯 ${random.type} ${random.difficulty || '⚡'} — ${random.topic}
            <span style="float: right; color: rgba(233, 210, 146, 0.2);">
                ${ieltsTotal + 1}/${MAX_QUESTIONS}
            </span>
        </div>
        ${random.passage ? `<div style="font-size: 14px; color: rgba(233, 210, 146, 0.5); margin: 8px 0; padding: 15px; background: rgba(214, 169, 66, 0.05); border-radius: 8px; text-align: left; font-style: italic; border-left: 2px solid rgba(214, 169, 66, 0.2);">📖 "${random.passage}"</div>` : ''}
        <div style="font-size: 17px; color: #f0d68d; margin: 10px 0; line-height: 1.6; padding: 15px; background: rgba(214, 169, 66, 0.05); border-radius: 10px; border-left: 2px solid rgba(214, 169, 66, 0.3);">
            ${random.question}
        </div>
    `;

    // Xử lý các loại câu hỏi
    if (random.isQuiz) {
        // QUIZ — 4 đáp án
        bodyHTML += `
            <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px; align-items: center;">
                ${random.options.map((opt, idx) => `
                    <button onclick="handleIeltsAnswer(${idx}, ${random.correctIndex}, '${random.type}')" 
                            class="ielts-option" 
                            data-index="${idx}"
                            style="
                                padding: 10px 20px; 
                                width: 85%; 
                                background: rgba(214, 169, 66, 0.05); 
                                border: 1px solid rgba(214, 169, 66, 0.2); 
                                border-radius: 8px; 
                                color: rgba(233, 210, 146, 0.8); 
                                font-family: 'Be Vietnam Pro', sans-serif; 
                                font-size: 13px; 
                                cursor: pointer;
                                transition: all 0.3s ease;
                                text-align: left;
                            "
                            onmouseover="this.style.background='rgba(214, 169, 66, 0.12)'"
                            onmouseout="this.style.background='rgba(214, 169, 66, 0.05)'"
                    >${String.fromCharCode(65 + idx)}. ${opt}</button>
                `).join('')}
                <div id="ieltsResult" style="font-size: 15px; margin-top: 10px; min-height: 30px;"></div>
            </div>
        `;
        // Lưu câu hỏi hiện tại để xử lý
        window._currentIeltsQuestion = random;
        window._currentIsQuiz = true;
        
    } else if (random.hasInput && !random.isOpen) {
        // GRAMMAR / FILL IN THE BLANK
        bodyHTML += `
            <div style="margin-top: 12px;">
                <input type="text" id="ieltsInput" placeholder="Nhập câu trả lời của bạn..." style="
                    width: 85%; 
                    padding: 12px 18px; 
                    background: rgba(20, 17, 11, 0.8); 
                    border: 1px solid rgba(214, 169, 66, 0.3); 
                    border-radius: 8px; 
                    color: #f0d68d; 
                    font-family: 'Be Vietnam Pro', sans-serif; 
                    font-size: 14px; 
                    text-align: center; 
                    outline: none;
                ">
                <div style="margin-top: 10px; display: flex; gap: 10px; justify-content: center;">
                    <button onclick="handleIeltsFillBlank('${random.answer || ''}')" style="
                        padding: 8px 25px; 
                        background: rgba(214, 169, 66, 0.15); 
                        border: 1px solid rgba(214, 169, 66, 0.4); 
                        border-radius: 8px; 
                        color: #f0d68d; 
                        font-family: 'Be Vietnam Pro', sans-serif; 
                        font-size: 11px; 
                        letter-spacing: 2px; 
                        cursor: pointer;
                    ">📝 KIỂM TRA</button>
                </div>
                <div id="ieltsResult" style="font-size: 15px; margin-top: 10px; min-height: 30px;"></div>
            </div>
        `;
        window._currentIeltsQuestion = random;
        window._currentIsQuiz = false;
        
    } else if (random.isOpen) {
        // SPEAKING / WRITING
        const label = random.type === 'Speaking' ? '💬 Ghi âm hoặc viết câu trả lời của bạn' : '✍️ Viết câu trả lời của bạn';
        bodyHTML += `
            <div style="margin-top: 12px;">
                <textarea id="ieltsInput" placeholder="${label}..." style="
                    width: 90%; 
                    min-height: 100px; 
                    padding: 12px 15px; 
                    background: rgba(20, 17, 11, 0.8); 
                    border: 1px solid rgba(214, 169, 66, 0.3); 
                    border-radius: 8px; 
                    color: #f0d68d; 
                    font-family: 'Be Vietnam Pro', sans-serif; 
                    font-size: 13px; 
                    resize: vertical; 
                    outline: none;
                "></textarea>
                <div style="margin-top: 10px; display: flex; gap: 10px; justify-content: center;">
                    <button onclick="handleIeltsOpen()" style="
                        padding: 8px 25px; 
                        background: rgba(214, 169, 66, 0.15); 
                        border: 1px solid rgba(214, 169, 66, 0.4); 
                        border-radius: 8px; 
                        color: #f0d68d; 
                        font-family: 'Be Vietnam Pro', sans-serif; 
                        font-size: 11px; 
                        letter-spacing: 2px; 
                        cursor: pointer;
                    ">📝 NỘP BÀI</button>
                </div>
                <div id="ieltsResult" style="font-size: 15px; margin-top: 10px; min-height: 30px;"></div>
            </div>
        `;
        window._currentIeltsQuestion = random;
        window._currentIsQuiz = false;
    }

    // Hiển thị tiến trình
    bodyHTML += `
        <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid rgba(214, 169, 66, 0.1);">
            <div style="font-size: 11px; color: rgba(233, 210, 146, 0.2); letter-spacing: 1px;">
                📊 ${ieltsScore}/${ieltsTotal} điểm
            </div>
            <div style="font-size: 11px; color: rgba(233, 210, 146, 0.2); letter-spacing: 1px;">
                ⏳ ${ieltsTotal}/${MAX_QUESTIONS} câu
            </div>
        </div>
        <div style="width: 100%; height: 4px; background: rgba(214, 169, 66, 0.1); border-radius: 2px; margin-top: 6px; overflow: hidden;">
            <div style="width: ${(ieltsTotal / MAX_QUESTIONS) * 100}%; height: 100%; background: rgba(214, 169, 66, 0.4); border-radius: 2px; transition: width 0.5s ease;"></div>
        </div>
    `;

    showModal("📖", "IELTS CHALLENGE", bodyHTML);
};

// =====================================================
// TẠO CÂU HỎI ĐA DẠNG A2 → C1
// =====================================================
function generateIeltsQuestions() {
    const levels = ['A2', 'B1', 'B2', 'C1'];
    
    // Từ vựng theo cấp độ
    const vocabulary = {
        A2: { words: ['love', 'happy', 'sad', 'big', 'small', 'good', 'bad', 'beautiful', 'ugly'], synonyms: ['like', 'joyful', 'unhappy', 'large', 'tiny', 'great', 'terrible', 'pretty', 'hideous'] },
        B1: { words: ['affection', 'passion', 'devotion', 'commitment', 'compromise', 'adore', 'cherish', 'romantic'], synonyms: ['fondness', 'intensity', 'loyalty', 'dedication', 'settlement', 'worship', 'treasure', 'loving'] },
        B2: { words: ['intimacy', 'vulnerability', 'unconditional', 'profound', 'eternal', 'fate', 'destiny', 'soulmate'], synonyms: ['closeness', 'openness', 'absolute', 'deep', 'everlasting', 'fortune', 'karma', 'twin flame'] },
        C1: { words: ['transcend', 'ineffable', 'serendipity', 'quintessential', 'melancholy', 'nostalgia', 'euphoria', 'ardor'], synonyms: ['surpass', 'indescribable', 'chance', 'essential', 'sadness', 'longing', 'elation', 'passion'] }
    };

    const questions = [
        // =================================================
        // SPEAKING (A2 → B2)
        // =================================================
        { 
            type: "Speaking", 
            question: "Describe your ideal partner in 3 sentences. Mô tả người bạn đời lý tưởng của bạn.", 
            topic: "Chồng lý tưởng", 
            hasInput: true, 
            isOpen: true,
            difficulty: "A2"
        },
        { 
            type: "Speaking", 
            question: "Talk about a memorable moment with your loved one. Hãy kể về một khoảnh khắc đáng nhớ với người bạn yêu.", 
            topic: "Kỷ niệm đáng nhớ", 
            hasInput: true, 
            isOpen: true,
            difficulty: "B1"
        },
        { 
            type: "Speaking", 
            question: "Discuss the importance of trust in a relationship. Thảo luận về tầm quan trọng của sự tin tưởng trong mối quan hệ.", 
            topic: "Tin tưởng", 
            hasInput: true, 
            isOpen: true,
            difficulty: "B2"
        },
        { 
            type: "Speaking", 
            question: "Describe a difficult decision you made for love. Mô tả một quyết định khó khăn bạn đã làm vì tình yêu.", 
            topic: "Quyết định vì tình yêu", 
            hasInput: true, 
            isOpen: true,
            difficulty: "B2"
        },
        
        // =================================================
        // GRAMMAR (A2 → C1)
        // =================================================
        { 
            type: "Grammar", 
            question: "Điền vào chỗ trống: 'She ___ (study) English for 3 years.'", 
            topic: "Thì hiện tại hoàn thành", 
            hasInput: true, 
            answer: "has studied",
            difficulty: "A2"
        },
        { 
            type: "Grammar", 
            question: "Điền vào chỗ trống: 'If I ___ (be) you, I would tell him the truth.'", 
            topic: "Câu điều kiện loại 2", 
            hasInput: true, 
            answer: "were",
            difficulty: "B1"
        },
        { 
            type: "Grammar", 
            question: "Điền vào chỗ trống: 'He is the man ___ I have been waiting for.'", 
            topic: "Đại từ quan hệ", 
            hasInput: true, 
            answer: "whom",
            difficulty: "B2"
        },
        { 
            type: "Grammar", 
            question: "Điền vào chỗ trống: 'She wished she ___ (know) the answer.'", 
            topic: "Câu ước", 
            hasInput: true, 
            answer: "had known",
            difficulty: "B2"
        },
        { 
            type: "Grammar", 
            question: "Điền vào chỗ trống: 'Had I known earlier, I ___ (help) him.'", 
            topic: "Đảo ngữ câu điều kiện", 
            hasInput: true, 
            answer: "would have helped",
            difficulty: "C1"
        },
        { 
            type: "Grammar", 
            question: "Điền vào chỗ trống: 'It's time we ___ (leave) now.'", 
            topic: "Cấu trúc It's time", 
            hasInput: true, 
            answer: "left",
            difficulty: "B2"
        },
        
        // =================================================
        // READING (B1 → C1)
        // =================================================
        { 
            type: "Reading", 
            question: "What does the word 'fate' mean in this context?", 
            topic: "Từ vựng trong ngữ cảnh", 
            hasInput: false,
            isQuiz: true,
            options: ["Số phận", "May mắn", "Tình yêu", "Lựa chọn"],
            correctIndex: 0,
            passage: "Their love story began in the rain. She was running from the storm when he offered her his umbrella. They met every day after that. But one day, he didn't come. She waited for 3 years. One day, she found a letter in her old coat pocket. It said: 'I have always loved you. Fate brought us together, and fate will bring me back.'",
            difficulty: "B1"
        },
        { 
            type: "Reading", 
            question: "What does the word 'vulnerability' mean in this context?", 
            topic: "Từ vựng nâng cao", 
            hasInput: false,
            isQuiz: true,
            options: ["Sự tổn thương", "Sức mạnh", "Niềm tin", "Tình yêu"],
            correctIndex: 0,
            passage: "True love requires vulnerability. It means opening your heart and accepting that you might get hurt. But without this risk, you can never experience the depth of real connection.",
            difficulty: "B2"
        },
        { 
            type: "Reading", 
            question: "What does the word 'serendipity' mean in this context?", 
            topic: "Từ vựng C1", 
            hasInput: false,
            isQuiz: true,
            options: ["Sự tình cờ may mắn", "Số phận", "Tình yêu định mệnh", "Sự sắp đặt"],
            correctIndex: 0,
            passage: "Their meeting was pure serendipity. Neither of them planned it. They just happened to be at the same place at the same time, and the rest is history.",
            difficulty: "C1"
        },
        { 
            type: "Reading", 
            question: "What is the main idea of this passage?", 
            topic: "Ý chính", 
            hasInput: false,
            isQuiz: true,
            options: ["Tình yêu đòi hỏi sự hy sinh", "Tình yêu là sự lựa chọn", "Tình yêu là định mệnh", "Tình yêu là sự ngẫu nhiên"],
            correctIndex: 0,
            passage: "He gave up everything for her. His career, his money, his status. All he wanted was to see her smile. But she never knew. She thought he was just a kind stranger who happened to be there.",
            difficulty: "B2"
        },
        
        // =================================================
        // WRITING (A2 → C1)
        // =================================================
        { 
            type: "Writing Task 1", 
            question: "Describe your daily routine with your loved one in 100 words. Mô tả thói quen hàng ngày của bạn với người yêu.", 
            topic: "Thói quen hàng ngày", 
            hasInput: true, 
            isOpen: true,
            difficulty: "A2"
        },
        { 
            type: "Writing Task 1", 
            question: "Write a short paragraph about a romantic memory in 150 words. Viết một đoạn văn ngắn về một kỷ niệm lãng mạn.", 
            topic: "Kỷ niệm lãng mạn", 
            hasInput: true, 
            isOpen: true,
            difficulty: "B1"
        },
        { 
            type: "Writing Task 2", 
            question: "Some people believe that love is a choice, not just a feeling. Discuss both views and give your opinion. Nhiều người tin rằng tình yêu là sự lựa chọn, không chỉ là cảm xúc. Bạn nghĩ sao?", 
            topic: "Tình yêu: cảm xúc hay lựa chọn?", 
            hasInput: true, 
            isOpen: true,
            difficulty: "B2"
        },
        { 
            type: "Writing Task 2", 
            question: "Do you agree that 'love is about compromise'? Write an essay supporting your view. Bạn có đồng ý rằng 'tình yêu là sự thỏa hiệp'? Viết một bài luận.", 
            topic: "Thỏa hiệp trong tình yêu", 
            hasInput: true, 
            isOpen: true,
            difficulty: "C1"
        },
        
        // =================================================
        // QUIZ — Từ vựng + Ngữ pháp (A2 → C1)
        // =================================================
        { 
            type: "Quiz", 
            question: "Which word is the SYNONYM of 'happy'?", 
            topic: "Từ đồng nghĩa A2", 
            hasInput: false,
            isQuiz: true,
            options: ["Joyful", "Sad", "Tired", "Angry"],
            correctIndex: 0,
            difficulty: "A2"
        },
        { 
            type: "Quiz", 
            question: "Which word is the ANTONYM of 'love'?", 
            topic: "Từ trái nghĩa A2", 
            hasInput: false,
            isQuiz: true,
            options: ["Hate", "Like", "Adore", "Cherish"],
            correctIndex: 0,
            difficulty: "A2"
        },
        { 
            type: "Quiz", 
            question: "Which word is the SYNONYM of 'affection'?", 
            topic: "Từ đồng nghĩa B1", 
            hasInput: false,
            isQuiz: true,
            options: ["Fondness", "Apathy", "Indifference", "Hate"],
            correctIndex: 0,
            difficulty: "B1"
        },
        { 
            type: "Quiz", 
            question: "Which word is the ANTONYM of 'profound'?", 
            topic: "Từ trái nghĩa B2", 
            hasInput: false,
            isQuiz: true,
            options: ["Superficial", "Deep", "Intense", "Complex"],
            correctIndex: 0,
            difficulty: "B2"
        },
        { 
            type: "Quiz", 
            question: "Which word means 'indescribable, too great to be expressed in words'?", 
            topic: "Từ vựng C1", 
            hasInput: false,
            isQuiz: true,
            options: ["Ineffable", "Common", "Ordinary", "Simple"],
            correctIndex: 0,
            difficulty: "C1"
        },
        { 
            type: "Quiz", 
            question: "Choose the correct preposition: 'She is in love ___ him.'", 
            topic: "Giới từ B1", 
            hasInput: false,
            isQuiz: true,
            options: ["with", "to", "for", "at"],
            correctIndex: 0,
            difficulty: "B1"
        },
        { 
            type: "Quiz", 
            question: "Choose the correct word: 'He is the ___ man I love.'", 
            topic: "Mạo từ B1", 
            hasInput: false,
            isQuiz: true,
            options: ["the", "a", "an", "no article"],
            correctIndex: 0,
            difficulty: "B1"
        },
        { 
            type: "Quiz", 
            question: "Which grammar tense is used: 'I have been loving him for 3 years.'", 
            topic: "Thì hiện tại hoàn thành tiếp diễn", 
            hasInput: false,
            isQuiz: true,
            options: ["Hiện tại hoàn thành tiếp diễn", "Quá khứ đơn", "Tương lai gần", "Hiện tại đơn"],
            correctIndex: 0,
            difficulty: "B2"
        },
        { 
            type: "Quiz", 
            question: "Which word is the SYNONYM of 'serendipity'?", 
            topic: "Từ vựng C1", 
            hasInput: false,
            isQuiz: true,
            options: ["Chance", "Certainty", "Purpose", "Destiny"],
            correctIndex: 0,
            difficulty: "C1"
        },
        { 
            type: "Quiz", 
            question: "What does 'soulmate' mean?", 
            topic: "Từ vựng B1", 
            hasInput: false,
            isQuiz: true,
            options: ["Tri kỷ", "Bạn thân", "Người yêu cũ", "Người thân"],
            correctIndex: 0,
            difficulty: "B1"
        }
    ];

    return questions;
}

// =====================================================
// XỬ LÝ CÂU TRẢ LỜI QUIZ
// =====================================================
window.handleIeltsAnswer = function(selectedIndex, correctIndex, type) {
    const result = document.getElementById("ieltsResult");
    const allOptions = document.querySelectorAll(".ielts-option");
    
    if (!result) return;
    if (ieltsTotal >= MAX_QUESTIONS) return;
    
    const isCorrect = selectedIndex === correctIndex;
    
    // Disable tất cả options
    allOptions.forEach(btn => {
        btn.style.pointerEvents = "none";
        btn.style.opacity = "0.7";
    });
    
    // Highlight đáp án
    allOptions.forEach((btn, idx) => {
        if (idx === correctIndex) {
            btn.style.borderColor = "#7bed9f";
            btn.style.background = "rgba(123, 237, 159, 0.15)";
        }
        if (idx === selectedIndex && !isCorrect) {
            btn.style.borderColor = "#ff6b6b";
            btn.style.background = "rgba(255, 107, 107, 0.15)";
        }
    });
    
    // Cập nhật điểm
    ieltsTotal++;
    if (isCorrect) ieltsScore++;
    ieltsAnswers.push({ correct: isCorrect, type: type });
    
    // Hiển thị kết quả
    result.innerHTML = isCorrect ? 
        "✅ CHÍNH XÁC! 🎉 +1 điểm" : 
        `❌ Sai rồi! Đáp án đúng là: <strong style="color: #f0d68d;">${String.fromCharCode(65 + correctIndex)}</strong>`;
    result.style.color = isCorrect ? "#7bed9f" : "#ff6b6b";
    
    // Kiểm tra đã đủ 10 câu chưa
    setTimeout(() => {
        if (ieltsTotal >= MAX_QUESTIONS) {
            showIeltsResult();
        } else {
            window.handleIelts();
        }
    }, 1200);
};

// =====================================================
// XỬ LÝ CÂU TRẢ LỜI FILL IN THE BLANK
// =====================================================
window.handleIeltsFillBlank = function(correct) {
    const input = document.getElementById("ieltsInput");
    const result = document.getElementById("ieltsResult");
    
    if (!input || !result) return;
    if (ieltsTotal >= MAX_QUESTIONS) return;
    
    const userAnswer = input.value.trim().toLowerCase();
    const isCorrect = userAnswer === correct.toLowerCase();
    
    ieltsTotal++;
    if (isCorrect) ieltsScore++;
    ieltsAnswers.push({ correct: isCorrect, type: "Grammar" });
    
    if (isCorrect) {
        result.innerHTML = "✅ CHÍNH XÁC! 🎉 +1 điểm";
        result.style.color = "#7bed9f";
        input.style.borderColor = "#7bed9f";
    } else {
        result.innerHTML = `❌ Sai rồi! Đáp án đúng là: <strong style="color: #f0d68d;">${correct}</strong>`;
        result.style.color = "#ff6b6b";
        input.style.borderColor = "#ff6b6b";
    }
    
    setTimeout(() => {
        if (ieltsTotal >= MAX_QUESTIONS) {
            showIeltsResult();
        } else {
            window.handleIelts();
        }
    }, 1200);
};

// =====================================================
// XỬ LÝ CÂU HỎI MỞ (Speaking/Writing)
// =====================================================
window.handleIeltsOpen = function() {
    const input = document.getElementById("ieltsInput");
    const result = document.getElementById("ieltsResult");
    
    if (!input || !result) return;
    if (ieltsTotal >= MAX_QUESTIONS) return;
    
    const answer = input.value.trim();
    
    if (answer.length === 0) {
        result.innerHTML = "⚠️ Hãy nhập câu trả lời của bạn trước khi nộp!";
        result.style.color = "#ffa502";
        return;
    }
    
    // Đánh giá câu trả lời
    let score = 0;
    let feedback = "";
    
    // Đánh giá độ dài
    if (answer.length >= 30) {
        score++;
        feedback += "📝 Độ dài tốt. ";
    } else {
        feedback += "📝 Câu trả lời ngắn, hãy phát triển thêm. ";
    }
    
    // Đánh giá từ vựng
    const keywords = ["love", "yêu", "heart", "tim", "care", "quan tâm", "cherish", "trân trọng", "adore", "tôn thờ", "passion", "đam mê", "devotion", "tận tụy", "commitment", "cam kết", "sacrifice", "hy sinh"];
    const found = keywords.filter(kw => answer.toLowerCase().includes(kw.toLowerCase()));
    
    if (found.length >= 3) {
        score++;
        feedback += "💡 Sử dụng từ vựng phong phú. ";
    } else if (found.length >= 1) {
        feedback += "💡 Có sử dụng từ vựng về tình yêu. ";
    } else {
        feedback += "💡 Hãy thêm từ vựng cảm xúc hơn. ";
    }
    
    // Đánh giá độ phức tạp
    if (answer.length >= 80) {
        score++;
        feedback += "🌟 Câu trả lời chi tiết và sâu sắc!";
    } else if (answer.length >= 50) {
        feedback += "🌟 Có thể phát triển thêm. ";
    } else {
        feedback += "🌟 Hãy viết dài và chi tiết hơn. ";
    }
    
    ieltsTotal++;
    if (score >= 2) ieltsScore++;
    ieltsAnswers.push({ correct: score >= 2, type: "Open" });
    
    result.innerHTML = `
        ✅ Đã nhận bài! ${feedback}
        <br><span style="font-size: 14px; color: ${score >= 2 ? '#7bed9f' : '#ffa502'};">
            📊 Điểm: ${score}/3 cho câu này
        </span>
    `;
    result.style.color = "#f0d68d";
    
    setTimeout(() => {
        if (ieltsTotal >= MAX_QUESTIONS) {
            showIeltsResult();
        } else {
            window.handleIelts();
        }
    }, 1200);
};

// =====================================================
// HIỂN THỊ BẢNG TỔNG KẾT 9.0
// =====================================================
function showIeltsResult() {
    const total = ieltsTotal;
    const correct = ieltsScore;
    const percentage = Math.round((correct / total) * 100);
    
    // Quy đổi sang band điểm IELTS (0-9)
    let band = 0;
    let bandColor = "#ff6b6b";
    let comment = "";
    
    if (percentage >= 95) { band = 9.0; bandColor = "#f0d68d"; comment = "🌟 Xuất sắc! Bạn là một thiên tài ngôn ngữ!"; }
    else if (percentage >= 85) { band = 8.5; bandColor = "#f0d68d"; comment = "🌈 Rất xuất sắc! Khả năng ngôn ngữ của bạn thật đáng kinh ngạc!"; }
    else if (percentage >= 75) { band = 8.0; bandColor = "#7bed9f"; comment = "💪 Tuyệt vời! Bạn có năng khiếu ngôn ngữ tuyệt vời!"; }
    else if (percentage >= 65) { band = 7.5; bandColor = "#7bed9f"; comment = "👍 Rất tốt! Hãy tiếp tục phát huy nhé!"; }
    else if (percentage >= 55) { band = 7.0; bandColor = "#feca57"; comment = "📚 Khá tốt! Còn một số lỗi nhỏ cần cải thiện."; }
    else if (percentage >= 45) { band = 6.5; bandColor = "#feca57"; comment = "📖 Trung bình khá! Hãy luyện tập thêm để tiến bộ."; }
    else if (percentage >= 35) { band = 6.0; bandColor = "#ffa502"; comment = "📝 Trung bình! Cần ôn tập lại ngữ pháp và từ vựng."; }
    else if (percentage >= 25) { band = 5.5; bandColor = "#ffa502"; comment = "⚠️ Cần cải thiện! Hãy học thêm từ vựng và ngữ pháp cơ bản."; }
    else { band = 5.0; bandColor = "#ff6b6b"; comment = "💪 Đừng nản! Hãy tiếp tục luyện tập mỗi ngày nhé!"; }
    
    // Thống kê theo dạng bài
    let speakingCount = 0, speakingCorrect = 0;
    let grammarCount = 0, grammarCorrect = 0;
    let readingCount = 0, readingCorrect = 0;
    let writingCount = 0, writingCorrect = 0;
    let quizCount = 0, quizCorrect = 0;
    
    // Cần lưu loại câu hỏi khi trả lời, nhưng vì không lưu chi tiết nên tạm tính
    // Ở đây tao sẽ tạo dữ liệu mẫu dựa trên ieltsAnswers
    
    showModal("📖", "🎯 IELTS CHALLENGE — KẾT QUẢ", `
        <div style="text-align: center; padding: 10px 0;">
            <div style="font-size: 48px; margin: 5px 0;">📊</div>
            <div style="font-size: 14px; color: rgba(233, 210, 146, 0.4); letter-spacing: 2px; margin-bottom: 5px;">
                BẠN ĐÃ HOÀN THÀNH ${total} CÂU HỎI
            </div>
            <div style="font-size: 60px; font-family: 'Cormorant Garamond', serif; color: ${bandColor}; font-weight: bold; margin: 5px 0;">
                ${band.toFixed(1)}
            </div>
            <div style="font-size: 16px; color: rgba(233, 210, 146, 0.5); letter-spacing: 2px;">
                / 9.0 IELTS
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 15px 0;">
            <div style="background: rgba(214, 169, 66, 0.05); border-radius: 10px; padding: 12px; text-align: center;">
                <div style="font-size: 11px; color: rgba(233, 210, 146, 0.3);">ĐÚNG</div>
                <div style="font-size: 28px; color: #7bed9f; font-weight: bold;">${correct}</div>
            </div>
            <div style="background: rgba(214, 169, 66, 0.05); border-radius: 10px; padding: 12px; text-align: center;">
                <div style="font-size: 11px; color: rgba(233, 210, 146, 0.3);">TỔNG</div>
                <div style="font-size: 28px; color: #f0d68d; font-weight: bold;">${total}</div>
            </div>
        </div>

        <div style="font-size: 15px; color: rgba(233, 210, 146, 0.7); padding: 12px; background: rgba(214, 169, 66, 0.05); border-radius: 10px; border-left: 3px solid ${bandColor}; margin: 10px 0;">
            ${comment}
        </div>

        <div style="margin-top: 10px; font-size: 11px; color: rgba(233, 210, 146, 0.2); letter-spacing: 1px;">
            ✅ Tỷ lệ đúng: ${percentage}% 
            ${percentage >= 70 ? '🏆' : percentage >= 50 ? '📈' : '📚'}
        </div>

        <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button onclick="resetIeltsGame()" style="
                padding: 10px 30px;
                background: rgba(214, 169, 66, 0.15);
                border: 1px solid rgba(214, 169, 66, 0.4);
                border-radius: 8px;
                color: #f0d68d;
                font-family: 'Be Vietnam Pro', sans-serif;
                font-size: 11px;
                letter-spacing: 2px;
                cursor: pointer;
                transition: all 0.3s ease;
            ">🔄 CHƠI LẠI</button>
            <button onclick="closeModal()" style="
                padding: 10px 30px;
                background: rgba(214, 169, 66, 0.05);
                border: 1px solid rgba(214, 169, 66, 0.2);
                border-radius: 8px;
                color: rgba(233, 210, 146, 0.6);
                font-family: 'Be Vietnam Pro', sans-serif;
                font-size: 11px;
                letter-spacing: 2px;
                cursor: pointer;
                transition: all 0.3s ease;
            ">✖ ĐÓNG</button>
        </div>
    `);
}

// =====================================================
// RESET GAME
// =====================================================
window.resetIeltsGame = function() {
    ieltsScore = 0;
    ieltsTotal = 0;
    ieltsAnswers = [];
    ieltsRound = 0;
    window.handleIelts();
};

    // =====================================================
    // 10. GÁN SỰ KIỆN CHO FEATURE CARDS
    // =====================================================
    const featureCards = document.querySelectorAll(".feature-card");
    console.log("🔥 Tìm thấy", featureCards.length, "feature cards");

    const featureMap = {
        random: handleRandomHusband,
        guess: handleGuessHusband,
        tarot: handleTarot,
        challenge: handleDailyChallenge,
        taixiu: handleTaiXiu,
        ielts: handleIelts
    };

    featureCards.forEach(card => {
        card.addEventListener("click", function(e) {
            const feature = this.dataset.feature;
            console.log("🔥 Click vào feature:", feature);
            if (featureMap[feature]) {
                featureMap[feature]();
            } else {
                console.log("⚠️ Không tìm thấy feature:", feature);
            }
        });
    });

    console.log("🔥 Little Features đã khởi tạo xong!");

});



/* =========================================================
   GLOBAL CLICK SOUND — RANDOM 3 FILE ÂM THANH
========================================================= */

// Danh sách file âm thanh
const SOUND_FILES = [
    'assets/click-5.mp3',
    'assets/click-6.mp3',
    'assets/click-7.mp3'
];

// Hàm phát âm thanh ngẫu nhiên
function playRandomClickSound() {
    try {
        // Chọn ngẫu nhiên 1 trong 3 file
        const randomIndex = Math.floor(Math.random() * SOUND_FILES.length);
        const audio = new Audio(SOUND_FILES[randomIndex]);
        
        // Giảm volume để không bị chói
        audio.volume = 0.4;
        
        // Phát âm thanh
        audio.play().catch(() => {
            // Bỏ qua lỗi nếu trình duyệt chặn autoplay
        });
    } catch(e) {
        // Bỏ qua lỗi
    }
}

// Gắn sự kiện click vào toàn bộ document
document.addEventListener('click', function(e) {
    // Bỏ qua nếu click vào input, textarea (tránh âm thanh khó chịu khi gõ)
    const tagName = e.target.tagName.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
        return;
    }
    
    // Phát âm thanh
    playRandomClickSound();
});

// =====================================================
// GIỮ LẠI HÀM CLICK SOUND CŨ CHO CÁC TRƯỜNG HỢP ĐẶC BIỆT
// =====================================================

// Hàm này vẫn giữ nguyên để dùng cho các nút cần âm thanh riêng
function playClickSound() {
    try {
        const randomIndex = Math.floor(Math.random() * SOUND_FILES.length);
        const audio = new Audio(SOUND_FILES[randomIndex]);
        audio.volume = 0.4;
        audio.play().catch(() => {});
    } catch(e) {}
}

// Nếu mày vẫn muốn dùng âm thanh oscillator cũ, giữ nguyên hàm này
function playOscillatorSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(900, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.12);
        
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
        
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.2);
    } catch(e) {}
}

console.log('🎵 Hệ thống âm thanh đã sẵn sàng!');

/* =========================================================
   QUICK LINKS — COPY NỘI DUNG CẤP CỨU
========================================================= */

function copyEmergencyContent(button) {
    const card = button.closest('.quick-link-card');
    const textToCopy = card.dataset.copy || '';
    
    if (!textToCopy) return;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        button.classList.add('copied');
        const originalText = button.textContent;
        button.textContent = '✅ ĐÃ COPY!';
        
        const feedback = card.querySelector('.quick-copy-feedback');
        if (feedback) {
            feedback.style.display = 'block';
            setTimeout(() => feedback.style.display = 'none', 2000);
        }
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 1500);
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        button.classList.add('copied');
        const originalText = button.textContent;
        button.textContent = '✅ ĐÃ COPY!';
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 1500);
    });
}

/* =========================================================
   QUICK LINKS — LƯU LINK VÀO LOCALSTORAGE
========================================================= */

document.addEventListener('DOMContentLoaded', function() {
    const linkCards = document.querySelectorAll('.entertainment-row .quick-link-card');
    
    linkCards.forEach((card, index) => {
        const input = card.querySelector('.quick-link-field');
        const saveBtn = card.querySelector('.quick-link-save');
        const goLink = card.querySelector('.quick-link-go');
        const key = 'quicklink_entertainment_' + index;
        
        const savedLink = localStorage.getItem(key);
        if (savedLink) {
            input.value = savedLink;
            card.dataset.link = savedLink;
            goLink.href = savedLink;
            goLink.classList.add('show');
            goLink.textContent = '🚀 ' + (savedLink.length > 25 ? savedLink.substring(0, 25) + '...' : savedLink);
            saveBtn.classList.add('saved');
        }
        
        saveBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const link = input.value.trim();
            if (link && link.startsWith('http')) {
                localStorage.setItem(key, link);
                card.dataset.link = link;
                goLink.href = link;
                goLink.classList.add('show');
                goLink.textContent = '🚀 ' + (link.length > 25 ? link.substring(0, 25) + '...' : link);
                saveBtn.classList.add('saved');
                
                const originalText = saveBtn.textContent;
                saveBtn.textContent = '✅ Đã lưu!';
                saveBtn.style.color = '#7bed9f';
                setTimeout(() => {
                    saveBtn.textContent = '💾 Lưu';
                    saveBtn.style.color = '';
                }, 1500);
            } else {
                alert('⚠️ Vui lòng nhập link hợp lệ (bắt đầu bằng http:// hoặc https://)');
                saveBtn.classList.remove('saved');
            }
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') saveBtn.click();
        });
        
        card.addEventListener('click', function(e) {
            if (e.target.closest('.quick-link-input')) return;
            if (goLink.classList.contains('show')) {
                window.open(goLink.href, '_blank');
            }
        });
    });
});

/* =========================================================
   THÌ THẦM TO NHỎ - LƯU LINK FEEDBACK
========================================================= */

function saveFeedbackLink() {
    const input = document.getElementById('feedbackLinkInput');
    const goLink = document.getElementById('feedbackGoLink');
    const status = document.getElementById('feedbackStatus');
    const saveBtn = document.querySelector('.feedback-save-btn');
    
    if (!input) return;
    
    const link = input.value.trim();
    
    if (link && link.startsWith('http')) {
        // Lưu vào localStorage
        localStorage.setItem('feedback_link', link);
        
        // Cập nhật UI
        goLink.href = link;
        goLink.classList.add('show');
        goLink.textContent = '🚀 ' + (link.length > 30 ? link.substring(0, 30) + '...' : link);
        saveBtn.classList.add('saved');
        
        // Feedback
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '✅ Đã lưu!';
        saveBtn.style.color = '#7bed9f';
        status.textContent = '✅ Đã lưu link feedback!';
        status.style.color = '#7bed9f';
        
        setTimeout(() => {
            saveBtn.textContent = '💾 Lưu';
            saveBtn.style.color = '';
        }, 1500);
        
        setTimeout(() => {
            status.textContent = '';
        }, 3000);
    } else {
        // Xóa link nếu input trống
        if (link === '') {
            localStorage.removeItem('feedback_link');
            goLink.classList.remove('show');
            saveBtn.classList.remove('saved');
            status.textContent = '🗑️ Đã xóa link feedback';
            status.style.color = '#ff6b6b';
            setTimeout(() => {
                status.textContent = '';
            }, 2000);
        } else {
            alert('⚠️ Vui lòng nhập link hợp lệ (bắt đầu bằng http:// hoặc https://)');
        }
    }
}

// Load saved feedback link khi trang load
document.addEventListener('DOMContentLoaded', function() {
    const savedLink = localStorage.getItem('feedback_link');
    const input = document.getElementById('feedbackLinkInput');
    const goLink = document.getElementById('feedbackGoLink');
    const saveBtn = document.querySelector('.feedback-save-btn');
    
    if (savedLink && input) {
        input.value = savedLink;
        goLink.href = savedLink;
        goLink.classList.add('show');
        goLink.textContent = '🚀 ' + (savedLink.length > 30 ? savedLink.substring(0, 30) + '...' : savedLink);
        saveBtn.classList.add('saved');
    }
    
    // Click vào card để mở link (nếu đã lưu)
    const card = document.getElementById('feedbackCard');
    if (card) {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.quick-feedback-link')) return;
            if (goLink.classList.contains('show')) {
                window.open(goLink.href, '_blank');
            }
        });
    }
    
    // Enter key để lưu
    if (input) {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                saveFeedbackLink();
            }
        });
    }
});