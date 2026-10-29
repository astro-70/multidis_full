import logging
from sqlalchemy.orm import Session
from app.models.career import Career, CareerSkill
from app.models.skill import Skill
from app.models.exam import ExamScholarship
from app.models.user import User
from app.services.auth_service import AuthService

logger = logging.getLogger(__name__)

CAREERS_DATA = [
    {
        "title": "Full Stack Web Developer",
        "category": "engineering",
        "description": "Architects, builds, and maintains high-performance web applications covering frontend user interfaces, backend APIs, and database persistence layers.",
        "min_education": "B.Tech / BCA / B.Sc in CS, IT or equivalent practical portfolio",
        "salary_entry_inr": "5-8 LPA",
        "salary_mid_inr": "14-24 LPA",
        "salary_senior_inr": "32-55+ LPA",
        "demand_level": "very_high",
        "growth_outlook": "22% growth over 5 years (high demand across Indian SaaS & GCCs)",
        "common_roles": ["Frontend Engineer", "Backend Engineer", "Software Development Engineer (SDE I/II)"],
        "skills": [
            ("JavaScript / TypeScript", "technical", "critical", 4),
            ("React.js / Next.js", "technical", "critical", 4),
            ("Node.js / Express or Python / FastAPI", "technical", "critical", 4),
            ("Relational Databases (PostgreSQL / MySQL)", "technical", "essential", 3),
            ("REST & GraphQL APIs", "technical", "essential", 4),
            ("Git & GitHub", "tool", "essential", 4),
            ("Docker & Containerization", "tool", "nice_to_have", 3),
            ("Problem Solving & Data Structures", "technical", "essential", 3),
            ("System Architecture Basics", "technical", "nice_to_have", 3),
            ("Team Collaboration & Agile", "soft", "essential", 4),
        ]
    },
    {
        "title": "Data Scientist & Machine Learning Engineer",
        "category": "engineering",
        "description": "Extracts actionable insights from massive datasets and deploys predictive statistical, deep learning, and generative AI models into production.",
        "min_education": "B.Tech in CS/AI/Data Science, M.Sc / M.Tech or strong portfolio",
        "salary_entry_inr": "6-10 LPA",
        "salary_mid_inr": "18-30 LPA",
        "salary_senior_inr": "40-75+ LPA",
        "demand_level": "very_high",
        "growth_outlook": "35% surge propelled by AI adoption in FinTech, E-commerce and Healthcare",
        "common_roles": ["ML Engineer", "Data Scientist", "Applied AI Scientist"],
        "skills": [
            ("Python Programming", "technical", "critical", 5),
            ("Applied Mathematics & Linear Algebra", "technical", "critical", 4),
            ("Pandas & NumPy Data Wrangling", "technical", "critical", 4),
            ("Scikit-Learn & Statistical Modeling", "technical", "essential", 4),
            ("Deep Learning (PyTorch or TensorFlow)", "technical", "essential", 4),
            ("SQL & Query Optimization", "technical", "essential", 4),
            ("LLMs & Prompt Engineering", "technical", "essential", 3),
            ("MLOps & Model Deployment", "tool", "nice_to_have", 3),
            ("Data Storytelling & Visualization", "soft", "essential", 3),
        ]
    },
    {
        "title": "Cloud & DevOps Solutions Architect",
        "category": "engineering",
        "description": "Designs scalable, fault-tolerant cloud infrastructures, automates CI/CD delivery pipelines, and optimizes cloud compute and security costs.",
        "min_education": "B.Tech / B.E in CS, IT, Electronics or BCA",
        "salary_entry_inr": "6-9 LPA",
        "salary_mid_inr": "16-28 LPA",
        "salary_senior_inr": "35-65+ LPA",
        "demand_level": "very_high",
        "growth_outlook": "28% growth due to enterprise cloud migration and FinOps in India",
        "common_roles": ["DevOps Engineer", "Site Reliability Engineer (SRE)", "Cloud Architect"],
        "skills": [
            ("Linux System Administration", "technical", "critical", 4),
            ("AWS / Azure / GCP Fundamentals", "technical", "critical", 4),
            ("Docker & Kubernetes Container Orchestration", "tool", "critical", 4),
            ("CI/CD Automation (GitHub Actions, GitLab CI)", "tool", "essential", 4),
            ("Infrastructure as Code (Terraform)", "tool", "essential", 3),
            ("Networking & Cloud Security", "technical", "essential", 3),
            ("Python / Bash Scripting", "technical", "essential", 3),
            ("Monitoring (Prometheus, Grafana)", "tool", "nice_to_have", 3),
        ]
    },
    {
        "title": "Cybersecurity & Information Security Analyst",
        "category": "engineering",
        "description": "Defends enterprise systems, corporate networks, and sensitive customer data against cyber threats, ransomware, and vulnerabilities.",
        "min_education": "B.Tech in CS/IT/Cybersecurity or B.Sc Cyber Forensics",
        "salary_entry_inr": "5-8 LPA",
        "salary_mid_inr": "14-25 LPA",
        "salary_senior_inr": "30-55+ LPA",
        "demand_level": "very_high",
        "growth_outlook": "31% growth driven by DPDP Act 2023 compliance and banking security",
        "common_roles": ["SOC Analyst", "Penetration Tester / Ethical Hacker", "Security Architect"],
        "skills": [
            ("Network Protocols & OSI Model", "technical", "critical", 4),
            ("Vulnerability Assessment & Pen Testing", "technical", "critical", 4),
            ("SIEM & Incident Response", "tool", "essential", 3),
            ("Python / Bash for Security Scripting", "technical", "essential", 3),
            ("Cryptography & Identity Access Management", "technical", "essential", 3),
            ("Burp Suite & Wireshark", "tool", "essential", 3),
            ("Analytical Thinking under Pressure", "soft", "critical", 4),
        ]
    },
    {
        "title": "Mobile Application Developer (Flutter & React Native)",
        "category": "engineering",
        "description": "Constructs smooth, offline-capable, cross-platform mobile apps for iOS and Android reaching millions of smartphone users across India.",
        "min_education": "B.Tech / BCA / B.Sc CS",
        "salary_entry_inr": "4.5-7.5 LPA",
        "salary_mid_inr": "13-22 LPA",
        "salary_senior_inr": "28-48+ LPA",
        "demand_level": "high",
        "growth_outlook": "20% growth driven by consumer fintech, quick commerce, and EdTech apps",
        "common_roles": ["Flutter Developer", "React Native Engineer", "Android/iOS Native Specialist"],
        "skills": [
            ("Dart / Flutter Framework", "technical", "critical", 4),
            ("React Native / TypeScript", "technical", "critical", 4),
            ("Mobile State Management (Bloc, Provider, Redux)", "technical", "essential", 4),
            ("RESTful API Integration", "technical", "essential", 4),
            ("Mobile UI Performance & Animations", "technical", "essential", 3),
            ("App Store & Play Store Deployment", "tool", "essential", 3),
        ]
    },
    {
        "title": "Embedded Systems & IoT Engineer",
        "category": "engineering",
        "description": "Programs microcontrollers, sensors, and firmware for smart connected devices, consumer electronics, and automotive telematics.",
        "min_education": "B.Tech / B.E in ECE, EEE, Instrumentation or Mechatronics",
        "salary_entry_inr": "4-7 LPA",
        "salary_mid_inr": "11-20 LPA",
        "salary_senior_inr": "24-42+ LPA",
        "demand_level": "high",
        "growth_outlook": "24% expansion bolstered by India's Semiconductor Mission and EV hardware",
        "common_roles": ["Firmware Engineer", "IoT Solutions Engineer", "Hardware Systems Programmer"],
        "skills": [
            ("Embedded C / C++", "technical", "critical", 5),
            ("Microcontrollers (ARM Cortex, STM32, ESP32)", "technical", "critical", 4),
            ("Communication Protocols (UART, SPI, I2C, CAN)", "technical", "critical", 4),
            ("RTOS (FreeRTOS)", "technical", "essential", 3),
            ("Hardware Debugging (Oscilloscope, Logic Analyzer)", "tool", "essential", 3),
            ("IoT Protocols (MQTT, CoAP)", "technical", "essential", 3),
        ]
    },
    {
        "title": "UI/UX & Digital Product Designer",
        "category": "design",
        "description": "Designs intuitive user journeys, wireframes, prototypes, and accessible design systems for consumer and enterprise software.",
        "min_education": "Any Bachelor's (B.Des, B.Tech, B.A, B.Sc) with design portfolio",
        "salary_entry_inr": "4.5-8 LPA",
        "salary_mid_inr": "12-22 LPA",
        "salary_senior_inr": "26-45+ LPA",
        "demand_level": "high",
        "growth_outlook": "19% rise as Indian companies shift to design-led product differentiation",
        "common_roles": ["Product Designer", "UX Researcher", "UI/Visual Designer"],
        "skills": [
            ("Figma & Design Systems", "tool", "critical", 5),
            ("User Research & Usability Testing", "technical", "critical", 4),
            ("Information Architecture & Wireframing", "technical", "critical", 4),
            ("Interactive Prototyping", "tool", "essential", 4),
            ("Design Accessibility (WCAG)", "technical", "essential", 3),
            ("Empathy & Active Listening", "soft", "critical", 5),
            ("Basic HTML/CSS Knowledge", "technical", "nice_to_have", 2),
        ]
    },
    {
        "title": "Technical Product Manager (TPM / PM)",
        "category": "management",
        "description": "Defines product roadmaps, coordinates engineering and design teams, and drives business metrics and user adoption.",
        "min_education": "B.Tech + MBA or B.Tech with demonstrable product acumen",
        "salary_entry_inr": "8-14 LPA",
        "salary_mid_inr": "20-35 LPA",
        "salary_senior_inr": "45-80+ LPA",
        "demand_level": "high",
        "growth_outlook": "25% growth across scale-ups, unicorns, and multinational product centers",
        "common_roles": ["Associate Product Manager (APM)", "Product Manager", "Group PM"],
        "skills": [
            ("Product Strategy & Roadmapping", "technical", "critical", 4),
            ("User Metrics & Product Analytics (Mixpanel, SQL)", "technical", "critical", 4),
            ("Cross-Functional Stakeholder Management", "soft", "critical", 5),
            ("Agile & Scrum Methodologies", "technical", "essential", 4),
            ("Technical Feasibility Assessment", "technical", "essential", 3),
            ("A/B Testing & Experimentation", "technical", "essential", 3),
            ("Executive Communication & Pitching", "soft", "critical", 4),
        ]
    },
    {
        "title": "Data Analyst & Business Intelligence Specialist",
        "category": "engineering",
        "description": "Transforms raw transactional business numbers into interactive BI dashboards and actionable commercial recommendations.",
        "min_education": "B.Com, B.Sc, B.Tech, BCA, or BBA with quantitative focus",
        "salary_entry_inr": "4-7 LPA",
        "salary_mid_inr": "10-18 LPA",
        "salary_senior_inr": "22-38+ LPA",
        "demand_level": "very_high",
        "growth_outlook": "26% sustained hiring across consulting, supply chain, and retail",
        "common_roles": ["BI Developer", "Business Analyst", "Marketing Data Analyst"],
        "skills": [
            ("Advanced SQL", "technical", "critical", 5),
            ("Power BI / Tableau Dashboarding", "tool", "critical", 4),
            ("Advanced Excel & Pivot Modeling", "tool", "critical", 4),
            ("Python for Data Analysis (Pandas)", "technical", "essential", 3),
            ("Business Metrics (CAC, LTV, Churn)", "domain", "essential", 4),
            ("Analytical Storytelling", "soft", "critical", 4),
        ]
    },
    {
        "title": "Chartered Accountant & Corporate Financial Analyst",
        "category": "commerce",
        "description": "Spearheads financial audits, corporate tax structuring, statutory compliance, and strategic financial planning for enterprises.",
        "min_education": "ICAI CA Qualification or B.Com + ACCA / CFA",
        "salary_entry_inr": "8-12 LPA",
        "salary_mid_inr": "18-32 LPA",
        "salary_senior_inr": "40-80+ LPA",
        "demand_level": "high",
        "growth_outlook": "Steady 15% growth; high demand in Big 4 and corporate finance teams",
        "common_roles": ["Statutory Auditor", "Tax Consultant", "Financial Controller"],
        "skills": [
            ("Financial Accounting & IFRS / Ind AS", "domain", "critical", 5),
            ("Direct & Indirect Taxation (GST)", "domain", "critical", 5),
            ("Auditing & Internal Controls", "domain", "critical", 4),
            ("Financial Modeling & Valuation", "technical", "essential", 4),
            ("ERP Systems (SAP, TallyPrime)", "tool", "essential", 3),
            ("Ethical Judgment & Compliance", "soft", "critical", 5),
        ]
    },
    {
        "title": "Investment Banking & Private Equity Analyst",
        "category": "commerce",
        "description": "Advises clients on mergers & acquisitions (M&A), equity capital markets, initial public offerings (IPOs), and venture investments.",
        "min_education": "B.Tech / B.Com from top tier institute + MBA Finance / CFA",
        "salary_entry_inr": "12-20 LPA",
        "salary_mid_inr": "28-50 LPA",
        "salary_senior_inr": "60-120+ LPA",
        "demand_level": "moderate",
        "growth_outlook": "17% growth driven by Indian IPO boom and startup deal flows",
        "common_roles": ["M&A Analyst", "Equity Research Associate", "Venture Capital Associate"],
        "skills": [
            ("Discounted Cash Flow (DCF) & LBO Modeling", "domain", "critical", 5),
            ("Financial Statement Analysis", "domain", "critical", 5),
            ("Pitch Deck Preparation & Term Sheets", "technical", "essential", 4),
            ("Capital Markets & Macroeconomics", "domain", "essential", 4),
            ("High-Stakes Presentation & Negotiation", "soft", "critical", 4),
            ("Bloomberg Terminal / Capital IQ", "tool", "nice_to_have", 3),
        ]
    },
    {
        "title": "Digital Marketing & Performance Growth Lead",
        "category": "management",
        "description": "Drives customer acquisition through targeted performance marketing campaigns, search engine optimization (SEO), and viral content funnels.",
        "min_education": "Any Graduate (BBA, B.Com, B.A, B.Tech)",
        "salary_entry_inr": "3.5-6.5 LPA",
        "salary_mid_inr": "10-18 LPA",
        "salary_senior_inr": "22-40+ LPA",
        "demand_level": "high",
        "growth_outlook": "21% growth due to D2C brand explosion and digital ad budgets",
        "common_roles": ["Growth Marketer", "Performance Marketing Specialist", "SEO / Content Strategist"],
        "skills": [
            ("Google Ads & Meta Ads Manager", "tool", "critical", 5),
            ("Search Engine Optimization (SEO)", "technical", "critical", 4),
            ("Conversion Rate Optimization (CRO)", "technical", "essential", 4),
            ("Google Analytics 4 & Tag Manager", "tool", "essential", 4),
            ("Copywriting & Creative Messaging", "soft", "critical", 4),
            ("Customer Retention Funnels", "domain", "essential", 3),
        ]
    },
    {
        "title": "Artificial Intelligence & NLP Research Scientist",
        "category": "engineering",
        "description": "Conducts cutting-edge algorithmic research in foundation models, multilingual speech synthesis, transformer architectures, and computer vision.",
        "min_education": "M.Tech / MS / Ph.D in Computer Science, AI, or Mathematics",
        "salary_entry_inr": "12-22 LPA",
        "salary_mid_inr": "30-55 LPA",
        "salary_senior_inr": "65-110+ LPA",
        "demand_level": "high",
        "growth_outlook": "40% surge in global R&D labs and sovereign Indian AI initiatives (Bhashini, Sarvam)",
        "common_roles": ["AI Researcher", "NLP Scientist", "Speech AI Specialist"],
        "skills": [
            ("Advanced Deep Learning & Transformer Math", "technical", "critical", 5),
            ("PyTorch & Distributed Training (DeepSpeed)", "technical", "critical", 5),
            ("Natural Language Processing (NLP)", "technical", "critical", 5),
            ("Scientific Literature Review & Prototyping", "technical", "critical", 4),
            ("Multilingual & Indian Language Datasets", "domain", "essential", 4),
            ("CUDA / GPU Kernel Optimization", "technical", "nice_to_have", 3),
        ]
    },
    {
        "title": "Blockchain & Smart Contract Developer",
        "category": "engineering",
        "description": "Constructs decentralized protocols, verified Solidity smart contracts, and Web3 distributed ledger integrations.",
        "min_education": "B.Tech / B.E in CS/IT or strong Web3 GitHub contributions",
        "salary_entry_inr": "6-10 LPA",
        "salary_mid_inr": "16-30 LPA",
        "salary_senior_inr": "35-65+ LPA",
        "demand_level": "moderate",
        "growth_outlook": "18% focused growth in decentralized finance, tokenization, and cross-border payments",
        "common_roles": ["Solidity Engineer", "Web3 Full Stack Dev", "Smart Contract Auditor"],
        "skills": [
            ("Solidity / Rust for Contracts", "technical", "critical", 5),
            ("EVM & Cryptographic Primitives", "technical", "critical", 4),
            ("Hardhat / Foundry Frameworks", "tool", "critical", 4),
            ("Web3.js / Ethers.js", "technical", "essential", 4),
            ("Smart Contract Security & Reentrancy Audits", "technical", "critical", 4),
        ]
    },
    {
        "title": "Civil Infrastructure & Smart City Engineer",
        "category": "engineering",
        "description": "Plans, models, and oversees construction of modern transit corridors, sustainable expressways, metro rail networks, and smart city infrastructure.",
        "min_education": "B.Tech / B.E in Civil Engineering",
        "salary_entry_inr": "3.5-6 LPA",
        "salary_mid_inr": "9-16 LPA",
        "salary_senior_inr": "20-38+ LPA",
        "demand_level": "moderate",
        "growth_outlook": "16% spurred by National Infrastructure Pipeline and urban transit projects",
        "common_roles": ["Structural Engineer", "Project Site Engineer", "BIM Coordinator"],
        "skills": [
            ("AutoCAD & Civil 3D", "tool", "critical", 4),
            ("Structural Analysis (STAAD Pro, ETABS)", "tool", "critical", 4),
            ("Building Information Modeling (BIM - Revit)", "tool", "essential", 3),
            ("Concrete Technology & Geotechnical Engineering", "domain", "critical", 4),
            ("Project Estimation & BOQ Preparation", "technical", "essential", 3),
            ("On-Site Team Leadership", "soft", "critical", 4),
        ]
    },
    {
        "title": "Electric Vehicle (EV) Powertrain & Battery Engineer",
        "category": "engineering",
        "description": "Engineers battery management systems (BMS), electric traction motors, and thermal control architectures for electric two-wheelers and automotive fleets.",
        "min_education": "B.Tech in Mechanical, Electrical, Automobile or Mechatronics",
        "salary_entry_inr": "4.5-8 LPA",
        "salary_mid_inr": "12-22 LPA",
        "salary_senior_inr": "25-45+ LPA",
        "demand_level": "high",
        "growth_outlook": "32% high acceleration fueled by EV manufacturing incentives in India",
        "common_roles": ["BMS Hardware Engineer", "Battery Cell Testing Specialist", "Motor Control Engineer"],
        "skills": [
            ("Battery Chemistry & Cell Balancing", "domain", "critical", 4),
            ("Battery Management System (BMS) Firmware", "technical", "critical", 4),
            ("MATLAB & Simulink Modeling", "tool", "critical", 4),
            ("Thermal Runaway & Thermal Management", "domain", "essential", 4),
            ("Automotive Standards (ISO 26262, AIS 156)", "domain", "essential", 3),
        ]
    },
    {
        "title": "Bioinformatics & Computational Genomics Specialist",
        "category": "science",
        "description": "Applies high-throughput computational algorithms and genomic sequencing to discover targeted therapeutics and agricultural bio-solutions.",
        "min_education": "B.Tech / M.Sc / M.Tech in Bioinformatics, Biotechnology, or Comp Bio",
        "salary_entry_inr": "4-7 LPA",
        "salary_mid_inr": "11-19 LPA",
        "salary_senior_inr": "22-40+ LPA",
        "demand_level": "moderate",
        "growth_outlook": "22% growth across pharma R&D and agricultural biotechnology",
        "common_roles": ["Genomics Data Scientist", "Computational Biologist", "Pharma R&D Analyst"],
        "skills": [
            ("Python & R for Biostatistics", "technical", "critical", 4),
            ("Next Generation Sequencing (NGS) Pipelines", "domain", "critical", 4),
            ("Bio-databases (NCBI, Ensembl, BLAST)", "domain", "critical", 4),
            ("Molecular Docking & Dynamics (PyMOL)", "tool", "essential", 3),
            ("Linux Cluster / HPC Computing", "technical", "essential", 3),
        ]
    },
    {
        "title": "Corporate Lawyer & Legal Tech Consultant",
        "category": "management",
        "description": "Navigates commercial dispute resolution, intellectual property rights, data privacy regulations, and cross-border vendor contracts.",
        "min_education": "B.A LL.B / B.B.A LL.B from BCI-recognized university",
        "salary_entry_inr": "5-10 LPA",
        "salary_mid_inr": "14-26 LPA",
        "salary_senior_inr": "32-60+ LPA",
        "demand_level": "high",
        "growth_outlook": "18% growth driven by Indian corporate tech deals and regulatory compliance",
        "common_roles": ["Corporate Counsel", "Legal Tech Specialist", "Data Privacy Officer"],
        "skills": [
            ("Contract Drafting & Review", "domain", "critical", 5),
            ("Corporate & Companies Act Law", "domain", "critical", 5),
            ("Data Privacy Regulations (DPDP / GDPR)", "domain", "critical", 4),
            ("Legal Research (SCC Online, Manupatra)", "tool", "essential", 4),
            ("Critical Thinking & Persuasive Argumentation", "soft", "critical", 5),
        ]
    },
    {
        "title": "Human Resource Business Partner (HRBP) & Talent Lead",
        "category": "management",
        "description": "Aligns people strategy with corporate business goals, designs employee performance frameworks, and leads leadership talent acquisition.",
        "min_education": "MBA in HR / Personnel Management or BBA + relevant experience",
        "salary_entry_inr": "4.5-7.5 LPA",
        "salary_mid_inr": "12-20 LPA",
        "salary_senior_inr": "25-45+ LPA",
        "demand_level": "high",
        "growth_outlook": "15% sustained growth in IT, BFSI, and manufacturing sectors",
        "common_roles": ["HRBP", "Talent Acquisition Manager", "People Operations Lead"],
        "skills": [
            ("Talent Sourcing & Interviewing", "domain", "critical", 4),
            ("Labor Laws & Statutory Compliance (India)", "domain", "critical", 4),
            ("HRMS Systems (Darwinbox, Workday)", "tool", "essential", 3),
            ("Conflict Resolution & Mediation", "soft", "critical", 5),
            ("Performance Management & OKRs", "management", "essential", 4),
        ]
    },
    {
        "title": "Supply Chain & Logistics Operations Manager",
        "category": "management",
        "description": "Optimizes freight logistics, inventory turnover, procurement networks, and warehouse distribution systems.",
        "min_education": "B.Tech / B.Com / BBA + MBA in Operations/Supply Chain",
        "salary_entry_inr": "5-8.5 LPA",
        "salary_mid_inr": "13-22 LPA",
        "salary_senior_inr": "26-50+ LPA",
        "demand_level": "high",
        "growth_outlook": "24% expansion fueled by India's National Logistics Policy and quick commerce",
        "common_roles": ["Logistics Operations Lead", "Procurement Manager", "Warehouse Operations Head"],
        "skills": [
            ("Inventory Forecasting & Demand Planning", "technical", "critical", 4),
            ("Supply Chain Optimization (SAP / Oracle SCM)", "tool", "critical", 4),
            ("Vendor Negotiation & Sourcing", "soft", "critical", 4),
            ("Warehouse Management Systems (WMS)", "domain", "essential", 3),
            ("Root Cause Analysis (Six Sigma / Lean)", "technical", "essential", 3),
        ]
    },
    {
        "title": "Renewable Energy & Solar Systems Engineer",
        "category": "engineering",
        "description": "Designs solar photovoltaic power plants, wind energy converters, and microgrid distribution systems for industrial green transition.",
        "min_education": "B.Tech in Electrical, Mechanical, or Energy Engineering",
        "salary_entry_inr": "4-6.5 LPA",
        "salary_mid_inr": "10-18 LPA",
        "salary_senior_inr": "22-40+ LPA",
        "demand_level": "high",
        "growth_outlook": "27% rapid expansion backed by India's 500 GW renewable target by 2030",
        "common_roles": ["Solar PV Design Engineer", "Grid Integration Engineer", "CleanTech Consultant"],
        "skills": [
            ("PVsyst Solar Simulation Software", "tool", "critical", 4),
            ("Electrical Grid Integration & Inverters", "technical", "critical", 4),
            ("Site Survey & Solar Feasibility Analysis", "technical", "essential", 4),
            ("National Solar & Central Electricity Codes", "domain", "essential", 3),
        ]
    },
    {
        "title": "Game Developer & 3D Interactive Artist",
        "category": "design",
        "description": "Builds interactive 3D virtual worlds, gameplay mechanics, character physics, and immersive gaming experiences across mobile and PC.",
        "min_education": "B.Tech CS / BCA / Game Design Diploma with playable game demo",
        "salary_entry_inr": "4-7 LPA",
        "salary_mid_inr": "11-20 LPA",
        "salary_senior_inr": "24-42+ LPA",
        "demand_level": "moderate",
        "growth_outlook": "23% growth in Indian gaming studios and international co-development hubs",
        "common_roles": ["Unity Game Developer", "Unreal Engine C++ Programmer", "Technical Game Artist"],
        "skills": [
            ("Unity 3D / C# Programming", "technical", "critical", 5),
            ("Unreal Engine 5 / C++ & Blueprints", "technical", "critical", 4),
            ("3D Math, Vector Physics & Collisions", "technical", "critical", 4),
            ("Blender / 3D Asset Integration", "tool", "essential", 3),
            ("Game Optimization for Mobile GPUs", "technical", "essential", 3),
        ]
    },
    {
        "title": "HealthTech & Clinical Informatics Specialist",
        "category": "healthcare",
        "description": "Integrates Electronic Health Records (EHR), telemedicine platforms, and Ayushman Bharat Digital Mission (ABDM) standards.",
        "min_education": "B.Sc/M.Sc Healthcare Informatics, MBBS with tech transition, or B.Tech CS",
        "salary_entry_inr": "4.5-8 LPA",
        "salary_mid_inr": "12-21 LPA",
        "salary_senior_inr": "25-46+ LPA",
        "demand_level": "high",
        "growth_outlook": "26% growth powered by digital health integration and ABDM nationwide mandate",
        "common_roles": ["Clinical Systems Analyst", "EHR Implementation Lead", "Health Data Specialist"],
        "skills": [
            ("HL7 / FHIR Healthcare Data Protocols", "domain", "critical", 5),
            ("ABDM (Ayushman Bharat Digital Mission) Architecture", "domain", "critical", 4),
            ("Medical Terminology & ICD-10 Coding", "domain", "essential", 4),
            ("Healthcare Data Privacy (HIPAA / DISHA)", "domain", "essential", 4),
            ("SQL & Patient Registry Analytics", "technical", "essential", 3),
        ]
    },
    {
        "title": "Civil Services & Public Administration Officer",
        "category": "governance",
        "description": "Formulates and executes government public policies, manages district administrative machinery, and oversees social welfare delivery.",
        "min_education": "Any Bachelor's Degree + UPSC Civil Services Examination qualification",
        "salary_entry_inr": "8-12 LPA (Pay Level 10 + Govt Perks & Quarters)",
        "salary_mid_inr": "15-22 LPA (Pay Level 12-13)",
        "salary_senior_inr": "25-35 LPA (Secretary / Apex Scale)",
        "demand_level": "moderate",
        "growth_outlook": "Prestige, high societal impact, and lifetime public policy leadership",
        "common_roles": ["IAS (Indian Administrative Service)", "IPS (Police Service)", "IFS (Foreign Service)"],
        "skills": [
            ("Indian Constitution & Polity", "domain", "critical", 5),
            ("Public Policy Analysis & Governance", "domain", "critical", 5),
            ("Ethics, Integrity & Administrative Aptitude", "soft", "critical", 5),
            ("Current Affairs & Socio-Economic History", "domain", "critical", 4),
            ("Crisis Leadership & Public Speaking", "soft", "critical", 5),
        ]
    },
    {
        "title": "Software Quality Assurance & Automation Test Lead",
        "category": "engineering",
        "description": "Constructs automated testing frameworks (Playwright, Selenium), executes API integration suites, and assures zero-defect software releases.",
        "min_education": "B.Tech / BCA / B.Sc Computer Science",
        "salary_entry_inr": "4-6.5 LPA",
        "salary_mid_inr": "10-18 LPA",
        "salary_senior_inr": "22-38+ LPA",
        "demand_level": "high",
        "growth_outlook": "17% consistent demand across FinTech, enterprise software, and telecom",
        "common_roles": ["SDET (Software Development Engineer in Test)", "QA Automation Engineer", "Performance Test Specialist"],
        "skills": [
            ("Test Automation (Playwright, Cypress, or Selenium)", "tool", "critical", 4),
            ("Python or Java for Test Scripting", "technical", "critical", 4),
            ("API Testing (Postman, REST Assured)", "tool", "critical", 4),
            ("CI/CD Test Pipeline Integration", "tool", "essential", 3),
            ("Load & Performance Testing (k6 / JMeter)", "tool", "essential", 3),
            ("Attention to Edge Cases & Detail", "soft", "critical", 4),
        ]
    },
    {
        "title": "Quantitative Finance & Algorithmic Trading Developer",
        "category": "commerce",
        "description": "Develops ultra-low-latency execution engines, mathematical statistical arbitrage algorithms, and automated quantitative strategies.",
        "min_education": "B.Tech / M.Tech in CS/EE/Math from premier institutes or MS Quantitative Finance",
        "salary_entry_inr": "18-35 LPA",
        "salary_mid_inr": "45-80 LPA",
        "salary_senior_inr": "90-180+ LPA",
        "demand_level": "moderate",
        "growth_outlook": "24% growth in high-frequency trading (HFT) and algorithmic funds in Mumbai/Bengaluru",
        "common_roles": ["Quantitative Trader", "Low-Latency C++ Engineer", "Quantitative Researcher"],
        "skills": [
            ("Modern C++ (C++20) Low Latency Programming", "technical", "critical", 5),
            ("Stochastic Calculus & Probability Theory", "technical", "critical", 5),
            ("Algorithmic Backtesting (Python, NumPy)", "technical", "critical", 4),
            ("Linux Kernel Bypass (Solarflare / DPDK)", "technical", "essential", 3),
            ("Financial Derivatives & Options Pricing", "domain", "essential", 4),
        ]
    }
]

