"""Static catalog of job roles interviews can be generated for.

Served directly from memory by RolesListView — no DB round trip needed since
this list changes rarely and is identical for every user.
"""

JOB_ROLES = [
    # Software Engineering
    {"id": "frontend-engineer", "title": "Frontend Engineer", "category": "Software Engineering"},
    {"id": "backend-engineer", "title": "Backend Engineer", "category": "Software Engineering"},
    {"id": "fullstack-engineer", "title": "Full Stack Engineer", "category": "Software Engineering"},
    {"id": "mobile-engineer-ios", "title": "Mobile Engineer (iOS)", "category": "Software Engineering"},
    {"id": "mobile-engineer-android", "title": "Mobile Engineer (Android)", "category": "Software Engineering"},
    {"id": "devops-engineer", "title": "DevOps Engineer", "category": "Software Engineering"},
    {"id": "site-reliability-engineer", "title": "Site Reliability Engineer", "category": "Software Engineering"},
    {"id": "cloud-engineer", "title": "Cloud Engineer", "category": "Software Engineering"},
    {"id": "embedded-systems-engineer", "title": "Embedded Systems Engineer", "category": "Software Engineering"},
    {"id": "qa-automation-engineer", "title": "QA / Test Automation Engineer", "category": "Software Engineering"},
    {"id": "security-engineer", "title": "Security Engineer", "category": "Software Engineering"},
    {"id": "software-architect", "title": "Software Architect", "category": "Software Engineering"},

    # Data & AI
    {"id": "data-scientist", "title": "Data Scientist", "category": "Data & AI"},
    {"id": "data-analyst", "title": "Data Analyst", "category": "Data & AI"},
    {"id": "data-engineer", "title": "Data Engineer", "category": "Data & AI"},
    {"id": "machine-learning-engineer", "title": "Machine Learning Engineer", "category": "Data & AI"},
    {"id": "ai-research-scientist", "title": "AI Research Scientist", "category": "Data & AI"},
    {"id": "business-intelligence-analyst", "title": "Business Intelligence Analyst", "category": "Data & AI"},
    {"id": "analytics-engineer", "title": "Analytics Engineer", "category": "Data & AI"},
    {"id": "data-architect", "title": "Data Architect", "category": "Data & AI"},
    {"id": "mlops-engineer", "title": "MLOps Engineer", "category": "Data & AI"},
    {"id": "statistician", "title": "Statistician", "category": "Data & AI"},

    # Product
    {"id": "product-manager", "title": "Product Manager", "category": "Product"},
    {"id": "senior-product-manager", "title": "Senior Product Manager", "category": "Product"},
    {"id": "technical-product-manager", "title": "Technical Product Manager", "category": "Product"},
    {"id": "product-owner", "title": "Product Owner", "category": "Product"},
    {"id": "growth-product-manager", "title": "Growth Product Manager", "category": "Product"},
    {"id": "product-analyst", "title": "Product Analyst", "category": "Product"},

    # Design
    {"id": "ux-designer", "title": "UX Designer", "category": "Design"},
    {"id": "ui-designer", "title": "UI Designer", "category": "Design"},
    {"id": "product-designer", "title": "Product Designer", "category": "Design"},
    {"id": "ux-researcher", "title": "UX Researcher", "category": "Design"},
    {"id": "graphic-designer", "title": "Graphic Designer", "category": "Design"},
    {"id": "visual-designer", "title": "Visual Designer", "category": "Design"},

    # Marketing
    {"id": "digital-marketing-manager", "title": "Digital Marketing Manager", "category": "Marketing"},
    {"id": "seo-specialist", "title": "SEO Specialist", "category": "Marketing"},
    {"id": "content-marketing-manager", "title": "Content Marketing Manager", "category": "Marketing"},
    {"id": "social-media-manager", "title": "Social Media Manager", "category": "Marketing"},
    {"id": "brand-manager", "title": "Brand Manager", "category": "Marketing"},
    {"id": "marketing-analyst", "title": "Marketing Analyst", "category": "Marketing"},
    {"id": "email-marketing-specialist", "title": "Email Marketing Specialist", "category": "Marketing"},
    {"id": "growth-marketer", "title": "Growth Marketer", "category": "Marketing"},

    # Sales & Business Development
    {"id": "sales-representative", "title": "Sales Representative", "category": "Sales & Business Development"},
    {"id": "account-executive", "title": "Account Executive", "category": "Sales & Business Development"},
    {"id": "sales-development-representative", "title": "Sales Development Representative", "category": "Sales & Business Development"},
    {"id": "business-development-manager", "title": "Business Development Manager", "category": "Sales & Business Development"},
    {"id": "sales-engineer", "title": "Sales Engineer", "category": "Sales & Business Development"},
    {"id": "customer-account-manager", "title": "Customer Account Manager", "category": "Sales & Business Development"},
    {"id": "regional-sales-manager", "title": "Regional Sales Manager", "category": "Sales & Business Development"},

    # Finance & Accounting
    {"id": "financial-analyst", "title": "Financial Analyst", "category": "Finance & Accounting"},
    {"id": "accountant", "title": "Accountant", "category": "Finance & Accounting"},
    {"id": "controller", "title": "Controller", "category": "Finance & Accounting"},
    {"id": "investment-analyst", "title": "Investment Analyst", "category": "Finance & Accounting"},
    {"id": "fpa-manager", "title": "Financial Planning & Analysis Manager", "category": "Finance & Accounting"},
    {"id": "auditor", "title": "Auditor", "category": "Finance & Accounting"},
    {"id": "tax-associate", "title": "Tax Associate", "category": "Finance & Accounting"},

    # Human Resources
    {"id": "hr-generalist", "title": "HR Generalist", "category": "Human Resources"},
    {"id": "technical-recruiter", "title": "Technical Recruiter", "category": "Human Resources"},
    {"id": "hr-business-partner", "title": "HR Business Partner", "category": "Human Resources"},
    {"id": "talent-acquisition-specialist", "title": "Talent Acquisition Specialist", "category": "Human Resources"},
    {"id": "compensation-benefits-analyst", "title": "Compensation & Benefits Analyst", "category": "Human Resources"},
    {"id": "learning-development-specialist", "title": "Learning & Development Specialist", "category": "Human Resources"},

    # Operations & Program Management
    {"id": "operations-manager", "title": "Operations Manager", "category": "Operations & Program Management"},
    {"id": "supply-chain-analyst", "title": "Supply Chain Analyst", "category": "Operations & Program Management"},
    {"id": "logistics-coordinator", "title": "Logistics Coordinator", "category": "Operations & Program Management"},
    {"id": "procurement-specialist", "title": "Procurement Specialist", "category": "Operations & Program Management"},
    {"id": "project-manager", "title": "Project Manager", "category": "Operations & Program Management"},
    {"id": "program-manager", "title": "Program Manager", "category": "Operations & Program Management"},

    # Customer Success & Support
    {"id": "customer-success-manager", "title": "Customer Success Manager", "category": "Customer Success & Support"},
    {"id": "technical-support-engineer", "title": "Technical Support Engineer", "category": "Customer Success & Support"},
    {"id": "customer-support-specialist", "title": "Customer Support Specialist", "category": "Customer Success & Support"},
    {"id": "implementation-consultant", "title": "Implementation Consultant", "category": "Customer Success & Support"},
    {"id": "solutions-consultant", "title": "Solutions Consultant", "category": "Customer Success & Support"},

    # Legal & Compliance
    {"id": "paralegal", "title": "Paralegal", "category": "Legal & Compliance"},
    {"id": "compliance-analyst", "title": "Compliance Analyst", "category": "Legal & Compliance"},
    {"id": "contracts-manager", "title": "Contracts Manager", "category": "Legal & Compliance"},

    # Executive & Management
    {"id": "engineering-manager", "title": "Engineering Manager", "category": "Executive & Management"},
    {"id": "director-of-engineering", "title": "Director of Engineering", "category": "Executive & Management"},
    {"id": "chief-technology-officer", "title": "Chief Technology Officer", "category": "Executive & Management"},
    {"id": "general-manager", "title": "General Manager", "category": "Executive & Management"},
]

JOB_ROLES_BY_ID = {role["id"]: role for role in JOB_ROLES}
