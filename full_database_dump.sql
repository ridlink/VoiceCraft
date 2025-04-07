--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audio_generations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.audio_generations (
    id integer NOT NULL,
    text text NOT NULL,
    voice_id text NOT NULL,
    voice_name text,
    stability integer DEFAULT 50,
    clarity integer DEFAULT 70,
    audio_url text,
    format text DEFAULT 'mp3'::text,
    duration integer,
    download_count integer DEFAULT 0,
    user_id integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.audio_generations OWNER TO neondb_owner;

--
-- Name: audio_generations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.audio_generations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audio_generations_id_seq OWNER TO neondb_owner;

--
-- Name: audio_generations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.audio_generations_id_seq OWNED BY public.audio_generations.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO neondb_owner;

--
-- Name: user_stats; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_stats (
    id integer NOT NULL,
    user_id integer NOT NULL,
    date date NOT NULL,
    generation_count integer DEFAULT 0,
    character_count integer DEFAULT 0,
    audio_duration integer DEFAULT 0
);


ALTER TABLE public.user_stats OWNER TO neondb_owner;

--
-- Name: user_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_stats_id_seq OWNER TO neondb_owner;

--
-- Name: user_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.user_stats_id_seq OWNED BY public.user_stats.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    full_name text,
    avatar text,
    api_key text,
    role text DEFAULT 'user'::text,
    total_generations integer DEFAULT 0,
    monthly_quota integer DEFAULT 100,
    created_at timestamp without time zone DEFAULT now(),
    last_login_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: voice_stats; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.voice_stats (
    id integer NOT NULL,
    voice_id text NOT NULL,
    use_count integer DEFAULT 0,
    average_rating integer,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.voice_stats OWNER TO neondb_owner;

--
-- Name: voice_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.voice_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.voice_stats_id_seq OWNER TO neondb_owner;

--
-- Name: voice_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.voice_stats_id_seq OWNED BY public.voice_stats.id;


--
-- Name: voices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.voices (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    language text,
    category text,
    premium boolean DEFAULT false,
    preview_url text,
    accent text,
    age text,
    gender text,
    use_case text,
    labels text
);


ALTER TABLE public.voices OWNER TO neondb_owner;

--
-- Name: audio_generations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audio_generations ALTER COLUMN id SET DEFAULT nextval('public.audio_generations_id_seq'::regclass);


--
-- Name: user_stats id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_stats ALTER COLUMN id SET DEFAULT nextval('public.user_stats_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: voice_stats id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.voice_stats ALTER COLUMN id SET DEFAULT nextval('public.voice_stats_id_seq'::regclass);


--
-- Data for Name: audio_generations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.audio_generations (id, text, voice_id, voice_name, stability, clarity, audio_url, format, duration, download_count, user_id, created_at) FROM stdin;
59	Suddenly, Benny tripped and tumbled into a soft patch of grasshe said, then laughed.\n\nA gentle voice said, It was Mama Bunny, smiling.\n“You may not fly,” she said, “but you hop better than anyone!”\n\nBenny smiled wide. “Then I’ll hop all the way home!”	IKne3meq5aSn9XLyUdCD	Charlie	50	70		mp3	0	0	1	2025-04-07 10:37:52.219131
58	Suddenly, Benny tripped and tumbled into a soft patch of grass. “Oof!” he said, then laughed.\n\nA gentle voice said, “Careful, little bunny!” It was Mama Bunny, smiling.\n“You may not fly,” she said, “but you hop better than anyone!”\n\nBenny smiled wide. “Then I’ll hop all the way home!”	IKne3meq5aSn9XLyUdCD	Charlie	50	70		mp3	0	1	1	2025-04-07 10:32:33.842891
60	Suddenly, Benny tripped and tumbled into a soft patch of grasshe said, then laughed.\n\nA gentle voice said, It was Mama Bunny, smiling.\n“You may not fly,” she said, “but you hop better than anyone!”\n\nBenny smiled wide. “Then I’ll hop all the way home!”	IKne3meq5aSn9XLyUdCD	Charlie	50	70		mp3	0	0	1	2025-04-07 10:44:12.917958
61	Suddenly, Benny tripped and tumbled into a soft patch of grass. “Oof!” he said, then laughed.\n\nA gentle voice said, “Careful, little bunny!” It was Mama Bunny, smiling.\n“You may not fly,” she said, “but you hop better than anyone!”\n\nBenny smiled wide. “Then I’ll hop all the way home!”	IKne3meq5aSn9XLyUdCD	Charlie	50	70		mp3	0	0	1	2025-04-07 10:44:17.867961
63	The Bridge Between\nOnce in a quiet town nestled between two hills, lived two childhood friends—Ayaan and Zee. From building treehouses to skipping school for bike rides, they did everything together. As they grew older, life began to tug them in different directions—Ayaan pursued engineering in the city, while Zee stayed back to help with his family’s local shop.	IKne3meq5aSn9XLyUdCD	Charlie	50	70		mp3	0	0	1	2025-04-07 12:00:26.855442
64	The Bridge Between\nOnce in a quiet town nestled between two hills, lived two childhood friends—Ayaan and Zee. From building treehouses to skipping school for bike rides, they did everything together. As they grew older, life began to tug them in different directions—Ayaan pursued engineering in the city, while Zee stayed back to help with his family’s local shop.	IKne3meq5aSn9XLyUdCD	Charlie	50	70		mp3	0	0	1	2025-04-07 12:02:37.262914
62	Once upon a time, in a meadow full of flowers, lived a tiny bunny named Benny. Benny had soft white fur and the fluffiest little tail.\n\nOne sunny morning, Benny saw a colorful butterfly fluttering by.\n“I want to fly too!” Benny giggled and hopped after it.	IKne3meq5aSn9XLyUdCD	Charlie	50	70		mp3	0	2	1	2025-04-07 10:56:25.333646
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.session (sid, sess, expire) FROM stdin;
2QWGJ4q_dSoxhozKIUgeJx_E6_9Qf7T4	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-07T19:51:30.881Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-05-07 19:51:31
kONKOWGs3dbcZJxZ7m5DxtiKBVgxCw_U	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-06T19:30:37.373Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-05-07 11:59:19
UjgNTiNSbH3K8VdRHojH63EhY2CSScvE	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-07T10:13:16.189Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-05-07 12:08:53
\.


--
-- Data for Name: user_stats; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_stats (id, user_id, date, generation_count, character_count, audio_duration) FROM stdin;
1	1	2025-04-06	44	16657	0
2	1	2025-04-07	20	12095	0
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, email, password, full_name, avatar, api_key, role, total_generations, monthly_quota, created_at, last_login_at) FROM stdin;
1	malikatiq	malikatiq@gmail.com	da3d69f6ed30a5f6356e4e8780efab5f36a8279f46bbd9a4fb39b2698816204ab4572dc57fdccc5ed694ac018e8c0060681c417f919834120d994eeda77c4283.21cf1e1c48acfaaf2e69f1cf59e49404	malik atiq	\N	\N	user	64	100	2025-04-06 19:14:23.011389	2025-04-07 19:51:30.813
\.


--
-- Data for Name: voice_stats; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.voice_stats (id, voice_id, use_count, average_rating, updated_at) FROM stdin;
1	9BWtsMINqrJLrRacOk9x	0	\N	2025-04-06 19:14:24.634185
8	SAz9YHcvj6GT2YYXdXww	0	\N	2025-04-06 19:14:25.261887
9	TX3LPaxmHKxFdv7VOQHJ	0	\N	2025-04-06 19:14:25.350251
12	XrExE9yKIg1WjnnlVkGX	0	\N	2025-04-06 19:14:25.612407
13	bIHbv24MWmeRgasZH58o	0	\N	2025-04-06 19:14:25.70607
14	cgSgspJ2msm6clMCkdW9	0	\N	2025-04-06 19:14:25.805608
15	cjVigY5qzO86Huf0OWal	0	\N	2025-04-06 19:14:25.894456
16	iP95p4xoKVk53GoZ742B	0	\N	2025-04-06 19:14:25.985432
18	onwK4e9ZLuTAKqWW03F9	0	\N	2025-04-06 19:14:26.161867
19	pFZP5JQG7iQjIQuC4Bku	0	\N	2025-04-06 19:14:26.252994
20	pqHfZKP75CvOlQylNhV4	0	\N	2025-04-06 19:14:26.341309
21	1qEiC6qsybMkmnNdVMbK	0	\N	2025-04-06 19:14:26.43043
22	MF4J4IDTRo0AxOO4dpFR	0	\N	2025-04-06 19:14:26.541135
23	UgBBYS2sOqTuMpoF3BR0	0	\N	2025-04-06 19:14:26.63361
24	g7mN13BvpktqLGMFcHnh	0	\N	2025-04-06 19:14:26.720727
25	DUnzBkwtjRWXPr6wRbmL	0	\N	2025-04-06 19:14:26.808631
26	3ukZmQVZvZvQX8hRfVUC	0	\N	2025-04-06 19:14:26.897782
27	NOpBlnGInO9m6vDvFkFC	0	\N	2025-04-06 19:14:26.987527
29	zs7UfyHqCCmny7uTxCYi	0	\N	2025-04-06 19:14:27.165785
30	zT03pEAEi0VHKciJODfn	0	\N	2025-04-06 19:14:27.254601
31	hWnML2XRpykt4MG3bS1i	0	\N	2025-04-06 19:14:27.342432
32	GHKbgpqchXOxta6X2lSd	0	\N	2025-04-06 19:14:27.429675
33	A6RLtcsvTlo0Nvj0hL92	0	\N	2025-04-06 19:14:27.517591
34	EbNQYR6picTv5LQTVCUj	0	\N	2025-04-06 19:14:27.605132
35	kLuXkg0zRFuSas1JFmMT	0	\N	2025-04-06 19:14:27.691733
36	sJGSzrOOtoYSYJarCtSZ	0	\N	2025-04-06 19:14:27.780739
37	50YSQEDPA2vlOxhCseP4	0	\N	2025-04-06 19:14:27.868687
38	lfQ3pGxnwOiKjnQKdwts	0	\N	2025-04-06 19:14:27.962127
39	lnUnPeUhSI5EcqtFBux7	0	\N	2025-04-06 19:14:28.049377
40	81P9FItrsqCg10Dmvpx4	0	\N	2025-04-06 19:14:28.136539
41	bajNon13EdhNMndG3z05	0	\N	2025-04-06 19:14:28.224733
42	qNkzaJoHLLdpvgh5tISm	0	\N	2025-04-06 19:14:28.31297
43	KHTrsKwjtYROsJ3YX9Kp	0	\N	2025-04-06 19:14:28.400581
44	0uNx32SryGNB45E9gqXp	0	\N	2025-04-06 19:14:28.490854
45	he8htk79seUffecriu3g	0	\N	2025-04-06 19:14:28.578206
46	Nh2zY9kknu6z4pZy6FhD	0	\N	2025-04-06 19:14:28.666319
47	bIG2GqwKHYvGMmnafJ0x	0	\N	2025-04-06 19:14:28.75496
48	HVxi4Mh2pz93HbCpYLUN	0	\N	2025-04-06 19:14:28.84302
49	Gayxrw2ICzdHSQnMNfOn	0	\N	2025-04-06 19:14:28.931824
50	EkK5I93UQWFDigLMpZcX	0	\N	2025-04-06 19:14:29.019062
51	eMw24BMCPTubF3SCWQCP	0	\N	2025-04-06 19:14:29.106085
52	sH5huVYYfxYRVp1Hf8QX	0	\N	2025-04-06 19:14:29.193299
53	i0AbNZZnGgIjkigFJBYk	0	\N	2025-04-06 19:14:29.281286
54	hRRDxPcPOhAcDSw9JMuV	0	\N	2025-04-06 19:14:29.368454
55	xelDEkVBz5tev5UsfuG8	0	\N	2025-04-06 19:14:29.456193
56	4lbB2BFh2d4JYD7g9OxE	0	\N	2025-04-06 19:30:38.764205
57	HVULdNXfVmzDVUIjE0p4	0	\N	2025-04-06 19:30:38.879366
58	0NrM0c1eqKCdseNwQ7PN	0	\N	2025-04-06 19:30:38.981519
59	YrBXZ0VijPgT3njvU2Em	0	\N	2025-04-06 19:30:39.085835
60	nxOb3V7xvhvmKJTz6W6Z	0	\N	2025-04-06 19:30:39.187493
11	Xb7hH8MSUJpSbSDYk0k2	1	\N	2025-04-06 19:14:25.525031
10	XB0fDUnXU5powFXDhCwa	1	\N	2025-04-06 19:14:25.437725
61	LhaIX8nRDfDxOopz2Fp3	0	\N	2025-04-06 20:04:47.929023
62	dPah2VEoifKnZT37774q	0	\N	2025-04-06 20:04:48.091025
63	W7wvC5vI9CKg8leDuvkO	0	\N	2025-04-06 20:04:48.183064
64	TgSN0ME6LZNyJ5ovsQwn	0	\N	2025-04-06 20:04:48.274869
66	DUZTv29kJnTm2QIYqfLB	0	\N	2025-04-06 20:04:48.491363
17	nPczCjzI2devNBz1zQrb	2	\N	2025-04-06 20:07:22.965
5	IKne3meq5aSn9XLyUdCD	22	\N	2025-04-06 20:44:34.529
7	N2lVS1w4EtoT3dr4eOWO	3	\N	2025-04-06 19:14:25.17174
67	yl2ZDV1MzN4HbQJbMihG	0	\N	2025-04-06 20:14:11.007461
28	P1bg08DkjqiVEzOn76yG	3	\N	2025-04-06 20:46:00.695
2	CwhRBWXzGAHq8TQ4Fs17	2	\N	2025-04-06 20:16:40.86
71	qSV5UqvHBC0Widy71Esh	11	\N	2025-04-06 20:39:25.733879
6	JBFqnCBsd6RMkjVDRZzb	1	\N	2025-04-06 19:14:25.081494
68	v9LgF91V36LGgbLX3iHW	0	\N	2025-04-06 20:24:19.105399
69	fCxG8OHm4STbIsWe4aT9	0	\N	2025-04-06 20:24:19.21989
72	JxKiVb1ap7j1dISCWfYL	0	\N	2025-04-07 09:59:01.39111
73	kD4dEWy2fbcyXlge6iHh	0	\N	2025-04-07 09:59:01.489956
74	NmXxuFZXOfcER1p4vgNK	0	\N	2025-04-07 09:59:01.709131
3	EXAVITQu4vr4xnSDxMaL	16	\N	2025-04-06 20:29:06.082
65	k7nOSUCadIEwB6fdJmbw	1	\N	2025-04-06 20:34:08.525
4	FGY2WhTYpPnrIDTdsKH5	1	\N	2025-04-06 20:34:41.919
70	r21m7BAbXjtux814CeJE	0	\N	2025-04-06 20:39:25.56658
75	aUTn6mevnrM9pqtesisb	0	\N	2025-04-07 09:59:01.890175
76	k2intd1ORm0YUH8etnXg	0	\N	2025-04-07 09:59:01.995624
77	F9w7aaEjfT09qV89OdY8	0	\N	2025-04-07 09:59:02.089271
78	bpH36mvRPdE0WM0DfCRX	0	\N	2025-04-07 09:59:02.244065
79	exMy2q3EvIVwayOlxRgQ	0	\N	2025-04-07 09:59:02.344418
80	Hh5Npx68SDu5MmIowmPM	0	\N	2025-04-07 09:59:02.437341
81	9XfYMbJVZqPHaQtYnTAO	0	\N	2025-04-07 09:59:02.534072
82	M563YhMmA0S8vEYwkgYa	0	\N	2025-04-07 09:59:02.644189
83	weA4Q36twV5kwSaTEL0Q	0	\N	2025-04-07 09:59:02.741586
84	O4fnkotIypvedJqBp4yb	0	\N	2025-04-07 09:59:03.043846
85	ddx3E8TyEGxTKEay1Vvd	0	\N	2025-04-07 09:59:03.139363
86	OdSIrkgjl70gSlkQMZrh	0	\N	2025-04-07 09:59:03.229249
87	X1tufN2s4pZ5Z7j8p23n	0	\N	2025-04-07 09:59:03.322873
88	5TJdsnJwtj3mOSGbRNHi	0	\N	2025-04-07 09:59:03.547709
89	JsCHerdAgybI5rFoEvtp	0	\N	2025-04-07 09:59:03.652322
90	MvBnPbLnvfvn5ovVU27H	0	\N	2025-04-07 09:59:03.797095
91	UKTlInlesNrio9yfq6aK	0	\N	2025-04-07 09:59:03.889965
92	sUFG5t71uzP2RzbNN5kG	0	\N	2025-04-07 09:59:03.987771
93	nvThR2vEjGDBCRYxzqpx	0	\N	2025-04-07 09:59:04.08271
94	08bQn7t2jbFQhC4zC5pz	0	\N	2025-04-07 09:59:04.178041
95	8coVMHQl7ctBaQFOnDid	0	\N	2025-04-07 09:59:04.273573
96	SQdLmQXe59w3SPjaqg1X	0	\N	2025-04-07 09:59:04.372294
97	wrlkaBfhZ82VlzXQqRKz	0	\N	2025-04-07 09:59:04.466064
98	272n5yA9S8KwZazf8tQE	0	\N	2025-04-07 09:59:04.567111
99	1TPhJlY4klPMPSrWPYF7	0	\N	2025-04-07 09:59:04.664656
100	0CvSX8RSrLOnUpqHqxEg	0	\N	2025-04-07 09:59:04.758828
101	BfMHwZYBanT6jdQAhNv5	0	\N	2025-04-07 09:59:04.865373
102	tnSpp4vdxKPjI9w0GnoV	0	\N	2025-04-07 09:59:04.963188
103	56AoDkrOh6qfVPDXZ7Pt	0	\N	2025-04-07 09:59:05.059181
129	8EBmk7pa5b3OEZkvF2oI	0	\N	2025-04-07 09:59:07.196239
104	tHeWfoMy5jprxyRflqDj	0	\N	2025-04-07 09:59:05.170803
111	JMDdgwXRakGs3HHGdhF9	0	\N	2025-04-07 09:59:05.762438
105	i5Ta4NDRfH72j44UzKq2	0	\N	2025-04-07 09:59:05.266556
109	f4IvejEsfxoqukuspTlr	0	\N	2025-04-07 09:59:05.607473
115	BL5TwXQ64mFfSQBPs8Jg	0	\N	2025-04-07 09:59:06.083114
119	EGQM7bHbTHTb7VUEcOHG	0	\N	2025-04-07 09:59:06.398351
121	qBDvhofpxp92JgXJxDjB	0	\N	2025-04-07 09:59:06.557005
125	qCokLcPlG6W9nHgVB6jW	0	\N	2025-04-07 09:59:06.878991
126	kqVT88a5QfII1HNAEPTJ	0	\N	2025-04-07 09:59:06.96679
137	80lPKtzJMPh1vjYMUgwe	0	\N	2025-04-07 09:59:07.833103
106	5XtR2dJmd2FRsUZFoCYN	0	\N	2025-04-07 09:59:05.361498
116	cFGjvn03L4XTIWdp19j8	0	\N	2025-04-07 09:59:06.15242
132	SwHLYrqoyQ3Rpl7R41xe	0	\N	2025-04-07 09:59:07.43348
135	No6k8FjiFTskn50v5Vn0	0	\N	2025-04-07 09:59:07.68032
107	WWJOsu8KrDwoaPWOOYPj	0	\N	2025-04-07 09:59:05.450442
113	hDOLRnQbqg7ZF0FmyVgH	0	\N	2025-04-07 09:59:05.926726
117	9BSDLkqB0aAd87FvEcTu	0	\N	2025-04-07 09:59:06.245789
123	SdpcBQnlSLHjMbC4drpT	0	\N	2025-04-07 09:59:06.724446
134	gUABw7pXQjhjt0kNFBTF	0	\N	2025-04-07 09:59:07.582967
108	cIxuahi2U5bzoujkkCBi	0	\N	2025-04-07 09:59:05.520064
114	1DgIqgF0J3zeRIgmzUyb	0	\N	2025-04-07 09:59:05.990575
128	8wabydHBwrQjOcdtz34V	0	\N	2025-04-07 09:59:07.118933
110	NShoSejNmNwcmTod5IfS	0	\N	2025-04-07 09:59:05.671922
112	3r1cKHQqcNUrwBcU2X4R	0	\N	2025-04-07 09:59:05.836031
118	lkVAP8k5tC0Wr1dYyQZH	0	\N	2025-04-07 09:59:06.307264
122	qMWiKJnYIpKnTfN3rWDk	0	\N	2025-04-07 09:59:06.656158
130	RexqLjNzkCjWogguKyff	0	\N	2025-04-07 09:59:07.279797
131	lkW8HTfl5LTHtcchyAw4	0	\N	2025-04-07 09:59:07.357101
133	nFQ2TwlXOa1Ae86G4jVd	0	\N	2025-04-07 09:59:07.51526
136	EzoxNTKsg4JNN7wxAgut	0	\N	2025-04-07 09:59:07.75676
120	aAXy11wGiXEMrGX6lHrp	0	\N	2025-04-07 09:59:06.462338
124	o3SQUkaY51Vx1Hi229p1	0	\N	2025-04-07 09:59:06.814189
127	PKGti0C5FW3Uor61qfkW	0	\N	2025-04-07 09:59:07.029213
138	IUVz5oaDchHYWBVH2BoJ	0	\N	2025-04-07 10:47:22.466664
139	NgBYGKDDq2Z8Hnhatgma	0	\N	2025-04-07 11:05:50.183119
140	vYtH5rm1y72VzzGqgmEY	0	\N	2025-04-07 11:06:40.712289
141	pcQH1pNsxlD8YFxrbLIE	0	\N	2025-04-07 11:06:40.807265
142	Vhtk7tMIXtmUZCjshYRc	0	\N	2025-04-07 11:15:13.566347
143	SCEfsIWOdUskbVhZy7qD	0	\N	2025-04-07 11:21:08.85602
144	n6BcoS0QyLMPmFXWu1Bm	0	\N	2025-04-07 11:22:04.214334
145	Hd8mWkf5kvyBZB0S7yXU	0	\N	2025-04-07 11:44:14.783778
146	90ipbRoKi4CpHXvKVtl0	0	\N	2025-04-07 11:44:14.898985
147	9aRz98clruXM4cq7czPo	0	\N	2025-04-07 11:44:14.996682
148	q0PCqBlLEWqtUZJ2DYn7	0	\N	2025-04-07 11:44:15.098222
149	FikxkbY0N0nDMvgtCmQ8	0	\N	2025-04-07 11:44:15.203996
150	6NLNAr74HtMtG4Dt3VDM	0	\N	2025-04-07 11:44:15.300071
151	ZmMj3zzbqPXpZPgBcZU8	0	\N	2025-04-07 11:59:18.69576
152	6rr4jpS124uCLNtgVdAk	0	\N	2025-04-07 18:17:07.427453
153	fRV3NpXPa1DGVnFs6Dg5	0	\N	2025-04-07 18:17:07.534401
154	wBXNqKUATyqu0RtYt25i	0	\N	2025-04-07 18:17:07.631377
155	xZp4zaaBzoWhWxxrcAij	0	\N	2025-04-07 18:17:07.728404
156	T5cu6IU92Krx4mh43osx	0	\N	2025-04-07 18:17:07.826952
157	5NRYuU2jyT0WmtbtxTno	0	\N	2025-04-07 18:17:07.927617
158	wWUG72eEtupiUkpXafwX	0	\N	2025-04-07 18:17:08.036819
159	uju3wxzG5OhpWcoi3SMy	0	\N	2025-04-07 18:17:08.134976
160	nUSM7wO8D7PJIJFlKBXT	0	\N	2025-04-07 18:17:08.233858
161	zgqefOY5FPQ3bB7OZTVR	0	\N	2025-04-07 18:17:08.337815
162	83EM3MdE65RAqeqeTK4j	0	\N	2025-04-07 18:17:08.446143
163	abYMJzttAqXE5275JAVp	0	\N	2025-04-07 18:17:08.518736
164	r37RxSO9P16kl2tOGSyL	0	\N	2025-04-07 18:17:08.612056
165	BpjGufoPiobT79j2vtj4	0	\N	2025-04-07 18:17:08.680974
166	NFG5qt843uXKj4pFvR7C	0	\N	2025-04-07 18:17:08.84301
167	wNvqdMNs9MLd1PG6uWuY	0	\N	2025-04-07 18:17:08.909548
168	m2mWmQzNVZUkut629YA1	0	\N	2025-04-07 18:17:09.004364
169	CcFpHHVz5kILl9eZ2Sxg	0	\N	2025-04-07 18:17:09.072221
170	QTcRvB8dMQHqasKsGPld	0	\N	2025-04-07 18:17:09.166739
171	BaM0BNY0ovEPFiJpeus8	0	\N	2025-04-07 18:17:09.234592
172	goEQO6V6AfoGlPeutmxr	0	\N	2025-04-07 18:17:09.332672
173	qNNSfHmjNjaRb9C0rrbr	0	\N	2025-04-07 18:17:09.399303
174	6vKjT1iUyBNUKWs37k2l	0	\N	2025-04-07 18:17:09.495403
175	WENctZQ166OZjmhLZvMc	0	\N	2025-04-07 18:17:09.559544
176	bftGW4ijZLpcayo7YbuH	0	\N	2025-04-07 18:17:09.65625
177	Nx1A8NCXT01hn1TfC7rF	0	\N	2025-04-07 18:17:09.722486
178	pLyFVoSdpz412R9kWcmm	0	\N	2025-04-07 18:17:09.824181
179	oIrReGAWJuGKVf4DxEt8	0	\N	2025-04-07 18:17:09.900456
180	0JbMW9nbhoExwUpzk9Cd	0	\N	2025-04-07 18:17:09.994493
181	HW2QhP8RA3y2rF1pmo3H	0	\N	2025-04-07 18:17:10.070879
182	LAQOMqiCMj1mWLXzQMqA	0	\N	2025-04-07 18:17:10.159464
183	cDOQV3QlJloYqjDmsvKd	0	\N	2025-04-07 19:50:11.369961
\.


--
-- Data for Name: voices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.voices (id, name, description, language, category, premium, preview_url, accent, age, gender, use_case, labels) FROM stdin;
pFZP5JQG7iQjIQuC4Bku	Lily		English	premade	f	\N	\N	\N	\N	\N	\N
sJGSzrOOtoYSYJarCtSZ	Sharvari - Captivating Thriller Narrator	This voice is tailor-made for Hindi suspense audiobooks, bringing mystery and intrigue to life. \r\n\r\nWith a naturally sweet and melodious tone, it adds an eerie charm to every twist and turn. Expressive and immersive, it grips listeners, making them feel every thrill, whisper, and moment of suspense.	hi	professional	f	\N	\N	\N	\N	\N	\N
pqHfZKP75CvOlQylNhV4	Bill		English	premade	f	\N	\N	\N	\N	\N	\N
bIHbv24MWmeRgasZH58o	Will		English	premade	f	\N	\N	\N	\N	\N	\N
g7mN13BvpktqLGMFcHnh	MyClonedVoice		English	cloned	f	\N	\N	\N	\N	\N	\N
NOpBlnGInO9m6vDvFkFC	Grandpa Spuds Oxley	A friendly grandpa who knows how to enthrall his audience with tall tales and fun adventures.	en	professional	f	\N	\N	\N	\N	\N	\N
3ukZmQVZvZvQX8hRfVUC	MyClonedVoice		English	cloned	f	\N	\N	\N	\N	\N	\N
lnUnPeUhSI5EcqtFBux7	Bill - Health Nutrition Videos	A young American male voice. Great for Health Nutrition Videos.	en	professional	f	\N	\N	\N	\N	\N	\N
zs7UfyHqCCmny7uTxCYi	Ruhaan - Clean Hindi Narration Voice	Ruhaan is a pen name of an Indian artist who has spent decades in front of the camera. You will see that experience in his voice, which is beautiful for creating ads, social media content, audiobooks. His English voice is already loved by thousands on ElevenLabs. 	hi	professional	f	\N	\N	\N	\N	\N	\N
JBFqnCBsd6RMkjVDRZzb	George		English	premade	f	\N	\N	\N	\N	\N	\N
hWnML2XRpykt4MG3bS1i	Adam - Action Movie Recap Narrator	A professional American Male Voice Actor narrating action movies.	en	professional	f	\N	\N	\N	\N	\N	\N
GHKbgpqchXOxta6X2lSd	Ashris	25 year-old young urban male from India with a calm, bright voice for narration. Perfect for YouTube video essays. 	en	professional	f	\N	\N	\N	\N	\N	\N
A6RLtcsvTlo0Nvj0hL92	umair jutt	This is test voice	English	cloned	f	\N	\N	\N	\N	\N	\N
EbNQYR6picTv5LQTVCUj	Mark Liotta	Deep, Warm and Velvety with a commanding yet inviting Prescence. It carries a rich, resonant tone that exudes authority and confidence, making it ideal for commercial voice overs, narration, and cinematic trailers. at the same time my voice has a smooth and persuasive quality, allowing me to sound both trustworthy and engaging- perfect for luxury brands, corporate narrations, and audiobook storytelling. 	en	professional	f	\N	\N	\N	\N	\N	\N
50YSQEDPA2vlOxhCseP4	Saanu - Soft and Calm	This voice is of a veteran Indian actress (of course, name changed). This voice has good emotions and will be very good for social media, audiobooks, and for conversational use cases.	hi	professional	f	\N	\N	\N	\N	\N	\N
lfQ3pGxnwOiKjnQKdwts	Meher - Mystery Audiobook Voice	Looking for a gripping voice for Hindi suspense and thriller audiobooks? This one blends sweetness with mystery—melodious like a nightingale, yet haunting when the story darkens. Engaging, expressive, and immersive, it keeps listeners hooked till the last word!	hi	professional	f	\N	\N	\N	\N	\N	\N
81P9FItrsqCg10Dmvpx4	My Voice Clone		English	cloned	f	\N	\N	\N	\N	\N	\N
bajNon13EdhNMndG3z05	Viraj - Energetic & Clear Narrator	With his youthful energy and strong command of language, Viraj is an ideal choice for a wide range of applications, including social media content, educational videos, corporate presentations, and more.	en	professional	f	\N	\N	\N	\N	\N	\N
qNkzaJoHLLdpvgh5tISm	Carter the Mountain King	Middle-aged American male. Voice is rich, smooth, & rugged. Each syllable lingers on the palate, leaving a tantalizing trail of sensation in its wake.\nDeep and sonorous, this Voice of the Mountain resonates... sending vibrations that stir the senses and beckon you closer, promising secrets and fulfilling them.	en	professional	f	\N	\N	\N	\N	\N	\N
KHTrsKwjtYROsJ3YX9Kp	Shayaan		English	cloned	f	\N	\N	\N	\N	\N	\N
0uNx32SryGNB45E9gqXp	MyVoice	My voice for projects	English	cloned	f	\N	\N	\N	\N	\N	\N
he8htk79seUffecriu3g	My Voice Clone		English	cloned	f	\N	\N	\N	\N	\N	\N
Nh2zY9kknu6z4pZy6FhD	David Martin. 1	Young Spanish-Castillian male with a confident tone. Works well for Storytelling.	es	professional	f	\N	\N	\N	\N	\N	\N
bIG2GqwKHYvGMmnafJ0x	furqan ahmed 		English	cloned	f	\N	\N	\N	\N	\N	\N
HVxi4Mh2pz93HbCpYLUN	furqan ahmed 		English	cloned	f	\N	\N	\N	\N	\N	\N
XB0fDUnXU5powFXDhCwa	Charlotte		English	premade	f	\N	\N	\N	\N	\N	\N
iP95p4xoKVk53GoZ742B	Chris		English	premade	f	\N	\N	\N	\N	\N	\N
UgBBYS2sOqTuMpoF3BR0	Mark - Natural Conversations	A casual, young-adult speaking in a natural manner. Perfect for Conversational AI.	en	professional	f	\N	\N	\N	\N	\N	\N
MF4J4IDTRo0AxOO4dpFR	Devi - Clear Hindi pronunciation	Devi is the pen name of a young Indian female artist with clear Hindi instructions. She originally comes from Rajasthan, so she has a clear Hindi diction and hence a beautiful voice for educational, social media, and audiobook content.	hi	professional	f	\N	\N	\N	\N	\N	\N
nPczCjzI2devNBz1zQrb	Brian		English	premade	f	\N	\N	\N	\N	\N	\N
Xb7hH8MSUJpSbSDYk0k2	Alice		English	premade	f	\N	\N	\N	\N	\N	\N
cgSgspJ2msm6clMCkdW9	Jessica		English	premade	f	\N	\N	\N	\N	\N	\N
kLuXkg0zRFuSas1JFmMT	Sohaib Jasra 	Young Hindi male with a Pleasant voice. Great for conversations.	hi	professional	f	\N	\N	\N	\N	\N	\N
N2lVS1w4EtoT3dr4eOWO	Callum		English	premade	f	\N	\N	\N	\N	\N	\N
1qEiC6qsybMkmnNdVMbK	Monika Sogam - Hindi Modulated Voice	Monika Sogam is already a pretty loved voice on ElevenLabs in the English Indian category. Now it is available in Hindi too. This is a perfect voice for social media, audiobooks, and any type of conversational audio you might be looking for.	hi	professional	f	\N	\N	\N	\N	\N	\N
onwK4e9ZLuTAKqWW03F9	Daniel		English	premade	f	\N	\N	\N	\N	\N	\N
CwhRBWXzGAHq8TQ4Fs17	Roger		English	premade	f	\N	\N	\N	\N	\N	\N
TX3LPaxmHKxFdv7VOQHJ	Liam		English	premade	f	\N	\N	\N	\N	\N	\N
XrExE9yKIg1WjnnlVkGX	Matilda		English	premade	f	\N	\N	\N	\N	\N	\N
FGY2WhTYpPnrIDTdsKH5	Laura		English	premade	f	\N	\N	\N	\N	\N	\N
IKne3meq5aSn9XLyUdCD	Charlie		English	premade	f	\N	\N	\N	\N	\N	\N
Gayxrw2ICzdHSQnMNfOn	furqan ahmed dd		English	cloned	f	\N	\N	\N	\N	\N	\N
EkK5I93UQWFDigLMpZcX	JM - Husky & Engaging (2025-01-25_1100)	A slightly husky and bassy voice with a standard American accent. Modulated, controlled, and direct and perfect for audiobooks, captivating narrations, or storytelling, or other professional voiceover work.	en	professional	f	\N	\N	\N	\N	\N	\N
eMw24BMCPTubF3SCWQCP	MyClonedVoice	A cloned voice of myself	English	cloned	f	\N	\N	\N	\N	\N	\N
sH5huVYYfxYRVp1Hf8QX	MyClonedVoice	A cloned voice of myself	English	cloned	f	\N	\N	\N	\N	\N	\N
i0AbNZZnGgIjkigFJBYk	MyClonedVoice		English	cloned	f	\N	\N	\N	\N	\N	\N
hRRDxPcPOhAcDSw9JMuV	MyClonedVoice		English	cloned	f	\N	\N	\N	\N	\N	\N
xelDEkVBz5tev5UsfuG8	MyClonedVoice		English	cloned	f	\N	\N	\N	\N	\N	\N
HVULdNXfVmzDVUIjE0p4	testtttttttt		English	cloned	f	\N	\N	\N	\N	\N	\N
TgSN0ME6LZNyJ5ovsQwn	meafsdasf		English	cloned	f	\N	\N	\N	\N	\N	\N
v9LgF91V36LGgbLX3iHW	David - American Narrator	American middle-aged male. Professional voice actor. Perfect for Narrations.	en	professional	f	\N	\N	\N	\N	\N	\N
DUZTv29kJnTm2QIYqfLB	tstfdsfsfdsfffffffffffffffffffffffff		English	cloned	f	\N	\N	\N	\N	\N	\N
W7wvC5vI9CKg8leDuvkO	MyClonedVoice		English	cloned	f	\N	\N	\N	\N	\N	\N
fCxG8OHm4STbIsWe4aT9	Harrison Gale – The Velvet Voice: deep, resonant, powerful, smooth, rich, storytelling, narrator	A voice imbued with a deep, velvety richness that commands attention and soothes the listener - not only sonorous and authoritative but also carries a charismatic allure, making it perfect for a wide array of projects from immersive audiobooks and engaging advertisements to compelling documentaries and educational content - blends a classical baritone depth with a modern clarity, ideal for bringing narratives to life or lending gravitas to commercial ventures.	en	professional	f	\N	\N	\N	\N	\N	\N
dPah2VEoifKnZT37774q	Knox Dark - Deep voice of a middle aged man, serious in read 	A serious older man reads in a slow methodical and particular way.	en	professional	f	\N	\N	\N	\N	\N	\N
Hh5Npx68SDu5MmIowmPM	Zack D Films	zack	English	cloned	f	\N	\N	\N	\N	\N	\N
bpH36mvRPdE0WM0DfCRX	Felix - Deep, Epic Movie Promo, Film Trailer	A german voice with a deep and resonant sound for narration, epic movie trailers, video game promos and narrations rich in tone and delivery.	de	professional	f	\N	\N	\N	\N	\N	\N
P1bg08DkjqiVEzOn76yG	Viraj - Suspenseful and Engaging Narrator	Viraj’s voice brings depth and intrigue, perfect for suspense and horror storytelling. With a slow, deliberate pace and a rich, breathy tone, his delivery creates a haunting, immersive atmosphere. Ideal for chilling narratives, his booming presence draws listeners into a world of mystery and tension.	hi	professional	f	\N	\N	\N	\N	\N	\N
NmXxuFZXOfcER1p4vgNK	urduone		English	cloned	f	\N	\N	\N	\N	\N	\N
aUTn6mevnrM9pqtesisb	Aaliyah - Gentle & Clear Speech	Aaliyah is a sophisticated, professional Hindi voice designed to deliver clarity, warmth, and trustworthiness. Her voice is perfect for advertisements, social media, and corporate presentations. Aaliyah brings a confident and reassuring presence to any audio experience.	hi	professional	f	\N	\N	\N	\N	\N	\N
yl2ZDV1MzN4HbQJbMihG	Alex - Young American Male	An upbeat and pleasant male voice. Great for Youtube, shorts and social media.	en	professional	f	\N	\N	\N	\N	\N	\N
08bQn7t2jbFQhC4zC5pz	MyClonedVoice	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
F9w7aaEjfT09qV89OdY8	Voce Minatore Audiolibro	A very deep and focused Italian male voice, suitable for reading audiobooks and dubbing.	it	professional	f	\N	\N	\N	\N	\N	\N
SAz9YHcvj6GT2YYXdXww	River		English	premade	f	\N	\N	\N	\N	\N	\N
cjVigY5qzO86Huf0OWal	Eric		English	premade	f	\N	\N	\N	\N	\N	\N
nxOb3V7xvhvmKJTz6W6Z	MyClonedVoice		English	cloned	f	\N	\N	\N	\N	\N	\N
sUFG5t71uzP2RzbNN5kG	MyClonedVoice	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
ddx3E8TyEGxTKEay1Vvd	zack d 	zack d	English	cloned	f	\N	\N	\N	\N	\N	\N
EXAVITQu4vr4xnSDxMaL	Sarah		English	premade	f	\N	\N	\N	\N	\N	\N
JxKiVb1ap7j1dISCWfYL	Create Voice Clone		English	cloned	f	\N	\N	\N	\N	\N	\N
k2intd1ORm0YUH8etnXg	Zara - Sweet & Gentle Companion	Voice crafted for friendly conversations, wellness content, and guided interactions.  \r\n\r\nZara’s soft, gentle tone creates a calming atmosphere, perfect for guiding users through meditation, bedtime stories, or e-learning modules. Her warm and empathetic delivery enhances content across platforms like YouTube, wellness apps, and interactive voice assistants. Trusted for her authenticity and care, Zara ensures every interaction feels personal, comforting, and engaging.	hi	professional	f	\N	\N	\N	\N	\N	\N
8coVMHQl7ctBaQFOnDid	MyClonedVoice	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
LhaIX8nRDfDxOopz2Fp3	MyClonedVoice	Voice cloned via Colab	English	cloned	f	\N	\N	\N	\N	\N	\N
OdSIrkgjl70gSlkQMZrh	MyVoice	My voice for projects	English	cloned	f	\N	\N	\N	\N	\N	\N
SQdLmQXe59w3SPjaqg1X	MyClonedVoice	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
r21m7BAbXjtux814CeJE	Kavish - Animated Emotional Storyteller	Kavish is a young and talented actor and voice artist. His voice carries a wide range of emotions and excellent modulation, making it perfect for various use cases such as animated characters, dubbing, audiobooks, advertisements, and voiceovers for films and games.	hi	professional	f	\N	\N	\N	\N	\N	\N
9XfYMbJVZqPHaQtYnTAO	Cody - Energetic Upbeat Educator	A bright and lively young American male voice perfect for children's educational content such as science experiments, nature content or just some laid back fun. 	en	professional	f	\N	\N	\N	\N	\N	\N
exMy2q3EvIVwayOlxRgQ	MyClonedVoice		English	cloned	f	\N	\N	\N	\N	\N	\N
9BWtsMINqrJLrRacOk9x	Aria		English	premade	f	\N	\N	\N	\N	\N	\N
0NrM0c1eqKCdseNwQ7PN	MyClonedVoice	Voice cloned via Colab	English	cloned	f	\N	\N	\N	\N	\N	\N
kD4dEWy2fbcyXlge6iHh	A-Xee	Pakistani American Middle age male, who also can speak in Urdu/Hindi, Punjabi along with American English. Perfect for documentaries, News and Book Reading. 	en	professional	f	\N	\N	\N	\N	\N	\N
YrBXZ0VijPgT3njvU2Em	MyClonedVoice		English	cloned	f	\N	\N	\N	\N	\N	\N
4lbB2BFh2d4JYD7g9OxE	MyClonedVoice		English	cloned	f	\N	\N	\N	\N	\N	\N
wrlkaBfhZ82VlzXQqRKz	MyClonedVoice	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
qSV5UqvHBC0Widy71Esh	Shyam - Real, Relatable Narrator	Shyam’s voice is a raw, unfiltered expression of emotion, blending the energy of open mics with the power of street poetry. It’s vibrant, full of life, and authentic—perfect for creative content that speaks directly to the heart. Whether it’s storytelling or poetry, his voice feels real, relatable, and keeps you hooked with its street-smart charm and undeniable impact.	hi	professional	f	\N	\N	\N	\N	\N	\N
M563YhMmA0S8vEYwkgYa	Sammy - Fun and Quirky	A fun, cute and androgynous voice with tons of personality.	en	professional	f	\N	\N	\N	\N	\N	\N
weA4Q36twV5kwSaTEL0Q	Ava - Female Robot or AI Assistant	Female voice over for AI assistant, GPS, virtual helper, robot character, etc.!	en	professional	f	\N	\N	\N	\N	\N	\N
O4fnkotIypvedJqBp4yb	Alexis Lancaster- Studio Quality Smooth & Authentic British Voice	Experience the richness of a professionally recorded British female voice that blends sophistication with warmth. This silky, smooth, and natural tone is perfect for conversational AI, immersive narration, and engaging commercial content. Whether guiding users as a virtual assistant or bringing stories to life through narration, this voice captures attention and delivers messages with clarity and elegance. Choose this voice for its elegance, versatility, and unmistakable British sophistication.	en	professional	f	\N	\N	\N	\N	\N	\N
X1tufN2s4pZ5Z7j8p23n	Callum	Young Scottish Male Voice, professional clear tone 	en	professional	f	\N	\N	\N	\N	\N	\N
5TJdsnJwtj3mOSGbRNHi	MyClonedVoice	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
UKTlInlesNrio9yfq6aK	MyClonedVoice	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
nvThR2vEjGDBCRYxzqpx	MyClonedVoice	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
JsCHerdAgybI5rFoEvtp	Zaib	Helo I am zaib from Rahimyar Khan	English	cloned	f	\N	\N	\N	\N	\N	\N
272n5yA9S8KwZazf8tQE	MyClonedVoice	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
BaM0BNY0ovEPFiJpeus8	Jim Pro Manly read	Over 30+ years of voiceover experience. English speaking voice that can be used for farming, trucking, automotive, or blue collar type needs. Seasoned narration, story telling.	en	professional	f	\N	\N	\N	\N	\N	\N
o3SQUkaY51Vx1Hi229p1	Elon	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
f4IvejEsfxoqukuspTlr	adaam	Helo	English	cloned	f	\N	\N	\N	\N	\N	\N
lkVAP8k5tC0Wr1dYyQZH	Brianna - Warm Narrator	A middle-aged American female. Has a Kind, natural and gentle speaking voice. Great for non-fiction and inspirational!	en	professional	f	\N	\N	\N	\N	\N	\N
DUnzBkwtjRWXPr6wRbmL	Mad Scientist - For All Languages	Great for game characters, cartoons, animations, stories for children,  Fits perfectly for all languages. 	tr	professional	f	\N	\N	\N	\N	\N	\N
SwHLYrqoyQ3Rpl7R41xe	Elon	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
EGQM7bHbTHTb7VUEcOHG	Shakuntala - Expressive Indian Voice	Shakuntala is a pen name of a very famous voice over artist. This voice has very clear modulation and a voice that will keep you listening again and again. Do try the voice and we are sure you will love it.	hi	professional	f	\N	\N	\N	\N	\N	\N
3r1cKHQqcNUrwBcU2X4R	MyClonedVoice		English	cloned	f	\N	\N	\N	\N	\N	\N
aAXy11wGiXEMrGX6lHrp	Antoni		English	cloned	f	\N	\N	\N	\N	\N	\N
JMDdgwXRakGs3HHGdhF9	Adam Voice clone	Adam	English	cloned	f	\N	\N	\N	\N	\N	\N
NgBYGKDDq2Z8Hnhatgma	Atlas Pro - Corporate Narration & Audiobooks	Professional male voice featuring a deep, rich, gravelly resonance.\r\nCommands attention with an authoritative yet trustworthy presence.\r\n\r\nClear, mature, powerful, serious, confident, executive, masculine, gritty, calm, neutral, impactful, cinematic, inspiring.\r\n\r\nPerfect for business explainers, commercials, presentations, podcasts, e-learning, movie trailers, brand advertisements, YouTube, true crime, suspense, mystery, and history content.	en	professional	f	\N	\N	\N	\N	\N	\N
5XtR2dJmd2FRsUZFoCYN	MyClonedVoice		English	cloned	f	\N	\N	\N	\N	\N	\N
cFGjvn03L4XTIWdp19j8	Donal Trump	Donal trump voice	English	cloned	f	\N	\N	\N	\N	\N	\N
PKGti0C5FW3Uor61qfkW	MyClonedVoice	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
kqVT88a5QfII1HNAEPTJ	David - Dramatic Narration (2025-04-06_1825)	A deep, resonant male voice with a standard American accent and a slight husky and raspy quality but still pleasant. It has a controlled, measured, and direct delivery, perfect for authoritative narrations, compelling audiobooks, and professional voiceover requiring gravitas and clarity.	en	professional	f	\N	\N	\N	\N	\N	\N
IUVz5oaDchHYWBVH2BoJ	Mian	Voice model created by Voice Generator app on 2025-04-07	English	cloned	f	\N	\N	\N	\N	\N	\N
RexqLjNzkCjWogguKyff	Bradley - Earnest narrator	Middle-aged American male, baritone voice, based on religious audiobook. Earnest and kind.	en	professional	f	\N	\N	\N	\N	\N	\N
No6k8FjiFTskn50v5Vn0	MyClonedVoice	Voice cloned via Colab	English	cloned	f	\N	\N	\N	\N	\N	\N
1TPhJlY4klPMPSrWPYF7	MyClonedVoice	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
qBDvhofpxp92JgXJxDjB	Lily Wolff - Expressive, Clear, Youthful, Calming	A calm, expressive, conversational, and engaging young woman's voice that is perfect for all platforms, particularly: audiobooks, social media, podcasts, meditations, self-help guides, or for playing the sweet girl next door! 	en	professional	f	\N	\N	\N	\N	\N	\N
nFQ2TwlXOa1Ae86G4jVd	Elon	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
MvBnPbLnvfvn5ovVU27H	MyClonedVoice	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
SdpcBQnlSLHjMbC4drpT	urdu 	majnu	English	cloned	f	\N	\N	\N	\N	\N	\N
WWJOsu8KrDwoaPWOOYPj	MyClonedVoice		English	cloned	f	\N	\N	\N	\N	\N	\N
qCokLcPlG6W9nHgVB6jW	Elon	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
56AoDkrOh6qfVPDXZ7Pt	Cassidy	A confident female podcaster with plethora of experience in the music industry.	en	professional	f	\N	\N	\N	\N	\N	\N
lkW8HTfl5LTHtcchyAw4	Elon	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
gUABw7pXQjhjt0kNFBTF	Andrew - Smooth audio books	Middle age American male, smooth voice. Suitable for Audiobooks, promotional voice overs.	en	professional	f	\N	\N	\N	\N	\N	\N
EzoxNTKsg4JNN7wxAgut	Hakim - wisdom, fun & confidence	Middle-aged male, professional narrator, conversational, gulf accent for Arabic and English, good for storytelling, audiobooks and podcasts.\r\n	en	professional	f	\N	\N	\N	\N	\N	\N
i5Ta4NDRfH72j44UzKq2	Adam Bhai	Voice of Adam From ElevenLabs	English	cloned	f	\N	\N	\N	\N	\N	\N
0CvSX8RSrLOnUpqHqxEg	MyClonedVoice	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
cIxuahi2U5bzoujkkCBi	Adam voice clone	adam voice	English	cloned	f	\N	\N	\N	\N	\N	\N
BfMHwZYBanT6jdQAhNv5	MyClonedVoice	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
8wabydHBwrQjOcdtz34V	MyClonedVoice	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
tnSpp4vdxKPjI9w0GnoV	Hope - upbeat and clear		en	professional	f	\N	\N	\N	\N	\N	\N
hDOLRnQbqg7ZF0FmyVgH	MyClonedVoice		English	cloned	f	\N	\N	\N	\N	\N	\N
tHeWfoMy5jprxyRflqDj	zack d 	zack d	English	cloned	f	\N	\N	\N	\N	\N	\N
9BSDLkqB0aAd87FvEcTu	yuo		English	cloned	f	\N	\N	\N	\N	\N	\N
NShoSejNmNwcmTod5IfS	ggr	ggr	English	cloned	f	\N	\N	\N	\N	\N	\N
1DgIqgF0J3zeRIgmzUyb	MyClonedVoice		English	cloned	f	\N	\N	\N	\N	\N	\N
80lPKtzJMPh1vjYMUgwe	Benjamin - Criovozia	Old male Mexican man. A deep and smooth voice. Perfect for storytelling, podcasting, and narration.	es	professional	f	\N	\N	\N	\N	\N	\N
8EBmk7pa5b3OEZkvF2oI	MyClonedVoice	Voice cloned via website	English	cloned	f	\N	\N	\N	\N	\N	\N
BL5TwXQ64mFfSQBPs8Jg	MyClonedVoice		English	cloned	f	\N	\N	\N	\N	\N	\N
QTcRvB8dMQHqasKsGPld	Wilson Whisper - Studio-Quality Multilingual Male Whisper for ASMR & Storytelling	A multilingual whispering voice (German, English, Spanish, and more!) perfect for ASMR, character voiceovers, audio dramas, and cartoons. William Whisper delivers a soft, soothing, studio-quality vocal tone, pre-processed and ready to use. Ideal for intimate narration, immersive storytelling, and calming soundscapes.	de	professional	f	\N	\N	\N	\N	\N	\N
vYtH5rm1y72VzzGqgmEY	1-EMAM		English	cloned	f	\N	\N	\N	\N	\N	\N
FikxkbY0N0nDMvgtCmQ8	Jake Lawson – Educational & Reassuring American Male Narrator Voice	A deep, warm American male voice with comforting young dad energy, ideal for narration, eLearning, documentaries, family-focused content, explainer videos, and podcasts. This age 35 narrator voice delivers trust, care, and calm authority with a modern, relatable tone.	en	professional	f	\N	\N	\N	\N	\N	\N
6NLNAr74HtMtG4Dt3VDM	ghkg		English	cloned	f	\N	\N	\N	\N	\N	\N
ZmMj3zzbqPXpZPgBcZU8	Samay - Conversational Expressive Voice	Samay has decades of experience in singing and music, so his voice may not sound like a typical voiceover artist's, but it is something you will enjoy listening to again and again. Use his voice for all your conversational needs, such as customer care, chatbots, audiobooks, podcast narrations, promotional videos, meditation guides, e-learning modules, and much more.	hi	professional	f	\N	\N	\N	\N	\N	\N
6rr4jpS124uCLNtgVdAk	Chris Heyez	A 40 year old Canadian man. Voice works well for casual conversation.	en	professional	f	\N	\N	\N	\N	\N	\N
SCEfsIWOdUskbVhZy7qD	1-MARCUS		English	cloned	f	\N	\N	\N	\N	\N	\N
fRV3NpXPa1DGVnFs6Dg5	Shaurya - Cricket Commentator	Shaurya is a seasoned sports commentator with decades of experience. His vibrant energy shines through his voice, whether he's covering cricket, football, basketball, tennis, or hockey. Give his commentary a listen, and you'll love the way he brings sports to life. 	hi	professional	f	\N	\N	\N	\N	\N	\N
wNvqdMNs9MLd1PG6uWuY	Clara - Whispery & Intimate	A gentle, whispery voice that wraps your audience in warmth—perfect for intimate narrations and ASMR content.	en	professional	f	\N	\N	\N	\N	\N	\N
n6BcoS0QyLMPmFXWu1Bm	Shaurya - Energetic Conversational Voice	Shaurya is a seasoned sports commentator with decades of experience. His commentary voice is loved by many on ElevenLabs, so we decided to clone him again in a conversational tone. His energetic tone can be used for live sports coverage, game analysis, fan engagement, interactive podcasts, high-energy storytelling, motivational content, event hosting, and even engaging social media narrations.	hi	professional	f	\N	\N	\N	\N	\N	\N
Hd8mWkf5kvyBZB0S7yXU	Ron - Older American Story Teller	An older American Male with lower bass tones and smoothness. Great for Narration, News, and Story Telling.	en	professional	f	\N	\N	\N	\N	\N	\N
90ipbRoKi4CpHXvKVtl0	Anika - Customer Care Agent	Anika's voice is specially recorded with customer care scripts in mind. So, if you are looking for an AI customer care voice or any conversational use, this voice is the perfect fit for you. Give it a try, and your users won't even realize it's AI!	en	professional	f	\N	\N	\N	\N	\N	\N
9aRz98clruXM4cq7czPo	MyClonedVoice		English	cloned	f	\N	\N	\N	\N	\N	\N
wBXNqKUATyqu0RtYt25i	Adam	A middle aged American male voice with a rich tone, good for a radio announcer.	en	professional	f	\N	\N	\N	\N	\N	\N
pcQH1pNsxlD8YFxrbLIE	1-EMAM		English	cloned	f	\N	\N	\N	\N	\N	\N
xZp4zaaBzoWhWxxrcAij	Danish Khan - Expressive Old Voice	Danish Khan is the pen name of a veteran voice actor who has trained celebrities in dialogue delivery and pronunciation. This voice is suitable for all purposes-use it, and you will love the voice.	hi	professional	f	\N	\N	\N	\N	\N	\N
Vhtk7tMIXtmUZCjshYRc	1-WEL		English	cloned	f	\N	\N	\N	\N	\N	\N
q0PCqBlLEWqtUZJ2DYn7	Jerry B. - Therapist, Warm, Calming, Reassuring	This is the voice of a caring and supportive therapist, psychologist, psychiatrist, or any doctor or medical professional with great bedside manner and a drive to help patients heal, and feel healthy and safe.	en	professional	f	\N	\N	\N	\N	\N	\N
T5cu6IU92Krx4mh43osx	Bill Oxley - Mature American male	Middle aged American male with a clear and natural voice. Perfect for audio book and documentary narration.	en	professional	f	\N	\N	\N	\N	\N	\N
m2mWmQzNVZUkut629YA1	imran		English	cloned	f	\N	\N	\N	\N	\N	\N
5NRYuU2jyT0WmtbtxTno	MyClonedVoice	Voice cloned via Colab	English	cloned	f	\N	\N	\N	\N	\N	\N
wWUG72eEtupiUkpXafwX	Benji - Calm New Zealand Male 	A young adult male with a New Zealand English accent. Smooth tone perfect for story telling needs.	en	professional	f	\N	\N	\N	\N	\N	\N
uju3wxzG5OhpWcoi3SMy	Michael C. Vincent	A calm, confident and enthusiastic middle-aged male voice. Warm bass tones and crisp high tones. Delivery is articulate intelligent and vibrant. The voice is used for voiceovers and educational narrations. 	en	professional	f	\N	\N	\N	\N	\N	\N
nUSM7wO8D7PJIJFlKBXT	derf55	This is my cloned voice uploaded via API.	English	cloned	f	\N	\N	\N	\N	\N	\N
zgqefOY5FPQ3bB7OZTVR	Niraj - Hindi Narrator	Niraj is the pen name of a veteran Indian actor. The base and variations of this voice make it great for narrative work, documentaries, and social media.	hi	professional	f	\N	\N	\N	\N	\N	\N
83EM3MdE65RAqeqeTK4j	derf55	The future belongs to those who believe in the beauty of their dreams	English	cloned	f	\N	\N	\N	\N	\N	\N
abYMJzttAqXE5275JAVp	derf55	The future belongs to those who believe in the beauty of their dreams	English	cloned	f	\N	\N	\N	\N	\N	\N
r37RxSO9P16kl2tOGSyL	MyClonedVoice		English	cloned	f	\N	\N	\N	\N	\N	\N
BpjGufoPiobT79j2vtj4	Priyanka Sogam - Late Night Radio (Neutral Accent)	A young female with a velvety, laid-back cadence, exuding late-night warmth and intimacy.\r\n\r\nPriyanka is the sister of Monika Sogam, one of the most beloved voices on ElevenLabs.  \r\n\r\nPriyanka's voice is smooth, deep, and effortlessly soothing, ideal for storytelling, reflective monologues, or engaging one-on-one conversations, audiobooks, meditation guides, and luxury brand advertising.	en	professional	f	\N	\N	\N	\N	\N	\N
zT03pEAEi0VHKciJODfn	Raju - Relatable Hindi Voice	This voice has the familiar warmth and approachability of a regular Indian speaker, yet it carries a professionalism that makes it versatile for a range of applications. It's clear and articulate enough to engage audiences on social media, provide guidance through customer care bots, and serve in various other communication roles. Its authentic Indian tone adds a layer of relatability without compromising on clarity or effectiveness, making it an excellent choice for connecting with audiences.	hi	professional	f	\N	\N	\N	\N	\N	\N
NFG5qt843uXKj4pFvR7C	Adam FM (late night radio)	A middle aged 'Brit' with a velvety laid back, late night talk show host timbre.	en	professional	f	\N	\N	\N	\N	\N	\N
CcFpHHVz5kILl9eZ2Sxg	imran		English	cloned	f	\N	\N	\N	\N	\N	\N
goEQO6V6AfoGlPeutmxr	ali		English	cloned	f	\N	\N	\N	\N	\N	\N
6vKjT1iUyBNUKWs37k2l	ali		English	cloned	f	\N	\N	\N	\N	\N	\N
bftGW4ijZLpcayo7YbuH	MyClonedVoice	My cloned voice through API	English	cloned	f	\N	\N	\N	\N	\N	\N
HW2QhP8RA3y2rF1pmo3H	MyClonedVoice	Voice cloned via Colab	English	cloned	f	\N	\N	\N	\N	\N	\N
qNNSfHmjNjaRb9C0rrbr	ali		English	cloned	f	\N	\N	\N	\N	\N	\N
pLyFVoSdpz412R9kWcmm	MyClonedVoice	Voice cloned via Colab	English	cloned	f	\N	\N	\N	\N	\N	\N
0JbMW9nbhoExwUpzk9Cd	MyClonedVoice	Voice cloned via Colab	English	cloned	f	\N	\N	\N	\N	\N	\N
k7nOSUCadIEwB6fdJmbw	Ahmed - Professional Hindi Voice	This voice radiates the warmth of Indian speakers while exuding captivating professionalism, making it the ultimate choice for any type of content creation on platforms like YouTube. Its crystal-clear articulation brings stories to life, drawing audiences in and balancing approachability with expertise, making it ideal for various tasks—from engaging videos to corporate presentations and everything in between!	hi	professional	f	\N	\N	\N	\N	\N	\N
qMWiKJnYIpKnTfN3rWDk	Ashar - Husky & Intense Storyteller	A deep, captivating voice for gripping narrations, suspenseful storytelling, and cinematic content.\r\n\r\nAshar’s rich, husky tone adds depth and intensity to every word, making him perfect for audiobooks, thriller podcasts, and dramatic brand storytelling. His commanding presence enhances documentaries, trailers, and immersive YouTube content, keeping audiences engaged. Optimized for platforms like Audible, Spotify, and film narration, Ashar delivers every line with raw emotion and power. 	hi	professional	f	\N	\N	\N	\N	\N	\N
WENctZQ166OZjmhLZvMc	ali		English	cloned	f	\N	\N	\N	\N	\N	\N
Nx1A8NCXT01hn1TfC7rF	MyClonedVoice	My cloned voice through API	English	cloned	f	\N	\N	\N	\N	\N	\N
oIrReGAWJuGKVf4DxEt8	Thomas Fischer - Authentic German Accent	A middle-aged voice with an authentic German accent. Well suited for audiobooks, podcasts, documentaries and all there is!	en	professional	f	\N	\N	\N	\N	\N	\N
LAQOMqiCMj1mWLXzQMqA	MyClonedVoice	Voice cloned via Colab	English	cloned	f	\N	\N	\N	\N	\N	\N
cDOQV3QlJloYqjDmsvKd	Jay Johnson (Hard Sell VO)	Gravelly retail hard sell voice perfect for car ads or big event promos or sales events requiring a hard CTA.	en	professional	f	\N	\N	\N	\N	\N	\N
\.


--
-- Name: audio_generations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.audio_generations_id_seq', 64, true);


--
-- Name: user_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_stats_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: voice_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.voice_stats_id_seq', 183, true);


--
-- Name: audio_generations audio_generations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audio_generations
    ADD CONSTRAINT audio_generations_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: user_stats user_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: voice_stats voice_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.voice_stats
    ADD CONSTRAINT voice_stats_pkey PRIMARY KEY (id);


--
-- Name: voices voices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.voices
    ADD CONSTRAINT voices_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: audio_generations audio_generations_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audio_generations
    ADD CONSTRAINT audio_generations_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_stats user_stats_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: voice_stats voice_stats_voice_id_voices_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.voice_stats
    ADD CONSTRAINT voice_stats_voice_id_voices_id_fk FOREIGN KEY (voice_id) REFERENCES public.voices(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

