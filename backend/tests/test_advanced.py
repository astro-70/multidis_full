import io

def test_dashboard_overview(client):
    # Register candidate
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "dashboard_user@example.com",
        "password": "Password123!",
        "full_name": "Aman Gupta"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    dash_res = client.get("/api/v1/dashboard/overview", headers=headers)
    assert dash_res.status_code == 200
    data = dash_res.json()
    assert data["user_name"] == "Aman Gupta"
    assert "streak_days" in data
    assert "next_best_action" in data

def test_resume_analysis(client):
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "resume_user@example.com",
        "password": "Password123!",
        "full_name": "Neha Reddy"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create dummy text resume file
    resume_content = (
        "Neha Reddy - Software Engineer\n"
        "Skills: Python, FastAPI, React, SQL, Git, Docker, Problem Solving\n"
        "Experience: Built scalable microservices reducing latency by 25%.\n"
        "Education: B.Tech Computer Science, 8.5 CGPA.\n"
        "Projects: Created PathFinder AI platform hosted on cloud.\n"
    )
    files = {"file": ("resume.txt", io.BytesIO(resume_content.encode("utf-8")), "text/plain")}
    data = {"target_role": "Full Stack Web Developer"}

    res = client.post("/api/v1/resumes/analyze", files=files, data=data, headers=headers)
    assert res.status_code == 200
    res_data = res.json()
    assert res_data["ats_score"] >= 50
    assert "section_scores" in res_data
    assert "missing_keywords" in res_data
    assert len(res_data["improvement_suggestions"]) > 0

def test_chat_interaction(client):
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "chat_user@example.com",
        "password": "Password123!",
        "full_name": "Siddharth Rao"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create session
    sess_res = client.post("/api/v1/chat/sessions?title=Career+Advice", headers=headers)
    assert sess_res.status_code == 200
    session_id = sess_res.json()["id"]

    # Send message
    msg_res = client.post(
        f"/api/v1/chat/sessions/{session_id}/message",
        json={"content": "Should I focus on LeetCode or building full stack projects for off-campus drives?"},
        headers=headers
    )
    assert msg_res.status_code == 200
    reply = msg_res.json()
    assert reply["sender"] == "assistant"
    assert len(reply["content"]) > 20

def test_mock_interview_evaluation(client):
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "interview_user@example.com",
        "password": "Password123!",
        "full_name": "Ananya Sen"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get questions
    q_res = client.post(
        "/api/v1/mock-interview/questions",
        json={"role_title": "Full Stack Web Developer"},
        headers=headers
    )
    assert q_res.status_code == 200
    questions = q_res.json()
    assert len(questions) > 0

    # Evaluate answer
    eval_res = client.post(
        "/api/v1/mock-interview/evaluate",
        json={
            "role_title": "Full Stack Web Developer",
            "question_text": questions[0]["question"],
            "user_answer": "Server components render on the server, which eliminates heavy client JavaScript bundles. Client components are reserved for interactive events like onClick or useState."
        },
        headers=headers
    )
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert eval_data["score"] >= 60
    assert len(eval_data["strengths"]) > 0
    assert "model_answer" in eval_data

def test_exams_and_calendar_integration(client):
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "exam_user@example.com",
        "password": "Password123!",
        "full_name": "Kavita Menon"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List exams
    list_res = client.get("/api/v1/exams-scholarships")
    assert list_res.status_code == 200
    exams = list_res.json()
    assert len(exams) >= 5

    exam_id = exams[0]["id"]

    # Google calendar link
    cal_res = client.get(f"/api/v1/exams-scholarships/{exam_id}/calendar-link")
    assert cal_res.status_code == 200
    assert "calendar.google.com" in cal_res.json()["calendar_url"]

    # Remind me
    remind_res = client.post(f"/api/v1/exams-scholarships/{exam_id}/remind-me", headers=headers)
    assert remind_res.status_code == 200
    assert "Reminder scheduled" in remind_res.json()["message"]

def test_admin_metrics_and_role_guard(client):
    # Regular user attempting admin endpoint -> 403 Forbidden
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "regular_user@example.com",
        "password": "Password123!",
        "full_name": "Regular Aspirant"
    })
    user_token = reg_res.json()["access_token"]

    forbidden_res = client.get("/api/v1/admin/metrics", headers={"Authorization": f"Bearer {user_token}"})
    assert forbidden_res.status_code == 403

    # Admin login -> 200 OK
    admin_login = client.post("/api/v1/auth/login", json={
        "email": "admin@pathfinder.ai",
        "password": "AdminPass2026!"
    })
    admin_token = admin_login.json()["access_token"]

    metrics_res = client.get("/api/v1/admin/metrics", headers={"Authorization": f"Bearer {admin_token}"})
    assert metrics_res.status_code == 200
    metrics = metrics_res.json()
    assert metrics["total_careers"] >= 25
    assert metrics["total_exams_scholarships"] >= 7

