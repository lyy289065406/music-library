import os
import json

MUSIC_DIR = './static'
MUSIC_LIST = f"{MUSIC_DIR}/music_list.dat"

music_list = []
for root, _, files in os.walk(MUSIC_DIR):
    for file in files:
        if not file.lower().endswith('.mp3'):
            continue
        rel_path = os.path.relpath(os.path.join(root, file), MUSIC_DIR)
        music_list.append(rel_path.replace("\\", "/"))

with open(MUSIC_LIST, 'w', encoding='utf-8') as file:
    file.write("\n".join(music_list))