EXAMS_DATA = [
    {
        "title": "JEE Main & Advanced 2026/2027",
        "type": "entrance_exam",
        "eligible_education": "class_12",
        "description": "Premier national entrance test for admission to undergraduate engineering programs across IITs, NITs, and IIITs.",
        "link": "https://jeemain.nta.nic.in",
        "frequency": "Annual (Session 1 in Jan, Session 2 in April)",
        "reward_or_seat_info": "Admissions to 17,000+ IIT seats and 32 NITs"
    },
    {
        "title": "GATE (Graduate Aptitude Test in Engineering)",
        "type": "entrance_exam",
        "eligible_education": "college",
        "description": "National level examination that tests the comprehensive understanding of undergraduate engineering subjects for M.Tech admissions and PSU recruitment (IOCL, ONGC, NTPC, BHEL).",
        "link": "https://gate2026.iitkgp.ac.in",
        "frequency": "Annual (February)",
        "reward_or_seat_info": "M.Tech seats in IITs/IISc and high-paying PSU Grade-A Officer appointments"
    },
    {
        "title": "CAT (Common Admission Test)",
        "type": "entrance_exam",
        "eligible_education": "college",
        "description": "Leading computer-based management entrance test for admission into the Indian Institutes of Management (IIMs) and top business schools.",
        "link": "https://iimcat.ac.in",
        "frequency": "Annual (November)",
        "reward_or_seat_info": "Admission to 21 IIMs and premier management institutes (FMS, SPJIMR, MDI)"
    },
    {
        "title": "UPSC Civil Services Examination (CSE)",
        "type": "entrance_exam",
        "eligible_education": "college",
        "description": "Nationwide competitive examination conducted by UPSC for recruitment to higher civil services including IAS, IPS, and IFS.",
        "link": "https://upsc.gov.in",
        "frequency": "Annual (Prelims in May/June, Mains in Sept)",
        "reward_or_seat_info": "Direct appointment as District Magistrate, Superintendent of Police, or Diplomat"
    },
    {
        "title": "National Overseas Scholarship (NOS)",
        "type": "scholarship",
        "eligible_education": "college",
        "description": "Central Sector scheme offering financial assistance to low-income candidates to pursue Masters and Ph.D abroad in reputed foreign universities.",
        "link": "https://nosmsje.gov.in",
        "frequency": "Annual (March - May portal window)",
        "reward_or_seat_info": "Full tuition fees, airfare, and annual living allowance up to $15,400 USD"
    },
    {
        "title": "AICTE Pragati & Saksham Scholarships",
        "type": "scholarship",
        "eligible_education": "college",
        "description": "Govt of India scholarship providing financial aid of Rs 50,000 per year for girl students and specially-abled students pursuing technical degree or diploma courses.",
        "link": "https://www.aicte-india.org/schemes/students-development-schemes",
        "frequency": "Annual (October - December portal window)",
        "reward_or_seat_info": "Rs 50,000 per annum for each year of study"
    },
    {
        "title": "PM Research Fellowship (PMRF)",
        "type": "scholarship",
        "eligible_education": "college",
        "description": "Designed for improving the quality of research in higher educational institutions in India. Direct admission to Ph.D. with prestigious fellowship.",
        "link": "https://www.pmrf.in",
        "frequency": "Bi-annual (May and December cycles)",
        "reward_or_seat_info": "Fellowship of Rs 70,000-80,000 per month + Rs 2 Lakh annual research grant"
    }
]

