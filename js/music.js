const audio = document.getElementById('audio');
const searchBox = document.getElementById('search-box');
const searchBtn = document.getElementById('search-btn');
const playlist = document.getElementById('playlist');
const prevBtn = document.getElementById('prev-btn');
const playBtn = document.getElementById('play-btn');
const nextBtn = document.getElementById('next-btn');
const repeatBtn = document.getElementById('repeat-btn');
const shuffleBtn = document.getElementById('shuffle-btn');


const MUSIC_TYPE = "audio/mpeg";
const FILE_SEPARATOR = '/';
const STATIC_DIR = "static"
const MUSIC_LIST_PATH = [ 
                            STATIC_DIR, 
                            "music_list.dat" 
                        ].join(FILE_SEPARATOR);         // 仓库中音乐文件的路径列表（通过 python 脚本生成）
let DEFAULT_MUSIC_LIST = [];                            // 所有音乐清单（默认播放列表）


async function main() {
    const musicPaths = loadMusicList(); // 加载音乐清单
    console.log("222");
    console.log(musicPaths);
    initPlayer(musicPaths);             // 初始化播放器
}


// 加载音乐清单
async function loadMusicList() {
    const response = await fetch(MUSIC_LIST_PATH);
    const pathLines = await response.text();
    const musicPaths = pathLines.split('\n').map(line => line.trim());
    DEFAULT_MUSIC_LIST = musicPaths.map((path) => ({
        class: getMusicClass(path), 
        name: getMusicName(path), 
        path: encodeURI(path),
        type: MUSIC_TYPE,
    }));
    console.log("222");
    console.log(musicPaths);
    return musicPaths;
}

function getMusicClass(musicPath) {
    var parts = musicPath.split(FILE_SEPARATOR);
    parts.shift();  // 移除第一个元素: STATIC_DIR
    parts.pop();    // 移除最后一个元素: filename
    return parts;
}

function getMusicName(musicPath) {
    var parts = musicPath.split(FILE_SEPARATOR);
    return parts.pop(); // 获取最后一个元素: filename
}

// 修改initPlayer函数以添加“添加到...”按钮
function initPlayer(musicPaths) {
    console.log("333");
    console.log(musicPaths);
    for (const musicPath of musicPaths) {
        const listItem = document.createElement('div');
        listItem.textContent = musicPath;
        listItem.dataset.path = musicPath;
        listItem.dataset.type = MUSIC_TYPE;
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
    const currentSongIndex = DEFAULT_MUSIC_LIST.findIndex(
        (song) => song.path === encodeURI(audio.src)
    );

    let prevSongIndex = currentSongIndex - 1;
    if (prevSongIndex < 0) {
        prevSongIndex = DEFAULT_MUSIC_LIST.length - 1;
    }
    audio.src = DEFAULT_MUSIC_LIST[prevSongIndex].path;
    audio.type = DEFAULT_MUSIC_LIST[prevSongIndex].type;
    audio.play();
}

// 下一曲
function nextSong() {
    const currentSongIndex = DEFAULT_MUSIC_LIST.findIndex(
        (song) => song.path === encodeURI(audio.src)
    );
    const nextSongIndex = (currentSongIndex + 1) % DEFAULT_MUSIC_LIST.length;
    audio.src = DEFAULT_MUSIC_LIST[nextSongIndex].path;
    audio.type = DEFAULT_MUSIC_LIST[nextSongIndex].type;
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


// 切换循环模式
function toggleRepeat() {
    audio.loop = !audio.loop;
}

// 切换随机播放模式
function toggleShuffle() {
    const randomSongIndex = Math.floor(Math.random() * DEFAULT_MUSIC_LIST.length);
    audio.src = DEFAULT_MUSIC_LIST[randomSongIndex].path;
    audio.type = DEFAULT_MUSIC_LIST[randomSongIndex].type;
    audio.play();
}

// 搜索歌曲
function searchSong() {
    const searchTerm = searchBox.value.trim().toLowerCase();
    const filteredSongs = DEFAULT_MUSIC_LIST.filter((song) =>
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
    DEFAULT_MUSIC_LIST = songs;
    audio.src = DEFAULT_MUSIC_LIST[0].path;
    audio.type = DEFAULT_MUSIC_LIST[0].type;
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








main();
