--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

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

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: neondb_owner
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO neondb_owner;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: neondb_owner
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO neondb_owner;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: neondb_owner
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: car_receipts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.car_receipts (
    id integer NOT NULL,
    receipt_number character varying(50) NOT NULL,
    license_plate character varying(20) NOT NULL,
    customer_name character varying(100) NOT NULL,
    car_brand character varying(50) NOT NULL,
    car_model character varying(50) NOT NULL,
    car_color character varying(30),
    chassis_number character varying(50),
    engine_code character varying(50),
    entry_mileage text NOT NULL,
    fuel_level character varying(20) NOT NULL,
    entry_notes text,
    repair_type text NOT NULL,
    received_by character varying(100) NOT NULL,
    received_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'received'::character varying,
    workshop_notification_sent boolean DEFAULT false,
    sent_to_workshop_at timestamp without time zone,
    sent_to_workshop_by character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    postponed_at timestamp without time zone,
    postponed_by character varying(100)
);


ALTER TABLE public.car_receipts OWNER TO neondb_owner;

--
-- Name: car_receipts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.car_receipts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.car_receipts_id_seq OWNER TO neondb_owner;

--
-- Name: car_receipts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.car_receipts_id_seq OWNED BY public.car_receipts.id;


--
-- Name: car_status; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.car_status (
    id integer NOT NULL,
    car_receipt_id integer,
    customer_name text NOT NULL,
    license_plate text NOT NULL,
    car_brand text NOT NULL,
    car_model text NOT NULL,
    current_status text DEFAULT 'في الاستقبال'::text NOT NULL,
    received_at timestamp without time zone DEFAULT now() NOT NULL,
    entered_workshop_at timestamp without time zone,
    completed_at timestamp without time zone,
    maintenance_type text,
    km_reading integer,
    fuel_level text,
    complaints text,
    parts_requests_count integer DEFAULT 0,
    completed_parts_count integer DEFAULT 0,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.car_status OWNER TO neondb_owner;

--
-- Name: car_status_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.car_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.car_status_id_seq OWNER TO neondb_owner;

--
-- Name: car_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.car_status_id_seq OWNED BY public.car_status.id;


--
-- Name: customer_cars; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customer_cars (
    id integer NOT NULL,
    customer_id integer,
    car_brand text NOT NULL,
    car_model text NOT NULL,
    license_plate text NOT NULL,
    color text,
    year integer,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    engine_code text,
    chassis_number text,
    previous_owner text,
    previous_license_plate text
);


ALTER TABLE public.customer_cars OWNER TO neondb_owner;

--
-- Name: customer_cars_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.customer_cars_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_cars_id_seq OWNER TO neondb_owner;

--
-- Name: customer_cars_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.customer_cars_id_seq OWNED BY public.customer_cars.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    name text NOT NULL,
    phone_number text NOT NULL,
    address text,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    customer_status text DEFAULT 'A'::text,
    is_favorite integer DEFAULT 0
);


ALTER TABLE public.customers OWNER TO neondb_owner;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO neondb_owner;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: parts_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.parts_requests (
    id integer NOT NULL,
    request_number character varying(50),
    engineer_name character varying(100) NOT NULL,
    car_info character varying(255) NOT NULL,
    car_brand character varying(50),
    car_model character varying(100),
    reason_type character varying(50) NOT NULL,
    part_name character varying(255) NOT NULL,
    quantity integer NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    notes text,
    requested_by character varying(100),
    requested_at timestamp without time zone DEFAULT now(),
    approved_by character varying(100),
    approved_at timestamp without time zone,
    delivered_by character varying(100),
    delivered_at timestamp without time zone,
    license_plate character varying(50),
    chassis_number character varying(100),
    engine_code character varying(50),
    in_preparation_at timestamp without time zone,
    ready_for_pickup_at timestamp without time zone,
    ordered_externally_at timestamp without time zone,
    ordered_externally_by character varying(100),
    estimated_arrival character varying(200),
    unavailable_at timestamp without time zone,
    unavailable_by character varying(100),
    parts_arrived_at timestamp without time zone,
    parts_arrived_by character varying(100),
    returned_at timestamp without time zone,
    returned_by character varying(100),
    return_reason text,
    user_notes text,
    customer_name text
);


ALTER TABLE public.parts_requests OWNER TO neondb_owner;

--
-- Name: parts_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.parts_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parts_requests_id_seq OWNER TO neondb_owner;

--
-- Name: parts_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.parts_requests_id_seq OWNED BY public.parts_requests.id;


--
-- Name: reception_entries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reception_entries (
    id integer NOT NULL,
    car_owner_name character varying(255) NOT NULL,
    license_plate character varying(50) NOT NULL,
    service_type character varying(100) NOT NULL,
    complaints text,
    odometer_reading integer,
    fuel_level character varying(50) NOT NULL,
    reception_user_id integer,
    workshop_user_id integer,
    entry_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    workshop_entry_time timestamp without time zone,
    status character varying(50) DEFAULT 'reception'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    customer_id integer,
    car_id integer
);


ALTER TABLE public.reception_entries OWNER TO neondb_owner;

--
-- Name: reception_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.reception_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reception_entries_id_seq OWNER TO neondb_owner;

