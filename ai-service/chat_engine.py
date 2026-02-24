"""
Chat Engine - Core AI logic for the Smart Campus chatbot.
Handles intent detection, campus data queries, and intelligent responses.
Trained on Smart Campus Knowledge Base with complete feature documentation.
"""

import re
import requests
import json
from datetime import datetime
import os


class ChatEngine:
    def __init__(self, backend_url="https://unicampus-backend-1p7e.onrender.com"):
        self.backend_url = backend_url
        self.intents = self._build_intents()
        self.knowledge_base = self._load_knowledge_base()

    def _load_knowledge_base(self):
        """Load Smart Campus knowledge base from file."""
        try:
            kb_path = os.path.join(os.path.dirname(__file__), 'KNOWLEDGE_BASE.md')
            if os.path.exists(kb_path):
                with open(kb_path, 'r') as f:
                    return f.read()
        except Exception:
            pass
        
        # Fallback knowledge base
        return """
        Smart Campus System Features:
        - Student: Attendance tracking, Academics, Library, Placements, Assignments, Resources, Feedback
        - Faculty: Grading, Attendance marking, Resources sharing, Recommendation letters
        - Admin: Student signup approval, Placement management, Library management, Analytics
        """

    def get_response(self, message, user_id="anonymous", role="student", context=None):
        """Process a user message and return an AI response."""
        intent = self._detect_intent(message)
        campus_data = self._fetch_campus_data(intent, user_id, role, context)

        response_text = self._generate_response(message, intent, role, campus_data)
        suggestions = self._get_intent_suggestions(intent, role)

        return {
            "response": response_text,
            "intent": intent,
            "suggestions": suggestions,
            "timestamp": datetime.now().isoformat(),
        }

    def analyze_data(self, query_type, user_id, role):
        """Analyze campus data and provide insights."""
        try:
            if query_type == "attendance":
                data = self._api_get(f"/api/attendance?studentId={user_id}")
                if data:
                    avg = sum(d.get("percentage", 0) for d in data) / len(data) if data else 0
                    low_subjects = [d["subject"] for d in data if d.get("percentage", 100) < 75]
                    return {
                        "analysis": f"Your average attendance is {avg:.1f}%.",
                        "insights": [
                            f"Low attendance in: {', '.join(low_subjects)}" if low_subjects else "All subjects above 75% ✅",
                            f"Total subjects tracked: {len(data)}",
                        ],
                        "risk_level": "high" if avg < 75 else "medium" if avg < 85 else "low",
                    }
            elif query_type == "placements":
                data = self._api_get("/api/placements?status=open")
                if data:
                    return {
                        "analysis": f"There are {len(data)} active placement drives.",
                        "insights": [
                            f"Companies: {', '.join(d['company'] for d in data[:5])}",
                            f"Highest CTC: {max(data, key=lambda x: float(re.sub(r'[^0-9.]', '', x.get('ctc', '0'))))['ctc']}",
                        ],
                        "risk_level": "info",
                    }
        except Exception as e:
            pass

        return {
            "analysis": "Unable to fetch data at this time. Please try again later.",
            "insights": [],
            "risk_level": "unknown",
        }

    def get_suggestions(self, page, role):
        """Get contextual suggestions based on current page."""
        suggestion_map = {
            "student": {
                "dashboard": [
                    "📊 How's my attendance?",
                    "📝 Any pending assignments?",
                    "💼 Upcoming placement drives",
                    "📚 Books due soon?",
                    "🎓 My current CGPA"
                ],
                "attendance": [
                    "⚠️ Which subjects need attention?",
                    "📈 Calculate required classes",
                    "🔮 Attendance prediction",
                    "📧 Set low-attendance alert"
                ],
                "assignments": [
                    "📋 Show pending work",
                    "📤 Upload assignment",
                    "⏰ Check deadlines",
                    "✅ View grades and feedback"
                ],
                "library": [
                    "🔍 Search for a book",
                    "📚 My borrowed books",
                    "🔄 Renew a book",
                    "⭐ Popular books",
                    "💰 Pending fines"
                ],
                "placements": [
                    "💼 Eligible drives for me",
                    "📋 Application status",
                    "📄 Request recommendation letter",
                    "📝 Prepare for interview"
                ],
                "hostel": [
                    "🏠 Room details",
                    "🔧 Raise a maintenance complaint",
                    "🍽️ Mess menu",
                    "👥 Roommate info"
                ],
                "feedback": [
                    "📢 Submit feedback",
                    "⭐ Rate a course",
                    "💬 Track my complaints",
                    "✅ View responses"
                ],
                "academics": [
                    "📈 My CGPA trend",
                    "🎓 Semester results",
                    "📚 Course details",
                    "📊 Grade distribution"
                ],
            },
            "faculty": {
                "dashboard": [
                    "📅 Today's schedule",
                    "👥 Student performance",
                    "📝 Pending evaluations",
                    "📊 Class statistics"
                ],
                "attendance": [
                    "✏️ Mark attendance",
                    "⚠️ Low attendance students",
                    "📊 Attendance report",
                    "📧 Send alert to students"
                ],
                "grading": [
                    "⏳ Pending grades",
                    "📊 Grade distribution",
                    "📥 Upload marks from CSV",
                    "📈 Performance analysis"
                ],
                "resources": [
                    "📤 Upload class material",
                    "👁️ Shared resources",
                    "📌 Pin important resource",
                    "🔍 Resource statistics"
                ],
                "recommendations": [
                    "⏳ Pending requests",
                    "✍️ Write recommendation",
                    "👥 Student profiles",
                    "📧 Track submitted letters"
                ],
            },
            "admin": {
                "dashboard": [
                    "📊 Campus overview",
                    "⏳ Pending approvals",
                    "🚨 System alerts",
                    "📈 Quick statistics"
                ],
                "signup-management": [
                    "✅ Approve signups",
                    "❌ Reject signups",
                    "👥 Pending count",
                    "📅 Review history"
                ],
                "placements": [
                    "➕ Add new drive",
                    "📊 Placement statistics",
                    "💼 Applicants per drive",
                    "📈 Success rate"
                ],
                "library": [
                    "➕ Add new book",
                    "🔍 Search ISBN",
                    "⏳ Overdue books",
                    "📊 Inventory report",
                    "💰 Fine collection status"
                ],
                "finance": [
                    "💰 Fee collection status",
                    "⏳ Pending dues",
                    "📊 Revenue report",
                    "💳 Fine payments"
                ],
                "feedback": [
                    "📊 Student satisfaction",
                    "📉 Complaint trends",
                    "🚨 Flagged items",
                    "✅ Action items"
                ],
                "faculty-oversight": [
                    "👨‍🏫 Faculty performance",
                    "📚 Course allocations",
                    "⭐ Review requests",
                    "📊 Teaching metrics"
                ],
            },
        }

        page_key = page.split("/")[-1] if "/" in page else page
        role_suggestions = suggestion_map.get(role, suggestion_map["student"])
        suggestions = role_suggestions.get(page_key, role_suggestions.get("dashboard", []))

        return {"suggestions": suggestions, "page": page, "role": role}

    # ─── Private Methods ───

    def _build_intents(self):
        """Build intent patterns for classification."""
        return {
            "greeting": r"\b(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste)\b",
            "attendance": r"\b(attendance|absent|present|classes|bunk|detention)\b",
            "assignment": r"\b(assignment|homework|submission|submit|deadline|due)\b",
            "placement": r"\b(placement|job|internship|company|drive|ctc|salary|recruit|career)\b",
            "library": r"\b(library|book|borrow|return|reading|reference)\b",
            "hostel": r"\b(hostel|room|accommodation|mess|warden|complaint)\b",
            "finance": r"\b(fee|payment|dues|finance|tuition|scholarship|refund)\b",
            "grades": r"\b(grade|cgpa|sgpa|marks|result|score|rank|performance|gpa)\b",
            "schedule": r"\b(timetable|schedule|class|lecture|slot|period|today)\b",
            "exam": r"\b(exam|test|quiz|midterm|endsem|semester)\b",
            "help": r"\b(help|assist|support|guide|how\s+to|what\s+can)\b",
            "feedback": r"\b(feedback|complaint|suggestion|review|rate|rating)\b",
            "faculty": r"\b(faculty|professor|teacher|sir|ma'am|dr\.)\b",
        }

    def _detect_intent(self, message):
        """Detect the primary intent from a user message."""
        msg = message.lower().strip()
        for intent, pattern in self.intents.items():
            if re.search(pattern, msg):
                return intent
        return "general"

    def _fetch_campus_data(self, intent, user_id, role, context=None):
        """Fetch relevant data from the Node.js backend based on intent."""
        context = context or {}
        student_id = context.get("studentId") or context.get("rollNumber") or user_id
        try:
            if intent == "attendance" and role == "student":
                return self._api_get(f"/api/attendance?studentId={student_id}")
            elif intent == "assignment":
                params = []
                if context.get("branch"):
                    params.append(f"branch={context['branch']}")
                if context.get("semester"):
                    params.append(f"semester={context['semester']}")
                query = f"?{'&'.join(params)}" if params else ""
                return self._api_get(f"/api/assignments{query}")
            elif intent == "placement":
                drives = self._api_get("/api/placements?status=open")
                cgpa = context.get("cgpa")
                if drives and cgpa is not None:
                    return [d for d in drives if float(d.get("cutoffCgpa", 0)) <= float(cgpa)]
                return drives
            elif intent == "library":
                return {
                    "catalog": self._api_get("/api/library/books") or [],
                    "my_books": self._api_get(f"/api/library/my-books?studentId={student_id}") or [],
                }
            elif intent == "hostel":
                return self._api_get("/api/hostel")
            elif intent == "finance" and role in ("student", "admin"):
                return self._api_get(f"/api/finance?studentId={student_id}")
        except Exception:
            pass
        return None

    def _api_get(self, path):
        """Make a GET request to the Node.js backend."""
        try:
            resp = requests.get(f"{self.backend_url}{path}", timeout=5)
            if resp.status_code == 200:
                return resp.json()
        except Exception:
            pass
        return None

    def _generate_response(self, message, intent, role, data):
        """Generate a contextual response based on intent and data."""
        msg = message.lower()

        if intent == "greeting":
            role_greeting = {
                "student": "I can help with attendance, assignments, placements, library, and more!",
                "faculty": "I can help with attendance management, grading, resources, and recommendations!",
                "admin": "I can help with campus administration, analytics, and management tasks!",
            }
            return f"Hello! 👋 Welcome to CampusAI. {role_greeting.get(role, role_greeting['student'])}"

        if intent == "attendance":
            if data and isinstance(data, list) and len(data) > 0:
                lines = ["📊 **Your Attendance Summary:**\n"]
                for d in data:
                    pct = d.get("percentage", 0)
                    emoji = "✅" if pct >= 75 else "⚠️" if pct >= 65 else "🔴"
                    lines.append(f"{emoji} **{d['subject']}**: {pct}% ({d.get('attended', 0)}/{d.get('total', 0)} classes)")
                avg = sum(d.get("percentage", 0) for d in data) / len(data)
                lines.append(f"\n📈 **Overall Average**: {avg:.1f}%")
                if avg < 75:
                    lines.append("\n⚠️ Your average is below 75%. You may face detention. Please attend more classes!")
                return "\n".join(lines)
            return "I can help with attendance tracking. Check the Attendance section to view your detailed records, or tell me your student ID."

        if intent == "assignment":
            if data and isinstance(data, list):
                pending = [a for a in data if a.get("status") == "pending"]
                if pending:
                    lines = [f"📝 **You have {len(pending)} pending assignment(s):**\n"]
                    for a in pending[:5]:
                        lines.append(f"• **{a['title']}** — {a['subject']} (Due: {a.get('dueDate', 'N/A')})")
                    return "\n".join(lines)
                return "✅ Great news! You have no pending assignments right now."
            return "Check the Assignments section for your current tasks and deadlines."

        if intent == "placement":
            if data and isinstance(data, list):
                lines = [f"💼 **{len(data)} Active Placement Drive(s):**\n"]
                for d in data[:5]:
                    lines.append(f"• **{d['company']}** — {d['role']} | CTC: {d.get('ctc', 'N/A')} | Cutoff: {d.get('cutoffCgpa', 'N/A')} CGPA")
                lines.append(f"\nDeadlines approaching! Make sure your resume is updated.")
                return "\n".join(lines)
            return "Visit the Placements section to view active drives and apply."

        if intent == "library":
            if data and isinstance(data, dict):
                catalog = data.get("catalog", [])
                my_books = data.get("my_books", [])
                available = [b for b in catalog if b.get("available", 0) > 0]
                if my_books:
                    due_soon = [b for b in my_books if b.get("isUrgent") or b.get("isOverdue")]
                    return (
                        f"📚 You have {len(my_books)} borrowed book(s). "
                        f"{len(due_soon)} due soon/overdue. "
                        f"Catalog has {len(catalog)} books, {len(available)} available now."
                    )
                return f"📚 **Library**: {len(catalog)} books catalogued, {len(available)} available for borrowing."
            return "The library section lets you search, borrow, and return books. Library hours: 8 AM - 10 PM."

        if intent == "hostel":
            if data and isinstance(data, list):
                vacant = [r for r in data if r.get("status") == "vacant"]
                return f"🏠 **Hostel**: {len(data)} rooms tracked, {len(vacant)} vacant. You can view your room details or raise a maintenance complaint."
            return "Check the Hostel section for room details, mess menu, and complaint registration."

        if intent == "finance":
            if data and isinstance(data, list):
                pending = [f for f in data if f.get("status") == "pending"]
                total_pending = sum(f.get("amount", 0) for f in pending)
                if pending:
                    return f"💰 You have {len(pending)} pending payment(s) totaling ₹{total_pending:,}. Please clear your dues before the deadline."
                return "✅ All your fees are paid. No pending dues!"
            return "Check the Finance section for fee details and payment history."

        if intent == "grades":
            return "📈 Your academic performance is tracked in the Academics section. You can view your CGPA, semester grades, and performance trends there."

        if intent == "schedule":
            return "📅 Your class schedule is available in the Dashboard. Today's upcoming classes will be shown at the top."

        if intent == "exam":
            return "📝 Exam schedules are posted in the Academics section. Check for upcoming midterms and end-semester exams."

        if intent == "feedback":
            return "📢 You can submit feedback, rate courses, or raise complaints in the Feedback section. Your feedback helps improve the campus experience!"

        if intent == "faculty":
            if role == "admin":
                return "👨‍🏫 The Faculty Oversight section provides performance metrics, course allocations, and management tools for faculty members."
            return "For faculty-related queries, you can check course details in Academics or contact your department office."

        if intent == "help":
            sections = {
                "student": """
**I can help you with:**
✅ **Attendance** - Track classes, set alerts, calculate required attendance
✅ **Academics** - View grades, CGPA, transcripts, course details
✅ **Assignments** - Check pending, deadlines, submit, view feedback
✅ **Placements** - Browse drives, check eligibility, apply, request recommendations
✅ **Library** - Search books, borrow, return, renew, track due dates & fines
✅ **Hostel** - Room info, maintenance tickets, visitation, complaints
✅ **Feedback** - Rate courses, submit complaints, track responses
✅ **Notifications** - Real-time alerts for attendance, assignments, library, placements

Ask me: "How's my attendance?" or "Any pending assignments?"
                """,
                "faculty": """
**I can help you with:**
✅ **Attendance** - Mark attendance for class, auto-Alert low-attendance students
✅ **Grading** - Save grades by exam type, export CSV, letter grade calculation
✅ **Resources** - Upload lecture notes, videos, materials by subject/semester
✅ **Recommendations** - Manage recommendation requests from students
✅ **Class Stats** - View student performance, attendance trends

Ask me: "How do I mark attendance?" or "Grade recording process?"
                """,
                "admin": """
**I can help you with:**
✅ **Student Signups** - Review and approve/reject student applications (branch + roll number)
✅ **Placements** - Create drives, manage applicants, eligibility filtering
✅ **Library** - Add books with ISBN lookup, manage inventory, track fines
✅ **Finance** - Track fees, collect fines, generate ledgers
✅ **Analytics** - Feedback trends, complaint resolution, performance metrics
✅ **Faculty Oversight** - Monitor faculty performance, allocations, reviews

Ask me: "Pending student signups?" or "Create placement drive?"
                """
            }
            base = sections.get(role, sections["student"]).strip()
            snippet = self._get_kb_snippet(intent)
            if snippet:
                return f"{base}\n\nFYI:\n{snippet}"
            return base

        snippet = self._get_kb_snippet(intent)
        if snippet:
            return (
                f"I understand you're asking about \"{message}\". "
                "Here is a quick reference that might help:\n"
                f"{snippet}"
            )
        return f"I understand you're asking about \"{message}\". I'm CampusAI — I can help with campus-related queries. Try asking about attendance, assignments, placements, library, or finances!"

    def _get_intent_suggestions(self, intent, role):
        """Get follow-up suggestions based on detected intent."""
        suggestion_map = {
            "greeting": ["Check attendance", "Pending assignments", "Active placements"],
            "attendance": ["Attendance prediction", "Required classes", "Subject-wise details"],
            "assignment": ["Submit assignment", "Upload file", "Check deadlines"],
            "placement": ["Apply to drive", "Eligibility check", "Interview tips"],
            "library": ["Search books", "My borrowings", "New arrivals"],
            "hostel": ["Room details", "Raise complaint", "Mess menu"],
            "finance": ["Pay fees", "Fee structure", "Scholarship info"],
            "grades": ["View CGPA", "Semester report", "Performance trend"],
            "help": ["My attendance", "Pending work", "Campus info"],
            "general": ["What can you do?", "My dashboard", "Help"],
        }
        return suggestion_map.get(intent, suggestion_map["general"])

    def _get_kb_snippet(self, intent):
        if not self.knowledge_base:
            return ""

        section_map = {
            "attendance": "1.4 Attendance Module",
            "assignment": "1.5 Assignments Module",
            "library": "1.6 Library Module",
            "hostel": "1.7 Hostel Module",
            "placement": "1.8 Placements Module",
            "feedback": "1.10 Feedback Module",
            "help": "1. STUDENT PORTAL FEATURES",
        }

        key = section_map.get(intent)
        if not key:
            return ""

        lines = self.knowledge_base.splitlines()
        snippet_lines = []
        capture = False
        for line in lines:
            if (line.strip().startswith("###") or line.strip().startswith("##")) and key in line:
                capture = True
                continue
            if capture:
                if line.strip().startswith("###") or line.strip().startswith("##"):
                    break
                if line.strip().startswith("-"):
                    snippet_lines.append(line.strip())
                if len(snippet_lines) >= 5:
                    break

        return "\n".join(snippet_lines).strip()
