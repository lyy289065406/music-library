#!/usr/bin/env python
# -*- coding: utf-8 -*-
# env: python3
# --------------------------------------------
# 生成仓库所有音乐文件的路径，供播放器读取
#  （可人工执行、亦可通过 Github Action 在 PR 时触发）
# --------------------------------------------
# usage: 
#   python ./py/gen_music_list.py
# --------------------------------------------


import os

WORK_DIR = "."
MUSIC_DIR = f"{WORK_DIR}/static"
MUSIC_LIST = f"{MUSIC_DIR}/music_list.dat"

music_list = []
for root, _, files in os.walk(MUSIC_DIR):
    for file in files:
        if not file.lower().endswith('.mp3'):
            continue
        rel_path = os.path.relpath(os.path.join(root, file), WORK_DIR)
        music_list.append(rel_path.replace("\\", "/"))

with open(MUSIC_LIST, 'w', encoding='utf-8') as file:
    file.write("\n".join(music_list))
