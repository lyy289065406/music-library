const audio = document.getElementById('audio');
const searchBox = document.getElementById('search-box');
const searchBtn = document.getElementById('search-btn');
const playlist = document.getElementById('playlist');
const prevBtn = document.getElementById('prev-btn');
const playBtn = document.getElementById('play-btn');
const nextBtn = document.getElementById('next-btn');
const repeatBtn = document.getElementById('repeat-btn');
const shuffleBtn = document.getElementById('shuffle-btn');


async function fetchMusicFiles() {
    const response = await fetch('static/music_list.dat');
    const text = await response.text();
    const files = text.trim().split('\n');
    return files;
}

// 播放选中的歌曲
function playSelectedSong(event) {
    const songPath = event.target.dataset.path;
    const songType = event.target.dataset.type;
    audio.src = songPath;
    audio.type = songType;
    audio.play();
}

//上一曲
function prevSong() {
    const currentSongIndex = musicFiles.findIndex(
        (song) => song.path === audio.src
    );
    let prevSongIndex = currentSongIndex - 1;
    if (prevSongIndex < 0) {
        prevSongIndex = musicFiles.length - 1;
    }
    audio.src = musicFiles[prevSongIndex].path;
    audio.type = musicFiles[prevSongIndex].type;
    audio.play();
}

// 播放/暂停
function playPause() {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}

// 下一曲
function nextSong() {
    const currentSongIndex = musicFiles.findIndex(
        (song) => song.path === audio.src
    );
    const nextSongIndex = (currentSongIndex + 1) % musicFiles.length;
    audio.src = musicFiles[nextSongIndex].path;
    audio.type = musicFiles[nextSongIndex].type;
    audio.play();
}

// 切换循环模式
function toggleRepeat() {
    audio.loop = !audio.loop;
}

// 切换随机播放模式
function toggleShuffle() {
    const randomSongIndex = Math.floor(Math.random() * musicFiles.length);
    audio.src = musicFiles[randomSongIndex].path;
    audio.type = musicFiles[randomSongIndex].type;
    audio.play();
}

// 搜索歌曲
function searchSong() {
    const searchTerm = searchBox.value.trim().toLowerCase();
    const filteredSongs = musicFiles.filter((song) =>
        song.title.toLowerCase().includes(searchTerm)
    );

    playlist.innerHTML = '';
    for (const file of filteredSongs) {
        const listItem = document.createElement('div');
        listItem.textContent = file.title;
        listItem.dataset.path = file.path;
        listItem.dataset.type = file.type;
        listItem.onclick = playSelectedSong;
        playlist.appendChild(listItem);
    }
}





// 获取和设置Cookie
function getCookie(name) {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = '; expires=' + date.toUTCString();
    document.cookie = name + '=' + value + expires + '; path=/';
}

// 创建歌单
const createPlaylistBtn = document.getElementById('createPlaylist');
createPlaylistBtn.onclick = () => {
    const playlistName = prompt('请输入歌单名称：');
    if (!playlistName) return;

    let customPlaylists = JSON.parse(getCookie('customPlaylists') || '[]');
    customPlaylists.push({ name: playlistName, songs: [] });
    setCookie('customPlaylists', JSON.stringify(customPlaylists), 365);

    renderPlaylists();
};

// 渲染歌单列表
function renderPlaylists() {
    const playlistContainer = document.getElementById('playlistContainer');
    playlistContainer.innerHTML = '';

    const customPlaylists = JSON.parse(getCookie('customPlaylists') || '[]');
    for (const playlist of customPlaylists) {
        const listItem = document.createElement('div');
        listItem.textContent = playlist.name;
        listItem.onclick = () => {
            playPlaylist(playlist);
        };
        playlistContainer.appendChild(listItem);
    }
}

// 播放歌单
function playPlaylist(playlist) {
    const songs = playlist.songs.map((path) => ({
        path,
        type: 'audio/mpeg',
    }));

    // 更新播放器状态
    musicFiles = songs;
    audio.src = musicFiles[0].path;
    audio.type = musicFiles[0].type;
    audio.play();
}

// 添加歌曲到歌单
function addToPlaylist(songPath) {
    const customPlaylists = JSON.parse(getCookie('customPlaylists') || '[]');
    const selectedPlaylistName = prompt(
        '请选择要添加歌曲的歌单：\n' + customPlaylists.map((p) => p.name).join('\n')
    );

    if (!selectedPlaylistName) return;

    const selectedPlaylist = customPlaylists.find(
        (playlist) => playlist.name === selectedPlaylistName
    );

    if (!selectedPlaylist) {
        alert('找不到指定的歌单！');
        return;
    }

    selectedPlaylist.songs.push(songPath);
    setCookie('customPlaylists', JSON.stringify(customPlaylists), 365);
}

// 修改initPlayer函数以添加“添加到...”按钮
async function initPlayer() {
    const files = await fetchMusicFiles();

    for (const file of files) {
        const listItem = document.createElement('div');
        listItem.textContent = file;
        listItem.dataset.path = "path/to/music/folder/${file}";
        listItem.dataset.type = 'audio/mpeg';
        listItem.onclick = playSelectedSong;
        playlist.appendChild(listItem);
        // 添加“添加到...”按钮
        const addToPlaylistBtn = document.createElement('button');
        addToPlaylistBtn.textContent = '添加到...';
        addToPlaylistBtn.onclick = (event) => {
            event.stopPropagation();
            addToPlaylist(listItem.dataset.path);
        };
        listItem.appendChild(addToPlaylistBtn);
    }

    // 控制按钮事件
    prevBtn.onclick = prevSong;
    playBtn.onclick = playPause;
    nextBtn.onclick = nextSong;
    repeatBtn.onclick = toggleRepeat;
    shuffleBtn.onclick = toggleShuffle;
    searchBtn.onclick = searchSong;

    // 渲染歌单列表
    renderPlaylists();
}

// 初始化播放器
initPlayer();