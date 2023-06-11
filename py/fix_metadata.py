#!/usr/bin/env python
# -*- coding: utf-8 -*-
# env: python3
# --------------------------------------------
# 修复音乐文件的乱码元数据（歌名、艺术家、专辑）
# --------------------------------------------
# usage: 
#   python ./py/fix_metadata.py
# --------------------------------------------


import os
from mutagen.id3 import ID3, TPE1, TALB, TIT2
from color_log.clog import log

DEFAULT_ENCODING = "utf-8"
WORK_DIR = "."
MUSIC_DIR = f"{WORK_DIR}/static"
MUSIC_SUFFIXES = [ ".mp3", ".wma" ]


def main() :
    log.info(f"开始修复元数据，歌曲列表：{MUSIC_DIR}")
    for root, _, files in os.walk(MUSIC_DIR):
        for file in files:
            if not file.lower().endswith(tuple(MUSIC_SUFFIXES)) :
                continue

            music_path = os.path.join(root, file)
            music_name = file[:-4]
            fix_meta_to_utf8(music_path, music_name)

    log.info("修复完成")


# 修复歌曲文件的乱码元数据为 utf8
def fix_meta_to_utf8(music_path, music_name) :
    try:
        audio = ID3(music_path)
        fix_title(audio, music_name)
        fix_artist(audio)
        fix_album(audio)

        audio.save()  # 保存修改后的元数据
        log.debug(f"修复歌曲元数据成功： {music_name}")

    except:
        # 正确的元数据因为无法解码报错，无需处理
        pass


# 修正 标题 元数据
def fix_title(audio, music_name) :
    try:
        title_frames = audio.getall('TIT2')  # 获取所有 'TIT2' 帧（标题）
        title = ""
        if title_frames :
            title = decode_gibberish(title_frames)
            title = title.strip()
        if title == "" or title == "<未知标题>" :          # 使用文件名作为标题
            audio.add(TIT2(encoding=3, text=music_name))  # 添加新的 'TIT2' 帧
    except:
        # 正确的元数据因为无法解码报错，无需处理
        pass

# 修正 艺术家 元数据
def fix_artist(audio) :
    try:
        artist_frames = audio.getall('TPE1')  # 获取所有 'TPE1' 帧（艺术家）
        if artist_frames:
            artist = decode_gibberish(artist_frames)
            audio.delall('TPE1')  # 删除所有 'TPE1' 帧
            audio.add(TPE1(encoding=3, text=artist))  # 添加新的 'TPE1' 帧
    except:
        # 正确的元数据因为无法解码报错，无需处理
        pass


# 修正 专辑 元数据
def fix_album(audio) :
    try:
        album_frames = audio.getall('TALB')  # 获取所有 'TALB' 帧（专辑）
        if album_frames:
            album = decode_gibberish(album_frames)
            audio.delall('TALB')  # 删除所有 'TALB' 帧
            audio.add(TALB(encoding=3, text=album))  # 添加新的 'TALB' 帧
    except:
        # 正确的元数据因为无法解码报错，无需处理
        pass


# 乱码解码（以 GBK 存储的元数据会乱码）
def decode_gibberish(frames) :
    return frames[0].text[0].encode('iso-8859-1').decode('gbk')

    

if __name__ == "__main__" :
    main()
