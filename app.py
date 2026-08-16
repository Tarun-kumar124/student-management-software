import os
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
template_dir = os.path.join(BASE_DIR, 'templates')
static_dir = os.path.join(BASE_DIR, 'static')

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
CORS(app)

# Sample Data with Dynamic Avatars & Status Colors
students = [
    {
        "id": 1,
        "name": "Aarav Sharma",
        "roll_no": "101",
        "course": "MCA",
        "attendance": "92%",
        "email": "aarav.sharma@example.com",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav"
    },
    {
        "id": 2,
        "name": "Diya Patel",
        "roll_no": "102",
        "course": "B.Tech",
        "attendance": "88%",
        "email": "diya.patel@example.com",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Diya"
    }
]

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/students', methods=['GET'])
def get_students():
    return jsonify({"status": "success", "data": students}), 200

@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.get_json()
    if not data or 'name' not in data or 'roll_no' not in data:
        return jsonify({"status": "error", "message": "Name and Roll No are required"}), 400
    
    new_student = {
        "id": len(students) + 1,
        "name": data['name'],
        "roll_no": data['roll_no'],
        "course": data.get('course', 'MCA'),
        "attendance": data.get('attendance', '100%'),
        "email": data.get('email', 'student@example.com'),
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={data['name'].replace(' ', '')}"
    }
    students.append(new_student)
    return jsonify({"status": "success", "data": new_student}), 201

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)