#!/usr/bin/env python
# -*- coding: utf-8 -*-
# env: python3
# --------------------------------------------
# 生成仓库所有音乐文件的路径，供播放器读取
#  （可人工执行、亦可通过 Github Action 在 PR 时触发）
# --------------------------------------------
# usage: 
#   python ./py/conver_wma.py
# --------------------------------------------


import os
from pydub import AudioSegment
from color_log.clog import log

DEFAULT_ENCODING = "utf-8"
WORK_DIR = "."
MUSIC_DIR = f"{WORK_DIR}/static"
MP3_SUFFIX = ".mp3"
WMA_SUFFIX = ".wma"


def main() :
    for root, _, files in os.walk(MUSIC_DIR):
        for file in files:
            if not file.lower().endswith(WMA_SUFFIX) :
                continue

            absolute_path = os.path.join(root, file)
            rel_path = os.path.relpath(absolute_path, WORK_DIR).replace("\\", "/")
            rel_dir = os.path.dirname(rel_path)
            music_name = file[:-4]

            wma_path = rel_path
            mp3_path = f"{rel_dir}/{music_name}{MP3_SUFFIX}"
            convert_wma_to_mp3(wma_path, mp3_path)
            

def convert_wma_to_mp3(wma_path, mp3_path):
    audio = AudioSegment.from_file(wma_path, format=WMA_SUFFIX)
    audio.export(mp3_path, format=MP3_SUFFIX)

if __name__ == "__main__" :
    main()
