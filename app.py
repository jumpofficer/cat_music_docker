from flask import Flask, jsonify, url_for, render_template 
import os
import random

app = Flask(__name__)


MEDIA_DIR = 'static/images'
AUDIO_DIR = 'static/audio'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/get_random_media')
def get_random_media():
    image_files = [f for f in os.listdir(MEDIA_DIR) if f.endswith(('.png', '.jpg', '.jpeg', '.gif'))]
    audio_files = [f for f in os.listdir(AUDIO_DIR) if f.endswith(('.mp4', '.wav', '.ogg'))]

    if not image_files:
        return jsonify({"error": "No images found"}), 404
    if not audio_files:
        random_image_file = random.choice(image_files)
        image_url = url_for('static', filename=f'images/{random_image_file}')
        return jsonify({"image_url": image_url, "audio_url": ""}) 

    random_image_file = random.choice(image_files)
    random_audio_file = random.choice(audio_files)

    image_url = url_for('static', filename=f'images/{random_image_file}')
    audio_url = url_for('static', filename=f'audio/{random_audio_file}')

    return jsonify({"image_url": image_url, "audio_url": audio_url})


@app.route('/api/get_all_media')
def get_all_media():
    image_files = [f for f in os.listdir(MEDIA_DIR) if f.endswith(('.png', '.jpg', '.jpeg', '.gif'))]
    all_image_urls = [url_for('static', filename=f'images/{f}') for f in image_files]
    return jsonify({"images": all_image_urls}) 


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)