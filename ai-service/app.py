"""
Smart Campus AI Chatbot Service
Flask-based Python service that handles AI chat, campus queries, and smart responses.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
import json
from datetime import datetime

from chat_engine import ChatEngine

load_dotenv()

app = Flask(__name__)
CORS(app)

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")
chat_engine = ChatEngine(backend_url=BACKEND_URL)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "Smart Campus AI Chatbot",
        "timestamp": datetime.now().isoformat(),
    })


@app.route("/chat", methods=["POST"])
def chat():
    """Main chat endpoint - receives user messages and returns AI responses."""
    data = request.json
    message = data.get("message", "")
    user_id = data.get("userId", "anonymous")
    role = data.get("role", "student")
    context = data.get("context", {})

    if not message:
        return jsonify({"error": "Message is required"}), 400

    response = chat_engine.get_response(
        message=message,
        user_id=user_id,
        role=role,
        context=context,
    )

    return jsonify(response)


@app.route("/chat/analyze", methods=["POST"])
def analyze():
    """Analyze campus data and provide insights."""
    data = request.json
    query_type = data.get("type", "general")  # attendance, performance, placement
    user_id = data.get("userId", "")
    role = data.get("role", "student")

    result = chat_engine.analyze_data(
        query_type=query_type,
        user_id=user_id,
        role=role,
    )

    return jsonify(result)


@app.route("/chat/suggestions", methods=["POST"])
def suggestions():
    """Get contextual suggestions based on the current page/section."""
    data = request.json
    current_page = data.get("page", "dashboard")
    role = data.get("role", "student")

    result = chat_engine.get_suggestions(page=current_page, role=role)
    return jsonify(result)


@app.route("/chat/leave-advice", methods=["POST"])
def leave_advice():
    """Analyze attendance data and advise how many leaves the student can take."""
    data = request.json
    user_id = data.get("userId", "")
    branch = data.get("branch", "")
    semester = data.get("semester", "")
    min_percent = data.get("minAttendancePercent", 75)

    try:
        # Fetch attendance summary from Node backend
        resp = requests.get(
            f"{BACKEND_URL}/api/attendance/summary",
            params={"studentId": user_id, "branch": branch, "semester": semester},
            timeout=5,
        )
        if resp.status_code == 200:
            summary = resp.json()
        else:
            summary = None
    except Exception:
        summary = None

    if summary and summary.get("subjectWise"):
        subjects = summary["subjectWise"]
        advice_lines = []
        overall_pct = summary.get("overall", 0)

        advice_lines.append(
            f"📊 Your overall attendance: {overall_pct}%"
        )
        if overall_pct < min_percent:
            advice_lines.append(
                f"⚠️ Your overall attendance is below the minimum {min_percent}%. You should NOT take any more leaves."
            )

        for subj in subjects:
            attended = subj.get("attended", 0)
            total_classes = subj.get("total", 0)
            pct = subj.get("percentage", 0)
            if total_classes == 0:
                continue

            # Calculate how many leaves they can still take
            # Formula: (attended / (total + x)) >= min_percent/100
            # x = (attended - (min_percent/100)*total) / (min_percent/100)
            if pct >= min_percent:
                safe_leaves = int(
                    (attended - (min_percent / 100) * total_classes)
                    / (min_percent / 100)
                )
                safe_leaves = max(safe_leaves, 0)
                advice_lines.append(
                    f"📘 {subj.get('subject', 'Unknown')}: {pct}% — You can safely skip {safe_leaves} more class(es)."
                )
            else:
                # Already below minimum — how many consecutive classes needed
                needed = 0
                sim_attended = attended
                sim_total = total_classes
                while (sim_attended / sim_total) * 100 < min_percent and needed < 100:
                    sim_attended += 1
                    sim_total += 1
                    needed += 1
                advice_lines.append(
                    f"📘 {subj.get('subject', 'Unknown')}: {pct}% ❌ Below minimum! Attend next {needed} class(es) without fail."
                )

        return jsonify({
            "success": True,
            "advice": "\n".join(advice_lines),
            "subjects": subjects,
            "overall": overall_pct,
        })
    else:
        return jsonify({
            "success": False,
            "advice": "I couldn't fetch your attendance data right now. Please try again later.",
        })


@app.route("/chat/library-renewal", methods=["POST"])
def library_renewal():
    """Advise on book renewals based on due dates."""
    data = request.json
    user_id = data.get("userId", "")

    try:
        resp = requests.get(
            f"{BACKEND_URL}/api/library/my-books",
            params={"studentId": user_id},
            timeout=5,
        )
        if resp.status_code == 200:
            books = resp.json()
        else:
            books = []
    except Exception:
        books = []

    if not books:
        return jsonify({
            "success": True,
            "advice": "You don't have any borrowed books currently.",
            "books": [],
        })

    advice_lines = [f"📚 You have {len(books)} borrowed book(s):"]
    urgent = []
    for b in books:
        days = b.get("daysRemaining", 0)
        title = b.get("bookTitle", "Unknown")
        if b.get("isOverdue"):
            advice_lines.append(f"🔴 \"{title}\" — OVERDUE by {abs(days)} day(s)! Return immediately to avoid fines.")
            urgent.append(b)
        elif b.get("isUrgent"):
            advice_lines.append(f"🟡 \"{title}\" — Due in {days} day(s). Consider renewing now!")
            urgent.append(b)
        else:
            advice_lines.append(f"🟢 \"{title}\" — Due in {days} day(s). You're good.")

    if urgent:
        advice_lines.append("\n💡 Tip: You can renew books up to 2 times. Shall I renew the urgent ones?")

    return jsonify({
        "success": True,
        "advice": "\n".join(advice_lines),
        "books": books,
        "urgentCount": len(urgent),
    })


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 8000))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    print(f"🤖 Smart Campus AI Service running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