--
-- Name: reception_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.reception_entries_id_seq OWNED BY public.reception_entries.id;


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
-- Name: tasks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    task_number character varying(20) NOT NULL,
    worker_id integer NOT NULL,
    worker_role character varying(50) DEFAULT 'technician'::character varying NOT NULL,
    description character varying(500) NOT NULL,
    car_brand character varying(50) NOT NULL,
    car_model character varying(100) NOT NULL,
    license_plate character varying(20) NOT NULL,
    estimated_duration integer,
    engineer_name character varying(100),
    supervisor_name character varying(100),
    assistant_name character varying(100),
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    start_time timestamp without time zone DEFAULT now(),
    end_time timestamp without time zone,
    paused_at timestamp without time zone,
    pause_reason character varying(100),
    pause_notes character varying(500),
    total_paused_duration integer DEFAULT 0,
    is_archived boolean DEFAULT false,
    archived_at timestamp without time zone,
    archived_by character varying(100),
    archive_notes character varying(1000),
    rating integer,
    created_at timestamp without time zone DEFAULT now(),
    repair_operation character varying(200),
    technician_name character varying(100),
    delivery_number integer,
    task_type character varying(20),
    is_cancelled boolean DEFAULT false,
    cancellation_reason text,
    cancelled_at timestamp without time zone,
    cancelled_by character varying(100),
    technicians text[],
    assistants text[],
    timer_type character varying(20) DEFAULT 'automatic'::character varying NOT NULL,
    consumed_time integer,
    color character varying(20)
);