def seed_database(db: Session):
    logger.info("Checking and seeding database with initial careers, skills, exams and admin user...")

    # 1. Seed Admin user if not exists
    admin_email = "admin@pathfinder.ai"
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if not existing_admin:
        hashed_pw = AuthService.get_password_hash("AdminPass2026!")
        admin_user = User(
            email=admin_email,
            hashed_password=hashed_pw,
            full_name="PathFinder Admin",
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        logger.info("Admin user created: admin@pathfinder.ai / AdminPass2026!")

    # 2. Seed Careers and Skills
    for item in CAREERS_DATA:
        career = db.query(Career).filter(Career.title == item["title"]).first()
        if not career:
            career = Career(
                title=item["title"],
                category=item["category"],
                description=item["description"],
                min_education=item["min_education"],
                salary_entry_inr=item["salary_entry_inr"],
                salary_mid_inr=item["salary_mid_inr"],
                salary_senior_inr=item["salary_senior_inr"],
                demand_level=item["demand_level"],
                growth_outlook=item["growth_outlook"],
                common_roles=item["common_roles"],
                is_active=True
            )
            db.add(career)
            db.flush()

            # Process career skills
            for skill_name, cat, importance, target_prof in item["skills"]:
                skill = db.query(Skill).filter(Skill.name.ilike(skill_name)).first()
                if not skill:
                    skill = Skill(name=skill_name, category=cat)
                    db.add(skill)
                    db.flush()

                career_skill = CareerSkill(
                    career_id=career.id,
                    skill_id=skill.id,
                    importance=importance,
                    target_proficiency=target_prof
                )
                db.add(career_skill)

            db.commit()
            logger.info(f"Seeded career: {career.title}")

    # 3. Seed Exams and Scholarships
    for exam in EXAMS_DATA:
        existing_exam = db.query(ExamScholarship).filter(ExamScholarship.title == exam["title"]).first()
        if not existing_exam:
            new_exam = ExamScholarship(
                title=exam["title"],
                type=exam["type"],
                eligible_education=exam["eligible_education"],
                description=exam["description"],
                link=exam["link"],
                frequency=exam["frequency"],
                reward_or_seat_info=exam.get("reward_or_seat_info")
            )
            db.add(new_exam)
    db.commit()
    logger.info("Seed data successfully populated.")

