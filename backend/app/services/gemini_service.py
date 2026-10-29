import os
import json
import logging
from typing import Dict, Any, Optional, List
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    _instance = None
    _cache: Dict[str, Any] = {}

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL or "gemini-1.5-flash"
        self.is_configured = False
        if self.api_key and self.api_key != "mock_dev_key" and not self.api_key.startswith("your_"):
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel(self.model_name)
                self.is_configured = True
                logger.info(f"Gemini AI Service initialized with model: {self.model_name}")
            except Exception as e:
                logger.warning(f"Failed to configure Gemini AI: {e}. Fallback engine will be active.")
                self.is_configured = False
        else:
            logger.info("No live Gemini API key provided. Using robust heuristic AI engine.")

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _call_gemini_json(self, prompt: str, schema_desc: str) -> Optional[Dict[str, Any]]:
        if not self.is_configured:
            return None

        cache_key = hash(prompt)
        if cache_key in self._cache:
            return self._cache[cache_key]

        full_prompt = (
            f"{prompt}\n\n"
            f"STRICT INSTRUCTION: Output ONLY valid, parseable JSON conforming strictly to this format:\n"
            f"{schema_desc}\n"
            f"Do not include markdown triple backticks around the json if possible, or format as ```json ... ```."
        )

        try:
            response = self.model.generate_content(
                full_prompt,
                generation_config={"temperature": 0.2, "max_output_tokens": 2048}
            )
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            data = json.loads(raw_text.strip())
            self._cache[cache_key] = data
            return data
        except Exception as e:
            logger.warning(f"Gemini API invocation failed: {e}. Switching to heuristic fallback.")
            return None

    def generate_career_recommendations(
        self,
        user_profile: Dict[str, Any],
        assessment_answers: List[Dict[str, Any]],
        available_careers: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Calculates top 5 career recommendations with match percentage, reasoning, pros and cons.
        """
        # Formulate prompt for Gemini
        careers_summary = [
            {"id": c["id"], "title": c["title"], "category": c["category"], "demand": c["demand_level"]}
            for c in available_careers
        ]

        prompt = (
            f"Analyze this student's profile and assessment answers to recommend the top 5 most suitable careers from the provided list.\n\n"
            f"Student Profile: {json.dumps(user_profile)}\n"
            f"Assessment Answers: {json.dumps(assessment_answers)}\n"
            f"Available Careers in Database: {json.dumps(careers_summary)}\n\n"
            f"For each recommended career, provide:\n"
            f"- career_id: the exact ID from the list\n"
            f"- match_percentage: integer between 60 and 98\n"
            f"- reasoning: 2-3 sentences explaining why it fits their aptitude, interests, and Indian market context\n"
            f"- confidence_score: float between 0.8 and 0.98\n"
            f"- pros: list of 2 key advantages\n"
            f"- cons: list of 1 challenge to prepare for\n"
        )

        schema = (
            '{"recommendations": ['
            '{"career_id": "...", "match_percentage": 92.5, "reasoning": "...", '
            '"confidence_score": 0.92, "pros_and_cons": {"pros": ["..."], "cons": ["..."]}}'
            ']}'
        )

        ai_res = self._call_gemini_json(prompt, schema)
        if ai_res and "recommendations" in ai_res and len(ai_res["recommendations"]) > 0:
            return ai_res["recommendations"]

        # Intelligent Heuristic Fallback matching based on category tags and user interest
        logger.info("Executing Heuristic Career Matching Engine")
        category_scores: Dict[str, int] = {}
        for ans in assessment_answers:
            cat = ans.get("category_tag", "technical")
            weight = ans.get("score_weight", 1)
            category_scores[cat] = category_scores.get(cat, 0) + weight

        # Sort careers according to matching traits
        scored_careers = []
        for c in available_careers:
            score = 70.0
            cat = c["category"]
            if cat == "engineering" and category_scores.get("technical", 0) > 3:
                score += 18.0
            elif cat == "design" and category_scores.get("creative", 0) > 2:
                score += 20.0
            elif cat == "management" and category_scores.get("leadership", 0) > 2:
                score += 19.0
            elif cat == "commerce" and category_scores.get("analytical", 0) > 3:
                score += 19.5
            elif cat == "science" and category_scores.get("research", 0) > 2:
                score += 17.5

            if c["demand_level"] == "very_high":
                score += 6.0
            elif c["demand_level"] == "high":
                score += 3.0

            match_pct = min(96.0, round(score, 1))
            scored_careers.append({
                "career_id": c["id"],
                "match_percentage": match_pct,
                "reasoning": f"Your strong aptitude in {cat} problem solving aligns exceptionally with the real-world demands of a {c['title']}. Current Indian market indicators reflect robust hiring demand ({c['demand_level']}) with solid entry packages.",
                "confidence_score": 0.92,
                "pros_and_cons": {
                    "pros": [
                        f"Expanding opportunities across Tier 1 & 2 tech hubs in India",
                        f"Lucrative compensation trajectory ({c['salary_entry_inr']} to {c['salary_senior_inr']})"
                    ],
                    "cons": [
                        "Requires consistent hands-on project building and continuous upskilling"
                    ]
                }
            })

        scored_careers.sort(key=lambda x: x["match_percentage"], reverse=True)
        return scored_careers[:5]

    def generate_personalized_roadmap(
        self,
        career_title: str,
        user_skills: List[Dict[str, Any]],
        duration_weeks: int = 12
    ) -> List[Dict[str, Any]]:
        """
        Generates a week-by-week learning roadmap with free resources (YouTube, docs) and capstone projects.
        """
        prompt = (
            f"Generate a detailed {duration_weeks}-week personalized learning roadmap for an aspiring {career_title}.\n"
            f"The candidate's current skills: {json.dumps(user_skills)}.\n"
            f"Include high quality free learning resources (YouTube, official documentation, interactive tutorials) "
            f"and hands-on portfolio projects for every milestone."
        )

        schema = (
            '{"steps": ['
            '{"step_order": 1, "week_number": 1, "title": "Foundation & Core Tools", "description": "...", '
            '"free_resources": [{"title": "Resource title", "url": "https://...", "type": "video", "source": "YouTube", "duration": "3h"}], '
            '"project_brief": {"title": "Mini Project 1", "description": "...", "deliverables": ["..."], "suggested_tech": ["..."]}}'
            ']}'
        )

        ai_res = self._call_gemini_json(prompt, schema)
        if ai_res and "steps" in ai_res and len(ai_res["steps"]) > 0:
            return ai_res["steps"]

        # High-standard Structured Fallback Roadmap tailored to the career
        steps = [
            {
                "step_order": 1,
                "week_number": 1,
                "title": f"Phase 1: Fundamentals & Tooling Setup for {career_title}",
                "description": "Establish a bulletproof base in key domain concepts, development/analytical tooling, version control, and problem decomposition.",
                "free_resources": [
                    {
                        "title": f"Complete {career_title} Beginner Masterclass",
                        "url": "https://www.youtube.com/results?search_query=" + career_title.replace(" ", "+") + "+crash+course",
                        "type": "video",
                        "source": "YouTube",
                        "duration": "4h 30m"
                    },
                    {
                        "title": "Official Developer & Industry Documentation",
                        "url": "https://developer.mozilla.org/en-US/",
                        "type": "docs",
                        "source": "MDN / Official Specs",
                        "duration": "Self-paced"
                    }
                ],
                "project_brief": {
                    "title": "Environment Setup & Baseline Proof-of-Concept",
                    "description": "Build and document a baseline proof-of-concept repository demonstrating foundational mastery.",
                    "deliverables": ["Configured dev environment", "Initial GitHub repository with README"],
                    "suggested_tech": ["Git", "VS Code", "Terminal"]
                }
            },
            {
                "step_order": 2,
                "week_number": 3,
                "title": "Phase 2: Core Applied Techniques & Architecture",
                "description": "Dive into the primary frameworks, state management, algorithmic patterns, and database interactions required for real-world projects.",
                "free_resources": [
                    {
                        "title": "Full Practical Application Architecture Walkthrough",
                        "url": "https://www.youtube.com/results?search_query=" + career_title.replace(" ", "+") + "+project+tutorial",
                        "type": "video",
                        "source": "YouTube",
                        "duration": "6h"
                    },
                    {
                        "title": "FreeCodeCamp In-Depth Guide",
                        "url": "https://www.freecodecamp.org/news/",
                        "type": "article",
                        "source": "freeCodeCamp",
                        "duration": "2h read"
                    }
                ],
                "project_brief": {
                    "title": "Intermediate Domain Application",
                    "description": "Construct an end-to-end interactive application addressing a specific Indian consumer or enterprise problem.",
                    "deliverables": ["Working prototype", "Clean commit history", "Unit test suite"],
                    "suggested_tech": ["Core Frameworks", "REST APIs", "SQL / NoSQL"]
                }
            },
            {
                "step_order": 3,
                "week_number": 7,
                "title": "Phase 3: Production Readiness, Optimization & Security",
                "description": "Learn performance profiling, security hardening, automated testing, containerization, and production deployment workflows.",
                "free_resources": [
                    {
                        "title": "Cloud Deployment & Production Practices",
                        "url": "https://www.youtube.com/results?search_query=cloud+deployment+docker+ci+cd",
                        "type": "video",
                        "source": "YouTube",
                        "duration": "3h 45m"
                    }
                ],
                "project_brief": {
                    "title": "Cloud Deployed Capstone Project",
                    "description": "Deploy your project live with custom domain, automated CI/CD pipeline, and monitoring.",
                    "deliverables": ["Live URL", "Lighthouse audit score > 90", "System architecture diagram"],
                    "suggested_tech": ["Docker", "GitHub Actions", "Vercel / Cloud Run"]
                }
            },
            {
                "step_order": 4,
                "week_number": 11,
                "title": "Phase 4: Interview Preparation, ATS Resume & Mock Rounds",
                "description": "Polish technical and behavioral interview responses, optimize your resume keywords, and prepare portfolio walkthroughs.",
                "free_resources": [
                    {
                        "title": f"Top 50 {career_title} Interview Questions and Answers",
                        "url": "https://www.youtube.com/results?search_query=" + career_title.replace(" ", "+") + "+interview+questions",
                        "type": "video",
                        "source": "YouTube",
                        "duration": "2h 30m"
                    }
                ],
                "project_brief": {
                    "title": "Portfolio Showcase & Mock Interview Review",
                    "description": "Record a 5-minute video demo explaining your capstone architecture and complete 3 mock interview rounds.",
                    "deliverables": ["Polished ATS Resume", "Live portfolio site", "Mock interview score report"],
                    "suggested_tech": ["Loom", "PathFinder Resume Analyser", "LinkedIn"]
                }
            }
        ]
        return steps

    def analyze_resume_text(self, resume_text: str, target_role: Optional[str] = None) -> Dict[str, Any]:
        """
        Parses resume text and delivers ATS scores, missing keywords, and section-by-section improvements.
        """
        prompt = (
            f"Analyze the following resume text for the role of '{target_role or 'General Tech Professional'}'.\n"
            f"Provide an ATS compatibility score (0-100), scores for experience, skills, education, and format,\n"
            f"identify missing industry keywords for Indian hiring managers, and provide actionable improvements.\n\n"
            f"Resume Text:\n{resume_text[:4000]}"
        )

        schema = (
            '{"ats_score": 78, "section_scores": {"experience": 80, "skills": 75, "education": 85, "formatting": 70}, '
            '"missing_keywords": ["TypeScript", "Docker", "CI/CD"], '
            '"improvement_suggestions": ["Quantify achievements with metrics (e.g. improved latency by 20%)", "Add GitHub portfolio link"], '
            '"extracted_skills": ["Python", "SQL", "Git"]}'
        )

        ai_res = self._call_gemini_json(prompt, schema)
        if ai_res and "ats_score" in ai_res:
            return ai_res

        # Heuristic Analysis
        text_lower = resume_text.lower()
        key_tech = [
            "python", "javascript", "typescript", "react", "node", "sql", "git",
            "docker", "aws", "fastapi", "html", "css", "agile", "ci/cd", "linux"
        ]
        found_skills = [k.capitalize() for k in key_tech if k in text_lower]
        missing_skills = [k.capitalize() for k in key_tech if k not in text_lower][:6]

        has_metrics = any(char.isdigit() for char in resume_text)
        has_github = "github" in text_lower or "linkedin" in text_lower
        has_summary = "summary" in text_lower or "objective" in text_lower

        score = 65
        if len(found_skills) >= 4:
            score += 15
        if has_metrics:
            score += 10
        if has_github:
            score += 5

        ats_score = min(92, max(50, score))

        suggestions = [
            "Quantify your project outcomes using numbers or percentages (e.g., 'Reduced API latency by 35%').",
            "Include direct hyperlinks to your live hosted projects and active GitHub repositories.",
            "Tailor your skill summary section to match exact ATS keyword phrases from current job descriptions."
        ]
        if not has_github:
            suggestions.append("Add your LinkedIn profile URL and GitHub / portfolio link to the contact header.")

        return {
            "ats_score": ats_score,
            "section_scores": {
                "experience": min(95, score + 4),
                "skills": min(90, len(found_skills) * 12 + 20),
                "education": 88,
                "formatting": 78
            },
            "missing_keywords": missing_skills,
            "improvement_suggestions": suggestions,
            "extracted_skills": found_skills or ["Communication", "Problem Solving", "Teamwork"]
        }

    def chat_response(
        self,
        user_message: str,
        user_context: Dict[str, Any],
        history: List[Dict[str, str]]
    ) -> str:
        """
        Generates context-aware, empathetic career guidance answers.
        """
        system_instruction = (
            "You are PathFinder AI, an encouraging, deeply knowledgeable career counselor dedicated to Indian students "
            "and job seekers. You understand the nuances of Class 10-12 stream choices, Indian engineering colleges, "
            "campus placements, GATE/UPSC/CAT exams, and modern tech career pivots. Always be practical, structured, and empathetic. "
            "Never guarantee jobs or fixed salaries. Maintain safety and professional ethics."
        )

        context_str = json.dumps(user_context)
        prompt = (
            f"{system_instruction}\n\n"
            f"User Profile & Context: {context_str}\n"
            f"Recent Conversation History: {json.dumps(history[-6:] if history else [])}\n"
            f"User says: {user_message}\n\n"
            f"PathFinder AI Response:"
        )

        if self.is_configured:
            try:
                res = self.model.generate_content(prompt)
                return res.text.strip()
            except Exception as e:
                logger.warning(f"Gemini chat failed: {e}")

        # High-quality contextual fallback response
        role = user_context.get("target_role") or "your dream career"
        stream = user_context.get("education_level") or "your current studies"
        return (
            f"Hello! Regarding your journey towards {role} while navigating {stream}:\n\n"
            f"1. **Immediate Focus**: Strengthen core fundamental concepts through deliberate daily practice. Build projects rather than just watching tutorials.\n"
            f"2. **Skill Prioritization**: Focus on mastering high-leverage tools first. For instance, in Indian tech hiring, demonstrable hands-on problem solving on GitHub sets you apart from 90% of applicants.\n"
            f"3. **Milestones**: Check your PathFinder personalized roadmap to complete the current week's target.\n\n"
            f"What specific doubt or roadblock can I help you tackle today?"
        )

    def evaluate_interview_answer(
        self,
        role_title: str,
        question: str,
        user_answer: str
    ) -> Dict[str, Any]:
        """
        Evaluates a mock interview response.
        """
        prompt = (
            f"Evaluate this mock interview response for the role of '{role_title}'.\n"
            f"Question: {question}\n"
            f"User Answer: {user_answer}\n"
            f"Provide a score (0-100), key strengths, areas for improvement, an exemplary model answer, and an actionable tip."
        )

        schema = (
            '{"score": 82, "strengths": ["Clear communication", "Structured approach"], '
            '"areas_for_improvement": ["Elaborate on edge cases", "Mention quantifiable metrics"], '
            '"model_answer": "...", "actionable_tip": "Use the STAR method (Situation, Task, Action, Result)."}'
        )

        ai_res = self._call_gemini_json(prompt, schema)
        if ai_res and "score" in ai_res:
            return ai_res

        # Heuristic scoring
        word_count = len(user_answer.split())
        score = 65
        if word_count > 40:
            score += 15
        if "because" in user_answer.lower() or "example" in user_answer.lower() or "result" in user_answer.lower():
            score += 10
        score = min(92, max(50, score))

        return {
            "score": score,
            "strengths": [
                "Directly addressed the core interview prompt.",
                "Demonstrated genuine enthusiasm and contextual awareness."
            ],
            "areas_for_improvement": [
                "Structure answers using the STAR format (Situation, Task, Action, Result).",
                "Incorporate concrete industry metrics or tools used in your past projects."
            ],
            "model_answer": f"When addressing this in a live interview for a {role_title}, begin by highlighting the core objective, detail the technical or strategic actions you took, and conclude with measurable impact or key lessons learned.",
            "actionable_tip": "Pause for 2-3 seconds to structure your thoughts before answering. A concise 90-second response with clear milestones is much more memorable than a wandering monologue."
        }

