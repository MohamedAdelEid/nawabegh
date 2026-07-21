import type {
  SchoolEventCard,
  SchoolEventLiveDashboard,
  SchoolEventStatus,
} from "@/modules/student/domain/types/schoolEvent.types";

type LocaleCode = "ar" | "en";

type Localized<T> = Record<LocaleCode, T>;

const COVER_SPORTS =
  "https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=800&q=80";
const COVER_CULTURE =
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80";
const COVER_SCIENCE =
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80";
const COVER_ACADEMIC =
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80";
const BANNER_LIVE =
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80";

const AVATAR_1 =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80";
const AVATAR_2 =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80";

type MockEventSource = {
  id: string;
  status: SchoolEventStatus;
  category: SchoolEventCard["category"];
  coverImageUrl: string;
  participantCount: number;
  participantPreview: SchoolEventCard["participantPreview"];
  startsAt: string;
  endsAt: string;
  isLive: boolean;
  title: Localized<string>;
  dateRangeLabel: Localized<string>;
};

const MOCK_EVENTS: MockEventSource[] = [
  {
    id: "evt-sports-day-2024",
    status: "Live",
    category: "Sports",
    coverImageUrl: COVER_SPORTS,
    participantCount: 120,
    participantPreview: [
      { profileImageUrl: AVATAR_1, fullName: "Sara" },
      { profileImageUrl: AVATAR_2, fullName: "Omar" },
    ],
    startsAt: "2024-10-12T08:00:00Z",
    endsAt: "2024-10-15T18:00:00Z",
    isLive: true,
    title: {
      ar: "اليوم الرياضي السنوي 2024",
      en: "Annual Sports Day 2024",
    },
    dateRangeLabel: {
      ar: "12 أكتوبر - 15 أكتوبر، 2024",
      en: "12 Oct – 15 Oct, 2024",
    },
  },
  {
    id: "evt-heritage-fest",
    status: "Published",
    category: "Cultural",
    coverImageUrl: COVER_CULTURE,
    participantCount: 45,
    participantPreview: [{ profileImageUrl: AVATAR_1, fullName: "Lina" }],
    startsAt: "2024-11-01T09:00:00Z",
    endsAt: "2024-11-03T21:00:00Z",
    isLive: false,
    title: {
      ar: "مهرجان التراث الثقافي",
      en: "Cultural Heritage Festival",
    },
    dateRangeLabel: {
      ar: "01 نوفمبر - 03 نوفمبر، 2024",
      en: "01 Nov – 03 Nov, 2024",
    },
  },
  {
    id: "evt-science-fair",
    status: "Draft",
    category: "Scientific",
    coverImageUrl: COVER_SCIENCE,
    participantCount: 0,
    participantPreview: [],
    startsAt: "2024-12-05T09:00:00Z",
    endsAt: "2024-12-07T18:00:00Z",
    isLive: false,
    title: {
      ar: "معرض العلوم والابتكار",
      en: "Science & Innovation Fair",
    },
    dateRangeLabel: {
      ar: "05 ديسمبر - 07 ديسمبر، 2024",
      en: "05 Dec – 07 Dec, 2024",
    },
  },
  {
    id: "evt-honors-ceremony",
    status: "Ended",
    category: "Academic",
    coverImageUrl: COVER_ACADEMIC,
    participantCount: 80,
    participantPreview: [
      { profileImageUrl: AVATAR_2, fullName: "Ali" },
      { profileImageUrl: AVATAR_1, fullName: "Nour" },
    ],
    startsAt: "2024-09-20T10:00:00Z",
    endsAt: "2024-09-20T14:00:00Z",
    isLive: false,
    title: {
      ar: "حفل تكريم المتفوقين",
      en: "Honors Ceremony",
    },
    dateRangeLabel: {
      ar: "20 سبتمبر، 2024",
      en: "20 Sep, 2024",
    },
  },
  {
    id: "evt-debate-cup",
    status: "Published",
    category: "Academic",
    coverImageUrl: COVER_ACADEMIC,
    participantCount: 32,
    participantPreview: [{ profileImageUrl: AVATAR_2, fullName: "Yousef" }],
    startsAt: "2024-11-10T09:00:00Z",
    endsAt: "2024-11-12T17:00:00Z",
    isLive: false,
    title: {
      ar: "كأس المناظرات المدرسية",
      en: "School Debate Cup",
    },
    dateRangeLabel: {
      ar: "10 نوفمبر - 12 نوفمبر، 2024",
      en: "10 Nov – 12 Nov, 2024",
    },
  },
  {
    id: "evt-coding-sprint",
    status: "Live",
    category: "Scientific",
    coverImageUrl: COVER_SCIENCE,
    participantCount: 64,
    participantPreview: [
      { profileImageUrl: AVATAR_1, fullName: "Huda" },
      { profileImageUrl: AVATAR_2, fullName: "Khaled" },
    ],
    startsAt: "2024-10-14T08:00:00Z",
    endsAt: "2024-10-16T20:00:00Z",
    isLive: true,
    title: {
      ar: "تحدي البرمجة السريع",
      en: "Coding Sprint Challenge",
    },
    dateRangeLabel: {
      ar: "14 أكتوبر - 16 أكتوبر، 2024",
      en: "14 Oct – 16 Oct, 2024",
    },
  },
  {
    id: "evt-art-week",
    status: "Ended",
    category: "Cultural",
    coverImageUrl: COVER_CULTURE,
    participantCount: 55,
    participantPreview: [{ profileImageUrl: AVATAR_1, fullName: "Maya" }],
    startsAt: "2024-08-01T09:00:00Z",
    endsAt: "2024-08-05T18:00:00Z",
    isLive: false,
    title: {
      ar: "أسبوع الفنون المدرسية",
      en: "School Arts Week",
    },
    dateRangeLabel: {
      ar: "01 أغسطس - 05 أغسطس، 2024",
      en: "01 Aug – 05 Aug, 2024",
    },
  },
  {
    id: "evt-football-league",
    status: "Published",
    category: "Sports",
    coverImageUrl: COVER_SPORTS,
    participantCount: 96,
    participantPreview: [
      { profileImageUrl: AVATAR_2, fullName: "Faisal" },
      { profileImageUrl: AVATAR_1, fullName: "Rania" },
    ],
    startsAt: "2024-11-20T08:00:00Z",
    endsAt: "2024-11-28T18:00:00Z",
    isLive: false,
    title: {
      ar: "دوري كرة القدم المدرسي",
      en: "School Football League",
    },
    dateRangeLabel: {
      ar: "20 نوفمبر - 28 نوفمبر، 2024",
      en: "20 Nov – 28 Nov, 2024",
    },
  },
];

