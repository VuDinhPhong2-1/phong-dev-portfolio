const commonLinks = {
  avatar:
    "https://res.cloudinary.com/dk0lhapty/image/upload/v1741073555/z5994467109260_01a414be5deb1fc3b89ce98b89286cc5_qnprwh.jpg",
  cvLink:
    "https://drive.google.com/file/d/1f73MIqPAOqs89jdyQJRXGV9HO_FBL9gO/view?usp=sharing",
  github: "https://github.com/VuDinhPhong2-1",
};

const projectImages = {
  mos: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
  xgear:
    "https://res.cloudinary.com/dk0lhapty/image/upload/v1741073590/Capture_hez89p.png",
};

const projectSources = {
  mos: [
    {
      label: { en: "View Backend Source", vi: "Xem mã nguồn Backend" },
      href: "https://github.com/VuDinhPhong2-1/BE-MOS_EXCEL_GRADE",
    },
    {
      label: { en: "View Frontend Source", vi: "Xem mã nguồn Frontend" },
      href: "https://github.com/VuDinhPhong2-1/FE-MOS_GRADE",
    },
  ],
  xgear: [
    {
      label: { en: "View Frontend Source", vi: "Xem mã nguồn Frontend" },
      href: "https://github.com/VuDinhPhong2-1/FE-WebBanDoDienTu",
    },
    {
      label: { en: "View Backend Source", vi: "Xem mã nguồn Backend" },
      href: "https://github.com/VuDinhPhong2-1/WebBanDoDienTu",
    },
  ],
};

