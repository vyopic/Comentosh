import { User, Post, Comment, NotificationItem } from '../types';

export const CURRENT_USER: User = {
  id: 'usr_me',
  name: 'Tanvir Hossain',
  username: 'tanvirh',
  avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=tanvir&backgroundColor=e2e8f0',
  bio: 'Product Designer & Essayist. Exploring digital sociology, thoughtful interfaces, and non-extractive social spaces.',
  headline: 'Product Designer @ Studio Dialogue',
  joinedDate: 'Joined March 2024',
  followingCount: 312,
  followersCount: 1480,
  totalComments: 428,
  totalCommentLikes: 3950,
  discussionsStarted: 34,
  isVerified: true,
  phoneNumber: '+880 1712-345678',
};

export const DEMO_USERS: User[] = [
  CURRENT_USER,
  {
    id: 'usr_maya',
    name: 'Dr. Maya Lin',
    username: 'mayalin_cog',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=maya&backgroundColor=fef3c7',
    bio: 'Cognitive scientist studying attention economy and online discourse. Author of "The Depth Deficit".',
    headline: 'Cognitive Science Researcher',
    joinedDate: 'Joined January 2024',
    followingCount: 184,
    followersCount: 5240,
    totalComments: 890,
    totalCommentLikes: 12450,
    discussionsStarted: 62,
    isVerified: true,
    isFollowing: true,
    phoneNumber: '+880 1819-234567',
  },
  {
    id: 'usr_alex',
    name: 'Alex Vance',
    username: 'alexvance_dev',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=alex&backgroundColor=e0e7ff',
    bio: 'Distributed systems architect. Writing about local-first software, CRDTs, and durable data.',
    headline: 'Principal Systems Architect',
    joinedDate: 'Joined February 2024',
    followingCount: 240,
    followersCount: 3180,
    totalComments: 615,
    totalCommentLikes: 8240,
    discussionsStarted: 48,
    isVerified: true,
    isFollowing: false,
    phoneNumber: '+880 1911-876543',
  },
  {
    id: 'usr_elena',
    name: 'Elena Rostova',
    username: 'elena_design',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=elena&backgroundColor=fce7f3',
    bio: 'Typography enthusiast & Design Director. Believer in quiet software and intentional typography.',
    headline: 'Design Director @ TypoCraft',
    joinedDate: 'Joined November 2023',
    followingCount: 410,
    followersCount: 4620,
    totalComments: 512,
    totalCommentLikes: 7890,
    discussionsStarted: 29,
    isVerified: true,
    isFollowing: true,
    phoneNumber: '+880 1622-456789',
  },
  {
    id: 'usr_sufian',
    name: 'Sufian Ahmed',
    username: 'sufian_ideas',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=sufian&backgroundColor=dcfce7',
    bio: 'Tech journalist & essayist. Covering South Asian digital infrastructure and social tech trends.',
    headline: 'Tech Writer & Media Critic',
    joinedDate: 'Joined December 2023',
    followingCount: 329,
    followersCount: 2980,
    totalComments: 740,
    totalCommentLikes: 9120,
    discussionsStarted: 55,
    isVerified: false,
    isFollowing: false,
  },
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'cmt_101',
    postId: 'post_1',
    author: DEMO_USERS[1], // Maya Lin
    content: `The psychology behind removing post likes is fascinating. When you strip away the instant gratification metric of a heart button, users are forced to articulate their reaction. That friction—taking 15 seconds to formulate a sentence—filters out mindless scrolling and prompts higher cognitive involvement. That's why the comments here actually feel like conversations rather than cheerleading sections.`,
    createdAt: '2 hours ago',
    likesCount: 142,
    isLikedByMe: true,
    isPinnedByAuthor: true,
    isTopComment: true,
    replies: [
      {
        id: 'rep_101_1',
        commentId: 'cmt_101',
        postId: 'post_1',
        author: DEMO_USERS[2], // Alex Vance
        content: `Spot on, Maya. As developers, we optimize for click metrics because they are cheap. But conversation density is a 10x stronger signal of community retention.`,
        createdAt: '1 hour ago',
        likesCount: 38,
        isLikedByMe: false,
        replyToUsername: 'mayalin_cog',
      },
      {
        id: 'rep_101_2',
        commentId: 'cmt_101',
        postId: 'post_1',
        author: CURRENT_USER,
        content: `Exactly. It flips the social incentive: you gain reputation not by broadcasting vanity photos, but by contributing genuinely constructive thoughts in someone else's thread.`,
        createdAt: '45 mins ago',
        likesCount: 19,
        isLikedByMe: true,
        replyToUsername: 'mayalin_cog',
      },
    ],
  },
  {
    id: 'cmt_102',
    postId: 'post_1',
    author: DEMO_USERS[3], // Elena Rostova
    content: `From a UI design perspective, removing post likes changes the typography and visual hierarchy completely. Instead of placing huge vanity counters under the post card, the eye is guided directly to the debate header: 'Top Perspective' or 'Active Discussion'. It feels mature and editorial.`,
    createdAt: '3 hours ago',
    likesCount: 88,
    isLikedByMe: false,
    replies: [
      {
        id: 'rep_102_1',
        commentId: 'cmt_102',
        postId: 'post_1',
        author: DEMO_USERS[4],
        content: `Reminds me of classic forums or Usenet, but modernized with real-time reactive replies.`,
        createdAt: '2 hours ago',
        likesCount: 14,
        isLikedByMe: false,
        replyToUsername: 'elena_design',
      },
    ],
  },
  {
    id: 'cmt_103',
    postId: 'post_1',
    author: DEMO_USERS[4], // Sufian
    content: `Do you think mainstream users will adopt a platform without a 1-tap like button, or will it naturally cater to writers, researchers, and technical professionals?`,
    createdAt: '4 hours ago',
    likesCount: 34,
    isLikedByMe: false,
    replies: [],
  },

  // Comments for post 2
  {
    id: 'cmt_201',
    postId: 'post_2',
    author: DEMO_USERS[2], // Alex Vance
    content: `Local-first is not just about offline capability; it is about data ownership and dignity. When your notes, drafts, and dialogues reside on your machine first and sync via verifiable CRDTs, you are no longer a tenant in someone's closed garden.`,
    createdAt: '5 hours ago',
    likesCount: 116,
    isLikedByMe: true,
    isPinnedByAuthor: true,
    isTopComment: true,
    replies: [
      {
        id: 'rep_201_1',
        commentId: 'cmt_201',
        postId: 'post_2',
        author: CURRENT_USER,
        content: `What do you recommend for conflict resolution in rich text with multiple collaborative editors? Automerge or Yjs?`,
        createdAt: '3 hours ago',
        likesCount: 22,
        isLikedByMe: false,
        replyToUsername: 'alexvance_dev',
      },
      {
        id: 'rep_201_2',
        commentId: 'cmt_201',
        postId: 'post_2',
        author: DEMO_USERS[2],
        content: `Yjs has the strongest ecosystem right now, especially for block-based editors, while Automerge has cleaner formal proofs. Both are great.`,
        createdAt: '2 hours ago',
        likesCount: 45,
        isLikedByMe: true,
        replyToUsername: 'tanvirh',
      },
    ],
  },
  {
    id: 'cmt_202',
    postId: 'post_2',
    author: DEMO_USERS[1],
    content: `The psychological comfort of knowing your data cannot vanish because a startup changed terms or shut down is immense.`,
    createdAt: '6 hours ago',
    likesCount: 63,
    isLikedByMe: false,
    replies: [],
  },

  // Comments for post 3
  {
    id: 'cmt_301',
    postId: 'post_3',
    author: DEMO_USERS[3], // Elena Rostova
    content: `I test fonts by looking at punctuation: the quotation marks, the ampersand, and the question mark. If those three have distinctive personality and harmonious stroke contrast, the entire editorial design sings.`,
    createdAt: '7 hours ago',
    likesCount: 95,
    isLikedByMe: true,
    isPinnedByAuthor: true,
    isTopComment: true,
    replies: [],
  },

  // Comments for post 4
  {
    id: 'cmt_401',
    postId: 'post_4',
    author: DEMO_USERS[1],
    content: `Deep work requires what psychologists call 'attentional cocooning'. Constant notifications fragment the working memory buffer. Batching team communication to 2 synchronous windows per day changed my team's research output completely.`,
    createdAt: '8 hours ago',
    likesCount: 178,
    isLikedByMe: true,
    isPinnedByAuthor: true,
    isTopComment: true,
    replies: [],
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    author: CURRENT_USER,
    content: `Why did social media become an endless slot machine of vanity metrics?

When you remove the 'Post Like' button, everything shifts. You no longer post to collect mindless double-taps. You post because you genuinely want to know what people think, where they disagree, and what nuances you overlooked.

Comentosh is built around this exact thesis: Where Conversations Matter. If a post doesn't spark a thought worth writing down, was it really worth broadcasting?

What is one social media convention that you think has actively degraded human communication?`,
    topic: 'Philosophy & Tech',
    createdAt: '3 hours ago',
    commentsCount: 24,
    participantsCount: 18,
    viewsCount: 1420,
    sharesCount: 19,
    isSaved: true,
    isPinned: true,
    topComment: INITIAL_COMMENTS[0],
  },
  {
    id: 'post_2',
    author: DEMO_USERS[2], // Alex Vance
    content: `The architecture of social web platforms is overdue for a clean reset.

For 15 years we built client-server monopolies where your conversations were locked in proprietary databases. Today, local-first protocols (CRDTs, SQLite in WASM, edge workers) allow us to build platforms that respect personal autonomy.

Here is a visual breakdown of how we're thinking about the Cloudflare Workers + D1 + R2 pipeline for high-concurrency comment trees.`,
    topic: 'Software Architecture',
    images: [
      '/src/assets/images/architecture_system_diagram_1793959664293.jpg',
    ],
    createdAt: '6 hours ago',
    commentsCount: 42,
    participantsCount: 31,
    viewsCount: 2850,
    sharesCount: 37,
    isSaved: false,
    topComment: INITIAL_COMMENTS[3],
  },
  {
    id: 'post_3',
    author: DEMO_USERS[3], // Elena Rostova
    content: `Modern interfaces often suffer from 'visual diabetes'—too many pill tags, artificial gradients, neon glowing borders, and floating cards inside cards.

When we strip back that noise and let clean typography, generous white space, and hairline structural borders breathe, the content commands attention. Good UI isn't the decoration; it is the glass through which ideas are read.`,
    topic: 'Design & Craft',
    images: [
      '/src/assets/images/editorial_typography_design_1793959664692.jpg',
    ],
    createdAt: '9 hours ago',
    commentsCount: 18,
    participantsCount: 14,
    viewsCount: 1980,
    sharesCount: 12,
    isSaved: false,
    topComment: INITIAL_COMMENTS[5],
  },
  {
    id: 'post_4',
    author: DEMO_USERS[1], // Dr. Maya Lin
    content: `A research question for the community:

We are running a cognitive study on the threshold between 'scanning' and 'deep reading' in digital communication. Preliminary data shows that when an interface emphasizes comment replies over quick reactions, users re-read paragraphs 2.4x more often before responding.

How has your own reading habit changed over the past 3 years? Do you feel your patience for long-form essays has shrunk or evolved?`,
    topic: 'Cognitive Science',
    createdAt: '12 hours ago',
    commentsCount: 56,
    participantsCount: 44,
    viewsCount: 3900,
    sharesCount: 48,
    isSaved: true,
    topComment: INITIAL_COMMENTS[6],
  },
  {
    id: 'post_5',
    author: DEMO_USERS[4], // Sufian
    content: `South Asian tech hubs are seeing a surge in micro-communities moving away from mega-platforms like Facebook Groups into specialized conversational hubs.

The complaint is universal: algorithmic feeds bury thoughtful questions in favor of controversial rage-bait that generates fast angry clicks. People want calm, moderated spaces where good comments rise to the top.`,
    topic: 'Media & Society',
    createdAt: '1 day ago',
    commentsCount: 31,
    participantsCount: 22,
    viewsCount: 2150,
    sharesCount: 25,
    isSaved: false,
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    type: 'comment_like',
    actor: DEMO_USERS[1],
    postId: 'post_1',
    commentId: 'cmt_101',
    contentSnippet: 'Dr. Maya Lin agreed with your comment: "It flips the social incentive: you gain reputation..."',
    createdAt: '40 mins ago',
    isRead: false,
  },
  {
    id: 'notif_2',
    type: 'comment_reply',
    actor: DEMO_USERS[2],
    postId: 'post_2',
    commentId: 'cmt_201',
    contentSnippet: 'Alex Vance replied to your question about CRDT conflict resolution.',
    createdAt: '2 hours ago',
    isRead: false,
  },
  {
    id: 'notif_3',
    type: 'milestone',
    actor: CURRENT_USER,
    postId: 'post_1',
    commentId: 'cmt_101',
    contentSnippet: 'Insight Milestone: Your comment reached 100+ likes from community thinkers.',
    createdAt: '5 hours ago',
    isRead: true,
  },
  {
    id: 'notif_4',
    type: 'post_comment',
    actor: DEMO_USERS[3],
    postId: 'post_1',
    contentSnippet: 'Elena Rostova shared a perspective on your discussion: "Why did social media become..."',
    createdAt: '7 hours ago',
    isRead: true,
  },
];

export const POPULAR_TOPICS = [
  { id: 'tech', name: 'Software Architecture', postCount: 142, icon: 'code' },
  { id: 'design', name: 'Design & Craft', postCount: 98, icon: 'palette' },
  { id: 'cognition', name: 'Cognitive Science', postCount: 76, icon: 'brain' },
  { id: 'philosophy', name: 'Philosophy & Tech', postCount: 124, icon: 'feather' },
  { id: 'society', name: 'Media & Society', postCount: 65, icon: 'globe' },
  { id: 'ai', name: 'AI & Systems', postCount: 189, icon: 'cpu' },
];