ALTER TABLE public.tasks OWNER TO neondb_owner;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO neondb_owner;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: time_entries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.time_entries (
    id integer NOT NULL,
    task_id integer NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone,
    duration integer,
    entry_type character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.time_entries OWNER TO neondb_owner;

--
-- Name: time_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.time_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.time_entries_id_seq OWNER TO neondb_owner;

--
-- Name: time_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.time_entries_id_seq OWNED BY public.time_entries.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    permissions text[] DEFAULT '{}'::text[],
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
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
-- Name: workers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.workers (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    category character varying(50) NOT NULL,
    supervisor character varying(100),
    assistant character varying(100),
    engineer character varying(100),
    national_id character varying(20),
    phone_number character varying(20),
    address character varying(255),
    is_active boolean DEFAULT true,
    is_predefined boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.workers OWNER TO neondb_owner;

--
-- Name: workers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.workers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workers_id_seq OWNER TO neondb_owner;

--
-- Name: workers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.workers_id_seq OWNED BY public.workers.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: neondb_owner
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: car_receipts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.car_receipts ALTER COLUMN id SET DEFAULT nextval('public.car_receipts_id_seq'::regclass);


--
-- Name: car_status id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.car_status ALTER COLUMN id SET DEFAULT nextval('public.car_status_id_seq'::regclass);


--
-- Name: customer_cars id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_cars ALTER COLUMN id SET DEFAULT nextval('public.customer_cars_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: parts_requests id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parts_requests ALTER COLUMN id SET DEFAULT nextval('public.parts_requests_id_seq'::regclass);


--
-- Name: reception_entries id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reception_entries ALTER COLUMN id SET DEFAULT nextval('public.reception_entries_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: time_entries id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.time_entries ALTER COLUMN id SET DEFAULT nextval('public.time_entries_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: workers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.workers ALTER COLUMN id SET DEFAULT nextval('public.workers_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: neondb_owner
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: car_receipts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.car_receipts (id, receipt_number, license_plate, customer_name, car_brand, car_model, car_color, chassis_number, engine_code, entry_mileage, fuel_level, entry_notes, repair_type, received_by, received_at, status, workshop_notification_sent, sent_to_workshop_at, sent_to_workshop_by, created_at, postponed_at, postponed_by) FROM stdin;
35	استلام-2	519-1799	محمد قاسم دياب	AUDI	A6	فضي	WAUZZZ4F4BN061595	CCA	سيسي	سيسي	سيسي	سيسي	بدوي	2025-07-23 11:08:10.63314	completed	f	2025-07-23 11:08:14.703	بدوي	2025-07-23 11:08:10.63314	\N	\N
34	استلام-1	تجربة-النشاط	اختبار النشاط	BMW	X5	\N	\N	\N	60000	ممتلئ	\N	فحص عام وصيانة	الاستقبال	2025-07-23 11:03:31.385806	completed	f	2025-07-23 11:17:23.147	بدوي	2025-07-23 11:03:31.385806	\N	\N
36	استلام-3	516-6291	رائد مشارقة	AUDI	Q5	أبيض	WALCFCFP5FA007847	CNCD	148	25		اللغلالاتل	الاستقبال	2025-07-23 11:28:48.789329	received	f	\N	\N	2025-07-23 11:28:48.789329	\N	\N
37	استلام-4	516-6291	رائد مشارقة	AUDI	Q5	أبيض	WALCFCFP5FA007847	CNCD	سي	سيسي	سيسي	سيسيسيسي	الاستقبال	2025-07-23 11:29:44.530631	received	f	\N	\N	2025-07-23 11:29:44.530631	\N	\N
38	استلام-5	516-6291	رائد مشارقة	AUDI	Q5	أبيض	WALCFCFP5FA007847	CNCD	سس	146	سس	سسس	الاستقبال	2025-07-23 11:35:15.132778	received	f	\N	\N	2025-07-23 11:35:15.132778	\N	\N
\.


--
-- Data for Name: car_status; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.car_status (id, car_receipt_id, customer_name, license_plate, car_brand, car_model, current_status, received_at, entered_workshop_at, completed_at, maintenance_type, km_reading, fuel_level, complaints, parts_requests_count, completed_parts_count, updated_at, created_at) FROM stdin;
7	\N	مرتضى لالل	5632124	غير محدد	غير محدد	في الورشة	2025-08-09 10:47:01.197	2025-08-09 10:47:54.878	\N	فحص شامل	1234567	1455555	dddd	0	0	2025-08-09 10:47:54.878	2025-08-09 10:47:01.350925+00
8	\N	هاشم القاطع	55555555	غير محدد	غير محدد	بانتظار قطع	2025-08-09 10:56:19.367	2025-08-09 10:56:25.93	\N	فحص شامل	123456	156777		1	0	2025-08-09 10:56:51.709	2025-08-09 10:56:19.517739+00
9	\N	فارس	502600	غير محدد	غير محدد	بانتظار قطع	2025-08-09 11:15:30.307	2025-08-09 11:16:15.202	\N	صيانة دورية	110000	50		1	0	2025-08-09 11:18:51.906	2025-08-09 11:15:30.494246+00
\.


--
-- Data for Name: customer_cars; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customer_cars (id, customer_id, car_brand, car_model, license_plate, color, year, notes, created_at, engine_code, chassis_number, previous_owner, previous_license_plate) FROM stdin;
1	1	VOLKSWAGEN	Passat	لايوجد	بني	2012	\N	2025-07-15 13:17:29.809813	لايوجد	WVWRV1161CM106990	لايوجد	\N
3	3	AUDI	A4	434782 طرطوس	أسود	2008	\N	2025-07-19 08:28:09.115069	لم يتم الكشف عنه	WAUZZZ8E38A116281	لايوجد	\N
4	4	AUDI	A4	860571	فضي	2007	\N	2025-07-19 08:30:01.218055	ALT	WAUZZZ8EX7A280660	لايوجد	\N
5	5	AUDI	A8	518-1577	فضي	2015	\N	2025-07-19 08:33:52.249171	CTGA	WAUY2BFD4FN000272	لايوجد	\N
6	6	AUDI	Q7	520-8677	أسود	2015	\N	2025-07-19 08:37:34.552965	3.0 TFSI	WA1LGAFE8FD009218	لايوجد	\N
7	7	AUDI	Q5	44892	أبيض	2015	\N	2025-07-19 10:37:34.961478	CPM	WA1LFAFP5EA107272	لايوجد	\N
8	8	AUDI	A8	8406	أبيض	2015	\N	2025-07-19 10:45:55.183509	CRE	WAUYGBFD0FN005051	لا يوجد	\N
9	7	VOLKSWAGEN	Tiguan	513-4851	أسود	2011	\N	2025-07-19 11:02:06.601816	CC7	WVGCE25N3BW037229	لايوجد	\N
10	9	AUDI	Q5	513-4564	أبيض	2014	\N	2025-07-20 07:01:35.834739	CTV	WA1CGCFP3EA006997	لا يوجد	\N
11	10	VOLKSWAGEN	Passat	7123	رمادي	2013	\N	2025-07-20 08:24:52.881623	CAX	WVWZZZ16ZDM002038	لايوجد	\N
12	11	VOLKSWAGEN	Passat	646-270	رمادي	2011	\N	2025-07-20 09:26:00.489577	غير معروف	WVWZZZ3CZBP001395	لا يوجد	\N
13	1	VOLKSWAGEN	Passat	لا يوجد	بني	2012	لايوجد	2025-07-20 09:33:39.394063	\N	WVWRV1161CM106990	لا يوجد	\N
14	4	AUDI	A6	519-1799	فضي	2011	لايوجد	2025-07-21 08:41:42.78379	CCA	WAUZZZ4F4BN061595	لايوجد	\N
15	12	AUDI	A4	518-6396	رمادي	2011	\N	2025-07-21 09:30:25.029333	CAEB	WAUZZZ8K0BN037642	\N	\N
16	13	AUDI	Q5	516-6291	أبيض	2015	\N	2025-07-21 09:54:22.399113	CNCD	WALCFCFP5FA007847	\N	\N
17	14	VOLKSWAGEN	Tiguan	506-5808	فضي	2021	\N	2025-07-21 10:17:37.62633	DG4	3VV3B7AX5LM129639	\N	\N
18	15	AUDI	A5	518-1528	رمادي	2015	\N	2025-07-22 07:53:55.737683	CPM	WAUBFAFL8FN001632	\N	\N
19	16	VOLKSWAGEN	Passat cc	لا يوجد	أبيض	2013	\N	2025-07-22 11:29:24.486084	CDA	WVWAB1ANXDE535635	\N	\N
20	17	AUDI	A6	502-5355	أبيض	2013	\N	2025-07-23 08:12:39.132395	3.0 TFSI/CTUA	WAUFGCFCUDN072706	\N	\N
21	18	VOLKSWAGEN	Tiguan	501-4242	أبيض	2023	\N	2025-07-23 08:45:12.327966	330 TSI/DPL	LSVZM60T1N2033039	\N	\N
22	19	SKODA	Octavia	452565	أزرق	2006	\N	2025-07-23 10:47:04.503853	1.6MPI	TMBBA41Z262272802	\N	\N
23	20	AUDI	RS5	504-7428	أحمر	2019	\N	2025-07-23 12:09:17.526739	2.9 DECA	WAUZZZF50KA904001	\N	\N
24	21	AUDI	Q5	504-2540	أبيض	2011	\N	2025-07-24 06:21:14.748133	CDNC	WAUCFC8R1CA018213	\N	\N
25	22	VOLKSWAGEN	Passat cc	506-8803	أزرق	2011	\N	2025-07-24 06:25:53.289378	CDA	WVWAB13C5BE744189	\N	\N
26	23	AUDI	Q5	518-3239	رمادي	2013	\N	2025-07-28 07:28:31.229126	CNC	WA1CFCFP1DA020608	\N	\N
27	24	AUDI	Q5	504-2539	أسود	2013	\N	2025-07-28 10:37:36.996835	CAL	WAUCKC8R8DA001647	\N	\N
28	25	AUDI	RS7	510-9218	أبيض	2013	\N	2025-07-28 11:13:59.749092	CEUC	WAUS2CFC1DN028885	\N	\N
29	26	AUDI	A6	453235	أصفر	2024	\N	2025-08-09 07:41:03.738647	CDA	WALCFCFP5FA007847	\N	لا يوجد
30	27	AUDI	A6	5632124	أصفر	2024	\N	2025-08-09 10:46:35.766451	CDA	FDDDFDF4323456YHR	\N	\N
31	28	SKODA	Superb	55555555	أصفر	2020	\N	2025-08-09 10:55:59.294204	bfs	DFDF3432RFR456TR4	\N	\N
32	29	VOLKSWAGEN	Passat	502600	أسود	2006	\N	2025-08-09 11:11:33.931819	bws	WVWZZZ3CZ7P033218	\N	\N
33	29	VOLKSWAGEN	Passat	433887	أسود	2007	\N	2025-08-09 11:12:02.990995	blf	\N	\N	\N
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customers (id, name, phone_number, address, notes, created_at, customer_status, is_favorite) FROM stdin;
1	عادل الغفري	0992113654	\N	\N	2025-07-15 13:17:29.076347	A	0
3	طلال مخول	0991135368	\N	\N	2025-07-19 08:28:08.060402	A	0
4	محمد قاسم دياب	0933433913	\N	\N	2025-07-19 08:30:00.14136	A	0
5	سيف الدين المذيب	0995526915	\N	\N	2025-07-19 08:33:51.572243	A	0
6	حسان ملوك 	0959490600	\N	\N	2025-07-19 08:37:33.767876	A	0
7	محمد الجوجة	0944464519	\N	\N	2025-07-19 10:37:33.935683	A	0
8	احمد جنيد	0933511905	\N	\N	2025-07-19 10:45:54.138224	A	0
9	محمود ياسين 	0955594442	\N	\N	2025-07-20 07:01:35.133854	A	0
10	ايمن العويد	0969417705	\N	\N	2025-07-20 08:24:52.143931	A	0
11	رانية الشرابي	0944489799	\N	\N	2025-07-20 09:25:59.741184	A	0
12	فارس بدر	0931864116	\N	\N	2025-07-21 09:30:24.257361	A	0
13	رائد مشارقة	0933606339	\N	\N	2025-07-21 09:54:21.683728	A	0
14	تيسير شحود الاسعد	0938842457	\N	\N	2025-07-21 10:17:36.878979	A	0
15	زاهر شمسي باشا	0944520109	\N	\N	2025-07-22 07:53:55.054354	A	0
16	عمر العوض	0981790867	\N	\N	2025-07-22 11:29:23.413534	A	0
17	رضوان شاكر	0967668280	\N	\N	2025-07-23 08:12:37.972134	A	0
18	مهدي اتاسي	0944558383	\N	\N	2025-07-23 08:45:10.994559	A	0
19	عبد الكريم العمر	0981638211	\N	\N	2025-07-23 10:47:02.490761	A	0
20	عبد الكريم حزما	0940100049	\N	\N	2025-07-23 12:09:16.824483	A	0
21	وائل سرور	0955594442	\N	\N	2025-07-24 06:21:13.39153	A	0
22	حازم الشيخ سعيد	0941925620	\N	\N	2025-07-24 06:25:52.536143	A	0
23	عمر ابو زيد	0988046464	\N	\N	2025-07-28 07:28:30.513733	A	0
24	فراس ديبه	0932053814	\N	\N	2025-07-28 10:37:36.033889	A	0
25	طه زعرور 	0957552413	\N	\N	2025-07-28 11:13:59.000544	A	0
26	عمر طرابلسي	0969581161	\N	\N	2025-08-09 07:41:03.159871	B	0
27	مرتضى لالل	0946473838	\N	\N	2025-08-09 10:46:34.985861	A	0
28	هاشم القاطع	09443232234	\N	\N	2025-08-09 10:55:58.812204	A	0
29	فارس	0988128150	\N	\N	2025-08-09 11:11:32.16368	A	0
\.


--
-- Data for Name: parts_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.parts_requests (id, request_number, engineer_name, car_info, car_brand, car_model, reason_type, part_name, quantity, status, notes, requested_by, requested_at, approved_by, approved_at, delivered_by, delivered_at, license_plate, chassis_number, engine_code, in_preparation_at, ready_for_pickup_at, ordered_externally_at, ordered_externally_by, estimated_arrival, unavailable_at, unavailable_by, parts_arrived_at, parts_arrived_by, returned_at, returned_by, return_reason, user_notes, customer_name) FROM stdin;
62	طلب-9	بدوي	1528	AUDI	A4	expense	5 لتر زيت + مصفاية زيت	1	delivered	تم الاستلام بنجاح	\N	2025-07-22 07:57:04.924	\N	\N	بدوي	2025-07-22 09:19:46.969	518-1528	WAUBFAFL8FN001632	CPM	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
71	طلب-18	بدوي	مهدي اتاسي	VOLKSWAGEN	Tiguan	expense	زيت + مصفاة 	1	delivered	تم الاستلام بنجاح	\N	2025-07-23 08:50:38.926	\N	\N	بدوي	2025-07-23 08:50:54.12	501-4242	LSVZM60T1N2033039	330 TSI/DPL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
64	طلب-11	بدوي	4564	AUDI	Q5	expense	ضبة برغي 	2	delivered	تم الاستلام بنجاح	\N	2025-07-22 09:32:53.741	\N	2025-07-22 09:33:06.923	بدوي	2025-07-22 09:35:14.217	513-4564	WA1CGCFP3EA006997	CTV	2025-07-22 09:33:06.923	2025-07-22 09:33:10.026	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
54	طلب-1	بدوي	1799	AUDI	A6	loan	حساس ضغط غاز مكيف	1	delivered	تم الاستلام بنجاح	\N	2025-07-21 08:42:26.523	\N	2025-07-21 08:56:45.964	بدوي	2025-07-21 09:00:26.419	519-1799	WAUZZZ4F4BN061595	CCA	2025-07-21 08:56:45.964	2025-07-21 08:56:56.94	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
63	طلب-10	بدوي	رانية الشرابي	VOLKSWAGEN	Passat	expense	لمبة طقة اولى	1	delivered	تم الاستلام بنجاح	\N	2025-07-22 09:31:00.795	\N	2025-07-22 09:32:33.47	بدوي	2025-07-22 09:35:16.084	646-270	WVWZZZ3CZBP001395	غير معروف	2025-07-22 09:32:33.47	2025-07-22 09:32:36.583	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
55	طلب-2	عبد الحفيظ	6396	AUDI	A4	loan	مبخرة	1	returned	تم الاستلام بنجاح	\N	2025-07-21 09:30:58.925	\N	\N	بدوي	2025-07-21 09:37:19.097	518-6396	WAUZZZ8K0BN037642	CAEB	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-21 09:58:27.647	بدوي	العطل ليس منها 	\N	\N
57	طلب-4	عبد الحفيظ	6396	AUDI	A4	loan	طرمبةFSI  + صباب بانزين راجع + حساس ضغط بانزين	1	delivered	تم الاستلام بنجاح	\N	2025-07-21 09:57:32.132	\N	\N	بدوي	2025-07-21 10:13:27.169	518-6396	WAUZZZ8K0BN037642	CAEB	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
65	طلب-12	بدوي	6291	AUDI	Q5	expense	اتماسور	2	delivered	تم الاستلام بنجاح	\N	2025-07-22 09:35:06.21	\N	\N	بدوي	2025-07-22 09:35:27.425	516-6291	WALCFCFP5FA007847	CNCD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
58	طلب-5	عبد الحفيظ	4564	AUDI	Q5	expense	رادييتر	1	delivered	تم الاستلام بنجاح	\N	2025-07-21 10:11:52.126	\N	\N	بدوي	2025-07-21 10:13:42.485	513-4564	WA1CGCFP3EA006997	CTV	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
56	طلب-3	عبد الحفيظ	6291	AUDI	Q5	expense	بخاخة صدي	1	delivered	تم الاستلام بنجاح	\N	2025-07-21 09:55:23.872	\N	\N	بدوي	2025-07-21 10:13:29.122	516-6291	WALCFCFP5FA007847	CNCD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
72	طلب-19	بدوي	5355	AUDI	A6	expense	بواجي	1	delivered	تم الاستلام بنجاح	\N	2025-07-23 08:53:58.089	\N	\N	بدوي	2025-07-23 08:54:04.669	502-5355	WAUFGCFCUDN072706	3.0 TFSI/CTUA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
59	طلب-6	عبد الحفيظ	5808	VOLKSWAGEN	Tiguan	expense	طقم كوليات امامي وخلفي	1	delivered	تم الاستلام بنجاح	\N	2025-07-21 10:18:17.096	\N	2025-07-21 10:23:25.001	بدوي	2025-07-21 10:26:17.359	506-5808	3VV3B7AX5LM129639	DG4	2025-07-21 10:23:25.001	2025-07-21 10:23:31.254	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
60	طلب-7	عبد الحفيظ	1799	AUDI	A6	expense	لمبة D3S	1	delivered	تم الاستلام بنجاح	\N	2025-07-21 11:07:41.568	\N	\N	بدوي	2025-07-21 11:11:00.602	519-1799	WAUZZZ4F4BN061595	CCA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
61	طلب-8	عبد الحفيظ	5808	VOLKSWAGEN	Tiguan	expense	زيت 5 لتر+ مصفاة	1	delivered	تم الاستلام بنجاح	\N	2025-07-21 11:46:20.116	\N	\N	بدوي	2025-07-21 11:55:24.361	506-5808	3VV3B7AX5LM129639	DG4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
66	طلب-13	بدوي	رانية الشرابي	VOLKSWAGEN	Passat	expense	4 لتر زيت 	1	delivered	تم الاستلام بنجاح	\N	2025-07-22 09:54:24.297	\N	2025-07-22 09:54:43.052	بدوي	2025-07-22 09:55:10.856	646-270	WVWZZZ3CZBP001395	TSI / CAW	2025-07-22 09:54:43.052	2025-07-22 09:54:52.558	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
68	طلب-15	عبد الحفيظ	عمر العوض	VOLKSWAGEN	Passat cc	expense	طقم بواجي + بوبين ع1	1	delivered	تم الاستلام بنجاح	\N	2025-07-22 11:44:36.044	\N	\N	بدوي	2025-07-22 12:07:39.469	لا يوجد	WVWAB1ANXDE535635	CDA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
67	طلب-14	بدوي	عمر العوض	VOLKSWAGEN	Passat cc	expense	حساس بوابات منيفولد	1	delivered	تم الاستلام بنجاح	\N	2025-07-22 11:30:06.702	\N	\N	بدوي	2025-07-22 12:07:41.288	لا يوجد	WVWAB1ANXDE535635	CDA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
69	طلب-16	بدوي	6291	AUDI	Q5	expense	زيت فرام 	2	delivered	تم الاستلام بنجاح	\N	2025-07-23 06:35:17.324	\N	\N	بدوي	2025-07-23 06:36:02.256	516-6291	WALCFCFP5FA007847	CNCD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
77	طلب-23	بدوي	3239	AUDI	Q5	expense	لتر بنزين	1	delivered	تم الاستلام بنجاح	\N	2025-07-28 07:29:17.309	\N	\N	بدوي	2025-07-28 07:29:28.458	518-3239	WA1CFCFP1DA020608	CNC	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
76	طلب-22	بدوي	8803	VOLKSWAGEN	Passat cc	expense	شرحة تثبيت بطارية	1	delivered	تم الاستلام بنجاح	\N	2025-07-28 07:17:01.514	\N	\N	بدوي	2025-07-28 07:29:30.382	506-8803	WVWAB13C5BE744189	CDA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
73	طلب-20	عبد الحفيظ	6291	AUDI	Q5	expense	1.1 زيت فرام	1	delivered	تم الاستلام بنجاح	\N	2025-07-23 08:55:01.239	\N	\N	بدوي	2025-07-23 08:55:55.568	516-6291	WALCFCFP5FA007847	CNCD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
75	طلب-21	بدوي	8803	VOLKSWAGEN	Passat cc	expense	خراطيم ماء لمبرد علبة السرعة مع الوصلات	1	delivered	تم الاستلام بنجاح	\N	2025-07-28 07:16:23.443	\N	\N	بدوي	2025-07-28 07:29:51.284	506-8803	WVWAB13C5BE744189	CDA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
70	طلب-17	بدوي	رضوان شاكر	AUDI	A6	expense	فلتر هوا+فلتر مكيف	1	delivered	تم الاستلام بنجاح	\N	2025-07-23 08:43:01.411	\N	\N	بدوي	2025-07-23 08:46:24.093	502-5355	WAUFGCFCUDN072706	3.0 TFSI/CTUA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
78	طلب-24	بدوي	2539	AUDI	Q5	expense	سيل خراطيم ماء ردتير	2	delivered	تم الاستلام بنجاح	\N	2025-07-28 10:38:49.931	\N	\N	بدوي	2025-07-28 10:52:13.808	504-2539	WAUCKC8R8DA001647	CAL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
83	طلب-29	حسن	حازم الشيخ سعيد - VOLKSWAGEN Passat cc - 506-8803	VOLKSWAGEN	Passat cc	expense	فلتر هوا	1	delivered	تم الاستلام بنجاح	\N	2025-08-09 07:38:39.944	\N	2025-08-09 07:38:51.49	بدوي	2025-08-09 07:39:21.988	506-8803	WVWAB13C5BE744189	CDA	2025-08-09 07:38:51.49	2025-08-09 07:38:58.604	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	حازم الشيخ سعيد
79	طلب-25	بدوي	عمر ابو زيد	AUDI	Q5	expense	غطاء فضال ماء	1	delivered	تم الاستلام بنجاح	\N	2025-07-28 10:52:22.695	\N	2025-07-28 10:54:15.315	بدوي	2025-07-28 10:59:09.919	518-3239	WA1CFCFP1DA020608	CNC	2025-07-28 10:54:15.315	2025-07-28 10:54:18.681	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
80	طلب-26	بدوي	510-9218	AUDI	RS7	expense	5 لتر زيت DSG	1	pending		\N	2025-07-28 11:15:17.585	\N	\N	\N	\N	510-9218	WAUS2CFC1DN028885	CEUC	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
81	طلب-27	بدوي	2539	AUDI	Q5	expense	5لتر زيت  DSG	1	pending		\N	2025-07-28 11:16:30.758	\N	\N	\N	\N	504-2539	WAUCKC8R8DA001647	CAL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
82	طلب-28	سليمان	رائد مشارقة - AUDI Q5 - 516-6291	AUDI	Q5	expense	فلتر زيت	2	pending	تم البحث بواسطة AUTOFILL	\N	2025-08-09 07:29:21.393	\N	\N	\N	\N	516-6291	WALCFCFP5FA007847	CNCD	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	رائد مشارقة
84	طلب-30	سليمان	عمر طرابلسي - AUDI A6 - 453235	AUDI	A6	loan	فلتر 	1	pending		\N	2025-08-09 09:49:21.073	\N	\N	\N	\N	453235	WALCFCFP5FA007847	CDA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عمر طرابلسي
85	طلب-31	بدوي	عمر ابو زيد - AUDI Q5 - 518-3239	AUDI	Q5	loan	فلتر هوا	1	pending	777	\N	2025-08-09 10:14:46.79	\N	\N	\N	\N	518-3239	WA1CFCFP1DA020608	CNC	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عمر ابو زيد
86	طلب-32	بدوي	هاشم القاطع - SKODA Superb - 55555555	SKODA	Superb	expense	فلتر هوا	1	pending	11	\N	2025-08-09 10:56:51.415	\N	\N	\N	\N	55555555	DFDF3432RFR456TR4	bfs	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	هاشم القاطع
87	طلب-33	عبد الحفيظ	فارس - VOLKSWAGEN Passat - 502600	VOLKSWAGEN	Passat	expense	فتلر زيت	1	pending		\N	2025-08-09 11:18:51.573	\N	\N	\N	\N	502600	WVWZZZ3CZ7P033218	bws	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	فارس
\.


--
-- Data for Name: reception_entries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reception_entries (id, car_owner_name, license_plate, service_type, complaints, odometer_reading, fuel_level, reception_user_id, workshop_user_id, entry_time, workshop_entry_time, status, created_at, updated_at, customer_id, car_id) FROM stdin;
4	مرتضى لالل	5632124	فحص شامل	dddd	1234567	1455555	11	3	2025-08-09 10:47:01.19733	2025-08-09 10:47:54.584	workshop	2025-08-09 10:47:01.19733	2025-08-09 10:47:01.19733	27	30
5	هاشم القاطع	55555555	فحص شامل		123456	156777	11	11	2025-08-09 10:56:19.367365	2025-08-09 10:56:25.627	workshop	2025-08-09 10:56:19.367365	2025-08-09 10:56:19.367365	28	31
6	فارس	502600	صيانة دورية		110000	50	11	3	2025-08-09 11:15:30.307559	2025-08-09 11:16:14.912	workshop	2025-08-09 11:15:30.307559	2025-08-09 11:15:30.307559	29	32
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.session (sid, sess, expire) FROM stdin;
zDLfkkLmW3guwCmfGu7cuVkWDITkUGnc	{"cookie":{"originalMaxAge":86400000,"expires":"2025-08-06T13:59:38.550Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":3}}	2025-08-06 13:59:39
pYWatCD7X9h0YRuRduhOaXQsUIc7A1XY	{"cookie":{"originalMaxAge":86400000,"expires":"2025-08-06T13:59:41.095Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":4}}	2025-08-06 13:59:42
Ysx2vmoly4XsCFE1F0XTqwhKd096qaJg	{"cookie":{"originalMaxAge":86400000,"expires":"2025-08-06T14:00:13.741Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":3}}	2025-08-06 14:00:34
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.tasks (id, task_number, worker_id, worker_role, description, car_brand, car_model, license_plate, estimated_duration, engineer_name, supervisor_name, assistant_name, status, start_time, end_time, paused_at, pause_reason, pause_notes, total_paused_duration, is_archived, archived_at, archived_by, archive_notes, rating, created_at, repair_operation, technician_name, delivery_number, task_type, is_cancelled, cancellation_reason, cancelled_at, cancelled_by, technicians, assistants, timer_type, consumed_time, color) FROM stdin;
5	T001	29	technician	فحص عام للسيارة	Audi	A4	A123456	120	بدوي	\N	عبد الحفيظ	pending	2025-08-09 10:37:17.671045	\N	\N	\N	\N	0	f	\N	\N	\N	\N	2025-08-09 10:37:17.671045	فحص شامل	\N	\N	mechanical	f	\N	\N	\N	\N	\N	automatic	\N	\N
6	T002	30	technician	تغيير زيت وفلتر	Volkswagen	Golf	V789012	60	سليمان	\N	\N	pending	2025-08-09 10:37:17.671045	\N	\N	\N	\N	0	f	\N	\N	\N	\N	2025-08-09 10:37:17.671045	تغيير زيت محرك	\N	\N	maintenance	f	\N	\N	\N	\N	\N	automatic	\N	\N
7	T003	31	technician	فحص النظام الكهربائي	Seat	Leon	S345678	90	حسن	\N	\N	pending	2025-08-09 10:37:17.671045	\N	\N	\N	\N	0	f	\N	\N	\N	\N	2025-08-09 10:37:17.671045	فحص كهربائي	\N	\N	electrical	f	\N	\N	\N	\N	\N	automatic	\N	\N
8	T004	29	technician	صيانة شاملة للسيارة	Skoda	Octavia	K901234	180	بدوي	\N	أحمد	pending	2025-08-09 10:37:17.671045	\N	\N	\N	\N	0	f	\N	\N	\N	\N	2025-08-09 10:37:17.671045	صيانة دورية	\N	\N	maintenance	f	\N	\N	\N	\N	\N	automatic	\N	\N
\.


--
-- Data for Name: time_entries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.time_entries (id, task_id, start_time, end_time, duration, entry_type, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, role, permissions, created_at, updated_at) FROM stdin;
5	روان	bd068ad9dd6872ecaf702f64a6e7e0c6beb61a7cd11b85716ae4832084d26dd97887001104e67cf71a58ba959d2dcd15e047d47336f98b3b8373155d262e4057.db9ce8e0b86c45255455cd1c4dbc6592	supervisor	{dashboard:read,timers:read,tasks:read,tasks:create,archive:read,customers:read,parts:read,parts:create}	2025-07-12 08:58:40.025489	2025-07-12 08:58:40.025489
1	ملك	31546d7c573378328dd59642bddfcd54a2397d9d6d7bde9798f675c26b0a96d41bc764b1e7eb458e56dde4e6c2b00d5d04a9a593b85a2f046cf79361904738a7.367689f24968b71cc9c36959efbe1262	finance	{dashboard:read,tasks:read,archive:read,customers:read,parts:read}	2025-07-12 08:14:16.49495	2025-07-12 08:14:16.49495
4	هبة	12c2ec64d784efbbe62529459bb0eb0708e2f6fd7fa3c856ab3bc77bd09b945d8eae095ac01961c97a10581d80de66a016a3230c6e3b5966cf0459c331c9507e.4c11a824da8a9688077b58a913c93bb8	viewer	{dashboard:read,timers:read,tasks:read,customers:read,parts:read,parts:approve,parts:reject}	2025-07-12 08:29:34.446517	2025-07-12 08:29:34.446517
3	بدوي	fc392475b3ea4dadc9870ea2e631d35f3cbf57ca377fa7d1df362d21d7918a8ea8673e6e1145d8bd650d58c266488cfb8211a2432b85e7fe57ad3ecb0354371b.e9380b56a263ab5f970d0fc77205bba7	operator	{dashboard:read,timers:read,timers:write,tasks:read,tasks:write,archive:read,customers:read,customers:write,parts:read,parts:create}	2025-07-12 08:23:12.129356	2025-07-12 08:23:12.129356
7	الاستقبال	913a232c837f27898c31a0414a04ebf0a5e362b05e29e8ae28edc95fa0616caee900cd137e76df2037ddc0390fd4a66b0fb7544f9aec2587bcc1c2fee4982f59.171da1717145016ec3c2bc92ddff47ff	reception	{timers:read,tasks:read,parts:read,receipts:read,receipts:write,receipts:create,customers:read,customers:write,customers:create}	2025-07-23 06:56:53.200562	2025-07-23 06:56:53.200562
6	فارس	7cf30e38840d360085730077714fc1e8ab8f5b0418f16c047a6ffd3f953ca1263708b35978788bb6071d7f0f88eb0ea65dba8a5e6fd1a09833087dd78d5a2b00.72610d95f0a2963e6e5e95ea01e2e0c9	admin	{dashboard:read,dashboard:write,timers:read,timers:write,tasks:read,tasks:write,tasks:create,tasks:edit,tasks:delete,archive:read,archive:write,customers:read,customers:write,customers:create,customers:edit,customers:delete,parts:read,parts:write,parts:create,parts:approve,parts:reject,workers:read,workers:write,workers:create,workers:edit,workers:delete}	2025-07-23 06:44:49.030055	2025-07-23 06:44:49.030055
\.


--
-- Data for Name: workers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.workers (id, name, category, supervisor, assistant, engineer, national_id, phone_number, address, is_active, is_predefined, created_at) FROM stdin;
29	بدوي	مهندس أول	\N	\N	بدوي	\N	0599123456	\N	t	f	2025-08-09 10:36:09.328888
30	سليمان	فني ميكانيك	\N	\N	سليمان	\N	0599234567	\N	t	f	2025-08-09 10:36:09.328888
31	حسن	فني كهرباء	\N	\N	حسن	\N	0599345678	\N	t	f	2025-08-09 10:36:09.328888
32	عبد الحفيظ	فني مساعد	\N	\N	عبد الحفيظ	\N	0599456789	\N	t	f	2025-08-09 10:36:09.328888
33	أحمد	فني برمجة	\N	\N	أحمد	\N	0599567890	\N	t	f	2025-08-09 10:36:09.328888
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: neondb_owner
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, false);


--
-- Name: car_receipts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.car_receipts_id_seq', 38, true);


--
-- Name: car_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.car_status_id_seq', 9, true);


--
-- Name: customer_cars_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.customer_cars_id_seq', 33, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.customers_id_seq', 29, true);


--
-- Name: parts_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.parts_requests_id_seq', 87, true);


--
-- Name: reception_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.reception_entries_id_seq', 6, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.tasks_id_seq', 8, true);


--
-- Name: time_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.time_entries_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: workers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.workers_id_seq', 33, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: neondb_owner
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: car_receipts car_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.car_receipts
    ADD CONSTRAINT car_receipts_pkey PRIMARY KEY (id);


--
-- Name: car_receipts car_receipts_receipt_number_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.car_receipts
    ADD CONSTRAINT car_receipts_receipt_number_key UNIQUE (receipt_number);


--
-- Name: car_status car_status_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.car_status
    ADD CONSTRAINT car_status_pkey PRIMARY KEY (id);


--
-- Name: customer_cars customer_cars_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_cars
    ADD CONSTRAINT customer_cars_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: parts_requests parts_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parts_requests
    ADD CONSTRAINT parts_requests_pkey PRIMARY KEY (id);


--
-- Name: parts_requests parts_requests_request_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parts_requests
    ADD CONSTRAINT parts_requests_request_number_unique UNIQUE (request_number);


--
-- Name: reception_entries reception_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reception_entries
    ADD CONSTRAINT reception_entries_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_task_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_task_number_unique UNIQUE (task_number);


--
-- Name: time_entries time_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_pkey PRIMARY KEY (id);


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
-- Name: workers workers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: car_status car_status_car_receipt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.car_status
    ADD CONSTRAINT car_status_car_receipt_id_fkey FOREIGN KEY (car_receipt_id) REFERENCES public.car_receipts(id);


--
-- Name: customer_cars customer_cars_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_cars
    ADD CONSTRAINT customer_cars_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_worker_id_workers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_worker_id_workers_id_fk FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: time_entries time_entries_task_id_tasks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_task_id_tasks_id_fk FOREIGN KEY (task_id) REFERENCES public.tasks(id);


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