export const localizedContent = {
  en: {
    nav: [
      { key: "hero", label: "Hero" },
      { key: "about", label: "About Me" },
      { key: "experience", label: "Experience" },
      { key: "projects", label: "Projects" },
      { key: "skills", label: "Skills" },
      { key: "education", label: "Education" },
      { key: "contact", label: "Contact" },
    ],
    ui: {
      brandRole: "Coding Online Teacher & Full-stack Developer",
      portfolio: "Portfolio",
      viewProjects: "View Projects",
      downloadCv: "Download CV",
      contactMe: "Contact Me",
      companyWebsite: "Company Website",
      roleFocus: "Role Focus",
      technologies: "Technologies",
      keyFeatures: "Key Features",
      frontend: "Frontend",
      backend: "Backend",
      tools: "Tools",
      githubProfile: "GitHub Profile",
    },
    profile: {
      ...commonLinks,
      name: "Vu Dinh Phong",
      role: "Coding Online Teacher | MOS 2019 Instructor | Full-stack Web Developer",
      summary:
        "I am a software engineering graduate with experience in full-stack web development and teaching MOS 2019. I have worked with TypeScript, GraphQL, PostgreSQL, ReactJS, NestJS, and NodeJS. My current goal is to combine programming knowledge and teaching experience to help students learn coding and office technology more effectively.",
      heroEyebrow: "Coding Online Teacher Portfolio",
      about: [
        "I graduated from Ho Chi Minh City University of Technology - HUTECH, majoring in Software Engineering.",
        "I have experience in backend and full-stack development, working with technologies such as TypeScript, GraphQL, PostgreSQL, NestJS, ExpressJS, ReactJS, and MongoDB.",
        "Besides software development, I also have 1 year of teaching experience at Tin Hoc Dai Duong, where I teach MOS 2019 to high school students.",
        "I am interested in online teaching, coding education, and building practical learning systems for students.",
      ],
      focusAreas: [
        {
          title: "Education Technology",
          description:
            "Building learning systems that connect teaching workflows with practical web applications.",
        },
        {
          title: "Online Teaching",
          description:
            "Supporting students with clear explanations, structured lessons, and practical MOS practice.",
        },
        {
          title: "Full-stack Delivery",
          description:
            "Working across frontend, backend, APIs, databases, and deployment-oriented tooling.",
        },
      ],
      heroHighlights: [
        "MOS 2019 Instructor",
        "Full-stack Web Developer",
        "GraphQL & PostgreSQL",
        "ReactJS & NestJS",
        "Education Technology",
      ],
      personalFacts: [
        { label: "Location", value: "Ho Chi Minh City, Vietnam" },
        { label: "Address", value: "16 Yen The, Tan Son Hoa, Tp.HCM" },
        { label: "Phone", value: "0559548503" },
        { label: "Email", value: "vudinhphong.26.12.2001@gmail.com" },
      ],
    },
    sections: {
      about: {
        eyebrow: "About Me",
        title: "Teaching mindset, developer foundation.",
        description:
          "This portfolio is built to show both sides of the work: classroom support and full-stack implementation.",
        focusTitle: "What I bring",
      },
      experience: {
        eyebrow: "Experience",
        title: "Teaching, software delivery, and backend practice.",
        description:
          "The experience section now highlights classroom work first, followed by commercial development roles and internship background.",
      },
      projects: {
        eyebrow: "Projects",
        title: "Full-stack systems with practical learning value.",
        description:
          "MOS Excel Grading System is placed first because it best represents the blend of education, student support, and real implementation work.",
      },
      skills: {
        eyebrow: "Skills",
        title: "Organized around teaching, frontend, backend, and delivery.",
        description:
          "Skills are grouped for easier scanning by recruiters looking for online teaching, education technology, and full-stack capability.",
      },
      education: {
        eyebrow: "Education",
        title: "Academic base and current direction.",
        description:
          "The portfolio now emphasizes education-focused work without losing the full-stack engineering background behind it.",
      },
      contact: {
        eyebrow: "Contact",
        title: "Let's connect for teaching or development work.",
        description:
          "Available for coding education, MOS training support, and full-stack web development opportunities.",
      },
    },
    experiences: [
      {
        company: "Tin Hoc Dai Duong",
        position: "MOS 2019 Instructor",
        period: "2025 - 2026",
        technologies: [
          "MOS 2019",
          "Microsoft Word",
          "Microsoft Excel",
          "Microsoft PowerPoint",
          "Student Support",
          "Online Teaching",
        ],
        description: [
          "Taught MOS 2019 to high school students.",
          "Guided students in Microsoft Word, Excel, and PowerPoint exam skills.",
          "Supported students in practicing MOS exercises and improving test performance.",
          "Explained office software concepts in a simple and easy-to-understand way.",
          "Built teaching experience suitable for online coding and technology education.",
        ],
      },
      {
        company: "HDWEBSOFT",
        position: "Software Developer",
        period: "2024 - 2025",
        website: "https://www.hdwebsoft.com/vn",
        technologies: ["TypeScript", "GraphQL", "PostgreSQL"],
        description: [
          "Worked on software development tasks using TypeScript.",
          "Developed and maintained features with GraphQL APIs.",
          "Worked with PostgreSQL database.",
          "Participated in real-world software development workflow.",
          "Improved coding, debugging, teamwork, and project communication skills.",
        ],
      },
      {
        company: "GPT GROUP",
        position: "Backend Intern",
        period: "03/2024 - 10/2024",
        technologies: ["NodeJS", "ExpressJS", "MongoDB", "RESTful API", "Postman", "Swagger"],
        description: [
          "Learned and used NodeJS, ExpressJS, MongoDB, and RESTful API.",
          "Designed and developed backend APIs.",
          "Tested APIs using Postman.",
          "Documented APIs using Swagger.",
          "Collaborated with frontend team to build APIs based on system requirements.",
          "Presented API demos to leader and received feedback for improvement.",
        ],
      },
    ],
    projects: [
      {
        name: "MOS Excel Grading System",
        role: "Full-stack Developer",
        description:
          "A web-based system designed to support MOS Excel practice and grading. The system helps manage exams, students, projects, and grading workflow for MOS-style Excel tests.",
        image: projectImages.mos,
        badges: ["Education", "MOS", "Excel", "Grading System", "Full-stack"],
        features: [
          "Manage MOS exam sessions.",
          "Support student exam workflow.",
          "Handle Excel grading logic.",
          "Backend API for exam, student, and grading management.",
          "Frontend interface for users to interact with the system.",
          "Suitable for education, training centers, and MOS practice environments.",
        ],
        technologies: {
          frontend: "ReactJS, TypeScript",
          backend: "ASP.NET Core / .NET, MongoDB",
          tools: "GitHub, Postman, Swagger",
        },
        sources: projectSources.mos.map((source) => ({ ...source, label: source.label.en })),
      },
      {
        name: "XGear eCommerce Website Clone",
        role: "Full-stack Developer",
        description:
          "Developed a full-stack e-commerce website clone of XGear, including product management, cart, checkout, authentication, role-based access control, payment integration, and admin features.",
        image: projectImages.xgear,
        badges: ["E-commerce", "Full-stack", "Payments", "Admin", "Authentication"],
        features: [
          "Product management",
          "Cart and checkout",
          "User authentication",
          "Role-based access control",
          "Payment integration",
          "Image upload with Cloudinary",
          "API documentation with Swagger",
        ],
        technologies: {
          frontend: "ReactJS, MUI, Styled-Components, Redux, React Router",
          backend:
            "NestJS, TypeScript, JWT, Google OAuth, SQL Server, TypeORM, Redis, Bull Queue, Nodemailer, Cloudinary, Stripe, Momo",
          tools: "Docker, Git, Postman, Swagger",
        },
        sources: projectSources.xgear.map((source) => ({ ...source, label: source.label.en })),
      },
    ],
    skillGroups: [
      {
        title: "Teaching & Education",
        description:
          "Practical teaching skills focused on helping students understand office technology and learn confidently.",
        items: [
          "MOS 2019",
          "Microsoft Word",
          "Microsoft Excel",
          "Microsoft PowerPoint",
          "Lesson Guidance",
          "Student Support",
          "Online Teaching",
          "Presentation Skills",
        ],
      },
      {
        title: "Frontend",
        description:
          "Building responsive user interfaces with reusable components and practical application flows.",
        items: ["HTML/CSS", "JavaScript", "TypeScript", "ReactJS", "Next.js", "Material-UI", "Redux"],
      },
      {
        title: "Backend",
        description:
          "Designing APIs and application logic for secure, maintainable, real-world web systems.",
        items: ["NodeJS", "ExpressJS", "NestJS", "ASP.NET Core", "RESTful API", "GraphQL", "JWT Authentication"],
      },
      {
        title: "Database",
        description:
          "Working with relational and document databases, schema tooling, and data access layers.",
        items: ["PostgreSQL", "MongoDB", "SQL Server", "MySQL", "Mongoose", "TypeORM"],
      },
      {
        title: "Tools",
        description:
          "Daily tools used for collaboration, API testing, documentation, and delivery workflows.",
        items: ["Git", "GitHub", "Docker", "Postman", "Swagger", "Visual Studio Code"],
      },
    ],
    educationItems: [
      {
        title: "Ho Chi Minh City University of Technology - HUTECH",
        period: "2019 - 2024",
        description:
          "Graduated in Software Engineering with a foundation in software development, system design, and practical project work.",
      },
      {
        title: "Career Direction",
        period: "Current Focus",
        description:
          "Positioning as a Coding Online Teacher with a full-stack background and MOS 2019 teaching experience, with strong interest in education technology and practical learning systems.",
      },
    ],
    contactItems: [
      {
        title: "Email",
        value: "vudinhphong.26.12.2001@gmail.com",
        href: "mailto:vudinhphong.26.12.2001@gmail.com",
      },
      { title: "Phone", value: "0559548503", href: "tel:0559548503" },
      { title: "Address", value: "16 Yen The, Tan Son Hoa, Tp.HCM" },
      {
        title: "GitHub",
        value: "github.com/VuDinhPhong2-1",
        href: "https://github.com/VuDinhPhong2-1",
      },
      {
        title: "Facebook",
        value: "facebook.com/9110n9",
        href: "https://www.facebook.com/9110n9",
      },
    ],
  },
  vi: {
    nav: [
      { key: "hero", label: "Trang chủ" },
      { key: "about", label: "Giới thiệu" },
      { key: "experience", label: "Kinh nghiệm" },
      { key: "projects", label: "Dự án" },
      { key: "skills", label: "Kỹ năng" },
      { key: "education", label: "Học vấn" },
      { key: "contact", label: "Liên hệ" },
    ],
    ui: {
      brandRole: "Giáo viên Coding Online & Lập trình viên Full-stack",
      portfolio: "Hồ sơ",
      viewProjects: "Xem dự án",
      downloadCv: "Tải CV",
      contactMe: "Liên hệ",
      companyWebsite: "Website công ty",
      roleFocus: "Vai trò chính",
      technologies: "Công nghệ",
      keyFeatures: "Tính năng chính",
      frontend: "Frontend",
      backend: "Backend",
      tools: "Công cụ",
      githubProfile: "GitHub cá nhân",
    },
    profile: {
      ...commonLinks,
      name: "Vu Dinh Phong",
      role: "Giáo viên Coding Online | Giảng viên MOS 2019 | Lập trình viên Full-stack",
      summary:
        "Tôi tốt nghiệp ngành Kỹ thuật phần mềm, có kinh nghiệm phát triển web full-stack và giảng dạy MOS 2019. Tôi từng làm việc với TypeScript, GraphQL, PostgreSQL, ReactJS, NestJS và NodeJS. Mục tiêu hiện tại của tôi là kết hợp kiến thức lập trình với kinh nghiệm giảng dạy để giúp học sinh học coding và công nghệ văn phòng hiệu quả hơn.",
      heroEyebrow: "Portfolio giáo viên coding online",
      about: [
        "Tôi tốt nghiệp Trường Đại học Công nghệ TP.HCM - HUTECH, chuyên ngành Kỹ thuật phần mềm.",
        "Tôi có kinh nghiệm backend và full-stack, làm việc với TypeScript, GraphQL, PostgreSQL, NestJS, ExpressJS, ReactJS và MongoDB.",
        "Bên cạnh phát triển phần mềm, tôi có 1 năm kinh nghiệm giảng dạy tại Tin Học Đại Dương, nơi tôi dạy MOS 2019 cho học sinh THPT.",
        "Tôi quan tâm đến giảng dạy online, giáo dục lập trình và xây dựng các hệ thống học tập thực tế cho học sinh.",
      ],
      focusAreas: [
        {
          title: "Công nghệ giáo dục",
          description:
            "Xây dựng hệ thống học tập kết nối quy trình giảng dạy với các ứng dụng web thực tế.",
        },
        {
          title: "Giảng dạy online",
          description:
            "Hỗ trợ học sinh bằng cách giải thích rõ ràng, bài học có cấu trúc và bài luyện MOS thực hành.",
        },
        {
          title: "Phát triển full-stack",
          description:
            "Làm việc xuyên suốt frontend, backend, API, cơ sở dữ liệu và công cụ triển khai.",
        },
      ],
      heroHighlights: [
        "Giảng viên MOS 2019",
        "Lập trình viên Full-stack",
        "GraphQL & PostgreSQL",
        "ReactJS & NestJS",
        "Công nghệ giáo dục",
      ],
      personalFacts: [
        { label: "Khu vực", value: "TP.HCM, Việt Nam" },
        { label: "Địa chỉ", value: "16 Yên Thế, Tân Sơn Hòa, Tp.HCM" },
        { label: "Điện thoại", value: "0559548503" },
        { label: "Email", value: "vudinhphong.26.12.2001@gmail.com" },
      ],
    },
    sections: {
      about: {
        eyebrow: "Giới thiệu",
        title: "Tư duy giảng dạy, nền tảng lập trình.",
        description:
          "Portfolio này thể hiện cả hai thế mạnh: hỗ trợ học sinh trong lớp học và năng lực triển khai full-stack.",
        focusTitle: "Điểm mạnh của tôi",
      },
      experience: {
        eyebrow: "Kinh nghiệm",
        title: "Giảng dạy, phát triển phần mềm và thực hành backend.",
        description:
          "Kinh nghiệm được ưu tiên theo hướng giảng dạy trước, sau đó là công việc phát triển phần mềm thực tế và thực tập backend.",
      },
      projects: {
        eyebrow: "Dự án",
        title: "Hệ thống full-stack có giá trị học tập thực tế.",
        description:
          "MOS Excel Grading System được đặt đầu tiên vì thể hiện rõ sự kết hợp giữa giáo dục, hỗ trợ học sinh và năng lực triển khai sản phẩm.",
      },
      skills: {
        eyebrow: "Kỹ năng",
        title: "Nhóm kỹ năng theo giảng dạy, frontend, backend và công cụ.",
        description:
          "Các kỹ năng được nhóm rõ ràng để nhà tuyển dụng dễ nhìn thấy năng lực giảng dạy online, công nghệ giáo dục và full-stack.",
      },
      education: {
        eyebrow: "Học vấn",
        title: "Nền tảng học thuật và định hướng hiện tại.",
        description:
          "Portfolio nhấn mạnh định hướng giáo dục nhưng vẫn giữ rõ nền tảng kỹ thuật full-stack.",
      },
      contact: {
        eyebrow: "Liên hệ",
        title: "Kết nối cho công việc giảng dạy hoặc phát triển phần mềm.",
        description:
          "Sẵn sàng cho các cơ hội giảng dạy coding, hỗ trợ luyện MOS và phát triển web full-stack.",
      },
    },
    experiences: [
      {
        company: "Tin Học Đại Dương",
        position: "Giảng viên MOS 2019",
        period: "2025 - 2026",
        technologies: [
          "MOS 2019",
          "Microsoft Word",
          "Microsoft Excel",
          "Microsoft PowerPoint",
          "Hỗ trợ học sinh",
          "Giảng dạy online",
        ],
        description: [
          "Giảng dạy MOS 2019 cho học sinh THPT.",
          "Hướng dẫn kỹ năng thi Microsoft Word, Excel và PowerPoint.",
          "Hỗ trợ học sinh luyện bài MOS và cải thiện kết quả làm bài.",
          "Giải thích các khái niệm phần mềm văn phòng theo cách đơn giản, dễ hiểu.",
          "Xây dựng kinh nghiệm giảng dạy phù hợp với giáo dục coding và công nghệ online.",
        ],
      },
      {
        company: "HDWEBSOFT",
        position: "Software Developer",
        period: "2024 - 2025",
        website: "https://www.hdwebsoft.com/vn",
        technologies: ["TypeScript", "GraphQL", "PostgreSQL"],
        description: [
          "Thực hiện các nhiệm vụ phát triển phần mềm với TypeScript.",
          "Phát triển và bảo trì tính năng thông qua GraphQL APIs.",
          "Làm việc với cơ sở dữ liệu PostgreSQL.",
          "Tham gia quy trình phát triển phần mềm thực tế tại công ty.",
          "Cải thiện kỹ năng coding, debug, teamwork và giao tiếp dự án.",
        ],
      },
      {
        company: "GPT GROUP",
        position: "Backend Intern",
        period: "03/2024 - 10/2024",
        technologies: ["NodeJS", "ExpressJS", "MongoDB", "RESTful API", "Postman", "Swagger"],
        description: [
          "Học và sử dụng NodeJS, ExpressJS, MongoDB và RESTful API.",
          "Thiết kế và phát triển các backend API.",
          "Kiểm thử API bằng Postman.",
          "Viết tài liệu API bằng Swagger.",
          "Phối hợp với frontend team để xây dựng API theo yêu cầu hệ thống.",
          "Demo API cho leader và nhận phản hồi để cải thiện.",
        ],
      },
    ],
    projects: [
      {
        name: "MOS Excel Grading System",
        role: "Full-stack Developer",
        description:
          "Hệ thống web hỗ trợ luyện tập và chấm điểm MOS Excel. Hệ thống giúp quản lý ca thi, học sinh, bài dự án và quy trình chấm điểm cho các bài thi Excel theo phong cách MOS.",
        image: projectImages.mos,
        badges: ["Giáo dục", "MOS", "Excel", "Hệ thống chấm điểm", "Full-stack"],
        features: [
          "Quản lý các ca thi MOS.",
          "Hỗ trợ quy trình làm bài của học sinh.",
          "Xử lý logic chấm điểm Excel.",
          "Backend API cho quản lý bài thi, học sinh và chấm điểm.",
          "Giao diện frontend để người dùng thao tác với hệ thống.",
          "Phù hợp cho giáo dục, trung tâm đào tạo và môi trường luyện thi MOS.",
        ],
        technologies: {
          frontend: "ReactJS, TypeScript",
          backend: "ASP.NET Core / .NET, MongoDB",
          tools: "GitHub, Postman, Swagger",
        },
        sources: projectSources.mos.map((source) => ({ ...source, label: source.label.vi })),
      },
      {
        name: "XGear eCommerce Website Clone",
        role: "Full-stack Developer",
        description:
          "Phát triển website thương mại điện tử clone XGear với quản lý sản phẩm, giỏ hàng, thanh toán, xác thực, phân quyền, tích hợp thanh toán và tính năng quản trị.",
        image: projectImages.xgear,
        badges: ["Thương mại điện tử", "Full-stack", "Thanh toán", "Admin", "Xác thực"],
        features: [
          "Quản lý sản phẩm",
          "Giỏ hàng và thanh toán",
          "Xác thực người dùng",
          "Phân quyền truy cập",
          "Tích hợp thanh toán",
          "Upload ảnh với Cloudinary",
          "Tài liệu API bằng Swagger",
        ],
        technologies: {
          frontend: "ReactJS, MUI, Styled-Components, Redux, React Router",
          backend:
            "NestJS, TypeScript, JWT, Google OAuth, SQL Server, TypeORM, Redis, Bull Queue, Nodemailer, Cloudinary, Stripe, Momo",
          tools: "Docker, Git, Postman, Swagger",
        },
        sources: projectSources.xgear.map((source) => ({ ...source, label: source.label.vi })),
      },
    ],
    skillGroups: [
      {
        title: "Giảng dạy & Giáo dục",
        description:
          "Kỹ năng giảng dạy thực tế, tập trung giúp học sinh hiểu công nghệ văn phòng và học tự tin hơn.",
        items: [
          "MOS 2019",
          "Microsoft Word",
          "Microsoft Excel",
          "Microsoft PowerPoint",
          "Hướng dẫn bài học",
          "Hỗ trợ học sinh",
          "Giảng dạy online",
          "Kỹ năng thuyết trình",
        ],
      },
      {
        title: "Frontend",
        description:
          "Xây dựng giao diện responsive với component tái sử dụng và luồng ứng dụng thực tế.",
        items: ["HTML/CSS", "JavaScript", "TypeScript", "ReactJS", "Next.js", "Material-UI", "Redux"],
      },
      {
        title: "Backend",
        description:
          "Thiết kế API và xử lý logic ứng dụng cho các hệ thống web an toàn, dễ bảo trì.",
        items: ["NodeJS", "ExpressJS", "NestJS", "ASP.NET Core", "RESTful API", "GraphQL", "JWT Authentication"],
      },
      {
        title: "Database",
        description:
          "Làm việc với cơ sở dữ liệu quan hệ và document, công cụ schema và tầng truy cập dữ liệu.",
        items: ["PostgreSQL", "MongoDB", "SQL Server", "MySQL", "Mongoose", "TypeORM"],
      },
      {
        title: "Công cụ",
        description:
          "Các công cụ dùng hằng ngày cho cộng tác, kiểm thử API, tài liệu hóa và quy trình triển khai.",
        items: ["Git", "GitHub", "Docker", "Postman", "Swagger", "Visual Studio Code"],
      },
    ],
    educationItems: [
      {
        title: "Trường Đại học Công nghệ TP.HCM - HUTECH",
        period: "2019 - 2024",
        description:
          "Tốt nghiệp ngành Kỹ thuật phần mềm, có nền tảng về phát triển phần mềm, thiết kế hệ thống và dự án thực tế.",
      },
      {
        title: "Định hướng nghề nghiệp",
        period: "Trọng tâm hiện tại",
        description:
          "Định vị là giáo viên Coding Online có nền tảng full-stack và kinh nghiệm giảng dạy MOS 2019, quan tâm đến công nghệ giáo dục và hệ thống học tập thực tế.",
      },
    ],
    contactItems: [
      {
        title: "Email",
        value: "vudinhphong.26.12.2001@gmail.com",
        href: "mailto:vudinhphong.26.12.2001@gmail.com",
      },
      { title: "Điện thoại", value: "0559548503", href: "tel:0559548503" },
      { title: "Địa chỉ", value: "16 Yên Thế, Tân Sơn Hòa, Tp.HCM" },
      {
        title: "GitHub",
        value: "github.com/VuDinhPhong2-1",
        href: "https://github.com/VuDinhPhong2-1",
      },
      {
        title: "Facebook",
        value: "facebook.com/9110n9",
        href: "https://www.facebook.com/9110n9",
      },
    ],
  },
};
