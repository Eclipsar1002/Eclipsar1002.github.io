export const defaultLocale = "zh";

export const locales = {
	zh: {
		label: "中文",
		lang: "zh-CN",
		path: "/",
	},

} as const;

export type Locale = keyof typeof locales;

const shared = {
	name: "Eclipsar",
	email: "fxy2004@mail.ustc.edu.cn",
	emailIcon: "@",
	avatar: "/avatar.png",
	visitorCount: "0001",
	background: {
		image: "/demo.png",
		blur: "0px",
		opacity: 0.6,
		scale: 1,
		overlay: "radial-gradient(circle at top left, rgba(255,255,255,0.12), transparent 30%), linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(0,0,0,0.65) 55%, rgba(9,9,9,0.95) 100%)",
		rain: {
			enabled: false,
			mode: "falling",
			density: 0.7,
			speed: 1,
			dropColor: "rgba(210, 230, 255, 0.5)",
			rippleColor: "rgba(210, 230, 255, 0.34)",
			maxDrops: 170,
			maxRipples: 48,
		},
	},
	socials: [
		{ label: "GitHub", href: "https://github.com/Eclipsar1002", icon: "GH" },
		{ label: "B站", href: "https://space.bilibili.com/3546624236194104", icon: "B" },
		{ label: "Folo", href: "https://folo.is", icon: "F" },
	],
};