function resolveLocale(locale: string): LocaleCode {
  return locale.toLowerCase().startsWith("ar") ? "ar" : "en";
}

const STATUS_LABEL: Record<SchoolEventStatus, Localized<string>> = {
  Live: { ar: "مباشر", en: "Live" },
  Published: { ar: "منشور", en: "Published" },
  Draft: { ar: "مسودة", en: "Draft" },
  Ended: { ar: "منتهية", en: "Ended" },
};

const CATEGORY_LABEL: Record<SchoolEventCard["category"], Localized<string>> = {
  Sports: { ar: "رياضي", en: "Sports" },
  Cultural: { ar: "ثقافي", en: "Cultural" },
  Scientific: { ar: "سلوكي/علمي", en: "Scientific" },
  Academic: { ar: "أكاديمي", en: "Academic" },
  Other: { ar: "أخرى", en: "Other" },
};

const ACTION_BY_STATUS: Record<
  SchoolEventStatus,
  { actionType: SchoolEventCard["actionType"]; label: Localized<string> }
> = {
  Live: {
    actionType: "ViewLive",
    label: { ar: "مشاهدة البث", en: "Watch live" },
  },
  Published: {
    actionType: "ViewEvent",
    label: { ar: "عرض الفعالية", en: "View event" },
  },
  Draft: {
    actionType: "ComingSoon",
    label: { ar: "قريباً", en: "Coming soon" },
  },
  Ended: {
    actionType: "ViewResults",
    label: { ar: "عرض النتائج", en: "View results" },
  },
};

export function getMockSchoolEventCards(locale: string): SchoolEventCard[] {
  const loc = resolveLocale(locale);

  return MOCK_EVENTS.map((event) => {
    const action = ACTION_BY_STATUS[event.status];
    return {
      id: event.id,
      title: event.title[loc],
      coverImageUrl: event.coverImageUrl,
      status: event.status,
      statusLabel: STATUS_LABEL[event.status][loc],
      category: event.category,
      categoryLabel: CATEGORY_LABEL[event.category][loc],
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      dateRangeLabel: event.dateRangeLabel[loc],
      participantCount: event.participantCount,
      participantPreview: event.participantPreview,
      actionType: action.actionType,
      actionLabel: action.label[loc],
      isLive: event.isLive,
    };
  });
}

