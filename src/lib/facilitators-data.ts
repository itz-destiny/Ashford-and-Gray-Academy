/**
 * Facilitators — Ashford & Gray Fusion Academy.
 * Surfaced at /facilitators ("Meet Our Facilitators").
 */

export type Facilitator = {
    slug: string;
    name: string;
    postNominals?: string;
    title: string;
    photo?: string; // path under /public — undefined falls back to a placeholder
    bio: string[];
    expertise?: string[]; // optional "Core Expertise" bullet list
};

export const FACILITATORS: Facilitator[] = [
    {
        slug: 'dandy-t-i-banigo',
        name: 'Barrister Dandy T. I. Banigo',
        title: 'Lead Facilitator – Protocol Management',
        photo: '/facilitators/dandy-banigo.jpeg',
        bio: [
            'Barrister Dandy T. I. Banigo is an accomplished legal practitioner, legislative affairs professional, and protocol specialist with over two decades of distinguished experience spanning legal practice, government, legislative administration, executive support, and high-level protocol management.',
            'As the Head of Chambers at Beach Pebble Solicitors, he has built a reputation for professional excellence, sound legal counsel, ethical leadership, and an unwavering commitment to service. Throughout his career, he has successfully combined legal expertise with executive administration and protocol coordination, making him a highly respected practitioner in both the public and private sectors.',
            'His extensive experience within Nigeria’s legislative institutions includes serving as Executive Assistant to the Majority Leader of the Bayelsa State House of Assembly (2011–2015) and subsequently as Senior Legislative Aide in the House of Representatives (2015–2019). These roles provided him with significant exposure to legislative processes, public administration, stakeholder engagement, policy support, executive coordination, and government protocol.',
            'Beyond the legal and legislative space, Barr. Banigo is widely recognized for his practical expertise in VIP Protocol and Executive Event Management. He served as Head of VIP Protocol at House on the Rock, Heritage House, Port Harcourt (2016–2022), where he led protocol operations for senior ministers, dignitaries, government officials, corporate executives, and distinguished guests during major conferences and high-impact events.',
            'His protocol leadership has further extended to national platforms, including serving as Head of VIP Protocol for the Youth Leadership Convention, Lagos (2025), alongside coordinating protocol operations for numerous high-profile governmental, corporate, and faith-based engagements.',
            'Barr. Banigo’s unique blend of legal knowledge, legislative experience, executive administration, and practical protocol leadership equips him with a comprehensive understanding of the principles, systems, and professional standards required to manage high-level engagements with precision and excellence.',
            'At Ashford & Gray Fusion Academy, he serves as the Lead Facilitator for Protocol Management, where he mentors emerging hospitality and protocol professionals in executive protocol, VIP guest management, official ceremonies, legislative and governmental protocol, event coordination, diplomatic etiquette, and the professional standards required for world-class service delivery.',
            'Recognized for his calm leadership, integrity, professionalism, and meticulous attention to detail, Barr. Banigo remains passionate about raising a new generation of protocol professionals who embody excellence, discipline, discretion, and exceptional service.',
        ],
        expertise: [
            'Executive & VIP Protocol Management',
            'Legislative Affairs & Government Relations',
            'Diplomatic & Official Protocol',
            'Executive Administration',
            'Event & Ceremony Coordination',
            'Stakeholder Engagement',
            'Legal Practice & Advisory',
            'Public Sector Administration',
            'Leadership & Professional Ethics',
            'Hospitality Protocol and Guest Experience',
        ],
    },
    {
        slug: 'karibi-t-george',
        name: 'Karibi T. George, Esq.',
        postNominals: 'fnipr, RPA, CT, MICMC, DDF, DHCD (Honoris Causa)',
        title: 'Facilitator – Communications',
        photo: '/facilitators/karibi-george.jpeg',
        bio: [
            'Karibi T. George, Esq. is a distinguished communications strategist, legal practitioner, mediator, educator, and public relations professional with over three decades of impactful experience spanning public administration, strategic communications, education, law, media, and leadership development.',
            'He retired meritoriously from the Rivers State Civil Service as Director, Administration and Supplies/Public Relations at the Rivers State Universal Basic Education Board (RSUBEB), where he provided strategic leadership in public administration, institutional communications, stakeholder engagement, and organizational governance. He currently practices law with Unity Law Firm, Port Harcourt, while continuing to provide consultancy, advisory, and training services in communications, leadership, and public affairs.',
            'Karibi holds a Bachelor of Arts in English and a Master’s degree in Oral Literature from the University of Jos. He further obtained professional qualifications in Public Relations and Advertising Practice, a Bachelor of Laws (LL.B.) from Rivers State University, the Barrister-at-Law (B.L.) qualification from the Nigerian Law School, and a Postgraduate Diploma in Education from the National Open University of Nigeria (NOUN).',
            'A Fellow of the Nigerian Institute of Public Relations (NIPR), Certified Teacher, Chartered Mediator, and member of several prestigious professional bodies, he has served in numerous leadership capacities, including Chairman of the Rivers State Chapter of the NIPR, member of the Institute’s Governing Council, and currently Chairman of the NIPR Legal Advisory Committee. He also serves on the Commission on Human Rights, Peace Building and Reconciliation of the Baptist World Alliance.',
            'An accomplished public speaker and trainer, Karibi has facilitated conferences, seminars, and executive learning sessions for leading professional and corporate organizations, including the Nigerian Institute of Public Relations (NIPR), Nigerian Bar Association (NBA), Advertising Regulatory Council of Nigeria (ARCON), Rotary International, FIDA, and several faith-based and leadership institutions. His expertise covers strategic communication, public relations, media engagement, advocacy, leadership communication, conflict resolution, and public speaking.',
            'He is an accomplished author with several published works and has received numerous national and international recognitions for his outstanding contributions to public relations, education, professional development, and humanitarian service, including the prestigious Public Relations Personality of the Year, Diamond Award for Professional Service, and an Honorary Doctorate in Human Capacity Development.',
            'At Ashford & Gray Fusion Academy (AGFA), Karibi T. George serves as the Facilitator for Communications, where he equips participants with practical competencies in strategic communication, public relations, corporate messaging, executive speaking, stakeholder engagement, media relations, and professional communication for leadership and organizational excellence.',
        ],
    },
    {
        slug: 'ezoh-omorojor-emmanuel',
        name: 'Ezoh Omorojor Emmanuel',
        title: 'Facilitator – Protocol Management',
        photo: '/facilitators/ezoh-omorojor.jpeg',
        bio: [
            'Ezoh Omorojor Emmanuel is a seasoned Protocol and Administrative Professional with over 15 years of professional experience spanning education, organizational administration, and executive protocol coordination. He combines a strong foundation in teaching and human development with more than a decade of practical, hands-on experience in protocol management, where he has successfully coordinated official engagements, managed VIP movements, and supported the seamless execution of high-level events.',
            'Renowned for his calm disposition, organizational discipline, and meticulous attention to detail, Ezoh has built a reputation for ensuring that protocol operations are executed with professionalism, precision, and respect for institutional standards. His practical experience covers event coordination, guest reception and hospitality, executive logistics, ceremonial procedures, stakeholder engagement, and the implementation of protocol systems that promote efficiency and organizational excellence.',
            'His background as an educator further strengthens his ability to communicate effectively, mentor emerging professionals, and simplify complex operational concepts into practical learning experiences. He is passionate about developing professionals who understand that protocol extends beyond etiquette to become a strategic tool for leadership, institutional image, relationship management, and service excellence.',
            'A graduate of Lagos State University, Ezoh remains committed to continuous professional development through workshops, seminars, and industry training. His blend of classroom experience and extensive field practice makes him uniquely positioned to bridge theory with real-world application.',
            'At Ashford & Gray Fusion Academy, Ezoh Omorojor Emmanuel serves as a Facilitator in Protocol Management, where he equips participants with practical competencies in executive protocol, official ceremonies, VIP management, professional conduct, event protocol systems, and international best practices required to excel in both public and private sector organizations.',
        ],
    },
    {
        slug: 'napoleon-godfrey-koko',
        name: 'Napoleon Godfrey Koko',
        postNominals: 'ANIM, ANISM',
        title: 'Facilitator – Restaurant Management and Hospitality Standards',
        photo: '/facilitators/napoleon-koko.jpeg',
        bio: [
            'Napoleon Godfrey Koko is an accomplished hospitality professional and consultant with over 25 years of progressive experience spanning both the theoretical and practical dimensions of hospitality management. A graduate of Rivers State University, Nigeria, he has built a distinguished career in hotel operations, hospitality administration, and service excellence, earning a reputation for operational efficiency, quality assurance, and professional standards.',
            'His extensive expertise covers the full spectrum of hospitality operations, including restaurant management, banquet services, outdoor catering, VIP hospitality, industrial catering, hotel administration, and overall hotel operations. Throughout his career, he has consistently championed best practices in service delivery, operational excellence, and customer satisfaction, contributing significantly to the growth and professionalization of the hospitality industry.',
            'Mr. Koko is an Associate Member of the Nigerian Institute of Management (NIM) and the Nigerian Institute of Strategic Management (NISM), reflecting his commitment to continuous professional development and strategic leadership.',
            'He currently serves as a Hospitality Consultant and as the Executive Secretary/Head of Training and Compliance of the Nigeria Hotel Association, Rivers State Chapter, where he provides strategic leadership in professional training, industry compliance, quality assurance, and capacity development for hospitality practitioners.',
            'At Ashford & Gray Fusion Academy, Mr. Koko serves as a Facilitator in Restaurant Management and Hospitality Standards, where he equips aspiring hospitality professionals with practical, industry-driven knowledge in restaurant operations, food service management, service quality, operational standards, and hospitality best practices. His blend of hands-on industry experience and leadership insight makes him an invaluable resource in preparing learners for excellence in today’s dynamic hospitality sector.',
        ],
    },
    {
        slug: 'thankgod-chimene-azubuike',
        name: 'ThankGod Chimene Azubuike',
        title: 'Facilitator – Finance, Economics and Business Management',
        photo: '/facilitators/thankgod-azubuike.jpeg',
        bio: [
            'ThankGod Chimene Azubuike is a distinguished finance professional, accountant, management consultant, business adviser and academic practitioner with extensive experience spanning financial management, auditing, taxation, corporate governance, monetary economics and strategic business advisory.',
            'He brings to the learning environment a valuable combination of academic depth, professional competence and practical industry experience. His multidisciplinary background enables him to translate complex financial, economic and management concepts into clear, relevant and applicable knowledge for professionals, entrepreneurs, executives and emerging business leaders.',
            'Mr. Azubuike holds a Master’s degree in Monetary Economics from Rivers State University and a Doctor of Business Administration from London Bridge Business School, United Kingdom. His academic and professional development reflects a sustained commitment to scholarship and practice across finance, economics, accounting, management and institutional strategy.',
            'He is an Associate Member of the Institute of Chartered Accountants of Nigeria and a member of the Chartered Institute of Taxation of Nigeria. He is also registered with the Financial Reporting Council of Nigeria. In recognition of his expertise in management and advisory practice, he is a Fellow of the Institute of Management Consultants, Nigeria, and the African Institute of Public Administration.',
            'His additional professional credentials include Certified Fraud Examiner, Certified Management Consultant and Certified Management Professional. These qualifications reinforce his capacity to address financial accountability, risk management, fraud prevention, organisational performance and ethical corporate decision-making.',
            'Over the course of his career, Mr. Azubuike has held strategic finance, accounting and advisory responsibilities across diverse organisations. He previously served as Chief Accountant at Nedogas Development Company Limited and as Personal Accountant to the Chairman of Lasien Group.',
            'He currently serves as Managing Consultant of Ace Integrated Services Limited and Managing Partner of ThankGod C. Azubuike & Co. In these capacities, he provides accounting, audit, taxation, financial management and business advisory services to corporate institutions, public-sector organisations and non-profit entities.',
            'Beyond professional practice, Mr. Azubuike is deeply committed to teaching, mentorship and the development of future-ready professionals. He has taught financial accounting, finance, business management and related professional accounting subjects, helping learners understand the relationship between financial information, economic conditions, organisational strategy and sustainable business performance.',
            'As Facilitator for Finance, Economics and Business Management at Ashford & Gray Fusion Academy, he provides learners with an integrated understanding of how financial discipline, economic reasoning and sound management practices influence organisational success. His sessions are practical, engaging and industry-focused, enabling participants to connect theoretical principles with budgeting, financial analysis, resource allocation, taxation, business planning, risk management and strategic decision-making.',
            'His facilitation approach emphasises financial literacy, ethical leadership, commercial awareness, analytical thinking and responsible stewardship of organisational resources. Through case-based learning and practical business applications, he prepares participants to make informed decisions, interpret financial and economic information and contribute meaningfully to the growth and sustainability of their organisations.',
            'Through his work as a finance leader, consultant, lecturer and mentor, ThankGod Chimene Azubuike remains committed to developing knowledgeable, ethical and solution-driven professionals equipped to contribute to the advancement of finance, enterprise, institutional governance and economic development.',
        ],
    },
    {
        slug: 'julia-oku-jacks',
        name: 'Julia Oku Jacks',
        postNominals: 'frpa',
        title: 'Facilitator, Brand Management',
        photo: '/facilitators/julia-oku-jacks.jpeg',
        bio: [
            'Julia Oku Jacks is an accomplished brand strategist, transformational coach, creative industry leader and business development consultant with extensive experience in advertising, corporate branding, communications, leadership and enterprise growth.',
            'She is the Founder and Lead Consultant of Julia Jacks Consulting, a personal and business brand development organisation dedicated to helping entrepreneurs, business owners and growing enterprises build stronger brands, enhance visibility and achieve sustainable impact and profitability.',
            'A First-Class graduate of English and Literary Studies from the University of Calabar, Julia began her professional career in copywriting at Insight Communications, now Insight Publicis. She subsequently co-founded SO&U M&C Saatchi, where she served as Executive Creative Director. She remains a member of the organisation’s Board in a Non-Executive capacity.',
            'Over the course of her career, Julia has contributed significantly to Nigeria’s advertising, branding and creative industries. She served on the Brand Nigeria programme team under the leadership of the late Dr. Dora Akunyili and currently serves as a member of the Advertising Offences Tribunal under the auspices of the Advertising Regulatory Council of Nigeria.',
            'She is a Fellow of the Advertising Regulatory Council of Nigeria and a 2021 Lagos Advertising and Ideas Festival Hall of Fame Honouree. She is also a Co-Founder of Women in Management, Business and Public Service, a leading organisation committed to advancing the participation and leadership of women in business, management and public service.',
            'Julia serves as a Non-Executive Director of First Aluminium Nigeria Plc and sits on the boards of several reputable organisations. She is Chair of the Board of Directors of Street Project Foundation, a nationally recognised, youth-focused social enterprise that empowers young people through creative education and enterprise development. She also serves as a Trustee of Hopeful Future Foundation, a Rivers State-based nonprofit organisation that provides educational resources and development opportunities for indigent secondary school students.',
            'A certified Transformational Coach and strategic thinker, Julia deploys coaching, mentoring, storytelling, training and brand strategy to help African businesses and their owners clarify their identities, strengthen their market positioning, amplify their voices, improve visibility and compound their impact and profitability.',
            'As Facilitator for Brand Management at Ashford & Gray Fusion Academy, Julia brings exceptional expertise in brand strategy, personal branding, corporate identity, storytelling, reputation management, market positioning and sustainable brand development.',
        ],
    },
    {
        slug: 'maimoona-sheila-salim',
        name: 'Dr. Maimoona Sheila Salim',
        title: 'Facilitator – Leadership Development and Professional Ethics',
        photo: '/facilitators/maimoona-salim.jpeg',
        bio: [
            'Dr. Maimoona Sheila Salim is an accomplished leadership strategist, social entrepreneur, executive mentor, and nonprofit development expert with over twenty-five years of distinguished experience spanning the private sector, civil society, international development, and executive leadership across Africa.',
            'Widely respected for her transformational approach to leadership development and ethical governance, she has successfully designed and led high-impact initiatives that empower emerging leaders, strengthen institutions, and promote sustainable social change. Her work has influenced thousands of women, youth, entrepreneurs, nonprofit professionals, and community leaders across more than nine African countries.',
            'As the Group Chief Operations Executive of SI Group International, Dr. Salim provides strategic leadership for regional programmes focused on enterprise development, leadership capacity building, women’s economic empowerment, and cross-sector collaboration. Her ability to translate vision into measurable impact has positioned her as a trusted advisor to organisations seeking sustainable growth, ethical leadership, and inclusive development.',
            'An accomplished facilitator, executive coach, and master trainer, she has delivered numerous executive learning programmes in leadership development, professional ethics, emotional intelligence, self-mastery, entrepreneurship, organisational excellence, STEAM education, and youth transformation. Her facilitation style combines practical experience, strategic insight, and values-based leadership, creating learning environments that inspire innovation, accountability, and lasting behavioural change.',
            'Beyond executive leadership, Dr. Salim serves on several governing boards and advisory bodies, contributing to policy development, youth advancement, women’s leadership, peacebuilding, and community development. She currently serves as Board Chairperson of Peace Players South Africa, is a Board Member and Director of International Services at the Rotary Club, Abuja, and sits on the Governing Council of the Women Community in Africa, where she champions ethical leadership, gender inclusion, and sustainable development across the continent.',
            'Her distinguished career has earned her recognition as a respected voice in leadership, governance, nonprofit sustainability, youth development, and social innovation. She is a frequent speaker at international conferences and leadership forums, where she shares practical insights on ethical leadership, organisational transformation, women’s empowerment, and building resilient institutions.',
            'At Ashford & Gray Fusion Academy (AGFA), Dr. Maimoona Sheila Salim serves as Facilitator for Leadership Development and Professional Ethics, where she equips executives, entrepreneurs, emerging leaders, and professionals with the mindset, principles, and ethical competencies required to lead with integrity, influence, and lasting impact in today’s dynamic global environment.',
        ],
    },
    {
        slug: 'emmanuel-iruayenama',
        name: 'Dr. Emmanuel Iruayenama',
        postNominals: 'PhD, FCIPM, CMC, FNIM',
        title: 'Facilitator – Hospitality Labour Management',
        bio: [
            'Dr. Emmanuel Iruayenama is a distinguished Human Resources and Industrial Relations executive, management consultant, corporate affairs strategist, and academic with over twenty-five years of progressive leadership experience spanning manufacturing, oil and gas support services, facilities management, hospitality, consultancy, academia, and professional services in Nigeria.',
            'A licensed Human Resources Practitioner, Chartered Management Consultant, and Fellow of the Chartered Institute of Personnel Management of Nigeria (CIPM) and the Nigerian Institute of Management (NIM), Dr. Iruayenama has built an exceptional career in organizational leadership, workforce transformation, employee relations, and strategic business advisory. Throughout his professional journey, he has held senior leadership positions with renowned organizations, including the Nigeria Employers’ Consultative Association (NECA), Nigeria Engineering Works Limited, Sodexo Nigeria Limited, and Catering and Facilities Solutions Nigeria Limited. He currently serves as the Managing Consultant and Chief Executive Officer of DAVIC Professional Consultancy Limited, where he provides strategic consulting and advisory services to organizations across diverse sectors.',
            'His influence extends beyond corporate leadership into public sector governance. Dr. Iruayenama serves as a Member of the Governing Board of the Delta State Contributory Health Commission, contributing to policy formulation, institutional oversight, and strategic decision-making. As a trusted management consultant, he has advised several leading organizations, including AOS Orwell Nigeria Limited, Frank’s International, Oando Plc, GE Nigeria, C & I Leasing Plc, Intels Nigeria Limited, and numerous other reputable institutions, helping them strengthen organizational performance, industrial harmony, and sustainable growth.',
            'An accomplished scholar, he holds a Bachelor of Science (B.Sc.) in Business Administration (Management), a Master of Business Administration (MBA) in Business Management, a Master of Science (M.Sc.) in Human Resource Management, and a Doctor of Philosophy (Ph.D.) in Leadership and Management. He is currently pursuing a second Doctor of Philosophy (Ph.D.) in Industrial Relations at Rivers State University, where his research focuses on Conflict Resolution Strategies and Industrial Harmony.',
            'A respected facilitator, mediator, author, traditional chief, and thought leader, Dr. Iruayenama is widely recognized for his expertise in Human Resource Management, Industrial Relations, Organizational Development, Leadership, Corporate Governance, and Conflict Resolution. He is the author of the forthcoming manuscript, Fundamentals of Human Resources Management and Industrial Relations in Nigeria, reflecting his enduring passion for advancing professional practice and developing future leaders.',
            'At Ashford & Gray Fusion Academy (AGFA), Dr. Emmanuel Iruayenama serves as a Facilitator in Hospitality Labour Management, where he combines extensive industry experience with academic excellence to prepare learners for effective people management, productive industrial relations, ethical leadership, and sustainable organizational success.',
        ],
    },
    {
        slug: 'steve-chukwuemeka-john-n',
        name: 'Dr. Steve Chukwuemeka John-N',
        title: 'Facilitator – Events Management',
        bio: [
            'Dr. Steve Chukwuemeka John-N is an accomplished Events Management and Protocol Specialist, Leadership Facilitator, Creative Producer, Broadcaster, Public Relations Professional, and Strategic Communications Consultant with extensive experience delivering transformative solutions across the events, media, public engagement, and creative industries.',
            'Renowned for his strategic insight, innovative thinking, and unwavering commitment to excellence, he has built an outstanding reputation for designing and executing high-impact events, developing leaders, and advancing meaningful stakeholder engagement. His ability to combine creativity with operational precision has made him a respected professional and sought-after resource person within Nigeria and beyond.',
            'Throughout his distinguished career, Dr. John-N has received numerous recognitions from government institutions, professional associations, humanitarian organisations, and educational bodies in acknowledgment of his contributions to leadership development, community advancement, and professional excellence.',
            'As a Certified Global Ambassador for MAXYTS International, he actively champions initiatives that promote sustainable development, youth empowerment, and global collaboration in support of the United Nations Sustainable Development Goals (SDGs).',
            'Dr. John-N serves as Lead Facilitator for the internationally recognised Event Management Certificate Programme (EMCERTPRO), where he mentors aspiring and experienced event professionals in contemporary event planning, protocol administration, stakeholder management, experiential design, and operational excellence. His facilitation style combines practical industry experience with globally relevant best practices, enabling participants to translate knowledge into measurable professional success.',
            'Over the years, he has facilitated executive trainings, conferences, seminars, workshops, and capacity-building programmes for corporate organisations, government agencies, educational institutions, entrepreneurs, and emerging professionals. His passion for mentoring and developing future leaders continues to inspire individuals and organisations to pursue excellence, innovation, and lasting impact.',
            'At Ashford & Gray Fusion Academy, Dr. Steve Chukwuemeka John-N serves as Facilitator for Events Management, where he prepares participants to master the principles of strategic event planning, protocol, logistics coordination, stakeholder engagement, hospitality integration, and experiential event delivery. Through his wealth of industry experience and practical insights, he equips learners with the competence, confidence, and professional discipline required to deliver world-class events that create lasting value for organisations, institutions, and communities.',
            'His professional philosophy is founded on the belief that exceptional events are not merely organised—they are intentionally designed, strategically managed, and flawlessly delivered to create memorable experiences and enduring impact.',
        ],
    },
    {
        slug: 'akeem-adeoye-fashola',
        name: 'Akeem Adeoye Fashola',
        postNominals: 'CIHTMRDN, CIHTMA, NIHOTOUR, Doctoral Fellow',
        title: 'Facilitator – Core Hospitality and Guest Experience Management',
        photo: '/facilitators/akeem-fashola.jpeg',
        bio: [
            'Akeem Adeoye Fashola is an accomplished Hospitality Management Executive, Hotel Operations Specialist and Hospitality Consultant with over fifteen years of progressive experience spanning the United Kingdom and Nigeria. Renowned for his expertise in hotel operations, guest experience management, service excellence and hospitality workforce development, he has built a distinguished career delivering operational transformation and professional training across diverse hospitality environments.',
            'His international hospitality experience includes operational roles with globally recognised brands such as Novotel Manchester West, Golden Tulip Manchester, Premier Inn Manchester and Sodexo Hospitality Group, UK, where he developed extensive expertise in guest services, front office operations, hospitality standards and customer experience.',
            'In Nigeria, Akeem has held key leadership positions including General Manager at Hotel De Island and Sweat Life Homes, Front Office Manager at Best Western De Island Hotel, and Rooms Division Manager at Planet One Hospitality. Throughout his career, he has successfully led hotel pre-opening projects, operational restructuring, staff recruitment, service improvement initiatives and organisational capacity development for several hospitality establishments across the country.',
            'A respected hospitality consultant and trainer, Akeem has facilitated hospitality transformation, operational audits and workforce development programmes for numerous hotels and hospitality organisations, helping to improve service delivery, operational efficiency and guest satisfaction through the implementation of industry best practices.',
            'He holds professional qualifications in Hospitality Management, Interior Design, Business Computing and Graphics, complemented by extensive executive training in hotel operations, guest experience, health and safety, hospitality leadership and service excellence. He is a member of recognised professional hospitality bodies, including CIHTMRDN, CIHTMA and NIHOTOUR, and is a Doctoral Fellow.',
            'At Ashford & Gray Fusion Academy (AGFA), Akeem serves as Facilitator for Core Hospitality and Guest Experience Management, where he brings his wealth of international experience and practical industry knowledge to prepare hospitality professionals for excellence in service delivery, operational leadership and exceptional guest experiences.',
        ],
    },
    {
        slug: 'peter-kanayo-adigwu',
        name: 'Peter Kanayo Adigwu',
        title: 'Facilitator – Digital Business Management',
        bio: [
            'Peter Kanayo Adigwu is a Business Development Strategist, Digital Marketing Professional, Business Analyst, and Educator with extensive experience in business growth, digital transformation, customer acquisition, and learning development. With over seven years of professional experience across the education, healthcare, and creative sectors, he has consistently helped organisations leverage digital innovation and strategic marketing to achieve measurable business results.',
            'A results-driven professional with a passion for developing sustainable business solutions, Peter has successfully designed and implemented high-impact digital marketing campaigns, customer engagement strategies, and business improvement initiatives that have significantly increased revenue, expanded market reach, and strengthened organisational performance.',
            'His professional experience includes delivering strategic digital solutions that generated substantial business growth for clients, including driving multimillion-naira revenue growth for healthcare organisations and expanding student enrolment for educational institutions through data-driven marketing, digital visibility optimisation, and customer relationship management (CRM) systems. His expertise spans business analysis, content strategy, digital communications, marketing automation, and organisational growth.',
            'Beyond his corporate accomplishments, Peter possesses a deep commitment to education and human capital development. With more than eight years of teaching, tutoring, mentoring, and training experience, he has developed a practical, learner-centred approach that bridges academic knowledge with real-world business application. His ability to simplify complex concepts and translate industry practices into actionable learning experiences has earned him recognition as an engaging facilitator and mentor.',
            'Peter holds a Bachelor of Science (B.Sc.) degree in Biochemistry from the University of Port Harcourt and has earned professional certifications in Email Marketing, Direct Response Copywriting, Data Analytics, Data Science, and Blockchain Technology, demonstrating his commitment to continuous learning and staying at the forefront of emerging digital technologies.',
            'At Ashford & Gray Fusion Academy, Peter Kanayo Adigwu serves as Facilitator for Digital Business Management, where he equips participants with practical competencies in digital marketing, e-commerce, business analytics, customer acquisition strategies, and digital business transformation. Through a blend of strategic insight, hands-on industry experience, and contemporary best practices, he prepares learners to build resilient businesses, harness digital technologies, and compete successfully in today’s rapidly evolving global economy.',
            'Peter’s professional philosophy is centred on the conviction that businesses thrive when innovation, data, strategy, and people are aligned to create sustainable value, measurable growth, and lasting impact.',
        ],
    },
    {
        slug: 'ewaoche-thomas-elaigwu',
        name: 'Ewaoche Thomas Elaigwu',
        title: 'Facilitator – Food and Beverage Management',
        photo: '/facilitators/ewaoche-elaigwu.jpeg',
        bio: [
            'Ewaoche Thomas Elaigwu is an accomplished Hospitality Management Professional, Food and Beverage Operations Specialist, and Business Executive with over twenty-seven years of progressive experience in hotel operations, hospitality service delivery, and business management. Throughout his distinguished career, he has consistently demonstrated a strong commitment to operational excellence, service quality, and organisational growth within the hospitality industry.',
            'A graduate of the University of Abuja, Mr. Elaigwu has built extensive expertise across the core functions of hotel operations, with particular strength in Food and Beverage Management, guest service delivery, operational planning, and hospitality administration. His practical experience, combined with a deep understanding of hospitality standards and customer expectations, has positioned him as a respected professional capable of driving sustainable business performance.',
            'As the Chief Executive Officer of Tomtino Multi Concept Limited, he provides strategic leadership in hospitality operations, business development, and service innovation. Under his leadership, the organisation has maintained a strong focus on operational efficiency, quality assurance, customer satisfaction, and continuous improvement while developing practical solutions that enhance business performance and long-term profitability.',
            'Throughout his career, Mr. Elaigwu has established a proven record in capacity building, operational leadership, cost control, revenue optimisation, workforce development, and hospitality systems management. He has successfully led teams, implemented operational best practices, and cultivated service cultures that consistently deliver memorable guest experiences while improving organisational productivity and financial performance.',
            'Known for his disciplined leadership style, effective communication, and analytical problem-solving abilities, he is passionate about mentoring hospitality professionals and developing high-performing teams capable of meeting the evolving demands of the global hospitality industry. His practical approach to leadership combines operational discipline with people development, ensuring that service excellence remains at the centre of organisational success.',
            'At Ashford & Gray Fusion Academy, Ewaoche Thomas Elaigwu serves as Facilitator for Food and Beverage Management, where he equips participants with practical knowledge and industry best practices in restaurant operations, beverage management, customer service excellence, cost management, menu planning, team leadership, and hospitality operations. Drawing upon nearly three decades of hands-on industry experience, he prepares learners to confidently manage modern food and beverage operations while delivering exceptional guest experiences and sustainable business results.',
            'His professional philosophy is founded on the belief that exceptional hospitality is achieved through disciplined leadership, operational excellence, continuous learning, and an unwavering commitment to creating value for guests, employees, and organisations alike.',
        ],
    },
];

export function getFacilitator(slug: string): Facilitator | undefined {
    return FACILITATORS.find((f) => f.slug === slug);
}
