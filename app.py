from flask import Flask, render_template, request, jsonify
import json
import datetime
from datetime import timedelta
import random

app = Flask(__name__)

# Mock data storage (in production, use a proper database)
device_status = {
    'aromatherapy': {'enabled': False, 'intensity': 50, 'fragrance': 'lavender'},
    'vibration': {'enabled': False, 'intensity': 30},
    'sound': {'enabled': False, 'volume': 40, 'track': 'rain'},
    'timer': {'active': False, 'duration': 30},
    'connected': True
}

sleep_data = []

# Generate mock sleep data for the last 7 days
for i in range(7):
    date = datetime.datetime.now() - timedelta(days=i)
    sleep_data.append({
        'date': date.strftime('%Y-%m-%d'),
        'duration': random.randint(6, 9),
        'quality': random.randint(60, 95),
        'deep_sleep': random.randint(20, 40),
        'rem_sleep': random.randint(15, 25)
    })

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/device/status')
def get_device_status():
    return jsonify(device_status)

@app.route('/api/device/control', methods=['POST'])
def control_device():
    data = request.json
    feature = data.get('feature')
    action = data.get('action')
    value = data.get('value')
    
    if feature in device_status:
        if action == 'toggle':
            device_status[feature]['enabled'] = not device_status[feature]['enabled']
        elif action == 'set':
            device_status[feature].update(value)
    
    return jsonify({'success': True, 'status': device_status})

@app.route('/api/sleep/data')
def get_sleep_data():
    return jsonify(sleep_data)

@app.route('/api/sleep/record', methods=['POST'])
def record_sleep():
    data = request.json
    sleep_data.insert(0, data)
    if len(sleep_data) > 30:  # Keep only last 30 records
        sleep_data.pop()
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)
