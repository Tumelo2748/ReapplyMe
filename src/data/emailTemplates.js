export const emailTemplates = {
  introduction: {
    name: "Introduction",
    content: `Dear Hiring Team,

I trust this email finds you well.

I am {{USER_FIRSTNAME}}, and I am reaching out to express my interest in potential opportunities at {{COMPANY_NAME}}. With my background in this industry, I am confident in my ability to bring valuable insights and contribute to your team's success.

I have attached my resume for your consideration and would welcome the chance to discuss how my skills align with the goals of {{COMPANY_NAME}}.

Thank you for your time, and I look forward to the possibility of connecting.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
  followUp: {
    name: "Follow-up",
    content: `Dear Hiring Team at {{COMPANY_NAME}},

I hope this email finds you well. I recently submitted my application for a position at {{COMPANY_NAME}}, and I wanted to follow up to express my continued interest in joining your team.

My experience in {{USER_TITLE}} aligns perfectly with what {{COMPANY_NAME}} is looking for, and I'm particularly excited about the opportunity to contribute to your organization's growth and success.

I would welcome the chance to discuss how my skills and experience could benefit {{COMPANY_NAME}}.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
  
  thankYou: {
    name: "Thank You",
    content: `Dear {{COMPANY_NAME}} Team,

Thank you for taking the time to meet with me regarding the position at {{COMPANY_NAME}}. I enjoyed learning more about the role and the company's vision.

Our discussion reinforced my enthusiasm for the position and my desire to join your team. I am particularly excited about {{COMPANY_NAME}}'s innovative approach and believe my background in {{USER_TITLE}} would enable me to contribute effectively to your projects.

Please don't hesitate to reach out if you need any additional information.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
  networking: {
    name: "Networking",
    content: `Dear Hiring Team,

I hope this email finds you well. I recently came across {{COMPANY_NAME}} and was impressed by your work in the industry. As a {{USER_TITLE}} professional, I'm particularly interested in your innovative approaches and recent achievements.

I would greatly appreciate the opportunity to learn more about potential roles at {{COMPANY_NAME}} that align with my experience in {{USER_TITLE}}.

Thank you for considering my interest in {{COMPANY_NAME}}.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
  standardApplication: {
    name: "The Standard Application",
    content: `Dear Hiring Manager,

I am writing to express my strong interest in the {{USER_TITLE}} position at {{COMPANY_NAME}}. With my background and expertise in this field, I am excited about the possibility of contributing to your team.

My professional experience has equipped me with the skills necessary to excel in this role. I am particularly drawn to {{COMPANY_NAME}}'s commitment to innovation and excellence in the industry.

I have attached my resume for your review and would welcome the opportunity to discuss how my qualifications align with your needs.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
  eventFollowUp: {
    name: "Talk About That Event",
    content: `Dear {{COMPANY_NAME}} Team,

It was a pleasure meeting your team at the recent {{EVENT_NAME}} event. Our conversation about {{COMPANY_NAME}}'s innovative approach to {{INDUSTRY_TOPIC}} really resonated with my experience as a {{USER_TITLE}}.

I would love to continue our discussion and explore potential opportunities to contribute to {{COMPANY_NAME}}'s success.

I have attached my resume for your reference and look forward to the possibility of connecting further.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
  casualInquiry: {
    name: "The Casual Inquiry",
    content: `Hi there,

I've been following {{COMPANY_NAME}}'s work in {{INDUSTRY_TOPIC}} and I'm really impressed with your innovative approach. As a {{USER_TITLE}}, I find your projects particularly exciting.

I'd love to learn more about potential opportunities at {{COMPANY_NAME}} and how my experience might be valuable to your team.

Would you be open to a brief conversation about your current needs?

Best,
{{USER_FIRSTNAME}}`,
  },
  twistIntroduction: {
    name: "The Introduction with a Twist",
    content: `Dear {{COMPANY_NAME}} Team,

Did you know that {{INTERESTING_FACT}}? This fascinating insight relates directly to how I approach my work as a {{USER_TITLE}}, and it's one of the reasons I'm particularly excited about {{COMPANY_NAME}}'s innovative work in this space.

I would love to share more about how my unique perspective and experience could contribute to your team's success.

Looking forward to potentially connecting,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
  straightforward: {
    name: "The Straightforward Application",
    content: `Dear Hiring Team,

I am applying for the {{USER_TITLE}} position at {{COMPANY_NAME}}. Here's why I would be a great fit:

- Relevant experience: {{EXPERIENCE_HIGHLIGHTS}}
- Key achievements: {{KEY_ACHIEVEMENTS}}
- Technical skills: {{TECHNICAL_SKILLS}}

I'm excited about {{COMPANY_NAME}}'s work in {{INDUSTRY_TOPIC}} and would welcome the opportunity to discuss how I can contribute to your team.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
  problemSolver: {
    name: "The Problem Solver",
    content: `Dear {{COMPANY_NAME}} Team,

I noticed that {{COMPANY_NAME}} is working on solving {{INDUSTRY_CHALLENGE}}. This caught my attention because in my role as a {{USER_TITLE}}, I've successfully tackled similar challenges by {{SOLUTION_APPROACH}}.

I would love to share my insights and discuss how my problem-solving approach could benefit {{COMPANY_NAME}}.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
  expressive: {
    name: "The Expressive Application",
    content: `Dear {{COMPANY_NAME}} Team,

I am thrilled to express my interest in joining {{COMPANY_NAME}}! Your work in {{INDUSTRY_TOPIC}} perfectly aligns with my passion for {{PROFESSIONAL_PASSION}}.

As a {{USER_TITLE}}, I've always admired how {{COMPANY_NAME}} approaches {{INDUSTRY_CHALLENGE}} with innovation and creativity. I would be excited to bring my unique perspective and experience to your team.

I look forward to the possibility of discussing how we could work together.

Warmest regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
  skillHighlight: {
    name: "The Unique Skill Highlight",
    content: `Dear Hiring Manager,

My unique combination of skills in {{SPECIAL_SKILLS}} caught my attention when I saw {{COMPANY_NAME}}'s work in {{INDUSTRY_TOPIC}}. As a {{USER_TITLE}}, I've developed a particular expertise in {{EXPERTISE_AREA}} that I believe would be valuable to your team.

I would welcome the opportunity to discuss how my specialized skills could contribute to {{COMPANY_NAME}}'s continued success.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
  openPosition: {
    name: "Ask Regarding Open Position",
    content: `Dear {{COMPANY_NAME}} Team,

I recently learned about the {{USER_TITLE}} position at {{COMPANY_NAME}} and am very interested in learning more. Your company's reputation for {{COMPANY_STRENGTH}} aligns perfectly with my professional goals.

Could we schedule a brief conversation to discuss the role and how my experience in {{EXPERTISE_AREA}} could benefit your team?

Thank you for considering my request.

Best regards,
{{USER_FIRSTNAME}} {{USER_LASTNAME}}`,
  },
};