const siteConfigs = {
	zh: {
		...shared,
		title: "中国科学技术大学 电子信息专业 大四本科生/研0",
		description: "因为夏日将终",
		nav: [
			{ label: "首页", href: "/" },
			{ label: "关于我", href: "/about" },
			{ label: "项目", href: "/projects" },
			{ label: "博客", href: "/blog" },
			{ label: "图谱", href: "/graph" },
			{ label: "简历", href: "/resume" },
			{ label: "联系", href: "/contact" },
		],
		quickLinks: [
			{ label: "博客", href: "/blog", icon: "书" },
			{ label: "项目", href: "/projects", icon: "作" },
			{ label: "关于", href: "/about", icon: "我" },
			{ label: "简历", href: "/resume", icon: "历" },
			{ label: "联系", href: "/contact", icon: "@" },
		],
		today: {
			title: "今日小状态",
			current: "正在：整理课程笔记",
			next: "稍后：改一个小项目",
			note: "今日目标：把 README 写明白",
			timeLabel: "我的当前时间",
			timeZone: "Asia/Shanghai",
			dateLocale: "zh-CN",
			greetings: ["凌晨好", "早上好", "上午好", "中午好", "下午好", "晚上好"],
		},
  		music: {
    		playlistId: "12309959984",   // 纯数字
  		},

		ui: {
			headerCta: "打个招呼",
			projectCta: "查看项目 ->",
			projectLiveCta: "访问项目",
			projectRepoCta: "查看代码",
			backToList: "返回列表",
			socialCardCta: "查看主页",
		},
		home: {
			eyebrowNote: "愿我们都有鲜衣怒马的少年意气，愿我们在任何时候都无愧于心。",
			visitorText: "访客编号 #{count}，欢迎来到互联网的小角落",
			headline: "把上课、折腾和突然冒出的想法都放在这里。",
			intro: `关于这个博客，我更愿意看作是我成长经历的一个记录。
			作为一名社恐人士，我希望有一个地方可以安放自己的内心思考，偶尔的焦虑，写下的长文，以及乱七八糟的飞书文档和网盘文件，因此便有了该博客。
			“总言而之，感谢您的偶然到访”
			`,
			primaryCta: { label: "看看项目", href: "/projects" },
			secondaryCta: { label: "打个招呼", href: "/contact" },
		},
		pages: {
			home: {
				title: "首页",
				description: "一个黑色系 Astro 个人网站模板。",
				modules: [
					{ type: "homeHero" },
					{ type: "linkGrid", props: { items: [
						{ label: "学习记录", href: "/blog" },
						{ label: "项目存档", href: "/projects" },
						{ label: "个人迷思", href: "/about" },
						{ label: "联系方式", href: "/contact" },
					] } },
					{
						type: "projectGrid",
						props: {
							kicker: "Small Builds",
							title: "神秘项目",
							description: "真的会做吗？谁知道呢",
							featuredOnly: true,
							limit: 3,
							columns: 3,
						},
					},
					{
						type: "blogPreview",
						props: {
							kicker: "Notes",
							title: "奇怪笔记",
							description: "存个档，七老八十看了还是很感动",
							limit: 3,
						},
					},
					{ type: "contactPanel" },
				],
			},
			about: {
				title: "关于我",
				description: "你好，我是Eclipsar,真名保密",
				modules: [
					{
						type: "aboutIntro",
						props: {
							kicker: "About",
							heading: "你好，我是Eclipsar。",
							intro: "欢迎来到我的自留地，这里主要记录我的学习路程，个人兴趣以及迷思。",
							profileLabel: "Profile",
							profile: "未完待续...",
							paragraphs: [
								"二次元抽卡游戏重度爱好者；初音未来歌迷（看过演唱会版）；术力口倾听者；MMD苦手XD；超级社恐i人",
								"关于我的专业领域以及研究兴趣，我自认为对此还没有足够的认知，暂且按下不表，希望未来的我能有足够的自信吧。",
							],
						},
					},
					{
						type: "gameList",
						props: {
							title: "主页可以放什么",
							description: "这些模块都可以在 src/config/site.ts 里替换成自己的栏目。",
							items: [
								{ label: "学习记录", description: "记录课程、阅读、实验和阶段性复盘。" },
								{ label: "项目作品", description: "展示课程作业、开源项目和个人练手。" },
								{ label: "博客笔记", description: "用 Markdown 把想法留下来，支持标签和双链。" },
								{ label: "简历经历", description: "教育背景、技能、项目经验和可下载的 PDF 简历。" },
							],
						},
					},
					{
						type: "skillCloud",
						props: {
							title: "技能栈",
							skills: ["Astro", "TypeScript", "Tailwind CSS", "Design Systems", "UX Engineering", "Content Strategy"],
						},
					},
					{ type: "contactPanel" },
				],
			},
			projects: {
				title: "项目 / 作品集",
				description: "课程作业、小项目、作品集和实验记录。",
				modules: [
					{
						type: "projectGrid",
						props: {
							kicker: "Portfolio",
							title: "项目 / 作品集",
							description: "这里展示课程作业、个人项目和实验记录。",
							columns: 2,
							largePadding: true,
						},
					},
				],
			},
			blog: {
				title: "博客 / 笔记",
				description: "关于课程、前端、设计、生活和长期学习的笔记。",
				modules: [
					{
						type: "blogIndex",
						props: {
							kicker: "Notes",
							title: "博客 / 笔记",
							description: "用 Markdown 记录学习过程、项目复盘、课堂笔记和日常观察。草稿文章会在列表中自动过滤。",
							labels: {
								search: "搜索标题、摘要或标签",
								all: "全部",
								empty: "没有找到符合条件的笔记。",
							},
						},
					},
				],
			},
			graph: {
				title: "知识图谱",
				description: "由博客标签和双链生成的知识图谱。",
				modules: [
					{
						type: "knowledgeGraph",
						props: {
							kicker: "Graph",
							title: "知识图谱",
							description: "每篇笔记都是一个节点，在这里可以看见整个知识库的结构。",
						},
					},
				],
			},
			resume: {
				title: "简历 / 经历",
				description: "学生经历、技能、项目和学习记录。",
				profileLabel: "Profile",
				emailLabel: "Email",
				linksLabel: "Links",
				skillsLabel: "Skills",
				highlightsLabel: "Highlights",
				modules: [
					{
						type: "resume",
						props: {
							kicker: "Resume",
							title: "简历 / 经历",
							description: "此页面展示教育经历、项目经验、技能和可下载的简历文件。当前内容来自 src/config/site.ts。",
						},
					},
				],
			},
			contact: {
				title: "联系方式",
				description: "联系这个个人网站的作者。",
				modules: [
					{
						type: "contactCards",
						props: {
							kicker: "Contact",
							heading: "关于项目、写作或个人网站的想法，欢迎来信。",
							intro: "把你的 Email、GitHub、Bilibili、Folo、Telegram 或其他公开链接放在这里。",
						},
					},
					{ type: "contactPanel" },
				],
			},
		},
		contactPanel: {
			kicker: "Message",
			heading: "如果你在这里发现了有趣的项目或笔记，欢迎打个招呼。",
		},
		skills: ["Astro", "TypeScript", "Tailwind CSS", "Design Systems", "UX Engineering", "Content Strategy"],
		resume: {
			summary: "一个模板简历区域，用于展示教育、技能、项目亮点和可下载的简历文件。",
			details: [
				{ label: "Location", value: "Campus / Online" },
				{ label: "Focus", value: "Design Engineering / Frontend / Content" },
			],
			links: [
				{ label: "Projects", href: "/projects" },
				{ label: "Notes", href: "/blog" },
				{ label: "Contact", href: "/contact" },
			],
			files: [],
			highlights: ["Add awards, competitions, or course highlights here", "Add open-source contributions or club experience here"],
			sections: [
				{
					title: "Experience",
					items: [
						{
							period: "2025 - Now",
							title: "Student Builder",
							org: "Campus and spare time",
							description: "Turning coursework, personal interests, and frontend practice into maintainable projects and notes.",
							points: ["Learning", "Projects", "Notes"],
							link: [],
						},
						{
							period: "2024 - 2025",
							title: "Frontend Learner",
							org: "Self-directed projects",
							description: "Practicing Astro, TypeScript, Tailwind CSS, and content-driven websites by building real pages.",
							points: ["Astro", "TypeScript", "Tailwind CSS"],
							link: [],
						},
					],
				},
			],
		},
	},
	
} as const;