export function getMockSchoolEventLiveDashboard(
  eventId: string,
  locale: string,
): SchoolEventLiveDashboard {
  const loc = resolveLocale(locale);
  const source = MOCK_EVENTS.find((event) => event.id === eventId) ?? MOCK_EVENTS[0]!;
  const isLive = source.isLive || source.status === "Live";

  return {
    eventId: source.id,
    title:
      loc === "ar"
        ? "تحدي النوابغ الكبير"
        : "The Great Nawabegh Challenge",
    description:
      loc === "ar"
        ? 'نهائيات التصفيات الإقليمية بين فريق "الصقور" وفريق "الفرسان". من سيحسم لقب العبقرية التقنية اليوم؟'
        : 'Regional finals between the "Falcons" and "Knights". Who will claim the tech genius title today?',
    seriesLabel:
      loc === "ar" ? "بطولة المهارات التقنية 2024" : "Tech Skills Championship 2024",
    bannerImageUrl: BANNER_LIVE,
    isLive,
    liveStatusLabel: loc === "ar" ? "مباشر الآن" : "Live now",
    generatedAtUtc: new Date().toISOString(),
    currentMatch: {
      matchId: "m-1001",
      currentRound: 3,
      totalRounds: 5,
      roundLabel: loc === "ar" ? "الجولة 3 من 5" : "Round 3 of 5",
      remainingSeconds: 292,
      timerLabel: "04:52",
      setsWon: { home: 1, away: 2 },
      teams: [
        {
          side: "home",
          teamId: "t-knights",
          name: loc === "ar" ? "فريق الفرسان" : "Knights Team",
          shortName: loc === "ar" ? "الفرسان" : "Knights",
          logoUrl: null,
          points: 385,
          pointsLabel: loc === "ar" ? "النقاط: 385" : "Points: 385",
          accentColor: "#c7af6d",
        },
        {
          side: "away",
          teamId: "t-falcons",
          name: loc === "ar" ? "فريق الصقور" : "Falcons Team",
          shortName: loc === "ar" ? "الصقور" : "Falcons",
          logoUrl: null,
          points: 420,
          pointsLabel: loc === "ar" ? "النقاط: 420" : "Points: 420",
          accentColor: "#2b415e",
        },
      ],
      reactions: {
        likes: 1200,
        likesLabel: "1.2k",
        fire: 850,
        fireLabel: "850",
        stars: 430,
        starsLabel: "430",
      },
      activeViewerCount: 15,
      viewerPreview: [
        { profileImageUrl: AVATAR_1, fullName: "Viewer 1" },
        { profileImageUrl: AVATAR_2, fullName: "Viewer 2" },
      ],
    },
    activityFeed: [
      {
        id: "feed-1",
        occurredAt: "2026-07-12T15:40:00Z",
        relativeLabel: loc === "ar" ? "منذ 2 دقيقة" : "2 minutes ago",
        message:
          loc === "ar"
            ? "فريق الصقور ينجح في حل لغز البرمجة الثالث في زمن قياسي (34 ثانية)!"
            : "The Falcons solved the third coding puzzle in a record 34 seconds!",
        iconType: "success",
        teamId: "t-falcons",
      },
      {
        id: "feed-2",
        occurredAt: "2026-07-12T15:32:00Z",
        relativeLabel: loc === "ar" ? "منذ 10 دقائق" : "10 minutes ago",
        message:
          loc === "ar"
            ? 'بدء جولة "الذكاء المنطقي". الفرق الآن تتنافس على تحليل سلاسل البيانات المعقدة.'
            : 'The "Logical Intelligence" round has started. Teams are analyzing complex data sequences.',
        iconType: "round",
        teamId: null,
      },
      {
        id: "feed-3",
        occurredAt: "2026-07-12T15:27:00Z",
        relativeLabel: loc === "ar" ? "منذ 15 دقيقة" : "15 minutes ago",
        message:
          loc === "ar"
            ? 'فريق الفرسان يحصل على بطاقة "المضاعف الذهبي" لتفوقه في الروح الرياضية.'
            : 'The Knights earned the "Golden Multiplier" card for outstanding sportsmanship.',
        iconType: "trophy",
        teamId: "t-knights",
      },
    ],
    activePoll: {
      pollId: "poll-77",
      question:
        loc === "ar"
          ? 'من برأيك سيفوز بلقب "مبتكر العام" في هذه الدورة؟'
          : 'Who do you think will win the "Innovator of the Year" title?',
      totalVotes: 2451,
      totalVotesLabel:
        loc === "ar"
          ? "بناءً على 2,451 صوت من الجمهور"
          : "Based on 2,451 audience votes",
      hasUserVoted: false,
      options: [
        {
          optionId: "opt-1",
          label: loc === "ar" ? "فارس الغامدي" : "Fares Al-Ghamdi",
          votePercentage: 64,
          voteCount: 1569,
          isLeading: true,
        },
        {
          optionId: "opt-2",
          label: loc === "ar" ? "سارة الصالح" : "Sara Al-Saleh",
          votePercentage: 36,
          voteCount: 882,
          isLeading: false,
        },
      ],
    },
    teamStandings: [
      {
        rank: 1,
        teamId: "t-falcons",
        name: loc === "ar" ? "الصقور" : "Falcons",
        schoolName: loc === "ar" ? "مدرسة الرواد" : "Al-Rowad School",
        logoUrl: null,
        points: 1250,
        rankChange: 2,
        rankChangeLabel: "▲ 2",
        isHighlighted: true,
      },
      {
        rank: 2,
        teamId: "t-knights",
        name: loc === "ar" ? "الفرسان" : "Knights",
        schoolName: loc === "ar" ? "مدرسة العروبة" : "Al-Orouba School",
        logoUrl: null,
        points: 1180,
        rankChange: 0,
        rankChangeLabel: "—",
        isHighlighted: false,
      },
      {
        rank: 3,
        teamId: "t-stars",
        name: loc === "ar" ? "النجوم" : "Stars",
        schoolName: loc === "ar" ? "مدرسة الأمل" : "Al-Amal School",
        logoUrl: null,
        points: 950,
        rankChange: -1,
        rankChangeLabel: "▼ 1",
        isHighlighted: false,
      },
    ],
    nextMatch: {
      matchId: "m-1002",
      scheduledAt: "2026-07-13T11:00:00Z",
      scheduledLabel: loc === "ar" ? "غداً · 14:00" : "Tomorrow · 14:00",
      teams: [
        {
          teamId: "t-lightning",
          name: loc === "ar" ? "البرق" : "Lightning",
          logoUrl: null,
        },
        {
          teamId: "t-elite",
          name: loc === "ar" ? "النخبة" : "Elite",
          logoUrl: null,
        },
      ],
    },
    scheduleMatches: [
      {
        matchId: "m-1001",
        roundLabel: loc === "ar" ? "الجولة 3" : "Round 3",
        statusLabel: loc === "ar" ? "جارية" : "Live",
        scheduledLabel: loc === "ar" ? "الآن" : "Now",
        teams: [
          { teamId: "t-knights", name: loc === "ar" ? "الفرسان" : "Knights" },
          { teamId: "t-falcons", name: loc === "ar" ? "الصقور" : "Falcons" },
        ],
        scoreLabel: "1 : 2",
      },
      {
        matchId: "m-1002",
        roundLabel: loc === "ar" ? "الجولة 4" : "Round 4",
        statusLabel: loc === "ar" ? "قادمة" : "Upcoming",
        scheduledLabel: loc === "ar" ? "غداً · 14:00" : "Tomorrow · 14:00",
        teams: [
          { teamId: "t-lightning", name: loc === "ar" ? "البرق" : "Lightning" },
          { teamId: "t-elite", name: loc === "ar" ? "النخبة" : "Elite" },
        ],
        scoreLabel: null,
      },
      {
        matchId: "m-0999",
        roundLabel: loc === "ar" ? "الجولة 2" : "Round 2",
        statusLabel: loc === "ar" ? "منتهية" : "Ended",
        scheduledLabel: loc === "ar" ? "اليوم · 10:00" : "Today · 10:00",
        teams: [
          { teamId: "t-stars", name: loc === "ar" ? "النجوم" : "Stars" },
          { teamId: "t-knights", name: loc === "ar" ? "الفرسان" : "Knights" },
        ],
        scoreLabel: "0 : 2",
      },
    ],
    honorBoard: [
      {
        id: "honor-1",
        title: loc === "ar" ? "فارس الغامدي" : "Fares Al-Ghamdi",
        subtitle: loc === "ar" ? "أفضل مبتكر في الجولة" : "Best innovator of the round",
        pointsLabel: loc === "ar" ? "450 نقطة" : "450 points",
      },
      {
        id: "honor-2",
        title: loc === "ar" ? "سارة الصالح" : "Sara Al-Saleh",
        subtitle: loc === "ar" ? "أسرع حل لغز" : "Fastest puzzle solve",
        pointsLabel: loc === "ar" ? "420 نقطة" : "420 points",
      },
      {
        id: "honor-3",
        title: loc === "ar" ? "فريق الصقور" : "Falcons Team",
        subtitle: loc === "ar" ? "أعلى روح رياضية" : "Best sportsmanship",
        pointsLabel: loc === "ar" ? "بطاقة ذهبية" : "Golden card",
      },
    ],
  };
}
