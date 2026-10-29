const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("pathfinder_token");
  }

  public static setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("pathfinder_token", token);
    }
  }

  public static clearToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pathfinder_token");
      localStorage.removeItem("pathfinder_user");
    }
  }

  public static async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMessage = "An unexpected error occurred.";
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        // non-json response
      }
      throw new Error(errorMessage);
    }

    return res.json();
  }

  // Auth endpoints
  static register(data: any) {
    return this.request("/auth/register", { method: "POST", body: JSON.stringify(data) });
  }

  static login(data: any) {
    return this.request("/auth/login", { method: "POST", body: JSON.stringify(data) });
  }

  static googleLogin(data: any) {
    return this.request("/auth/google", { method: "POST", body: JSON.stringify(data) });
  }

  static getMe() {
    return this.request("/auth/me");
  }

  static updateProfile(data: any) {
    return this.request("/users/profile", { method: "PUT", body: JSON.stringify(data) });
  }

  // Careers
  static getCareers(category?: string, query?: string) {
    let url = "/careers";
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (query) params.append("q", query);
    if (params.toString()) url += `?${params.toString()}`;
    return this.request(url);
  }

  static getCareerById(id: string) {
    return this.request(`/careers/${id}`);
  }

  static compareCareers(careerIds: string[]) {
    return this.request("/careers/compare", {
      method: "POST",
      body: JSON.stringify({ career_ids: careerIds }),
    });
  }

  // Assessment
  static startAssessment() {
    return this.request("/assessments/start", { method: "POST" });
  }

  static submitAnswer(assessmentId: string, answerData: any) {
    return this.request(`/assessments/${assessmentId}/answer`, {
      method: "POST",
      body: JSON.stringify(answerData),
    });
  }

  // Recommendations & Skill Gap
  static getMyRecommendations() {
    return this.request("/recommendations/my");
  }

  static generateRecommendations(assessmentId?: string) {
    const url = assessmentId ? `/recommendations/generate?assessment_id=${assessmentId}` : "/recommendations/generate";
    return this.request(url, { method: "POST" });
  }

  static getSkillGap(careerId: string) {
    return this.request(`/recommendations/${careerId}/skill-gap`);
  }

  // Roadmaps
  static getActiveRoadmap() {
    return this.request("/roadmaps/active");
  }

  static generateRoadmap(careerId: string) {
    return this.request(`/roadmaps/generate/${careerId}`, { method: "POST" });
  }

  static toggleStepProgress(stepId: string, isCompleted: boolean) {
    return this.request(`/roadmaps/steps/${stepId}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ is_completed: isCompleted }),
    });
  }

  // Resume Analyser
  static analyzeResume(formData: FormData) {
    return this.request("/resumes/analyze", {
      method: "POST",
      body: formData,
    });
  }

  // Chat
  static getChatSessions() {
    return this.request("/chat/sessions");
  }

  static createChatSession(title: string) {
    return this.request(`/chat/sessions?title=${encodeURIComponent(title)}`, { method: "POST" });
  }

  static sendChatMessage(sessionId: string, content: string) {
    return this.request(`/chat/sessions/${sessionId}/message`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }

  // Mock Interview
  static getInterviewQuestions(roleTitle: string) {
    return this.request("/mock-interview/questions", {
      method: "POST",
      body: JSON.stringify({ role_title: roleTitle }),
    });
  }

  static evaluateInterviewAnswer(roleTitle: string, questionText: string, userAnswer: string) {
    return this.request("/mock-interview/evaluate", {
      method: "POST",
      body: JSON.stringify({ role_title: roleTitle, question_text: questionText, user_answer: userAnswer }),
    });
  }

  // Dashboard & Exams
  static getDashboard() {
    return this.request("/dashboard/overview");
  }

  static getExams(type?: string, education?: string) {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (education) params.append("eligible_education", education);
    return this.request(`/exams-scholarships?${params.toString()}`);
  }

  static getExamCalendarLink(examId: string) {
    return this.request(`/exams-scholarships/${examId}/calendar-link`);
  }

  static remindExam(examId: string) {
    return this.request(`/exams-scholarships/${examId}/remind-me`, { method: "POST" });
  }

  // Admin
  static getAdminMetrics() {
    return this.request("/admin/metrics");
  }
}