export function isLocale(locale: string | undefined): locale is Locale {
	return locale === "zh" ;
}

export function getLocaleFromUrl(url: URL): Locale {
	const firstSegment = url.pathname.split("/").filter(Boolean)[0];
	return isLocale(firstSegment) ? firstSegment : defaultLocale;
}

export function localizePath(locale: Locale, path: string): string {
	if (path.startsWith("http") || path.startsWith("mailto:")) return path;
	return path;
}

function localizeModuleLinks(module: { type: string; props?: Record<string, unknown> }, locale: Locale) {
	if (module.type === "gameList" || module.type === "linkGrid") {
		const props = module.props as { items?: Array<string | { href?: string }> } | undefined;
		return {
			...module,
			props: {
				...module.props,
				items: props?.items?.map((item) => (
					typeof item === "string" ? item : { ...item, href: item.href ? localizePath(locale, item.href) : item.href }
				)),
			},
		};
	}

	return module;
}

function localizeSiteLinks<T extends typeof siteConfigs[Locale]>(config: T, locale: Locale): T {
	return {
		...config,
		nav: config.nav.map((item) => ({ ...item, href: localizePath(locale, item.href) })),
		quickLinks: config.quickLinks.map((item) => ({ ...item, href: localizePath(locale, item.href) })),
		home: {
			...config.home,
			primaryCta: { ...config.home.primaryCta, href: localizePath(locale, config.home.primaryCta.href) },
			secondaryCta: { ...config.home.secondaryCta, href: localizePath(locale, config.home.secondaryCta.href) },
		},
		pages: {
			...config.pages,
			...Object.fromEntries(
				Object.entries(config.pages).map(([key, page]) => [
					key,
					"modules" in page
						? { ...page, modules: page.modules.map((module) => localizeModuleLinks(module, locale)) }
						: page,
				]),
			),
		},
		resume: {
			...config.resume,
			links: config.resume.links.map((item) => ({ ...item, href: localizePath(locale, item.href) })),
		},
	} as T;
}

export function getSiteConfig(localeOrUrl: Locale | URL = defaultLocale) {
	return siteConfigs.zh;
}

export const siteConfig = siteConfigs.zh;
