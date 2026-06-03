/**
 * Executive Leadership Team — Ashford & Gray Fusion Academy.
 * Surfaced at /faculty (renamed in UI to "Executive Leadership Team").
 */

export type LeadershipMember = {
    slug: string;
    name: string;
    postNominals?: string;     // honorifics / professional credentials (Karibi)
    title: string;
    photo: string;             // path under /public
    bio: string[];             // ordered paragraphs
};

export const LEADERSHIP: LeadershipMember[] = [
    {
        slug: 'myne-wilfred',
        name: 'Myne Wilfred',
        title: 'Founder/President',
        photo: '/CEO.jpeg',
        bio: [
            'A distinguished hospitality specialist, executive leader, and strategist with over two decades of experience in hospitality, business innovation, and high-level management. Her leadership philosophy is rooted in discipline, excellence, and the relentless pursuit of global standards.',
            'As Founder and President of Ashford & Gray Fusion Academy, Dr. Wilfred has built an institution where excellence is not aspirational — it is foundational. Under her stewardship, the Academy has become a global ecosystem where mastery, character, and refinement converge to shape the next generation of distinguished professionals.',
            '“True luxury is not excess — it is precision, discipline, and excellence expressed effortlessly.”',
        ],
    },

    {
        slug: 'cecilia-iniperitiari-dikibo',
        name: 'Cecilia Iniperitiari Dikibo',
        title: 'Director, Brands Strategy',
        photo: '/Cecilia Iniperitiari Dikibo.jpeg',
        bio: [
            'Cecilia Iniperitiari Dikibo is a Nigerian Brand Strategist, Outdoor Advertising Professional, and Corporate Communications Specialist with extensive experience in strategic brand visibility, media communications, and out-of-home (OOH) advertising.',
            'She is the Founder and Managing Director of Alamingi-Creeks Ltd, an outdoor advertising and brand communications company recognised for delivering strategic billboard campaigns, brand positioning solutions, and impactful media visibility across major commercial corridors in Nigeria.',
            'Popularly known as #PortHarcourtAdvertLady, Cecilia has built a strong reputation for combining strategic storytelling, audience visibility, and innovative outdoor advertising solutions to help brands achieve impactful market presence and consumer engagement.',
            'Cecilia holds a degree in Network Computing from Oxford Brookes University, alongside an International Diploma and Advanced International Diploma in Computing from Informatics Academy. She also has a background in Mass Communication from Rivers State University and a Certificate in Broadcasting from Alpha Institute of Broadcasting Communication (AIBC).',
            'She recently completed an MBA in Corporate Communication at Rome Business School and is a registered practitioner with Rivers State Signage and Advertisement Agency (RISAA).',
            'Her expertise spans brand strategy, corporate communications, media planning, regulatory engagement, and visual brand storytelling, with a passion for building globally respected brands and transforming urban advertising landscapes through strategic visibility and communication excellence.',
        ],
    },

    {
        slug: 'karibi-t-george',
        name: 'Karibi T. George, Esq.',
        postNominals: 'fnipr, rpa, CT, MICMC, DDF, DHCD (Honoris Causa)',
        title: 'Director of Communications',
        photo: '/Mr Karibi.jpeg',
        bio: [
            'Karibi Tamunoemi George is a teacher, lawyer, mediator and communications advisor and trainer, who currently works in the Unity Law Firm in Port Harcourt, Nigeria. He statutorily retired from the Rivers State Civil Service on October 31, 2023 as Director, Administration and Supplies / Public Relations in the Rivers State Universal Basic Education Board (RSUBEB), Port Harcourt.',
            'Karibi George, who attended Baptist High School, Port Harcourt, holds a BA in English and an M.A in Oral Literature from the University of Jos, Nigeria; the Professional Diplomas of the Nigerian Institute of Public Relations (NIPR) and the Advertising Regulatory Council of Nigeria (ARCON); the L.L.B from the Rivers State University (RSU); and the Barrister at Law (BL) from the Nigerian Law School upon which he was called to the Nigerian Bar. He also holds the Post Graduate Diploma in Education from the National Open University of Nigeria (NOUN).',
            'George is a Fellow (fnipr) of the Nigerian Institute of Public Relations (NIPR); a member (rpa) of the Advertising Regulatory Council of Nigeria (ARCON); a member of the Nigerian Bar Association (NBA); a Certified Teacher (CT) by the Teachers’ Registration Council of Nigeria; and a Member (MICMC) of the Institute of Chartered Mediators and Conciliators (ICMC), Nigeria.',
            'He has served as District Rotaract Representative of Rotary International District 9140, Nigeria; National President of Baptist High School, Port Harcourt Old Students Association (BHSPHOSA); Chairman of the Rivers State Chapter of the NIPR; elected member of the Governing Council of the NIPR; Chairman of the Chapter Relations Committee, and Secretary of the Fellowship Advisory Committee. He is currently Chairman of the Legal Advisory Committee of the NIPR, and a member of the Commission on Human Rights, Peace Building and Reconciliation of the Baptist World Alliance (BWA).',
            'Mr. George has spoken at events of the Nigerian Institute of Public Relations (NIPR), Rotary Club, the Nigerian Bar Association, the International Federation of Women Lawyers (FIDA), the Advertising Regulatory Council of Nigeria (ARCON), and the “Strengthening Families Conference” of the Church of Jesus Christ of Latter-Day Saints, among other organisations. He is a recipient of many awards, including the 2019 “Public Relations Personality of the Year” by the President of the Nigerian Institute of Public Relations; Faculty of Education, Ignatius Ajuru University of Education honour as “Distinguished Personality Award in Recognition of Significant Contribution to Educational Growth and Service to Humanity”, 2023; Nigerian Institute of Public Relations (NIPR) “Diamond Award for Professional Services to the Nigerian Institute of Public Relations”, 2024; the Global Ecumenical Christian Conference award as “Distinguished Defender of the Faith” (DDF); and a Doctorate degree in “Human Capacity Development” (Honoris Causa) from the prestigious Oral Roberts University, Tulsa, Oklahoma, USA on October 30, 2025.',
            'An avid (lawn) tennis player, football follower, radio presenter (since 1987), teacher, and interactive Master of Ceremonies, Karibi is the author of four books — The Master of Ceremonies Handbook (2000), Write On, Civil Servant (2022), Tales from School of Laws (2022), and (ed) 100 Years of Worship and Ministry: The Story of First Baptist Church Port Harcourt 1922-2022 — and many articles on literature, communications, law, and education.',
            'He is married and the marriage is blessed with children.',
        ],
    },

    {
        slug: 'thankgod-chimene-azubuike',
        name: 'ThankGod Chimene Azubuike',
        title: 'Director of Finance',
        photo: '/ThankGod Azubuike.jpeg',
        bio: [
            'Azubuike, ThankGod Chimene is a distinguished finance professional, accountant, consultant, and academic practitioner with extensive experience in financial management, auditing, taxation, corporate governance, and strategic business advisory.',
            'As a lecturer, he brings to the classroom a rare blend of academic grounding and real-world professional experience. With a Master’s degree in Monetary Economics from Rivers State University and a Doctor of Business Administration from London Bridge Business School, United Kingdom, he continues to deepen his scholarship in finance, economics, management, and institutional strategy.',
            'Mr Azubuike is an Associate Member of the Institute of Chartered Accountants of Nigeria, a member of the Chartered Institute of Taxation of Nigeria, and registered with the Financial Reporting Council of Nigeria. He is also a Fellow of the Institute of Management Consultants, Nigeria, and the African Institute of Public Administration, with additional professional certifications as a Certified Fraud Examiner, Certified Management Consultant, and Certified Management Professional.',
            'Over the years, he has held strategic finance and advisory roles across various organisations, including serving as Chief Accountant at Nedogas Development Company Limited and Personal Accountant to the Chairman of Lasien Group. He currently serves as Managing Consultant of Ace Integrated Services Limited and Managing Partner of ThankGod C. Azubuike & Co., where he provides accounting, audit, tax, and business advisory services to corporate institutions, public sector organisations, and non-profit entities.',
            'Driven by a passion for mentorship and professional formation, Mr Azubuike has devoted part of his career to teaching financial accounting, business management, finance, and related professional accounting subjects. His teaching style is practical, engaging, and industry-focused, designed to help students connect classroom theory with business realities, ethical decision-making, and professional competence.',
            'Through his work as a lecturer, consultant, and finance leader, ThankGod Chimene Azubuike remains committed to shaping knowledgeable, ethical, and solution-driven professionals prepared to contribute meaningfully to the accounting, finance, business, and economic development landscape.',
        ],
    },

    {
        slug: 'tamunodiepiriye-gift-ajubo',
        name: 'Tamunodiepiriye Gift Ajubo',
        title: 'Director, Academic Affairs',
        photo: '/Tamunodiepiriye Ajubo.jpeg',
        bio: [
            'Educator · Strategic Leader · Engineer · EQ Practitioner',
            'Some academic leaders are built in lecture halls. Tamunodiepiriye Gift Ajubo was built in both — forged equally by the precision of engineering and the purposeful science of education. Holding dual Master’s degrees from Cranfield University and Coventry University in the United Kingdom, alongside a Postgraduate Diploma in Education, he brings to academic leadership something rare: the analytical rigour of an engineer and the transformative instinct of a true educator.',
            'His story is one of institutions reimagined. As Founder and Executive Director of Gesemville International Academy, he tore up a conventional curriculum and rebuilt it around the future — introducing STEM, Robotics, Programming, and Coding at a time when few dared. The results spoke for themselves: enrolment grew by 160%, driven entirely by academic reputation. He built governance frameworks, performance systems, and strategic community partnerships that turned a small school into a model of institutional excellence.',
            'For a decade, he simultaneously shaped human beings at their core — serving as an Emotional Intelligence Consultant with Kallsgate Limited, designing EQ programmes for schools and corporations that measurably improved how people communicate, collaborate, and lead. He understands, deeply, that no curriculum succeeds where human development fails.',
            'Today, as a Data Engineer supporting TotalEnergies field operations, he builds the real-time intelligence systems that drive critical production decisions — proof that his systems thinking and evidence-led rigour are not classroom theory, but lived operational competencies. This is the lens through which he leads: structured, precise, and always focused on outcomes that matter.',
            'Tamunodiepiriye Gift Ajubo does not manage academic affairs. He architects them — with the mind of an engineer, the vision of a strategist, and an unshakeable belief in what education, done right, can do.',
        ],
    },

    {
        slug: 'walnshak-solomon-guteng',
        name: 'Walnshak Solomon Guteng',
        title: 'Registrar (Acting)',
        photo: '/Guteng.jpeg',
        bio: [
            'Guteng Walnshak Solomon is a communications and knowledge management professional with over seven years of experience leading strategic communications, brand positioning, and stakeholder engagement across complex, donor-funded development and resilience programmes in Nigeria. He specialises in translating technical and evidence-based programme outcomes into clear, compelling narratives that inform decision-making and enhance institutional credibility. He has extensive experience working with senior leadership, technical teams, donors, government stakeholders, and communities to document impact, support learning, and deliver high-quality internal and external communications. His work spans executive reporting, media engagement, digital communications, and the production of knowledge products that strengthen visibility, accountability, and influence.',
            'Guteng has played a critical role in designing and strengthening organisational knowledge management systems, facilitating structured learning and reflection processes, and ensuring compliance with knowledge standards. He is highly skilled in aligning communication and knowledge functions to support adaptive management, programme performance, and strategic growth. In addition to his development sector expertise, Guteng brings experience and passion in facilitating learning and promoting tourism and hospitality through tailored communication approaches that connect people, culture, and opportunities.',
            'Over the course of his career, Guteng has held progressively responsible communication and knowledge management roles across leading international NGOs and development programmes, including Palladium, Mercy Corps (now Prosper Global), CCDRN, and The Ake Collective. His experience spans FCDO, USAID, BMZ, WFP, UN Women, and GIZ-funded initiatives implemented across Nigeria’s North Central, Northeast, and Northwest regions. In these roles, he has led strategic communications, supported large-scale resilience and market systems programmes, strengthened organisational knowledge systems, and embedded learning and visibility into programme delivery within complex and conflict-affected contexts. Known for his collaborative leadership style, strong work ethic, and commitment to continuous improvement, Guteng is driven by the belief that well-executed communication is a strategic asset that advances organisational missions, reinforces trust, and amplifies impact at scale.',
        ],
    },

    {
        slug: 'dr-sunday-odum',
        name: 'Dr. Sunday Edum',
        title: 'Director, Academic Partnership',
        photo: '/Dr. Edum.jpeg',
        bio: [
            'Dr. Sunday Edum is a Nigerian scholar, lecturer, researcher, administrator, theatre practitioner, and rights activist from Okana in Abua–Odual Local Government Area of Rivers State.',
            'He obtained his Bachelor’s and Master’s degrees in Theatre Arts from the University of Port Harcourt and later earned a PhD in Theatre and Film Studies from Nnamdi Azikiwe University between 2008 and 2017.',
            'Dr. Edum is a lecturer in the Department of Theatre and Film Studies at the University of Port Harcourt, where he teaches courses in Directing, Acting, Theatre and Entrepreneurship, Theatre and Tourism, and Production Management. He is recognised for his dedication to teaching, mentorship, research, and academic administration.',
            'His scholarly engagements include writing, presenting, and publishing academic papers and reviews at conferences, workshops, and in journals and book chapters. He has over 36 local publications and 13 international journal publications to his credit.',
            'Between 2021 and 2025, he served as Associate Dean, Student Affairs at the University of Port Harcourt, contributing immensely to student welfare and institutional administration. He is currently on sabbatical leave at the Federal University of Environment and Technology, where he serves as the pioneer Dean of Student Affairs.',
            'Professionally, he serves as Assistant Secretary and Public Relations Officer of the Society of Nigerian Theatre Artists (SONTA) and is also a member of the National Association of Nigerian Theatre Arts Practitioners (NANTAP). In addition, he is a member of the Academic Staff Union of Universities (ASUU).',
            'Beyond academia, Dr. Edum is a talented drummer, an active footballer, and a dedicated rights activist who is passionate about justice, equity, and the advancement of society.',
        ],
    },
    {
        slug: 'iminabo-vivian-yellowe-sekibo',
        name: 'Iminabo Vivian Yellowe Sekibo',
        title: 'Academic Advisor',
        photo: '/Iminabo Vivian Sekibo Yellowe.jpeg',
        bio: [
            'Iminabo Vivian Yellowe Sekibo is a seasoned administrator, human resource professional, and technology-driven strategist with a strong passion for academic excellence, leadership development, and professional mentorship.',
            'She holds a Master of Science (M.Sc.) degree in Human Resource Management and a Postgraduate Diploma in Management Sciences from Rivers State University, alongside a Bachelor of Science (B.Sc.) degree in Computing and Information Systems from Oxford Brookes University. She also obtained both the International Diploma and Advanced International Diploma in Computing from Informatics Academy Singapore. Her educational background combines management, technology, research, and organizational development, equipping her with a multidimensional approach to academic leadership.',
            'With professional experience spanning banking operations, administration, accounting, customer relationship management, project coordination, and data systems management, Iminabo has built a reputation for excellence, integrity, and strategic problem-solving.',
            'Beyond her corporate experience, she possesses a deep interest in research, human capital development, mentoring, and effective organizational management. Her academic research focused on employee commitment and incentive systems, reflecting her passion for institutional growth and people development.'
        ]
    }
];

export function getLeader(slug: string): LeadershipMember | undefined {
    return LEADERSHIP.find((m) => m.slug === slug);
}
