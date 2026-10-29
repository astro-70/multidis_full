def test_careers_list_and_compare(client):
    res = client.get("/api/v1/careers")
    assert res.status_code == 200
    careers = res.json()
    assert len(careers) >= 25, f"Expected >= 25 careers seeded, got {len(careers)}"

    # Test comparison
    cid1 = careers[0]["id"]
    cid2 = careers[1]["id"]
    comp_res = client.post("/api/v1/careers/compare", json={"career_ids": [cid1, cid2]})
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert len(comp_data["careers"]) == 2

def test_assessment_and_recommendation_flow(client):
    # Register candidate
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "assessment_candidate@example.com",
        "password": "Password123!",
        "full_name": "Priya Patel"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Start assessment
    start_res = client.post("/api/v1/assessments/start", headers=headers)
    assert start_res.status_code == 200
    start_data = start_res.json()
    assert start_data["current_question_index"] == 0
    assessment_id = start_data["assessment_id"]

    # Submit an answer
    q = start_data["current_question"]
    ans_res = client.post(
        f"/api/v1/assessments/{assessment_id}/answer",
        json={
            "question_id": q["id"],
            "selected_option_id": q["options"][0]["id"],
            "question_text": q["text"],
            "selected_option_text": q["options"][0]["text"],
            "category_tag": q["options"][0]["category_tag"],
            "score_weight": 2
        },
        headers=headers
    )
    assert ans_res.status_code == 200
    assert ans_res.json()["current_question_index"] == 1

    # Generate recommendations
    rec_res = client.post(f"/api/v1/recommendations/generate?assessment_id={assessment_id}", headers=headers)
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert len(rec_data["recommendations"]) == 5
    assert rec_data["recommendations"][0]["match_percentage"] > 50

    top_career_id = rec_data["recommendations"][0]["career_id"]

    # Test Skill Gap Analysis
    gap_res = client.get(f"/api/v1/recommendations/{top_career_id}/skill-gap", headers=headers)
    assert gap_res.status_code == 200
    gap_data = gap_res.json()
    assert "skills" in gap_data
    assert "readiness_level" in gap_data

    # Generate Roadmap
    roadmap_res = client.post(f"/api/v1/roadmaps/generate/{top_career_id}", headers=headers)
    assert roadmap_res.status_code == 200
    roadmap_data = roadmap_res.json()
    assert len(roadmap_data["steps"]) >= 4
    step_id = roadmap_data["steps"][0]["id"]

    # Toggle Step progress
    step_toggle = client.patch(f"/api/v1/roadmaps/steps/{step_id}/progress", json={"is_completed": True}, headers=headers)
    assert step_toggle.status_code == 200
    assert step_toggle.json()["progress_percentage"] > 0

