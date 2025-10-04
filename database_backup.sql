--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (63f4182)
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
    created_at timestamp with time zone DEFAULT now(),
    returned_to_reception_at timestamp without time zone,
    returned_by text,
    delivered_at timestamp without time zone
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
-- Name: maintenance_guides; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.maintenance_guides (
    id integer NOT NULL,
    car_brand text NOT NULL,
    car_part text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    tools text,
    safety_tips text,
    estimated_time integer,
    difficulty text DEFAULT 'medium'::text NOT NULL,
    generated_at timestamp without time zone DEFAULT now(),
    last_used timestamp without time zone,
    use_count integer DEFAULT 0
);


ALTER TABLE public.maintenance_guides OWNER TO neondb_owner;

--
-- Name: maintenance_guides_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.maintenance_guides_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_guides_id_seq OWNER TO neondb_owner;

--
-- Name: maintenance_guides_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.maintenance_guides_id_seq OWNED BY public.maintenance_guides.id;


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
    customer_name text,
    for_workshop text
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
    technicians text,
    assistants text,
    timer_type character varying(20) DEFAULT 'automatic'::character varying NOT NULL,
    consumed_time integer,
    color character varying(20),
    invoice_type text,
    is_transferred boolean DEFAULT false,
    transferred_at timestamp without time zone,
    transferred_by text,
    transfer_notes text,
    due_date text
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
-- Name: maintenance_guides id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maintenance_guides ALTER COLUMN id SET DEFAULT nextval('public.maintenance_guides_id_seq'::regclass);


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
-- Data for Name: car_status; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.car_status (id, car_receipt_id, customer_name, license_plate, car_brand, car_model, current_status, received_at, entered_workshop_at, completed_at, maintenance_type, km_reading, fuel_level, complaints, parts_requests_count, completed_parts_count, updated_at, created_at, returned_to_reception_at, returned_by, delivered_at) FROM stdin;
15	\N	طه زعرور 	510-9218	غير محدد	غير محدد	بانتظار قطع	2025-08-16 11:12:41.919	2025-08-16 11:13:00.044	\N	صيانة دورية, فحص شامل	1234567	146	للل	1	1	2025-08-16 11:59:18.286	2025-08-16 11:12:42.075482+00	2025-08-16 11:13:09.692	بدوي	\N
17	\N	عمر طرابلسي	453235	غير محدد	غير محدد	بانتظار قطع	2025-08-27 10:37:35.433	2025-08-27 10:37:42.681	\N	إصلاح عطل, فحص شامل	0	146	444	3	1	2025-09-10 13:32:37.223	2025-08-27 10:37:35.592402+00	2025-08-27 10:41:48.491	الاستقبال	2025-08-27 10:50:12.137
25	\N	طه زعرور S7	510-9218	غير محدد	غير محدد	في الاستقبال	2025-09-02 07:37:27.535	2025-09-02 07:37:31.318	\N	صيانة دورية, إصلاح عطل	123445	555	لل	0	0	2025-09-02 07:38:33.051	2025-09-02 07:37:27.691013+00	2025-09-02 07:38:33.515	بدوي	\N
8	\N	هاشم القاطع	55555555	غير محدد	غير محدد	بانتظار قطع	2025-08-09 10:56:19.367	2025-08-09 10:56:25.93	\N	فحص شامل	123456	156777		1	0	2025-08-09 10:56:51.709	2025-08-09 10:56:19.517739+00	\N	\N	\N
9	\N	فارس	502600	غير محدد	غير محدد	بانتظار قطع	2025-08-09 11:15:30.307	2025-08-09 11:16:15.202	\N	صيانة دورية	110000	50		1	0	2025-08-09 11:18:51.906	2025-08-09 11:15:30.494246+00	\N	\N	\N
10	\N	عمر بي	321456	غير محدد	غير محدد	بانتظار قطع	2025-08-10 08:27:53.038	2025-08-10 08:28:11.483	\N	صيانة دورية, فحص شامل	543678	50%	ااا	1	0	2025-08-10 08:48:40.608	2025-08-10 08:27:53.199192+00	\N	\N	\N
18	\N	حسان الصباغ	505-4343	غير محدد	غير محدد	مكتمل	2025-08-27 10:38:00.323	2025-08-27 10:38:07.217	\N	صيانة دورية, برمجة	15	قق	للل	0	0	2025-08-27 10:41:30.623	2025-08-27 10:38:00.478486+00	2025-08-27 10:41:15.347	الاستقبال	2025-08-27 10:41:30.796
11	\N	عمر طا	567894	غير محدد	غير محدد	بانتظار قطع	2025-08-10 10:07:24.477	2025-08-10 10:08:56.658	\N	إصلاح عطل, تغيير زيت	245678	40%	عطل باللمبة الخلفية	2	0	2025-08-10 10:20:49.119	2025-08-10 10:07:24.62796+00	\N	\N	\N
19	\N	عمر ابو زيد	518-3239	غير محدد	غير محدد	بانتظار قطع	2025-08-27 11:53:29.696	2025-08-27 11:58:45.762	\N	فحص شامل, إصلاح عطل	234	146	ب	2	2	2025-09-25 08:49:02.95	2025-08-27 11:53:29.854333+00	2025-08-27 12:01:18.227	الاستقبال	2025-08-27 12:01:37.889
12	\N	أحمد محمد	بدوي-123	audi	A4	مكتمل	2025-08-16 10:19:59.629749	\N	\N	صيانة دورية	\N	\N	مشكلة في المحرك	0	0	2025-08-16 11:09:37.027	2025-08-16 10:19:59.629749+00	2025-08-16 11:08:42.594	بدوي	2025-08-16 11:09:36.804
26	\N	عبد المجيد كلزلي	513-4564	غير محدد	غير محدد	بانتظار قطع	2025-09-02 13:17:08.833	2025-09-02 13:18:03.199	\N	إصلاح عطل, تغيير زيت	154873	30%	طرنبة المي لاتعمل	1	0	2025-09-03 07:38:49.207	2025-09-02 13:17:08.990774+00	2025-09-02 13:26:13.205	الاستقبال	2025-09-02 13:27:04.718
20	\N	مرتضى لالل	5632124	غير محدد	غير محدد	مكتمل	2025-08-27 12:05:19.533	2025-08-27 12:05:23.776	\N	إصلاح عطل, صيانة دورية	12345	146	للل	0	0	2025-08-27 12:05:51.932	2025-08-27 12:05:19.692064+00	2025-08-27 12:05:28.706	الاستقبال	2025-08-27 12:05:52.035
16	\N	نبيل الطحله	511-2541	غير محدد	غير محدد	بانتظار قطع	2025-08-16 11:35:54.467	2025-08-27 10:37:15.146	\N	صيانة دورية, إصلاح عطل	156789	1222	للل	2	1	2025-09-27 11:35:10.408	2025-08-16 11:35:54.622702+00	2025-09-01 11:22:00.931	بدوي	\N
28	\N	يحيى عثمان	1125	AUDI	A6	في الاستقبال	2025-09-06 09:00:36.243963	\N	\N	\N	\N	\N	\N	0	0	2025-09-06 09:00:36.243963	2025-09-06 09:00:36.243963+00	\N	\N	\N
21	\N	عمر طرابلسي	418438	غير محدد	غير محدد	مكتمل	2025-09-01 13:48:48.12	2025-09-01 13:49:53.513	\N	صيانة دورية	1456234	40%	عطل في علبة السرعة	0	0	2025-09-01 13:52:26.204	2025-09-01 13:48:48.281255+00	2025-09-01 13:52:00.961	الاستقبال	2025-09-01 13:52:26.102
22	\N	أحمد محمد	123456	AUDI	A4	في الورشة	2025-09-02 07:28:22.831564	2025-09-02 07:28:22.831564	\N	\N	\N	\N	\N	0	0	2025-09-02 07:28:22.831564	2025-09-02 07:28:22.831564+00	\N	\N	\N
23	\N	سالم علي	789012	VOLKSWAGEN	Passat	في الورشة	2025-09-02 07:28:22.831564	2025-09-02 07:28:22.831564	\N	\N	\N	\N	\N	0	0	2025-09-02 07:28:22.831564	2025-09-02 07:28:22.831564+00	\N	\N	\N
24	\N	محمود حسن	345678	SKODA	Octavia	في الورشة	2025-09-02 07:28:22.831564	2025-09-02 07:28:22.831564	\N	\N	\N	\N	\N	0	0	2025-09-02 07:28:22.831564	2025-09-02 07:28:22.831564+00	\N	\N	\N
29	\N	محمد أحمد	3107	VW	PASSAT	مؤرشف	2025-09-06 09:20:06.455265	\N	\N	\N	\N	\N	\N	0	0	2025-09-06 09:20:06.455265	2025-09-06 09:20:06.455265+00	\N	\N	\N
30	\N	سامر علي	3935	VOLKSWAGEN	PASSAT	مؤرشف	2025-09-06 09:20:06.455265	\N	\N	\N	\N	\N	\N	0	0	2025-09-06 09:20:06.455265	2025-09-06 09:20:06.455265+00	\N	\N	\N
31	\N	خالد محمود	1397	AUDI	A6 C7	مؤرشف	2025-09-06 09:20:06.455265	\N	\N	\N	\N	\N	\N	0	0	2025-09-06 09:20:06.455265	2025-09-06 09:20:06.455265+00	\N	\N	\N
27	\N	عمر طرابلسي	453235	غير محدد	غير محدد	بانتظار قطع	2025-09-03 07:17:12.585	\N	\N	إصلاح عطل	43654	43	للل	2	1	2025-09-09 12:52:50.703	2025-09-03 07:17:12.739318+00	\N	\N	\N
\.


--
-- Data for Name: customer_cars; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customer_cars (id, customer_id, car_brand, car_model, license_plate, color, year, notes, created_at, engine_code, chassis_number, previous_owner, previous_license_plate) FROM stdin;
3943	798	VOLKSWAGEN	Passat cc	211152	أبيض	2009	\N	2025-09-03 07:11:49.529879	BWS	WVWZZZ3CZ9E557074	\N	\N
3945	3938	AUDI	Q7	521-1181	أبيض	2015	\N	2025-09-09 12:51:18.103783	CREC	WA1AGDF78GD001227	\N	\N
3949	3942	AUDI	Q7	524-6140	فضي	2014	\N	2025-09-10 10:41:07.435766	لايوجد	WA1AGDFEXED011365	\N	\N
3950	3943	VOLKSWAGEN	Touareg	529-3194	أبيض	2017	\N	2025-09-13 10:33:18.651579	لم يتم الكشف عنه	1VZYR2CAXKC526886	\N	\N
3952	3945	AUDI	A6	524-4896	أسود	2012	\N	2025-09-15 09:58:58.757472	لايوجد	WAUZZZ464CN149119	\N	\N
35	30	AUDI	A9	76345678	بنفسجي	2024	\N	2025-08-10 08:26:52.032697	BTS	GGGGGHHGHYUIKJHBN	\N	\N
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
34	29	AUDI	A5	6663366	برتقالي	2024	\N	2025-08-10 07:24:44.643376	BTW	DSDSRTTYHGGHJKKLL	\N	لا يوجد
36	30	VOLKSWAGEN	Passat	321456	برتقالي	2024	\N	2025-08-10 08:27:21.053426	TYU	HHGFDDERTYYUIKKNH	\N	\N
37	31	VOLKSWAGEN	A9	567894	برتقالي	2024	\N	2025-08-10 10:05:31.403367	HFA	HHGFGJHNJGHFFJJRT	\N	\N
38	32	AUDI	A6	511-2541	أبيض	2012	\N	2025-08-16 07:06:06.509364	CAEB	WAUZZZ4G4CN123717	\N	\N
41	35	AUDI	A6	524-3909	أبيض	2012	\N	2025-08-16 07:10:24.101082	CGXB/3.0T	WAUZZZ4G1CN169733	\N	\N
42	36	AUDI	Q5	513-4564	أبيض	2014	\N	2025-08-20 07:44:10.608516	CTV	WA1CGCFP3EA006997	\N	\N
43	37	AUDI	Q5	515-3822	أسود	2016	\N	2025-08-21 08:47:35.04809	CTVA	WA1CGCFP8GA096845	\N	\N
44	38	VOLKSWAGEN	Passat	573986	فضي	2007	\N	2025-08-21 09:01:56.158808	BVZ	WVWGM23C17E228946	\N	\N
45	39	VOLKSWAGEN	Jetta	450236- طرطوس	أحمر	2007	\N	2025-08-21 09:04:37.053318	BSF	TMBBA41ZX72111955	\N	\N
47	41	AUDI	A8	506-2469	فضي	2011	\N	2025-08-24 10:24:51.50239	لايوجد	WAURGB4H2BN016749	\N	\N
49	43	AUDI	Q8	409284	أسود	2007	\N	2025-08-24 10:26:56.769159	BHK	WA1BY74LX7D061884	\N	\N
50	44	AUDI	Q5	513-1356	أبيض	2015	\N	2025-08-25 08:53:39.438245	CNCD	WA1CFCFP6FA000504	\N	\N
51	45	AUDI	A8	507-2495	أسود	2011	\N	2025-08-25 08:56:00.914478	CGXC/3.0	WAUZZZ4H4BN025553	\N	\N
52	46	VOLKSWAGEN	Passat	516-7820	رمادي	2014	\N	2025-08-25 09:00:45.946903	CPKA	1VWAS7A38EC064077	\N	\N
53	47	VOLKSWAGEN	Passat	774708	فضي	2006	\N	2025-08-27 08:04:43.693849	BLF	WVWZZZ3CZ6P116410	\N	\N
54	48	AUDI	Q7	505-4343	رمادي	2016	\N	2025-08-27 08:07:00.755984	CREC	WA1AGDF71GD001604	\N	\N
55	49	VOLKSWAGEN	Passat	510-3935	أسود	2013	\N	2025-09-01 10:34:53.944999	CCZ	WVWAP2AN5DE548252	\N	\N
56	50	VOLKSWAGEN	Passat	331294	أسود	2010	\N	2025-09-01 10:53:01.984382	CCZ	WVWZZZ3CZAP029821	\N	\N
57	51	AUDI	Q5	502-9080	أسود	2011	\N	2025-09-01 10:58:04.558891	CDN	WAUCFC8R2BA042938	\N	\N
58	52	SKODA	Octavia	12-44629	فضي	2007	\N	2025-09-01 10:59:44.337682	BFQ	TMBCA11Z272090652	\N	\N
60	54	AUDI	A8	514-9847	رمادي	2011	\N	2025-09-01 11:02:16.159942	CDRA	WAUZZZ4H3BN003317	\N	\N
61	55	AUDI	A6	508-5020	أبيض	2011	\N	2025-09-01 11:05:47.69543	CDY	WAUZZZ4F3BN034663	\N	\N
62	56	VOLKSWAGEN	Tiguan	507-4003	أسود	2009	\N	2025-09-01 11:10:03.104491	CDH	WVGZZZ5NZ9W001179	\N	\N
63	57	AUDI	A6	503-1397	أبيض	2012	\N	2025-09-01 11:12:38.478756	CHVA	WAUBHC4G0CN076392	\N	\N
64	58	AUDI	A8	510-1084	أسود	2012	\N	2025-09-01 11:14:48.540986	CDRA	WAURVB4H8CN023146	\N	\N
65	59	SKODA	Octavia	678030	أصفر	2006	\N	2025-09-01 11:20:34.148514	1.6MPI/BSF	TMBBA41Z562214232	\N	\N
66	60	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:12.162801		\N	\N	\N
67	61	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:12.462968		\N	\N	\N
68	62	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:12.754473		\N	\N	\N
69	63	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:13.047545		\N	\N	\N
70	64	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:13.342349		\N	\N	\N
71	65	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:13.638918		\N	\N	\N
72	66	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:13.931627		\N	\N	\N
73	67	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:14.224306		\N	\N	\N
74	68	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:14.520075		\N	\N	\N
75	69	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:14.812215		\N	\N	\N
76	70	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:15.103859		\N	\N	\N
77	71	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:15.396678		\N	\N	\N
78	72	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:15.691942		\N	\N	\N
79	73	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:15.983131		\N	\N	\N
80	74	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:16.276059		\N	\N	\N
81	75	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:16.569063		\N	\N	\N
82	76	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:16.861628		\N	\N	\N
83	77	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:17.154144		\N	\N	\N
84	78	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:17.449767		\N	\N	\N
85	79	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:17.744783		\N	\N	\N
86	80	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:18.036924		\N	\N	\N
87	81	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:18.329655		\N	\N	\N
88	82	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:18.62292		\N	\N	\N
89	83	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:18.918561		\N	\N	\N
90	84	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:19.211896		\N	\N	\N
91	85	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:19.504327		\N	\N	\N
92	86	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:19.798466		\N	\N	\N
93	87	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:20.091787		\N	\N	\N
94	88	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:20.383645		\N	\N	\N
95	89	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:20.676587		\N	\N	\N
96	90	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:20.969035		\N	\N	\N
97	91	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:21.263093		\N	\N	\N
98	92	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:21.556924		\N	\N	\N
99	93	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:21.849778		\N	\N	\N
100	94	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:22.144734		\N	\N	\N
101	95	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:22.437742		\N	\N	\N
102	96	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:22.731581		\N	\N	\N
103	97	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:23.023828		\N	\N	\N
104	98	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:23.316494		\N	\N	\N
105	99	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:23.608695		\N	\N	\N
106	100	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:23.901454		\N	\N	\N
107	101	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:24.193919		\N	\N	\N
108	102	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:24.48643		\N	\N	\N
109	103	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:24.779813		\N	\N	\N
110	104	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:25.071494		\N	\N	\N
111	105	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:25.36356		\N	\N	\N
112	106	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:25.659549		\N	\N	\N
113	107	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:25.953689		\N	\N	\N
114	108	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:26.246817		\N	\N	\N
115	109	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:26.539373		\N	\N	\N
116	110	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:26.831536		\N	\N	\N
117	111	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:27.123337		\N	\N	\N
118	112	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:27.417007		\N	\N	\N
119	113	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:27.709235		\N	\N	\N
120	114	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:28.002096		\N	\N	\N
121	115	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:28.293876		\N	\N	\N
122	116	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:28.691192		\N	\N	\N
123	117	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:28.984194		\N	\N	\N
124	118	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:29.277026		\N	\N	\N
125	119	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:29.570866		\N	\N	\N
126	120	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:29.863252		\N	\N	\N
127	121	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:30.155992		\N	\N	\N
128	122	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:30.449473		\N	\N	\N
129	123	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:30.741606		\N	\N	\N
130	124	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:31.034881		\N	\N	\N
131	125	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:31.32716		\N	\N	\N
132	126	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:31.619482		\N	\N	\N
133	127	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:31.911923		\N	\N	\N
134	128	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:32.205517		\N	\N	\N
135	129	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:32.497984		\N	\N	\N
136	130	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:32.791794		\N	\N	\N
137	131	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:33.084557		\N	\N	\N
138	132	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:33.37693		\N	\N	\N
139	133	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:33.671508		\N	\N	\N
140	134	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:33.963567		\N	\N	\N
141	135	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:34.256508		\N	\N	\N
142	136	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:34.558036		\N	\N	\N
143	137	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:34.850188		\N	\N	\N
144	138	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:35.14209		\N	\N	\N
145	139	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:35.434904		\N	\N	\N
146	140	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:35.727485		\N	\N	\N
147	141	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:36.024893		\N	\N	\N
148	142	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:36.31723		\N	\N	\N
149	143	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:36.609789		\N	\N	\N
150	144	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:36.902718		\N	\N	\N
151	145	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:37.194924		\N	\N	\N
152	146	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:37.487632		\N	\N	\N
153	147	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:37.781272		\N	\N	\N
154	148	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:38.075086		\N	\N	\N
155	149	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:38.366155		\N	\N	\N
156	150	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:38.657123		\N	\N	\N
157	151	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:38.949303		\N	\N	\N
158	152	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:39.241722		\N	\N	\N
159	153	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:39.534117		\N	\N	\N
160	154	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:39.825278		\N	\N	\N
161	155	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:40.117886		\N	\N	\N
162	156	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:40.411223		\N	\N	\N
163	157	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:40.703347		\N	\N	\N
164	158	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:40.996016		\N	\N	\N
165	159	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:41.28811		\N	\N	\N
166	160	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:41.58071		\N	\N	\N
167	161	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:41.872298		\N	\N	\N
168	162	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:42.16491		\N	\N	\N
169	163	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:42.45759		\N	\N	\N
170	164	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:42.751268		\N	\N	\N
171	165	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:43.043695		\N	\N	\N
172	166	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:43.336934		\N	\N	\N
173	167	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:43.634614		\N	\N	\N
174	168	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:43.927754		\N	\N	\N
175	169	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:44.21988		\N	\N	\N
176	170	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:44.512975		\N	\N	\N
177	171	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:44.805723		\N	\N	\N
178	172	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:45.09848		\N	\N	\N
179	173	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:45.39015		\N	\N	\N
180	174	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:45.740457		\N	\N	\N
181	175	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:46.032889		\N	\N	\N
182	176	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:46.325089		\N	\N	\N
183	177	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:46.618683		\N	\N	\N
184	178	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:46.916809		\N	\N	\N
185	179	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:47.209395		\N	\N	\N
186	180	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:47.501692		\N	\N	\N
187	181	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:47.794037		\N	\N	\N
188	182	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:48.087886		\N	\N	\N
189	183	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:48.379227		\N	\N	\N
190	184	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:48.670494		\N	\N	\N
191	185	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:48.962922		\N	\N	\N
192	186	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:49.255018		\N	\N	\N
193	187	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:49.547702		\N	\N	\N
194	188	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:49.839898		\N	\N	\N
195	189	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:50.135952		\N	\N	\N
196	190	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:50.430069		\N	\N	\N
197	191	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:50.72134		\N	\N	\N
198	192	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:51.014057		\N	\N	\N
199	193	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:51.316668		\N	\N	\N
200	194	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:51.608742		\N	\N	\N
201	195	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:51.901706		\N	\N	\N
202	196	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:52.19376		\N	\N	\N
203	197	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:52.485931		\N	\N	\N
204	198	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:52.777864		\N	\N	\N
205	199	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:53.070478		\N	\N	\N
206	200	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:53.382905		\N	\N	\N
207	201	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:53.674994		\N	\N	\N
208	202	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:53.967748		\N	\N	\N
209	203	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:54.322087		\N	\N	\N
210	204	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:54.614185		\N	\N	\N
211	205	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:54.906979		\N	\N	\N
212	206	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:55.200313		\N	\N	\N
213	207	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:55.492276		\N	\N	\N
214	208	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:55.785512		\N	\N	\N
215	209	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:56.077964		\N	\N	\N
216	210	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:56.370896		\N	\N	\N
217	211	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:56.662103		\N	\N	\N
218	212	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:56.954782		\N	\N	\N
219	213	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:57.246875		\N	\N	\N
220	214	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:57.541172		\N	\N	\N
221	215	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:57.832831		\N	\N	\N
222	216	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:58.125464		\N	\N	\N
223	217	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:58.417203		\N	\N	\N
224	218	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:58.709841		\N	\N	\N
225	219	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:59.002189		\N	\N	\N
226	220	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:59.29682		\N	\N	\N
227	221	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:59.590804		\N	\N	\N
228	222	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:21:59.883064		\N	\N	\N
229	223	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:00.175486		\N	\N	\N
230	224	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:00.470608		\N	\N	\N
231	225	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:00.762717		\N	\N	\N
232	226	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:01.054641		\N	\N	\N
233	227	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:01.347011		\N	\N	\N
234	228	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:01.640431		\N	\N	\N
235	229	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:01.933221		\N	\N	\N
236	230	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:02.224175		\N	\N	\N
237	231	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:02.516749		\N	\N	\N
238	232	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:02.809621		\N	\N	\N
239	233	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:03.102033		\N	\N	\N
240	234	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:03.396265		\N	\N	\N
241	235	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:03.693251		\N	\N	\N
242	236	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:03.990248		\N	\N	\N
243	237	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:04.282772		\N	\N	\N
244	238	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:04.575121		\N	\N	\N
245	239	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:04.870226		\N	\N	\N
246	240	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:05.163065		\N	\N	\N
247	241	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:05.808099		\N	\N	\N
248	242	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:06.100923		\N	\N	\N
249	243	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:06.394176		\N	\N	\N
250	244	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:06.687873		\N	\N	\N
251	245	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:06.983293		\N	\N	\N
252	246	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:07.274306		\N	\N	\N
253	247	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:07.56711		\N	\N	\N
254	248	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:07.858495		\N	\N	\N
255	249	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:08.151311		\N	\N	\N
256	250	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:08.443804		\N	\N	\N
257	251	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:08.736086		\N	\N	\N
258	252	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:09.028193		\N	\N	\N
259	253	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:09.319108		\N	\N	\N
260	254	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:09.612373		\N	\N	\N
261	255	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:10.044526		\N	\N	\N
262	256	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:10.337304		\N	\N	\N
263	257	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:10.629716		\N	\N	\N
264	258	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:11.017164		\N	\N	\N
265	259	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:11.308646		\N	\N	\N
266	260	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:11.60038		\N	\N	\N
267	261	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:11.894828		\N	\N	\N
268	262	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:12.187557		\N	\N	\N
269	263	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:12.480438		\N	\N	\N
270	264	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:12.772435		\N	\N	\N
271	265	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:13.064543		\N	\N	\N
272	266	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:13.356668		\N	\N	\N
273	267	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:13.649594		\N	\N	\N
274	268	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:13.94272		\N	\N	\N
275	269	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:14.23548		\N	\N	\N
276	270	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:14.528413		\N	\N	\N
277	271	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:14.821417		\N	\N	\N
278	272	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:15.114749		\N	\N	\N
279	273	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:15.406509		\N	\N	\N
280	274	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:15.69886		\N	\N	\N
281	275	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:15.990821		\N	\N	\N
282	276	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:16.283313		\N	\N	\N
283	277	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:16.576453		\N	\N	\N
284	278	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:16.871094		\N	\N	\N
285	279	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:17.16322		\N	\N	\N
286	280	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:17.458697		\N	\N	\N
287	281	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:17.750775		\N	\N	\N
288	282	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:18.043192		\N	\N	\N
289	283	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:18.336356		\N	\N	\N
290	284	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:18.645867		\N	\N	\N
291	285	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:18.938298		\N	\N	\N
292	286	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:19.230199		\N	\N	\N
293	287	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:19.523542		\N	\N	\N
294	288	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:19.819991		\N	\N	\N
295	289	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:20.125655		\N	\N	\N
296	290	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:20.422697		\N	\N	\N
297	291	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:20.716218		\N	\N	\N
298	292	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:21.014963		\N	\N	\N
299	293	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:21.307186		\N	\N	\N
300	294	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:21.599995		\N	\N	\N
301	295	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:21.892074		\N	\N	\N
302	296	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:22.184267		\N	\N	\N
303	297	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:22.47797		\N	\N	\N
304	298	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:22.771185		\N	\N	\N
305	299	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:23.063588		\N	\N	\N
306	300	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:23.357554		\N	\N	\N
307	301	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:23.652757		\N	\N	\N
308	302	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:23.944664		\N	\N	\N
309	303	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:24.238191		\N	\N	\N
310	304	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:24.530014		\N	\N	\N
311	305	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:24.822308		\N	\N	\N
312	306	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:25.114753		\N	\N	\N
313	307	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:25.406797		\N	\N	\N
314	308	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:25.698104		\N	\N	\N
315	309	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:25.992448		\N	\N	\N
316	310	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:26.285336		\N	\N	\N
317	311	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:26.579306		\N	\N	\N
318	312	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:26.873333		\N	\N	\N
319	313	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:27.165352		\N	\N	\N
320	314	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:27.458159		\N	\N	\N
321	315	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:27.750702		\N	\N	\N
322	316	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:28.043969		\N	\N	\N
323	317	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:28.338297		\N	\N	\N
324	318	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:28.631587		\N	\N	\N
325	319	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:28.923548		\N	\N	\N
326	320	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:29.21823		\N	\N	\N
327	321	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:29.511434		\N	\N	\N
328	322	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:29.811671		\N	\N	\N
329	323	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:30.105121		\N	\N	\N
330	324	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:30.397367		\N	\N	\N
331	325	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:30.689384		\N	\N	\N
332	326	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:30.981757		\N	\N	\N
333	327	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:31.27707		\N	\N	\N
334	328	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:31.586115		\N	\N	\N
335	329	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:31.879273		\N	\N	\N
336	330	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:32.178784		\N	\N	\N
337	331	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:32.472611		\N	\N	\N
338	332	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:32.767251		\N	\N	\N
339	333	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:33.060885		\N	\N	\N
340	334	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:33.353354		\N	\N	\N
341	335	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:33.645945		\N	\N	\N
342	336	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:33.94644		\N	\N	\N
343	337	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:34.239389		\N	\N	\N
344	338	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:34.535869		\N	\N	\N
345	339	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:34.828818		\N	\N	\N
346	340	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:35.121151		\N	\N	\N
347	341	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:35.415153		\N	\N	\N
348	342	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:35.708195		\N	\N	\N
349	343	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:36.005653		\N	\N	\N
350	344	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:36.298139		\N	\N	\N
351	345	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:36.589166		\N	\N	\N
352	346	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:36.88211		\N	\N	\N
353	347	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:37.182184		\N	\N	\N
354	348	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:37.474834		\N	\N	\N
355	349	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:37.771518		\N	\N	\N
356	350	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:38.065875		\N	\N	\N
357	351	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:38.357874		\N	\N	\N
358	352	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:38.650567		\N	\N	\N
359	353	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:38.942891		\N	\N	\N
360	354	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:39.238287		\N	\N	\N
361	355	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:39.530752		\N	\N	\N
362	356	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:39.823463		\N	\N	\N
363	357	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:40.116175		\N	\N	\N
364	358	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:40.408809		\N	\N	\N
365	359	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:40.702131		\N	\N	\N
366	360	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:40.994023		\N	\N	\N
367	361	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:41.355682		\N	\N	\N
368	362	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:41.648229		\N	\N	\N
369	363	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:41.946342		\N	\N	\N
370	364	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:42.238977		\N	\N	\N
371	365	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:42.530591		\N	\N	\N
372	366	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:42.823237		\N	\N	\N
373	367	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:43.115591		\N	\N	\N
374	368	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:43.408138		\N	\N	\N
375	369	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:43.701396		\N	\N	\N
376	370	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:43.993498		\N	\N	\N
377	371	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:44.286087		\N	\N	\N
378	372	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:44.57845		\N	\N	\N
379	373	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:44.870663		\N	\N	\N
380	374	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:45.163075		\N	\N	\N
381	375	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:45.461206		\N	\N	\N
382	376	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:45.753457		\N	\N	\N
383	377	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:46.046095		\N	\N	\N
384	378	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:46.341356		\N	\N	\N
385	379	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:46.633481		\N	\N	\N
386	380	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:46.925744		\N	\N	\N
387	381	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:47.219443		\N	\N	\N
388	382	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:47.511816		\N	\N	\N
389	383	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:47.804373		\N	\N	\N
390	384	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:48.096766		\N	\N	\N
391	385	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:48.390707		\N	\N	\N
392	386	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:48.682679		\N	\N	\N
393	387	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:22:48.97466		\N	\N	\N
3944	3937	VOLKSWAGEN	Touareg	502-5924	بني	2013	\N	2025-09-03 08:07:11.922858	CGRA	WV6BCZBP7DD000478	\N	\N
3946	3939	AUDI	Q7	523-5469	أبيض	2019	\N	2025-09-09 12:55:46.012519	لايوجد	WA1ZZZF7XJD011372	\N	\N
3951	3944	VOLKSWAGEN	Passat	48AIB209- تركية 	أبيض	2016	\N	2025-09-13 10:35:20.757483	DCXA	WVWZZZ3CZGE012201	\N	\N
3953	3946	SKODA	Octavia	593900	فضي	2007	\N	2025-09-15 10:03:19.221356	لايوجد	TMBBA41Z972043387	\N	\N
3954	3947	VOLKSWAGEN	Passat	496872	فضي	2009	\N	2025-09-16 07:22:24.878974	لم يتم الكشف عنه	WVWZZZ3CZ9E563855	\N	\N
3947	3940	AUDI	A5	999999	أزرق	2222	\N	2025-09-09 13:07:23.906327	FFF	34343434HGJHJKGIT	\N	\N
3955	3948	VOLKSWAGEN	Touareg	1/9748-الكويت	أبيض	2007	\N	2025-09-17 10:10:04.484892	لم يتم الكشف عنه	WVGAE27L67D054242	\N	\N
3956	3949	VOLKSWAGEN	Passat	510-4412	أحمر	2014	\N	2025-09-18 06:30:59.824961	لم يتم الكشف عنه	WVWBR7A3XEC001050	\N	\N
3957	3950	AUDI	A6	502-9468	أسود	2021	\N	2025-09-21 10:36:44.69759	DLH	WAUZZZF29MN066076	\N	\N
3959	3952	PORSCHE	Cayenne	506-1745	أسود	2011	\N	2025-09-22 08:29:16.340594	لم يتم الكشف عنه	WP1ZZZ92ZBLA53841	\N	\N
3960	3953	AUDI	RS7	516-2142	أزرق	2015	\N	2025-09-23 09:24:35.000055	لم يتم الكشف عنه	WVAS2DFC8FN900042	\N	\N
3961	3954	VOLKSWAGEN	Jetta	513-2826	فضي	2014	\N	2025-09-25 08:41:09.612674	لم يتم الكشف عنه	WVWRV1AJ6EM215355	\N	\N
3964	3957	VOLKSWAGEN	Tiguan	526-1326	أسود	2016	\N	2025-09-28 07:07:58.883873	TSI2.0	WVGCE2AX7GW509821	\N	\N
3962	3955	AUDI	Q7	502-2283	أسود	2013	\N	2025-09-27 07:07:05.240389	CJT	WA1AGDFE1DD003069	\N	\N
504	498	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:21.502009		\N	\N	\N
506	500	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:21.793439		\N	\N	\N
508	502	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:22.08499		\N	\N	\N
510	504	VW	TOURAN	955960-دمشق	اسود	2004	\N	2025-09-01 12:24:22.379427	1.6-BVG	\N	\N	\N
512	506	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:22.670208		\N	\N	\N
514	508	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:22.961229		\N	\N	\N
516	510	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:23.252656		\N	\N	\N
518	512	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:23.543029		\N	\N	\N
520	514	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:23.834307		\N	\N	\N
522	516	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:24.125719		\N	\N	\N
524	518	AUDI	A4 - V6 - 2.8	668907 - G	عسلي فاتح	\N	\N	2025-09-01 12:24:24.437034	AHA	WAUEH24B8YN002144	\N	\N
526	520	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:24.731377		\N	\N	\N
528	522	VW	GOLF6	461782-حمص	ابيض	2011	\N	2025-09-01 12:24:25.02209	1.4TSI-CAX	WVWZZZ1KZBW000140	\N	\N
530	524	VW	PASSAT B6	933855-دمشق	اسود	2007	\N	2025-09-01 12:24:25.314005	2.0FSI-BVZ	WVWZZZ3CZ7P072377	\N	\N
532	526	اودي	A4	659934-دمشق	اسود	2006	\N	2025-09-01 12:24:25.60515	2.0-ALT	WAUAS78E46A003054	\N	\N
534	528	SKODA	OCTAVIA	حمص - 592983	أبيض	2008	\N	2025-09-01 12:24:25.896081	BSF	TMBBA41Z682048550	\N	\N
536	530	AUDI	Q7	520-3600	أسود	2014	\N	2025-09-01 12:24:26.190553	CTW	WA1LGAFE6ED010351	\N	\N
538	532	SKODA	OCTAVIA	868997 - دمشق	أسود	2008	\N	2025-09-01 12:24:26.481077	BSF	TMBBA41Z282014881	\N	\N
540	534	SKODA	OCTAVIA	851768 - حمص	أبيض	2007	\N	2025-09-01 12:24:26.772401	AEH	TMBDK41U878851351	\N	\N
542	536	VW	PASSAT	حمص - 816533	أزرق داكن	2008	\N	2025-09-01 12:24:27.064786	BLF	WVWZZZ3CZ8P004429	\N	\N
544	538	AUDI	A7	514-1465	أسود	2012	\N	2025-09-01 12:24:27.355194	CGXB	WAUZZZ46XCN003209	\N	\N
546	540	VW	CROSS	329872-طرطوس	اسود	\N	\N	2025-09-01 12:24:27.646296		\N	\N	\N
548	542	AUDI	A8	514-8406	أبيض	2015	\N	2025-09-01 12:24:27.938281	CRE	WAUYGBFD0FN005051	\N	\N
550	544	AUDI	A4	502-3819	أبيض	2011	\N	2025-09-01 12:24:28.230617	CAEB	WAUZZZ8K8BN03703	\N	\N
552	546	SKODA	OCTAVIA	509007-دمشق	أسود	2005	\N	2025-09-01 12:24:28.522291	BSE	TMBBA41Z952102970	\N	\N
554	548	AUDI	A8	003939 - دمشق	اسود	2001	\N	2025-09-01 12:24:28.813893		WAUZZZ4DZ1N012696	\N	\N
556	550	اودي	A6	594940-حمص	فضي	2002	\N	2025-09-01 12:24:29.108324	2.4-APS  - BDV	WAUZZZ4B02N152673	\N	\N
558	552	VW	PASSAT	869806 - حلب	أخضر غامق	2004	\N	2025-09-01 12:24:29.400945	V6 3.0 - BBG	WVWDH43BX4E129094	\N	\N
560	554	VW	TOUAREG	504-2538	بني	2013	\N	2025-09-01 12:24:29.692154	CGRA	WVGBC27P8CD000092	\N	\N
562	556	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:29.983484		\N	\N	\N
564	558	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:30.276225		\N	\N	\N
566	560	AUDI	A6	524-6624	أبيض	2013	\N	2025-09-01 12:24:30.567833	2.8FSI/ CHVA	WAUBHCFC4EN031568	\N	\N
568	562	سكودا	اوكتافيا2	587529-حمص	فضي	2008	\N	2025-09-01 12:24:30.858931	1.6MPI	TMBCA41Z282243632	\N	\N
572	566	VW	PASSAT	573986	فضي	2007	\N	2025-09-01 12:24:31.443247	BVZ	WVWGM23C17E228946	\N	\N
574	568	VW	PASSAT	573988	\N	2007	\N	2025-09-01 12:24:31.734458	2.0FSI	WVWZZZ3CZ7P072202	\N	\N
576	570	VW	PASSAT B6	437075-دمشق	اسود	2007	\N	2025-09-01 12:24:32.02792	2.0FSI-BVZ	WVWZZZ3CZ6P156813	\N	\N
578	572	VW	PASSAT CC	522961 - دمشق	رمادي فاتح	2011	\N	2025-09-01 12:24:32.319386	CDAA	WVWZZZ3CZBE714874	\N	\N
580	574	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:32.612635		\N	\N	\N
582	576	اودي	Q7	336957-طرطوس	فضي	2007	\N	2025-09-01 12:24:32.902216	4.2FSI-BAR	WAUZZZ4L27D034043	\N	\N
584	578	VW	PASSAT	444355 - طرطوس	أبيض	2010	\N	2025-09-01 12:24:33.198083	CAXA	WVWZZZ3CZAP035508	\N	\N
586	580	VW	JETTA 5	936048-دمشق	ابيض	\N	\N	2025-09-01 12:24:33.48934		\N	\N	\N
588	582	SKODA	OCTAVIA	حماه - 531435	اسود	2009	\N	2025-09-01 12:24:33.781258	BSF	TMBBA41ZX92024110	\N	\N
590	584	سكودا	أوكتافيا	737207_ دمشق	\N	\N	\N	2025-09-01 12:24:34.074093		\N	\N	\N
592	586	VW	PASSAT	802837 - دمشق	أسود	2008	\N	2025-09-01 12:24:34.36544	BZB	WVWZZZ3CZ8P099739	\N	\N
1483	1477	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:34.61718		\N	\N	\N
1486	1480	VW	PASSAT B6	718198 دمشق	اسود	2009	\N	2025-09-01 12:26:34.908968	2.0TSI	WVWZZZ3CZ9P049728	\N	\N
1489	1483	MERCEDES	ML350	G144801	رمادي	2012	\N	2025-09-01 12:26:35.200321		4JGDA5HB1CA055858	\N	\N
1492	1486	اودي	A6	236999-دمشق	ابيض	2006	\N	2025-09-01 12:26:35.490792		WAUAG74F26N017754	\N	\N
1495	1489	AUDI	A6	لا يوجد	فضي	2007	\N	2025-09-01 12:26:35.781855		WAUZZZ4F07N128510	\N	\N
1498	1492	سكودا	اوكتافيا	424817-حمص	اسود	2010	\N	2025-09-01 12:26:36.072544	1.6-BSF	TMBBA41Z4A2049007	\N	\N
1501	1495	VW	PASSAT	238572-دمشق	سماوي	2006	\N	2025-09-01 12:26:36.368685	2.0FSI-BVZ	WVWZZZ3CZ6P158393	\N	\N
1504	1498	اودي	A4	733234-دمشق	رمادي	2008	\N	2025-09-01 12:26:36.659761	1.6-ALZ	WAUZZZ8E78A081261	\N	\N
1507	1501	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:36.950043		\N	\N	\N
1510	1504	SKODA	OCTAVIA	802348 - دمشق	فضي	2008	\N	2025-09-01 12:26:37.241419	BSF	TMBBA41Z682161690	\N	\N
1513	1507	VW	PASSAT B6	604116-اللاذقية	ابيض	2010	\N	2025-09-01 12:26:37.533292	CCZ	WVWZZZ3CZAP030913	\N	\N
1516	1510	VW	PASSAT B6	596265-حمص	اسود	2010	\N	2025-09-01 12:26:37.823772		WVWZZZ3CZAP029509	\N	\N
1519	1513	سكودا	اوكتافيا	756323-دمشق	ازرق	2008	\N	2025-09-01 12:26:38.114516		\N	\N	\N
1522	1516	AUDI	A6	756126 - دمشق	أسود	2010	\N	2025-09-01 12:26:38.408348	BWE	WAUZZZ4F0AN048387	\N	\N
1525	1519	SKODA	FABIA	حمص - 816804	أزرق سماوي	2004	\N	2025-09-01 12:26:38.698766		TMBHY46Y744153120	\N	\N
1528	1522	AUDI	A8L	600049 - اللاذقية	أسود	2011	\N	2025-09-01 12:26:38.989692	CDR	WAURVB4H4BN010750	\N	\N
1531	1525	AUDI	Q7	729927	فضي	2010	\N	2025-09-01 12:26:39.279812		WAUZZZ4L7AD028553	\N	\N
1534	1528	سكودا	اوكتافيا2	458109-حماة	فضي	2005	\N	2025-09-01 12:26:39.570181		TMBBA61Z152027354	\N	\N
1537	1531	VW	PASSAT	889233-دمشق	سماوي	2011	\N	2025-09-01 12:26:39.860658	2.0TSI	WVWZZZ3CZBP002840	\N	\N
1540	1534	AUDI	A6 - 2.0 TURBO	اللاذقية - 980181	اسود	2007	\N	2025-09-01 12:26:40.151382	BPJ	WAUZZZ4F57N113999	\N	\N
1543	1537	VW	PASSAT	512-5414	فضي	2015	\N	2025-09-01 12:26:40.443467	CCC	WVWCR7A37FC000587	\N	\N
1546	1540	AUDI	A7	505-3768	بني	2013	\N	2025-09-01 12:26:40.734792		WAUSGCFC8DN010269	\N	\N
1548	1542	AUDI	A4	759804	ابيض	2008	\N	2025-09-01 12:26:41.026974	BZB	WAUJC68K98A045980	\N	\N
1552	1546	VW	PASSAT	818200 - حمص	رمادي	2005	\N	2025-09-01 12:26:41.31916	BVZ	WVWZZZ3CZ5P003233	\N	\N
1555	1549	VW	GOLF R	512-9057	أبيض	2015	\N	2025-09-01 12:26:41.610358	CJXB	WVWGR2AUXFW110450	\N	\N
1557	1552	AUDI	Q7	514-6414	ذهبي	2013	\N	2025-09-01 12:26:41.900517		WA1AGDFE4DD008508	\N	\N
1560	1554	VW	PASSAT	509-3574	رمادي	2021	\N	2025-09-01 12:26:42.192225	2.5	WVWAR7A37LCO10037	\N	\N
1563	1557	VW	BORA	334427 - طرطوس	ازرق غامق	2002	\N	2025-09-01 12:26:42.481908	BFQ	WVWZZZ1JZ2W694127	\N	\N
1566	1560	AUDI	A6	511-6046	\N	2012	\N	2025-09-01 12:26:42.772754	CAEP	\N	\N	\N
1569	1563	VW	GOLF		أحمر	2004	\N	2025-09-01 12:26:43.063157	BGU	WVWZZZ1KZ4W149165	\N	\N
1572	1566	اودي	Q7	864888-دمشق	اسود	2007	\N	2025-09-01 12:26:43.35446	4.2FSI-BAR	WAUAV94L87D030152	\N	\N
1575	1569	سكودا	اوكتافيا	331608-دمشق	اسود	2006	\N	2025-09-01 12:26:43.653437		\N	\N	\N
1578	1572	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:43.943907		\N	\N	\N
1581	1575	سكودا	اوكتافيا2	603500-اللاذقية	اسود	2008	\N	2025-09-01 12:26:44.234872		TMBBA41Z882158239	\N	\N
1584	1578	VW	PASSAT	574061	كحلي	2007	\N	2025-09-01 12:26:44.528145	BVZ	WVWZZZ3CZ7E085633	\N	\N
1587	1581	VW	TOURAN	889186 -  دمشق	فضي	2006	\N	2025-09-01 12:26:44.818611	BLY	WVGZZZ1TZ6W04784	\N	\N
1590	1584	سكودا	اوكتافيا2	509007-دمشق	اسود	2005	\N	2025-09-01 12:26:45.109031	1.6MPI	TMBBA41Z952102970	\N	\N
1593	1587	VW	GOLF	458618 - حمص	ذهبي	2001	\N	2025-09-01 12:26:45.399089	AKL	WVWZZZ1JZ1W427201	\N	\N
1596	1590	سكودا	اوكتافيا	634932-حماة	اسود	2009	\N	2025-09-01 12:26:45.690546		\N	\N	\N
1599	1593	AUDI	Q7	501-3311	أسود	2022	\N	2025-09-01 12:26:45.98135		WA1ZZZF7XMD029570	\N	\N
1602	1596	سكودا	اوكتافيا	897866-دمشق	\N	2011	\N	2025-09-01 12:26:46.273855		TMBBA41ZXB2100480	\N	\N
1605	1599	AUDI	A5	13-29588	\N	2009	\N	2025-09-01 12:26:46.565083	CDNC	WAUDF68T59A050964	\N	\N
1608	1602	VW	PASSAT CC	491918-دمشق	دمشق	2009	\N	2025-09-01 12:26:46.854843	2.0TSI-CAW	WVWZZZ3CZ9E554750	\N	\N
1611	1605	اودي	A4-B7	304406-دمشق	فضي	2008	\N	2025-09-01 12:26:47.152305	1.6-ALZ	WAUZZZ8E68A051491	\N	\N
1614	1608	AUDI	Q7	511-4079	ابيض	2013	\N	2025-09-01 12:26:47.442647		\N	\N	\N
1617	1611	AUDI	A6	524-3909	أبيض	2012	\N	2025-09-01 12:26:47.734025	CGXB/3.0T	WAUZZZ4G1CN169733	\N	\N
1620	1614	AUDI	A6	508-5137	أبيض	2016	\N	2025-09-01 12:26:48.023976	CVP	WAUBHCFC6GN180518	\N	\N
1623	1617	AUDI	Q7	9090	فضي	2018	\N	2025-09-01 12:26:48.314587		\N	\N	\N
1626	1620	VW	PASSAT	241049 - دمشق	أزرق غامق	2005	\N	2025-09-01 12:26:48.606616	BVZ	WVWZZZ3CZ5P003210	\N	\N
3948	3941	AUDI	A5	999999	أزرق	2222	\N	2025-09-09 13:09:37.160118	FFF	34343434HGJHJKGIT	\N	\N
3958	3951	AUDI	Q7	529-9897	فضي	2015	\N	2025-09-21 10:38:58.119258	CTW	WA1LGAFE8FD001359	\N	\N
3963	3956	AUDI	A6	527-9091	أبيض	2012	\N	2025-09-27 07:09:07.191536	CGXB	WAUZZZ4G7CN135974	\N	\N
3965	3958	VOLKSWAGEN	Jetta	259617	أبيض	2017	\N	2025-09-28 08:28:30.358674	CPKA	3VWD07AJ26M401328	\N	\N
594	588	SKODA	OCTAVIA	868719 - دمشق	أسود	2007	\N	2025-09-01 12:24:34.657394	BSF	TMBCA41Z772155884	\N	\N
596	590	VW	JETTA	424092	أحمر	2009	\N	2025-09-01 12:24:34.948317	BSF	WVWZZZ1KZ9M156988	\N	\N
598	592	SKODA	OCTAVIA	486641 - دمشق	رمادي فاتح	2008	\N	2025-09-01 12:24:35.239152	BSE	TMBCA41Z382021732	\N	\N
600	594	VW	PASSAT CC	713598-دمشق	ذهبي	2010	\N	2025-09-01 12:24:35.530156		WVWAD23C9AE543197	\N	\N
601	596	VW	Passat	حمص - 816533	أزرق داكن	2008	\N	2025-09-01 12:24:35.823579	BLF	WVWZZZ3CZ8P004429	\N	\N
603	597	سكودا	SUPERB	899991-اللاذقية	فضي	2009	\N	2025-09-01 12:24:36.11487		\N	\N	\N
605	599	VW	PASSAT	509-9957	رمادي	2012	\N	2025-09-01 12:24:36.406995	CCZ	WVWAP13C3CE537464	\N	\N
607	601	AUDI	Q5	517-1523	\N	2012	\N	2025-09-01 12:24:36.69923	CALB	WAUCKC8R0CA072744	\N	\N
609	603	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:36.990273		\N	\N	\N
611	605	AUDI	A6	242100 - دمشق	أسود	2005	\N	2025-09-01 12:24:37.284264	BBJ	WAUZZZ4F35N125159	\N	\N
613	607	سكودا	اوكتافيا	483684-دمشق	فضي	2009	\N	2025-09-01 12:24:37.578972	BSF	TMBBA41ZX92015455	\N	\N
615	609	AUDI	Q7	37166-حلب	أبيض	2008	\N	2025-09-01 12:24:37.869035	BHK	WA1BY74L78D002678	\N	\N
617	611	AUDI	A8	591046 - دمشق	اسود	2009	\N	2025-09-01 12:24:38.160994	BDX	WAUKH54E59N011688	\N	\N
619	613	VW	PASSAT	036046 حلب	\N	2010	\N	2025-09-01 12:24:38.452649		WVWZZZ3CZ9E563549	\N	\N
621	615	VW	PASSAT B6	502085-دمشق	اسود	2008	\N	2025-09-01 12:24:38.745175	2.0FSI-BVZ	\N	\N	\N
623	617	AUDI	A6	899549	اسود	2007	\N	2025-09-01 12:24:39.036913	BWT	WAUZZZ4F77N105922	\N	\N
625	619	VW	PASSAT B6	257004-حمص	فضي	2008	\N	2025-09-01 12:24:39.32819	2.0TFSI/BVY	WVWZZZ3CZ8P004420	\N	\N
627	621	VW	PASSAT	888912دمشق-حلب517750	فضي	2006	\N	2025-09-01 12:24:39.619879	2.0FSI-BVZ	WVWZZZ3CZ6P173162	\N	\N
629	623	VW	JETTA	507-5869	فضي	2019	\N	2025-09-01 12:24:39.91401	DGXA	3VMC57BUSKM028297	\N	\N
631	625	VW	TOUAREG	997774-دمشق	اسود	2005	\N	2025-09-01 12:24:40.205987	3.2-BRJ	WVGZZZ7LZ5D084436	\N	\N
633	627	فوكس فاكن	GOLF	671671 اللاذقية	أسود	2005	\N	2025-09-01 12:24:40.49733	BSF	WVWZZZ1KZ5W572763	\N	\N
635	629	SKODA	OCTAVIA	946503 - دمشق	أبيض	2001	\N	2025-09-01 12:24:40.788562	AEH	TMBBK41U312519173	\N	\N
637	631	أودي	Q7-4L	212710-دمشق	اسود	2010	\N	2025-09-01 12:24:41.080146	3.6FSI-BHK	WAUAYD4L1AD004381	\N	\N
639	633	غير محدد	غير محدد	508-2911	نيلي	2019	\N	2025-09-01 12:24:41.371613	CDVC	1V2ER2CA4JC518185	\N	\N
641	635	VW	Passat	718198 - دمشق	اسود	2009	\N	2025-09-01 12:24:41.66289	2.0 TSi	WVWZZZ3CZ9P049728	\N	\N
643	637	AUDI	A4	508-5967	ابيض	2011	\N	2025-09-01 12:24:41.95572	CAE	WAUZZZ8K8BN056925	\N	\N
645	639	AUDI	A4	509-2570	ابيض	2010	\N	2025-09-01 12:24:42.247257	CAE	WAUZZZ8KXAN054477	\N	\N
647	641	AUDI	A6	510-4610	فضي	2011	\N	2025-09-01 12:24:42.538512	3	WAUZZZ4F3BN032217	\N	\N
649	643	AUDI	Q7	58420-حلب	فضي	2007	\N	2025-09-01 12:24:42.829799	BUG	WAUZZZ4L97D032497	\N	\N
651	645	AUDI	A4		اسود	2006	\N	2025-09-01 12:24:43.121539	ALT	WAUAS78E6A003054	\N	\N
653	647	اودي	A4	233588-دمشق	BLACK	2007	\N	2025-09-01 12:24:43.412417	ALZ-1.6	WAUZZZ8E07A191258	\N	\N
655	649	AUDI	A6	510-7058	ابيض	2014	\N	2025-09-01 12:24:43.7037	CTUA	WAUZZZ4G5EN046083	\N	\N
657	651	AUDI	A6	507-4621	رمادي	2014	\N	2025-09-01 12:24:43.999298	CTUA	WAUZZZ4G9EN028914	\N	\N
659	653	VW	PASSAT	509-7552	دهبي	2017	\N	2025-09-01 12:24:44.293902	CCC	WVWCR7A31GC000828	\N	\N
661	655	سكودا	اوكتافيا	854333-حمص	سماوي	2005	\N	2025-09-01 12:24:44.586545	1.6-BSF	TMBCA11Z852102767	\N	\N
663	657	SKODA	OCTAVIA	622145-حماة	فضي	2009	\N	2025-09-01 12:24:44.877028	BSE	TMBBA61Z39C000012	\N	\N
665	659	اودي	A6	014150-دمشق	اسود	2009	\N	2025-09-01 12:24:45.168673	3.2FSI-AUK	WAUZZZ4F49N001505	\N	\N
667	661	AUDI	Q7	501-2324	ابيض	2011	\N	2025-09-01 12:24:45.463678	CJTC	WAUAGD4L0BD035576	\N	\N
669	663	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:45.755883		\N	\N	\N
671	665	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:46.048018		\N	\N	\N
673	667	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:46.339382		\N	\N	\N
675	669	اودي	A4	317866-دمشق	اسود	2006	\N	2025-09-01 12:24:46.631158	1.6-ALZ	WAUZZZ8E56A154446	\N	\N
677	671	أودي	Q7-4L	873099-دمشق	أبيض	2007	\N	2025-09-01 12:24:46.922495	4.2FSI-BAR	WAUAV94L27D005733	\N	\N
679	673	VW	PASSAT B6	701938-دمشق	ازرق	2006	\N	2025-09-01 12:24:47.215907	1.6-BSF	WVWZZZ3CZ6P160508	\N	\N
681	675	VW	SUPERB	143733-دمشق	\N	2011	\N	2025-09-01 12:24:47.507944		\N	\N	\N
683	677	اودي	A6	342611-دمشق	ابيض	2006	\N	2025-09-01 12:24:47.799458	3.2-AUK	WAUAG74F66N017580	\N	\N
685	679	VW	PASSAT	962861-دمشق	ابيض	2007	\N	2025-09-01 12:24:48.0911	2.0FSI-BVZ	WVWZZZ3CZ7P108694	\N	\N
687	681	سكودا	اوكتافيا	693350 - دمشق	أزرق سماوي	2011	\N	2025-09-01 12:24:48.382482	BSF	TMBCA41Z8B2105830	\N	\N
689	683	AUDI	A4	27812 - دمشق	اسود	2002	\N	2025-09-01 12:24:48.672925		WAUZZZ8E32A314298	\N	\N
691	685	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:48.963611		\N	\N	\N
693	687	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:49.255272		\N	\N	\N
695	689	AUDI	A6	دمشق - 434333	ذهبي	2006	\N	2025-09-01 12:24:49.546227	2.4-BDW	WAUZZZ4F26N167436	\N	\N
697	691	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:49.836752		\N	\N	\N
699	693	AUDI	A7	512-2156	ابيض	2013	\N	2025-09-01 12:24:50.127601	CGWD	WAUSGCFCXDN041555	\N	\N
701	695	SKODA	FABIA	حمص - 525972	احمر	2010	\N	2025-09-01 12:24:50.418602	BTS	TMBBD45J2A3177459	\N	\N
703	697	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:50.709239		\N	\N	\N
705	699	SKODA	OCTAVIA	851858	اسود	2006	\N	2025-09-01 12:24:51.001736	BSE	TMBBA61Z062225473	\N	\N
707	701	سكودا	اوكتافيا	458716-حماة	رمادي	\N	\N	2025-09-01 12:24:51.294367		\N	\N	\N
709	703	AUDI	A6	98843	ابيض	2010	\N	2025-09-01 12:24:51.585124	AUK	WAUZZZUF0AN051886	\N	\N
711	705	VW	PASSAT B6	445007-طرطوس	أسود	2006	\N	2025-09-01 12:24:51.875864	2.0FSI-BVZ	WVWZZZ3CZ6P227022	\N	\N
713	707	AUDI	Q7	506-5826	ابيض	2013	\N	2025-09-01 12:24:52.166775	CJTC	WA1AGDFE0ED003579	\N	\N
715	709	سكودا	اوكتافيا تور	220889-دمشق	اسود	2004	\N	2025-09-01 12:24:52.457236		TMBGL21U842874027	\N	\N
717	711	VW	JETTA5	747363-دمشق	رمادي	2008	\N	2025-09-01 12:24:52.747397	1.6MPI	WVWSU11K38M059230	\N	\N
719	713	VW	PASSAT CC	713598-دمشق	ذهبي معتم	2010	\N	2025-09-01 12:24:53.038116	BWS	WVWAD23C9AE543197	\N	\N
721	715	اودي	A4	678548-دمشق	فضي	2007	\N	2025-09-01 12:24:53.328692	ALT	WAUZZZ8E27A105724	\N	\N
723	717	VW	GOLF5	849500-حمص	رمادي	2006	\N	2025-09-01 12:24:53.619855	1.6-BSF	WVWZZZ1KZ6W203505	\N	\N
725	719	اودي	Q5	563500-دمشق	فضي	2011	\N	2025-09-01 12:24:53.911373		WAUZZZ8R6BA031851	\N	\N
727	721	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:24:54.201745		\N	\N	\N
730	724	AUDI	Q7	حلب-038854	اسود	2009	\N	2025-09-01 12:24:54.783853		WAUAY54L39D021166	\N	\N
732	726	AUDI	A8	514-8927	اسود	2014	\N	2025-09-01 12:24:55.074815	CEUA	WAUZZZ4H2EN008657	\N	\N
734	728	اودي	Q5	483658-دمشق	اسود	2009	\N	2025-09-01 12:24:55.365587		WAUKF68R79A027908	\N	\N
736	730	اودي	A4	211113-دمشق	اسود	2011	\N	2025-09-01 12:24:55.65656		WAUZZZ8K9BA160010	\N	\N
738	732	اودي	S5	721010-دمشق	اسود	2010	\N	2025-09-01 12:24:55.947762		WAUAFB8F1AN011985	\N	\N
740	734	AUDI	Q7	015442-دمشق	اسود	2009	\N	2025-09-01 12:24:56.239103	3.6FSI	WAUAY54L49D006868	\N	\N
742	736	VW	PASSAT B6	346428-دمشق	اسود	2010	\N	2025-09-01 12:24:56.531581	2.0FSI-BVZ	WVWZZZ3CZAP027685	\N	\N
744	738	اودي	A6	888595-دمشق	فضي	2007	\N	2025-09-01 12:24:56.823898	2.4-BDW	WAUZZZ4F07N034739	\N	\N
746	740	سكودا	أوكتافيا2	441990-دمشق	فضي	2006	\N	2025-09-01 12:24:57.114702	1.6MPI-BSF	TMBBA41Z862272884	\N	\N
748	742	SKODA	OCTAVIA	868468  - دمشق	أسود	2007	\N	2025-09-01 12:24:57.404733	BFQ	TMBDA41Z772025205	\N	\N
750	744	VW	TOURAN	242407 - دمشق	رمادي	2006	\N	2025-09-01 12:24:57.696998	BLY	WVGZZZ1TZ6W043263	\N	\N
752	746	سكودا	اوكتافيا	461151-حمص	\N	2005	\N	2025-09-01 12:24:57.989075		TMBBB61ZX52086013	\N	\N
754	748	سكودا	SUPERB	898227-دمشق	خمري	2003	\N	2025-09-01 12:24:58.280684		TMBBT63U339030790	\N	\N
756	750	اودي	A6	964900-دمشق	زيتي	2000	\N	2025-09-01 12:24:58.572233	AQD  -   2.8-AMX	WAUZZZ4BZYN084699	\N	\N
758	752	VW	PASSAT	888748-طرطوس	فضي	2006	\N	2025-09-01 12:24:58.863404	2.0TFSI-BWA	WVWZZZ3CZ6P157341	\N	\N
760	754	اودي	A6-C5	682965-دمشق	كحلي	2002	\N	2025-09-01 12:24:59.15509		WAUZZZ4BX2N152674	\N	\N
762	756	VW	GOLF4	148705-دمشق	GOLD	2001	\N	2025-09-01 12:24:59.446535	1.6/AKL	WVWZZZ1JZ1W478932	\N	\N
764	758	AUDI	A4	583450	اسود	2011	\N	2025-09-01 12:24:59.737492	CDH	WAUZZZ8K0BA092390	\N	\N
766	760	VW	CC	710279 - دمشق	رمادي فاتح	2009	\N	2025-09-01 12:25:00.02993	CAW	WVWZZZ3CZ9E534201	\N	\N
768	762	سكودا	اوكتافيا	634262-حماة	فضي	2006	\N	2025-09-01 12:25:00.320898	1.6MPI	TMBDA41Z062150237	\N	\N
770	764	SKODA	OCTAVIA	946423 - دمشق	أزرق	2007	\N	2025-09-01 12:25:00.612507	BSF	TMBCA11Z772100902	\N	\N
772	766	سكودا	اوكتافيا	605093-ريف دمشق	ابيض	2006	\N	2025-09-01 12:25:00.903683		TMBCA11Z062181837	\N	\N
774	768	VW	PASSAT	665195  -  دمشق	اسود	2010	\N	2025-09-01 12:25:01.194946	BSF	WVWZZZ3CZAP029586	\N	\N
776	770	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:01.535562		\N	\N	\N
778	772	VW	PASSAT B6	889233-دمشق	سماوي	2011	\N	2025-09-01 12:25:01.826825	1.4TSI	WVWZZZ3CZBP002840	\N	\N
780	774	AUDI	Q5	504-8428	فضي	2012	\N	2025-09-01 12:25:02.118623	CALB/3200	WAUCKC8R8CA085547	\N	\N
782	776	VW	PASSAT	007923 دمشق	اسود	2006	\N	2025-09-01 12:25:02.409678	FSI 2.0	WVWBM23C56P189162	\N	\N
784	778	AUDI	A6	04140 -حلب	نيلي	2011	\N	2025-09-01 12:25:02.701822	CCAA	WAUZZZ4F7BN059601	\N	\N
786	780	SKODA	SUUPERB	334005 - دمشق	بني فاتح جدا	2009	\N	2025-09-01 12:25:02.998582	CDAA	TMBAB43T9B9030530	\N	\N
788	782	VW	PASSAT B6	دمشق-478443	بني موكا	2006	\N	2025-09-01 12:25:03.301048	2.0FSI-BVZ	WVWDM13CX6P178080	\N	\N
790	784	AUDI	A6	501-8698	أسود	2011	\N	2025-09-01 12:25:03.59092	BPJ	WAVAFC4F2BN009000	\N	\N
792	786	VW	PASSAT	513-6306	فضي	2014	\N	2025-09-01 12:25:03.881006		\N	\N	\N
794	788	سكودا	اوكتافيا2	261798-طرطوس	اسود	2007	\N	2025-09-01 12:25:04.172158	1.6MPI	TMBDA41Z672123349	\N	\N
894	888	AUDI	Q7	502-7432	أحمر	2013	\N	2025-09-01 12:25:18.764985	TFSI3.0/CJTC	WA1AGDFE9DD005653	\N	\N
798	792	AUDI	A8	506-2469	فضي	2011	\N	2025-09-01 12:25:04.755251	CGWA	WAURGB4H2BN016749	\N	\N
800	794	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:05.046704		\N	\N	\N
802	796	اودي	A6-C6	670191-دمشق	اسود	2010	\N	2025-09-01 12:25:05.338342	2.0TFSI-BPJ	WAUZZZ4F4AN048473	\N	\N
804	798	VW	PASSAT	222320-دمشق	بني	2007	\N	2025-09-01 12:25:05.634501	2.0TFSI-BWA	WVWZZZ3CZ7P057350	\N	\N
806	800	VW	SCIROCCO	719257-دمشق	فضي	2010	\N	2025-09-01 12:25:05.927475	2.0TSI	WVWZZZ13ZAV439385	\N	\N
808	802	AUDI	A4	586517 - دمشق	أسود	2010	\N	2025-09-01 12:25:06.219512	CDH	WAUJC68KXAA003260	\N	\N
810	804	اودي	A4	947507-مشق	اسود	2002	\N	2025-09-01 12:25:06.511337	2.0T-BPJ	WAUZZZ8E22A314700	\N	\N
812	806	AUDI	Q7	512-5017	ابيض	2014	\N	2025-09-01 12:25:06.802995	CJT	WA1AGDFE8FD000317	\N	\N
814	808	VW	Passat	590604 - حمص	فضي	2010	\N	2025-09-01 12:25:07.094224	BSF	WVWZZZ3CZAP030170	\N	\N
816	810	VW	TIGUAN	506-5808	فضي	2021	\N	2025-09-01 12:25:07.384922	DG4	3VV3B7AX5LM129639	\N	\N
818	812	skoda	octavia	479403 - دمشق	اسود	2008	\N	2025-09-01 12:25:07.680719	BSF	TMBBA41Z982048557	\N	\N
820	814	AUDI	A4	دمشق - 244728	رمادي غامق	2005	\N	2025-09-01 12:25:07.97245	BFS	WAUZZZ8E45A579610	\N	\N
822	816	سكودا	أوكتافيا	351289 - دمشق	أسود	2010	\N	2025-09-01 12:25:08.264562	BSF1.6	TMBBA41Z0A2075572	\N	\N
824	818	AUDI	A8	517-1341	أسود	2012	\N	2025-09-01 12:25:08.557803	CDRA	WAUZZZ4OCNO11361	\N	\N
826	820	VW	غير محدد	998713-دمشق	اسود	2009	\N	2025-09-01 12:25:08.848033		\N	\N	\N
828	822	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:09.1405		\N	\N	\N
830	824	skoda	octavia 2	592527	ازرق	2007	\N	2025-09-01 12:25:09.433973		TMBBA41Z872038990	\N	\N
832	826	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:09.725537		\N	\N	\N
834	828	AUDI	A6	979822 - دمشق	ذهبي	2006	\N	2025-09-01 12:25:10.016493	BDW	WAUAE74F86N015237	\N	\N
836	830	AUDI	A3	508-6659	أبيض	2016	\N	2025-09-01 12:25:10.307833	CZC	WAUAYJFF3G1000770	\N	\N
838	832	AUDI	A4	934386 - دمشق	اسود	2007	\N	2025-09-01 12:25:10.599829	ALZ	WAUZZZ8E67A183116	\N	\N
842	836	سكودا	اوكتافيا	493675 دمشق	أبيض	2009	\N	2025-09-01 12:25:11.181394	1.6MPI	TMBBA41Z492026435	\N	\N
844	838	اودي	A4	678548-دمشق	فضي	2007	\N	2025-09-01 12:25:11.472804		WAUZZZ8E27A105724	\N	\N
846	840	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:11.764069		\N	\N	\N
848	842	AUDI	A7	508-4565	أسود	2016	\N	2025-09-01 12:25:12.055314	CREC	WAUSGCFC1GN012952	\N	\N
850	844	AUDI	A6	344011- دمشق	أبيض	2013	\N	2025-09-01 12:25:12.34855	CDNB	WAUZZZ4G5DN002535	\N	\N
852	846	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:12.639777		\N	\N	\N
854	848	VW	PASSAT	666437-طرطوس	رصاصي	2006	\N	2025-09-01 12:25:12.931852	2.0FSI-BVZ	WVWZZZ3CZ9P055474	\N	\N
856	850	AUDI	A6	344691 - دمشق	اسود	2008	\N	2025-09-01 12:25:13.222646	BDW	WAUZZZ4F58N029473	\N	\N
858	852	سكودا	أوكتافيا1	698373-دمشق	فضي	2007	\N	2025-09-01 12:25:13.514018	1.6MPI	TMBDX41U978881749	\N	\N
860	854	VW	SCIROCCO	711816	رمادي	2010	\N	2025-09-01 12:25:13.80555		WVWZZZ13ZAV428031	\N	\N
862	856	PASSAT	CC	506-8803	كحلي	2011	\N	2025-09-01 12:25:14.099478	CDA	WVWAB13C5BE744189	\N	\N
864	858	AUDI	A6	524-9966	اسود	2020	\N	2025-09-01 12:25:14.392575	DKY	WAUZZZF2XLN069969	\N	\N
866	860	AUDI	Q5	517-4459	أسود	2014	\N	2025-09-01 12:25:14.683928	CTVA-3.0	WALCGCFP3EA054273	\N	\N
868	862	AUDI	A8 L	005295 - دمشق	أزرق غامق	2008	\N	2025-09-01 12:25:14.97462	3.2 FSI	WAUKH54E48N005265	\N	\N
870	864	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:15.266753		\N	\N	\N
872	866	سكودا	اوكتافيا	533088-حماة	فضي	2005	\N	2025-09-01 12:25:15.55844	1.6-BSF	TMBCA11Z652102752	\N	\N
874	868	VW	PASSAT B6	456602-حماة	اسود	2006	\N	2025-09-01 12:25:15.849464		WVWZZZ3CZ6E068081	\N	\N
876	870	AUDI	A6	508-5286	ابيض	2010	\N	2025-09-01 12:25:16.143073		WAUZZZ4F6AN069633	\N	\N
878	872	AUDI	Q7	506-7547	ابيض	2013	\N	2025-09-01 12:25:16.434329		WA1AGDFE2DD008880	\N	\N
880	874	VW	PASSAT B6	672035-دمشق	فضي	2009	\N	2025-09-01 12:25:16.72572		\N	\N	\N
882	876	VW	PASSAT	790440-حماة	فضي	2006	\N	2025-09-01 12:25:17.015888		\N	\N	\N
884	878	فوكس فاغن	غولف	815960	فضي	2006	\N	2025-09-01 12:25:17.307131	Bsf	WVWZZZ1KZ6W000141	\N	\N
886	880	VW	PASSAT B6	405533-حمص	بني	2010	\N	2025-09-01 12:25:17.598993	1.4TSI-CAX	WVWZZZ3CZAP000452	\N	\N
888	882	VW	GOLF5	816161-حمص	ازرق	2006	\N	2025-09-01 12:25:17.890733	1.6MPI	WVWZZZ1KZ6B074761	\N	\N
890	884	اودي	Q5	643655-دمشق	احمر	2011	\N	2025-09-01 12:25:18.183749	2.0TFSI-BPJ	WAUZZZ8R8BA080033	\N	\N
892	886	AUDI	A8L	524-6344	أبيض	2015	\N	2025-09-01 12:25:18.475117	CREA	WAUYGBFD2FN005438	\N	\N
896	890	VW	JETTA 5	850122-حمص	فضي	2007	\N	2025-09-01 12:25:19.056479	1.6-BSF	WVWZZZ1KZ7M018356	\N	\N
898	892	AUDI	Q7	507-9796	كحلي	2014	\N	2025-09-01 12:25:19.347506	CJT	WA1AGDFE6ED000413	\N	\N
900	894	AUDI	S4	697889- دمشق	أسود	2009	\N	2025-09-01 12:25:19.638257		WAUACC8K3AN018402	\N	\N
902	896	VW	CC		\N	2013	\N	2025-09-01 12:25:19.928989		WVWAB1ANXDE535635	\N	\N
904	898	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:20.220092		\N	\N	\N
906	900	AUDI	A4	024454 - دمشق	رصاصي	2002	\N	2025-09-01 12:25:20.511787	ALT	WAUZZZ8E72A137464	\N	\N
908	902	سكودا	اوكتافيا2	334242-طرطوس	ازرق	2009	\N	2025-09-01 12:25:20.80326		TMBBA41Z992024230	\N	\N
910	904	تويوتا	كورولا	688852-دمشق	اسود	\N	\N	2025-09-01 12:25:21.09301		\N	\N	\N
912	906	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:21.384509		\N	\N	\N
914	908	VW	PASSAT	505-7231	فضي	2021	\N	2025-09-01 12:25:21.675813	CBU/2.5	WVWAR7A30LC000482	\N	\N
916	910	اودي	A6	793885-دمشق	فضي	2008	\N	2025-09-01 12:25:21.96981	2.4-BDW	WAUZZZ4F08N029395	\N	\N
920	914	skoda	octavia	261136 - طرطوس	أبيض	2008	\N	2025-09-01 12:25:22.551981	BSF	TMBBA41Z182083481	\N	\N
922	916	اودي	A6	711677-دمشق	ابيض	2010	\N	2025-09-01 12:25:22.844611	2.0TFSI	WAUZZZ4F3AN042437	\N	\N
943	937	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:26.172599		\N	\N	\N
945	939	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:26.467186		\N	\N	\N
947	941	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:26.763084		\N	\N	\N
950	943	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:27.059033		\N	\N	\N
952	946	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:27.357249		\N	\N	\N
954	948	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:27.651096		\N	\N	\N
956	950	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:27.941364		\N	\N	\N
958	952	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:28.324242		\N	\N	\N
960	954	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:28.616994		\N	\N	\N
962	956	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:28.906413		\N	\N	\N
964	958	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:29.196692		\N	\N	\N
966	960	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:29.486585		\N	\N	\N
968	962	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:29.778282		\N	\N	\N
970	964	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:30.066264		\N	\N	\N
972	966	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:30.356393		\N	\N	\N
974	968	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:30.651751		\N	\N	\N
924	918	سكودا	اوكتافيا	678030-اللاذقية	ذهبي	2006	\N	2025-09-01 12:25:23.135595	1.6MPI-BSF	TMBBA41Z562214232	\N	\N
926	920	اودي	A8-D3	777791-ريف دمشق	اسود	2009	\N	2025-09-01 12:25:23.432288	4.2FSI-BAR	WAUMV54EX9N007489	\N	\N
927	921	سكودا	اوكتافيا	307836 - طرطوس	أزرق سماوي	2011	\N	2025-09-01 12:25:23.724624	BSF	TMBBA41Z8B2056818	\N	\N
929	923	SKODA	OCTAVIA	851420 - حمص	ذهبي	2006	\N	2025-09-01 12:25:24.015008	BSE	TMBBA61Z862213331	\N	\N
931	925	AUDI	Q7	520-8677	أسود	2015	\N	2025-09-01 12:25:24.305885	30 TFSI	WA1LGAFE8FD009218	\N	\N
933	927	AUDI	A6	453864-طرطوس	اسود	2014	\N	2025-09-01 12:25:24.598323	BDW	WAUAE64F28N024657	\N	\N
935	929	VW	PASSAT	336533-دمشق	اسود	2010	\N	2025-09-01 12:25:24.889143		WVWZZZ3CZAP029697	\N	\N
938	932	VW	PASSAT STATION	144958-دمشق	ابيض	2010	\N	2025-09-01 12:25:25.305863		WVWZZZ3CZAE003098	\N	\N
940	934	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:25.596465		\N	\N	\N
942	936	AUDI	Q7	47222 -حلب	أزرق	2008	\N	2025-09-01 12:25:25.895876	3.0TDI	WAUZZZ4L87D075499	\N	\N
944	938	اودي	A6	269505-دمشق	فضي	2006	\N	2025-09-01 12:25:26.185961	3.2FSI	WAUDH74F26N109652	\N	\N
946	940	PORSCHE	كيان	501-8742	رمادي	2008	\N	2025-09-01 12:25:26.476437	4.8	WP1ZZZQPZ8LA32398	\N	\N
948	942	VW	PASSAT	510-1688	دهبي	2012	\N	2025-09-01 12:25:26.767829	CDA	WVWAB13C1CE539339	\N	\N
949	944	AUDI	Q7	510-1398	اسود	2015	\N	2025-09-01 12:25:27.0572	CJTC	WA1AGDFE6ED006857	\N	\N
951	945	AUDI	A3	517-2211	فضي	2016	\N	2025-09-01 12:25:27.347074	CJSA	WAUACJFF0G1002913	\N	\N
953	947	اودي	A6	416060-حمص	اسود	2007	\N	2025-09-01 12:25:27.638706	3.0T-CAJ	WAUZZZ4F17N022776	\N	\N
955	949	AUDI	Q7	512-6474	أبيض	2016	\N	2025-09-01 12:25:27.935636	CREC	WA1AGDF71GD000758	\N	\N
957	951	VW	GOLF 6 GTI	102851-دمشق	حديدي	2010	\N	2025-09-01 12:25:28.227914	2.0TSI	WVWZZZ1KZAW275890	\N	\N
959	953	SKODA	OCTAVIA	434775 - دمشق	ذهبي	2006	\N	2025-09-01 12:25:28.519287	BVY	TMBBD41Z962134150	\N	\N
961	955	VW	PASSAT CC	003531 - دمشق	أزرق داكن	2010	\N	2025-09-01 12:25:28.812128	BZB	WVWZZZ3CZAE503925	\N	\N
963	957	VW	TOUAREG	517-6441	أسود	2013	\N	2025-09-01 12:25:29.103738	CGRA	WVGBC2BP0DD000189	\N	\N
965	959	سكودا	اوكتافيا2	765086-دمشق	فضي	2008	\N	2025-09-01 12:25:29.395411	1.6MPI	TMBDK41UX88840868	\N	\N
967	961	VW	PASSAT B6	938808-دمشق	اسود	2006	\N	2025-09-01 12:25:29.686374	2.0FSI-BVZ	WVWZZZ3CZ6P227007	\N	\N
969	963	اودي	A6	015639-دمشق	اسود	2010	\N	2025-09-01 12:25:29.985491	3.0T-CAJ	WAUBGC4FXAN067534	\N	\N
971	965	AUDI	A6	793005 - دمشق	أسود	2009	\N	2025-09-01 12:25:30.278613	BDW	WAUZZZ4F09N000593	\N	\N
973	967	AUDI	A7	509-4231	أبيض	2013	\N	2025-09-01 12:25:30.570449	CGWB	WAUS0C46XDN000879	\N	\N
975	969	AUDI	Q5	513-5835	رمادي غامق	2015	\N	2025-09-01 12:25:30.860788	2.0 CNCD	WA1CFCFP9FA000867	\N	\N
977	971	اودي	Q7-4L	148000-دمشق	فضي	2011	\N	2025-09-01 12:25:31.154415	3.0T-CJT	WAUZZZ4L4BD025885	\N	\N
979	973	سكودا	اكتافيا	809611-دمشق	رمادي	2008	\N	2025-09-01 12:25:31.445249	2.0TFSI-BWA	TMBCA41Z582202072	\N	\N
981	975	VW	TIGUAN	523-2622	أبيض	2017	\N	2025-09-01 12:25:31.737031	DTEA	3VVCB7AXXRM100825	\N	\N
983	977	AUDI	A6	لايوجد نمرة	فضي	2006	\N	2025-09-01 12:25:32.029285	2.4/BDW	WAUZZZ4F06N052592	\N	\N
985	979	VW	JETTA	508-4135	رمادي	2021	\N	2025-09-01 12:25:32.320316	DGX-1.4TSI	3VWC57BU9KM004040	\N	\N
987	981	VW	GETTA	509-8717	اسود	2021	\N	2025-09-01 12:25:32.610878	DGX-1.4TSI	3VWC57BU6KM176426	\N	\N
989	983	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:32.902908		\N	\N	\N
991	985	VW	PASSAT B6	303029-حماة	اسود	2008	\N	2025-09-01 12:25:33.194346	2.0FSI-BVZ	\N	\N	\N
993	987	اودي	A4	233588-دمشق	BLACK	2007	\N	2025-09-01 12:25:33.485633	ALZ-1.6	WAUZZZ8E07A191258	\N	\N
995	989	VW	JETTA	419643-حمص	فضي	2009	\N	2025-09-01 12:25:33.776165	1.6BSF	WVWZZZ1KZ9M143691	\N	\N
997	991	VW	شيروكو	716483 - دمشق	أبيض	2010	\N	2025-09-01 12:25:34.06721	CAVD	WVWZZZ13ZAV439054	\N	\N
999	993	اودي	A4	897794-دمشق	خمري	2002	\N	2025-09-01 12:25:34.360652	BFB	WAUZZZ8E62A314618	\N	\N
976	970	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:30.943917		\N	\N	\N
978	972	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:31.239109		\N	\N	\N
980	974	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:31.526896		\N	\N	\N
982	976	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:31.816323		\N	\N	\N
984	978	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:32.106892		\N	\N	\N
986	980	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:32.402723		\N	\N	\N
988	982	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:32.692927		\N	\N	\N
990	984	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:32.984329		\N	\N	\N
992	986	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:33.278325		\N	\N	\N
994	988	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:33.57814		\N	\N	\N
996	990	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:33.869516		\N	\N	\N
998	992	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:34.167573		\N	\N	\N
1000	994	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:34.461719		\N	\N	\N
1001	995	VW	PASSAT	269031-دمشق	ازرق	2006	\N	2025-09-01 12:25:34.652501	2.0TFSI-BWA	WVWZZZ3CZ6P210306	\N	\N
1002	996	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:34.752189		\N	\N	\N
1003	997	اودي	A8	606182-ريف دمشق	اسود	2007	\N	2025-09-01 12:25:34.943256	6.0-BHT	WAUZZZ4E17N024132	\N	\N
1004	998	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:35.054345		\N	\N	\N
1005	999	skoda	octavia	طرطوس - 312530	أبيض	2010	\N	2025-09-01 12:25:35.234177	BFQ	TMBDX41U9A8846331	\N	\N
1006	1000	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:35.345161		\N	\N	\N
1007	1001	سكودا	اوكتافيا	240610-حلب	سماوي	2006	\N	2025-09-01 12:25:35.525173	1.6MPI	TMBDA41Z862222074	\N	\N
1008	1002	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:35.633883		\N	\N	\N
1009	1003	VW	PASSAT CC	010161-دمشق	ذهبي	2010	\N	2025-09-01 12:25:35.864571	2.0TSI	WVWZZZ3CZAE549309	\N	\N
1010	1004	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:35.925317		\N	\N	\N
1011	1005	اودي	A4	898938-دمشق	فضي	2009	\N	2025-09-01 12:25:36.155558	CDH	WAUZZZ8K09A099303	\N	\N
1012	1006	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:36.216569		\N	\N	\N
1013	1007	AUDI	Q7	510-5208	فضي	2009	\N	2025-09-01 12:25:36.450058	CAS	WAUZZZ4L09D022394	\N	\N
1014	1008	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:36.510247		\N	\N	\N
1015	1009	اودي	A6	680670-دمشق	فضي	2010	\N	2025-09-01 12:25:36.742078	BPJ	WAUAFC4FXAN044799	\N	\N
1016	1010	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:36.804712		\N	\N	\N
1017	1011	VW	PASSAT CC	509-1537	اسود	2016	\N	2025-09-01 12:25:37.034613	CCZ	WVWAP1AN6GE506798	\N	\N
1018	1012	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:37.10221		\N	\N	\N
1019	1013	AUDI	Q5	516-6291	ابيض	2015	\N	2025-09-01 12:25:37.324642	CNC	WALCFCFP5FA007847	\N	\N
1020	1014	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:37.392656		\N	\N	\N
1021	1015	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:37.615493		\N	\N	\N
1022	1016	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:37.685953		\N	\N	\N
1023	1017	VW	PASSAT B6	586216-حمص	فضي	2006	\N	2025-09-01 12:25:37.90603	2.0TFSI-BWA	WVWZZZ3CZ6P128165	\N	\N
1024	1018	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:37.980446		\N	\N	\N
1026	1020	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:38.272085		\N	\N	\N
1027	1021	VW	PASSAT	516-7820	رمادي	2014	\N	2025-09-01 12:25:38.487092	CPKA 1.8	1VWAS7A38EC064077	\N	\N
1028	1022	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:38.568568		\N	\N	\N
1029	1023	VW	PASSAT	732132-دمشق	رمادي	2009	\N	2025-09-01 12:25:38.781059		WVWZZZ3CZ9P055192	\N	\N
1030	1024	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:38.864028		\N	\N	\N
1031	1025	VW	PASSAT B6	702297-دمشق	ذهبي	2006	\N	2025-09-01 12:25:39.073552	2.0FSI-BVZ	WVWZZZ3CZ6P123823	\N	\N
1032	1026	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:39.190558		\N	\N	\N
1033	1027	VW	PASSAT B6	677755-دمشق	فضي	2006	\N	2025-09-01 12:25:39.365143	3.6-BLV	WVWZZZ3CZ6P023315	\N	\N
1034	1028	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:39.487018		\N	\N	\N
1035	1029	AUDI	A5	47401- تجربة ادلب	أسود	2011	\N	2025-09-01 12:25:39.656146	CDNC	WAUZZZ8T9BA079808	\N	\N
1036	1030	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:39.776338		\N	\N	\N
1037	1031	VW	PASSAT CC	510-6327	نيلي	2011	\N	2025-09-01 12:25:39.946027	CFGB	WVWZZZ3CZBE740693	\N	\N
1038	1032	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:40.06591		\N	\N	\N
1039	1033	AUDI	Q7	511-2161	أبيض	2014	\N	2025-09-01 12:25:40.238426	3.0TFSI/ 4LO	WAIAGDFEOED000066	\N	\N
1040	1034	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:40.364685		\N	\N	\N
1041	1035	VW	PASSAT B6	508360-دمشق	اسود	2010	\N	2025-09-01 12:25:40.52998	1.4TSI-CAX	WVWZZZ3CZAP000367	\N	\N
1042	1036	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:40.653028		\N	\N	\N
1043	1037	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:40.82152		\N	\N	\N
1044	1038	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:40.943371		\N	\N	\N
1045	1039	SKODA	OCTAVIA 2 - FL	406406-حلب	ابيض	2010	\N	2025-09-01 12:25:41.112014	BSF	TMBBA41Z1A2020502	\N	\N
1046	1040	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:41.234521		\N	\N	\N
1047	1041	SKODA	SUPERB	14-40781	أسود	2007	\N	2025-09-01 12:25:41.402784	AMX	TMBBT23U979013863	\N	\N
1048	1042	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:41.523141		\N	\N	\N
1049	1043	اودي	Q7	557357-اللاذقية	ابيض	2008	\N	2025-09-01 12:25:41.693776	4.2FSI-BAR	WAUZZZ4L37D057329	\N	\N
1050	1044	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:41.82535		\N	\N	\N
1051	1045	VW JETTA	فوكس فايكن جيتا	6976	رمادي فاتح	2019	\N	2025-09-01 12:25:41.98396	DGX	3VWC57BU9KM121727	\N	\N
1052	1046	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:42.113741		\N	\N	\N
1053	1047	SKODA	OCTAVIA	852777 - حمص	أبيض	2006	\N	2025-09-01 12:25:42.274668	BSF	TMBBA41Z162272905	\N	\N
1054	1048	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:42.404262		\N	\N	\N
1055	1049	VW	JETTA 6	588712-حمص	اسود	2010	\N	2025-09-01 12:25:42.565792		\N	\N	\N
1056	1050	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:42.697222		\N	\N	\N
1057	1051	VW	PASSAT	646270-دمشق	رمادي	2011	\N	2025-09-01 12:25:42.856403	2.0TSI CIW	WVWZZZ3CZBP001395	\N	\N
1058	1052	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:42.98982		\N	\N	\N
1059	1053	AUDI	Q3	505-3592	اسود	2013	\N	2025-09-01 12:25:43.151992		WA1DFAFS3DR000259	\N	\N
1060	1054	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:43.282348		\N	\N	\N
1061	1055	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:43.443156		\N	\N	\N
1062	1056	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:43.57525		\N	\N	\N
1063	1057	اودي	A4	018040-دمشق	فضي	2002	\N	2025-09-01 12:25:43.734776	BWE-2.0	WAUZZZ8E92A314306	\N	\N
1065	1059	VW	GOLF6 GTI	441174-دمشق	فضي	2007	\N	2025-09-01 12:25:44.026265		WVWZZZ1KZ7P033218	\N	\N
1067	1061	VW	GOLF 5	244586-دمشق	كحلي	2005	\N	2025-09-01 12:25:44.317703	2.0TFSI-BWA	WVWZZZ1KZ5W252030	\N	\N
1069	1063	سكودا	أوكتافيا1	407648-حمص	فضي	2008	\N	2025-09-01 12:25:44.607909	1.6MPI	TMBDK41U488844026	\N	\N
1071	1065	Audi	A6 C7	503-1397	أبيض	2012	\N	2025-09-01 12:25:44.898499	CHVA	WAUBHC4G0CN076392	\N	\N
1073	1067	AUDI	A5	505-6584	أبيض	2021	\N	2025-09-01 12:25:45.192439	DPA	WAUDACFSOMA020300	\N	\N
1075	1069	سكودا	اوكتافيا	424363-حمص	فضي	2005	\N	2025-09-01 12:25:45.482693	1.6-BSF	TMBCA11Z852102915	\N	\N
1079	1073	VW	JETTA	580942-دمشق	اسود	2007	\N	2025-09-01 12:25:46.065845		\N	\N	\N
1081	1075	سكودا	اوكتافيا	407039-حمص	فضي	2008	\N	2025-09-01 12:25:46.364964		TMBBA41Z382014405	\N	\N
1083	1077	VW	PASSAT B6	261166-طرطوس	اسود	2007	\N	2025-09-01 12:25:46.65609	1.6FSI-BLF	WVWZZZ3CZ7P089528	\N	\N
1085	1079	VW	PASSAT B6	452868-طرطوس	فضي	2006	\N	2025-09-01 12:25:46.946359	1.6FSI-BLF	WVWZZZ3CZ6P118400	\N	\N
1087	1081	VW	JETTA	690197-دمشق	كحلي	2007	\N	2025-09-01 12:25:47.23688	BSF	\N	\N	\N
1089	1083	VW	PASSAT	507692-دمشق	كحلي	\N	\N	2025-09-01 12:25:47.530427	3.2	\N	\N	\N
1091	1085	SKODA	OCTAVIA	142179 - دمشق	أبيض	1997	\N	2025-09-01 12:25:47.821182	AUM	TMBZZZ1U8V2014016	\N	\N
1095	1089	اودي	A4	701763-دمشق	فضي	2007	\N	2025-09-01 12:25:48.404538	1.6-ALZ	\N	\N	\N
1097	1091	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:48.695282		\N	\N	\N
1099	1093	AUDI	A6	410059	\N	2008	\N	2025-09-01 12:25:48.985192		\N	\N	\N
1101	1095	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:49.277662		\N	\N	\N
1103	1097	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:49.567469		\N	\N	\N
1105	1099	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:49.857289		\N	\N	\N
1107	1101	اودي	A4	897794-دمشق	خمري	2002	\N	2025-09-01 12:25:50.147835		WAUZZZ8E62A314618	\N	\N
1109	1103	VW	غير محدد	505-8886	\N	2013	\N	2025-09-01 12:25:50.437893	CBT	WVWCR7A35D020706	\N	\N
1113	1107	VW	TIGUAN	508-4567	اسود	2011	\N	2025-09-01 12:25:51.02536	CCZ	WVGCE15N0BW020320	\N	\N
1115	1109	سكودا	اوكتافيا	406551-حمص	فضي	2006	\N	2025-09-01 12:25:51.316522	1.6BSF	TMBDA41ZX62155722	\N	\N
1117	1111	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:51.607166		\N	\N	\N
1119	1113	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:51.898172		\N	\N	\N
1121	1115	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:52.188684		\N	\N	\N
1123	1117	SKODA	OCTAVIA	595988-حمص	ذهبي	2006	\N	2025-09-01 12:25:52.479055	BLR	TMBBA81Z982124948	\N	\N
1125	1119	اودي	Q7-4L	888338-طرطوس	اسود	2010	\N	2025-09-01 12:25:52.76986	3.6FSI-BHK	WAUAYD4L7AD007138	\N	\N
1127	1121	اودي	S8	666066-دمشق	فضي	2009	\N	2025-09-01 12:25:53.062302	5.2-BSM	WAUZZZ4EX9N007221	\N	\N
1129	1123	AUDI	Q5	513-1356	أبيض	2015	\N	2025-09-01 12:25:53.352703	CNCD	WA1CFCFP6FA000504	\N	\N
1131	1125	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:53.645712		\N	\N	\N
1133	1127	اودي	A6	777757-ريف دمشق	ابيض	2008	\N	2025-09-01 12:25:53.937943	2.0TFSI	WAUAF64F38N105700	\N	\N
1135	1129	VW	PASSAT CC	458999 - حمص	بني فاتح	2010	\N	2025-09-01 12:25:54.227618	CDA	WVWZZZ3CZAE552502	\N	\N
1137	1131	SKODA	OCTAVIA	416244 حمص	اسود	2009	\N	2025-09-01 12:25:54.517636	BDA	TMBDX41U398844344	\N	\N
1139	1133	VW	طوارئ	508-4568	أسود	2015	\N	2025-09-01 12:25:54.808759		WVGBC2BPXFD001921	\N	\N
1141	1135	VW	PASSAT	850123-حمص	رمادي	2006	\N	2025-09-01 12:25:55.099381	BVZ	WVWZZZ3CZ6P227017	\N	\N
1143	1137	VW	PASSAT B6	714982-دمشق	فضي	\N	\N	2025-09-01 12:25:55.397134		\N	\N	\N
1145	1139	سكودا	اوكتافيا	328479-طرطوس	اخضر	2008	\N	2025-09-01 12:25:55.688326		\N	\N	\N
1147	1141	سكودا	اوكتافيا2	583058-حماة	اسود	2009	\N	2025-09-01 12:25:55.98059	1.6MPI	TMBDA41Z39C000329	\N	\N
1149	1143	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:56.272402		\N	\N	\N
1151	1145	أودي	Q7-4L	805544-دمشق	اسود	2009	\N	2025-09-01 12:25:56.563409	3.6FSI-BHK	WAUZZZ4L69D014283	\N	\N
1153	1147	VW	Jetta	306276 - طرطوس	رمادي	2007	\N	2025-09-01 12:25:56.854486	BSF	WVWRU11K57M102897	\N	\N
1155	1149	اودي	Q7	669134-دمشق	فضي	2007	\N	2025-09-01 12:25:57.146211	4.2FSI-BAR	WAUAV94L87D053916	\N	\N
1157	1151	AUDI	A6	501-3727	رمادي	2019	\N	2025-09-01 12:25:57.436594	TDI	WAUZZZF20KN121043	\N	\N
1159	1153	AUDI	Q7	216686	بني	2017	\N	2025-09-01 12:25:57.727604	CREC	WA1AGDF72GD001269	\N	\N
1161	1155	سكودا	اوكتافيا	353090-دمشق	اسود	2006	\N	2025-09-01 12:25:58.017935	2.0FSI-BVZ	TMBBD41Z162138970	\N	\N
1165	1159	PORSCHE	PANAMERA4	50-1336	أبيض	2012	\N	2025-09-01 12:25:58.601489	3.6	WP0ZZZ97ZCL001132	\N	\N
1167	1161	سكودا	فابيا	425409-حمص	رمادي	2010	\N	2025-09-01 12:25:58.89205	AHB	TMBBD45JXA3177905	\N	\N
1169	1163	اودي	Q7-4L	021704-دمشق	فضي	2010	\N	2025-09-01 12:25:59.182655	4.2FSI-BAR	WAUAVD4L7AD004880	\N	\N
1171	1165	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:59.473372		\N	\N	\N
1173	1167	VW	POLO	816172 - حمص	فضي	2004	\N	2025-09-01 12:25:59.765434	BAH	9BWJB49N14P037582	\N	\N
1175	1169	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:00.056323		\N	\N	\N
1177	1171	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:00.351623		\N	\N	\N
1179	1173	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:00.642406		\N	\N	\N
1181	1175	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:00.933405		\N	\N	\N
1183	1177	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:01.225609		\N	\N	\N
1185	1179	اودي	RS4	133669-دمشق	اسود	2008	\N	2025-09-01 12:26:01.516921	4.2FSI-BNS	WUAZZZ8E88N900633	\N	\N
1187	1181	skoda	octavia	815419 - حمص	ابيض	2006	\N	2025-09-01 12:26:01.807896	BLF	TMBBB61ZX62127631	\N	\N
1189	1183	VW	PASSAT B6	604926-للاذقية	فضي	2010	\N	2025-09-01 12:26:02.099515	2.0TSI	WVWZZZ3CZAP011678	\N	\N
1191	1185	SKODA	OCTAVIA	596365 - حمص	أزرق سماوي	2009	\N	2025-09-01 12:26:02.39065	BSF	TMBBA41Z992007105	\N	\N
1193	1187	سكودا	اوكتافيا	531738-حماة	اسود	\N	\N	2025-09-01 12:26:02.681264		\N	\N	\N
1195	1189	AUDI	Q7	715999 - دمشق	أسود	2010	\N	2025-09-01 12:26:02.986997	BHK	WAUAYD4LXAD012155	\N	\N
1197	1191	VW	PASSAT	12-42358	فضي	2006	\N	2025-09-01 12:26:03.277943	1.6FSI-BLF	WVWZZZ3CZ6P221801	\N	593986-حمص
1199	1193	VW	TTGUAN	498367-دمشق	اسود	2009	\N	2025-09-01 12:26:03.569873	BWA/2.0TFSI	WVGZZZ5NZ9W091809	\N	\N
1226	1220	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:07.513218		\N	\N	\N
1064	1058	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:43.867993		\N	\N	\N
1066	1060	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:44.162338		\N	\N	\N
1068	1062	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:44.45416		\N	\N	\N
1070	1064	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:44.747444		\N	\N	\N
1072	1066	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:45.038604		\N	\N	\N
1074	1068	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:45.327863		\N	\N	\N
1076	1070	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:45.619786		\N	\N	\N
1078	1072	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:45.915721		\N	\N	\N
1080	1074	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:46.207529		\N	\N	\N
1082	1076	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:46.501116		\N	\N	\N
1084	1078	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:46.797709		\N	\N	\N
1086	1080	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:47.089294		\N	\N	\N
1088	1082	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:47.38454		\N	\N	\N
1090	1084	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:47.677448		\N	\N	\N
1092	1086	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:47.972866		\N	\N	\N
1094	1088	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:48.260207		\N	\N	\N
1096	1090	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:48.550367		\N	\N	\N
1098	1092	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:48.840779		\N	\N	\N
1100	1094	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:49.130618		\N	\N	\N
1102	1096	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:49.418951		\N	\N	\N
1104	1098	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:49.708961		\N	\N	\N
1106	1100	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:49.99929		\N	\N	\N
1108	1102	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:50.289897		\N	\N	\N
1110	1104	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:50.577826		\N	\N	\N
1112	1106	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:50.868378		\N	\N	\N
1114	1108	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:51.156849		\N	\N	\N
1116	1110	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:51.45185		\N	\N	\N
1118	1112	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:51.741017		\N	\N	\N
1120	1114	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:52.030277		\N	\N	\N
1122	1116	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:52.319929		\N	\N	\N
1124	1118	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:52.609453		\N	\N	\N
1126	1120	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:52.904509		\N	\N	\N
1128	1122	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:53.199692		\N	\N	\N
1130	1124	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:53.499299		\N	\N	\N
1132	1126	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:53.791152		\N	\N	\N
1134	1128	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:54.08232		\N	\N	\N
1136	1130	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:54.373777		\N	\N	\N
1138	1132	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:54.667497		\N	\N	\N
1140	1134	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:54.957474		\N	\N	\N
1142	1136	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:55.255183		\N	\N	\N
1144	1138	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:55.54638		\N	\N	\N
1146	1140	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:55.835258		\N	\N	\N
1148	1142	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:56.127388		\N	\N	\N
1150	1144	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:56.420926		\N	\N	\N
1152	1146	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:56.723578		\N	\N	\N
1154	1148	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:57.014221		\N	\N	\N
1156	1150	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:57.306348		\N	\N	\N
1158	1152	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:57.594473		\N	\N	\N
1160	1154	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:57.885338		\N	\N	\N
1162	1156	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:58.177959		\N	\N	\N
1164	1158	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:58.466324		\N	\N	\N
1166	1160	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:58.757168		\N	\N	\N
1168	1162	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:59.053113		\N	\N	\N
1170	1164	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:59.351637		\N	\N	\N
1172	1166	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:59.641786		\N	\N	\N
1174	1168	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:25:59.93288		\N	\N	\N
1176	1170	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:00.221493		\N	\N	\N
1178	1172	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:00.510494		\N	\N	\N
1180	1174	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:00.799141		\N	\N	\N
1182	1176	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:01.093648		\N	\N	\N
1184	1178	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:01.382479		\N	\N	\N
1186	1180	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:01.673768		\N	\N	\N
1188	1182	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:01.967339		\N	\N	\N
1190	1184	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:02.257038		\N	\N	\N
1192	1186	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:02.557018		\N	\N	\N
1194	1188	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:02.846821		\N	\N	\N
1196	1190	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:03.140315		\N	\N	\N
1198	1192	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:03.432595		\N	\N	\N
1200	1194	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:03.721285		\N	\N	\N
1202	1196	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:04.016321		\N	\N	\N
1204	1198	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:04.305775		\N	\N	\N
1206	1200	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:04.599349		\N	\N	\N
1208	1202	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:04.887799		\N	\N	\N
1210	1204	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:05.183537		\N	\N	\N
1212	1206	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:05.472135		\N	\N	\N
1214	1208	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:05.763635		\N	\N	\N
1216	1210	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:06.051135		\N	\N	\N
1218	1212	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:06.341296		\N	\N	\N
1220	1214	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:06.632864		\N	\N	\N
1222	1216	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:06.925041		\N	\N	\N
1224	1218	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:07.221715		\N	\N	\N
1201	1195	اودي	A4	409742-حمص	اسود	2008	\N	2025-09-01 12:26:03.860336	1.6-ALZ	WAUZZZ8E68A124021	\N	\N
1203	1197	اودي	A4	759890-دمشق	فضي	2002	\N	2025-09-01 12:26:04.154393	2.0-ALT	WAUZZZ8E42A313645	\N	\N
1205	1199	VW	PASSAT B6	816350-حمص	اسود	2006	\N	2025-09-01 12:26:04.445583		WVWZZZ3CZ6P127689	\N	\N
1207	1201	AUDI	Q5	515-1020	\N	2013	\N	2025-09-01 12:26:04.737887	2.0TSI/ CNCD	\N	\N	\N
1209	1203	VW	PASSAT CC	230888-دمشق	ذهبي	2010	\N	2025-09-01 12:26:05.029011		WVWZZZ3CZAE559834	\N	\N
1211	1205	أودي	A6-C6	416060-حمص	رصاصي	2007	\N	2025-09-01 12:26:05.321487	3.0T-CAJ	WAUZZZ4F17N022776	\N	\N
1213	1207	VW	PASSAT B6	561518-دمشق	اخضر	2008	\N	2025-09-01 12:26:05.612208	2.0TFSI-BWA	WVWBP23C28P006925	\N	\N
1215	1209	VW	PASSAT CC	509409-دمشق	ابيض	2010	\N	2025-09-01 12:26:05.902837	3.6FSI-BWS	WVWZZZ3CZAE565559	\N	\N
1217	1211	سكودا	اوكتافيا2	748241-دمشق	زيتي	2008	\N	2025-09-01 12:26:06.195475	1.6MPI	TMBBA41Z682049441	\N	\N
1219	1213	VW	PASSAT	523-3107	خمري	2014	\N	2025-09-01 12:26:06.486942	CBT	WVWCR7A38EC000676	\N	\N
1221	1215	AUDI	Q7	343651	ازرق	2009	\N	2025-09-01 12:26:06.778581	4.2/ BAR	WAUAV54L09D029489	\N	\N
1223	1217	AUDI	A4	899584 - دمشق	اسود	2007	\N	2025-09-01 12:26:07.069255	ALZ	WAUZZZ8E87A181643	\N	\N
1227	1221	AUDI	A6	516-7543	أسود	2013	\N	2025-09-01 12:26:07.652568	CTUA	WAUZZZ4G3DN088640	\N	\N
1229	1223	سكودا	اوكتافيا	819304-حمص	فضي	2005	\N	2025-09-01 12:26:07.958733	1.6MPI	TMBCA11Z852102753	\N	\N
1231	1225	VW	تيغوان	683492-قطر	أسود	2020	\N	2025-09-01 12:26:08.250093		WV0ZZZSVZKM125673	\N	\N
1233	1227	سكودا	اوكتافيا	705065-دمشق	اسود	2010	\N	2025-09-01 12:26:08.542503		TMBBA41Z7A2009634	\N	\N
1235	1229	سكودا	اوكتافيا	620726-حماة	\N	\N	\N	2025-09-01 12:26:08.832221	1.6MPI	\N	\N	\N
1237	1231	سكودا	اوكتافيا	268785-دمشق	ذهبي	2005	\N	2025-09-01 12:26:09.121898	1.6MPI	TMBBA41Z15210784	\N	\N
1239	1233	skoda	fabia	950353 - دمشق	أسود	2001	\N	2025-09-01 12:26:09.411589	BBY	TMBCC46Y713261585	\N	\N
1243	1237	AUDI	A4	434782	اسود	2008	\N	2025-09-01 12:26:09.996122		WAUZZZ8E38A116281	\N	\N
1246	1239	SKODA	SUPERB	12-38218	ابيض	2011	\N	2025-09-01 12:26:10.630827	BWA/2.0TFSI	TMBAB43T2B9034368	\N	\N
1248	1242	AUDI	S7	510-9218	ابيض	2013	\N	2025-09-01 12:26:10.922222	CEUC	WAUS2CFC1DN028885	\N	\N
1250	1244	سكودا	اوكتافيا	491636 - حماه	سماوي	2009	\N	2025-09-01 12:26:11.212318	BSF	TMBBA41Z292021234	\N	\N
1252	1246	SKODA	OCTAVIA	465955- اللاذقية	فضي	2010	\N	2025-09-01 12:26:11.501871	1.6BSF	TMBBA41Z2Q2010268	\N	\N
1256	1250	VW	JETTA	لايوجد نمرة	بني	2012	\N	2025-09-01 12:26:12.084194		WVWRV1161CM106990	\N	\N
1258	1252	VW	JETTA		بني	2012	\N	2025-09-01 12:26:12.374713		WVWRV1161CM106990	\N	\N
1260	1254	اودي	Q7	434210-دمشق	اسود	2007	\N	2025-09-01 12:26:12.665256	4.2FSI-BAR	WAUZZZ4L87D052370	\N	\N
1262	1256	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:13.063852		\N	\N	\N
1265	1259	VW	TOUAREJ	513-4560	أسود	2014	\N	2025-09-01 12:26:13.36029	CGRA	WVGBC2BP9ED001357	\N	\N
1268	1262	AUDI	Q5	509-8804	أسود	2014	\N	2025-09-01 12:26:13.651006	CNC	WA1CFCFP4EA000970	\N	\N
1271	1265	AUDI	Q5	508-3318	أسود	2014	\N	2025-09-01 12:26:13.942141	CNCD 2.0	WA1CFCFP4EA001164	\N	\N
1274	1268	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:14.233645		\N	\N	\N
1277	1271	AUDI	A6	882290	رمادي	2010	\N	2025-09-01 12:26:14.52409		WAUAFC4F8AN044400	\N	\N
1280	1274	VW	JETTA	221407-حلب	ابيض	2008	\N	2025-09-01 12:26:14.815006		\N	\N	\N
1283	1277	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:15.106727		\N	\N	\N
1286	1280	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:15.401235		\N	\N	\N
1289	1283	PORSCHE	CAYENNE S	522-8900	بني	2015	\N	2025-09-01 12:26:15.690869	3.6T	WP1ZZZ92ZFLA55089	\N	\N
1292	1286	AUDI	Q7	501-2340	بني	2013	\N	2025-09-01 12:26:15.982358	CREC	WA1AGDF79GD000698	\N	\N
1295	1289	غير محدد	غير محدد	512-6884	\N	2014	\N	2025-09-01 12:26:16.277047		\N	\N	\N
1298	1292	اودي	A6	681210-دمشق	اسود	2008	\N	2025-09-01 12:26:16.569132	2.0TFSI-BPJ	WAUAF64F08N104231	\N	\N
1301	1295	SKODA	OCTAVIA	406757 - حمص	رمادي	2008	\N	2025-09-01 12:26:16.859802	AEH	TMBDK41U788841749	\N	\N
1304	1298	سكودا	اوكتافيا	502800-دمشق	اسود	2010	\N	2025-09-01 12:26:17.150591	1.6-BSE	TMBBA41Z8A2021095	\N	\N
1307	1301	SKODA	SUPERB	345329 - دمشق	أبيض	2011	\N	2025-09-01 12:26:17.440265	CDAA	TMBAB43T2B9034368	\N	\N
1310	1304	VW	JETTA	505-7178	اسود	2013	\N	2025-09-01 12:26:17.730563		WVWSV1160CM040871	\N	\N
1313	1307	اودي	Q5	525688-دمشق	اسود	2011	\N	2025-09-01 12:26:18.021129	CDNC	WAUCFC8R1BA011034	\N	\N
1316	1310	VW	TIGUAN	521287-دمشق	فضي	2010	\N	2025-09-01 12:26:18.311703	2.0TSI-CAW	WVGZZZ5NZAW080618	\N	\N
1319	1313	AUDI	Q7	510-9562	ذهبي	2011	\N	2025-09-01 12:26:18.601291	CJTC	WAUAGD4LXBD036881	\N	\N
1322	1316	skoda	octavia	474502 - طرطوس	اسود	2001	\N	2025-09-01 12:26:18.891635	1.6 SR	TMBBK41U412519022	\N	\N
1325	1319	AUDI	A8	507-2495	اسود	2011	\N	2025-09-01 12:26:19.182336	CGXC/3.0	WAUZZZ4H4BN025553	\N	\N
1328	1322	AUDI	A6	696739-دمشق	فضي	2010	\N	2025-09-01 12:26:19.473888	2.0TFSI-BPJ	WAUZZZ4FXAN045092	\N	\N
1331	1325	اودي	A6-C6	698439-دمشق	اسود	2009	\N	2025-09-01 12:26:19.764644	2.0T/BPJ	WAUAF64F19N029833	\N	\N
1337	1331	AUDI	S3	508-1271	ابيض	2016	\N	2025-09-01 12:26:20.346192		WAUBFJFF3G1000648	\N	\N
1340	1334	VW	PASSAT B6	732596-دمشق	فضي	2010	\N	2025-09-01 12:26:20.636977	BWA/2.0TFSI	WVWZZZ3CZAP041236	\N	\N
1343	1337	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:20.927569		\N	\N	\N
1346	1340	AUDI	A6	521-2863	أسود	2013	\N	2025-09-01 12:26:21.216866		WAUZZZ4G7DN085515	\N	\N
1349	1343	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:21.509455		\N	\N	\N
1352	1346	VW	PASSAT CC	511-8794	أسود	2012	\N	2025-09-01 12:26:21.800768	CDA	WVWAB13C2CE549250	\N	\N
1355	1349	AUDI	A6	507-4234	نيلي	2012	\N	2025-09-01 12:26:22.092969	CDUC/3.0TDI	WAUZZZ4GBCN074070	\N	\N
1358	1352	VW	GOLF5 GTI	975457-دمشق	اسود	2004	\N	2025-09-01 12:26:22.384641	BWA	TMBBA61Z962124948	\N	\N
1361	1355	AUDI	A6		فضي	2006	\N	2025-09-01 12:26:22.676936		WAUZZZ4F16N081549	\N	\N
1364	1358	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:22.967143		\N	\N	\N
1366	1360	VW	JETTA 5	419529-حمص	ذهبي	2009	\N	2025-09-01 12:26:23.258685		WVWZZZ1KZ9M120714	\N	\N
1369	1363	AUDI	Q7	518-8556	\N	2013	\N	2025-09-01 12:26:23.551129		WAUZZZ4L7DD000577	\N	\N
1375	1369	AUDI	A4	508-6318	أسود	2013	\N	2025-09-01 12:26:24.133396	CPM	WAUZZZ8KXDA044852	\N	\N
1228	1222	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:07.804341		\N	\N	\N
1230	1224	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:08.104365		\N	\N	\N
1232	1226	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:08.394613		\N	\N	\N
1234	1228	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:08.684721		\N	\N	\N
1236	1230	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:08.973135		\N	\N	\N
1238	1232	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:09.262753		\N	\N	\N
1240	1234	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:09.559369		\N	\N	\N
1242	1236	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:09.85045		\N	\N	\N
1244	1238	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:10.146375		\N	\N	\N
1245	1240	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:10.500885		\N	\N	\N
1247	1241	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:10.79301		\N	\N	\N
1249	1243	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:11.085826		\N	\N	\N
1251	1245	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:11.380731		\N	\N	\N
1253	1247	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:11.669597		\N	\N	\N
1255	1249	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:11.958484		\N	\N	\N
1257	1251	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:12.250808		\N	\N	\N
1259	1253	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:12.601454		\N	\N	\N
1261	1255	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:12.896956		\N	\N	\N
1263	1258	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:13.21333		\N	\N	\N
1267	1261	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:13.50978		\N	\N	\N
1270	1264	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:13.806206		\N	\N	\N
1273	1267	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:14.09593		\N	\N	\N
1276	1270	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:14.392537		\N	\N	\N
1279	1273	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:14.722136		\N	\N	\N
1282	1276	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:15.018085		\N	\N	\N
1285	1279	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:15.312532		\N	\N	\N
1288	1282	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:15.60257		\N	\N	\N
1291	1285	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:15.89524		\N	\N	\N
1293	1288	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:16.183774		\N	\N	\N
1297	1290	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:16.478051		\N	\N	\N
1300	1294	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:16.770368		\N	\N	\N
1303	1297	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:17.061028		\N	\N	\N
1305	1299	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:17.350314		\N	\N	\N
1308	1302	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:17.644297		\N	\N	\N
1311	1305	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:17.936013		\N	\N	\N
1314	1308	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:18.233392		\N	\N	\N
1317	1311	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:18.530256		\N	\N	\N
1320	1314	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:18.819598		\N	\N	\N
1323	1317	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:19.10735		\N	\N	\N
1326	1320	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:19.39996		\N	\N	\N
1330	1323	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:19.695993		\N	\N	\N
1333	1327	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:19.985297		\N	\N	\N
1336	1330	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:20.275304		\N	\N	\N
1339	1333	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:20.571197		\N	\N	\N
1342	1336	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:20.860267		\N	\N	\N
1345	1339	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:21.148734		\N	\N	\N
1348	1342	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:21.440666		\N	\N	\N
1351	1345	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:21.728481		\N	\N	\N
1485	1479	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:34.881209		\N	\N	\N
1488	1482	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:35.176398		\N	\N	\N
1491	1485	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:35.47048		\N	\N	\N
1494	1488	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:35.760609		\N	\N	\N
1497	1491	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:36.05703		\N	\N	\N
1500	1494	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:36.352842		\N	\N	\N
1503	1497	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:36.646808		\N	\N	\N
1506	1500	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:36.938441		\N	\N	\N
1509	1503	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:37.232063		\N	\N	\N
1512	1506	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:37.520629		\N	\N	\N
1515	1509	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:37.811258		\N	\N	\N
1518	1512	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:38.101647		\N	\N	\N
1521	1515	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:38.393285		\N	\N	\N
1524	1518	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:38.691914		\N	\N	\N
1527	1521	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:38.982403		\N	\N	\N
1530	1524	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:39.272913		\N	\N	\N
1533	1527	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:39.561408		\N	\N	\N
1536	1530	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:39.854055		\N	\N	\N
1539	1533	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:40.148743		\N	\N	\N
1542	1536	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:40.443002		\N	\N	\N
1545	1539	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:40.734406		\N	\N	\N
1549	1543	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:41.027603		\N	\N	\N
1551	1545	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:41.317656		\N	\N	\N
1554	1548	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:41.609103		\N	\N	\N
1558	1551	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:41.901068		\N	\N	\N
1561	1555	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:42.198142		\N	\N	\N
1564	1558	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:42.491267		\N	\N	\N
1567	1561	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:42.780782		\N	\N	\N
1570	1564	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:43.072539		\N	\N	\N
1573	1567	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:43.362685		\N	\N	\N
1354	1348	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:22.016615		\N	\N	\N
1357	1351	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:22.308687		\N	\N	\N
1359	1353	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:22.598909		\N	\N	\N
1362	1356	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:22.889962		\N	\N	\N
1365	1359	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:23.17999		\N	\N	\N
1368	1362	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:23.472746		\N	\N	\N
1371	1365	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:23.765916		\N	\N	\N
1374	1368	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:24.058721		\N	\N	\N
1377	1371	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:24.349214		\N	\N	\N
1380	1374	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:24.64306		\N	\N	\N
1383	1377	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:24.938003		\N	\N	\N
1386	1380	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:25.238194		\N	\N	\N
1389	1383	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:25.54126		\N	\N	\N
1392	1386	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:25.833539		\N	\N	\N
1395	1389	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:26.122818		\N	\N	\N
1398	1392	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:26.419435		\N	\N	\N
1401	1395	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:26.709795		\N	\N	\N
1404	1398	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:26.998461		\N	\N	\N
1407	1401	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:27.286376		\N	\N	\N
1410	1404	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:27.577785		\N	\N	\N
1413	1407	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:27.869615		\N	\N	\N
1416	1410	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:28.163066		\N	\N	\N
1419	1413	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:28.452776		\N	\N	\N
1422	1416	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:28.745105		\N	\N	\N
1425	1419	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:29.033906		\N	\N	\N
1428	1422	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:29.325883		\N	\N	\N
1431	1425	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:29.614628		\N	\N	\N
1434	1428	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:29.902975		\N	\N	\N
1437	1431	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:30.19335		\N	\N	\N
1440	1434	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:30.482552		\N	\N	\N
1443	1437	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:30.77404		\N	\N	\N
1446	1440	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:31.062515		\N	\N	\N
1449	1443	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:31.365487		\N	\N	\N
1452	1446	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:31.657417		\N	\N	\N
1455	1449	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:31.951995		\N	\N	\N
1458	1452	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:32.246099		\N	\N	\N
1461	1455	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:32.538659		\N	\N	\N
1464	1458	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:32.828911		\N	\N	\N
1467	1461	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:33.121563		\N	\N	\N
1470	1464	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:33.41296		\N	\N	\N
1473	1467	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:33.705852		\N	\N	\N
1476	1470	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:34.001715		\N	\N	\N
1479	1473	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:34.296012		\N	\N	\N
1482	1476	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:34.586626		\N	\N	\N
1629	1623	VW	GOLF6	483509-دمشق	ابيض	2009	\N	2025-09-01 12:26:48.897303	2.0TFSI-BWA	WVWZZZ1KZ9W489636	\N	\N
1632	1626	سكودا	اوكتافيا	784570-حماة	رصاصي	2007	\N	2025-09-01 12:26:49.188592	1.6MPI	TMBDK41U078878821	\N	\N
1635	1629	اودي	A6	409085-دمشق	اسود	2011	\N	2025-09-01 12:26:49.479867	2.8FSI	WAUZZZ4FXBN000199	\N	\N
1638	1632	VW	GOLF	420599-حمص	ابيض	2010	\N	2025-09-01 12:26:49.771094	1.4TSI-CAV	WVWZZZ1KZAW112058	\N	\N
1378	1372	AUDI	Q7	502-7210	بني	2013	\N	2025-09-01 12:26:24.425464	CJTC	WA1AGDFEODD003144	\N	\N
1381	1375	AUDI	Q7	505-8644	كحلي	2014	\N	2025-09-01 12:26:24.716285		WA1AGDFE4FD001206	\N	\N
1384	1378	AUDI	Q7	015622 - دمشق	أبيض	2010	\N	2025-09-01 12:26:25.006622	4.2 FSI	WAUAVD4L8AD010462	\N	\N
1393	1387	VW	GOLF 6	420599-حمص	ابيض	2010	\N	2025-09-01 12:26:25.878883	1.4TSI-CAX	WVWZZZ1KZAW112058	\N	\N
1396	1390	سكودا	اوكتافيا2	421850-حمص	اسود	2010	\N	2025-09-01 12:26:26.169785	BSF	\N	\N	\N
1399	1393	AUDI	A6	508-7196	رمادي	2012	\N	2025-09-01 12:26:26.461524	CGX	WAUZZZ4G2CN089051	\N	\N
1402	1396	AUDI	A6	بدون نمرة	رمادي غامق	2012	\N	2025-09-01 12:26:26.752801	TDA	WAUZZZ468CN074070	\N	\N
1405	1399	VW	PASSAT B6	566881-دمشق	رمادي	2011	\N	2025-09-01 12:26:27.043481	CCT	WVWZZZ3CZBP002069	\N	\N
1408	1402	AUDI	Q7	223221-دمشق	اسود	2017	\N	2025-09-01 12:26:27.333967	CREC	WAUZZZ4M6HD008250	\N	\N
1411	1405	VW	PASSAT B6	452700-طرطوس	اسود	2008	\N	2025-09-01 12:26:27.624889	1.6-BSF	WVWZZZ3CZ8P036192	\N	\N
1414	1408	سكودا	اوكتافيا	815436-حمص	فضي	2006	\N	2025-09-01 12:26:27.915502		TMBBA61Z362127456	\N	\N
1417	1411	AUDI	Q5	508-1151	رمادي	2015	\N	2025-09-01 12:26:28.206131	CNCD	WA1CFCFP8FA050725	\N	\N
1420	1414	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:28.496294		\N	\N	\N
1423	1417	AUDI	A6	519-7648	أبيض	2011	\N	2025-09-01 12:26:28.787862		WAUZZZ4F4BN010369	\N	\N
1432	1426	VW	PASSAT B6	762281-دمشق	اسود	2008	\N	2025-09-01 12:26:29.665345	2.0TSI  - BZB	WVWZZZ3CZ8P102643	\N	\N
1435	1429	VW	TOUAREG	6623	ابيض	2014	\N	2025-09-01 12:26:29.956751		WVGBC2BP1DD007247	\N	\N
1438	1432	VW	PASSAT B6	899364-دمشق	اسود	2007	\N	2025-09-01 12:26:30.2473		\N	\N	\N
1441	1435	VW	TOUARG	511-5170	أسود	2013	\N	2025-09-01 12:26:30.538589		WVGBC2BP0DD010818	\N	\N
1444	1438	SKODA	OCTAVIA	495203 - اللاذقية	أسود	2007	\N	2025-09-01 12:26:30.828685	BSF	TMBDA41Z672058809	\N	\N
1447	1441	AUDI	A4	86706 -ادلب تجربة	أسود	2010	\N	2025-09-01 12:26:31.12003	CDN	WAVZZZ8KXANOO1343	\N	\N
1450	1444	VW	GOLF 6	696954-دمشق	ابيض	2010	\N	2025-09-01 12:26:31.410373	CDL	WVWZZZ1KZAW137166	\N	\N
1453	1447	AUDI	A4	507-2388	ابيض	2010	\N	2025-09-01 12:26:31.701482	RRC	WAUZZZ8K6AN002697	\N	\N
1456	1450	سكودا	اوكتافيا	260822 - حمص	سماوي	2009	\N	2025-09-01 12:26:31.992077	BSF	TMBBA41Z992007122	\N	\N
1459	1453	SKODA	OCTAVIA	326118 - طرطوس	رمادي	2009	\N	2025-09-01 12:26:32.28287	BSE	TMBDA41Z69C000292	\N	\N
1462	1456	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:32.575286		\N	\N	\N
1465	1459	AUDI	Q5	723874 - دمشق	أزرق غامق	2010	\N	2025-09-01 12:26:32.867166	CAL	WAUCKC8R9AA030246	\N	\N
1468	1462	AUDI	Q7	859043 - دمشق	أسود	2007	\N	2025-09-01 12:26:33.156948	BHK	WAUAY94L37D069321	\N	\N
1471	1465	اودي	Q7	222269-دمشق	رمادي	2007	\N	2025-09-01 12:26:33.447387	BAR	\N	\N	\N
1474	1468	VW	VW TIGUAN	508-4864	ابيض	2018	\N	2025-09-01 12:26:33.739596	CHHB	WVGCD1AX7JW801358	\N	\N
1477	1471	SKODA	OCTAVIA	425629 - حمص	أسود	2010	\N	2025-09-01 12:26:34.031659	BSE	TMBBA41Z3A2070690	\N	\N
1480	1474	سكودا	ELINGANS	411491-حمص	زيتي	2008	\N	2025-09-01 12:26:34.322546		TMBBA41ZX82159151	\N	\N
1576	1570	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:43.676234		\N	\N	\N
1579	1573	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:43.978174		\N	\N	\N
1582	1576	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:44.269501		\N	\N	\N
1585	1579	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:44.560217		\N	\N	\N
1588	1582	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:44.867762		\N	\N	\N
1591	1585	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:45.15912		\N	\N	\N
1594	1588	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:45.448346		\N	\N	\N
1597	1591	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:45.742887		\N	\N	\N
1600	1594	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:46.036809		\N	\N	\N
1603	1597	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:46.332675		\N	\N	\N
1606	1600	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:46.622747		\N	\N	\N
1609	1603	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:46.912736		\N	\N	\N
1612	1606	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:47.207188		\N	\N	\N
1615	1609	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:47.497997		\N	\N	\N
1618	1612	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:47.795918		\N	\N	\N
1621	1615	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:48.085589		\N	\N	\N
1624	1618	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:48.376752		\N	\N	\N
1627	1621	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:48.671648		\N	\N	\N
1630	1624	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:48.968256		\N	\N	\N
1633	1627	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:49.257866		\N	\N	\N
1636	1630	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:49.546704		\N	\N	\N
1639	1633	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:49.836914		\N	\N	\N
1642	1636	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:50.125584		\N	\N	\N
1644	1638	VW	PASSAT CC	720054 - دمشق	بني فاتح	2010	\N	2025-09-01 12:26:50.351247	CDA	WVWAB13C6AE539172	\N	\N
1645	1639	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:50.425336		\N	\N	\N
1647	1641	VW	GOLF6	557072-اللاذقية	فضي	2009	\N	2025-09-01 12:26:50.642997	2.0TSI-CAW	WVWCG21K39W457562	\N	\N
1648	1642	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:50.720323		\N	\N	\N
1650	1644	AUDI	A6	508-1563	بني	2013	\N	2025-09-01 12:26:50.933098	CHVA	WAUBHCFC8DN084465	\N	\N
1651	1645	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:51.008999		\N	\N	\N
1654	1648	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:51.298086		\N	\N	\N
1656	1650	VW	TOURAN	850151-حمص	اسود	2005	\N	2025-09-01 12:26:51.514917	1.6	WVGZZZ1TZ5W194164	\N	\N
1657	1651	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:51.588153		\N	\N	\N
1659	1653	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:51.805082		\N	\N	\N
1663	1657	AUDI	A6	336643 - طرطوس	فضي	2007	\N	2025-09-01 12:26:52.195518	BGB	WAUZZZ4F57N163771	\N	\N
1666	1660	VW	GOLF	269036-دمشق	رمادي	2007	\N	2025-09-01 12:26:52.487123		\N	\N	\N
1669	1663	اودي	A4	881105-دمشق	ابيض	\N	\N	2025-09-01 12:26:52.777667		\N	\N	\N
1672	1666	سكودا	SUPERB	688584-دمشق	رصاصي	2011	\N	2025-09-01 12:26:53.068759		TMBAB83T6B9038494	\N	\N
1675	1669	VW	JETTA	512-1675	أسود	2014	\N	2025-09-01 12:26:53.359176	CBP	WVWSV1AJ1EM200258	\N	\N
1678	1672	AUDI	A4	ادلب تجربة	أسود	2014	\N	2025-09-01 12:26:53.649188	CJC	WAUZZZ8KLEN010790	\N	\N
1681	1675	VW	PASSAT	510-1680	رمادي	2012	\N	2025-09-01 12:26:53.93931	CDA	WVWAB13C1CE539339	\N	\N
1683	1678	سكودا	اوكتافيا	لغرض التوثيق	فضي	2007	\N	2025-09-01 12:26:54.229837	BSF	TMBCA11Z172074832	\N	\N
1687	1681	VW	PASSAT	106685-دمشق	اسود	2008	\N	2025-09-01 12:26:54.520563		WVWZZZ3CZ8P064776	\N	\N
1690	1684	AUDI	A6	318300-دمشق	نيلي	2011	\N	2025-09-01 12:26:54.810814	BPJ	WAUZZZ4F4BN057286	\N	\N
1693	1687	AUDI	Q7	528-9846	أسود	2013	\N	2025-09-01 12:26:55.102355	4L0	WA1AGDEEXDD002020	\N	\N
1696	1690	VW	GOLF 5	818582-طرطوس	اصفر	2003	\N	2025-09-01 12:26:55.392508		\N	\N	\N
1699	1693	VW	PASSAT	972675-دمشق	ابيض	2004	\N	2025-09-01 12:26:55.683042		\N	\N	\N
1702	1696	VW	PASSAT CC	726604-دمشق	فضي	2010	\N	2025-09-01 12:26:55.973159	2.0TSI	WVWZZZ3CZAE555985	\N	\N
1704	1698	VW	GOLF6	598533-دمشق	ابيض	2010	\N	2025-09-01 12:26:56.266799	2.0TSI-CCZ	WVWZZZ1KZAW111799	\N	\N
1707	1701	AUDI	A6	026136 - دمشق	أسود	2010	\N	2025-09-01 12:26:56.557084	CCE	WAUZZZ4F9AN060649	\N	\N
1710	1704	VW	PASSAT	819984 - حمص	أبيض	2006	\N	2025-09-01 12:26:56.848053	BLF	WVWZZZ3CZ6P226979	\N	\N
1713	1707	VW	TOURAN	672254-دمشق	كحلي	2006	\N	2025-09-01 12:26:57.138136	2.0FSI-BVZ	WVGZZZ1TZ6W053086	\N	\N
1716	1710	سكودا	اوكتافيا2	594819-حمص	فضي	2007	\N	2025-09-01 12:26:57.428724	1.6MPI	TMBDA41Z672060690	\N	\N
1719	1713	سكودا	اوكتافيا2	601156-اللاذقية	رمادي	2010	\N	2025-09-01 12:26:57.718296	1.6MPI	TMBCA41Z7A2095810	\N	\N
1722	1716	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:58.008453		\N	\N	\N
1725	1719	AUDI	A8	483114-دمشق	أبيض	2009	\N	2025-09-01 12:26:58.299429	3.2FSI-BPK	WAUKH54EX9N000668	\N	\N
1728	1722	اودي	A8	681430-دمشق	اسود	2007	\N	2025-09-01 12:26:58.589898		WAUZZZ4E57N014347	\N	\N
1731	1725	اودي	A6 - 3.2 FSI	676161-دمشق	اسود	2007	\N	2025-09-01 12:26:58.880034	AUK	WAUZZZ4F87N020538	\N	\N
1734	1728	VW	PASSAT B6	502600-دمشق	اسود	2006	\N	2025-09-01 12:26:59.171264	3.6FSI-BWS	WVWBM23C36P173882	\N	\N
1737	1731	VW	GOLF5 GTI	441174-دمشق	فضي	2007	\N	2025-09-01 12:26:59.462382	BWS-3.6FSI	WVWZZZ1KZ7P033218	\N	\N
1740	1734	كيا	ريو	595985-حمص	\N	\N	\N	2025-09-01 12:26:59.752475		\N	\N	\N
1743	1737	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:00.042655		\N	\N	\N
1749	1743	skoda	octavia	658837 - دمشق	ابيض	\N	\N	2025-09-01 12:27:00.622703	1.9 TDI	TMBCG01U0Y2325497	\N	\N
1752	1746	اودي	A6	243592-دمشق	فضي	2006	\N	2025-09-01 12:27:00.912663		WAUZZZ4F66N170887	\N	\N
1755	1749	سكودا	أوكتافيا2	593904-حمص	أسود	2006	\N	2025-09-01 12:27:01.202836	2.0FSI	TMBBA61Z262207234	\N	\N
1758	1752	VW	PASSAT CC	514-6640	أسود	2012	\N	2025-09-01 12:27:01.496313	CDA	WVWZZZ3CZCE529664	\N	\N
1764	1758	SKODA	OCTAVIA	594983 - حمص	فضي	2008	\N	2025-09-01 12:27:02.078117	AEH	TMBDK41U588842012	\N	\N
1767	1761	VW	باسات CC	502-1814	أبيض	2013	\N	2025-09-01 12:27:02.370232	CDA	WVWAB13C7CE719540	\N	\N
1770	1764	Skoda	OCTAVIA	556869 - اللاذقية	رمادي	2010	\N	2025-09-01 12:27:02.661696	BSF	TMBCA41Z3A2096243	\N	\N
1773	1767	AUDI	A6	510-1290	فضي	2011	\N	2025-09-01 12:27:02.951847	CCAA	WAUZZZ4F7BN034536	\N	\N
1776	1770	VW	PASSAT	878511_ دمشق	كحلي	2006	\N	2025-09-01 12:27:03.243242	2.0 fsi	\N	\N	\N
1779	1773	اودي	A4	434059-طرطوس	رمادي	2007	\N	2025-09-01 12:27:03.533623	ALZ	WAUZZZ8E57A126776	\N	\N
1785	1779	AUDI	A4	863939-دمشق	ازرق	2007	\N	2025-09-01 12:27:04.117263		WAUZZZ8E37A158769	\N	\N
1788	1782	اودي	A4	897720-دمشق	اسود	2005	\N	2025-09-01 12:27:04.407517	ALT-2.0	WAUZZZ8E95A463500	\N	\N
1791	1785	اودي	Q7	013197-دمشق	رمادي	2010	\N	2025-09-01 12:27:04.699513	3.6FSI-BHK	WAUAYD4L0AD015422	\N	\N
1794	1788	اودي	Q7	336638-دمشق	ابيض	2011	\N	2025-09-01 12:27:04.990534		WAUAGD4L8BD016368	\N	\N
1797	1791	VW	GOLF5	220088-دمشق	فضي	2006	\N	2025-09-01 12:27:05.280814	1.6MPI	WVWZZZ1KZ6W203608	\N	\N
1800	1794	اودي	A8	014151-دمشق	اسود	2010	\N	2025-09-01 12:27:05.571289	3.2-BPK	WAUSHB4E4AN000149	\N	\N
1803	1797	اودي	A6	319689-دمشق	اسود	2009	\N	2025-09-01 12:27:05.86304	2.4-BDW	WAUZZZ4F49N001519	\N	\N
1806	1800	VW	PASSAT B6	456602-حماة	اسود	2006	\N	2025-09-01 12:27:06.154339		WVWZZZ3CZ6E068081	\N	\N
1809	1803	VW	PASSAT B6	898952-حلب	فضي	2006	\N	2025-09-01 12:27:06.444459	2.0FSI/BVZ	WVWZZZ3CZ6P125816	\N	\N
1812	1806	VW	PASSAT B6	560219-دمشق	فضي	2011	\N	2025-09-01 12:27:06.734882	1.4TSI-CAX	WVWZZZ3CZBP001889	\N	\N
1815	1809	سكودا	اوكتافيا2	266935-حمص	ذهبي	2005	\N	2025-09-01 12:27:07.02568	1.6MPI	TMBCA21Z552031579	\N	\N
1818	1812	SKODA	OCTAVIA	451391 طرطوس	اسود	2005	\N	2025-09-01 12:27:07.317275		TMBB612952101958	\N	\N
1821	1815	غير محدد	غير محدد	7462	\N	\N	\N	2025-09-01 12:27:07.610644		\N	\N	\N
1824	1818	VW	TOUAREG	3516	أبيض	2012	\N	2025-09-01 12:27:07.901281	3.6	WVGBC27P2CD007314	\N	\N
1827	1821	اودي	Q5	590221-دمشق	اسود	2010	\N	2025-09-01 12:27:08.192266		WAUCFC8R0AA005711	\N	\N
1830	1824	AUDI	Q7	503-9470	رمادي غامق	2015	\N	2025-09-01 12:27:08.484448	3	WA1AGDFE5FD001182	\N	\N
1833	1827	VW	PASSAT B6	106004-دمشق	اسود	2010	\N	2025-09-01 12:27:08.775149	2.0TSI	WVWZZZ3CZAP041071	\N	\N
1836	1830	RANG ROVER	غير محدد	501-4366	اسود	2017	\N	2025-09-01 12:27:09.066139		SALGA3FE2HA360143	\N	\N
1839	1833	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:09.356582		\N	\N	\N
1842	1836	AUDI	A8	509-6166	\N	2012	\N	2025-09-01 12:27:09.647233		WAURGB4H2CN001444	\N	\N
1845	1839	VW	GOLF6	5112EBB-السعودية	فضي	2010	\N	2025-09-01 12:27:09.937106	2.0TSI	WVWEH31K9AW259665	\N	\N
1848	1842	VW	GOLF	510-1121	فضي	2012	\N	2025-09-01 12:27:10.227828	BSE	WVWCF21KXCW230721	\N	\N
1851	1845	سكودا	اوكتافيا	016187-دمشق	اسود	2011	\N	2025-09-01 12:27:10.518172	1.6MPI	TMBBA41Z0B2056697	\N	\N
1854	1848	سكودا	اوكتافيا1	263965-حمص	اسود	2003	\N	2025-09-01 12:27:10.811368	1.6MPI	TMBCK11U732815657	\N	\N
1857	1851	VW	PASSAT CC	725500-دمشق	ذهبي	2009	\N	2025-09-01 12:27:11.102556	2.0TSI	WVWZZZ3CZ9E557066	\N	\N
1660	1654	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:51.87838		\N	\N	\N
1662	1656	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:52.181424		\N	\N	\N
1665	1659	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:52.473711		\N	\N	\N
1668	1662	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:52.763895		\N	\N	\N
1671	1665	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:53.058458		\N	\N	\N
1674	1668	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:53.348917		\N	\N	\N
1677	1671	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:53.643736		\N	\N	\N
1680	1674	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:53.936322		\N	\N	\N
1684	1677	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:54.230187		\N	\N	\N
1686	1680	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:54.519471		\N	\N	\N
1689	1683	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:54.808281		\N	\N	\N
1692	1686	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:55.101007		\N	\N	\N
1695	1689	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:55.391498		\N	\N	\N
1698	1692	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:55.681644		\N	\N	\N
1701	1695	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:55.970943		\N	\N	\N
1705	1699	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:56.270199		\N	\N	\N
1708	1702	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:56.573497		\N	\N	\N
1711	1705	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:56.870753		\N	\N	\N
1714	1708	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:57.160737		\N	\N	\N
1717	1711	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:57.45243		\N	\N	\N
1720	1714	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:57.742394		\N	\N	\N
1723	1717	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:58.038019		\N	\N	\N
1726	1720	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:58.327729		\N	\N	\N
1729	1723	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:58.6171		\N	\N	\N
1732	1726	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:58.911996		\N	\N	\N
1735	1729	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:59.200311		\N	\N	\N
1738	1732	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:59.489056		\N	\N	\N
1741	1735	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:26:59.777692		\N	\N	\N
1744	1738	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:00.06704		\N	\N	\N
1747	1741	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:00.354525		\N	\N	\N
1750	1744	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:00.64288		\N	\N	\N
1753	1747	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:00.932562		\N	\N	\N
1756	1750	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:01.226768		\N	\N	\N
1759	1753	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:01.518377		\N	\N	\N
1762	1756	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:01.810159		\N	\N	\N
1765	1759	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:02.099695		\N	\N	\N
1768	1762	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:02.389093		\N	\N	\N
1771	1765	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:02.678683		\N	\N	\N
1774	1768	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:02.970673		\N	\N	\N
1777	1771	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:03.279163		\N	\N	\N
1780	1774	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:03.571208		\N	\N	\N
1783	1777	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:03.866404		\N	\N	\N
1786	1780	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:04.164988		\N	\N	\N
1789	1783	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:04.465838		\N	\N	\N
1792	1786	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:04.758299		\N	\N	\N
1795	1789	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:05.050653		\N	\N	\N
1798	1792	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:05.346561		\N	\N	\N
1801	1795	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:05.645579		\N	\N	\N
1804	1798	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:05.938992		\N	\N	\N
1807	1801	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:06.228802		\N	\N	\N
1810	1804	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:06.519246		\N	\N	\N
1813	1807	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:06.813116		\N	\N	\N
1816	1810	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:07.113131		\N	\N	\N
1819	1813	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:07.427082		\N	\N	\N
1822	1816	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:07.717131		\N	\N	\N
1825	1819	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:08.006922		\N	\N	\N
1828	1822	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:08.300523		\N	\N	\N
1831	1825	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:08.589865		\N	\N	\N
1834	1828	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:08.8821		\N	\N	\N
1838	1831	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:09.328714		\N	\N	\N
1841	1835	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:09.618306		\N	\N	\N
1844	1838	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:09.906208		\N	\N	\N
1847	1841	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:10.198164		\N	\N	\N
1850	1844	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:10.491666		\N	\N	\N
1853	1847	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:10.787223		\N	\N	\N
1856	1850	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:11.07805		\N	\N	\N
1859	1853	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:11.368463		\N	\N	\N
1862	1856	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:11.661178		\N	\N	\N
1865	1859	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:11.951165		\N	\N	\N
1868	1862	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:12.243645		\N	\N	\N
1871	1865	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:12.534163		\N	\N	\N
1874	1868	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:12.82616		\N	\N	\N
1877	1871	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:13.118909		\N	\N	\N
1880	1874	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:13.409219		\N	\N	\N
1883	1877	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:13.701853		\N	\N	\N
1886	1880	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:13.996656		\N	\N	\N
1889	1883	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:14.289933		\N	\N	\N
1892	1886	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:14.581442		\N	\N	\N
1895	1889	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:14.871445		\N	\N	\N
1898	1892	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:15.161814		\N	\N	\N
1901	1895	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:15.452722		\N	\N	\N
1860	1854	VW	PASSAT CC	15255-حلب	فضي	2012	\N	2025-09-01 12:27:11.393815	TDA	WVWZZZ3CZCE705323	\N	\N
1863	1857	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:11.684396		\N	\N	\N
1866	1860	سكودا	اوكتافيا	892242-دمشق	فضي	2005	\N	2025-09-01 12:27:11.976394		TMBCA11Z452102765	\N	\N
1872	1866	PORSCHE	CAYENNE	G330533	ازرق	2005	\N	2025-09-01 12:27:12.559398		WP1ZZZ9PZ5LA81251	\N	\N
1875	1869	VW	PASSAT B6	749407-دمشق	اسود	2008	\N	2025-09-01 12:27:12.850603	2.0TSI - BZB	WVWZZZ3CZ8P098342	\N	\N
1878	1872	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:13.140848		\N	\N	\N
1881	1875	AUDI	A8	12-35989	أزرق سماوي غامق	2006	\N	2025-09-01 12:27:13.432977	BFM	WAUZZZ4E26N014711	\N	018454 - دمشق
1884	1878	اودي	Q5	990608-حماه	اسود	2011	\N	2025-09-01 12:27:13.723868	2.0TSI-CDN	WAUCFC8R1BA065935	\N	\N
1887	1881	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:14.013145		\N	\N	\N
1890	1884	VW	PASSAT CC	20-65668 الكويت	دهبي	2013	\N	2025-09-01 12:27:14.304665	1800.TSI	WVWAB1AN7DE517853	\N	\N
1893	1887	VW	PASSAT CC R36	509409-دمشق	ابيض	2010	\N	2025-09-01 12:27:14.595163	3.6FSI-BWS	WVWZZZ3CZAE565559	\N	\N
1896	1890	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:14.885053		\N	\N	\N
1899	1893	AUDI	A6	798476-دمشق	BLACK	2009	\N	2025-09-01 12:27:15.175992	2.4 BDW V6	WAUZZZ4F19N001414	\N	\N
1902	1896	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:15.46668		\N	\N	\N
1905	1899	VW	TOURAN	226531-حمص	رصاصي	\N	\N	2025-09-01 12:27:15.757076		\N	\N	\N
1908	1902	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:16.046992		\N	\N	\N
1911	1905	volkswegan	polo	505443	فضي	2006	\N	2025-09-01 12:27:16.337423		9bwjb09n46p002837	\N	\N
1913	1908	AUDI	S6	509-3240	أسود	2016	\N	2025-09-01 12:27:16.627263	CTGE	WAUB2CFC4GN120285	\N	\N
1917	1911	AUDI	A6	796113 - دمشق	رمادي غامق	2009	\N	2025-09-01 12:27:16.919086	BPJ	WAUZZZ4F29N001034	\N	\N
1920	1914	اودي	A4-B6	152962-دمشق	رمادي	2002	\N	2025-09-01 12:27:17.209436	1.6-ALZ	WAUZZZ8E62A119585	\N	\N
1923	1917	VW	PASSAT B6	332000-حماة	فضي	2007	\N	2025-09-01 12:27:17.500283		WVWZZZ3CZ7P097284	\N	\N
1926	1920	VW	JETTA	408550	فضي	2008	\N	2025-09-01 12:27:17.790441	1.6/BSF	WVWZZZ1KZ8M073681	\N	\N
1928	1923	VW	PASSAT CC	682825 - دمشق	اسود	2011	\N	2025-09-01 12:27:18.082561	CDA	WVWAB13C0BE748991	\N	\N
1931	1925	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:18.377704		\N	\N	\N
1934	1928	سكودا	سوبيرب	454554-طرطوس	فضي	2010	\N	2025-09-01 12:27:18.667216	2.0TSI	TMBAB83T8A9014566	\N	\N
1937	1931	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:18.957487		\N	\N	\N
1940	1934	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:19.248109		\N	\N	\N
1943	1937	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:19.539112		\N	\N	\N
1946	1940	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:19.829508		\N	\N	\N
1869	1863	AUDI	Q7	562310	ذهبي	2007	\N	2025-09-01 12:27:12.267523		WAYAV94L57D047300	\N	G 568864لبنان
1952	1946	AUDI	A4	512-5809	أبيض	2010	\N	2025-09-01 12:27:20.40986	CAEB	WAUZZZ8KXAN014741	\N	\N
1955	1949	AUDI	A6	793885 - دمشق	فضي	2008	\N	2025-09-01 12:27:20.700531	BDW	WAUZZZ4F08N029395	\N	\N
1958	1952	VW	PASSAT	881778 - دمشق	حديدي	2006	\N	2025-09-01 12:27:20.990619	BVY	WVWZZZ3CZ6P225519	\N	\N
1964	1958	VW	TIGUAN	513-4851	اسود	2011	\N	2025-09-01 12:27:21.570502	CCZ	WVGCE25N3BW037229	\N	\N
1967	1961	VW	PASSAT B6	346428-دمشق	اسود	2010	\N	2025-09-01 12:27:21.861863	2.0TFSI-BWA	WVWZZZ3CZAP027685	\N	\N
1970	1964	SKODA	OCTAVIA	819994 - حمص	فضي	2006	\N	2025-09-01 12:27:22.152316	BSF	TMBBA61Z762252590	\N	\N
1972	1967	VW	PASSAT	594881 - حمص	اسود	2010	\N	2025-09-01 12:27:22.443869	BSF	WVWZZZ3CZAP027209	\N	\N
1975	1969	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:22.734488		\N	\N	\N
1978	1972	skoda	octavia	752873 -  دمشق	خمري	2008	\N	2025-09-01 12:27:23.024976	BSF	TMBBA41Z882078780	\N	\N
1981	1975	AUDI	A6	قطر	فضي	2012	\N	2025-09-01 12:27:23.316699		WAUAFC4GXCN058455	\N	\N
1984	1978	اودي	A6	698888-دمشق	اسود	\N	\N	2025-09-01 12:27:23.607313		\N	\N	\N
1987	1981	VW	PASSAT	899187 - حلب	رصاصي	2006	\N	2025-09-01 12:27:23.897565	BVZ	WVWZZZ3CZ6P118530	\N	\N
1990	1984	AUDI	A6	798476 - دمشق	أسود	2009	\N	2025-09-01 12:27:24.189104	BDW	WAUZZZ4F19N001414	\N	\N
1993	1987	VW	SCIROCCO	483212-دمشق	ابيض	2009	\N	2025-09-01 12:27:24.479897	2.0TSI	WVWZZZ13Z9V016063	\N	\N
1996	1990	VW	GOLF 6 GTI	727981-دمشق	ابيض	2010	\N	2025-09-01 12:27:24.770735	CCZ-2.0TSI	WVWZZZ1KZAW410862	\N	\N
1999	1993	سكودا	أوكتافيا2	466009-اللاذقية	فضي	2010	\N	2025-09-01 12:27:25.061517	1.6MPI-BSF	TMBBA41Z1A2010262	\N	\N
2002	1996	VW	PASSAT B5	406634-حلب	ابيض	2002	\N	2025-09-01 12:27:25.357822	1.6MPI	WVWZZZ3BZ2E422824	\N	\N
2005	1999	VW	PASSAT	555849-دمشق	ابيض	2009	\N	2025-09-01 12:27:25.647967	2.0TSI-CCZ	WVWZZZ3CZ9P047870	\N	\N
2008	2002	VW	VW GOLF	12-18468	ابيض	2011	\N	2025-09-01 12:27:25.940291	CAW	WVWZZZ1KZAW304715	\N	\N
2011	2005	اودي	A8	350184-دمشق	اسود	2001	\N	2025-09-01 12:27:26.231573	AUW-4.2	WAUZZZ4DZ1N012670	\N	\N
2014	2008	VW	PASSAT	594809 - حمص	أبيض	2010	\N	2025-09-01 12:27:26.525086	BSF	WVWZZZ3CZAP030364	\N	\N
2017	2011	VW	PASSAT	450019 - دمشق	أزرق داكن	2002	\N	2025-09-01 12:27:26.816793	AWT	WVWZZZ3BZ2E426241	\N	\N
2020	2014	AUDI	Q7	8152 -XRJ  سعودية	رمادي	2014	\N	2025-09-01 12:27:27.107233		WA1AGDFEXED011365	\N	\N
2023	2017	AUDI	A4	525-9165	\N	2017	\N	2025-09-01 12:27:27.399235	CYD	\N	\N	\N
2026	2020	سكودا	اوكتافيا	851154-حمص	سماوي	2005	\N	2025-09-01 12:27:27.691716	1.6MPI	TMBCA11Z352102868	\N	\N
2029	2023	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:27.983176		\N	\N	\N
2032	2026	VW	PASSAT	452488 - طرطوس	فضي	2010	\N	2025-09-01 12:27:28.274669	BZB	WVWZZZ3CZAP028898	\N	\N
2035	2029	AUDI	A6	888892	فضي	2008	\N	2025-09-01 12:27:28.565806		WAUAF64F28N011890	\N	\N
2041	2035	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:29.153353		\N	\N	\N
2044	2038	AUDI	Q7	510-3162	ابيض	2011	\N	2025-09-01 12:27:29.444718	CJTC	WAUAGD4L2BD023087	\N	\N
2047	2041	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:29.735565		\N	\N	\N
2050	2044	SKODA	FABIA	587133 - حمص	ازرق فاتح	2007	\N	2025-09-01 12:27:30.026375	AZQ	TMBCY46Y174109368	\N	\N
2053	2047	AUDI	A6	508-5020	أبيض	2011	\N	2025-09-01 12:27:30.316815	CDY	WAUZZZ4F3BN034663	\N	\N
2059	2053	AUDI	A6	519-1799	فضي رمادي	2011	\N	2025-09-01 12:27:30.898323	CCA	WAUZZZ4F4BN061595	\N	\N
2062	2056	VW	PASSAT  CC	506-9747	أبيض	2010	\N	2025-09-01 12:27:31.188634	CBB  ديزل	WVWZZZ3CZAE518794	\N	\N
2065	2059	AUDI	A4	860571	فضي	2007	\N	2025-09-01 12:27:31.484166	ALT	WAUZZZ8EX7A280660	\N	\N
1904	1898	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:15.751578		\N	\N	\N
1907	1901	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:16.042885		\N	\N	\N
1910	1904	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:16.333921		\N	\N	\N
1914	1907	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:16.628271		\N	\N	\N
1916	1910	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:16.917711		\N	\N	\N
1919	1913	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:17.206276		\N	\N	\N
1922	1916	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:17.496453		\N	\N	\N
1925	1919	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:17.786039		\N	\N	\N
1929	1922	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:18.215344		\N	\N	\N
1932	1926	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:18.506759		\N	\N	\N
1935	1929	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:18.795695		\N	\N	\N
1938	1932	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:19.089717		\N	\N	\N
1941	1935	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:19.376808		\N	\N	\N
1944	1938	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:19.667362		\N	\N	\N
1947	1941	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:19.956275		\N	\N	\N
1950	1944	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:20.248718		\N	\N	\N
1953	1947	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:20.542113		\N	\N	\N
1956	1950	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:20.843367		\N	\N	\N
1959	1953	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:21.137108		\N	\N	\N
1962	1956	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:21.434826		\N	\N	\N
1965	1959	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:21.725358		\N	\N	\N
1968	1962	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:22.015539		\N	\N	\N
1971	1965	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:22.304204		\N	\N	\N
1974	1968	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:22.593695		\N	\N	\N
1977	1971	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:22.883755		\N	\N	\N
1980	1974	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:23.179968		\N	\N	\N
1983	1977	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:23.46804		\N	\N	\N
1986	1980	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:23.768953		\N	\N	\N
1989	1983	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:24.067034		\N	\N	\N
1992	1986	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:24.359734		\N	\N	\N
1995	1989	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:24.653767		\N	\N	\N
1998	1992	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:24.947218		\N	\N	\N
2001	1995	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:25.245859		\N	\N	\N
2004	1998	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:25.537737		\N	\N	\N
2007	2001	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:25.828847		\N	\N	\N
2010	2004	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:26.12909		\N	\N	\N
2013	2007	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:26.421801		\N	\N	\N
2016	2010	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:26.711111		\N	\N	\N
2019	2013	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:27.006322		\N	\N	\N
2022	2016	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:27.299818		\N	\N	\N
2025	2019	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:27.598796		\N	\N	\N
2028	2022	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:27.890993		\N	\N	\N
2031	2025	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:28.183645		\N	\N	\N
2034	2028	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:28.484866		\N	\N	\N
2037	2031	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:28.781463		\N	\N	\N
2040	2034	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:29.07304		\N	\N	\N
2043	2037	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:29.367624		\N	\N	\N
2046	2040	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:29.66396		\N	\N	\N
2049	2043	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:29.953591		\N	\N	\N
2052	2046	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:30.24742		\N	\N	\N
2055	2049	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:30.538072		\N	\N	\N
2058	2052	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:30.831922		\N	\N	\N
2061	2055	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:31.122801		\N	\N	\N
2064	2058	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:31.414792		\N	\N	\N
2067	2061	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:31.70845		\N	\N	\N
2070	2064	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:32.003391		\N	\N	\N
2073	2067	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:32.293314		\N	\N	\N
2076	2070	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:32.582822		\N	\N	\N
2079	2073	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:32.875398		\N	\N	\N
2082	2076	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:33.171163		\N	\N	\N
2085	2079	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:33.475063		\N	\N	\N
2088	2082	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:33.781878		\N	\N	\N
2091	2085	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:34.076693		\N	\N	\N
2094	2088	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:34.365233		\N	\N	\N
2068	2062	AUDI	A4	513-6936	أبيض	2011	\N	2025-09-01 12:27:31.774953	CAEB	WAUZZZ8K3BN038879	\N	\N
2071	2065	VW	TIGUAN	510874 - دمشق	اسود	2009	\N	2025-09-01 12:27:32.065236	CAW	WVGZZZ5NZ9W080778	\N	\N
2074	2068	AUDI	A6	505-3825	ابيض	2016	\N	2025-09-01 12:27:32.356868	CVPA/2.8	WAUBHCFC6GN109304	\N	\N
2077	2071	سكودا	اوكتافيا2	695473-دمشق	فضي	2011	\N	2025-09-01 12:27:32.647529	1.6MPI	TMBBA41Z9B2103032	\N	\N
2080	2074	AUDI	A6	522-7106	فضي	2013	\N	2025-09-01 12:27:32.939988	V6 3.0T/CTUA	WAUZZZ4GXDN084827	\N	\N
2083	2077	AUDI	Q5	523-5451	فضي ( حديدي)	2016	\N	2025-09-01 12:27:33.230334		\N	\N	\N
2086	2080	SKODA	OCTAVIA	332762 - طرطوس	أبيض	2010	\N	2025-09-01 12:27:33.521168	BSF	TMBBA41Z4A2062372	\N	\N
2089	2083	VW	GOLF R	518-2382	أسود	2015	\N	2025-09-01 12:27:33.812092	CJXB	WVWGR2AU3FW026311	\N	\N
2092	2086	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:34.10229		\N	\N	\N
2095	2089	سكودا	اوكتافيا	312967-دمشق	فضي	\N	\N	2025-09-01 12:27:34.393402		\N	\N	\N
2097	2091	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:34.658428		\N	\N	\N
2098	2092	Audi	A4	210303- حلب	فضي	2010	\N	2025-09-01 12:27:34.683699	CAEA	WAUZZZ8K5AA045211	\N	\N
2100	2094	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:34.961306		\N	\N	\N
2101	2095	VW	PASSAT B5	974605-دمشق	رمادي	2005	\N	2025-09-01 12:27:34.973177	1.6-ALZ	WVWZZZ3BZ5P007991	\N	\N
2103	2098	AUDI	Q7	505-6690	رمادي	2019	\N	2025-09-01 12:27:35.264275	CYMC	WA1AHAF77KD019660	\N	\N
2104	2097	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:35.286687		\N	\N	\N
2106	2100	سكودا	اوكتافيا2	423555-حمص	اسود	2009	\N	2025-09-01 12:27:35.56136	2.0TSI	TMBBA41Z792024176	\N	\N
2107	2101	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:35.603265		\N	\N	\N
2109	2103	اودي	A4	697930-دمشق	اسود	\N	\N	2025-09-01 12:27:35.852405		\N	\N	\N
2110	2104	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:35.893185		\N	\N	\N
2112	2106	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:36.144856		\N	\N	\N
2113	2107	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:36.187974		\N	\N	\N
2115	2109	AUDI	A8-D4	504-7810	اسود	2011	\N	2025-09-01 12:27:36.435054		WAUZZZ4H2BN020772	\N	\N
2117	2110	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:36.653342		\N	\N	\N
2118	2112	AUDI	S8	2635-523	رمادي	2013	\N	2025-09-01 12:27:36.725613	CGTA	WAUZZZ4H8DN019564	\N	\N
2120	2114	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:36.942021		\N	\N	\N
2121	2115	VW	TOURAN	967368-دمشق	فضي	2004	\N	2025-09-01 12:27:37.016371		WVGZZZ1TZ4W109703	\N	\N
2123	2117	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:37.233941		\N	\N	\N
2124	2118	VW	GOLF	742660	ابيض	2008	\N	2025-09-01 12:27:37.307737	BSF	WVWZZZ1KZ8W149054	\N	\N
2126	2120	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:37.526664		\N	\N	\N
2127	2121	Audi	A6	880216-دمشق	دهبي	2006	\N	2025-09-01 12:27:37.598677	2.4	WAUZZZ4F86N182233	\N	\N
2129	2123	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:37.820346		\N	\N	\N
2130	2124	غير محدد	Q7	501500 دمشق	فضي	2011	\N	2025-09-01 12:27:37.889766		\N	\N	\N
2132	2126	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:38.114022		\N	\N	\N
2133	2127	VW	Passat	595208 حمص	أبيض	2009	\N	2025-09-01 12:27:38.180971	BSF	WVWZZZ3CZ9P045924	\N	\N
2135	2129	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:38.406502		\N	\N	\N
2136	2130	AUDI	Q7	حلب-الراعي 36987	أبيض	2008	\N	2025-09-01 12:27:38.471983	BAR	WAUAV54L88D048077	\N	\N
2138	2132	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:38.6984		\N	\N	\N
2139	2133	VW	PASSAT	849746 - حمص	أسود	2006	\N	2025-09-01 12:27:38.762748	BVZ	WVWZZZ3CZ6P227001	\N	\N
2141	2135	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:38.989129		\N	\N	\N
2142	2136	VW	TOUAREG	504-2535	WHITE	2013	\N	2025-09-01 12:27:39.054973	3.6	WVGBC2BR8DD005771	\N	\N
2144	2138	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:39.279803		\N	\N	\N
2145	2139	VW	TIGUAN	504-2537	فضي	2012	\N	2025-09-01 12:27:39.34593	CAW	WVGCE15N3CW510929	\N	\N
2147	2141	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:39.573609		\N	\N	\N
2148	2142	VW	PASSAT CC	521-1504	أبيض	2013	\N	2025-09-01 12:27:39.636297	BWS	WVWAD2AN9DE528157	\N	\N
2150	2144	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:39.864002		\N	\N	\N
2151	2145	skoda	octavia	415515 - حمص	فضي	2007	\N	2025-09-01 12:27:39.927248	1.6 SR	TMBBA41Z672112424	\N	\N
2153	2147	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:40.153009		\N	\N	\N
2154	2148	AUDI	A8L	503-1246	أبيض	2016	\N	2025-09-01 12:27:40.224435	CTGA	WAU2BFD8GN00308	\N	\N
2156	2150	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:40.444828		\N	\N	\N
2157	2151	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:40.515459		\N	\N	\N
2159	2153	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:40.734339		\N	\N	\N
2161	2156	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:41.024229		\N	\N	\N
2165	2159	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:41.318393		\N	\N	\N
2167	2161	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:41.60987		\N	\N	\N
2171	2164	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:41.900472		\N	\N	\N
2173	2167	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:42.189965		\N	\N	\N
2176	2170	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:42.480158		\N	\N	\N
2179	2173	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:42.7702		\N	\N	\N
2182	2176	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:43.062393		\N	\N	\N
2185	2179	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:43.351282		\N	\N	\N
2188	2182	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:43.642617		\N	\N	\N
2191	2185	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:43.935262		\N	\N	\N
2194	2188	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:44.223837		\N	\N	\N
2197	2191	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:44.513795		\N	\N	\N
2200	2194	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:44.803884		\N	\N	\N
2203	2197	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:45.093227		\N	\N	\N
2206	2200	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:45.388538		\N	\N	\N
2209	2203	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:45.684419		\N	\N	\N
2212	2206	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:45.976744		\N	\N	\N
2215	2209	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:46.266379		\N	\N	\N
2218	2212	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:46.56027		\N	\N	\N
2221	2215	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:46.862281		\N	\N	\N
2160	2154	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:40.806345		\N	\N	\N
2163	2157	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:41.098785		\N	\N	\N
2166	2160	اودي	A4	355470-دمشق	فضي	2008	\N	2025-09-01 12:27:41.389455		WAUJC68K58A047211	\N	\N
2169	2163	SKODA	FABIA 1	790877 - حماة	سماوي	2005	\N	2025-09-01 12:27:41.6789		TMBHY46Y254373010	\N	\N
2172	2166	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:41.969365		\N	\N	\N
2175	2169	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:42.262605		\N	\N	\N
2177	2171	VW	PASSAT B5	255655-حمص	اسود	2003	\N	2025-09-01 12:27:42.553513	1.6-ALZ	WVWZZZ3BZ3P394974	\N	\N
2180	2174	VW	JETTA	334558 - دمشق	فضي	2007	\N	2025-09-01 12:27:42.846364	BSF	WVWZZZ1KZ7M046637	\N	\N
2183	2177	AUDI	A6	1373	فضي	2012	\N	2025-09-01 12:27:43.136769		WAUZZZ4F5BN037774	\N	\N
2186	2180	VW	JETTA	236996-حلب	رمادي	\N	\N	2025-09-01 12:27:43.427209		\N	\N	\N
2189	2183	سكودا	اوكتافيا	260447-دمشق	ابيض	\N	\N	2025-09-01 12:27:43.717951		\N	\N	\N
2192	2186	VW	PASSAT B6	411011-حمص	فضي	2008	\N	2025-09-01 12:27:44.009073	1.4TSI-CAX	WVWZZZ3CZ8P000784	\N	\N
2195	2189	VW	GOLF 4	944950-دمشق	ابيض	2001	\N	2025-09-01 12:27:44.299489		WVWZZZ1JZ1W672029	\N	\N
2198	2192	VW	GOLF	690097-دمشق	ابيض	\N	\N	2025-09-01 12:27:44.590152		\N	\N	\N
2201	2195	سكودا	اوكتافيا2	409678-دمشق	بنفسجي	2009	\N	2025-09-01 12:27:44.880418	2.0TFSI-BWA	TMBDA41Z19C000328	\N	\N
2204	2198	VW	PASSAT	511-6052	رمادي	2013	\N	2025-09-01 12:27:45.170829	CBU	1VWZZZA3ZDC035939	\N	\N
2207	2201	AUDI	Q7	506-4393	اسود	2014	\N	2025-09-01 12:27:45.461948	CJTC	WA1DGAFE6ED004697	\N	\N
2210	2204	اودي	A6	233342-دمشق	ذهبي	2006	\N	2025-09-01 12:27:45.753341	2.4-BDW	WAUZZZ4F56N080064	\N	\N
2213	2207	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:46.046423		\N	\N	\N
2216	2210	VW	TAUOREG	225725 - دمشق	فضي	2005	\N	2025-09-01 12:27:46.337043	BMV	WVGZZZ7LZ5D065840	\N	\N
2219	2213	AUDI	Q7	505-1629	أسود	2013	\N	2025-09-01 12:27:46.62693	CJT	WAUAGD4L4DD000638	\N	\N
2222	2216	سكودا	اوكتافيا 1	407121-حمص	ابيض	2008	\N	2025-09-01 12:27:46.916486	1.6MPI/AEH	TMBDK41U888841145	\N	\N
2224	2218	اودي	A3	230061-دمشق	سماوي	2006	\N	2025-09-01 12:27:47.218242	1.6	WAUZZZ8P06A042221	\N	\N
2226	2220	VW	PASSAT B6	433887-دمشق	اسود	2007	\N	2025-09-01 12:27:47.50922	1.6FSI-BLF	WVWZZZ3CZ7P081427	\N	\N
2228	2222	VW	TOUAREG	262777-طرطوس	بني	2009	\N	2025-09-01 12:27:47.799912	3.6	WVGZZZ7LZ9D024655	\N	\N
2230	2224	VW	غير محدد	505-1628	\N	\N	\N	2025-09-01 12:27:48.090164	CGRA	\N	\N	\N
2232	2226	AUDI	Q7	501-5260	رمادي	2013	\N	2025-09-01 12:27:48.379962	CJTC	WAUAGD4L3DD000498	\N	\N
2234	2228	اودي	A4	331923-دمشق	اسود	2006	\N	2025-09-01 12:27:48.671817	2.0TFSI	WAUZZZ8E66A164516	\N	\N
2236	2230	اودي	A4	898503-دمشق	اسود	2005	\N	2025-09-01 12:27:48.962872	1.6-ALZ	WAUZZZ8E95A459415	\N	\N
2238	2232	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:49.253698		\N	\N	\N
2240	2234	SKODA	OCTAVIA	735179 - دمشق	فضي	2008	\N	2025-09-01 12:27:49.542772	BSF	TMBBA41Z882046718	\N	\N
2242	2236	AUDI	A4	515-4531	\N	2012	\N	2025-09-01 12:27:49.832796	CDN	WAUZZ8NUCNO12535	\N	\N
2244	2238	AUDI	Q5	502-6985	ابيض	2013	\N	2025-09-01 12:27:50.12785	CDN	WAUCFC8R3DA010146	\N	\N
2246	2240	VW	PASSAT	635282-حلب	رمادي	2011	\N	2025-09-01 12:27:50.419748	CAX	WVWZZZ3CZBE001138	\N	\N
2248	2242	audi	A4-B8	210303/حلب*	فضي	2012	\N	2025-09-01 12:27:50.709582	CAEA	\N	\N	\N
2250	2244	VW	TAUAREG	515-9177	فضي	2016	\N	2025-09-01 12:27:51.000398		WVGBC2BP9GD001409	\N	\N
2252	2246	VW	JETTA 5	449823-دمشق 12-12784	ابيض	2010	\N	2025-09-01 12:27:51.291092	1.6MPI	WVWZZZ1KZAM095560	\N	527646-دمشق/449823-دمشق
2254	2248	VW	PASSAT B6	507692-دمشق	كحلي	\N	\N	2025-09-01 12:27:51.65244	3.2	\N	\N	\N
2256	2250	اودي	A8	483114-دمشق	ابيض	2009	\N	2025-09-01 12:27:51.943685	3.2FSI-BPK	WAUKH54EX9N000668	\N	\N
2258	2252	اودي	Q7	696322-دمشق	ابيض	2007	\N	2025-09-01 12:27:52.242546	4.2FSI-BAR	WAUAV94L57D017648	\N	\N
2260	2254	اودي	A6	334766-طرطوس	اسود	2007	\N	2025-09-01 12:27:52.533609	3.2FSI-AUK	WAUDH74F57N128827	\N	\N
2262	2256	VW	باسات	507-8807	كحلي	2015	\N	2025-09-01 12:27:52.823602	CBT	WVWCR7A32FC001209	\N	\N
2264	2258	VW	PASSAT CC	720664-دمشق	ابيض	2010	\N	2025-09-01 12:27:53.114446	CDA-1.8TSI	WVWZZZ3CZAE550263	\N	\N
2266	2260	VW	PASSAT B6	331820-دمشق	اسود	2009	\N	2025-09-01 12:27:53.405375	1.8-BZB	WVWZZZ3CZ9P031526	\N	\N
2268	2262	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:53.694967		\N	\N	\N
2270	2264	VW	PASSAT	482707 - دمشق	أسود	2005	\N	2025-09-01 12:27:53.985476	AZM	WVWZZZ3BZ5E101564	\N	\N
2274	2268	VW	TOUAREG	508-1302	بني	2013	\N	2025-09-01 12:27:54.567564		WVGBC2BP9DD003558	\N	\N
2276	2270	VOLKSWEGAN	GOLF	503-3798	ابيض	2016	\N	2025-09-01 12:27:54.857132		WVWFK2AU7GW142032	\N	\N
2278	2272	AUDI	A4	12-18295	أسود	2002	\N	2025-09-01 12:27:55.149283	AVU	WAUZZZ8EB2A313566	\N	\N
2280	2274	SKODA	OCTAVIA	596637 - حمص	أخضر فاتح	2008	\N	2025-09-01 12:27:55.439781	AEH	TMBDK41U088845139	\N	\N
2282	2276	سكودا	اوكتافيا	531738-حماة	اسود	\N	\N	2025-09-01 12:27:55.730396		\N	\N	\N
2284	2278	سكودا	أوكتافيا	647089	فضي	2007	\N	2025-09-01 12:27:56.02541	BSF	XMBCA11ZX72074733	\N	\N
2288	2282	AUDI	Q7	510-7655	أبيض	2012	\N	2025-09-01 12:27:56.616917		WAUAGD4L9BD022258	\N	\N
2290	2284	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:56.90917		\N	\N	\N
2292	2286	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:27:57.200396		\N	\N	\N
2294	2288	AUDI	A6	515-1052	ابيض	2014	\N	2025-09-01 12:27:57.4917	CDA	WAUAFCFC5EN001383	\N	\N
2296	2290	SKODA	OCTAVIA	852831 - حمص	ابيض	2007	\N	2025-09-01 12:27:57.781289	BLR	TMBBA41Z272041254	\N	\N
2300	2294	SKODA	OCTAVIA	946765-دمشق	اسود	2001	\N	2025-09-01 12:27:58.364151		TMBBK41U912519680	\N	\N
2302	2296	AUDI	A6	514-4024	نيلي	2010	\N	2025-09-01 12:27:58.656988	CCA	WAUZZZ4F6AN015037	\N	\N
2304	2298	AUDI	A8 L	014151 - دمشق	أسود	2010	\N	2025-09-01 12:27:58.947267		WAUSHB4E4AN000149	\N	\N
2306	2300	اودي	A6	696739-دمشق	فضي	2010	\N	2025-09-01 12:27:59.23986	2.0TFSI-BPJ	WAUZZZ4FXAN045092	\N	\N
2308	2302	AUDI	2010	501-5628	نيلي	\N	\N	2025-09-01 12:27:59.536322		WAUCFC8RXAA024542	\N	\N
2310	2304	VW	PASSAT	521708-دمشق	فضي	2007	\N	2025-09-01 12:27:59.827389		WVWZZZ3CZ6P157692	\N	\N
2314	2308	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:28:00.41419		\N	\N	\N
2316	2310	SKODA	OCTAVIA	406906-حمص	نيلي	2007	\N	2025-09-01 12:28:00.70509	BSE	TMBDK41U378881387	\N	\N
2318	2312	skoda	octavia	479794 - دمشق	سماوي	2006	\N	2025-09-01 12:28:00.994674	BLR	TMBBD41ZX62134299	\N	\N
2320	2314	سكودا	اوكتافيا2	679212-اللاذقية	فضي	2011	\N	2025-09-01 12:28:01.285367	1.6MPI	TMBBA41Z0B2057204	\N	\N
2322	2316	VW	PASSAT CC	514-5965	أبيض	2013	\N	2025-09-01 12:28:01.576304	CBF	WVWZZZ3CZDE520225	\N	\N
2324	2318	VW	PASSAT CC	604510-اللاذقية	ابيض	2011	\N	2025-09-01 12:28:01.867367	2.0TSI	WVWZZZ3CZBE744686	\N	\N
2326	2320	SEAT	CORDOBA	حمص - 266173	أبيض	2003	\N	2025-09-01 12:28:02.157648		VSSZZZ6LZ3R261993	\N	\N
2328	2322	SKODA	FABIA	458116 - حمص	اسود	2010	\N	2025-09-01 12:28:02.449633	1.2 - لايوجد معلومات آخرى	TMBJH45J8A3179216	\N	\N
2330	2324	VW	PASSAT B6	938808-دمشق	اسود	2006	\N	2025-09-01 12:28:02.740507	2.0FSI-BVZ	WVWZZZ3CZ6P227007	\N	\N
2332	2326	VW	PASSAT	569359-دمشق	رصاصي	2006	\N	2025-09-01 12:28:03.031693		\N	\N	\N
2334	2328	VW	PASSAT B6	465515-دمشق	فضي	2009	\N	2025-09-01 12:28:03.326613		\N	\N	\N
2336	2330	اودي	A6	319689-دمشق	اسود	2009	\N	2025-09-01 12:28:03.617313	2.4-BDW	WAUZZZ4F49N001519	\N	\N
2338	2332	VW	PASSAT	881778 - دمشق	حديدي	2006	\N	2025-09-01 12:28:03.90826	BVY	WVWZZZ3CZ6P225519	\N	\N
2340	2334	اودي	A4	135818-دمشق	ازرق	2003	\N	2025-09-01 12:28:04.19934	1.6-ALZ	WAUZZZ8E83A407612	\N	\N
2342	2336	AUDI	Q7	502-1157	أسود	2014	\N	2025-09-01 12:28:04.490453	CJT	WA1AGDFE0ED000407	\N	\N
2344	2338	skoda	fabia	877580 - دمشق	أسود	2001	\N	2025-09-01 12:28:04.783363	1.4 MPI	TMBHB46YX13261752	\N	\N
2346	2340	اودي	A6	502794-دمشق	اسود	2007	\N	2025-09-01 12:28:05.075741	2.0TSI	WAUZZZ4F17N113790	\N	\N
2348	2342	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:28:05.366409		\N	\N	\N
2350	2344	اودي	A6	502794-دمشق	اسود	2007	\N	2025-09-01 12:28:05.65726	2.0TSI - BPJ	WAUZZZ4F17N113790	\N	\N
2352	2346	VW	PASSAT R36	793098-دمشق	اسود	2010	\N	2025-09-01 12:28:05.949132	BWS-3.6FSI	WVWZZZ3CZAP028291	\N	\N
2354	2348	سكودا	اوكتافيا	885094-دمشق	فضي	2008	\N	2025-09-01 12:28:06.240172	1.6	TMBCA41Z782235641	\N	\N
2356	2350	SKODA	OCTAVIA	849295 - حمص	أبيض	2005	\N	2025-09-01 12:28:06.530725	BSF	TMBBA41Z152102980	\N	\N
2358	2352	SKODA	OCTAVIA	12-45828	خمري	2010	\N	2025-09-01 12:28:06.821674	لايوجد - TSI	TMBBA41Z6A2095894	\N	\N
2360	2354	PORSCHE	CAYENNE	511-2109	اسود	2014	\N	2025-09-01 12:28:07.118105		WP1ZZZ92ZELA08166	\N	\N
2362	2356	AUDI	A6	506-5937	ابيض	2016	\N	2025-09-01 12:28:07.408864	CVPA	WAUBHCFC5GN003233	\N	\N
2364	2358	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:28:07.699673		\N	\N	\N
2366	2360	سكودا	SUPERB2	708300-دمشق	خمري	2009	\N	2025-09-01 12:28:07.991754	1.8TSI-CDA	TMBAB83T299039247	\N	\N
2368	2362	AUDI	Q7	501-7871	اسود	2007	\N	2025-09-01 12:28:08.284351	BHK	WA1BY74L87D027233	\N	\N
2370	2364	AUDI	A6	508-7119	ابيض	2010	\N	2025-09-01 12:28:08.575221		WAUBGC4F6AN072827	\N	\N
2372	2366	اودي	A6	596552-حمص	اسود	2007	\N	2025-09-01 12:28:08.86618	BPJ	WAUZZZ4F17N113871	\N	\N
2374	2368	SKODA	OCTAVIA	896999	أسود	2009	\N	2025-09-01 12:28:09.155837		TMBBA41Z562220693	\N	\N
2376	2370	VW	PASSAT	497325-دمشق	ابيض	2009	\N	2025-09-01 12:28:09.446433	2.0TSI	WVWZZZ3CZ9P036689	\N	\N
2378	2372	اودي	Q7-4L	501002-دمشق	ابيض	2007	\N	2025-09-01 12:28:09.737744	4.2FSI-BAR	WAUAV94L47D058076	\N	\N
2382	2376	AUDI	A8	000087 - دمشق	اسود	2006	\N	2025-09-01 12:28:10.327688	BPK	WAUKH44E76N025906	\N	\N
2384	2378	سكودا	اوكتافيا2	757805-دمشق	ابيض	2010	\N	2025-09-01 12:28:10.618933		TMBDX41U3A8850021	\N	\N
2386	2380	SKODA	OCTAVIA	556869 - اللاذقية	رمادي	2010	\N	2025-09-01 12:28:10.910665	BSF	TMBCA41Z3A2096243	\N	\N
2388	2382	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:28:11.200356		\N	\N	\N
2390	2384	SKODA	OCTAVIA	424639 - حمص	أسود	2008	\N	2025-09-01 12:28:11.491459	BSF	TMBCA11ZX82243456	\N	\N
2392	2386	VW	PASSAT	510-9437	فضي	2015	\N	2025-09-01 12:28:11.781897	CCC	WVWAR7A35FC064098	\N	\N
2394	2388	غير محدد	غير محدد		\N	\N	\N	2025-09-01 12:28:12.073354		\N	\N	\N
2396	2390	GOLF	GTI	692488 دمشق	اسود	2005	\N	2025-09-01 12:28:12.367163	BWA	WVWZZZ1KZ5W252020	\N	\N
2398	2392	سكودا	اوكتافيا2	458877-حمص	فضي	2010	\N	2025-09-01 12:28:12.658673	1.6MPI	TMBBA41Z4A2101249	\N	\N
2400	2394	سكودا	اوكتافيا	621789-حماة	بنفسجي	2010	\N	2025-09-01 12:28:12.950433	1.8TSI-BZB	TMBBA41Z6A2095894	\N	\N
2402	2396	سكودا	اوكتافيا	260460 - طرطوس	خمري	2008	\N	2025-09-01 12:28:13.240908	BSF	TMBBA41Z482050376	\N	\N
2404	2398	VW	PASSAT CC	335336-دمشق	فضي	2010	\N	2025-09-01 12:28:13.531382	2.0TSI	WVWZZZ3CZAE503979	\N	\N
2408	2402	VOLKSWEGAN	GOLF	501-9733	احمر	2012	\N	2025-09-01 12:28:14.112561		WVWLM21K0CW259456	\N	\N
2410	2404	سكودا	اوكتافيا	327999 - طرطوس	أسود	2010	\N	2025-09-01 12:28:14.40314	BSF	TMBBA41Z9A2009800	\N	\N
2412	2406	اودي	A6	515888-حلب	رمادي	2008	\N	2025-09-01 12:28:14.69402	3.0T-CAJ	WAUZZZ4F17N022776	\N	\N
2414	2408	اودي	A8	673340-دمشق	اسود	2004	\N	2025-09-01 12:28:14.991219		WAUZZZ4E14N015586	\N	\N
2416	2410	VW	TIGUAN	13-10768	ابيض	2009	\N	2025-09-01 12:28:15.281569	2.0FSI-BVZ \\ BWA	WVGCE15N69W005038	\N	489132-دمشق
2418	2412	SKODA	Octavia	259261	فضي	2001	\N	2025-09-01 12:28:15.573515		TMBBK41U712502506	\N	\N
2420	2414	اودي	A6	594940-دمشق	فضي	2002	\N	2025-09-01 12:28:15.864356	2.4-APS	WAUZZZ4B02N152673	\N	\N
2422	2416	AUDI	Q5	714247-دمشق	رمادي	2010	\N	2025-09-01 12:28:16.154553	CDN	WAUCFC8R2AA057096	\N	\N
2424	2418	SKODA	OCTAVIA	587688 -  حمص	عسلي	2006	\N	2025-09-01 12:28:16.444991	BSE	TMBBA61Z362235446	\N	\N
2426	2420	AUDI	A6	530-1125	فضي	2014	\N	2025-09-01 12:28:16.738823	CTUA	WAUZZZ463EN012293	\N	\N
2428	2422	سكودا	اوكتافيا2	716540-دمشق	اسود	2010	\N	2025-09-01 12:28:17.028852	1.6MPI	TMBBA41Z4A2019067	\N	\N
3942	3936	VOLKSWAGEN	Passat cc	513-3427	فضي	2013	\N	2025-09-02 10:02:54.441063	لايوجد	WVWADZAN6DE526091	\N	\N
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customers (id, name, phone_number, address, notes, created_at, customer_status, is_favorite) FROM stdin;
3937	كريدي الضاهر	0935971585	\N	\N	2025-09-03 08:07:11.165327	A	0
3938	فراس قنا	0944444073	\N	\N	2025-09-09 12:51:16.063284	A	0
3942	عادل الغفري Q7	0992113654	\N	\N	2025-09-10 10:41:06.701611	A	0
3943	علي علعل	0957966801	\N	\N	2025-09-13 10:33:16.014423	A	0
3944	يحيى شمسيني	0994200591	\N	\N	2025-09-13 10:35:19.683385	A	0
1	عادل الغفري	0992113654	\N	\N	2025-07-15 13:17:29.076347	A	0
3	طلال مخول	0991135368	\N	\N	2025-07-19 08:28:08.060402	A	0
4	محمد قاسم دياب	0933433913	\N	\N	2025-07-19 08:30:00.14136	A	0
5	سيف الدين المذيب	0995526915	\N	\N	2025-07-19 08:33:51.572243	A	0
6	حسان ملوك 	0959490600	\N	\N	2025-07-19 08:37:33.767876	A	0
7	محمد الجوجة	0944464519	\N	\N	2025-07-19 10:37:33.935683	A	0
8	احمد جنيد	0933511905	\N	\N	2025-07-19 10:45:54.138224	A	0
9	محمود ياسين 	0955594442	\N	\N	2025-07-20 07:01:35.133854	A	0
11	رانية الشرابي	0944489799	\N	\N	2025-07-20 09:25:59.741184	A	0
12	فارس بدر	0931864116	\N	\N	2025-07-21 09:30:24.257361	A	0
13	رائد مشارقة	0933606339	\N	\N	2025-07-21 09:54:21.683728	A	0
14	تيسير شحود الاسعد	0938842457	\N	\N	2025-07-21 10:17:36.878979	A	0
15	زاهر شمسي باشا	0944520109	\N	\N	2025-07-22 07:53:55.054354	A	0
16	عمر العوض	0981790867	\N	\N	2025-07-22 11:29:23.413534	A	0
17	رضوان شاكر	0967668280	\N	\N	2025-07-23 08:12:37.972134	A	0
18	مهدي اتاسي	0944558383	\N	\N	2025-07-23 08:45:10.994559	A	0
19	عبد الكريم العمر	0981638211	\N	\N	2025-07-23 10:47:02.490761	A	0
21	وائل سرور	0955594442	\N	\N	2025-07-24 06:21:13.39153	A	0
22	حازم الشيخ سعيد	0941925620	\N	\N	2025-07-24 06:25:52.536143	A	0
24	فراس ديبه	0932053814	\N	\N	2025-07-28 10:37:36.033889	A	0
25	طه زعرور 	0957552413	\N	\N	2025-07-28 11:13:59.000544	A	0
26	عمر طرابلسي	0969581161	\N	\N	2025-08-09 07:41:03.159871	B	0
27	مرتضى لالل	0946473838	\N	\N	2025-08-09 10:46:34.985861	A	0
28	هاشم القاطع	09443232234	\N	\N	2025-08-09 10:55:58.812204	A	0
29	فارس	0988128150	\N	\N	2025-08-09 11:11:32.16368	A	0
30	عمر بي	0956784356	\N	\N	2025-08-10 08:26:50.918847	A	0
31	عمر طا	09564456778	\N	\N	2025-08-10 10:05:30.588463	A	0
32	نبيل الطحله	0933917155	\N	\N	2025-08-16 07:06:04.632897	A	0
35	عماد جرجوره	0944571970	\N	\N	2025-08-16 07:10:23.68162	A	0
36	عبد المجيد كلزلي	0933836779	\N	\N	2025-08-20 07:44:09.363322	A	0
37	عبد السلام اللبابيدي	0944676617	\N	\N	2025-08-21 08:47:33.837416	A	0
38	أحمد هلال	0962933631	\N	\N	2025-08-21 09:01:55.328367	A	0
39	محمد رعد	0941551053	\N	\N	2025-08-21 09:04:35.554587	A	0
41	بلال مهباني	---	\N	\N	2025-08-24 10:24:50.687629	A	0
43	ياسر أبو عمار	----	\N	\N	2025-08-24 10:26:56.017404	A	0
44	ساطع  الجندلي	0996813155	\N	\N	2025-08-25 08:53:38.388885	A	0
45	عبد الحميد أبو الخير	0933727554	\N	\N	2025-08-25 08:55:59.721689	A	0
46	راشد الزرز	0956844056	\N	\N	2025-08-25 09:00:44.167367	A	0
47	عبد المالك الصاج	0936065543	\N	\N	2025-08-27 08:04:43.046044	A	0
48	حسان الصباغ	0935446750	\N	\N	2025-08-27 08:06:59.117712	A	0
49	مهند عبد الصمد	0933308308	\N	\N	2025-09-01 10:34:53.51152	A	0
50	زياد صريع	0944619220	\N	\N	2025-09-01 10:53:01.066713	A	0
23	ميشيل العسس	0935864835	\N	المالك السابق : عمر أبو زيد/0988046464 	2025-07-28 07:28:30.513733	A	0
20	عبد الكريم خرما	0940100049	\N	\N	2025-07-23 12:09:16.824483	A	0
10	ايمن العوير	0969417705	\N	\N	2025-07-20 08:24:52.143931	A	0
51	جمال المغربي	0945833331	\N	\N	2025-09-01 10:58:03.809689	A	0
52	فراس الأتاسي	0932412777	\N	\N	2025-09-01 10:59:42.221598	A	0
54	محمد أكرم الجندلي	0944239888	\N	\N	2025-09-01 11:02:15.423538	A	0
55	محمد عودة	0957267709	\N	\N	2025-09-01 11:05:47.231731	A	0
56	طارق رسلان	0930918776	\N	\N	2025-09-01 11:10:02.174384	A	0
57	هاشم الأتاسي	0994562454	\N	\N	2025-09-01 11:12:37.48987	A	0
58	عبد الرؤوف مبارك	0958929360	\N	\N	2025-09-01 11:14:48.059729	A	0
59	حسان البقاعي	0957339565	\N	\N	2025-09-01 11:20:33.589268	A	0
60	زبون 1				2025-09-01 12:21:11.972429	A	0
61	زبون 2				2025-09-01 12:21:12.315342	A	0
62	زبون 3				2025-09-01 12:21:12.608188	A	0
63	زبون 4				2025-09-01 12:21:12.901021	A	0
64	زبون 5				2025-09-01 12:21:13.193981	A	0
65	زبون 6				2025-09-01 12:21:13.493148	A	0
66	زبون 7				2025-09-01 12:21:13.785673	A	0
67	زبون 8				2025-09-01 12:21:14.077933	A	0
68	زبون 9				2025-09-01 12:21:14.37252	A	0
69	زبون 10				2025-09-01 12:21:14.666448	A	0
70	زبون 11				2025-09-01 12:21:14.957185	A	0
71	زبون 12				2025-09-01 12:21:15.250621	A	0
72	زبون 13				2025-09-01 12:21:15.543043	A	0
73	زبون 14				2025-09-01 12:21:15.838045	A	0
74	زبون 15				2025-09-01 12:21:16.129478	A	0
75	زبون 16				2025-09-01 12:21:16.42289	A	0
76	زبون 17				2025-09-01 12:21:16.715451	A	0
77	زبون 18				2025-09-01 12:21:17.007652	A	0
78	زبون 19				2025-09-01 12:21:17.300199	A	0
79	زبون 20				2025-09-01 12:21:17.59833	A	0
80	زبون 21				2025-09-01 12:21:17.890986	A	0
81	زبون 22				2025-09-01 12:21:18.183249	A	0
82	زبون 23				2025-09-01 12:21:18.476517	A	0
83	زبون 24				2025-09-01 12:21:18.768765	A	0
84	زبون 25				2025-09-01 12:21:19.06528	A	0
85	زبون 26				2025-09-01 12:21:19.358272	A	0
86	زبون 27				2025-09-01 12:21:19.650772	A	0
87	زبون 28				2025-09-01 12:21:19.945796	A	0
88	زبون 29				2025-09-01 12:21:20.237192	A	0
89	زبون 30				2025-09-01 12:21:20.530169	A	0
90	زبون 31				2025-09-01 12:21:20.822751	A	0
91	زبون 32				2025-09-01 12:21:21.115526	A	0
92	زبون 33				2025-09-01 12:21:21.409578	A	0
93	زبون 34				2025-09-01 12:21:21.703196	A	0
94	زبون 35				2025-09-01 12:21:21.998266	A	0
95	زبون 36				2025-09-01 12:21:22.291551	A	0
96	زبون 37				2025-09-01 12:21:22.585216	A	0
97	زبون 38				2025-09-01 12:21:22.877498	A	0
98	زبون 39				2025-09-01 12:21:23.170275	A	0
99	زبون 40				2025-09-01 12:21:23.46247	A	0
100	زبون 41				2025-09-01 12:21:23.755905	A	0
101	زبون 42				2025-09-01 12:21:24.0475	A	0
102	زبون 43				2025-09-01 12:21:24.340413	A	0
103	زبون 44				2025-09-01 12:21:24.632821	A	0
104	زبون 45				2025-09-01 12:21:24.92522	A	0
105	زبون 46				2025-09-01 12:21:25.217862	A	0
106	زبون 47				2025-09-01 12:21:25.510366	A	0
107	زبون 48				2025-09-01 12:21:25.805851	A	0
108	زبون 49				2025-09-01 12:21:26.100022	A	0
109	زبون 50				2025-09-01 12:21:26.39319	A	0
110	زبون 51				2025-09-01 12:21:26.68553	A	0
111	زبون 52				2025-09-01 12:21:26.977607	A	0
112	زبون 53				2025-09-01 12:21:27.269397	A	0
113	زبون 54				2025-09-01 12:21:27.562896	A	0
114	زبون 55				2025-09-01 12:21:27.856172	A	0
115	زبون 56				2025-09-01 12:21:28.147361	A	0
116	زبون 57				2025-09-01 12:21:28.544733	A	0
117	زبون 58				2025-09-01 12:21:28.837169	A	0
118	زبون 59				2025-09-01 12:21:29.129515	A	0
119	زبون 60				2025-09-01 12:21:29.423897	A	0
120	زبون 61				2025-09-01 12:21:29.716997	A	0
121	زبون 62				2025-09-01 12:21:30.00947	A	0
122	زبون 63				2025-09-01 12:21:30.302098	A	0
123	زبون 64				2025-09-01 12:21:30.595995	A	0
124	زبون 65				2025-09-01 12:21:30.888242	A	0
125	زبون 66				2025-09-01 12:21:31.180838	A	0
126	زبون 67				2025-09-01 12:21:31.473281	A	0
127	زبون 68				2025-09-01 12:21:31.765684	A	0
128	زبون 69				2025-09-01 12:21:32.058466	A	0
129	زبون 70				2025-09-01 12:21:32.351556	A	0
130	زبون 71				2025-09-01 12:21:32.643326	A	0
131	زبون 72				2025-09-01 12:21:32.938047	A	0
132	زبون 73				2025-09-01 12:21:33.230788	A	0
133	زبون 74				2025-09-01 12:21:33.525501	A	0
134	زبون 75				2025-09-01 12:21:33.8177	A	0
135	زبون 76				2025-09-01 12:21:34.110468	A	0
136	زبون 77				2025-09-01 12:21:34.409332	A	0
137	زبون 78				2025-09-01 12:21:34.704208	A	0
138	زبون 79				2025-09-01 12:21:34.996223	A	0
139	زبون 80				2025-09-01 12:21:35.288376	A	0
140	زبون 81				2025-09-01 12:21:35.580701	A	0
141	زبون 82				2025-09-01 12:21:35.87381	A	0
142	زبون 83				2025-09-01 12:21:36.171267	A	0
143	زبون 84				2025-09-01 12:21:36.463452	A	0
144	زبون 85				2025-09-01 12:21:36.756771	A	0
145	زبون 86				2025-09-01 12:21:37.048846	A	0
146	زبون 87				2025-09-01 12:21:37.341236	A	0
147	زبون 88				2025-09-01 12:21:37.6347	A	0
148	زبون 89				2025-09-01 12:21:37.92921	A	0
149	زبون 90				2025-09-01 12:21:38.221092	A	0
150	زبون 91				2025-09-01 12:21:38.512106	A	0
151	زبون 92				2025-09-01 12:21:38.804099	A	0
152	زبون 93				2025-09-01 12:21:39.095443	A	0
153	زبون 94				2025-09-01 12:21:39.387626	A	0
154	زبون 95				2025-09-01 12:21:39.679286	A	0
155	زبون 96				2025-09-01 12:21:39.971701	A	0
156	زبون 97				2025-09-01 12:21:40.264095	A	0
157	زبون 98				2025-09-01 12:21:40.557434	A	0
158	زبون 99				2025-09-01 12:21:40.849707	A	0
159	زبون 100				2025-09-01 12:21:41.142156	A	0
160	زبون 101				2025-09-01 12:21:41.434844	A	0
161	زبون 102				2025-09-01 12:21:41.726825	A	0
162	زبون 103				2025-09-01 12:21:42.018673	A	0
163	زبون 104				2025-09-01 12:21:42.310975	A	0
164	زبون 105				2025-09-01 12:21:42.604811	A	0
165	زبون 106				2025-09-01 12:21:42.897195	A	0
166	زبون 107				2025-09-01 12:21:43.190265	A	0
167	زبون 108				2025-09-01 12:21:43.487464	A	0
168	زبون 109				2025-09-01 12:21:43.78093	A	0
169	زبون 110				2025-09-01 12:21:44.073595	A	0
170	زبون 111				2025-09-01 12:21:44.366731	A	0
171	زبون 112				2025-09-01 12:21:44.659539	A	0
172	زبون 113				2025-09-01 12:21:44.951828	A	0
173	زبون 114				2025-09-01 12:21:45.244619	A	0
174	زبون 115				2025-09-01 12:21:45.594	A	0
175	زبون 116				2025-09-01 12:21:45.886889	A	0
176	زبون 117				2025-09-01 12:21:46.178814	A	0
177	زبون 118				2025-09-01 12:21:46.472365	A	0
178	زبون 119				2025-09-01 12:21:46.770218	A	0
179	زبون 120				2025-09-01 12:21:47.063204	A	0
180	زبون 121				2025-09-01 12:21:47.355364	A	0
181	زبون 122				2025-09-01 12:21:47.647833	A	0
182	زبون 123				2025-09-01 12:21:47.942315	A	0
183	زبون 124				2025-09-01 12:21:48.23322	A	0
184	زبون 125				2025-09-01 12:21:48.524223	A	0
185	زبون 126				2025-09-01 12:21:48.816852	A	0
186	زبون 127				2025-09-01 12:21:49.108855	A	0
187	زبون 128				2025-09-01 12:21:49.40133	A	0
188	زبون 129				2025-09-01 12:21:49.693774	A	0
189	زبون 130				2025-09-01 12:21:49.989962	A	0
190	زبون 131				2025-09-01 12:21:50.282375	A	0
191	زبون 132				2025-09-01 12:21:50.575189	A	0
192	زبون 133				2025-09-01 12:21:50.867412	A	0
193	زبون 134				2025-09-01 12:21:51.15916	A	0
194	زبون 135				2025-09-01 12:21:51.462785	A	0
195	زبون 136				2025-09-01 12:21:51.754894	A	0
196	زبون 137				2025-09-01 12:21:52.047658	A	0
197	زبون 138				2025-09-01 12:21:52.339839	A	0
198	زبون 139				2025-09-01 12:21:52.631792	A	0
199	زبون 140				2025-09-01 12:21:52.924204	A	0
200	زبون 141				2025-09-01 12:21:53.216749	A	0
201	زبون 142				2025-09-01 12:21:53.52893	A	0
202	زبون 143				2025-09-01 12:21:53.821605	A	0
203	زبون 144				2025-09-01 12:21:54.17125	A	0
204	زبون 145				2025-09-01 12:21:54.468091	A	0
205	زبون 146				2025-09-01 12:21:54.760645	A	0
206	زبون 147				2025-09-01 12:21:55.053289	A	0
207	زبون 148				2025-09-01 12:21:55.347066	A	0
208	زبون 149				2025-09-01 12:21:55.638388	A	0
209	زبون 150				2025-09-01 12:21:55.931656	A	0
210	زبون 151				2025-09-01 12:21:56.224979	A	0
211	زبون 152				2025-09-01 12:21:56.517334	A	0
212	زبون 153				2025-09-01 12:21:56.808622	A	0
213	زبون 154				2025-09-01 12:21:57.100724	A	0
214	زبون 155				2025-09-01 12:21:57.394539	A	0
215	زبون 156				2025-09-01 12:21:57.686175	A	0
216	زبون 157				2025-09-01 12:21:57.979318	A	0
217	زبون 158				2025-09-01 12:21:58.271936	A	0
218	زبون 159				2025-09-01 12:21:58.563401	A	0
219	زبون 160				2025-09-01 12:21:58.855905	A	0
220	زبون 161				2025-09-01 12:21:59.150273	A	0
221	زبون 162				2025-09-01 12:21:59.44277	A	0
222	زبون 163				2025-09-01 12:21:59.737086	A	0
223	زبون 164				2025-09-01 12:22:00.029279	A	0
224	زبون 165				2025-09-01 12:22:00.321577	A	0
225	زبون 166				2025-09-01 12:22:00.616749	A	0
226	زبون 167				2025-09-01 12:22:00.908247	A	0
227	زبون 168				2025-09-01 12:22:01.200822	A	0
228	زبون 169				2025-09-01 12:22:01.493803	A	0
229	زبون 170				2025-09-01 12:22:01.787052	A	0
230	زبون 171				2025-09-01 12:22:02.079285	A	0
231	زبون 172				2025-09-01 12:22:02.370436	A	0
232	زبون 173				2025-09-01 12:22:02.663571	A	0
233	زبون 174				2025-09-01 12:22:02.955798	A	0
234	زبون 175				2025-09-01 12:22:03.24856	A	0
235	زبون 176				2025-09-01 12:22:03.543507	A	0
236	زبون 177				2025-09-01 12:22:03.844053	A	0
237	زبون 178				2025-09-01 12:22:04.136558	A	0
238	زبون 179				2025-09-01 12:22:04.428981	A	0
239	زبون 180				2025-09-01 12:22:04.72267	A	0
240	زبون 181				2025-09-01 12:22:05.016808	A	0
241	زبون 182				2025-09-01 12:22:05.309209	A	0
242	زبون 183				2025-09-01 12:22:05.95446	A	0
243	زبون 184				2025-09-01 12:22:06.246787	A	0
244	زبون 185				2025-09-01 12:22:06.541243	A	0
245	زبون 186				2025-09-01 12:22:06.835083	A	0
246	زبون 187				2025-09-01 12:22:07.128123	A	0
247	زبون 188				2025-09-01 12:22:07.420587	A	0
248	زبون 189				2025-09-01 12:22:07.712219	A	0
249	زبون 190				2025-09-01 12:22:08.004614	A	0
250	زبون 191				2025-09-01 12:22:08.297487	A	0
251	زبون 192				2025-09-01 12:22:08.589826	A	0
252	زبون 193				2025-09-01 12:22:08.882164	A	0
253	زبون 194				2025-09-01 12:22:09.174272	A	0
254	زبون 195				2025-09-01 12:22:09.465074	A	0
255	زبون 196				2025-09-01 12:22:09.758359	A	0
256	زبون 197				2025-09-01 12:22:10.192083	A	0
257	زبون 198				2025-09-01 12:22:10.483328	A	0
258	زبون 199				2025-09-01 12:22:10.775718	A	0
259	زبون 200				2025-09-01 12:22:11.16223	A	0
260	زبون 201				2025-09-01 12:22:11.454476	A	0
261	زبون 202				2025-09-01 12:22:11.746418	A	0
262	زبون 203				2025-09-01 12:22:12.041587	A	0
263	زبون 204				2025-09-01 12:22:12.334162	A	0
264	زبون 205				2025-09-01 12:22:12.62629	A	0
265	زبون 206				2025-09-01 12:22:12.918507	A	0
266	زبون 207				2025-09-01 12:22:13.210898	A	0
267	زبون 208				2025-09-01 12:22:13.502876	A	0
268	زبون 209				2025-09-01 12:22:13.79657	A	0
269	زبون 210				2025-09-01 12:22:14.089165	A	0
270	زبون 211				2025-09-01 12:22:14.38164	A	0
271	زبون 212				2025-09-01 12:22:14.675478	A	0
272	زبون 213				2025-09-01 12:22:14.9676	A	0
273	زبون 214				2025-09-01 12:22:15.260299	A	0
274	زبون 215				2025-09-01 12:22:15.552831	A	0
275	زبون 216				2025-09-01 12:22:15.844847	A	0
276	زبون 217				2025-09-01 12:22:16.137099	A	0
277	زبون 218				2025-09-01 12:22:16.42956	A	0
278	زبون 219				2025-09-01 12:22:16.725415	A	0
279	زبون 220				2025-09-01 12:22:17.017032	A	0
280	زبون 221				2025-09-01 12:22:17.309122	A	0
281	زبون 222				2025-09-01 12:22:17.604944	A	0
282	زبون 223				2025-09-01 12:22:17.896805	A	0
283	زبون 224				2025-09-01 12:22:18.19052	A	0
284	زبون 225				2025-09-01 12:22:18.484727	A	0
285	زبون 226				2025-09-01 12:22:18.792212	A	0
286	زبون 227				2025-09-01 12:22:19.084435	A	0
287	زبون 228				2025-09-01 12:22:19.377258	A	0
288	زبون 229				2025-09-01 12:22:19.671208	A	0
289	زبون 230				2025-09-01 12:22:19.978725	A	0
290	زبون 231				2025-09-01 12:22:20.275016	A	0
291	زبون 232				2025-09-01 12:22:20.569808	A	0
292	زبون 233				2025-09-01 12:22:20.868372	A	0
293	زبون 234				2025-09-01 12:22:21.160419	A	0
294	زبون 235				2025-09-01 12:22:21.453906	A	0
295	زبون 236				2025-09-01 12:22:21.746142	A	0
296	زبون 237				2025-09-01 12:22:22.038266	A	0
297	زبون 238				2025-09-01 12:22:22.331021	A	0
298	زبون 239				2025-09-01 12:22:22.625231	A	0
299	زبون 240				2025-09-01 12:22:22.917213	A	0
300	زبون 241				2025-09-01 12:22:23.211326	A	0
301	زبون 242				2025-09-01 12:22:23.503724	A	0
302	زبون 243				2025-09-01 12:22:23.798602	A	0
303	زبون 244				2025-09-01 12:22:24.091926	A	0
304	زبون 245				2025-09-01 12:22:24.383728	A	0
305	زبون 246				2025-09-01 12:22:24.676542	A	0
306	زبون 247				2025-09-01 12:22:24.968619	A	0
307	زبون 248				2025-09-01 12:22:25.260779	A	0
308	زبون 249				2025-09-01 12:22:25.553115	A	0
309	زبون 250				2025-09-01 12:22:25.846356	A	0
310	زبون 251				2025-09-01 12:22:26.138831	A	0
311	زبون 252				2025-09-01 12:22:26.432683	A	0
312	زبون 253				2025-09-01 12:22:26.72555	A	0
313	زبون 254				2025-09-01 12:22:27.020042	A	0
314	زبون 255				2025-09-01 12:22:27.31314	A	0
315	زبون 256				2025-09-01 12:22:27.604072	A	0
316	زبون 257				2025-09-01 12:22:27.897216	A	0
317	زبون 258				2025-09-01 12:22:28.18989	A	0
318	زبون 259				2025-09-01 12:22:28.48526	A	0
319	زبون 260				2025-09-01 12:22:28.777359	A	0
320	زبون 261				2025-09-01 12:22:29.072578	A	0
321	زبون 262				2025-09-01 12:22:29.364287	A	0
322	زبون 263				2025-09-01 12:22:29.660564	A	0
323	زبون 264				2025-09-01 12:22:29.957824	A	0
324	زبون 265				2025-09-01 12:22:30.251282	A	0
325	زبون 266				2025-09-01 12:22:30.543336	A	0
326	زبون 267				2025-09-01 12:22:30.835703	A	0
327	زبون 268				2025-09-01 12:22:31.130073	A	0
328	زبون 269				2025-09-01 12:22:31.424012	A	0
329	زبون 270				2025-09-01 12:22:31.732384	A	0
330	زبون 271				2025-09-01 12:22:32.02554	A	0
331	زبون 272				2025-09-01 12:22:32.324216	A	0
332	زبون 273				2025-09-01 12:22:32.618482	A	0
333	زبون 274				2025-09-01 12:22:32.913328	A	0
334	زبون 275				2025-09-01 12:22:33.207217	A	0
335	زبون 276				2025-09-01 12:22:33.499296	A	0
336	زبون 277				2025-09-01 12:22:33.800252	A	0
337	زبون 278				2025-09-01 12:22:34.092499	A	0
338	زبون 279				2025-09-01 12:22:34.388869	A	0
339	زبون 280				2025-09-01 12:22:34.68279	A	0
340	زبون 281				2025-09-01 12:22:34.975115	A	0
341	زبون 282				2025-09-01 12:22:35.268664	A	0
342	زبون 283				2025-09-01 12:22:35.561054	A	0
343	زبون 284				2025-09-01 12:22:35.855447	A	0
344	زبون 285				2025-09-01 12:22:36.152152	A	0
345	زبون 286				2025-09-01 12:22:36.444099	A	0
346	زبون 287				2025-09-01 12:22:36.736165	A	0
347	زبون 288				2025-09-01 12:22:37.028791	A	0
348	زبون 289				2025-09-01 12:22:37.328125	A	0
349	زبون 290				2025-09-01 12:22:37.625323	A	0
350	زبون 291				2025-09-01 12:22:37.9191	A	0
351	زبون 292				2025-09-01 12:22:38.211499	A	0
352	زبون 293				2025-09-01 12:22:38.504024	A	0
353	زبون 294				2025-09-01 12:22:38.796455	A	0
354	زبون 295				2025-09-01 12:22:39.090707	A	0
355	زبون 296				2025-09-01 12:22:39.384488	A	0
356	زبون 297				2025-09-01 12:22:39.67726	A	0
357	زبون 298				2025-09-01 12:22:39.970225	A	0
358	زبون 299				2025-09-01 12:22:40.262591	A	0
359	زبون 300				2025-09-01 12:22:40.555347	A	0
360	زبون 301				2025-09-01 12:22:40.848127	A	0
361	زبون 302				2025-09-01 12:22:41.208346	A	0
362	زبون 303				2025-09-01 12:22:41.501676	A	0
363	زبون 304				2025-09-01 12:22:41.795198	A	0
364	زبون 305				2025-09-01 12:22:42.092992	A	0
365	زبون 306				2025-09-01 12:22:42.384965	A	0
366	زبون 307				2025-09-01 12:22:42.67652	A	0
367	زبون 308				2025-09-01 12:22:42.969392	A	0
368	زبون 309				2025-09-01 12:22:43.261973	A	0
369	زبون 310				2025-09-01 12:22:43.554875	A	0
370	زبون 311				2025-09-01 12:22:43.847558	A	0
371	زبون 312				2025-09-01 12:22:44.139629	A	0
372	زبون 313				2025-09-01 12:22:44.432327	A	0
373	زبون 314				2025-09-01 12:22:44.724502	A	0
374	زبون 315				2025-09-01 12:22:45.017006	A	0
375	زبون 316				2025-09-01 12:22:45.310836	A	0
376	زبون 317				2025-09-01 12:22:45.607606	A	0
377	زبون 318				2025-09-01 12:22:45.899472	A	0
378	زبون 319				2025-09-01 12:22:46.19224	A	0
379	زبون 320				2025-09-01 12:22:46.487636	A	0
380	زبون 321				2025-09-01 12:22:46.779315	A	0
381	زبون 322				2025-09-01 12:22:47.072234	A	0
382	زبون 323				2025-09-01 12:22:47.365875	A	0
383	زبون 324				2025-09-01 12:22:47.658393	A	0
384	زبون 325				2025-09-01 12:22:47.950654	A	0
385	زبون 326				2025-09-01 12:22:48.244191	A	0
386	زبون 327				2025-09-01 12:22:48.536743	A	0
387	زبون 328				2025-09-01 12:22:48.828734	A	0
3939	محمد جنيات	0945442884	\N	\N	2025-09-09 12:55:39.179645	A	0
3945	محمود الشاطر	0998561920	\N	\N	2025-09-15 09:58:58.270041	A	0
3940	عمر طرابلسي 22	09695811611	\N	\N	2025-09-09 13:07:22.25301	A	0
3946	غياث دربولي	0944368100	\N	\N	2025-09-15 10:03:18.762817	A	0
498	111				2025-09-01 12:24:21.357107	A	0
500	111111				2025-09-01 12:24:21.64788	A	0
502	222	0988808337			2025-09-01 12:24:21.939005	A	0
504	955960				2025-09-01 12:24:22.232727	A	0
506	JACK MERZAKO				2025-09-01 12:24:22.524787	A	0
508	MARDIG MARZAKO	+9613291641			2025-09-01 12:24:22.816083	A	0
510	V POWER TUNING TUNING PARTS				2025-09-01 12:24:23.10719	A	0
512	VAG SPARE PARTS TRADING				2025-09-01 12:24:23.398484	A	0
514	YH AUTO PARTS CO				2025-09-01 12:24:23.688668	A	0
516	Zare	+9613631777			2025-09-01 12:24:23.979894	A	0
518	أب مبارك	0991737099			2025-09-01 12:24:24.271388	A	0
520	أبو حامد/موزع زيوت	0944463212			2025-09-01 12:24:24.584295	A	0
522	أبو دريد/جولف6/ 2011/أبيض/461782/حمص	0999425643			2025-09-01 12:24:24.877022	A	0
524	أبو مصعب الفدعوس	933230680			2025-09-01 12:24:25.168195	A	0
526	أبو موفق	0980602372			2025-09-01 12:24:25.45956	A	0
528	أحمد الحنش	0982281365			2025-09-01 12:24:25.751457	A	0
530	أحمد الخولي	0933990033			2025-09-01 12:24:26.042367	A	0
532	أحمد الكوسا	0962142678			2025-09-01 12:24:26.336518	A	0
534	أحمد الهاشمي	0933424787			2025-09-01 12:24:26.626866	A	0
536	أحمد بسوت	0966220058			2025-09-01 12:24:26.918083	A	0
538	أحمد بصل	0991844819			2025-09-01 12:24:27.210465	A	0
540	أحمد بهادر	0959141891			2025-09-01 12:24:27.500582	A	0
542	أحمد جنيد	0933511905			2025-09-01 12:24:27.792397	A	0
544	أحمد دهمان	0994928669			2025-09-01 12:24:28.083628	A	0
546	أحمد شرابي / 509007	0944847123			2025-09-01 12:24:28.376422	A	0
548	أحمد شرابي \\ 003939 \\ للفحص	0944847123			2025-09-01 12:24:28.668116	A	0
550	أحمد شرابي 594940	0944847123-0993003939			2025-09-01 12:24:28.960128	A	0
552	أحمد شرابي 869806	0944847123			2025-09-01 12:24:29.255003	A	0
554	أحمد عطفه 2538-504	0934131482			2025-09-01 12:24:29.546712	A	0
556	أحمد معتوق /أمتصور جهاز رفع	0988086516			2025-09-01 12:24:29.838437	A	0
558	أحمد ملوك	0966033287			2025-09-01 12:24:30.129798	A	0
560	أحمد ملوك -أبو ياسر	0957350797			2025-09-01 12:24:30.422017	A	0
562	أحمد ملوك/سكودا أوكتافيا2008/فضي/587529/حمص				2025-09-01 12:24:30.713239	A	0
566	أحمد هلال 573986	0962933631			2025-09-01 12:24:31.297442	A	0
568	أحمد هلال 573988	0962933631			2025-09-01 12:24:31.588879	A	0
570	أحمدعطفة	0955606323-0931131482			2025-09-01 12:24:31.881454	A	0
572	إدريس العين	0964645801			2025-09-01 12:24:32.173847	A	0
574	أدهم مندو	0944216200			2025-09-01 12:24:32.467134	A	0
3941	عمر طرابلسي 2222	09695811611	\N	\N	2025-09-09 13:09:36.271255	A	0
3947	حيدر الحسن	0932652626	\N	\N	2025-09-16 07:22:24.405121	A	0
3948	ياسر العكاري	0998282698	\N	\N	2025-09-17 10:10:00.518658	A	0
3949	باسل البدوي	0992864358	\N	\N	2025-09-18 06:30:59.379098	A	0
3950	راجي خانكان	0933366367	\N	\N	2025-09-21 10:36:44.073845	A	0
3952	رائد الأبرش	0934355155	\N	\N	2025-09-22 08:29:15.921889	A	0
3953	هاني الميداني	0981949145	\N	\N	2025-09-23 09:24:34.522314	A	0
1479	زبون 563				2025-09-01 12:26:34.736587	A	0
1482	زبون 564				2025-09-01 12:26:35.027983	A	0
1485	زبون 565				2025-09-01 12:26:35.325346	A	0
1488	زبون 566				2025-09-01 12:26:35.615065	A	0
1491	زبون 567				2025-09-01 12:26:35.911034	A	0
1494	زبون 568				2025-09-01 12:26:36.208868	A	0
1497	زبون 569				2025-09-01 12:26:36.499695	A	0
1500	زبون 570				2025-09-01 12:26:36.79219	A	0
1503	زبون 571				2025-09-01 12:26:37.085886	A	0
1506	زبون 572				2025-09-01 12:26:37.376825	A	0
1509	زبون 573				2025-09-01 12:26:37.665048	A	0
1512	زبون 574				2025-09-01 12:26:37.9573	A	0
1515	زبون 575				2025-09-01 12:26:38.24833	A	0
1518	زبون 576				2025-09-01 12:26:38.542882	A	0
1521	زبون 577				2025-09-01 12:26:38.836564	A	0
1524	زبون 578				2025-09-01 12:26:39.127946	A	0
1527	زبون 579				2025-09-01 12:26:39.417268	A	0
1530	زبون 580				2025-09-01 12:26:39.705616	A	0
1533	زبون 581				2025-09-01 12:26:39.999657	A	0
1536	زبون 582				2025-09-01 12:26:40.295593	A	0
1539	زبون 583				2025-09-01 12:26:40.588658	A	0
1543	زبون 584				2025-09-01 12:26:40.880973	A	0
1545	زبون 585				2025-09-01 12:26:41.172459	A	0
1548	زبون 586				2025-09-01 12:26:41.463555	A	0
1551	زبون 587				2025-09-01 12:26:41.753889	A	0
1555	زبون 588				2025-09-01 12:26:42.049838	A	0
1558	زبون 589				2025-09-01 12:26:42.344342	A	0
1561	زبون 590				2025-09-01 12:26:42.636958	A	0
1564	زبون 591				2025-09-01 12:26:42.925473	A	0
1567	زبون 592				2025-09-01 12:26:43.216867	A	0
1570	زبون 593				2025-09-01 12:26:43.51598	A	0
1573	زبون 594				2025-09-01 12:26:43.8219	A	0
1576	زبون 595				2025-09-01 12:26:44.122761	A	0
1579	زبون 596				2025-09-01 12:26:44.414544	A	0
1582	زبون 597				2025-09-01 12:26:44.718322	A	0
1585	زبون 598				2025-09-01 12:26:45.012271	A	0
1588	زبون 599				2025-09-01 12:26:45.303414	A	0
1591	زبون 600				2025-09-01 12:26:45.594735	A	0
1594	زبون 601				2025-09-01 12:26:45.889876	A	0
1597	زبون 602				2025-09-01 12:26:46.188492	A	0
1600	زبون 603				2025-09-01 12:26:46.476859	A	0
1603	زبون 604				2025-09-01 12:26:46.768805	A	0
1606	زبون 605				2025-09-01 12:26:47.057266	A	0
1609	زبون 606				2025-09-01 12:26:47.352132	A	0
1612	زبون 607				2025-09-01 12:26:47.645779	A	0
1615	زبون 608				2025-09-01 12:26:47.941115	A	0
1618	زبون 609				2025-09-01 12:26:48.230321	A	0
1621	زبون 610				2025-09-01 12:26:48.522498	A	0
1624	زبون 611				2025-09-01 12:26:48.823584	A	0
1627	زبون 612				2025-09-01 12:26:49.113189	A	0
1630	زبون 613				2025-09-01 12:26:49.402207	A	0
1633	زبون 614				2025-09-01 12:26:49.69239	A	0
1636	زبون 615				2025-09-01 12:26:49.980868	A	0
1639	زبون 616				2025-09-01 12:26:50.269624	A	0
1642	زبون 617				2025-09-01 12:26:50.574469	A	0
1645	زبون 618				2025-09-01 12:26:50.865093	A	0
1648	زبون 619				2025-09-01 12:26:51.153343	A	0
1651	زبون 620				2025-09-01 12:26:51.442585	A	0
1654	زبون 621				2025-09-01 12:26:51.7332	A	0
1656	زبون 622				2025-09-01 12:26:52.035399	A	0
1659	زبون 623				2025-09-01 12:26:52.325691	A	0
1662	زبون 624				2025-09-01 12:26:52.619344	A	0
1665	زبون 625				2025-09-01 12:26:52.912869	A	0
1668	زبون 626				2025-09-01 12:26:53.203717	A	0
1671	زبون 627				2025-09-01 12:26:53.49588	A	0
1674	زبون 628				2025-09-01 12:26:53.789898	A	0
1677	زبون 629				2025-09-01 12:26:54.083371	A	0
1680	زبون 630				2025-09-01 12:26:54.374881	A	0
1683	زبون 631				2025-09-01 12:26:54.663576	A	0
1686	زبون 632				2025-09-01 12:26:54.956178	A	0
1689	زبون 633				2025-09-01 12:26:55.246225	A	0
1692	زبون 634				2025-09-01 12:26:55.536187	A	0
1695	زبون 635				2025-09-01 12:26:55.826838	A	0
1699	زبون 636				2025-09-01 12:26:56.125726	A	0
1702	زبون 637				2025-09-01 12:26:56.421776	A	0
1705	زبون 638				2025-09-01 12:26:56.725846	A	0
1708	زبون 639				2025-09-01 12:26:57.016022	A	0
1711	زبون 640				2025-09-01 12:26:57.30549	A	0
1714	زبون 641				2025-09-01 12:26:57.597718	A	0
1717	زبون 642				2025-09-01 12:26:57.890709	A	0
1720	زبون 643				2025-09-01 12:26:58.182811	A	0
1723	زبون 644				2025-09-01 12:26:58.471771	A	0
1726	زبون 645				2025-09-01 12:26:58.767918	A	0
1728	فارس ادريس/باسات 2006 أسود/502600/دمشق				2025-09-01 12:26:59.023799	A	0
1729	زبون 646				2025-09-01 12:26:59.056338	A	0
1731	فارس ادريس/جولف5 GTI/441174/دمشق				2025-09-01 12:26:59.316183	A	0
1732	زبون 647				2025-09-01 12:26:59.344553	A	0
1734	فارس ادريس/كياريو/595985				2025-09-01 12:26:59.607422	A	0
1735	زبون 648				2025-09-01 12:26:59.633344	A	0
1737	فارس ادريس/مورد				2025-09-01 12:26:59.897157	A	0
1738	زبون 649				2025-09-01 12:26:59.921684	A	0
1741	زبون 650				2025-09-01 12:27:00.209867	A	0
1743	فارس خليل	0933455635			2025-09-01 12:27:00.477708	A	0
1744	زبون 651				2025-09-01 12:27:00.498951	A	0
1746	فارس سكرية	932873874			2025-09-01 12:27:00.767676	A	0
1747	زبون 652				2025-09-01 12:27:00.787637	A	0
1749	فاضل الموصلي	0999211757			2025-09-01 12:27:01.057602	A	0
1750	زبون 653				2025-09-01 12:27:01.078735	A	0
1752	فجر نواف عليوي	0932255092			2025-09-01 12:27:01.350105	A	0
1753	زبون 654				2025-09-01 12:27:01.372894	A	0
1756	زبون 655				2025-09-01 12:27:01.663913	A	0
1758	فراس الحاج	0985877304			2025-09-01 12:27:01.932857	A	0
1759	زبون 656				2025-09-01 12:27:01.954199	A	0
1761	فراس الحوري	0988808817			2025-09-01 12:27:02.224582	A	0
1762	زبون 657				2025-09-01 12:27:02.244212	A	0
1764	فراس السيد سليمان	0930087211			2025-09-01 12:27:02.515412	A	0
576	أديب دغوظ	0933435110			2025-09-01 12:24:32.756899	A	0
578	أسامة الحسن	0933508614			2025-09-01 12:24:33.047761	A	0
580	أشرف أتاسي	0966884676-0935316606			2025-09-01 12:24:33.343629	A	0
582	أكثم كاخي	0988442614			2025-09-01 12:24:33.635744	A	0
584	أمجد محمد العنبري				2025-09-01 12:24:33.927059	A	0
586	أمير سفور	0933916454			2025-09-01 12:24:34.220057	A	0
588	أمير مندو	0992470284			2025-09-01 12:24:34.511207	A	0
3951	معاذ ألفين /9897	0944428294	\N	\N	2025-09-21 10:38:57.650513	A	0
590	أنس الهاشمي	0944536272			2025-09-01 12:24:34.802835	A	0
3954	نزار البدري	0981261230	\N	\N	2025-09-25 08:41:09.125912	A	0
592	أنس تقلا	0933433919			2025-09-01 12:24:35.09369	A	0
594	أنس زعترية	992417877			2025-09-01 12:24:35.384554	A	0
596	أنس شما	0944549879			2025-09-01 12:24:35.678011	A	0
597	أنس عدس				2025-09-01 12:24:35.969398	A	0
599	أنس محمد العقيل	0981953807			2025-09-01 12:24:36.260801	A	0
601	أنس معلول	0965250300			2025-09-01 12:24:36.552442	A	0
603	أنطون جبور/Auto House	+9611254690-+9611252344-+9613643873			2025-09-01 12:24:36.844734	A	0
605	أنور صنيب	0944585070			2025-09-01 12:24:37.138722	A	0
607	أيمن أسعد	0944224318			2025-09-01 12:24:37.431328	A	0
609	أيمن اللبابيدي	0991954869			2025-09-01 12:24:37.724347	A	0
611	أيهم الفدعوس	0994354346			2025-09-01 12:24:38.014715	A	0
613	أيهم محمد الخضر	0995716891			2025-09-01 12:24:38.306959	A	0
615	ابراهيم الاحمد	0934111119			2025-09-01 12:24:38.599555	A	0
617	ابراهيم الخطيب	0944871066			2025-09-01 12:24:38.891445	A	0
619	ابراهيم السلقيني	0933222704			2025-09-01 12:24:39.182572	A	0
621	ابراهيم الشيخ طه	992666777			2025-09-01 12:24:39.474095	A	0
623	ابراهيم الفاضل	0993563959			2025-09-01 12:24:39.766434	A	0
625	ابراهيم الناصر/طوارق2005/أسود/997774/دمشق	930110910			2025-09-01 12:24:40.060354	A	0
627	ابراهيم حداد	0957504735 -0944851833			2025-09-01 12:24:40.351364	A	0
629	ابراهيم درويش	0933554732			2025-09-01 12:24:40.6431	A	0
631	ابراهيم سمعان	0944504038			2025-09-01 12:24:40.934624	A	0
633	ابراهيم محمد	0997832359			2025-09-01 12:24:41.226123	A	0
635	ابراهيم نعمان الصالح				2025-09-01 12:24:41.517332	A	0
637	ابو الزين عبد النبي	096927424			2025-09-01 12:24:41.810335	A	0
639	ابو الزين عبد النبي 509-2570	0969274241			2025-09-01 12:24:42.101866	A	0
641	ابو الزين عبد النبي 510-4610				2025-09-01 12:24:42.392789	A	0
643	ابو فدعوس	0968609119			2025-09-01 12:24:42.682962	A	0
645	ابو موفق	0980602372			2025-09-01 12:24:42.975848	A	0
647	ابي الحسين	0932598057			2025-09-01 12:24:43.266935	A	0
649	احمد ابو الخير	0944774897			2025-09-01 12:24:43.558182	A	0
651	احمد الحداد A6	0932856444			2025-09-01 12:24:43.84929	A	0
653	احمد حوالة	0941545679			2025-09-01 12:24:44.147739	A	0
655	احمد خلف	0955655530			2025-09-01 12:24:44.440302	A	0
657	احمد ملوك OCTAVIA	0966033287			2025-09-01 12:24:44.732492	A	0
659	اسامة بلاسم	0933419150			2025-09-01 12:24:45.022989	A	0
661	اكرم رومية	0930215090			2025-09-01 12:24:45.318092	A	0
663	الديراني / أمانات				2025-09-01 12:24:45.61021	A	0
665	الديراني /مبيع قطع سيارات	0933566808			2025-09-01 12:24:45.902256	A	0
667	السلام للزيوت				2025-09-01 12:24:46.193643	A	0
669	العقيد ابو زاكي	0933318340			2025-09-01 12:24:46.484068	A	0
671	العقيد رامز اليوسف	933308755			2025-09-01 12:24:46.776758	A	0
673	العقيد عدنان شمس الدين	0994858243			2025-09-01 12:24:47.06802	A	0
675	العميد أحمد الصغير	0944596330			2025-09-01 12:24:47.362352	A	0
677	العميد عقاب				2025-09-01 12:24:47.653806	A	0
679	العميد مصطفى				2025-09-01 12:24:47.944855	A	0
681	العميد نيروز				2025-09-01 12:24:48.236846	A	0
683	العميد وحيد رسلان	0947436350			2025-09-01 12:24:48.52877	A	0
685	المتعهد ملهم عيون السود				2025-09-01 12:24:48.818286	A	0
687	النداف لتجارة الزيوت				2025-09-01 12:24:49.109992	A	0
689	النقيب حسين ( السائق محمد العلي)	0999150967			2025-09-01 12:24:49.400765	A	0
691	الياس بغدان	0933620200			2025-09-01 12:24:49.691594	A	0
693	الياس شاهين	0997775983			2025-09-01 12:24:49.982179	A	0
695	الياس عبدالله	0933609150			2025-09-01 12:24:50.272908	A	0
697	امتثال / قطع جديدة				2025-09-01 12:24:50.563852	A	0
699	امين الشيخ زين	0944231900			2025-09-01 12:24:50.854791	A	0
701	انس الشيخ مرعي	0958361316			2025-09-01 12:24:51.147643	A	0
703	انس الصحن	0984237710			2025-09-01 12:24:51.439773	A	0
705	انس حوش	0944225844			2025-09-01 12:24:51.730802	A	0
707	انس ختم	0991637470			2025-09-01 12:24:52.021382	A	0
709	اياد الكحيل	0941342903			2025-09-01 12:24:52.312145	A	0
711	اياد اللاذقاني	944220051			2025-09-01 12:24:52.602324	A	0
713	اياد تركاوي	0955887776			2025-09-01 12:24:52.892646	A	0
715	اياد خرطبيل	0936849228			2025-09-01 12:24:53.183223	A	0
717	اياد نورية	0933500800			2025-09-01 12:24:53.473879	A	0
719	اياد نيصافي				2025-09-01 12:24:53.765578	A	0
721	ايلي الحمصي	0955835225			2025-09-01 12:24:54.056604	A	0
3955	سمير الهاشمي	0934021461	\N	\N	2025-09-27 07:07:04.740411	A	0
724	ايمن النجار	0933607111			2025-09-01 12:24:54.638106	A	0
726	ايمن النجار A8	0986884025			2025-09-01 12:24:54.929409	A	0
728	ايهاب برنجكجي /أودي 2009/Q5/أسود/483658/دمشق	988353000			2025-09-01 12:24:55.220281	A	0
730	ايهاب برنجكجي أودي A4/2011/أسود/211113/دمشق	988353000			2025-09-01 12:24:55.511042	A	0
732	ايهاب برنجكجي/اودي S5/أسود/721010/دمشق	988353000			2025-09-01 12:24:55.802249	A	0
734	ايهاب وسوف	0934777866			2025-09-01 12:24:56.093283	A	0
736	باسل الاتاسي	0993433700			2025-09-01 12:24:56.384994	A	0
738	باسل التركماني	0944446346			2025-09-01 12:24:56.677172	A	0
740	باسل الملحم	939788888			2025-09-01 12:24:56.969444	A	0
742	باسل سعد	0992004412			2025-09-01 12:24:57.259027	A	0
744	باسل شقيره	0933345188			2025-09-01 12:24:57.550708	A	0
746	باسل فطوم				2025-09-01 12:24:57.843357	A	0
748	باسل محمد منصور				2025-09-01 12:24:58.134773	A	0
750	باسل نطفجي	0941562829			2025-09-01 12:24:58.426771	A	0
752	باسم شاكر	0944011219			2025-09-01 12:24:58.717733	A	0
754	باسم صالح	0993397999			2025-09-01 12:24:59.010456	A	0
756	بدوي العاشق	0988595798			2025-09-01 12:24:59.300867	A	0
758	براء قطان	0944207385			2025-09-01 12:24:59.592195	A	0
760	براء مليشو	0947955880			2025-09-01 12:24:59.882085	A	0
762	برهان مخول	932542826			2025-09-01 12:25:00.175399	A	0
764	برهان مخول 946423	0932542826			2025-09-01 12:25:00.466667	A	0
766	بسام اليوسف	0944904300			2025-09-01 12:25:00.758146	A	0
768	بسام تركماني	0936822422			2025-09-01 12:25:01.049498	A	0
770	بسام كسيبي/خياط				2025-09-01 12:25:01.340478	A	0
772	بسام مدور	998452793-0944223036			2025-09-01 12:25:01.681222	A	0
774	بشار الرفاعي	0936549504			2025-09-01 12:25:01.972552	A	0
776	بشار خزام	0932351093			2025-09-01 12:25:02.263996	A	0
778	بشار شربك	0937113065			2025-09-01 12:25:02.555456	A	0
780	بشار عبود	0938524319			2025-09-01 12:25:02.847745	A	0
782	بشير حاكمي	0960000874			2025-09-01 12:25:03.153273	A	0
784	بشير عبد المولى	0938611313			2025-09-01 12:25:03.446536	A	0
786	بلال الحموي	0947840741			2025-09-01 12:25:03.736778	A	0
788	بلال مدور	936358366			2025-09-01 12:25:04.026724	A	0
3957	عبد الحكيم كراز	0932593555	\N	\N	2025-09-28 07:07:58.088653	A	0
792	بلال مهباني A8	0981909050			2025-09-01 12:25:04.609423	A	0
794	بلال نوح				2025-09-01 12:25:04.900819	A	0
796	تامر القصير	0955666595			2025-09-01 12:25:05.192722	A	0
798	تامر نوح	0955606364			2025-09-01 12:25:05.488062	A	0
800	تامر/شيروكو	0958727222-0939860043			2025-09-01 12:25:05.781059	A	0
802	تمام الترك	0933313900			2025-09-01 12:25:06.073689	A	0
804	توفبق الدحبيش	0933176823			2025-09-01 12:25:06.364843	A	0
806	توفيق الدروبي	0944294212			2025-09-01 12:25:06.65717	A	0
808	توفيق سليمان	0944494108			2025-09-01 12:25:06.948612	A	0
810	تيسير شحود الاسعد TIGUAN	0938842457			2025-09-01 12:25:07.239535	A	0
812	ثائر النقري	0994805075			2025-09-01 12:25:07.529981	A	0
814	ثائر حلاق	0932596021			2025-09-01 12:25:07.826578	A	0
816	ثائر شلهوم	0956952068			2025-09-01 12:25:08.118913	A	0
818	ثروت معصراني	0934688806			2025-09-01 12:25:08.410949	A	0
820	جابي	981501665-932444633			2025-09-01 12:25:08.703625	A	0
822	جاك خوري	+9613577685			2025-09-01 12:25:08.994088	A	0
824	جاك ندور	0933517551			2025-09-01 12:25:09.286099	A	0
826	جان جرجس خليل	0947095509			2025-09-01 12:25:09.579632	A	0
828	جانو 979822	095552126			2025-09-01 12:25:09.870924	A	0
830	جلال صابوني	0944547040			2025-09-01 12:25:10.16219	A	0
832	جلال مخلوف	0933335607			2025-09-01 12:25:10.454101	A	0
836	جهاد العبدالله	0944315922			2025-09-01 12:25:11.035997	A	0
838	جهاد خرطبيل	945689953			2025-09-01 12:25:11.327354	A	0
840	جو مارون				2025-09-01 12:25:11.618367	A	0
842	جواد يوسفان	0938896910			2025-09-01 12:25:11.909697	A	0
844	جواد يوسفان A6				2025-09-01 12:25:12.201489	A	0
846	جورج حرب	0988407354			2025-09-01 12:25:12.49406	A	0
848	جورج حرب /باسات 2009/رصاصي/666437/طرطوس				2025-09-01 12:25:12.786077	A	0
850	جورج حرب A6	0932145111			2025-09-01 12:25:13.077182	A	0
852	جوني سعيد	0998076330			2025-09-01 12:25:13.368695	A	0
854	حاتم فتال	0939888878			2025-09-01 12:25:13.659995	A	0
856	حازم الشيخ سعد	0941925620			2025-09-01 12:25:13.953833	A	0
858	حازم القاسمي	0988019019			2025-09-01 12:25:14.245467	A	0
860	حازم جعفر	0946582877			2025-09-01 12:25:14.538303	A	0
862	حازم دهمان				2025-09-01 12:25:14.829037	A	0
864	حازم شاكر				2025-09-01 12:25:15.121244	A	0
3956	رامي اللوعة/ A6	0981558531	\N	\N	2025-09-27 07:09:06.543827	A	0
3958	محمد خضر الأسعد	0944685477	\N	\N	2025-09-28 08:28:28.73502	A	0
866	حازم شاكر /533088				2025-09-01 12:25:15.412626	A	0
868	حازم شاكر /باسات 2006/اسود/456602/حماة				2025-09-01 12:25:15.70406	A	0
870	حازم شاكر A6				2025-09-01 12:25:15.996641	A	0
872	حازم شاكر Q7				2025-09-01 12:25:16.288869	A	0
874	حازم شاكر/باسات/2009/فضي/672035/دمشق				2025-09-01 12:25:16.580105	A	0
876	حازم شاكر/باسات2006/فضي/790440/حماة	0933291688			2025-09-01 12:25:16.870307	A	0
878	حازم شما	0967293950			2025-09-01 12:25:17.161713	A	0
880	حازم طليمات	0933224915			2025-09-01 12:25:17.453427	A	0
882	حامد شربك	969433366			2025-09-01 12:25:17.744653	A	0
884	حسام ابراهيم	0944929689/0992817303			2025-09-01 12:25:18.036509	A	0
886	حسام الخضري	0992174186			2025-09-01 12:25:18.329379	A	0
888	حسام الديك	0933291600			2025-09-01 12:25:18.620584	A	0
890	حسام الزعبي	0944315560			2025-09-01 12:25:18.910967	A	0
892	حسام الصوفي	0952848934			2025-09-01 12:25:19.202056	A	0
894	حسام العجمي	0949855811			2025-09-01 12:25:19.492797	A	0
896	حسام عودة	0981790876			2025-09-01 12:25:19.783683	A	0
898	حسام غربال/موانع وقشط	0932948215			2025-09-01 12:25:20.074444	A	0
900	حسام لويس	0934300127			2025-09-01 12:25:20.365843	A	0
902	حسان أتاسي	0933537848			2025-09-01 12:25:20.657417	A	0
904	حسان الحلبي	0962786730-0990416636			2025-09-01 12:25:20.948691	A	0
906	حسان السباعي				2025-09-01 12:25:21.239193	A	0
908	حسان السباعي 7231-505	0994053056			2025-09-01 12:25:21.530008	A	0
910	حسان السباعي/أوديA6/فضي/793885/دمشق	0994053056			2025-09-01 12:25:21.823684	A	0
914	حسان المصري	0966385396			2025-09-01 12:25:22.406543	A	0
916	حسان بحوري	0933424543			2025-09-01 12:25:22.699432	A	0
918	حسان بقاعي	0936795967/957339565			2025-09-01 12:25:22.990087	A	0
920	حسان علوش/أودي A8/2009/أسود/777791/ريف دمشق	0996647792			2025-09-01 12:25:23.281373	A	0
921	حسان ملوك	0933658868			2025-09-01 12:25:23.577277	A	0
923	حسان ملوك 851420	0959490600			2025-09-01 12:25:23.870556	A	0
925	حسان ملوك 8677	0959490600			2025-09-01 12:25:24.160401	A	0
927	حسان ملوك A6				2025-09-01 12:25:24.451851	A	0
929	حسن	991746165			2025-09-01 12:25:24.74367	A	0
932	حسن اسماعيل				2025-09-01 12:25:25.160425	A	0
934	حسن العلي				2025-09-01 12:25:25.45112	A	0
936	حسن تركماني	0936031850			2025-09-01 12:25:25.747929	A	0
938	حسن خرسان	0944945166			2025-09-01 12:25:26.041423	A	0
940	حسن خرسان 8742	0944945166			2025-09-01 12:25:26.331085	A	0
942	حسن خرسان PASSAT CC	0944945166			2025-09-01 12:25:26.622452	A	0
944	حسن خرسان Q7	0944945166			2025-09-01 12:25:26.912849	A	0
945	حسن درويش عثمان	0934858936			2025-09-01 12:25:27.202656	A	0
947	حسن رحمون				2025-09-01 12:25:27.492634	A	0
949	حسن فرحان درويش	0995503189			2025-09-01 12:25:27.790095	A	0
951	حسين الحلبي	0933284060-0944292549			2025-09-01 12:25:28.082043	A	0
953	حسين الياسين	0988263777			2025-09-01 12:25:28.373304	A	0
955	حكم الخالد				2025-09-01 12:25:28.666096	A	0
957	حكم الدروبي	0933554663			2025-09-01 12:25:28.958356	A	0
959	حمدي الناصيف1	0947466888			2025-09-01 12:25:29.24928	A	0
961	حمدي منير	0944558595			2025-09-01 12:25:29.541015	A	0
963	حمدي ناصيف/اودي2010/ A6/اسود/015639/دمشق	947466888			2025-09-01 12:25:29.83938	A	0
965	حمزة العلي	0997258158			2025-09-01 12:25:30.132345	A	0
967	حمزة حمزة	0996125126			2025-09-01 12:25:30.424032	A	0
969	حمزة علوان	0944763004			2025-09-01 12:25:30.715068	A	0
971	حيدر ميكانيكي				2025-09-01 12:25:31.006955	A	0
973	خالد اللحام	0991484836			2025-09-01 12:25:31.299961	A	0
975	خالد زهرة	0999610905			2025-09-01 12:25:31.590641	A	0
977	خطاب الحمصي	0936162669			2025-09-01 12:25:31.882837	A	0
979	خليل ابراهيم مطلق	0996186002			2025-09-01 12:25:32.174834	A	0
981	خليل ابراهيم مطلق - 509-8717	0996186002			2025-09-01 12:25:32.465524	A	0
983	خليل الحموي	0967523369			2025-09-01 12:25:32.757447	A	0
985	د طريف حداد	982884502			2025-09-01 12:25:33.048682	A	0
987	د طريف حداد 233588	0932598057			2025-09-01 12:25:33.339791	A	0
989	د فراس الفيصل	0936432957			2025-09-01 12:25:33.630866	A	0
991	د. حسين عياش	0996667349			2025-09-01 12:25:33.921694	A	0
993	دريد حسين	0932847693			2025-09-01 12:25:34.212894	A	0
995	دكتور حسين	0991888837			2025-09-01 12:25:34.506396	A	0
1480	عزام شهلا	0935327962			2025-09-01 12:26:34.763587	A	0
1483	عزام شهلا مرسيدس				2025-09-01 12:26:35.054502	A	0
1486	عزيز كوسا	0947425783			2025-09-01 12:26:35.345548	A	0
1489	عصام الأخرس	0982750356			2025-09-01 12:26:35.636767	A	0
1492	عصام حسن السليمان	0944297227			2025-09-01 12:26:35.927255	A	0
1495	عصام عباس	0933424210			2025-09-01 12:26:36.217771	A	0
1498	عصام عباس2	933424210			2025-09-01 12:26:36.5144	A	0
1501	عصام كوجان				2025-09-01 12:26:36.805144	A	0
1504	عصام كوجان 802348 - دمشق	0934106681			2025-09-01 12:26:37.096453	A	0
1507	عصام كوجان/باسات 2010 أبيض/604116	0934106681			2025-09-01 12:26:37.386875	A	0
1510	عصام كوجان/باسات 2010/أسود/596265/جمص	0934106681-0959223735			2025-09-01 12:26:37.678397	A	0
1513	عصام كوجان/سكودا اوكتافيا 2008 أزرق/756323				2025-09-01 12:26:37.969564	A	0
1516	علاء الدبيك	0983574247			2025-09-01 12:26:38.262976	A	0
1519	علاء السيوفي	0956357295			2025-09-01 12:26:38.553593	A	0
1522	علاء الفرا	0983400020			2025-09-01 12:26:38.843886	A	0
1525	علاء حوارة	0941337014			2025-09-01 12:26:39.134809	A	0
1528	علاء شاهين/458109				2025-09-01 12:26:39.42503	A	0
1531	علاء عفاش 889233	0980059257			2025-09-01 12:26:39.715444	A	0
1534	علاء كاتبي	0944406363			2025-09-01 12:26:40.006053	A	0
1537	علاء مندو	0992810154			2025-09-01 12:26:40.298339	A	0
1540	علاء نبهان	0932988740			2025-09-01 12:26:40.589305	A	0
1542	علي أبو حاتم	0939708891			2025-09-01 12:26:40.880272	A	0
1546	علي الباطولي	0933736679			2025-09-01 12:26:41.173337	A	0
1549	علي التركاوي	0982455422			2025-09-01 12:26:41.464262	A	0
1765	زبون 658				2025-09-01 12:27:02.53357	A	0
937	زبون 329				2025-09-01 12:25:26.022036	A	0
939	زبون 330				2025-09-01 12:25:26.317728	A	0
941	زبون 331				2025-09-01 12:25:26.618553	A	0
943	زبون 332				2025-09-01 12:25:26.910246	A	0
946	زبون 333				2025-09-01 12:25:27.207018	A	0
948	زبون 334				2025-09-01 12:25:27.505448	A	0
950	زبون 335				2025-09-01 12:25:27.795171	A	0
952	زبون 336				2025-09-01 12:25:28.085416	A	0
954	زبون 337				2025-09-01 12:25:28.471662	A	0
956	زبون 338				2025-09-01 12:25:28.762405	A	0
958	زبون 339				2025-09-01 12:25:29.05193	A	0
960	زبون 340				2025-09-01 12:25:29.341868	A	0
962	زبون 341				2025-09-01 12:25:29.631739	A	0
964	زبون 342				2025-09-01 12:25:29.922828	A	0
966	زبون 343				2025-09-01 12:25:30.210346	A	0
968	زبون 344				2025-09-01 12:25:30.502006	A	0
970	زبون 345				2025-09-01 12:25:30.797161	A	0
972	زبون 346				2025-09-01 12:25:31.090396	A	0
974	زبون 347				2025-09-01 12:25:31.383914	A	0
976	زبون 348				2025-09-01 12:25:31.671637	A	0
978	زبون 349				2025-09-01 12:25:31.960829	A	0
980	زبون 350				2025-09-01 12:25:32.256527	A	0
982	زبون 351				2025-09-01 12:25:32.547679	A	0
984	زبون 352				2025-09-01 12:25:32.837893	A	0
986	زبون 353				2025-09-01 12:25:33.132778	A	0
988	زبون 354				2025-09-01 12:25:33.430692	A	0
990	زبون 355				2025-09-01 12:25:33.725014	A	0
992	زبون 356				2025-09-01 12:25:34.017329	A	0
994	زبون 357				2025-09-01 12:25:34.315879	A	0
996	زبون 358				2025-09-01 12:25:34.606461	A	0
997	دكتور/ابراهيم	0967191919			2025-09-01 12:25:34.797872	A	0
998	زبون 359				2025-09-01 12:25:34.906686	A	0
999	ديالا نحاس	0992950094			2025-09-01 12:25:35.088916	A	0
1000	زبون 360				2025-09-01 12:25:35.199314	A	0
1001	رأفت عودة	944774838			2025-09-01 12:25:35.379706	A	0
1002	زبون 361				2025-09-01 12:25:35.488914	A	0
1003	رائد الابرش	0934355155			2025-09-01 12:25:35.670739	A	0
1004	زبون 362				2025-09-01 12:25:35.780432	A	0
1005	رائد الحسامي	0933642125			2025-09-01 12:25:36.010225	A	0
1006	زبون 363				2025-09-01 12:25:36.070312	A	0
1007	رائد الطباع Q7	0941444307			2025-09-01 12:25:36.304313	A	0
1008	زبون 364				2025-09-01 12:25:36.36276	A	0
1009	رائد خير الله	998551555			2025-09-01 12:25:36.595899	A	0
1010	زبون 365				2025-09-01 12:25:36.658653	A	0
1011	رائد سطوف	0955794106			2025-09-01 12:25:36.888883	A	0
1012	زبون 366				2025-09-01 12:25:36.95679	A	0
1013	رائد مشارقه	0933606339			2025-09-01 12:25:37.179099	A	0
1014	زبون 367				2025-09-01 12:25:37.245963	A	0
1015	راتب رجوب				2025-09-01 12:25:37.469138	A	0
1016	زبون 368				2025-09-01 12:25:37.539541	A	0
1017	راجي الخانكان	0933366367			2025-09-01 12:25:37.76142	A	0
1018	زبون 369				2025-09-01 12:25:37.833949	A	0
1020	زبون 370				2025-09-01 12:25:38.125259	A	0
1021	راشد الزرز 7820	0956844056			2025-09-01 12:25:38.341032	A	0
1022	زبون 371				2025-09-01 12:25:38.418039	A	0
1023	رافد نقشو	944494151			2025-09-01 12:25:38.635966	A	0
1024	زبون 372				2025-09-01 12:25:38.713424	A	0
1025	رافل السباعي/باسات/2006/دمشق/702297				2025-09-01 12:25:38.926902	A	0
1026	زبون 373				2025-09-01 12:25:39.008193	A	0
1027	رافل السباعي/باسات/677755/فضي				2025-09-01 12:25:39.219254	A	0
1028	زبون 374				2025-09-01 12:25:39.335435	A	0
1029	راكان فرزات	0984555592			2025-09-01 12:25:39.510515	A	0
1030	زبون 375				2025-09-01 12:25:39.631931	A	0
1031	راكان فرزات باسات	0984555592			2025-09-01 12:25:39.801516	A	0
1032	زبون 376				2025-09-01 12:25:39.920441	A	0
1033	رامز الشيخ عيسى	0965217137			2025-09-01 12:25:40.091965	A	0
1034	زبون 377				2025-09-01 12:25:40.212863	A	0
1035	رامز الطالب	935368341			2025-09-01 12:25:40.384597	A	0
1036	زبون 378				2025-09-01 12:25:40.509901	A	0
1037	رامز تيناوي				2025-09-01 12:25:40.675697	A	0
1038	زبون 379				2025-09-01 12:25:40.798365	A	0
1039	رامز عنفليص	0944475006			2025-09-01 12:25:40.9669	A	0
1040	زبون 380				2025-09-01 12:25:41.089122	A	0
1041	رامي الحسين	0937726563			2025-09-01 12:25:41.257205	A	0
1042	زبون 381				2025-09-01 12:25:41.379199	A	0
1043	رامي اللوعة	0944670069/981558531			2025-09-01 12:25:41.548472	A	0
1044	زبون 382				2025-09-01 12:25:41.676807	A	0
1045	رامي حلابو	0933200631			2025-09-01 12:25:41.839663	A	0
1046	زبون 383				2025-09-01 12:25:41.969256	A	0
1047	رامي رسلان	0968234576			2025-09-01 12:25:42.129312	A	0
1048	زبون 384				2025-09-01 12:25:42.259339	A	0
1049	رامي مقصود	0994769723			2025-09-01 12:25:42.419835	A	0
1050	زبون 385				2025-09-01 12:25:42.550054	A	0
1051	رانية شرابي	0944489799			2025-09-01 12:25:42.710926	A	0
1052	زبون 386				2025-09-01 12:25:42.842729	A	0
1053	ربيع الرفاعي	0944463664			2025-09-01 12:25:43.005898	A	0
1054	زبون 387				2025-09-01 12:25:43.137399	A	0
1055	ربيع زبداني	0944355229			2025-09-01 12:25:43.297991	A	0
1056	زبون 388				2025-09-01 12:25:43.42731	A	0
1057	ربيع زبداني /018040				2025-09-01 12:25:43.589318	A	0
1058	زبون 389				2025-09-01 12:25:43.721936	A	0
1059	ربيع زبداني /441174				2025-09-01 12:25:43.880192	A	0
1060	زبون 390				2025-09-01 12:25:44.017074	A	0
1061	ربيع زبداني/جولف/244586/2005/كحلي/دمشق	0944355229			2025-09-01 12:25:44.172096	A	0
1062	زبون 391				2025-09-01 12:25:44.307605	A	0
1063	رزان صافي				2025-09-01 12:25:44.462873	A	0
1064	زبون 392				2025-09-01 12:25:44.60107	A	0
1065	رشاد الخضري	0951742891			2025-09-01 12:25:44.753362	A	0
1066	زبون 393				2025-09-01 12:25:44.892459	A	0
1067	رشيد الأخوان	0959433904			2025-09-01 12:25:45.045072	A	0
1068	زبون 394				2025-09-01 12:25:45.183489	A	0
1069	رصين حداد/رافد نقشو	0944945256			2025-09-01 12:25:45.337707	A	0
1070	زبون 395				2025-09-01 12:25:45.473881	A	0
1073	رغيد السباعي				2025-09-01 12:25:45.918943	A	0
1075	رغيد عطية				2025-09-01 12:25:46.220307	A	0
1077	رواد مصطفى	0995866666			2025-09-01 12:25:46.510267	A	0
1079	رولى كسيبي	0931886677			2025-09-01 12:25:46.801263	A	0
1081	زاهر أتاسي/جيتا 2007/كحلي/690197				2025-09-01 12:25:47.091632	A	0
1083	زاهر الاتاسي	0933615007			2025-09-01 12:25:47.385002	A	0
1085	زاهر النحاس	0947274595			2025-09-01 12:25:47.675568	A	0
1089	زاهر كاسوحة	0947991133			2025-09-01 12:25:48.259369	A	0
1091	زبون				2025-09-01 12:25:48.550753	A	0
1093	زبون جديد				2025-09-01 12:25:48.840096	A	0
1095	زبون نقدي				2025-09-01 12:25:49.131004	A	0
1097	زبون وسيط				2025-09-01 12:25:49.422561	A	0
1099	زبون وسيط فريون				2025-09-01 12:25:49.712316	A	0
1101	زكريا المحمد	0940689116			2025-09-01 12:25:50.002287	A	0
1103	زياد دربي 8886	096934122			2025-09-01 12:25:50.292849	A	0
1107	زيد السلقيني	0941113306			2025-09-01 12:25:50.879941	A	0
1109	زين مصطفى	0993991324			2025-09-01 12:25:51.17075	A	0
1111	سائق النقيب حسين				2025-09-01 12:25:51.461948	A	0
1113	سائق سيارة شكيب رجوب				2025-09-01 12:25:51.752761	A	0
1115	سائق وسيم دربي				2025-09-01 12:25:52.043495	A	0
1117	ساره الفرا	0936126800			2025-09-01 12:25:52.333758	A	0
1119	ساري عبود	997885888			2025-09-01 12:25:52.624545	A	0
1121	ساري محسن	0947000005/0947000001			2025-09-01 12:25:52.915529	A	0
1123	ساطع الجندلي	0996813155			2025-09-01 12:25:53.207315	A	0
1125	سامح الاغواني/كوليات	0944701108			2025-09-01 12:25:53.4997	A	0
1127	سامر الشعار	0935965708-0946434352			2025-09-01 12:25:53.793267	A	0
1129	سامر المشنتف	0933228693			2025-09-01 12:25:54.081986	A	0
1131	سامر شاويش	0933435195			2025-09-01 12:25:54.371998	A	0
1133	سامر عجم	0995822930			2025-09-01 12:25:54.662939	A	0
1135	سامر عساف	0933111976			2025-09-01 12:25:54.95416	A	0
1137	سامر كسيبي	0945252300			2025-09-01 12:25:55.251901	A	0
1139	سامي اليوسف	0937653444			2025-09-01 12:25:55.542909	A	0
1141	سامي مهيني	0938111493			2025-09-01 12:25:55.833821	A	0
1143	سانوسيان دمشق				2025-09-01 12:25:56.126814	A	0
1145	ساهر حمصية	0931662624			2025-09-01 12:25:56.418068	A	0
1147	سعيد فرزات	0933623739			2025-09-01 12:25:56.708914	A	0
1149	سليم الناصر	0930074136/099305984			2025-09-01 12:25:56.999737	A	0
1151	سليم عبارة	0941155122			2025-09-01 12:25:57.291488	A	0
1153	سليم عبارة Q7	0939655093			2025-09-01 12:25:57.582102	A	0
1155	سهيل عثمان	0944844716			2025-09-01 12:25:57.872753	A	0
1159	شادي السباعي	0980448610			2025-09-01 12:25:58.456055	A	0
1161	شادي الصباغ	0944201555			2025-09-01 12:25:58.746869	A	0
1163	شادي عبد النور	0933129825			2025-09-01 12:25:59.037237	A	0
1165	شادي/دمشق				2025-09-01 12:25:59.328109	A	0
1167	شدوان الحجة	0932454082			2025-09-01 12:25:59.618784	A	0
1169	شركة أبناء نضال زكريا كروما/ زيوت				2025-09-01 12:25:59.911101	A	0
1171	شركة الفاروسي التجارية	0988116147			2025-09-01 12:26:00.201643	A	0
1173	شركة رقية				2025-09-01 12:26:00.496938	A	0
1175	شركة زينو للتجارة المحدودة المسؤولية /دمشق	0944454930			2025-09-01 12:26:00.787922	A	0
1177	شركة كركور فرع دمشق /اسامة مرعي حسن	0932701943			2025-09-01 12:26:01.079017	A	0
1179	شريف برهم	0957888201			2025-09-01 12:26:01.370794	A	0
1181	شريف زهوري	0982819610			2025-09-01 12:26:01.663921	A	0
1183	شفيق أتاسي	0935628777-0932596738			2025-09-01 12:26:01.953261	A	0
1185	شفيق أتاسي 596365	0935628777			2025-09-01 12:26:02.244875	A	0
1187	شكيب بلقيس				2025-09-01 12:26:02.536052	A	0
1189	شكيب رجوب - السائق غانم جبر	0947895604			2025-09-01 12:26:02.82659	A	0
1191	شكيب شربك	938419120			2025-09-01 12:26:03.132643	A	0
1193	شهم حلاني	0995073942/0994287406			2025-09-01 12:26:03.422956	A	0
1195	شهم شعراوني	933217814			2025-09-01 12:26:03.715183	A	0
1197	شوقي مخول	0996634946			2025-09-01 12:26:04.008935	A	0
1199	صادق كتوب	0930142536/0941571449			2025-09-01 12:26:04.30024	A	0
1201	صالح عبد الحميد حمادة	0995962623			2025-09-01 12:26:04.592141	A	0
1203	صباح شنو	0933455290			2025-09-01 12:26:04.883494	A	0
1205	صبحي العجي	0933511161			2025-09-01 12:26:05.174404	A	0
1207	صبحي حيدر	944364232			2025-09-01 12:26:05.466982	A	0
1209	صبحي حيدر 509409	0944364232			2025-09-01 12:26:05.757669	A	0
1211	صفوان الاصيل	0988408295			2025-09-01 12:26:06.048347	A	0
1213	صهيب سويدان	0940264097			2025-09-01 12:26:06.341681	A	0
1215	ضياء الحسو	0998307883			2025-09-01 12:26:06.632115	A	0
1217	طارق الحسن	0933482817			2025-09-01 12:26:06.924451	A	0
1221	طارق شيخ زين	0949667849			2025-09-01 12:26:07.506727	A	0
1223	طارق معصراني	0944319400			2025-09-01 12:26:07.798366	A	0
1225	طاهر الدياب	0951384497			2025-09-01 12:26:08.104772	A	0
1227	طراف المرعي	0932237227			2025-09-01 12:26:08.395396	A	0
1229	طريف حداد 2	982884502			2025-09-01 12:26:08.687517	A	0
1231	طريف مصري	999299031			2025-09-01 12:26:08.977228	A	0
1233	طلال رومية	0991171934			2025-09-01 12:26:09.266724	A	0
1237	طلال مخول A4	0935362911			2025-09-01 12:26:09.849886	A	0
1239	طلحة العبدالله	0952797476			2025-09-01 12:26:10.141773	A	0
1242	طه زعرور S7	0957552413			2025-09-01 12:26:10.776227	A	0
1244	طه نجار	0942283026			2025-09-01 12:26:11.066836	A	0
1246	ظافر وزان	0988886983			2025-09-01 12:26:11.357899	A	0
1250	عادل الغفري JETTA	0992113654			2025-09-01 12:26:11.938503	A	0
1252	عادل الفقري	0992113654			2025-09-01 12:26:12.229731	A	0
1254	عاصم خليل ابو المجد	955538393			2025-09-01 12:26:12.519835	A	0
1339	زبون 516				2025-09-01 12:26:21.004473	A	0
1072	زبون 396				2025-09-01 12:25:45.766574	A	0
1074	زبون 397				2025-09-01 12:25:46.062588	A	0
1076	زبون 398				2025-09-01 12:25:46.353942	A	0
1078	زبون 399				2025-09-01 12:25:46.64894	A	0
1080	زبون 400				2025-09-01 12:25:46.94287	A	0
1082	زبون 401				2025-09-01 12:25:47.235216	A	0
1084	زبون 402				2025-09-01 12:25:47.529219	A	0
1086	زبون 403				2025-09-01 12:25:47.823583	A	0
1088	زبون 404				2025-09-01 12:25:48.116039	A	0
1090	زبون 405				2025-09-01 12:25:48.404919	A	0
1092	زبون 406				2025-09-01 12:25:48.696202	A	0
1094	زبون 407				2025-09-01 12:25:48.985686	A	0
1096	زبون 408				2025-09-01 12:25:49.275451	A	0
1098	زبون 409				2025-09-01 12:25:49.564479	A	0
1100	زبون 410				2025-09-01 12:25:49.853735	A	0
1102	زبون 411				2025-09-01 12:25:50.145525	A	0
1104	زبون 412				2025-09-01 12:25:50.433011	A	0
1106	زبون 413				2025-09-01 12:25:50.723302	A	0
1108	زبون 414				2025-09-01 12:25:51.012512	A	0
1110	زبون 415				2025-09-01 12:25:51.307303	A	0
1112	زبون 416				2025-09-01 12:25:51.596058	A	0
1114	زبون 417				2025-09-01 12:25:51.885425	A	0
1116	زبون 418				2025-09-01 12:25:52.175126	A	0
1118	زبون 419				2025-09-01 12:25:52.46433	A	0
1120	زبون 420				2025-09-01 12:25:52.757204	A	0
1122	زبون 421				2025-09-01 12:25:53.05399	A	0
1124	زبون 422				2025-09-01 12:25:53.354275	A	0
1126	زبون 423				2025-09-01 12:25:53.644685	A	0
1128	زبون 424				2025-09-01 12:25:53.935947	A	0
1130	زبون 425				2025-09-01 12:25:54.226757	A	0
1132	زبون 426				2025-09-01 12:25:54.521614	A	0
1134	زبون 427				2025-09-01 12:25:54.811876	A	0
1136	زبون 428				2025-09-01 12:25:55.104649	A	0
1138	زبون 429				2025-09-01 12:25:55.400143	A	0
1140	زبون 430				2025-09-01 12:25:55.690996	A	0
1142	زبون 431				2025-09-01 12:25:55.981068	A	0
1144	زبون 432				2025-09-01 12:25:56.271997	A	0
1146	زبون 433				2025-09-01 12:25:56.577469	A	0
1148	زبون 434				2025-09-01 12:25:56.869475	A	0
1150	زبون 435				2025-09-01 12:25:57.161682	A	0
1152	زبون 436				2025-09-01 12:25:57.450522	A	0
1154	زبون 437				2025-09-01 12:25:57.741098	A	0
1156	زبون 438				2025-09-01 12:25:58.030696	A	0
1158	زبون 439				2025-09-01 12:25:58.322383	A	0
1160	زبون 440				2025-09-01 12:25:58.611788	A	0
1162	زبون 441				2025-09-01 12:25:58.906772	A	0
1164	زبون 442				2025-09-01 12:25:59.205211	A	0
1166	زبون 443				2025-09-01 12:25:59.49708	A	0
1168	زبون 444				2025-09-01 12:25:59.785852	A	0
1170	زبون 445				2025-09-01 12:26:00.076787	A	0
1172	زبون 446				2025-09-01 12:26:00.365365	A	0
1174	زبون 447				2025-09-01 12:26:00.655192	A	0
1176	زبون 448				2025-09-01 12:26:00.94488	A	0
1178	زبون 449				2025-09-01 12:26:01.237857	A	0
1180	زبون 450				2025-09-01 12:26:01.528407	A	0
1182	زبون 451				2025-09-01 12:26:01.823367	A	0
1184	زبون 452				2025-09-01 12:26:02.112045	A	0
1186	زبون 453				2025-09-01 12:26:02.408289	A	0
1188	زبون 454				2025-09-01 12:26:02.701517	A	0
1190	زبون 455				2025-09-01 12:26:02.994095	A	0
1192	زبون 456				2025-09-01 12:26:03.285867	A	0
1194	زبون 457				2025-09-01 12:26:03.576812	A	0
1196	زبون 458				2025-09-01 12:26:03.870516	A	0
1198	زبون 459				2025-09-01 12:26:04.161531	A	0
1200	زبون 460				2025-09-01 12:26:04.453295	A	0
1202	زبون 461				2025-09-01 12:26:04.743812	A	0
1204	زبون 462				2025-09-01 12:26:05.033633	A	0
1206	زبون 463				2025-09-01 12:26:05.32777	A	0
1208	زبون 464				2025-09-01 12:26:05.619432	A	0
1210	زبون 465				2025-09-01 12:26:05.907552	A	0
1212	زبون 466				2025-09-01 12:26:06.19589	A	0
1214	زبون 467				2025-09-01 12:26:06.486384	A	0
1216	زبون 468				2025-09-01 12:26:06.778998	A	0
1218	زبون 469				2025-09-01 12:26:07.07133	A	0
1220	زبون 470				2025-09-01 12:26:07.366889	A	0
1222	زبون 471				2025-09-01 12:26:07.658187	A	0
1224	زبون 472				2025-09-01 12:26:07.959615	A	0
1226	زبون 473				2025-09-01 12:26:08.248049	A	0
1228	زبون 474				2025-09-01 12:26:08.540533	A	0
1230	زبون 475				2025-09-01 12:26:08.828678	A	0
1232	زبون 476				2025-09-01 12:26:09.118231	A	0
1234	زبون 477				2025-09-01 12:26:09.407449	A	0
1236	زبون 478				2025-09-01 12:26:09.704718	A	0
1238	زبون 479				2025-09-01 12:26:09.994096	A	0
1240	زبون 480				2025-09-01 12:26:10.291404	A	0
1241	زبون 481				2025-09-01 12:26:10.647922	A	0
1243	زبون 482				2025-09-01 12:26:10.938884	A	0
1245	زبون 483				2025-09-01 12:26:11.234951	A	0
1247	زبون 484				2025-09-01 12:26:11.525156	A	0
1249	زبون 485				2025-09-01 12:26:11.813734	A	0
1251	زبون 486				2025-09-01 12:26:12.105746	A	0
1253	زبون 487				2025-09-01 12:26:12.456874	A	0
1255	زبون 488				2025-09-01 12:26:12.74925	A	0
1258	زبون 489				2025-09-01 12:26:13.065204	A	0
1261	زبون 490				2025-09-01 12:26:13.362754	A	0
1264	زبون 491				2025-09-01 12:26:13.656091	A	0
1267	زبون 492				2025-09-01 12:26:13.950993	A	0
1270	زبون 493				2025-09-01 12:26:14.247946	A	0
1273	زبون 494				2025-09-01 12:26:14.541409	A	0
1276	زبون 495				2025-09-01 12:26:14.873914	A	0
1279	زبون 496				2025-09-01 12:26:15.168384	A	0
1282	زبون 497				2025-09-01 12:26:15.458009	A	0
1285	زبون 498				2025-09-01 12:26:15.750204	A	0
1288	زبون 499				2025-09-01 12:26:16.039373	A	0
1290	زبون 500				2025-09-01 12:26:16.332217	A	0
1294	زبون 501				2025-09-01 12:26:16.624467	A	0
1297	زبون 502				2025-09-01 12:26:16.915443	A	0
1299	زبون 503				2025-09-01 12:26:17.20618	A	0
1302	زبون 504				2025-09-01 12:26:17.499231	A	0
1305	زبون 505				2025-09-01 12:26:17.789128	A	0
1308	زبون 506				2025-09-01 12:26:18.081421	A	0
1311	زبون 507				2025-09-01 12:26:18.378305	A	0
1314	زبون 508				2025-09-01 12:26:18.674783	A	0
1317	زبون 509				2025-09-01 12:26:18.962925	A	0
1320	زبون 510				2025-09-01 12:26:19.252708	A	0
1323	زبون 511				2025-09-01 12:26:19.546875	A	0
1327	زبون 512				2025-09-01 12:26:19.839687	A	0
1330	زبون 513				2025-09-01 12:26:20.131387	A	0
1333	زبون 514				2025-09-01 12:26:20.419392	A	0
1336	زبون 515				2025-09-01 12:26:20.715617	A	0
1256	عالم البواجي	0988808337			2025-09-01 12:26:12.810444	A	0
1259	عامر الحصني	0944445017			2025-09-01 12:26:13.213722	A	0
1262	عامر الرشواني	0933762810			2025-09-01 12:26:13.505727	A	0
1265	عامر السباعي	0997844134			2025-09-01 12:26:13.797415	A	0
1268	عامر السعيد	0988881963			2025-09-01 12:26:14.087761	A	0
1271	عامر العلي	0938314329			2025-09-01 12:26:14.378831	A	0
1274	عامر سلطان				2025-09-01 12:26:14.669496	A	0
1277	عامر طعمة / زيوت وبخاخات تنظيف				2025-09-01 12:26:14.960934	A	0
1280	عامر فتال /اصلاح أضوية	0944971168			2025-09-01 12:26:15.256196	A	0
1283	عامر مسعد	0987915524			2025-09-01 12:26:15.546409	A	0
1286	عبادة صنوفي	0952481343			2025-09-01 12:26:15.836194	A	0
1289	عباس القواص	0992750661			2025-09-01 12:26:16.127608	A	0
1292	عبد الاله العبدو	0933516007			2025-09-01 12:26:16.423978	A	0
1295	عبد الباري الطحان	0933420420			2025-09-01 12:26:16.714453	A	0
1298	عبد الباسط اسماعيل	0933301269			2025-09-01 12:26:17.005161	A	0
1301	عبد الباسط اسماعيل SUPERB	0933301269			2025-09-01 12:26:17.295107	A	0
1304	عبد الباسط الرفاعي	0997115603			2025-09-01 12:26:17.585296	A	0
1307	عبد الباسط المسموم	0949304548			2025-09-01 12:26:17.875799	A	0
1310	عبد الجليل كسيبي	959676071			2025-09-01 12:26:18.166232	A	0
1313	عبد الحكيم الحافظ	0992429498			2025-09-01 12:26:18.456141	A	0
1316	عبد الحكيم باكير	0933251275			2025-09-01 12:26:18.746475	A	0
1319	عبد الحميد ابو الخير	0933727554			2025-09-01 12:26:19.03718	A	0
1322	عبد الحميد بكداش 696739- دمشق \\ فضي	0988001111			2025-09-01 12:26:19.327592	A	0
1325	عبد الحميد بكداش 698439-دمشق \\ أسود	988001111			2025-09-01 12:26:19.619166	A	0
1331	عبد الرحمن الاتاسي	0958670130			2025-09-01 12:26:20.200492	A	0
1334	عبد الرحمن الرفاعي	958215647			2025-09-01 12:26:20.491614	A	0
1337	عبد الرحمن حلبي/مركز الرولمان الذهبي				2025-09-01 12:26:20.782319	A	0
1340	عبد الرحمن حلواني	0996098710			2025-09-01 12:26:21.071873	A	0
1343	عبد الرحمن خليل / خياط				2025-09-01 12:26:21.362136	A	0
1346	عبد الرحمن سويدان	0997463100			2025-09-01 12:26:21.65489	A	0
1349	عبد الرحمن شهاب	0932482604			2025-09-01 12:26:21.946029	A	0
1352	عبد الرحمن قباني	0962181818			2025-09-01 12:26:22.23945	A	0
1355	عبد الرحمن قرة حسن	0991504621			2025-09-01 12:26:22.531002	A	0
1358	عبد الرحيم والي				2025-09-01 12:26:22.821989	A	0
1360	عبد السلام الابرش				2025-09-01 12:26:23.113581	A	0
1363	عبد السلام البيطار	0934552804			2025-09-01 12:26:23.40577	A	0
1369	عبد العزيز برغوت	0981731463			2025-09-01 12:26:23.98743	A	0
1372	عبد العزيز مشارقة	0992478565			2025-09-01 12:26:24.280072	A	0
1375	عبد العزيز مشارقة Q7	0992478565			2025-09-01 12:26:24.570771	A	0
1378	عبد الكريم الساروت	0946901939			2025-09-01 12:26:24.861595	A	0
1387	عبد الكريم سفور	0934510769			2025-09-01 12:26:25.733495	A	0
1342	زبون 517				2025-09-01 12:26:21.294498	A	0
1345	زبون 518				2025-09-01 12:26:21.584647	A	0
1348	زبون 519				2025-09-01 12:26:21.872104	A	0
1351	زبون 520				2025-09-01 12:26:22.160957	A	0
1353	زبون 521				2025-09-01 12:26:22.45398	A	0
1356	زبون 522				2025-09-01 12:26:22.743694	A	0
1359	زبون 523				2025-09-01 12:26:23.032831	A	0
1362	زبون 524				2025-09-01 12:26:23.328269	A	0
1365	زبون 525				2025-09-01 12:26:23.618096	A	0
1368	زبون 526				2025-09-01 12:26:23.914414	A	0
1371	زبون 527				2025-09-01 12:26:24.20451	A	0
1374	زبون 528				2025-09-01 12:26:24.495678	A	0
1377	زبون 529				2025-09-01 12:26:24.793401	A	0
1380	زبون 530				2025-09-01 12:26:25.086619	A	0
1383	زبون 531				2025-09-01 12:26:25.393231	A	0
1386	زبون 532				2025-09-01 12:26:25.685593	A	0
1389	زبون 533				2025-09-01 12:26:25.977588	A	0
1392	زبون 534				2025-09-01 12:26:26.274609	A	0
1395	زبون 535				2025-09-01 12:26:26.563602	A	0
1398	زبون 536				2025-09-01 12:26:26.854074	A	0
1401	زبون 537				2025-09-01 12:26:27.142748	A	0
1404	زبون 538				2025-09-01 12:26:27.433232	A	0
1407	زبون 539				2025-09-01 12:26:27.72501	A	0
1410	زبون 540				2025-09-01 12:26:28.017956	A	0
1413	زبون 541				2025-09-01 12:26:28.307734	A	0
1416	زبون 542				2025-09-01 12:26:28.598868	A	0
1419	زبون 543				2025-09-01 12:26:28.889619	A	0
1422	زبون 544				2025-09-01 12:26:29.179421	A	0
1425	زبون 545				2025-09-01 12:26:29.470588	A	0
1428	زبون 546				2025-09-01 12:26:29.758888	A	0
1431	زبون 547				2025-09-01 12:26:30.04734	A	0
1434	زبون 548				2025-09-01 12:26:30.338248	A	0
1437	زبون 549				2025-09-01 12:26:30.628571	A	0
1440	زبون 550				2025-09-01 12:26:30.918142	A	0
1443	زبون 551				2025-09-01 12:26:31.207541	A	0
1446	زبون 552				2025-09-01 12:26:31.51161	A	0
1449	زبون 553				2025-09-01 12:26:31.806603	A	0
1452	زبون 554				2025-09-01 12:26:32.100689	A	0
1455	زبون 555				2025-09-01 12:26:32.392827	A	0
1458	زبون 556				2025-09-01 12:26:32.683242	A	0
1461	زبون 557				2025-09-01 12:26:32.976726	A	0
1464	زبون 558				2025-09-01 12:26:33.267427	A	0
1467	زبون 559				2025-09-01 12:26:33.558966	A	0
1470	زبون 560				2025-09-01 12:26:33.851094	A	0
1473	زبون 561				2025-09-01 12:26:34.149466	A	0
1476	زبون 562				2025-09-01 12:26:34.441593	A	0
1390	عبد الكريم سفور /أوكتافيا2010/أسود/421850/حمص	0934510769			2025-09-01 12:26:26.024072	A	0
1393	عبد الكريم سفور 7196-508	0944449839			2025-09-01 12:26:26.315775	A	0
1396	عبد الكريم سفور/ بدون نمرة	0944449839			2025-09-01 12:26:26.607372	A	0
1399	عبد الكريم سفور/باسات2011/رمادي/566881/دمشق	934510769			2025-09-01 12:26:26.897982	A	0
1402	عبد الله أبو خالد	0981459354			2025-09-01 12:26:27.188816	A	0
1405	عبد الله الاحدب	0991800005			2025-09-01 12:26:27.479327	A	0
1408	عبد الله البستاني	933838729			2025-09-01 12:26:27.770114	A	0
1411	عبد الله النعسان	099184018			2025-09-01 12:26:28.061163	A	0
1414	عبد الله طعمة	0932100220			2025-09-01 12:26:28.351271	A	0
1417	عبد الله معيني	0952845391			2025-09-01 12:26:28.642646	A	0
1669	عمر أبو زيد	0988046464			2025-09-01 12:26:53.214197	A	0
1426	عبد المنعم الحلواني	944410014- 0938561657			2025-09-01 12:26:29.519441	A	0
1429	عبد الناصر الكنج	0969327138			2025-09-01 12:26:29.810907	A	0
1432	عبد الناصر النداف				2025-09-01 12:26:30.101765	A	0
1435	عبد الهادي خطاب	0944016800			2025-09-01 12:26:30.392571	A	0
1438	عبد الواحد البدري	0994754000			2025-09-01 12:26:30.683735	A	0
1441	عبد الوهاب زعرور	0993037059			2025-09-01 12:26:30.974308	A	0
1444	عبدالله الموصلي	0944067506			2025-09-01 12:26:31.265148	A	0
1447	عبدالمنان سلوم				2025-09-01 12:26:31.556225	A	0
1450	عبدالهادي البيك	0988191920			2025-09-01 12:26:31.846965	A	0
1453	عبدلله العكاري	0994581100			2025-09-01 12:26:32.137245	A	0
1456	عثمان أبو خالد				2025-09-01 12:26:32.429592	A	0
1459	عثمان ميكانيكي	0994152102			2025-09-01 12:26:32.721105	A	0
1462	عثمان ميكانيكي - 859043				2025-09-01 12:26:33.012388	A	0
1465	عثمان/اودي Q7/2007/رمادي/222269/دمشق	0994152106			2025-09-01 12:26:33.302037	A	0
1468	عدنان القاعد	0938638389			2025-09-01 12:26:33.593347	A	0
1471	عدي جوهر	0947990022			2025-09-01 12:26:33.885045	A	0
1474	عدي غازي				2025-09-01 12:26:34.177311	A	0
1477	عرض سعر				2025-09-01 12:26:34.472079	A	0
1552	علي الدراوشة	0944489109			2025-09-01 12:26:41.755288	A	0
1554	علي الدروبي	0944711690			2025-09-01 12:26:42.046613	A	0
1557	علي العكاري	0937399083			2025-09-01 12:26:42.337512	A	0
1560	علي الهندي	0937428544			2025-09-01 12:26:42.62757	A	0
1563	علي حوراني	0934151569			2025-09-01 12:26:42.917912	A	0
1566	علي خضور	0935552814			2025-09-01 12:26:43.208608	A	0
1569	علي سالم العلي				2025-09-01 12:26:43.508123	A	0
1572	علي قطع جديدة				2025-09-01 12:26:43.798863	A	0
1575	عماد الابراهيم/سكودا أوكتافيا2008/أسود/603500/اللاذقية	935552814			2025-09-01 12:26:44.089112	A	0
1578	عماد الحريري (الشركة السورية للغاز)	0935002343			2025-09-01 12:26:44.382937	A	0
1581	عماد السباعي	0944479009			2025-09-01 12:26:44.672886	A	0
1584	عماد الشريف /509007	0991623195			2025-09-01 12:26:44.963643	A	0
1587	عماد الشريف/جولف/458618	0991623195			2025-09-01 12:26:45.254315	A	0
1590	عماد حلاق				2025-09-01 12:26:45.545172	A	0
1593	عماد غندور	0944221354			2025-09-01 12:26:45.835806	A	0
1596	عماد مبارك	0966388808			2025-09-01 12:26:46.128694	A	0
1599	عمار الأسعد	0930302072			2025-09-01 12:26:46.419602	A	0
1602	عمار السواس /باسات 2009/CC/ 491918اسود/دمشق	0951252522			2025-09-01 12:26:46.709858	A	0
1605	عمار السواس/ أودي A4/فضي/304406/دمشق	0951252522			2025-09-01 12:26:47.00282	A	0
1608	عمار العيفر	0992963039			2025-09-01 12:26:47.297389	A	0
1611	عمار جرجور	0944571970			2025-09-01 12:26:47.588203	A	0
1614	عمار جرجور A6	0944571970			2025-09-01 12:26:47.879877	A	0
1617	عمار شبوع	0933651726			2025-09-01 12:26:48.169335	A	0
1620	عمار شوحة	0965004404			2025-09-01 12:26:48.460265	A	0
1623	عمر الحلواني	940087400-0952525352			2025-09-01 12:26:48.752042	A	0
1626	عمر الشاطر	0931427503			2025-09-01 12:26:49.042653	A	0
1629	عمر الصباغ	0944948013			2025-09-01 12:26:49.333821	A	0
1632	عمر الصباغ/جولف/أبيض/420599/جمص	0944948013-0952145959			2025-09-01 12:26:49.626774	A	0
1638	عمر دحوح	0968651107			2025-09-01 12:26:50.205949	A	0
1641	عمر دهمان / السائق راغب ايبو	0989192204			2025-09-01 12:26:50.497045	A	0
1644	عمر رحمون	0988082280			2025-09-01 12:26:50.788132	A	0
1650	عمر طليمات	0938757891			2025-09-01 12:26:51.370149	A	0
1653	عمر عمرين				2025-09-01 12:26:51.659986	A	0
1657	عمر عياش	0967365323			2025-09-01 12:26:52.048671	A	0
1660	عمر عياش GOLF	0967365323			2025-09-01 12:26:52.341096	A	0
1663	عمر فرواتي	0955467555			2025-09-01 12:26:52.632068	A	0
1666	عمران دربولي	933998670			2025-09-01 12:26:52.923024	A	0
1672	عمرو السباعي	0957546763			2025-09-01 12:26:53.504335	A	0
1675	عمرو مشارقة	0961163316			2025-09-01 12:26:53.794151	A	0
1678	عوض سكون	0951984143			2025-09-01 12:26:54.084472	A	0
1681	غازي ديب	933460634			2025-09-01 12:26:54.375736	A	0
1684	غاندي سكاف	0940705097			2025-09-01 12:26:54.665505	A	0
1687	غانم غانم	0937653444			2025-09-01 12:26:54.95685	A	0
1690	غسان حمدان				2025-09-01 12:26:55.247646	A	0
1693	غصوب السلقيني				2025-09-01 12:26:55.537667	A	0
1696	غياث الطحش	956609060			2025-09-01 12:26:55.827884	A	0
1698	غيث فشة	0936665511			2025-09-01 12:26:56.121915	A	0
1701	غيث يوسف اليوسف				2025-09-01 12:26:56.412035	A	0
1704	فؤاد سرور	0944238081			2025-09-01 12:26:56.702675	A	0
1707	فؤاد عودة				2025-09-01 12:26:56.993046	A	0
1710	فادي جراش	0944703662			2025-09-01 12:26:57.28324	A	0
1713	فادي صقر	944602016			2025-09-01 12:26:57.573392	A	0
1716	فادي طعمة				2025-09-01 12:26:57.863477	A	0
1719	فادي عبد الجواد	0944407111			2025-09-01 12:26:58.154311	A	0
1722	فادي قنجعة	0944791345			2025-09-01 12:26:58.445866	A	0
1725	فادي موسى	0933409462-0965011932			2025-09-01 12:26:58.735028	A	0
1767	فراس السيد سليمان 1290-510	0930087211			2025-09-01 12:27:02.807702	A	0
1768	زبون 659				2025-09-01 12:27:02.824866	A	0
1770	فراس الصفوه	0993269607			2025-09-01 12:27:03.097207	A	0
1771	زبون 660				2025-09-01 12:27:03.123549	A	0
1773	فراس بريجاوي	0981266909			2025-09-01 12:27:03.388495	A	0
1774	زبون 661				2025-09-01 12:27:03.424657	A	0
1777	زبون 662				2025-09-01 12:27:03.721733	A	0
1779	فراس شربك	0933225707			2025-09-01 12:27:03.972303	A	0
1780	زبون 663				2025-09-01 12:27:04.012289	A	0
1782	فراس عباس /اوديA4/أسود/897720/دمشق	0992777721			2025-09-01 12:27:04.262324	A	0
1783	زبون 664				2025-09-01 12:27:04.316477	A	0
1785	فراس كرنازي	0988424212			2025-09-01 12:27:04.553236	A	0
1786	زبون 665				2025-09-01 12:27:04.612653	A	0
1788	فراس كرنازي 2	988424212			2025-09-01 12:27:04.845453	A	0
1789	زبون 666				2025-09-01 12:27:04.904594	A	0
1791	فراس مخزوم	0933294494			2025-09-01 12:27:05.134893	A	0
1794	فرحان هلال	0933645148			2025-09-01 12:27:05.425841	A	0
1797	فريد حمدان	0994059394			2025-09-01 12:27:05.717628	A	0
1800	فهد الفدعوس	0944484140-0992306800			2025-09-01 12:27:06.008268	A	0
1803	فهد الفدعوس/باسات/898952/2006/فضي/حلب	944484140			2025-09-01 12:27:06.299281	A	0
1806	فهد بربور	0960042837			2025-09-01 12:27:06.589469	A	0
1809	فهد عيون السود	944318318			2025-09-01 12:27:06.880239	A	0
1812	فواز الاخوان	0947232425			2025-09-01 12:27:07.170825	A	0
1815	فواز النجار	0945791021			2025-09-01 12:27:07.464538	A	0
1818	فوزي الشعار	0933782421			2025-09-01 12:27:07.755962	A	0
1821	فيديل	0985175111			2025-09-01 12:27:08.047035	A	0
1824	فيصل ابو قرعة	0959962132			2025-09-01 12:27:08.337734	A	0
1827	قتيبة خير الله	0949676888			2025-09-01 12:27:08.629838	A	0
1830	قتيبة خير الله 4366-501	0949676888			2025-09-01 12:27:08.920949	A	0
1833	قصة باسات فضية 2007				2025-09-01 12:27:09.211435	A	0
1836	قصي عمار اباظة	0937080782			2025-09-01 12:27:09.501892	A	0
1839	كرم عابد				2025-09-01 12:27:09.792111	A	0
1842	كنان السباعي				2025-09-01 12:27:10.082573	A	0
1845	كنان محرز	0990292959/0966016187			2025-09-01 12:27:10.373021	A	0
1848	لؤي السباعي	944275104			2025-09-01 12:27:10.665616	A	0
1851	لؤي رعد	0992249830			2025-09-01 12:27:10.956501	A	0
1854	لؤي عبد الرحمن	0996421656			2025-09-01 12:27:11.248407	A	0
1857	لبيب الجسري				2025-09-01 12:27:11.539253	A	0
1860	لبيب الجسري/سكودا أوكتافيا/فضي/892242/دمشق				2025-09-01 12:27:11.83056	A	0
1866	ليث الشلبي-PORSCHE	0969789309			2025-09-01 12:27:12.41282	A	0
1869	ليلاس حجازي	0933667743			2025-09-01 12:27:12.705274	A	0
1872	مؤسسة أبو زيد التجارية				2025-09-01 12:27:12.995895	A	0
1875	ماجد معلول	0944239456			2025-09-01 12:27:13.287311	A	0
1878	ماجد معلول AUDI Q5	0944239456			2025-09-01 12:27:13.578307	A	0
1881	ماريو نصار	+9613640747			2025-09-01 12:27:13.867879	A	0
1884	مالك السباعي	0938450302			2025-09-01 12:27:14.158411	A	0
1887	مالك الصوفي	0947449944-0959577776			2025-09-01 12:27:14.450074	A	0
1890	مالك شاكر				2025-09-01 12:27:14.740035	A	0
1893	مالك شاكر 2				2025-09-01 12:27:15.03073	A	0
1896	ماهر الحسن زيت موبيل				2025-09-01 12:27:15.321374	A	0
1899	ماهر بريجاوي				2025-09-01 12:27:15.612069	A	0
1902	ماهر سلطان				2025-09-01 12:27:15.902015	A	0
1905	ماهر عساف	0966553562			2025-09-01 12:27:16.191923	A	0
1908	ماهر وحيد ادريس	0992861285			2025-09-01 12:27:16.482313	A	0
1911	مثنى عبد الدايم	0941532991			2025-09-01 12:27:16.77423	A	0
1914	مجتبى طيارة	944364941			2025-09-01 12:27:17.064553	A	0
1917	مجد سعود				2025-09-01 12:27:17.355168	A	0
1920	مجد سيف	0937101726			2025-09-01 12:27:17.64554	A	0
1923	مجدي سحلول	0944235230			2025-09-01 12:27:17.937473	A	0
1925	مجموعة الدولي				2025-09-01 12:27:18.227839	A	0
1928	محامي علي درويش	944438448			2025-09-01 12:27:18.52183	A	0
1931	محرك 1.6 BSF من باسات/433887				2025-09-01 12:27:18.81221	A	0
1934	محرك BSF من متور 421850 رقم 117670				2025-09-01 12:27:19.102762	A	0
1937	محرك CCT من سيارة				2025-09-01 12:27:19.393787	A	0
1940	محرك CCZ043801/من 346428				2025-09-01 12:27:19.684225	A	0
1863	عدنان الشلبي	 0934841190		المالك السابق: ليث الشلبي 0969789309	2025-09-01 12:27:12.121827	A	0
1946	محمد أيمن راغب	0932810605			2025-09-01 12:27:20.265781	A	0
1949	محمد الأبرش 793885	0933390004			2025-09-01 12:27:20.55565	A	0
1952	محمد الابرش	0933390004			2025-09-01 12:27:20.845997	A	0
1958	محمد الجوجه 4851	0993540972			2025-09-01 12:27:21.425621	A	0
1961	محمد الحسامي	0944384142-0941560860			2025-09-01 12:27:21.71625	A	0
1964	محمد الحسامي/819994/حمص	0933940056			2025-09-01 12:27:22.007111	A	0
1967	محمد الحسن	0992484480			2025-09-01 12:27:22.299705	A	0
1969	محمد الخطيب / قطع سيارات	0966199574			2025-09-01 12:27:22.589329	A	0
1972	محمد الدروبي	0940133633			2025-09-01 12:27:22.878815	A	0
1975	محمد الزين	0994569894			2025-09-01 12:27:23.171335	A	0
1978	محمد الشامي	0932748572			2025-09-01 12:27:23.461813	A	0
1981	محمد الشهابي	0948888307			2025-09-01 12:27:23.752427	A	0
1984	محمد الشيخ مرعي				2025-09-01 12:27:24.044033	A	0
1987	محمد الصياد	0930240025			2025-09-01 12:27:24.334289	A	0
1990	محمد الطباع	0935112119			2025-09-01 12:27:24.625026	A	0
1993	محمد العوضي	933875222			2025-09-01 12:27:24.916252	A	0
1996	محمد الغرير	933420761			2025-09-01 12:27:25.209945	A	0
1999	محمد الفيصل	0952789444			2025-09-01 12:27:25.502985	A	0
2002	محمد النجار	0930151504			2025-09-01 12:27:25.794964	A	0
2005	محمد النداف	0955442794			2025-09-01 12:27:26.086173	A	0
2008	محمد الوعري	0937254661			2025-09-01 12:27:26.37716	A	0
2011	محمد بيازيد	0969964538			2025-09-01 12:27:26.670329	A	0
2014	محمد حداد				2025-09-01 12:27:26.962068	A	0
2017	محمد حلاق	0938116699			2025-09-01 12:27:27.252517	A	0
2020	محمد حمزة الخواجة	992659089			2025-09-01 12:27:27.544549	A	0
2023	محمد درويش / كهربجي للعمار الجديد				2025-09-01 12:27:27.837754	A	0
2026	محمد رجائي الاخرس/ 452488	0933420724			2025-09-01 12:27:28.129233	A	0
2029	محمد رجوب	0933231014			2025-09-01 12:27:28.420273	A	0
2035	محمد رومية / مخزن المحبة	0960005254			2025-09-01 12:27:29.007849	A	0
2038	محمد شعلان بهادر	0995939275			2025-09-01 12:27:29.299551	A	0
2041	محمد عبد الغني /أمتصور/منفاخ هواء				2025-09-01 12:27:29.59013	A	0
2044	محمد علي الحداد	0932996777			2025-09-01 12:27:29.880706	A	0
2047	محمد عوده	0957267709			2025-09-01 12:27:30.171735	A	0
2053	محمد قاسم دياب 1799	0933433913			2025-09-01 12:27:30.752909	A	0
2056	محمد قاسم دياب 9747	0933433913			2025-09-01 12:27:31.043549	A	0
2059	محمد قاسم دياب A4 2007	0933433913			2025-09-01 12:27:31.338842	A	0
1792	زبون 667				2025-09-01 12:27:05.195868	A	0
1795	زبون 668				2025-09-01 12:27:05.490668	A	0
1798	زبون 669				2025-09-01 12:27:05.791557	A	0
1801	زبون 670				2025-09-01 12:27:06.084969	A	0
1804	زبون 671				2025-09-01 12:27:06.373953	A	0
1807	زبون 672				2025-09-01 12:27:06.66711	A	0
1810	زبون 673				2025-09-01 12:27:06.957283	A	0
1813	زبون 674				2025-09-01 12:27:07.265066	A	0
1816	زبون 675				2025-09-01 12:27:07.573083	A	0
1819	زبون 676				2025-09-01 12:27:07.862509	A	0
1822	زبون 677				2025-09-01 12:27:08.15237	A	0
1825	زبون 678				2025-09-01 12:27:08.445003	A	0
1828	زبون 679				2025-09-01 12:27:08.736416	A	0
1831	زبون 680				2025-09-01 12:27:09.026929	A	0
1835	زبون 681				2025-09-01 12:27:09.473938	A	0
1838	زبون 682				2025-09-01 12:27:09.762233	A	0
1841	زبون 683				2025-09-01 12:27:10.05331	A	0
1844	زبون 684				2025-09-01 12:27:10.343042	A	0
1847	زبون 685				2025-09-01 12:27:10.640603	A	0
1850	زبون 686				2025-09-01 12:27:10.932548	A	0
1853	زبون 687				2025-09-01 12:27:11.224048	A	0
1856	زبون 688				2025-09-01 12:27:11.514347	A	0
1859	زبون 689				2025-09-01 12:27:11.806025	A	0
1862	زبون 690				2025-09-01 12:27:12.096814	A	0
1865	زبون 691				2025-09-01 12:27:12.389226	A	0
1868	زبون 692				2025-09-01 12:27:12.681199	A	0
1871	زبون 693				2025-09-01 12:27:12.97144	A	0
1874	زبون 694				2025-09-01 12:27:13.263793	A	0
1877	زبون 695				2025-09-01 12:27:13.556422	A	0
1880	زبون 696				2025-09-01 12:27:13.848853	A	0
1883	زبون 697				2025-09-01 12:27:14.143873	A	0
1886	زبون 698				2025-09-01 12:27:14.43574	A	0
1889	زبون 699				2025-09-01 12:27:14.727164	A	0
1892	زبون 700				2025-09-01 12:27:15.016368	A	0
1895	زبون 701				2025-09-01 12:27:15.30696	A	0
1898	زبون 702				2025-09-01 12:27:15.598439	A	0
1901	زبون 703				2025-09-01 12:27:15.898972	A	0
1904	زبون 704				2025-09-01 12:27:16.18809	A	0
1907	زبون 705				2025-09-01 12:27:16.478211	A	0
1910	زبون 706				2025-09-01 12:27:16.7727	A	0
1913	زبون 707				2025-09-01 12:27:17.062331	A	0
1916	زبون 708				2025-09-01 12:27:17.350806	A	0
1919	زبون 709				2025-09-01 12:27:17.641512	A	0
1922	زبون 710				2025-09-01 12:27:17.93042	A	0
1926	زبون 711				2025-09-01 12:27:18.361545	A	0
1929	زبون 712				2025-09-01 12:27:18.650923	A	0
1932	زبون 713				2025-09-01 12:27:18.942374	A	0
1935	زبون 714				2025-09-01 12:27:19.233603	A	0
1938	زبون 715				2025-09-01 12:27:19.522013	A	0
1941	زبون 716				2025-09-01 12:27:19.812325	A	0
1944	زبون 717				2025-09-01 12:27:20.101151	A	0
1947	زبون 718				2025-09-01 12:27:20.39627	A	0
1950	زبون 719				2025-09-01 12:27:20.697298	A	0
1953	زبون 720				2025-09-01 12:27:20.987684	A	0
1956	زبون 721				2025-09-01 12:27:21.282377	A	0
1959	زبون 722				2025-09-01 12:27:21.579622	A	0
1962	زبون 723				2025-09-01 12:27:21.869715	A	0
1965	زبون 724				2025-09-01 12:27:22.159393	A	0
1968	زبون 725				2025-09-01 12:27:22.447002	A	0
1971	زبون 726				2025-09-01 12:27:22.738583	A	0
1974	زبون 727				2025-09-01 12:27:23.032825	A	0
1977	زبون 728				2025-09-01 12:27:23.325102	A	0
1980	زبون 729				2025-09-01 12:27:23.620548	A	0
1983	زبون 730				2025-09-01 12:27:23.91992	A	0
1986	زبون 731				2025-09-01 12:27:24.212699	A	0
1989	زبون 732				2025-09-01 12:27:24.507539	A	0
1992	زبون 733				2025-09-01 12:27:24.800497	A	0
1995	زبون 734				2025-09-01 12:27:25.095304	A	0
1998	زبون 735				2025-09-01 12:27:25.390948	A	0
2001	زبون 736				2025-09-01 12:27:25.682226	A	0
2004	زبون 737				2025-09-01 12:27:25.983415	A	0
2007	زبون 738				2025-09-01 12:27:26.274349	A	0
2010	زبون 739				2025-09-01 12:27:26.567258	A	0
2013	زبون 740				2025-09-01 12:27:26.854957	A	0
2016	زبون 741				2025-09-01 12:27:27.153026	A	0
2019	زبون 742				2025-09-01 12:27:27.448061	A	0
2022	زبون 743				2025-09-01 12:27:27.744511	A	0
2025	زبون 744				2025-09-01 12:27:28.036143	A	0
2028	زبون 745				2025-09-01 12:27:28.332706	A	0
2031	زبون 746				2025-09-01 12:27:28.634374	A	0
2034	زبون 747				2025-09-01 12:27:28.928595	A	0
2037	زبون 748				2025-09-01 12:27:29.217565	A	0
2040	زبون 749				2025-09-01 12:27:29.516846	A	0
2043	زبون 750				2025-09-01 12:27:29.809532	A	0
2046	زبون 751				2025-09-01 12:27:30.102951	A	0
2049	زبون 752				2025-09-01 12:27:30.392739	A	0
2052	زبون 753				2025-09-01 12:27:30.681865	A	0
2055	زبون 754				2025-09-01 12:27:30.976961	A	0
2058	زبون 755				2025-09-01 12:27:31.267539	A	0
2061	زبون 756				2025-09-01 12:27:31.561859	A	0
2064	زبون 757				2025-09-01 12:27:31.853931	A	0
2067	زبون 758				2025-09-01 12:27:32.148263	A	0
2070	زبون 759				2025-09-01 12:27:32.438215	A	0
2073	زبون 760				2025-09-01 12:27:32.729682	A	0
2076	زبون 761				2025-09-01 12:27:33.024284	A	0
2079	زبون 762				2025-09-01 12:27:33.327518	A	0
2082	زبون 763				2025-09-01 12:27:33.636443	A	0
2085	زبون 764				2025-09-01 12:27:33.931943	A	0
2088	زبون 765				2025-09-01 12:27:34.220962	A	0
2091	زبون 766				2025-09-01 12:27:34.511386	A	0
2062	محمد قاسم دياب/ 6936	0933433913			2025-09-01 12:27:31.62947	A	0
2065	محمد قصي شيخو	0932884888			2025-09-01 12:27:31.920251	A	0
2068	محمد قطان	09064397763			2025-09-01 12:27:32.211544	A	0
2071	محمد مازن خرطبيل	0933303500			2025-09-01 12:27:32.502146	A	0
2074	محمد مندو	0940150999			2025-09-01 12:27:32.793665	A	0
2077	محمد منذر قطان	0944256030			2025-09-01 12:27:33.085043	A	0
2080	محمد منزلجي	0936460416			2025-09-01 12:27:33.375581	A	0
2083	محمد موسى	0984682610			2025-09-01 12:27:33.666483	A	0
2086	محمد ناجي قباقيبو				2025-09-01 12:27:33.957272	A	0
2089	محمد ونوس				2025-09-01 12:27:34.247312	A	0
2092	محمد يوسف	0935607310			2025-09-01 12:27:34.538511	A	0
2130	عبادة السلقيني 	0968307388			2025-09-01 12:27:38.326428	A	0
2094	زبون 767				2025-09-01 12:27:34.80538	A	0
2095	محمدالحمود	930164932			2025-09-01 12:27:34.827907	A	0
2097	زبون 768				2025-09-01 12:27:35.11334	A	0
2098	محمود السقا	0997636396			2025-09-01 12:27:35.118589	A	0
2100	محمود رحمون	938012035			2025-09-01 12:27:35.416087	A	0
2101	زبون 769				2025-09-01 12:27:35.454305	A	0
2103	محمود زكريا	0937512787			2025-09-01 12:27:35.706927	A	0
2104	زبون 770				2025-09-01 12:27:35.749102	A	0
2106	محمود سلطان				2025-09-01 12:27:36.000671	A	0
2107	زبون 771				2025-09-01 12:27:36.041442	A	0
2109	محمود سلطان - 504-7810	0966443850			2025-09-01 12:27:36.290102	A	0
2110	زبون 772				2025-09-01 12:27:36.342297	A	0
2112	محمود سلطان 2635-523	0966443850			2025-09-01 12:27:36.580202	A	0
2114	زبون 773				2025-09-01 12:27:36.79898	A	0
2115	محمود عاجوقة	993850722			2025-09-01 12:27:36.870873	A	0
2117	زبون 774				2025-09-01 12:27:37.087982	A	0
2118	محمود عبد الوهاب	0993372082			2025-09-01 12:27:37.162493	A	0
2120	زبون 775				2025-09-01 12:27:37.378673	A	0
2121	محمود كليب	0967244268			2025-09-01 12:27:37.453252	A	0
2123	زبون 776				2025-09-01 12:27:37.675587	A	0
2124	محمود مخزوم				2025-09-01 12:27:37.744577	A	0
2126	زبون 777				2025-09-01 12:27:37.965901	A	0
2127	محمود مطر	0933156123			2025-09-01 12:27:38.03497	A	0
2129	زبون 778				2025-09-01 12:27:38.261451	A	0
2132	زبون 779				2025-09-01 12:27:38.552309	A	0
2133	محمود ياسين	0955594442			2025-09-01 12:27:38.616957	A	0
2135	زبون 780				2025-09-01 12:27:38.84224	A	0
2136	محمود ياسين /504-2535	0955594442			2025-09-01 12:27:38.908301	A	0
2138	زبون 781				2025-09-01 12:27:39.133947	A	0
2139	محمود ياسين 504-2537	0955594442			2025-09-01 12:27:39.200214	A	0
2141	زبون 782				2025-09-01 12:27:39.427282	A	0
2142	محمود ياسين1504-521	0955594442			2025-09-01 12:27:39.491183	A	0
2144	زبون 783				2025-09-01 12:27:39.717885	A	0
2145	محي الدين الحسامي	0944383220			2025-09-01 12:27:39.781915	A	0
2147	زبون 784				2025-09-01 12:27:40.008628	A	0
2148	مختار الطالب	0937256419			2025-09-01 12:27:40.073151	A	0
2150	زبون 785				2025-09-01 12:27:40.298364	A	0
2151	مخرطة السباعي				2025-09-01 12:27:40.370096	A	0
2153	زبون 786				2025-09-01 12:27:40.590032	A	0
2154	مخرطة عبد العظيم				2025-09-01 12:27:40.66097	A	0
2156	زبون 787				2025-09-01 12:27:40.879253	A	0
2157	مخرطة عمرو/تل الشور				2025-09-01 12:27:40.953292	A	0
2159	زبون 788				2025-09-01 12:27:41.170092	A	0
2160	مدين سعيد	991519393			2025-09-01 12:27:41.243931	A	0
2161	زبون 789				2025-09-01 12:27:41.462961	A	0
2163	مدين صوان	0944930622			2025-09-01 12:27:41.534724	A	0
2164	زبون 790				2025-09-01 12:27:41.755353	A	0
2166	مركز الشركات الكورية/محمد رضوان زينو	021-44606693-021-4444691-0955218835			2025-09-01 12:27:41.824168	A	0
2167	زبون 791				2025-09-01 12:27:42.044689	A	0
2169	مركز الصالح التقني/أبو صالح	0944043234			2025-09-01 12:27:42.114879	A	0
2170	زبون 792				2025-09-01 12:27:42.335071	A	0
2171	مرهف دراقي	957429200			2025-09-01 12:27:42.408118	A	0
2173	زبون 793				2025-09-01 12:27:42.624212	A	0
2174	مرهف طيارة	0949504697			2025-09-01 12:27:42.699763	A	0
2176	زبون 794				2025-09-01 12:27:42.915884	A	0
2177	مروان الحلبي	0988501126			2025-09-01 12:27:42.991757	A	0
2179	زبون 795				2025-09-01 12:27:43.206034	A	0
2180	مروان حورية	0991800003			2025-09-01 12:27:43.282039	A	0
2182	زبون 796				2025-09-01 12:27:43.497831	A	0
2185	زبون 797				2025-09-01 12:27:43.790657	A	0
2183	مصطفى عرفة/اوكتافيا/ابيض/260447/دمشق	0932041440			2025-09-01 12:27:43.572622	A	0
2186	مصطفى عرفة/باسات B6/فضي/411011/حمص				2025-09-01 12:27:43.863292	A	0
2189	مصطفى عرفة/جولف/2001/أبيض/944950/دمشق	0932041440			2025-09-01 12:27:44.154322	A	0
2192	مصطفى عرفة/جولف/ابيض/690097/	0932041440-0966211151			2025-09-01 12:27:44.444795	A	0
2195	مصطفى عرفة/سكودا 2009أوكتافيا/بنفسجي/409678/دمشق	0932041440-0966211151			2025-09-01 12:27:44.735495	A	0
2198	مضر الجندلي 6052-511	0993998061			2025-09-01 12:27:45.025838	A	0
2201	مضر جندلي				2025-09-01 12:27:45.316702	A	0
2204	مظهر سلوم	0933953095			2025-09-01 12:27:45.608294	A	0
2207	معاذ ألفين				2025-09-01 12:27:45.899201	A	0
2210	معاذ ألفين \\ TAOUREG	0944428294			2025-09-01 12:27:46.191579	A	0
2213	معاذ ألفين Q7	0944428294			2025-09-01 12:27:46.482349	A	0
2216	معاذ ألفين/أوكتافيا تور/أبيض/407121/حمص				2025-09-01 12:27:46.770864	A	0
2218	معاذ ألفين/اودي/230061/2006/سماوي/دمشق	0944428294			2025-09-01 12:27:47.072869	A	0
2220	معاذ ألفين/باسات 2007 أسود/433887				2025-09-01 12:27:47.363802	A	0
2222	معاذ ألفين/طوارق/2009/بني/262777/طرطوس				2025-09-01 12:27:47.654295	A	0
2224	معاذ ألفين1628-505				2025-09-01 12:27:47.945114	A	0
2226	معاذ الفين 5260-501				2025-09-01 12:27:48.235854	A	0
2228	معاذ الفين/اودي A4/اسود/دمشق/331923				2025-09-01 12:27:48.526349	A	0
2230	معاذألفين/أودي A4/أسود/898503/دمشق				2025-09-01 12:27:48.81759	A	0
2232	معتز عكام	0966688840			2025-09-01 12:27:49.108724	A	0
2234	معتز نوح	0944431428			2025-09-01 12:27:49.397802	A	0
2236	معد قطيني	0958330581			2025-09-01 12:27:49.687809	A	0
2238	مفيد شريباتي	0945583714			2025-09-01 12:27:49.977769	A	0
2240	ملاذ السلقيني	944208182			2025-09-01 12:27:50.274485	A	0
2242	ملهم الأزهري	+352681136610			2025-09-01 12:27:50.564507	A	0
2244	ملهم السالم	0980577339			2025-09-01 12:27:50.85388	A	0
2246	ملهم عيون السود	951510706			2025-09-01 12:27:51.14571	A	0
2248	ملهم عيون السود/باسات3.2/كحلي/507692دمشق				2025-09-01 12:27:51.436428	A	0
2250	ملهم ملوحي	0944926686			2025-09-01 12:27:51.797685	A	0
2252	ممدوح تركاوي	944604071			2025-09-01 12:27:52.091282	A	0
2254	منار الزعيم	0933707061			2025-09-01 12:27:52.388732	A	0
2256	منار ديب	0939518658			2025-09-01 12:27:52.678503	A	0
2258	منذر الحصني	944604071			2025-09-01 12:27:52.969142	A	0
2260	منظمة طلائع البعث /حسام الدرة	0991396730			2025-09-01 12:27:53.259553	A	0
2262	منهل الحلبي/كواترو				2025-09-01 12:27:53.550264	A	0
2264	منير القصير	0933333636			2025-09-01 12:27:53.84024	A	0
2268	مهرب السح	0984564988			2025-09-01 12:27:54.420852	A	0
2270	مهند ادريس	0933003919			2025-09-01 12:27:54.712721	A	0
2272	مهند الإمام	0955726382			2025-09-01 12:27:55.002988	A	0
2274	مهند الصالح	0991557041			2025-09-01 12:27:55.294657	A	0
2276	مهند حوراني	0988760601			2025-09-01 12:27:55.585119	A	0
2278	مهند سليمان	0947255510			2025-09-01 12:27:55.879485	A	0
2282	مهند مطر	0935481777			2025-09-01 12:27:56.471071	A	0
2284	مواد معدومة				2025-09-01 12:27:56.763698	A	0
2286	مورد مواد مختلفة				2025-09-01 12:27:57.05428	A	0
2288	ميسرة الايوبي				2025-09-01 12:27:57.346515	A	0
2290	ميشيل الحجل	0952458040			2025-09-01 12:27:57.636467	A	0
2294	ميشيل عزوز	0933379859			2025-09-01 12:27:58.219587	A	0
2296	نادر الحسيني	0944428294			2025-09-01 12:27:58.511908	A	0
2298	نادر كرمو علوش	0955802976			2025-09-01 12:27:58.802499	A	0
2300	ناصرحسون	0954499087			2025-09-01 12:27:59.094602	A	0
2302	نايف عودة	0937771078			2025-09-01 12:27:59.385468	A	0
2304	نبيل الحجي	0955555010			2025-09-01 12:27:59.682251	A	0
2308	نبيل نقشو				2025-09-01 12:28:00.266557	A	0
2310	نبيل نقشو /406906/حمص				2025-09-01 12:28:00.560184	A	0
2312	نبيل نقشو \\479794\\ اوكتافيا	0944622120			2025-09-01 12:28:00.849869	A	0
2314	نبيل نقشو 1 /اوكتافيا/679212/2011/فضي/اللاذقية	0944622120			2025-09-01 12:28:01.140103	A	0
2316	نبيل نقشو 5965				2025-09-01 12:28:01.430542	A	0
2318	نبيل نقشو 604510				2025-09-01 12:28:01.721475	A	0
2320	نبيل نقشو SEAT	0944622120			2025-09-01 12:28:02.012216	A	0
2322	نبيل نقشو فابيا \\ 458116	0944622120			2025-09-01 12:28:02.304437	A	0
2324	نبيل نقشو/باسات2006/أسود/938808/دمشق				2025-09-01 12:28:02.595294	A	0
2326	نبيل نقشو/باسات2006/رصاصي/569359/دمشق				2025-09-01 12:28:02.885895	A	0
2328	نبيل نقشو/باسات2009/فضي/465515/دمشق				2025-09-01 12:28:03.17677	A	0
2330	نبيل نقشو/هارون العلي/أودي 2009/A6/ أسود/319689/دمشق				2025-09-01 12:28:03.471926	A	0
2332	نبيه الدالاتي	0932009591			2025-09-01 12:28:03.762749	A	0
2334	نجيب رجوب	930287923			2025-09-01 12:28:04.053748	A	0
2336	نسيب ادريس	0933550522			2025-09-01 12:28:04.344672	A	0
2338	نضال السلقيني	0933476247			2025-09-01 12:28:04.635894	A	0
2340	نواف خضور	0994502806-0936422223			2025-09-01 12:28:04.930662	A	0
2342	نور الدين مكاوي/بروفي كار/حماة				2025-09-01 12:28:05.221063	A	0
2344	نور دراق السباعي	0994502806-0936422223			2025-09-01 12:28:05.511828	A	0
2346	نورس الحسامي/باساتVW/2010/أسود/793098/دمشق	0934406600			2025-09-01 12:28:05.80391	A	0
2348	نوفل مرهج	944837255			2025-09-01 12:28:06.094521	A	0
2350	هاشم عساف	0937734413			2025-09-01 12:28:06.385449	A	0
2352	هاني العطو	0949131360			2025-09-01 12:28:06.676399	A	0
2354	هاني العطو porsche	0949131360			2025-09-01 12:28:06.97183	A	0
2356	هاني ميداني	0981949145			2025-09-01 12:28:07.26322	A	0
2358	همام رضوان				2025-09-01 12:28:07.554552	A	0
2360	هيثم المسوكر	933651481			2025-09-01 12:28:07.846058	A	0
2362	هيثم شرابي	0941444307			2025-09-01 12:28:08.138531	A	0
2364	هيثم عباس AUDI A6	0955594614			2025-09-01 12:28:08.429612	A	0
2188	زبون 798				2025-09-01 12:27:44.079137	A	0
2191	زبون 799				2025-09-01 12:27:44.368649	A	0
2194	زبون 800				2025-09-01 12:27:44.658913	A	0
2197	زبون 801				2025-09-01 12:27:44.948625	A	0
2200	زبون 802				2025-09-01 12:27:45.240779	A	0
2203	زبون 803				2025-09-01 12:27:45.539887	A	0
2206	زبون 804				2025-09-01 12:27:45.829801	A	0
2209	زبون 805				2025-09-01 12:27:46.122377	A	0
2212	زبون 806				2025-09-01 12:27:46.414541	A	0
2215	زبون 807				2025-09-01 12:27:46.704743	A	0
2366	هيثم هلال	933796036			2025-09-01 12:28:08.720498	A	0
2368	وائل الحموي	0956214436			2025-09-01 12:28:09.011623	A	0
2370	وائل المحمد	0933617615			2025-09-01 12:28:09.301222	A	0
2372	وائل اوسو	0998604757			2025-09-01 12:28:09.591698	A	0
2376	وائل عمار - قصر المحافظة حمص	0944892120			2025-09-01 12:28:10.181604	A	0
2378	وائل محرز				2025-09-01 12:28:10.472874	A	0
2380	وسام ديوب	0955427902			2025-09-01 12:28:10.764727	A	0
2382	وسام رفقة				2025-09-01 12:28:11.054844	A	0
2384	وسام رومية	0934998489			2025-09-01 12:28:11.346391	A	0
2386	وسيم الأسعد	0933351371			2025-09-01 12:28:11.636639	A	0
2388	وسيم المحمد	0935194634			2025-09-01 12:28:11.927717	A	0
2390	وسيم حمدالله	0933945548			2025-09-01 12:28:12.218918	A	0
2392	وسيم دربي	0935599628			2025-09-01 12:28:12.512316	A	0
2394	وسيم ديب	0964831991			2025-09-01 12:28:12.804929	A	0
2396	وليد الخليل	0994564347			2025-09-01 12:28:13.095757	A	0
2398	وليم يوسف	0933162662			2025-09-01 12:28:13.386263	A	0
2402	ياسر الحافظ	0996966987			2025-09-01 12:28:13.967305	A	0
2404	ياسر غربال	0991320016			2025-09-01 12:28:14.25771	A	0
2406	يامن بالي	0935000419			2025-09-01 12:28:14.548812	A	0
2408	يامن بالي/اودي A8/اسود/673340/دمشق	0935000419			2025-09-01 12:28:14.846107	A	0
2410	يامن عبد النور	0993137274			2025-09-01 12:28:15.135934	A	0
2412	يحيى الطباع	0966685252			2025-09-01 12:28:15.426844	A	0
2414	يحيى العجي	0933511161			2025-09-01 12:28:15.71864	A	0
2416	يحيى النجار	0983684812			2025-09-01 12:28:16.009537	A	0
2418	يحيى داغستاني	0933710234			2025-09-01 12:28:16.299736	A	0
2420	يحيى عثمان	0942011194			2025-09-01 12:28:16.593685	A	0
2422	يوسف جديد	0955452346			2025-09-01 12:28:16.884022	A	0
3936	محمود الطباع	0930470853	\N	\N	2025-09-02 10:02:53.978452	A	0
\.


--
-- Data for Name: maintenance_guides; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.maintenance_guides (id, car_brand, car_part, title, content, tools, safety_tips, estimated_time, difficulty, generated_at, last_used, use_count) FROM stdin;
1	audi	engine	دليل صيانة محرك أودي - نموذج تجريبي (نموذج تجريبي)	خطوات صيانة المحرك:\n\n1. إيقاف تشغيل المحرك والانتظار حتى يبرد تماماً (30-45 دقيقة)\n2. رفع السيارة باستخدام رافعة هيدروليكية أو منحدر آمن\n3. تفريغ زيت المحرك القديم من خلال برغي التفريغ أسفل وعاء الزيت\n4. إزالة فلتر الزيت القديم باستخدام مفتاح فلتر الزيت\n5. تنظيف سطح تركيب الفلتر الجديد\n6. تطبيق طبقة رقيقة من الزيت الجديد على حلقة الفلتر الجديد\n7. تركيب الفلتر الجديد وإحكام ربطه باليد ثم ربع لفة إضافية\n8. ملء المحرك بالزيت الجديد حسب المواصفات (عادة 4-6 لترات لمحركات أودي)\n9. تشغيل المحرك لمدة 5 دقائق للتأكد من عدم وجود تسريبات\n10. فحص مستوى الزيت وإضافة المزيد إذا لزم الأمر	["مفتاح فلتر زيت","مفتاح براغي متعدد الأحجام","وعاء لجمع الزيت المستعمل","قفازات واقية","قطع قماش نظيفة","رافعة هيدروليكية أو منحدر","قمع لإضافة الزيت"]	["تأكد من برودة المحرك تماماً قبل البدء","استخدم نظارات واقية لحماية العينين","لا تدخن أو تستخدم اللهب المكشوف بالقرب من الزيوت","تأكد من استقرار السيارة قبل العمل تحتها","تخلص من الزيت المستعمل في مراكز إعادة التدوير المخصصة","اغسل يديك جيداً بالصابون بعد انتهاء العمل"]	45	medium	2025-09-23 11:16:18.431898	\N	0
\.


--
-- Data for Name: parts_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.parts_requests (id, request_number, engineer_name, car_info, car_brand, car_model, reason_type, part_name, quantity, status, notes, requested_by, requested_at, approved_by, approved_at, delivered_by, delivered_at, license_plate, chassis_number, engine_code, in_preparation_at, ready_for_pickup_at, ordered_externally_at, ordered_externally_by, estimated_arrival, unavailable_at, unavailable_by, parts_arrived_at, parts_arrived_by, returned_at, returned_by, return_reason, user_notes, customer_name, for_workshop) FROM stdin;
28	طلب-17	عبد الحفيظ	مهند عبد الصمد - VOLKSWAGEN Passat - 510-3935	VOLKSWAGEN	Passat	expense	نصف لتر بنزين	1	delivered	تم استلام القطعة	\N	2025-09-04 10:30:26	\N	2025-09-04 10:31:20	بدوي	2025-09-04 11:56:55	510-3935	WVWAP2AN5DE548252	CCZ	2025-09-04 10:31:20	2025-09-04 10:31:26	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	مهند عبد الصمد	\N
16	طلب-5	عبد الحفيظ	لؤي السباعي - سكودا اوكتافيا1 - 263965-حمص	سكودا	اوكتافيا1	loan	برغي جنط	1	rejected	تم رفض الطلب	\N	2025-09-03 10:32:35	\N	\N	\N	\N	263965-حمص	TMBCK11U732815657	1.6MPI	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	لؤي السباعي	\N
17	طلب-6	بدوي	عبد المجيد كلزلي - AUDI Q5 - 513-4564	AUDI	Q5	expense	فيوز 10 أمبير	1	rejected	تم رفض الطلب	\N	2025-09-03 10:38:48	\N	\N	\N	\N	513-4564	WA1CGCFP3EA006997	CTV	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عبد المجيد كلزلي	\N
12	طلب-1	بدوي	محمود الطباع - VOLKSWAGEN Passat cc - 513-3427	VOLKSWAGEN	Passat cc	expense	امتاصور غطاء محرك	1	delivered	تم استلام القطعة	\N	2025-09-02 13:03:24	\N	\N	بدوي	2025-09-02 13:03:34	513-3427	WVWADZAN6DE526091	لايوجد	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	محمود الطباع	\N
29	طلب-18	بدوي	مهند عبد الصمد - VOLKSWAGEN Passat - 510-3935	VOLKSWAGEN	Passat	expense	أصابع سيخ رجاج خلفية	1	delivered	تم استلام القطعة	\N	2025-09-04 10:40:32	\N	\N	بدوي	2025-09-06 10:02:21	510-3935	WVWAP2AN5DE548252	CCZ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	مهند عبد الصمد	\N
34	طلب-23	علي	محمد موسى - VW GOLF R - 518-2382	VW	GOLF R	expense	زيت محرك 5 ليتر 40/5 موبيل + لتر 5علبة السرعة DSG + مصفاية زيت محرك	1	delivered	تم استلام القطعة	\N	2025-09-06 10:11:00	\N	2025-09-06 10:44:37	بدوي	2025-09-06 11:14:33	518-2382	WVWGR2AU3FW026311	CJXB	2025-09-06 10:44:37	2025-09-06 10:44:40	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	محمد موسى	\N
31	طلب-20	علي	أحمد شرابي / 509007 - SKODA OCTAVIA - 509007-دمشق	SKODA	OCTAVIA	loan	بوبين	1	delivered	تم استلام القطعة	\N	2025-09-06 09:54:58	\N	2025-09-06 09:56:08	بدوي	2025-09-06 10:02:30	509007-دمشق	TMBBA41Z952102970	BSE	2025-09-06 09:56:08	2025-09-06 09:56:14	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	أحمد شرابي / 509007	\N
20	طلب-9	حسام	عمر طرابلسي - AUDI A6 - 453235	AUDI	A6	expense	تتت	1	rejected	تم رفض الطلب	\N	2025-09-03 10:50:20	\N	\N	\N	\N	453235	WALCFCFP5FA007847	CDA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عمر طرابلسي	\N
19	طلب-8	بدوي	عمر طرابلسي - AUDI A6 - 453235	AUDI	A6	expense	تتت	1	rejected	تم رفض الطلب	\N	2025-09-03 10:46:35	\N	\N	\N	\N	453235	WALCFCFP5FA007847	CDA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عمر طرابلسي	\N
18	طلب-7	خالد	عمر طرابلسي - AUDI A6 - 453235	AUDI	A6	expense	تت	1	rejected	تم رفض الطلب	\N	2025-09-03 10:46:10	\N	\N	\N	\N	453235	WALCFCFP5FA007847	CDA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عمر طرابلسي	\N
24	طلب-13	بدوي	هاشم الأتاسي - AUDI A6 - 503-1397	AUDI	A6	expense	حساس ضغط غاز مكيف	1	delivered	تم استلام القطعة	\N	2025-09-03 13:44:58	\N	2025-09-03 13:53:26	بدوي	2025-09-03 14:07:39	503-1397	WAUBHC4G0CN076392	CHVA	2025-09-03 13:53:26	2025-09-03 13:53:27	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	هاشم الأتاسي	\N
23	طلب-12	علي	أحمد هلال - VOLKSWAGEN Passat - 573986	VOLKSWAGEN	Passat	expense	5 لتر زيت 40/10 موبيل	1	delivered	تم استلام القطعة	\N	2025-09-03 13:06:50	\N	2025-09-03 13:28:36	بدوي	2025-09-03 14:17:30	573986	WVWGM23C17E228946	BVZ	2025-09-03 13:28:36	2025-09-03 13:28:41	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	أحمد هلال	\N
21	طلب-10	بدوي	زيد السلقيني - VW TIGUAN - 508-4567	VW	TIGUAN	expense	بوبين	1	delivered	تم استلام القطعة	\N	2025-09-03 10:58:59	\N	2025-09-03 13:28:58	بدوي	2025-09-03 14:17:32	508-4567	WVGCE15N0BW020320	CCZ	2025-09-03 13:28:58	2025-09-03 13:29:02	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	زيد السلقيني	\N
15	طلب-4	علي	تامر نوح - VOLKSWAGEN Passat cc - 211152	VOLKSWAGEN	Passat cc	expense	5 لتر زيت علبة السرعة 	1	delivered	تم استلام القطعة	\N	2025-09-03 10:29:44	\N	2025-09-03 10:31:12	بدوي	2025-09-03 14:17:35	211152	WVWZZZ3CZ9E557074	BWS	2025-09-03 10:31:12	2025-09-03 10:31:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	تامر نوح	\N
13	طلب-2	علي	هاشم الأتاسي - AUDI A6 - 503-1397	AUDI	A6	expense	PH	1	delivered	تم استلام القطعة	\N	2025-09-02 15:17:17	\N	2025-09-03 09:41:38	بدوي	2025-09-03 14:17:47	503-1397	WAUBHC4G0CN076392	CHVA	2025-09-03 09:41:38	2025-09-03 10:31:40	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	هاشم الأتاسي	\N
14	طلب-3	عبد الحفيظ	أحمد بصل - AUDI A7 - 514-1465	AUDI	A7	expense	فلتر مكيف +فلتر هواء محرك	1	delivered	تم استلام القطعة	\N	2025-09-03 10:13:59	\N	2025-09-03 10:31:21	بدوي	2025-09-03 14:17:53	514-1465	WAUZZZ46XCN003209	CGXB	2025-09-03 10:31:21	2025-09-03 10:31:27	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	أحمد بصل	\N
22	طلب-11	عبد الحفيظ	ورشة			expense	علبة PH	1	delivered	تم استلام القطعة	\N	2025-09-03 11:09:12	\N	2025-09-03 13:28:52	بدوي	2025-09-03 14:17:57	\N	\N	\N	2025-09-03 13:28:52	2025-09-03 13:29:20	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N		\N
30	طلب-19	بدوي	جمال المغربي - AUDI Q5 - 502-9080	AUDI	Q5	expense	ميل توازن ( ميل النار)	1	delivered	تم استلام القطعة	\N	2025-09-04 11:35:15	\N	2025-09-04 11:40:41	بدوي	2025-09-04 11:56:30	502-9080	WAUCFC8R2BA042938	CDN	2025-09-04 11:40:41	\N	\N	\N	\N	2025-09-04 11:40:48	هبة	\N	\N	\N	\N	\N	\N	جمال المغربي	\N
25	طلب-14	علي	هاشم الأتاسي - AUDI A6 - 503-1397	AUDI	A6	expense	لتر J12 	1	delivered	تم استلام القطعة	\N	2025-09-03 14:16:54	\N	2025-09-03 14:19:20	بدوي	2025-09-04 11:56:38	503-1397	WAUBHC4G0CN076392	CHVA	2025-09-03 14:19:20	2025-09-03 14:19:30	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	هاشم الأتاسي	\N
26	طلب-15	عبد الحفيظ	مهند عبد الصمد - VOLKSWAGEN Passat - 510-3935	VOLKSWAGEN	Passat	expense	باغات كف خلفية 	1	delivered	تم استلام القطعة	\N	2025-09-03 15:35:25	\N	2025-09-04 09:28:47	بدوي	2025-09-04 11:56:41	510-3935	WVWAP2AN5DE548252	CCZ	2025-09-04 09:28:47	2025-09-04 09:28:50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	مهند عبد الصمد	\N
27	طلب-16	علي	محمد النداف - اودي A8 - 350184-دمشق	اودي	A8	expense	عصارة رينز	1	delivered	تم استلام القطعة	\N	2025-09-04 09:27:54	\N	2025-09-04 09:28:53	بدوي	2025-09-04 11:56:51	350184-دمشق	WAUZZZ4DZ1N012670	AUW-4.2	2025-09-04 09:28:53	2025-09-04 09:28:55	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	محمد النداف	\N
33	طلب-22	علي	أحمد شرابي / 509007 - SKODA OCTAVIA - 509007-دمشق	SKODA	OCTAVIA	loan	طقم شرطان	1	delivered	تم استلام القطعة	\N	2025-09-06 10:05:21	\N	2025-09-06 10:06:04	بدوي	2025-09-06 13:07:59	509007-دمشق	TMBBA41Z952102970	BSE	2025-09-06 10:06:04	2025-09-06 10:44:50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	أحمد شرابي / 509007	\N
35	طلب-24	مصطفى	جمال المغربي - AUDI Q5 - 502-9080	AUDI	Q5	expense	عصارة فيكتور رينز	1	delivered	تم استلام القطعة	\N	2025-09-06 12:58:01	\N	\N	بدوي	2025-09-06 13:46:04	502-9080	WAUCFC8R2BA042938	CDN	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	جمال المغربي	\N
37	طلب-26	علي	رافد نقشو - VW PASSAT - 732132-دمشق	VW	PASSAT	expense	بخاخين بنزين	1	delivered	تم استلام القطعة	\N	2025-09-06 13:46:44	\N	\N	بدوي	2025-09-08 12:03:41	732132-دمشق	WVWZZZ3CZ9P055192	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	رافد نقشو	\N
36	طلب-25	عبد الحفيظ	4851			expense	زيت محرك 5 لتر + مصفاة	1	delivered	تم استلام القطعة	\N	2025-09-06 13:32:09	\N	2025-09-06 13:45:33	بدوي	2025-09-06 14:09:29	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	452565	جمال المغربي	\N
39	طلب-28	عبد الحفيظ	صهيب سويدان - VW PASSAT - 523-3107	VW	PASSAT	expense	نصف لتر بنزين	1	delivered	تم استلام القطعة	\N	2025-09-08 11:58:35	\N	\N	بدوي	2025-09-08 12:03:33	523-3107	WVWCR7A38EC000676	CBT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	صهيب سويدان	\N
32	طلب-21	عبد الحفيظ	صهيب سويدان - VW PASSAT - 523-3107	VW	PASSAT	expense	سيخ زيت محرك+ فلتر هواء + مبرد زيت محرك + مبرد زيت علبة السرعة 	1	delivered	تم استلام القطعة	\N	2025-09-06 09:58:34	\N	2025-09-06 10:00:04	بدوي	2025-09-08 12:03:49	523-3107	WVWCR7A38EC000676	CBT	2025-09-06 10:00:04	2025-09-06 10:45:02	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	صهيب سويدان	\N
47	طلب-36	عبد الحفيظ	محمود الطباع - VOLKSWAGEN Passat cc - 513-3427	VOLKSWAGEN	Passat cc	expense	طقم بواجي	1	delivered	تم استلام القطعة	\N	2025-09-09 10:09:37	\N	\N	بدوي	2025-09-09 10:34:08	513-3427	WVWADZAN6DE526091	لايوجد	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	محمود الطباع	\N
48	طلب-37	عبد الحفيظ	محمود الطباع - VOLKSWAGEN Passat cc - 513-3427	VOLKSWAGEN	Passat cc	expense	لمبة جانبية يسار	1	delivered	تم استلام القطعة	\N	2025-09-09 10:13:58	\N	\N	بدوي	2025-09-09 10:34:15	513-3427	WVWADZAN6DE526091	لايوجد	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	محمود الطباع	\N
42	طلب-31	علي	حكم الدروبي - VW TOUAREG - 517-6441	VW	TOUAREG	expense	ضبات راس اكس	1	delivered	تم استلام القطعة	\N	2025-09-08 12:50:39	\N	2025-09-08 12:55:55	بدوي	2025-09-08 14:28:37	517-6441	WVGBC2BP0DD000189	CGRA	2025-09-08 12:55:55	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	حكم الدروبي	\N
44	طلب-33	عبد الحفيظ	يحيى عثمان - AUDI A6 - 530-1125	AUDI	A6	expense	7 لتر زيت 40/5 شامبيون + مصفاة	1	delivered	تم استلام القطعة	\N	2025-09-08 14:39:21	\N	\N	بدوي	2025-09-08 15:09:44	530-1125	WAUZZZ463EN012293	CTUA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	يحيى عثمان	\N
43	طلب-32	علي	عدنان الشلبي - AUDI Q7 - 562310	AUDI	Q7	expense	غطاوة فضال ماء	1	delivered	تم استلام القطعة	\N	2025-09-08 14:20:42	\N	\N	بدوي	2025-09-08 15:09:48	562310	WAYAV94L57D047300	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عدنان الشلبي	\N
41	طلب-30	علي	عدنان الشلبي - AUDI Q7 - 562310	AUDI	Q7	expense	لمبتين أماميات	1	delivered	تم استلام القطعة	\N	2025-09-08 12:39:04	\N	2025-09-08 13:07:21	بدوي	2025-09-08 15:09:51	562310	WAYAV94L57D047300	\N	2025-09-08 13:07:21	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عدنان الشلبي	\N
40	طلب-29	علي	عدنان الشلبي - AUDI Q7 - 562310	AUDI	Q7	expense	نصف لتر بنزين+ PH	1	delivered	تم استلام القطعة	\N	2025-09-08 12:11:03	\N	2025-09-08 12:22:40	بدوي	2025-09-08 15:09:54	562310	WAYAV94L57D047300	\N	2025-09-08 12:22:40	2025-09-08 12:22:44	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عدنان الشلبي	\N
38	طلب-27	علي	ليث الشلبي - AUDI Q7 - G 568864لبنان	AUDI	Q7	expense	مانعة كرنك أمامية	1	delivered	تم استلام القطعة	\N	2025-09-08 11:56:11	\N	2025-09-08 12:01:03	بدوي	2025-09-08 15:10:01	G 568864لبنان	WAY AV94L57D047300	\N	2025-09-08 12:01:03	2025-09-08 12:05:27	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ليث الشلبي	\N
46	طلب-35	عبد الحفيظ	رائد سطوف - VW PASSAT CC - 509-1537	VW	PASSAT CC	expense	PH	1	delivered	تم استلام القطعة	\N	2025-09-09 10:08:42	\N	\N	بدوي	2025-09-09 10:34:42	509-1537	WVWAP1AN6GE506798	CCZ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	رائد سطوف	\N
45	طلب-34	علي	عدنان الشلبي - AUDI Q7 - 562310	AUDI	Q7	expense	باكات  زند خلفي عدد4 	1	delivered	تم استلام القطعة	\N	2025-09-09 09:51:50	\N	2025-09-09 10:06:16	بدوي	2025-09-09 10:07:20	562310	WAYAV94L57D047300	\N	2025-09-09 10:06:16	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عدنان الشلبي	\N
51	طلب-40	عبد الحفيظ	صهيب سويدان - VW PASSAT - 523-3107	VW	PASSAT	expense	قواعد محرك علوية 	1	delivered	تم استلام القطعة	\N	2025-09-09 10:56:16	\N	\N	بدوي	2025-09-09 11:08:14	523-3107	WVWCR7A38EC000676	CBT	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	صهيب سويدان	\N
50	طلب-39	علي	رافد نقشو - VW PASSAT - 732132-دمشق	VW	PASSAT	expense	طقم شريط محرك 2000CC	1	delivered	تم استلام القطعة	\N	2025-09-09 10:42:31	\N	\N	بدوي	2025-09-09 11:08:15	732132-دمشق	WVWZZZ3CZ9P055192	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	رافد نقشو	\N
49	طلب-38	عبد الحفيظ	صهيب سويدان - VW PASSAT - 523-3107	VW	PASSAT	expense	لتر زيت 40/10	1	delivered	تم استلام القطعة	\N	2025-09-09 10:33:49	\N	2025-09-09 11:17:06	بدوي	2025-09-09 11:32:42	523-3107	WVWCR7A38EC000676	CBT	2025-09-09 11:17:06	2025-09-09 11:17:10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	صهيب سويدان	\N
54	طلب-43	عبد الحفيظ	رائد سطوف - VW PASSAT CC - 509-1537	VW	PASSAT CC	expense	مانعة كرنك أمامية+ جوانات أغطية جنازير علوية+ سفلية 	1	delivered	تم استلام القطعة	\N	2025-09-09 11:31:20	\N	\N	بدوي	2025-09-09 11:53:41	509-1537	WVWAP1AN6GE506798	CCZ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	رائد سطوف	\N
52	طلب-41	علي	عدنان الشلبي - AUDI Q7 - 562310	AUDI	Q7	expense	اصبع سيخ رجاج يمين+ يسار 	1	unavailable	القطعة غير متوفرة	\N	2025-09-09 10:58:19	\N	2025-09-09 11:09:49	\N	\N	562310	WAYAV94L57D047300	\N	2025-09-09 11:09:49	\N	\N	\N	\N	2025-09-09 11:09:52	هبة	\N	\N	\N	\N	\N	\N	عدنان الشلبي	\N
53	طلب-42	عبد الحفيظ	محمود الطباع - VOLKSWAGEN Passat cc - 513-3427	VOLKSWAGEN	Passat cc	expense	امتاصورات أماميات	1	delivered	تم استلام القطعة	\N	2025-09-09 11:01:17	\N	2025-09-09 11:09:08	بدوي	2025-09-09 11:32:36	513-3427	WVWADZAN6DE526091	لايوجد	2025-09-09 11:09:08	2025-09-09 11:16:48	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	محمود الطباع	\N
55	طلب-44	علي	رافد نقشو - VW PASSAT - 732132-دمشق	VW	PASSAT	expense	بخاخ بنزين 	1	delivered	تم استلام القطعة	\N	2025-09-09 12:30:54	\N	2025-09-09 13:37:17	بدوي	2025-09-09 14:15:34	732132-دمشق	WVWZZZ3CZ9P055192	\N	2025-09-09 13:37:17	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	رافد نقشو	\N
58	طلب-47	محمد العلي	عمر طرابلسي - AUDI A6 - 453235	AUDI	A6	expense	1111	1	delivered	تم استلام القطعة	\N	2025-09-09 14:47:12	\N	\N	بدوي	2025-09-09 15:52:50	453235	WALCFCFP5FA007847	CDA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عمر طرابلسي	\N
59	طلب-48	عبد الحفيظ	رائد سطوف - VW PASSAT CC - 509-1537	VW	PASSAT CC	expense	قاعدة محرك + 4 باكات سفلية 2 كبار+ 2صغار	1	delivered	تم استلام القطعة	\N	2025-09-09 15:35:25	\N	2025-09-09 15:42:35	بدوي	2025-09-09 15:52:54	509-1537	WVWAP1AN6GE506798	CCZ	2025-09-09 15:42:35	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	رائد سطوف	\N
61	طلب-50	عبد الحفيظ	فراس قنا - AUDI Q7 - 521-1181	AUDI	Q7	expense	بوبين	1	delivered	تم استلام القطعة	\N	2025-09-10 13:31:30	\N	2025-09-10 13:49:10	بدوي	2025-09-10 14:14:26	521-1181	WA1AGDF78GD001227	CREC	2025-09-10 13:49:10	2025-09-10 13:55:10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	فراس قنا	\N
57	طلب-46	علي	عمر طرابلسي - AUDI A6 - 453235	AUDI	A6	expense	سسس	1	delivered	تم استلام القطعة	\N	2025-09-09 14:46:20	\N	\N	بدوي	2025-09-10 16:32:36	453235	WALCFCFP5FA007847	CDA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عمر طرابلسي	\N
56	طلب-45	علي	رافد نقشو - VW PASSAT - 732132-دمشق	VW	PASSAT	expense	دعسة هواء	1	delivered	تم استلام القطعة	\N	2025-09-09 14:45:29	\N	\N	بدوي	2025-09-10 16:44:48	732132-دمشق	WVWZZZ3CZ9P055192	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	رافد نقشو	\N
60	طلب-49	عبد الحفيظ	عبد الحميد أبو الخير - AUDI A8 - 507-2495	AUDI	A8	expense	زيت محرك 1 ليتر 40/10 موبيل	1	delivered	تم استلام القطعة	\N	2025-09-10 12:56:33	\N	\N	بدوي	2025-09-10 13:31:43	507-2495	WAUZZZ4H4BN025553	CGXC/3.0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	40/5	عبد الحميد أبو الخير	\N
71	طلب-60	علي	قصي عمار اباظة - AUDI A8 - 509-6166	AUDI	A8	expense	طرنبة بنزين  خلفية	1	delivered	تم استلام القطعة	\N	2025-09-10 16:48:08	\N	\N	بدوي	2025-09-10 16:48:13	509-6166	WAURGB4H2CN001444	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	قصي عمار اباظة	\N
77	طلب-66	علي	سيف الدين المذيب - AUDI A8 - 518-1577	AUDI	A8	expense	باغات زند أمامي سفلي وعلوي	1	delivered	تم استلام القطعة	\N	2025-09-11 10:43:54	\N	2025-09-11 11:05:12	بدوي	2025-09-11 11:06:00	518-1577	WAUY2BFD4FN000272	CTGA	2025-09-11 11:05:12	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	سيف الدين المذيب	\N
63	طلب-52	علي	ورشة			expense	PH	1	delivered	تم استلام القطعة	\N	2025-09-10 13:42:49	\N	2025-09-10 13:48:01	بدوي	2025-09-10 13:52:39	\N	\N	\N	2025-09-10 13:48:01	2025-09-10 13:48:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	للورشة 	عادل الغفري Q7	\N
64	طلب-53	عبد الحفيظ	فراس قنا - AUDI Q7 - 521-1181	AUDI	Q7	expense	طقم بواجي 	1	delivered	تم استلام القطعة	\N	2025-09-10 14:02:03	\N	\N	بدوي	2025-09-10 14:14:04	521-1181	WA1AGDF78GD001227	CREC	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	فراس قنا	\N
72	طلب-61	بدوي	عمار جرجور A6 - AUDI A6 - 508-5137	AUDI	A6	expense	مبخرة	1	delivered	تم استلام القطعة	\N	2025-09-11 09:37:26	\N	\N	بدوي	2025-09-11 09:53:48	508-5137	WAUBHCFC6GN180518	CVP	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عمار جرجور A6	\N
65	طلب-54	عبد الحفيظ	رائد سطوف - VW PASSAT CC - 509-1537	VW	PASSAT CC	expense	أصابع سيخ رجاج أمامية	1	delivered	تم استلام القطعة	\N	2025-09-10 15:47:33	\N	2025-09-10 15:51:20	بدوي	2025-09-10 15:55:20	509-1537	WVWAP1AN6GE506798	CCZ	2025-09-10 15:51:20	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	رائد سطوف	\N
67	طلب-56	علي	أحمد شرابي / 509007 - SKODA OCTAVIA - 509007-دمشق	SKODA	OCTAVIA	expense	حساس حرارة	1	delivered	تم استلام القطعة	\N	2025-09-10 16:14:34	\N	2025-09-10 16:18:47	بدوي	2025-09-10 16:25:41	509007-دمشق	TMBBA41Z952102970	BSE	2025-09-10 16:18:47	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	أحمد شرابي / 509007	\N
68	طلب-57	علي	أحمد شرابي / 509007 - SKODA OCTAVIA - 509007-دمشق	SKODA	OCTAVIA	expense	ثرموستات	1	delivered	تم استلام القطعة	\N	2025-09-10 16:24:36	\N	\N	بدوي	2025-09-10 16:32:32	509007-دمشق	TMBBA41Z952102970	BSE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	أحمد شرابي / 509007	\N
69	طلب-58	عبد الحفيظ	يحيى عثمان - AUDI A6 - 530-1125	AUDI	A6	expense	فضال ماء	1	delivered	تم استلام القطعة	\N	2025-09-10 16:25:37	\N	\N	بدوي	2025-09-10 16:32:34	530-1125	WAUZZZ463EN012293	CTUA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	يحيى عثمان	\N
66	طلب-55	عبد الحفيظ	يحيى عثمان - AUDI A6 - 530-1125	AUDI	A6	expense	PH	1	delivered	تم استلام القطعة	\N	2025-09-10 16:10:40	\N	\N	بدوي	2025-09-10 16:32:39	530-1125	WAUZZZ463EN012293	CTUA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	يحيى عثمان	\N
75	طلب-64	عبد الحفيظ	رائد سطوف - VW PASSAT CC - 509-1537	VW	PASSAT CC	expense	طقم كوليات خلفية	1	delivered	تم استلام القطعة	\N	2025-09-11 10:26:39	\N	2025-09-11 10:39:45	بدوي	2025-09-11 10:41:09	509-1537	WVWAP1AN6GE506798	CCZ	2025-09-11 10:39:45	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	رائد سطوف	\N
70	طلب-59	علي	قصي عمار اباظة - AUDI A8 - 509-6166	AUDI	A8	expense	جوان  طرنبة بنزين	1	delivered	تم استلام القطعة	\N	2025-09-10 16:42:52	\N	2025-09-10 16:44:13	بدوي	2025-09-10 16:44:29	509-6166	WAURGB4H2CN001444	\N	2025-09-10 16:44:13	2025-09-10 16:44:20	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	قصي عمار اباظة	\N
62	طلب-51	علي	عادل الغفري Q7 - AUDI Q7 - 524-6140	AUDI	Q7	expense	باكات  زند خلفي عدد4 	1	delivered	تم استلام القطعة	\N	2025-09-10 13:41:53	\N	2025-09-10 13:47:51	بدوي	2025-09-11 10:51:58	524-6140	WA1AGDFEXED011365	لايوجد	2025-09-10 13:47:51	\N	\N	\N	\N	2025-09-10 13:47:55	هبة	\N	\N	\N	\N	\N	\N	عادل الغفري Q7	\N
73	طلب-62	عبد الحفيظ	يحيى عثمان - AUDI A6 - 530-1125	AUDI	A6	expense	مبخرة	1	delivered	تم استلام القطعة	\N	2025-09-11 09:51:12	\N	2025-09-11 10:04:39	بدوي	2025-09-11 10:07:40	530-1125	WAUZZZ463EN012293	CTUA	2025-09-11 10:04:39	2025-09-11 10:04:45	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	يحيى عثمان	\N
74	طلب-63	عبد الحفيظ	رائد سطوف - VW PASSAT CC - 509-1537	VW	PASSAT CC	expense	لتر زيت 40/5 موبيل	1	delivered	تم استلام القطعة	\N	2025-09-11 10:00:21	\N	2025-09-11 10:04:48	بدوي	2025-09-11 10:07:41	509-1537	WVWAP1AN6GE506798	CCZ	2025-09-11 10:04:48	2025-09-11 10:04:54	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	رائد سطوف	\N
76	طلب-65	علي	أحمد شرابي / 509007 - SKODA OCTAVIA - 509007-دمشق	SKODA	OCTAVIA	expense	حساس حرارة الجو الخارجي	1	delivered	تم استلام القطعة	\N	2025-09-11 10:31:03	\N	\N	بدوي	2025-09-11 10:34:24	509007-دمشق	TMBBA41Z952102970	BSE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	أحمد شرابي / 509007	\N
81	طلب-70	علي	أحمد شرابي / 509007 - SKODA OCTAVIA - 509007-دمشق	SKODA	OCTAVIA	expense	مروحة مكيف 	1	delivered	تم استلام القطعة	\N	2025-09-11 13:27:16	\N	\N	بدوي	2025-09-11 13:29:13	509007-دمشق	TMBBA41Z952102970	BSE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	أحمد شرابي / 509007	
78	طلب-67	بدوي	قصي عمار اباظة - AUDI A8 - 509-6166	AUDI	A8	expense	مبخرة	1	delivered	تم استلام القطعة	\N	2025-09-11 11:03:30	\N	\N	بدوي	2025-09-11 11:05:56	509-6166	WAURGB4H2CN001444	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	قصي عمار اباظة	\N
79	طلب-68	علي	قصي عمار اباظة - AUDI A8 - 509-6166	AUDI	A8	expense	كوليات خلفية	1	delivered	تم استلام القطعة	\N	2025-09-11 11:12:06	\N	2025-09-11 11:17:20	بدوي	2025-09-11 11:24:35	509-6166	WAURGB4H2CN001444	\N	2025-09-11 11:17:20	2025-09-11 11:18:53	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	قصي عمار اباظة	\N
84	طلب-73	بدوي	قصي عمار اباظة - AUDI A8 - 509-6166	AUDI	A8	expense	6 لتر زيت شامبيون 40/5	1	rejected		\N	2025-09-11 16:17:27	\N	\N	\N	\N	509-6166	WAURGB4H2CN001444	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	قصي عمار اباظة	
82	طلب-71	بدوي	عمار جرجور A6 - AUDI A6 - 508-5137	AUDI	A6	expense	زيت محرك + مصفاة	1	delivered	تم استلام القطعة	\N	2025-09-11 13:32:44	\N	\N	بدوي	2025-09-11 16:19:54	508-5137	WAUBHCFC6GN180518	CVP	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عمار جرجور A6	
85	طلب-74	علي	عمار جرجور A6 - AUDI A6 - 508-5137	AUDI	A6	expense	تباشيم عدد4	1	delivered	تم استلام القطعة	\N	2025-09-13 09:19:12	\N	\N	بدوي	2025-09-13 09:19:15	508-5137	WAUBHCFC6GN180518	CVP	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عمار جرجور A6	
83	طلب-72	علي	قصي عمار اباظة - AUDI A8 - 509-6166	AUDI	A8	expense	لتر G12	1	delivered	تم استلام القطعة	\N	2025-09-11 14:38:28	\N	\N	بدوي	2025-09-13 09:20:00	509-6166	WAURGB4H2CN001444	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	قصي عمار اباظة	
80	طلب-69	علي	أحمد شرابي / 509007 - SKODA OCTAVIA - 509007-دمشق	SKODA	OCTAVIA	expense	فلتر هواء مكيف	1	delivered	تم استلام القطعة	\N	2025-09-11 13:22:21	\N	\N	بدوي	2025-09-13 13:07:04	509007-دمشق	TMBBA41Z952102970	BSE	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	فلتر مكيف	أحمد شرابي / 509007	
87	طلب-76	علي	رافد نقشو - VW PASSAT - 732132-دمشق	VW	PASSAT	expense	طقم بواجي 	1	delivered	تم استلام القطعة	\N	2025-09-13 11:46:40	\N	\N	بدوي	2025-09-13 11:55:21	732132-دمشق	WVWZZZ3CZ9P055192	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	رافد نقشو	
104	طلب-93	بدوي	د. حسين عياش - VW شيروكو - 716483 - دمشق	VW	شيروكو	expense	مروحة ردتير صغيرة	1	delivered	تم استلام القطعة	\N	2025-09-15 15:02:36	\N	2025-09-15 15:13:43	بدوي	2025-09-15 15:28:32	716483 - دمشق	WVWZZZ13ZAV439054	CAVD	2025-09-15 15:13:43	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	د. حسين عياش	
88	طلب-77	علي	رافد نقشو - VW PASSAT - 732132-دمشق	VW	PASSAT	expense	5 لتر بنزين 	1	delivered	تم استلام القطعة	\N	2025-09-13 12:55:11	\N	2025-09-13 13:01:46	بدوي	2025-09-13 13:06:39	732132-دمشق	WVWZZZ3CZ9P055192	\N	2025-09-13 13:01:46	2025-09-13 13:06:30	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	رافد نقشو	
94	طلب-83	بدوي	بلال مهباني A8 - AUDI A8 - 506-2469	AUDI	A8	expense	زيت فرام 	1	delivered	تم استلام القطعة	\N	2025-09-14 12:50:48	\N	2025-09-14 12:55:07	بدوي	2025-09-14 12:55:35	506-2469	WAURGB4H2BN016749	CGWA	2025-09-14 12:55:07	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	بلال مهباني A8	
86	طلب-75	علي	قصي عمار اباظة - AUDI A8 - 509-6166	AUDI	A8	loan	لترين زيت موبيل 	2	delivered	تم استلام القطعة	\N	2025-09-13 10:48:36	\N	2025-09-13 11:03:13	بدوي	2025-09-13 13:06:47	509-6166	WAURGB4H2CN001444	\N	2025-09-13 11:03:13	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	الغاء	قصي عمار اباظة	
93	طلب-82	علي	بشير عبد المولى - AUDI A6 - 501-8698	AUDI	A6	expense	5 لتر بنزين 	1	delivered	تم استلام القطعة	\N	2025-09-14 12:05:09	\N	2025-09-14 12:08:31	بدوي	2025-09-14 12:55:38	501-8698	WAVAFC4F2BN009000	BPJ	2025-09-14 12:08:31	2025-09-14 12:08:55	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	بشير عبد المولى	
95	طلب-84	علي	بشير عبد المولى - AUDI A6 - 501-8698	AUDI	A6	expense	عصارة جوان	1	delivered	تم استلام القطعة	\N	2025-09-14 13:47:16	\N	\N	بدوي	2025-09-14 13:50:13	501-8698	WAVAFC4F2BN009000	BPJ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	بشير عبد المولى	
89	طلب-78	علي	بشير عبد المولى - AUDI A6 - 501-8698	AUDI	A6	expense	طقم بواجي	1	returned	تم استلام القطعة	\N	2025-09-13 13:27:12	\N	2025-09-13 13:42:04	بدوي	2025-09-13 13:48:03	501-8698	WAVAFC4F2BN009000	BPJ	2025-09-13 13:42:04	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-13 11:04:31.077	بدوي	بسبب أعطال أخرى موجودة بالسيارة	\N	بشير عبد المولى	
91	طلب-80	بدوي	نادر الحسيني - AUDI A6 - 514-4024	AUDI	A6	expense	لتر زيت شامبيون	1	delivered	تم استلام القطعة	\N	2025-09-14 11:04:16	\N	\N	بدوي	2025-09-14 11:24:59	514-4024	WAUZZZ4F6AN015037	CCA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	نادر الحسيني	
90	طلب-79	حسام	عمار جرجور A6 - AUDI A6 - 508-5137	AUDI	A6	loan	صباب مكيف	1	delivered	تم استلام القطعة	\N	2025-09-13 14:47:50	\N	2025-09-13 15:24:14	بدوي	2025-09-14 11:25:16	508-5137	WAUBHCFC6GN180518	CVP	2025-09-13 15:24:14	2025-09-13 15:24:21	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عمار جرجور A6	
92	طلب-81	بدوي	فؤاد عودة - VW TOURAN - 672254-دمشق	VW	TOURAN	expense	ردتير ماء محرك	1	delivered	تم استلام القطعة	\N	2025-09-14 11:41:00	\N	\N	بدوي	2025-09-14 11:54:39	672254-دمشق	WVGZZZ1TZ6W053086	2.0FSI-BVZ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	فؤاد عودة	
96	طلب-85	بدوي	فؤاد عودة - VW TOURAN - 672254-دمشق	VW	TOURAN	expense	PH	1	delivered	تم استلام القطعة	\N	2025-09-15 09:33:53	\N	\N	بدوي	2025-09-15 10:09:56	672254-دمشق	WVGZZZ1TZ6W053086	2.0FSI-BVZ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	فؤاد عودة	
101	طلب-90	علي	ضياء الحسو - AUDI Q7 - 343651	AUDI	Q7	expense	زند سفلي خلفي	1	unavailable	القطعة غير متوفرة	\N	2025-09-15 12:59:54	\N	2025-09-15 13:00:34	\N	\N	343651	WAUAV54L09D029489	4.2/ BAR	2025-09-15 13:00:34	\N	\N	\N	\N	2025-09-15 13:00:41	هبة	\N	\N	\N	\N	\N	\N	ضياء الحسو	
98	طلب-87	علي	بشير عبد المولى - AUDI A6 - 501-8698	AUDI	A6	expense	مصفاة زيت محرك	1	delivered	تم استلام القطعة	\N	2025-09-15 10:11:28	\N	\N	بدوي	2025-09-15 10:42:52	501-8698	WAVAFC4F2BN009000	BPJ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	بشير عبد المولى	
97	طلب-86	علي	بشير عبد المولى - AUDI A6 - 501-8698	AUDI	A6	expense	5 لتر بنزين 	1	delivered	تم استلام القطعة	\N	2025-09-15 10:09:51	\N	\N	بدوي	2025-09-15 10:43:12	501-8698	WAVAFC4F2BN009000	BPJ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	بشير عبد المولى	
100	طلب-89	عبد الحفيظ	ميشيل العسس - AUDI Q5 - 518-3239	AUDI	Q5	expense	مجمع ماء	1	delivered	تم استلام القطعة	\N	2025-09-15 11:50:22	\N	\N	بدوي	2025-09-15 11:50:31	518-3239	WA1CFCFP1DA020608	CNC	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ميشيل العسس	
99	طلب-88	علي	بشير عبد المولى - AUDI A6 - 501-8698	AUDI	A6	expense	حساسات طبون أمامي مع القواعد	1	returned	تم استلام القطعة	\N	2025-09-15 10:46:40	\N	\N	بدوي	2025-09-15 11:50:36	501-8698	WAVAFC4F2BN009000	BPJ	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-15 08:51:10.956	Unknown	غير متناسب 	\N	بشير عبد المولى	
103	طلب-92	علي	بشير عبد المولى - AUDI A6 - 501-8698	AUDI	A6	expense	زيت هيدروليك لتر	1	delivered	تم استلام القطعة	\N	2025-09-15 14:50:27	\N	\N	بدوي	2025-09-15 14:50:36	501-8698	WAVAFC4F2BN009000	BPJ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	بشير عبد المولى	
102	طلب-91	بدوي	بلال مهباني - AUDI A8 - 506-2469	AUDI	A8	expense	علبة زيت فرام	1	delivered	تم استلام القطعة	\N	2025-09-15 14:48:05	\N	2025-09-15 14:54:09	بدوي	2025-09-15 14:59:20	506-2469	WAURGB4H2BN016749	لايوجد	2025-09-15 14:54:09	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	بلال مهباني	
107	طلب-96	بدوي	حسام الديك - AUDI Q7 - 502-7432	AUDI	Q7	expense	برغي جنط 	1	delivered	تم استلام القطعة	\N	2025-09-16 10:24:37	\N	2025-09-16 10:25:17	بدوي	2025-09-16 10:34:39	502-7432	WA1AGDFE9DD005653	TFSI3.0	2025-09-16 10:25:17	2025-09-16 10:25:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	حسام الديك	
105	طلب-94	عبد الحفيظ	حكم الدروبي - VW TOUAREG - 517-6441	VW	TOUAREG	loan	حساس حرارة محرك	1	delivered	تم استلام القطعة	\N	2025-09-16 09:57:26	\N	2025-09-16 10:10:25	بدوي	2025-09-16 10:18:03	517-6441	WVGBC2BP0DD000189	CGRA	2025-09-16 10:10:25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	حكم الدروبي	
106	طلب-95	علي	حسام الديك - AUDI Q7 - 502-7432	AUDI	Q7	expense	جوان طرمبة فاكيوم	1	rejected	القطعة جاهزة للاستلام	\N	2025-09-16 10:17:44	\N	2025-09-16 10:18:12	\N	\N	502-7432	WA1AGDFE9DD005653	TFSI3.0	2025-09-16 10:18:12	2025-09-16 10:18:15	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	حسام الديك	
108	طلب-97	علي	بشير عبد المولى - AUDI A6 - 501-8698	AUDI	A6	expense	شرحة تثبيت كوليات	1	delivered	تم استلام القطعة	\N	2025-09-16 10:54:43	\N	\N	بدوي	2025-09-16 11:00:43	501-8698	WAVAFC4F2BN009000	BPJ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	بشير عبد المولى	
109	طلب-98	عبد الحفيظ	د. حسين عياش - VW شيروكو - 716483 - دمشق	VW	شيروكو	expense	5 لتر زيت محرك 40/5 + مصفاة 	5	delivered	تم استلام القطعة	\N	2025-09-16 11:33:42	\N	2025-09-16 11:43:30	بدوي	2025-09-16 14:18:17	716483 - دمشق	WVWZZZ13ZAV439054	CAVD	2025-09-16 11:43:30	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	د. حسين عياش	
117	طلب-106	عبد الحفيظ	محمود واضوح - AUDI Q7 - حلب-الراعي 36987	AUDI	Q7	expense	11 لتر زيت محرك 40/5 + مصفاة 	1	delivered	تم استلام القطعة	\N	2025-09-18 11:01:42	\N	2025-09-18 11:52:25	بدوي	2025-09-20 09:35:01	حلب-الراعي 36987	WAUAV54L88D048077	BAR	2025-09-18 11:52:25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	محمود واضوح	
110	طلب-99	علي	محمد موسى - VW GOLF R - 518-2382	VW	GOLF R	expense	باغات كفوف يمين ويسار 4+ كوشوكة زند  دركسيون+ كوشوكة راس اكس يسار خارجي واحد + بيضات دركسيون يمين ويسار + طقم ستيلايزرات+ بيضات يمين + يسار أمامي+ باغات كفوف خلفية	1	delivered	تم استلام القطعة	\N	2025-09-16 11:36:27	\N	2025-09-16 11:43:20	بدوي	2025-09-16 14:17:21	518-2382	WVWGR2AU3FW026311	CJXB	2025-09-16 11:43:20	2025-09-16 12:19:15	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	محمد موسى	
112	طلب-101	عبد الحفيظ	محمود واضوح - AUDI Q7 - حلب-الراعي 36987	AUDI	Q7	expense	مانعة كرنك أمامية	1	delivered	تم استلام القطعة	\N	2025-09-16 14:26:04	\N	2025-09-16 14:29:48	بدوي	2025-09-17 09:28:32	حلب-الراعي 36987	WAUAV54L88D048077	BAR	2025-09-16 14:29:48	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	محمود واضوح	
111	طلب-100	عبد الحفيظ	محمود واضوح - AUDI Q7 - حلب-الراعي 36987	AUDI	Q7	expense	خرطوم مبخرة + خراطيم EGR+ جوانات اغطية صبابات	1	delivered	تم استلام القطعة	\N	2025-09-16 14:24:01	\N	2025-09-16 14:33:52	بدوي	2025-09-17 09:28:51	حلب-الراعي 36987	WAUAV54L88D048077	BAR	2025-09-16 14:33:52	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	محمود واضوح	
113	طلب-102	عبد الحفيظ	محمود واضوح - AUDI Q7 - حلب-الراعي 36987	AUDI	Q7	expense	علبة PH	1	delivered	تم استلام القطعة	\N	2025-09-17 09:29:38	\N	\N	بدوي	2025-09-17 09:50:10	حلب-الراعي 36987	WAUAV54L88D048077	BAR	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	محمود واضوح	
115	طلب-104	بدوي	محمود واضوح - AUDI Q7 - حلب-الراعي 36987	AUDI	Q7	expense	طرمبة بنزين	1	delivered	تم استلام القطعة	\N	2025-09-17 11:13:25	\N	\N	بدوي	2025-09-17 11:49:44	حلب-الراعي 36987	WAUAV54L88D048077	BAR	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	محمود واضوح	
118	طلب-107	عبد الحفيظ	عمار شوحة - VW PASSAT - 241049 - دمشق	VW	PASSAT	expense	5 لتر زيت محرك40/5 + مصفاة 	1	delivered	تم استلام القطعة	\N	2025-09-20 13:23:43	\N	\N	بدوي	2025-09-20 14:54:16	241049 - دمشق	WVWZZZ3CZ5P003210	BVZ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	40/10	عمار شوحة	
114	طلب-103	عبد الحفيظ	محمود واضوح - AUDI Q7 - حلب-الراعي 36987	AUDI	Q7	expense	فلتر هواء	1	delivered	تم استلام القطعة	\N	2025-09-17 09:34:03	\N	\N	بدوي	2025-09-17 13:16:55	حلب-الراعي 36987	WAUAV54L88D048077	BAR	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	محمود واضوح	
116	طلب-105	علي	ابراهيم السلقيني - VW PASSAT B6 - 257004-حمص	VW	PASSAT B6	expense	4لتر زيت علبة سرعة	1	delivered	تم استلام القطعة	\N	2025-09-17 13:15:20	\N	\N	بدوي	2025-09-17 15:57:19	257004-حمص	WVWZZZ3CZ8P004420	2.0TFSI/BVY	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ابراهيم السلقيني	
119	طلب-108	عبد الحفيظ	عمار شوحة - VW PASSAT - 241049 - دمشق	VW	PASSAT	expense	طرنبة بنزين	1	delivered	تم استلام القطعة	\N	2025-09-21 10:10:02	\N	\N	بدوي	2025-09-21 13:56:11	241049 - دمشق	WVWZZZ3CZ5P003210	BVZ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عمار شوحة	
121	طلب-110	علي	حسام الديك - AUDI Q7 - 502-7432	AUDI	Q7	expense	مبخرة	1	delivered	تم استلام القطعة	\N	2025-09-22 09:50:54	\N	\N	بدوي	2025-09-22 11:29:27	502-7432	WA1AGDFE9DD005653	TFSI3.0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	حسام الديك	
122	طلب-111	عبد الحفيظ	رائد الأبرش - PORSCHE Cayenne - 506-1745	PORSCHE	Cayenne	expense	4 لتر ديكسرون 6	4	delivered	تم استلام القطعة	\N	2025-09-22 11:38:04	\N	2025-09-22 11:38:23	بدوي	2025-09-22 12:37:15	506-1745	WP1ZZZ92ZBLA53841	لم يتم الكشف عنه	2025-09-22 11:38:23	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	رائد الأبرش	
124	طلب-113	علي	بشير عبد المولى - AUDI A6 - 501-8698	AUDI	A6	expense	فضال ماء	1	returned	تم استلام القطعة	\N	2025-09-22 14:27:35	\N	2025-09-22 14:49:39	بدوي	2025-09-22 15:00:01	501-8698	WAVAFC4F2BN009000	BPJ	2025-09-22 14:49:39	\N	\N	\N	\N	\N	\N	\N	\N	2025-09-22 12:25:46.708	Unknown	ملغي	\N	بشير عبد المولى	
123	طلب-112	عبد الحفيظ	رائد الأبرش - PORSCHE Cayenne - 506-1745	PORSCHE	Cayenne	expense	فلتر هواء عدد2 +عبوتين زيت فرام + طقم بواجي+ جوان كرتيرعلبة السرعة+ ديكسرون3	1	delivered	تم استلام القطعة	\N	2025-09-22 12:38:37	\N	\N	بدوي	2025-09-22 12:38:43	506-1745	WP1ZZZ92ZBLA53841	لم يتم الكشف عنه	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	طقم بواجي+ جوان كرتير علبة السرعة ( غير موجودين)	رائد الأبرش	
129	طلب-118	علي	حسام الديك - AUDI Q7 - 502-7432	AUDI	Q7	expense	بوبين عدد2 + بخاخ بنزين	1	delivered	تم استلام القطعة	\N	2025-09-23 12:55:22	\N	\N	بدوي	2025-09-23 12:55:31	502-7432	WA1AGDFE9DD005653	TFSI3.0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	حسام الديك	
127	طلب-116	علي	حسام الديك - AUDI Q7 - 502-7432	AUDI	Q7	expense	بوري ماء بين الكولاسين	1	delivered	تم استلام القطعة	\N	2025-09-22 15:42:34	\N	2025-09-22 16:20:55	بدوي	2025-09-23 09:19:03	502-7432	WA1AGDFE9DD005653	TFSI3.0	2025-09-22 16:20:55	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	حسام الديك	
125	طلب-114	عبد الحفيظ	عمار الأسعد - AUDI A5 - 13-29588	AUDI	A5	expense	باغة كف كبيرة+ باغة زند سفلي+ قواعد محرك	1	delivered	تم استلام القطعة	\N	2025-09-22 15:04:49	\N	2025-09-22 15:22:20	بدوي	2025-09-22 15:38:49	13-29588	WAUDF68T59A050964	CDNC	2025-09-22 15:22:20	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	لا يوجد قواعد محرك	عمار الأسعد	
126	طلب-115	علي	بشير عبد المولى - AUDI A6 - 501-8698	AUDI	A6	expense	لمبة ضباب	1	delivered	تم استلام القطعة	\N	2025-09-22 15:39:25	\N	2025-09-22 16:21:01	بدوي	2025-09-23 09:19:02	501-8698	WAVAFC4F2BN009000	BPJ	2025-09-22 16:21:01	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	بشير عبد المولى	
128	طلب-117	علي	عمر أبو زيد - VW JETTA - 512-1675	VW	JETTA	expense	(بيضة دركسيون عدد2+ بيضة كف عدد2+ ستبلايزر عدد2 ) أمامي يمين+ يسار	1	delivered	تم استلام القطعة	\N	2025-09-23 12:54:37	\N	\N	بدوي	2025-09-23 12:55:42	512-1675	WVWSV1AJ1EM200258	CBP	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عمر أبو زيد	
120	طلب-109	بدوي	عمر أبو زيد - VW JETTA - 512-1675	VW	JETTA	expense	طقم امتاصورات عدد 4 لمحرك 1600	1	parts_arrived	وصلت القطعة وهي بانتظار التسليم	\N	2025-09-22 09:50:22	\N	2025-09-22 13:32:52	\N	\N	512-1675	WVWSV1AJ1EM200258	CBP	2025-09-22 13:32:52	\N	2025-09-22 13:33:08	هبة	غدا في الواحدة ظهرا	\N	\N	2025-09-23 13:37:45	بدوي	\N	\N	\N	\N	عمر أبو زيد	
130	طلب-119	حسام	رائد الأبرش - PORSCHE Cayenne - 506-1745	PORSCHE	Cayenne	expense	علبة زيت فرام	1	delivered	تم استلام القطعة	\N	2025-09-23 12:58:45	\N	2025-09-23 14:14:03	بدوي	2025-09-23 15:06:55	506-1745	WP1ZZZ92ZBLA53841	لم يتم الكشف عنه	2025-09-23 14:14:03	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	رائد الأبرش	
132	طلب-121	علي	علي علعل - VOLKSWAGEN Touareg - 529-3194	VOLKSWAGEN	Touareg	expense	نصف لتر بنزين + نصف لترزيت 	1	delivered	تم استلام القطعة	\N	2025-09-23 15:10:11	\N	\N	بدوي	2025-09-23 15:15:08	529-3194	1VZYR2CAXKC526886	لم يتم الكشف عنه	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	علي علعل	
133	طلب-122	علي	حسام الديك - AUDI Q7 - 502-7432	AUDI	Q7	expense	بوبين	1	delivered	تم استلام القطعة	\N	2025-09-23 15:14:24	\N	\N	بدوي	2025-09-23 15:15:20	502-7432	WA1AGDFE9DD005653	TFSI3.0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	حسام الديك	
131	طلب-120	علي	عمر أبو زيد - VW JETTA - 512-1675	VW	JETTA	expense	كواشيك صدمة خلفيات	1	delivered	تم استلام القطعة	\N	2025-09-23 15:08:36	\N	\N	بدوي	2025-09-23 15:15:10	512-1675	WVWSV1AJ1EM200258	CBP	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عمر أبو زيد	
144	طلب-133	علي	محمود واضوح - AUDI Q7 - حلب-الراعي 36987	AUDI	Q7	expense	بوجية	1	pending		\N	2025-09-25 12:51:06	\N	\N	\N	\N	حلب-الراعي 36987	WAUAV54L88D048077	BAR	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	محمود واضوح	
134	طلب-123	علي	حسام الديك - AUDI Q7 - 502-7432	AUDI	Q7	expense	5 لتر زيت ديكسرون 6	1	delivered	تم استلام القطعة	\N	2025-09-23 15:15:00	\N	\N	بدوي	2025-09-23 16:05:56	502-7432	WA1AGDFE9DD005653	TFSI3.0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	حسام الديك	
135	طلب-124	بدوي	عمر أبو زيد - VW JETTA - 512-1675	VW	JETTA	expense	رولمان فلنجة أمامية عدد2	1	delivered	تم استلام القطعة	\N	2025-09-23 15:56:30	\N	\N	بدوي	2025-09-23 16:06:02	512-1675	WVWSV1AJ1EM200258	CBP	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	رولمانات طبشة أمامية	عمر أبو زيد	
145	طلب-134	عبد الحفيظ	فؤاد عودة - VW TOURAN - 672254-دمشق	VW	TOURAN	expense	مساحة بلور خلفية	1	pending		\N	2025-09-25 13:04:42	\N	\N	\N	\N	672254-دمشق	WVGZZZ1TZ6W053086	2.0FSI-BVZ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	فؤاد عودة	
146	طلب-135	عبد الحفيظ	عمار الأسعد - AUDI A5 - 13-29588	AUDI	A5	expense	لترين زيت محرك موبيل40/5 	1	pending		\N	2025-09-25 15:42:56	\N	\N	\N	\N	13-29588	WAUDF68T59A050964	CDNC	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عمار الأسعد	
136	طلب-125	بدوي	مضر الجندلي 6052-511 - VW PASSAT - 511-6052	VW	PASSAT	expense	ثرموستات + جوان غطاء صباب	1	delivered	تم استلام القطعة	\N	2025-09-24 10:32:41	\N	2025-09-24 10:36:07	بدوي	2025-09-24 11:10:17	511-6052	1VWZZZA3ZDC035939	CBU	2025-09-24 10:36:07	2025-09-24 10:36:38	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	مضر الجندلي 6052-511	
147	طلب-136	علي	نبيل الطحله - AUDI A6 - 511-2541	AUDI	A6	expense	قواعد المحرك	1	delivered	تم استلام القطعة	\N	2025-09-27 09:56:28	\N	\N	بدوي	2025-09-27 10:10:05	511-2541	WAUZZZ4G4CN123717	CAEB	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	نبيل الطحله	
137	طلب-126	عبد الحفيظ	مضر الجندلي 6052-511 - VW PASSAT - 511-6052	VW	PASSAT	expense	مبخرة	1	delivered	تم استلام القطعة	\N	2025-09-24 11:10:12	\N	2025-09-24 12:13:00	بدوي	2025-09-24 12:13:42	511-6052	1VWZZZA3ZDC035939	CBU	2025-09-24 12:13:00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	مضر الجندلي 6052-511	
138	طلب-127	عبد الحفيظ	أيمن اللبابيدي - AUDI Q7 - 37166-حلب	AUDI	Q7	expense	لمبتين ضباب	1	delivered	تم استلام القطعة	\N	2025-09-24 12:13:25	\N	\N	بدوي	2025-09-24 12:14:16	37166-حلب	WA1BY74L78D002678	BHK	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	أيمن اللبابيدي	
148	طلب-137	عبد الحفيظ	سمير الهاشمي - AUDI Q7 - 502-2283	AUDI	Q7	expense	مبرد زيت محرك	1	pending		\N	2025-09-27 11:10:00	\N	\N	\N	\N	502-2283	WA1AGDFE1DD003069	لم يتم الكشف عنه	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	سمير الهاشمي	
140	طلب-129	عبد الحفيظ	مضر الجندلي 6052-511 - VW PASSAT - 511-6052	VW	PASSAT	expense	حساس AIRMASS	1	unavailable	القطعة غير متوفرة	\N	2025-09-24 13:31:39	\N	2025-09-24 13:33:59	\N	\N	511-6052	1VWZZZA3ZDC035939	CBU	2025-09-24 13:33:59	\N	\N	\N	\N	2025-09-24 13:34:03	هبة	\N	\N	\N	\N	\N	\N	مضر الجندلي 6052-511	
143	طلب-132	بدوي	نزار البدري - VOLKSWAGEN Jetta - 513-2826	VOLKSWAGEN	Jetta	expense	بوبين	1	pending		\N	2025-09-25 11:48:38	\N	\N	\N	\N	513-2826	WVWRV1AJ6EM215355	لم يتم الكشف عنه	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	نزار البدري	
142	طلب-131	عبد الحفيظ	عمار شوحة - VW PASSAT - 241049 - دمشق	VW	PASSAT	expense	جوان طبون خلفي	1	delivered	تم استلام القطعة	\N	2025-09-25 11:18:25	\N	\N	بدوي	2025-09-25 11:48:51	241049 - دمشق	WVWZZZ3CZ5P003210	BVZ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عمار شوحة	
139	طلب-128	علي	بشير عبد المولى - AUDI A6 - 501-8698	AUDI	A6	expense	جوان طرمبة بنزين خلفية	1	delivered	تم استلام القطعة	\N	2025-09-24 13:11:58	\N	\N	بدوي	2025-09-25 11:48:54	501-8698	WAVAFC4F2BN009000	BPJ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	بشير عبد المولى	
141	طلب-130	علي	ميشيل العسس - AUDI Q5 - 518-3239	AUDI	Q5	expense	غطاوة فضال ماء	1	delivered	تم استلام القطعة	\N	2025-09-25 10:09:12	\N	\N	بدوي	2025-09-25 11:49:02	518-3239	WA1CFCFP1DA020608	CNC	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	ميشيل العسس	
149	طلب-138	علي	نبيل الطحله - AUDI A6 - 511-2541	AUDI	A6	expense	5 لتر زيت CVT	1	pending		\N	2025-09-27 14:35:10	\N	\N	\N	\N	511-2541	WAUZZZ4G4CN123717	CAEB	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	نبيل الطحله	
150	طلب-139	علي	بشير عبد المولى - AUDI A6 - 501-8698	AUDI	A6	loan	جوان غطاء صباب+ عصارة رينز	1	pending		\N	2025-09-27 16:09:08	\N	\N	\N	\N	501-8698	WAVAFC4F2BN009000	BPJ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	بشير عبد المولى	
151	طلب-140	بدوي	عبد الحكيم كراز - VOLKSWAGEN Tiguan - 526-1326	VOLKSWAGEN	Tiguan	expense	امتاصورات أمامية	1	pending		\N	2025-09-28 10:08:55	\N	\N	\N	\N	526-1326	WVGCE2AX7GW509821	TSI2.0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	عبد الحكيم كراز	
152	طلب-141	علي	حسام الديك - AUDI Q7 - 502-7432	AUDI	Q7	loan	بخاخين بنزين	1	pending		\N	2025-09-28 10:30:52	\N	\N	\N	\N	502-7432	WA1AGDFE9DD005653	TFSI3.0/CJTC	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	حسام الديك	
153	طلب-142	علي	بشير عبد المولى - AUDI A6 - 501-8698	AUDI	A6	loan	حساس ضغط بنزين عالي	1	pending		\N	2025-09-28 10:32:16	\N	\N	\N	\N	501-8698	WAVAFC4F2BN009000	BPJ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	بشير عبد المولى	
154	طلب-143	علي	حسام الديك - AUDI Q7 - 502-7432	AUDI	Q7	loan	بخاخ بنزين	1	pending	بتاريخ 27/9/2025	\N	2025-09-28 10:34:40	\N	\N	\N	\N	502-7432	WA1AGDFE9DD005653	TFSI3.0/CJTC	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	حسام الديك	
\.


--
-- Data for Name: reception_entries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reception_entries (id, car_owner_name, license_plate, service_type, complaints, odometer_reading, fuel_level, reception_user_id, workshop_user_id, entry_time, workshop_entry_time, status, created_at, updated_at, customer_id, car_id) FROM stdin;
18	عمر طرابلسي	453235	إصلاح عطل	للل	43654	43	7	\N	2025-09-03 07:17:12.585039	\N	reception	2025-09-03 07:17:12.585039	2025-09-03 07:17:12.585039	26	29
4	مرتضى لالل	5632124	فحص شامل	dddd	1234567	1455555	11	3	2025-08-09 10:47:01.19733	2025-08-09 10:47:54.584	workshop	2025-08-09 10:47:01.19733	2025-08-09 10:47:01.19733	27	30
5	هاشم القاطع	55555555	فحص شامل		123456	156777	11	11	2025-08-09 10:56:19.367365	2025-08-09 10:56:25.627	workshop	2025-08-09 10:56:19.367365	2025-08-09 10:56:19.367365	28	31
6	فارس	502600	صيانة دورية		110000	50	11	3	2025-08-09 11:15:30.307559	2025-08-09 11:16:14.912	workshop	2025-08-09 11:15:30.307559	2025-08-09 11:15:30.307559	29	32
7	عمر بي	321456	صيانة دورية, فحص شامل	ااا	543678	50%	11	11	2025-08-10 08:27:53.038812	2025-08-10 08:28:11.187	workshop	2025-08-10 08:27:53.038812	2025-08-10 08:27:53.038812	30	36
8	عمر طا	567894	إصلاح عطل, تغيير زيت	عطل باللمبة الخلفية	245678	40%	11	11	2025-08-10 10:07:24.477879	2025-08-10 10:08:56.356	workshop	2025-08-10 10:07:24.477879	2025-08-10 10:07:24.477879	31	37
9	طه زعرور 	510-9218	صيانة دورية, فحص شامل	للل	1234567	146	11	11	2025-08-16 11:12:41.91965	2025-08-16 11:12:59.751	workshop	2025-08-16 11:12:41.91965	2025-08-16 11:12:41.91965	34	40
10	نبيل الطحله	511-2541	صيانة دورية, إصلاح عطل	للل	156789	1222	10	11	2025-08-16 11:35:54.467034	2025-08-27 10:37:14.84	workshop	2025-08-16 11:35:54.467034	2025-08-16 11:35:54.467034	33	39
11	عمر طرابلسي	453235	إصلاح عطل, فحص شامل	444	0	146	11	11	2025-08-27 10:37:35.433725	2025-08-27 10:37:42.389	workshop	2025-08-27 10:37:35.433725	2025-08-27 10:37:35.433725	26	29
12	حسان الصباغ	505-4343	صيانة دورية, برمجة	للل	15	قق	11	11	2025-08-27 10:38:00.323255	2025-08-27 10:38:06.927	workshop	2025-08-27 10:38:00.323255	2025-08-27 10:38:00.323255	48	54
13	عمر ابو زيد	518-3239	فحص شامل, إصلاح عطل	ب	234	146	11	11	2025-08-27 11:53:29.696893	2025-08-27 11:58:45.456	workshop	2025-08-27 11:53:29.696893	2025-08-27 11:53:29.696893	23	26
14	مرتضى لالل	5632124	إصلاح عطل, صيانة دورية	للل	12345	146	11	11	2025-08-27 12:05:19.533403	2025-08-27 12:05:24.718	مكتمل	2025-08-27 12:05:19.533403	2025-08-27 12:05:19.533403	27	30
15	عمر طرابلسي	418438	صيانة دورية	عطل في علبة السرعة	1456234	40%	11	11	2025-09-01 13:48:48.12019	2025-09-01 13:49:54.353	مكتمل	2025-09-01 13:48:48.12019	2025-09-01 13:48:48.12019	3641	3647
16	طه زعرور S7	510-9218	صيانة دورية, إصلاح عطل	لل	123445	555	11	11	2025-09-02 07:37:27.535488	2025-09-02 07:37:31.022	workshop	2025-09-02 07:37:27.535488	2025-09-02 07:37:27.535488	3503	3509
17	عبد المجيد كلزلي	513-4564	إصلاح عطل, تغيير زيت	طرنبة المي لاتعمل	154873	30%	7	3	2025-09-02 13:17:08.833659	2025-09-02 13:18:05.305	مكتمل	2025-09-02 13:17:08.833659	2025-09-02 13:17:08.833659	36	42
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.tasks (id, task_number, worker_id, worker_role, description, car_brand, car_model, license_plate, estimated_duration, engineer_name, supervisor_name, assistant_name, status, start_time, end_time, paused_at, pause_reason, pause_notes, total_paused_duration, is_archived, archived_at, archived_by, archive_notes, rating, created_at, repair_operation, technician_name, delivery_number, task_type, is_cancelled, cancellation_reason, cancelled_at, cancelled_by, technicians, assistants, timer_type, consumed_time, color, invoice_type, is_transferred, transferred_at, transferred_by, transfer_notes, due_date) FROM stdin;
103	12	35	assistant	فك ردتير ماء المحرك وارساله مع الزبون لأجل صيانته	vw	TOURAN	672254-دمشق	30	بدوي	حسام	\N	archived	\N	2025-09-15 10:36:07.515	\N	\N	\N	1800	t	2025-09-15 07:36:08.092	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-15 07:36:07.292356	\N	\N	12	ميكانيك 1	f	\N	\N	\N	حسام	خالد	manual	30	\N	\N	f	\N	\N	\N	\N
104	13	35	assistant	فك الأضواء الأمامية وارسالهم مع الزبون لأجل الصيانة وتبديل اللمبات	vw	TOURAN	672254-دمشق	15	بدوي	حسام	\N	archived	\N	2025-09-15 10:37:40.592	\N	\N	\N	900	t	2025-09-15 07:37:41.165	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-15 07:37:40.379025	\N	\N	13	كهربا 1	f	\N	\N	\N	حسام	خالد	manual	15	\N	\N	f	\N	\N	\N	\N
92	1	35	assistant	فك سوبر تشارج + تبديل خرطوم هواء داخل المبخرة 	audi	A8	6166	90	علي	مصطفى	\N	archived	\N	2025-09-13 12:21:51.811	\N	\N	\N	5400	t	2025-09-13 09:21:52.44	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-13 09:21:51.542356	\N	\N	1	ميكانيك 1	f	\N	\N	\N	مصطفى	مصطفى	manual	90	\N	\N	f	\N	\N	\N	\N
100	9	35	assistant	غسيل المحرك 	audi	A8	6166	30	علي	مصطفى	\N	archived	\N	2025-09-13 12:40:48.168	\N	\N	\N	1800	t	2025-09-13 09:40:48.755	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-13 09:40:47.938044	\N	\N	9	غسيل محرك	f	\N	\N	\N	مصطفى	مصطفى	manual	30	\N	\N	f	\N	\N	\N	\N
93	2	35	assistant	ضغط دارة المياه	audi	A8	6166	15	علي	مصطفى	\N	archived	\N	2025-09-13 12:22:49.386	\N	\N	\N	900	t	2025-09-13 09:22:49.971	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-13 09:22:49.166252	\N	\N	2	فحص وتشخيص	f	\N	\N	\N	مصطفى	مصطفى	manual	15	\N	\N	f	\N	\N	\N	\N
94	3	35	assistant	تبديل طرنبة بنزين خلفية	audi	A8	6166	90	علي	حسام	\N	archived	\N	2025-09-13 12:24:33.328	\N	\N	\N	5400	t	2025-09-13 09:24:33.905	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-13 09:24:33.112101	\N	\N	3	كهربا 1	f	\N	\N	\N	حسام	حسام	manual	90	\N	\N	f	\N	\N	\N	\N
95	4	35	assistant	تبديل امتاصورات غطاء محرك	audi	A8	6166	15	علي	محمد العلي	\N	archived	\N	2025-09-13 12:26:03.632	\N	\N	\N	900	t	2025-09-13 09:26:04.21	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-13 09:26:03.413917	\N	\N	4	حدادة	f	\N	\N	\N	محمد العلي	محمد العلي	manual	15	\N	\N	f	\N	\N	\N	\N
101	10	35	assistant	غسيل السيارة 	audi	A8	6166	30	علي	مصطفى	\N	archived	\N	2025-09-13 12:41:25.247	\N	\N	\N	1800	t	2025-09-13 09:41:25.823	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-13 09:41:25.03272	\N	\N	10	\N	f	\N	\N	\N	مصطفى	مصطفى	manual	30	\N	\N	f	\N	\N	\N	\N
96	5	35	assistant	تبديل طقم كوليات خلفية 	audi	A8	6166	45	علي	حسام	\N	archived	\N	2025-09-13 12:28:18.26	\N	\N	\N	2700	t	2025-09-13 09:28:18.85	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-13 09:28:18.038491	\N	\N	5	دوزان	f	\N	\N	\N	حسام	حسام	manual	45	\N	\N	f	\N	\N	\N	\N
105	14	35	assistant	غسيل المحرك وحجرة المحرك	vw	TOURAN	672254-دمشق	60	بدوي	مصطفى	\N	archived	\N	2025-09-15 10:38:32.016	\N	\N	\N	3600	t	2025-09-15 07:38:32.606	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-15 07:38:31.798165	\N	\N	14	غسيل محرك السيارة	f	\N	\N	\N	مصطفى	مصطفى	manual	60	\N	\N	f	\N	\N	\N	\N
98	7	35	assistant	فك الكف واعادة تركيبه	audi	A8	6166	30	علي	خالد	\N	archived	\N	2025-09-13 12:32:21.621	\N	\N	\N	1800	t	2025-09-13 09:32:22.201	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-13 09:32:21.405364	\N	\N	7	ميكانيك 1	f	\N	\N	\N	["خالد"]	["خالد"]	manual	60	\N	NBC	f	\N	\N	\N	\N
99	8	35	assistant	تبديل فيش حساس حرارة الهواء	audi	A8	6166	15	علي	حسام	\N	archived	\N	2025-09-13 12:36:49.378	\N	\N	\N	900	t	2025-09-13 09:36:49.959	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-13 09:36:49.160836	\N	\N	8	كهربا 1	f	\N	\N	\N	["حسام"]	["حسام"]	manual	900	\N	\N	f	\N	\N	\N	\N
102	11	35	assistant	فك واجهة + حاملة	vw	TOURAN	672254-دمشق	90	بدوي	حسام	\N	archived	\N	2025-09-15 10:32:49.364	\N	\N	\N	5400	t	2025-09-15 07:32:49.958	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-15 07:32:49.118522	\N	\N	11	حدادة	f	\N	\N	\N	حسام	خالد	manual	90	\N	\N	f	\N	\N	\N	\N
107	16	35	assistant	تثبيت فيش صباب FSI	vw	شيروكو	716483	15	بدوي	حسام	\N	archived	\N	2025-09-15 12:00:03.421	\N	\N	\N	900	t	2025-09-15 09:00:04.004	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-15 09:00:03.200624	\N	\N	16	كهربا 1	f	\N	\N	\N	حسام	حسام	manual	15	أبيض	\N	f	\N	\N	\N	\N
106	15	35	assistant	تبديل خرطوم الواصل بن الاتتركولر والتوربو	vw	شيروكو	716483	60	بدوي	مصطفى	\N	archived	\N	2025-09-15 11:59:14.218	\N	\N	\N	3600	t	2025-09-15 08:59:14.816	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-15 08:59:13.981035	\N	\N	15	ميكانيك 1	f	\N	\N	\N	مصطفى	مصطفى	manual	60	أبيض	\N	f	\N	\N	\N	\N
108	17	35	assistant	فك غطاء حول قبضة علبة السرعة واخراج مفتاح التشفيل وتنظبفه واعادة تركيبه	audi	A6	4896	30	عبد الحفيظ	حسام	\N	archived	\N	2025-09-15 14:12:46.775	\N	\N	\N	1680	t	2025-09-15 11:12:47.355	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-15 11:12:46.556286	\N	\N	17	كهربا 1	f	\N	\N	\N	حسام	حسام	manual	28	أسود	\N	f	\N	\N	\N	\N
109	18	35	assistant	تبديل مجمع  المياه جديد ثم فكه وتركيب مجمع مأخوذ من السيارة 1020	audi	Q5	3239	120	عبد الحفيظ	مصطفى	\N	archived	\N	2025-09-16 11:33:01.478	\N	\N	\N	7200	t	2025-09-16 08:33:02.069	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-16 08:33:01.244164	\N	\N	18	ميكانيك 1	f	\N	\N	\N	مصطفى	مصطفى	manual	120	رمادي	\N	f	\N	\N	\N	\N
110	19	35	assistant	فك واجهة + فك حاملة بشكل جزئي لفك المراوح 	vw	شيروكو	716483	60	عبد الحفيظ	حكيم	\N	archived	\N	2025-09-16 11:38:43.158	\N	\N	\N	3600	t	2025-09-16 08:38:43.734	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-16 08:38:42.934482	\N	\N	19	حدادة	f	\N	\N	\N	حكيم	حكيم	manual	60	أبيض	\N	f	\N	\N	\N	\N
111	20	35	assistant	تبديل المروحة الصغيرة	vw	شيروكو	716483	30	عبد الحفيظ	حكيم	\N	archived	\N	2025-09-16 11:39:35.187	\N	\N	\N	1800	t	2025-09-16 08:39:35.775	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-16 08:39:34.963898	\N	\N	20	ميكانيك 1	f	\N	\N	\N	حكيم	حكيم	manual	30	أبيض	\N	f	\N	\N	\N	\N
97	6	35	assistant	اعادة فك سوبر تشارج  +تبديل مبخرة 	audi	A8	6166	120	علي	مصطفى	\N	archived	\N	2025-09-13 12:31:18.352	\N	\N	\N	7200	t	2025-09-13 09:31:18.934	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-13 09:31:18.1353	\N	\N	6	ميكانيك 1	f	\N	\N	\N	مصطفى	مصطفى	manual	120	\N	\N	f	\N	\N	\N	2025-12-31
112	21	35	assistant	اعادة تركيب الواجهة 	vw	شيروكو	716483	60	عبد الحفيظ	حكيم	\N	archived	\N	2025-09-16 11:40:25.383	\N	\N	\N	3600	t	2025-09-16 08:40:25.965	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-16 08:40:25.157358	\N	\N	21	حدادة	f	\N	\N	\N	حكيم	حكيم	manual	60	أبيض	\N	f	\N	\N	\N	\N
113	22	35	assistant	فحص خراطيم الهواء _ يوجد آثار قليلة للزيت 	vw	شيروكو	716483	15	عبد الحفيظ	حكيم	\N	archived	\N	2025-09-16 11:41:25.071	\N	\N	\N	900	t	2025-09-16 08:41:25.647	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-16 08:41:24.853367	\N	\N	22	فحص وتشخيص	f	\N	\N	\N	حكيم	حكيم	manual	15	أبيض	\N	f	\N	\N	\N	\N
125	33	35	assistant	إصلاح مشكلة كهربائية في الفيوزات (راجع التوثيق الداخلي)	audi	A8	1084	15	بدوي	محمد العلي	\N	archived	\N	2025-09-16 12:39:03.661	\N	\N	\N	900	t	2025-09-16 09:39:04.237	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-16 09:39:03.42439	\N	\N	33	كهربا 1	f	\N	\N	\N	محمد العلي	محمد العلي	manual	15	أسود	\N	f	\N	\N	\N	\N
114	23	35	assistant	تبديل لمبة فرامل خلفي يسار	vw	شيروكو	716483	15	عبد الحفيظ	حسام	\N	archived	\N	2025-09-16 11:42:18.9	\N	\N	\N	900	t	2025-09-16 08:42:19.469	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-16 08:42:18.683666	\N	\N	23	كهربا 1	f	\N	\N	\N	حسام	حسام	manual	15	أبيض	\N	f	\N	\N	\N	\N
121	30	35	assistant	تركيب خرطوم سلندر فرام خلفي يمين	audi	A8	2469	15	بدوي	زياد	\N	archived	\N	2025-09-16 11:51:19.944	\N	\N	\N	900	t	2025-09-16 08:51:20.529	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-16 08:51:19.718283	\N	\N	30	ميكانيك 1	f	\N	\N	\N	زياد	زياد	manual	15	فضي	\N	f	\N	\N	\N	\N
115	24	35	assistant	فك الواجهة 	audi	A8	2469	30	بدوي	محمد العلي	\N	archived	\N	2025-09-16 11:44:07.725	\N	\N	\N	1800	t	2025-09-16 08:44:08.316	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-16 08:44:07.501749	\N	\N	24	حدادة	f	\N	\N	\N	محمد العلي	محمد العلي	manual	30	فضي	\N	f	\N	\N	\N	\N
116	25	35	assistant	فك ردتير غاز مكيف	audi	A8	2469	30	بدوي	محمد العلي	\N	archived	\N	2025-09-16 11:45:01.737	\N	\N	\N	1800	t	2025-09-16 08:45:02.324	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-16 08:45:01.513538	\N	\N	25	ميكانيك 1	f	\N	\N	\N	محمد العلي	محمد العلي	manual	30	فضي	\N	f	\N	\N	\N	\N
117	26	35	assistant	تركيب ردتير غاز مكيف جديد	audi	A8	2469	30	بدوي	حسام	\N	archived	\N	2025-09-16 11:46:06.698	\N	\N	\N	1800	t	2025-09-16 08:46:07.279	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-16 08:46:06.478349	\N	\N	26	ميكانيك 1	f	\N	\N	\N	حسام	حسام	manual	30	فضي	\N	f	\N	\N	\N	\N
118	27	35	assistant	ضغط دارة غاز المكيف لمدة ساعتين للتأكد من عدم وجود تسريب	audi	A8	2469	30	بدوي	حسام	\N	archived	\N	2025-09-16 11:47:19.593	\N	\N	\N	1800	t	2025-09-16 08:47:20.175	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-16 08:47:19.372392	\N	\N	27	نعبئة غاز مكيف	f	\N	\N	\N	حسام	حسام	manual	30	فضي	\N	f	\N	\N	\N	\N
119	28	35	assistant	فك خرطوم زيت سلندر فرام خلفي يمين	audi	A8	2469	15	بدوي	زياد	\N	archived	\N	2025-09-16 11:48:27.314	\N	\N	\N	900	t	2025-09-16 08:48:27.896	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-16 08:48:27.09426	\N	\N	28	ميكانيك 1	f	\N	\N	\N	زياد	زياد	manual	15	فضي	\N	f	\N	\N	\N	\N
126	34	35	assistant	إخراج كف المحرك وفحص والتاكد من عدم العبث به وإعادة تركيبه	audi	A8	1084	30	بدوي	محمد العلي	\N	archived	\N	2025-09-16 12:39:55.052	\N	\N	\N	1800	t	2025-09-16 09:39:55.625	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-16 09:39:54.837828	\N	\N	34	كهربا 1	f	\N	\N	\N	محمد العلي	محمد العلي	manual	30	أسود	\N	f	\N	\N	\N	\N
120	29	35	assistant	كبس خرطوم سلندر فرام في الصناعة 	audi	A8	2469	60	بدوي	\N	\N	archived	\N	2025-09-16 11:50:06.921	\N	\N	\N	3600	t	2025-09-16 08:50:07.493	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-16 08:50:06.702451	\N	\N	29	خدمات خارجية	f	\N	\N	\N	\N	\N	manual	60	فضي	\N	f	\N	\N	\N	\N
123	31	35	assistant	تبديل زيت محرك 40/5 شامبيون كمية 4 لتر + تبديل مصفاة	vw	شيروكو	716483	30	عبد الحفيظ	زياد	\N	archived	\N	2025-09-16 12:24:29.504	\N	\N	\N	1800	t	2025-09-16 09:24:30.09	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-16 09:24:29.26686	\N	\N	31	تبديل زيت	f	\N	\N	\N	زياد	زياد	manual	30	أبيض	\N	f	\N	\N	\N	\N
124	32	35	assistant	تصفير سيرفس	vw	شيروكو	716483	15	عبد الحفيظ	\N	\N	archived	\N	2025-09-16 12:25:00.166	\N	\N	\N	900	t	2025-09-16 09:25:00.751	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-16 09:24:59.947774	\N	\N	32	برمجة	f	\N	\N	\N	\N	\N	manual	15	أبيض	\N	f	\N	\N	\N	\N
128	36	35	assistant	تعبئة زيت فرام وتنفيس الدارة مع اضافة الزيت	audi	A8	2469	60	بدوي	زياد	\N	archived	\N	2025-09-17 09:13:59.805	\N	\N	\N	3600	t	2025-09-17 06:14:00.399	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-17 06:13:59.56785	\N	\N	36	دوزان	f	\N	\N	\N	زياد	زياد	manual	60	فضي	\N	f	\N	\N	\N	\N
127	35	35	assistant	تبديل زند سفلي خلفي	audi	Q7	343651	60	علي	حكيم	\N	archived	\N	2025-09-16 14:29:04.515	\N	\N	\N	3600	t	2025-09-16 11:29:05.096	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-16 11:29:04.284882	\N	\N	35	دوزان	f	\N	\N	\N	حكيم	حكيم	manual	60	\N	\N	f	\N	\N	\N	\N
129	37	35	assistant	تعبئة غاز مكيف كمية 1كغ+ 50 غرام زيت ضاغط	audi	A8	2469	120	بدوي	حسام	\N	archived	\N	2025-09-17 09:23:29.716	\N	\N	\N	7200	t	2025-09-17 06:23:30.308	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-17 06:23:29.462125	\N	\N	37	نعبئة غاز مكيف	f	\N	\N	\N	حسام	حسام	manual	120	فضي	\N	f	\N	\N	\N	\N
130	38	35	assistant	تركيب الواجهة	audi	A8	2469	30	بدوي	محمد العلي	\N	archived	\N	2025-09-17 09:26:12.307	\N	\N	\N	1800	t	2025-09-17 06:26:12.895	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-17 06:26:12.066479	\N	\N	38	حدادة	f	\N	\N	\N	محمد العلي	محمد العلي	manual	30	فضي	\N	f	\N	\N	\N	\N
132	40	35	assistant	اصلاح أسلاك المنفاخ واعادة تركيبه	audi	Q7	36987	120	عبد الحفيظ	حسام	\N	completed	2025-09-17 09:39:46	2025-09-17 09:42:04.07	2025-09-17 09:41:49.485	\N	\N	122	f	\N	\N	\N	\N	2025-09-17 06:39:46.46195	\N	\N	\N	كهربا 1	t	00	2025-09-17 06:42:04.07	00	حسام	حسام	automatic	\N	أبيض	\N	f	\N	\N	\N	\N
133	41	35	assistant	اصلاح أسلاك المنفاخ واعادة تركيبه	audi	Q7	36987	120	عبد الحفيظ	حسام		archived	2025-09-17 09:41:43	2025-09-17 23:41:00	\N	\N	\N	13514	t	2025-09-17 10:29:31.952	عبد الحفيظ		3	2025-09-17 06:41:43.858863			39	كهربا 1	f	\N	\N	\N	{"{\\"حسام\\"}"}	{"{\\"حسام\\"}"}	automatic	225	أبيض		f	\N	\N	\N	\N
131	39	35	assistant	غسيل محرك	audi	Q7	36987	30	عبد الحفيظ	زياد		archived	2025-09-17 09:39:00	2025-09-17 22:09:00	\N	\N	\N	13680	t	2025-09-17 10:29:39.12	عبد الحفيظ		3	2025-09-17 06:39:00.212392			40	غسيل محرك	f	\N	\N	\N	{"زياد"}	{"زياد"}	automatic	228	أبيض		f	\N	\N	\N	\N
134	42	35	assistant	فك مانيفولد من أجل فحص خلط الزيت والماء عند مبرد زيت المحرك (الخراطيم نظيفة)	vw	PASSAT B6	257004	60	علي	مصطفى	\N	archived	\N	2025-09-17 16:12:53.937	\N	\N	\N	3600	t	2025-09-17 13:12:54.54	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-17 13:12:53.698715	\N	\N	41	ميكانيك 1	f	\N	\N	\N	مصطفى	مصطفى	manual	60	فضي	\N	f	\N	\N	\N	\N
135	43	35	assistant	تبديل خرطوم مياه داخل الى مبرد زيت علبة السرعة 	vw	PASSAT B6	257004	15	علي	مصطفى	\N	archived	\N	2025-09-17 16:13:45.36	\N	\N	\N	900	t	2025-09-17 13:13:45.947	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-17 13:13:45.139547	\N	\N	42	ميكانيك 1	f	\N	\N	\N	مصطفى	مصطفى	manual	15	فضي	\N	f	\N	\N	\N	\N
142	50	35	assistant	فك كفوف أمامي+ خلفي لأجل تبديل باكات	vw	GOLF R	2382	90	علي	حكيم	\N	archived	\N	2025-09-18 11:18:08.552	\N	\N	\N	5400	t	2025-09-18 08:18:09.139	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-18 08:18:08.308226	\N	\N	49	دوزان	f	\N	\N	\N	حكيم	حكيم	manual	90	أسود	\N	f	\N	\N	\N	\N
136	44	35	assistant	تبديل كوليات خلفية	vw	PASSAT B6	257004	45	علي	حكيم	\N	archived	\N	2025-09-17 16:14:35.223	\N	\N	\N	2700	t	2025-09-17 13:14:35.81	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-17 13:14:35.00357	\N	\N	43	دوزان	f	\N	\N	\N	حكيم	حكيم	manual	45	فضي	\N	f	\N	\N	\N	\N
137	45	35	assistant	تبديل طرنبة بنزين	vw	PASSAT B6	257004	60	علي	محمد العلي	\N	archived	\N	2025-09-17 16:18:29.56	\N	\N	\N	3600	t	2025-09-17 13:18:30.126	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-17 13:18:29.34672	\N	\N	44	كهربا 1	f	\N	\N	\N	محمد العلي	محمد العلي	manual	60	فضي	\N	f	\N	\N	\N	\N
138	46	35	assistant	تغيير زيت علبة السرعة كمية 4 لتر	vw	PASSAT B6	257004	30	علي	حكيم	\N	archived	\N	2025-09-17 16:19:27.245	\N	\N	\N	1800	t	2025-09-17 13:19:27.833	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-17 13:19:27.024384	\N	\N	45	ميكانيك 1	f	\N	\N	\N	حكيم	حكيم	manual	30	فضي	\N	f	\N	\N	\N	\N
143	51	35	assistant	كبس 6 باكات ( كفوف خلفي + أمامي)	vw	GOLF R	2382	60	علي	\N	\N	archived	\N	2025-09-18 11:18:59.805	\N	\N	\N	3600	t	2025-09-18 08:19:00.385	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-18 08:18:59.585595	\N	\N	50	خدمات خارجية	f	\N	\N	\N	\N	\N	manual	60	أسود	\N	f	\N	\N	\N	\N
139	47	35	assistant	تغيير زيت علبة السرعة كمية 4 لتر	vw	PASSAT B6	257004	30	علي	حكيم	\N	archived	\N	2025-09-17 16:22:30.842	\N	\N	\N	1800	t	2025-09-17 13:22:31.412	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-17 13:22:30.627096	\N	\N	46	ميكانيك 1	f	\N	\N	\N	حكيم	حكيم	manual	30	فضي	\N	f	\N	\N	\N	\N
140	48	35	assistant	وضع شحم داخل كوشوكة رأس أكس أمامي يسار وتركيب ضبات جديدة	vw	PASSAT B6	257004	15	علي	حكيم	\N	archived	\N	2025-09-17 16:24:21.553	\N	\N	\N	900	t	2025-09-17 13:24:22.137	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-17 13:24:21.332761	\N	\N	47	دوزان	f	\N	\N	\N	حكيم	حكيم	manual	15	فضي	\N	f	\N	\N	\N	\N
147	55	35	assistant	تبديل أصابع سيخ رجاج يمين ويسار	vw	GOLF R	2382	15	علي	حكيم	\N	archived	\N	2025-09-18 11:23:37.691	\N	\N	\N	900	t	2025-09-18 08:23:38.277	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-18 08:23:37.471498	\N	\N	54	دوزان	f	\N	\N	\N	حكيم	حكيم	manual	15	أسود	\N	f	\N	\N	\N	\N
141	49	35	assistant	صوت الميزانية مصدره علبة الدركسيون  وبحاجة تبديل باكات جسر أمامي	vw	PASSAT B6	257004	15	علي	\N	\N	archived	\N	2025-09-17 16:25:41.569	\N	\N	\N	900	t	2025-09-17 13:25:42.153	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-17 13:25:41.348197	\N	\N	48	فحص وتشخيص	f	\N	\N	\N	\N	\N	manual	15	فضي	\N	f	\N	\N	\N	\N
144	52	35	assistant	تبديل كوشوكة رأس اكس يسار خارجية 	vw	GOLF R	2382	60	علي	حكيم	\N	archived	\N	2025-09-18 11:20:03.116	\N	\N	\N	3600	t	2025-09-18 08:20:03.694	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-18 08:20:02.896794	\N	\N	51	دوزان	f	\N	\N	\N	حكيم	حكيم	manual	60	أسود	\N	f	\N	\N	\N	\N
145	53	35	assistant	تبديل بيضات زند دركسيون يمين+ يسار + تبديل كوشوكة زند دركسيون	vw	GOLF R	2382	30	علي	حكيم	\N	archived	\N	2025-09-18 11:21:17.577	\N	\N	\N	1800	t	2025-09-18 08:21:18.166	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-18 08:21:17.352716	\N	\N	52	دوزان	f	\N	\N	\N	حكيم	حكيم	manual	30	أسود	\N	f	\N	\N	\N	\N
151	59	35	assistant	فط غطاء جنزير علوي+ تبديل جوان	vw	GOLF R	2382	60	علي	مصطفى	\N	archived	\N	2025-09-18 11:27:26.11	\N	\N	\N	3600	t	2025-09-18 08:27:26.703	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-18 08:27:25.886433	\N	\N	58	ميكانيك 1	f	\N	\N	\N	مصطفى	مصطفى	manual	60	أسود	\N	f	\N	\N	\N	\N
146	54	35	assistant	تبديل بيضات كفوف أمامية يمين ويسار	vw	GOLF R	2382	15	علي	حكيم	\N	archived	\N	2025-09-18 11:22:31.914	\N	\N	\N	900	t	2025-09-18 08:22:32.498	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-18 08:22:31.692859	\N	\N	53	دوزان	f	\N	\N	\N	حكيم	حكيم	manual	15	أسود	\N	f	\N	\N	\N	\N
148	56	35	assistant	تبديل امتاصور أمامي يسار 	vw	GOLF R	2382	120	علي	حكيم	\N	archived	\N	2025-09-18 11:24:36.104	\N	\N	\N	7200	t	2025-09-18 08:24:36.695	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-18 08:24:35.881146	\N	\N	55	دوزان	f	\N	\N	\N	حكيم	حكيم	manual	120	أسود	\N	f	\N	\N	\N	\N
150	58	35	assistant	فط غطاء جنزير علوي+ تبديل جوان	vw	GOLF R	2382	60	علي	مصطفى	\N	archived	\N	2025-09-18 11:27:14.038	\N	\N	\N	3600	t	2025-09-18 08:27:14.632	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-18 08:27:13.812987	\N	\N	57	ميكانيك 1	f	\N	\N	\N	مصطفى	مصطفى	manual	60	أسود	\N	f	\N	\N	\N	\N
149	57	35	assistant	اعادة تركيب الكفوف الأمامية والخلفية بعد تبديل الباكات 	vw	GOLF R	2382	90	علي	حكيم	\N	archived	\N	2025-09-18 11:25:46.946	\N	\N	\N	5400	t	2025-09-18 08:25:47.54	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-18 08:25:46.722306	\N	\N	56	دوزان	f	\N	\N	\N	حكيم	حكيم	manual	90	أسود	\N	f	\N	\N	\N	\N
152	60	35	assistant	فك خرطوم مياه وتبديله 	vw	PASSAT B6	433778	30	عبد الحفيظ	زياد	\N	completed	2025-09-18 11:45:36	2025-09-20 09:34:49.461	2025-09-20 09:16:53.161	\N	\N	163876	f	\N	\N	\N	\N	2025-09-18 08:45:36.663946	\N	\N	\N	\N	t	000	2025-09-20 06:34:49.461	00	زياد	زياد	automatic	\N	\N	\N	f	\N	\N	\N	\N
153	61	35	assistant	تبديل طرمبات البنزين +  تجسير خطوط ريليه عند علبة الفيوزات والتجريب: لا فائدة	volkswagen	Touareg	9748	90	عبد الحفيظ	حسام	\N	archived	\N	2025-09-18 11:50:16.299	\N	\N	\N	5400	t	2025-09-18 08:50:16.882	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-18 08:50:16.076342	\N	\N	59	كهربا 1	f	\N	\N	\N	حسام	خالد	manual	90	أبيض	\N	f	\N	\N	\N	\N
154	62	35	assistant	فك بوجية6+ فحص ضغط المحرك	volkswagen	Touareg	9748	15	عبد الحفيظ	زياد	\N	archived	\N	2025-09-18 11:52:09.885	\N	\N	\N	900	t	2025-09-18 08:52:10.464	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-18 08:52:09.667026	\N	\N	60	فحص وتشخيص	f	\N	\N	\N	زياد	زياد	manual	15	أبيض	\N	f	\N	\N	\N	\N
155	63	35	assistant	إعادة طرمبات البنزين الأساسية 	volkswagen	Touareg	9748	90	عبد الحفيظ	حسام	\N	archived	\N	2025-09-18 11:53:17.091	\N	\N	\N	5400	t	2025-09-18 08:53:17.7	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-18 08:53:16.871973	\N	\N	61	كهربا 1	f	\N	\N	\N	حسام	خالد	manual	90	أبيض	\N	f	\N	\N	\N	\N
162	70	35	assistant	اعادة تجميع واقيات التابلو والاجزاء التي فكها لأجل تبديل الردتير	vw	TOUAREG	6441	180	عبد الحفيظ	حسام	\N	archived	\N	2025-09-20 09:55:12.468	\N	\N	\N	10800	t	2025-09-20 06:55:13.049	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 06:55:12.246716	\N	\N	68	كهربا 2	f	\N	\N	\N	حسام	خالد	manual	180	أسود	\N	f	\N	\N	\N	\N
156	64	35	assistant	فك واجهة + أضواء أمامية	vw	TOUAREG	6441	90	عبد الحفيظ	حسام	\N	archived	\N	2025-09-20 09:41:30.267	\N	\N	\N	5400	t	2025-09-20 06:41:30.839	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 06:41:30.037554	\N	\N	62	حدادة	f	\N	\N	\N	حسام	خالد	manual	90	أسود	\N	f	\N	\N	\N	\N
157	65	35	assistant	فحص تهريب المياه إلى داخل السيارة _ بحاجة ردتير داخلي	vw	TOUAREG	6441	15	عبد الحفيظ	حسام	\N	archived	\N	2025-09-20 09:42:34.079	\N	\N	\N	900	t	2025-09-20 06:42:34.65	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 06:42:33.862255	\N	\N	63	فحص وتشخيص	f	\N	\N	\N	حسام	حسام	manual	15	أسود	\N	f	\N	\N	\N	\N
166	74	35	assistant	فك الكولاس تبين وجود صباب مكسور وبستون مكسور (الاول) تم تبديل البستون الاول واعادة تجميع الكولاس بالكامل بعد تبديل البستون الاول واجراء صيانة للكولاس	audi	A6	8698	300	علي	مصطفى	\N	archived	\N	2025-09-20 11:01:15.107	\N	\N	\N	18000	t	2025-09-20 08:01:15.678	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 08:01:14.892979	\N	\N	72	ميكانيك 2	f	\N	\N	\N	مصطفى	مصطفى	manual	300	أسود	\N	f	\N	\N	\N	\N
158	66	35	assistant	تمديد خطوط جديدة لحساس الحرارة G62	vw	TOUAREG	6441	30	عبد الحفيظ	حسام	\N	archived	\N	2025-09-20 09:45:32.935	\N	\N	\N	1800	t	2025-09-20 06:45:33.517	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 06:45:32.712124	\N	\N	64	كهربا 1	f	\N	\N	\N	حسام	خالد	manual	30	أسود	\N	f	\N	\N	\N	\N
163	71	35	assistant	أعمال إضافية لتبديل ردتير الشوفاج حيث تم التبديل بدون فك التابلو باحترافية الفني	vw	TOUAREG	6441	240	عبد الحفيظ	حسام	\N	archived	\N	2025-09-20 09:57:35.091	\N	\N	\N	14400	t	2025-09-20 06:57:35.675	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 06:57:34.871611	\N	\N	69	كهربا 2	f	\N	\N	\N	حسام	خالد	manual	240	أسود	\N	f	\N	\N	\N	\N
159	67	35	assistant	تجريب تبديل حساس حرارة المحرك + تجريب إعطاء G62 بارد منفصل عن باقي الحساسات	vw	TOUAREG	6441	15	عبد الحفيظ	حسام	\N	archived	\N	2025-09-20 09:46:59.556	\N	\N	\N	900	t	2025-09-20 06:47:00.125	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 06:46:59.338545	\N	\N	65	فحص وتشخيص	f	\N	\N	\N	حسام	حسام	manual	15	أسود	\N	f	\N	\N	\N	\N
160	68	35	assistant	تركيب الواجهة+ الأضواء الأمامية	vw	TOUAREG	6441	90	عبد الحفيظ	حسام	\N	archived	\N	2025-09-20 09:48:06.332	\N	\N	\N	5400	t	2025-09-20 06:48:06.907	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 06:48:06.111972	\N	\N	66	حدادة	f	\N	\N	\N	حسام	خالد	manual	90	أسود	\N	f	\N	\N	\N	\N
161	69	35	assistant	فك واقيات سفلية داخلية من التابلو وتبديل ردتير الشوفاج 	vw	TOUAREG	6441	180	عبد الحفيظ	حسام	\N	archived	\N	2025-09-20 09:53:06.56	\N	\N	\N	10800	t	2025-09-20 06:53:07.207	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 06:53:06.339096	\N	\N	67	كهربا 2	f	\N	\N	\N	حسام	خالد	manual	180	أسود	\N	f	\N	\N	\N	\N
164	72	35	assistant	 فك حاملة + واجهة	audi	A6	8698	90	علي	مصطفى	\N	archived	\N	2025-09-20 10:54:05.119	\N	\N	\N	5400	t	2025-09-20 07:54:05.695	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 07:54:04.903408	\N	\N	70	حدادة	f	\N	\N	\N	مصطفى	مصطفى	manual	90	أسود	\N	f	\N	\N	\N	\N
168	76	35	assistant	فحص الكولاس وتبديل صباب البستون الأول	audi	A6	8698	60	علي	\N	\N	archived	\N	2025-09-20 11:06:46.755	\N	\N	\N	3600	t	2025-09-20 08:06:47.338	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 08:06:46.538392	\N	\N	74	خدمات خارجية	f	\N	\N	\N	\N	\N	manual	60	أسود	\N	f	\N	\N	\N	\N
165	73	35	assistant	سحب محرك الى الخارج 	audi	A6	8698	180	علي	حكيم	\N	archived	\N	2025-09-20 10:54:53.757	\N	\N	\N	10800	t	2025-09-20 07:54:54.333	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 07:54:53.542812	\N	\N	71	ميكانيك 1	f	\N	\N	\N	حكيم	زياد	manual	180	أسود	\N	f	\N	\N	\N	\N
167	75	35	assistant	تجميع المحرك بالكامل	audi	A6	8698	120	علي	مصطفى	\N	archived	\N	2025-09-20 11:03:11.18	\N	\N	\N	7200	t	2025-09-20 08:03:11.757	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 08:03:10.963971	\N	\N	73	ميكانيك 1	f	\N	\N	\N	مصطفى	مصطفى	manual	120	أسود	\N	f	\N	\N	\N	\N
169	77	35	assistant	غسيل غرفة المحرك 	audi	A6	8698	30	علي	حكيم	\N	archived	\N	2025-09-20 11:08:02.216	\N	\N	\N	1800	t	2025-09-20 08:08:02.815	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 08:08:01.993644	\N	\N	75	غسيل محرك السيارة	f	\N	\N	\N	حكيم	حكيم	manual	30	أسود	\N	f	\N	\N	\N	\N
170	78	35	assistant	تفريغ البنزين من الخزان+ غسيل دارة البنزين بالبنزين	audi	A6	8698	60	علي	محمد العلي	\N	archived	\N	2025-09-20 11:09:13.15	\N	\N	\N	3600	t	2025-09-20 08:09:13.738	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 08:09:12.928414	\N	\N	76	كهربا 1	f	\N	\N	\N	محمد العلي	محمد العلي	manual	60	أسود	\N	f	\N	\N	\N	\N
171	79	35	assistant	تركيب المحرك + فحص الضغط	audi	A6	8698	180	علي	زياد	\N	archived	\N	2025-09-20 11:40:14.604	\N	\N	\N	10800	t	2025-09-20 08:40:15.173	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 08:40:14.388513	\N	\N	77	ميكانيك 1	f	\N	\N	\N	زياد	حكيم	manual	180	أسود	\N	f	\N	\N	\N	\N
172	80	35	assistant	تغيير زيت + مصفاة	audi	A6	8698	15	علي	مصطفى	\N	archived	\N	2025-09-20 11:41:19.694	\N	\N	\N	900	t	2025-09-20 08:41:20.276	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 08:41:19.476525	\N	\N	78	تبديل زيت	f	\N	\N	\N	مصطفى	مصطفى	manual	15	أسود	\N	f	\N	\N	\N	\N
173	81	35	assistant	تغيير بواجي	audi	A6	8698	15	علي	مصطفى	\N	archived	\N	2025-09-20 11:42:14.926	\N	\N	\N	900	t	2025-09-20 08:42:15.511	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 08:42:14.70769	\N	\N	79	ميكانيك 1	f	\N	\N	\N	مصطفى	مصطفى	manual	15	أسود	\N	f	\N	\N	\N	\N
181	89	35	assistant	تبديل زيت 10/40 موبيل كمية 5 لتر + مصفاة 	vw	PASSAT	241049 - دمشق	30	عبد الحفيظ	حكيم	\N	archived	\N	2025-09-21 16:03:48.93	\N	\N	\N	1800	t	2025-09-21 13:03:49.514	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-21 13:03:48.696336	\N	\N	87	تبديل زيت	f	\N	\N	\N	حكيم	نواف	manual	30	\N	\N	f	\N	\N	\N	\N
174	82	35	assistant	تعبئة زيت هيدروليك	audi	A6	8698	15	علي	مصطفى	\N	archived	\N	2025-09-20 11:43:26.63	\N	\N	\N	900	t	2025-09-20 08:43:27.212	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 08:43:26.411809	\N	\N	80	ميكانيك 1	f	\N	\N	\N	مصطفى	مصطفى	manual	15	أسود	\N	f	\N	\N	\N	\N
175	83	35	assistant	فحص ثرموستات	audi	A6	8698	15	علي	\N	\N	archived	\N	2025-09-20 11:47:19.963	\N	\N	\N	900	t	2025-09-20 08:47:20.543	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 08:47:19.746183	\N	\N	81	فحص وتشخيص	f	\N	\N	\N	\N	\N	manual	15	أسود	\N	f	\N	\N	\N	\N
185	93	35	assistant	ارسال حركة الباب جوار السائق للصيانة	vw	PASSAT	241049	60	عبد الحفيظ	\N	\N	archived	\N	2025-09-21 16:09:05.033	\N	\N	\N	3600	t	2025-09-21 13:09:05.613	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-21 13:09:04.816854	\N	\N	91	خدمات خارجية	f	\N	\N	\N	\N	\N	manual	60	\N	\N	f	\N	\N	\N	\N
176	84	35	assistant	تبديل كوشوكة هواء( تيربو_ مينفولد)	audi	A6	8698	15	علي	مصطفى	\N	archived	\N	2025-09-20 11:48:50.606	\N	\N	\N	900	t	2025-09-20 08:48:51.178	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 08:48:50.390633	\N	\N	82	دوزان	f	\N	\N	\N	مصطفى	مصطفى	manual	15	أسود	\N	f	\N	\N	\N	\N
182	90	35	assistant	تصفير سيرفس ومعايرته على 7000 	vw	PASSAT	241049	15	عبد الحفيظ	\N	\N	archived	\N	2025-09-21 16:05:50.875	\N	\N	\N	900	t	2025-09-21 13:05:51.46	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-21 13:05:50.653182	\N	\N	88	برمجة	f	\N	\N	\N	\N	\N	manual	15	\N	\N	f	\N	\N	\N	\N
177	85	35	assistant	ضغط دارة غاز	audi	A6	8698	30	علي	حسام	\N	archived	\N	2025-09-20 11:50:36.24	\N	\N	\N	1800	t	2025-09-20 08:50:36.815	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 08:50:36.023936	\N	\N	83	نعبئة غاز مكيف	f	\N	\N	\N	حسام	حسام	manual	30	أسود	\N	f	\N	\N	\N	\N
178	86	35	assistant	تبديل حساس ضغط غاز	audi	A6	8698	15	علي	محمد العلي	\N	archived	\N	2025-09-20 11:51:44.091	\N	\N	\N	900	t	2025-09-20 08:51:44.663	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 08:51:43.876568	\N	\N	84	كهربا 1	f	\N	\N	\N	محمد العلي	محمد العلي	manual	15	أسود	\N	f	\N	\N	\N	\N
179	87	35	assistant	اعادة ضغط الدارة والتأكد من عدم وجود تسريب ثم تعبئة غاز مكيف550 غرام + 50زيت ضاغط	audi	A6	8698	120	علي	حسام	\N	archived	\N	2025-09-20 11:53:06.213	\N	\N	\N	7200	t	2025-09-20 08:53:06.784	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 08:53:05.998945	\N	\N	85	نعبئة غاز مكيف	f	\N	\N	\N	حسام	حسام	manual	120	أسود	\N	f	\N	\N	\N	\N
183	91	35	assistant	فك ضبات رؤوس اكس داخلية وتشحيمها 	vw	PASSAT	241049 - دمشق	30	عبد الحفيظ	حكيم	\N	archived	\N	2025-09-21 16:07:03.859	\N	\N	\N	1800	t	2025-09-21 13:07:04.44	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-21 13:07:03.638257	\N	\N	89	دوزان	f	\N	\N	\N	حكيم	نواف	manual	30	\N	\N	f	\N	\N	\N	\N
180	88	35	assistant	ظهور عطل المحرك و EPC على التابلو بسبب عطل في طرنبة ماء الكهربائية ذات الرقم 06D121601 وغير متوفرة حاليا بالاضافة لعطل في نظام تبخير البنزين	audi	A5	1528	30	بدوي	\N	\N	archived	\N	2025-09-20 12:16:50.567	\N	\N	\N	1800	t	2025-09-20 09:16:51.146	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-20 09:16:50.350217	\N	\N	86	فحص وتشخيص	f	\N	\N	\N	\N	\N	manual	30	رمادي	\N	f	\N	\N	\N	\N
186	94	35	assistant	فحص امتاصورات خلفية :بحالة وسط	vw	PASSAT	241049 - دمشق	30	\N	\N	\N	archived	\N	2025-09-21 16:10:04.92	\N	\N	\N	180	t	2025-09-21 13:10:05.507	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-21 13:10:04.697011	\N	\N	92	دوزان	f	\N	\N	\N	\N	\N	manual	3	\N	\N	f	\N	\N	\N	\N
184	92	35	assistant	فك فرش+ صاجة باب جوار السائق زاخارج حركة البلور لأجل ارسالها للصيانة في ورشة خارجية ثم اعادة التركيب بعد الصيانة	vw	PASSAT	241049 - دمشق	90	عبد الحفيظ	حسام	\N	archived	\N	2025-09-21 16:08:14.696	\N	\N	\N	5400	t	2025-09-21 13:08:15.287	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-21 13:08:14.472742	\N	\N	90	كهربا 1	f	\N	\N	\N	محمد العلي	محمد العلي	manual	90	\N	\N	f	\N	\N	\N	\N
188	96	35	assistant	تبديل فلتر مكيف	vw	PASSAT	241049	15	عبد الحفيظ	حسام	\N	archived	\N	2025-09-21 16:15:37.226	\N	\N	\N	900	t	2025-09-21 13:15:37.805	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-21 13:15:37.005569	\N	\N	94	كهربا 1	f	\N	\N	\N	خالد	خالد	manual	15	\N	\N	f	\N	\N	\N	\N
187	95	35	assistant	فك حركة فتحة السقف_هناك قطع في سلك  الحركة + اعادة تركيب الفتحة 	vw	PASSAT	241049	60	عبد الحفيظ	حسام	\N	archived	\N	2025-09-21 16:14:40.757	\N	\N	\N	3600	t	2025-09-21 13:14:41.329	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-21 13:14:40.539707	\N	\N	93	كهربا 1	f	\N	\N	\N	حسام	حسام	manual	60	\N	\N	f	\N	\N	\N	\N
189	97	35	assistant	تبديل فلتر هواء+ تنفيخ حجرة المحرك	vw	PASSAT	241049	15	عبد الحفيظ	زياد	\N	archived	\N	2025-09-21 16:16:36.975	\N	\N	\N	900	t	2025-09-21 13:16:37.557	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-21 13:16:36.753586	\N	\N	95	ميكانيك 1	f	\N	\N	\N	زياد	زياد	manual	15	\N	\N	f	\N	\N	\N	\N
190	98	35	assistant	فحص بواجي : وسط بحاجة تبديل في الزيارة القادمة	vw	PASSAT	241049	15	عبد الحفيظ	زياد	\N	archived	\N	2025-09-21 16:22:40.908	\N	\N	\N	900	t	2025-09-21 13:22:41.498	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-21 13:22:40.591243	\N	\N	96	فحص وتشخيص	f	\N	\N	\N	زياد	زياد	manual	15	\N	\N	f	\N	\N	\N	\N
191	99	35	assistant	تبديل طرمبة البنزين + اعادة الريليه الخاص بالسيارة	vw	PASSAT	241049	60	عبد الحفيظ	حسام	\N	archived	\N	2025-09-21 16:23:41.823	\N	\N	\N	3600	t	2025-09-21 13:23:42.405	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-21 13:23:41.602802	\N	\N	97	كهربا 1	f	\N	\N	\N	حسام	حسام	manual	60	\N	\N	f	\N	\N	\N	\N
192	100	35	assistant	تنظيف لمبة الصندوق الخلفي + تركيب فيشها	vw	PASSAT	241049	15	عبد الحفيظ	حسام	\N	archived	\N	2025-09-21 16:24:52.849	\N	\N	\N	900	t	2025-09-21 13:24:53.421	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-21 13:24:52.631483	\N	\N	98	كهربا 1	f	\N	\N	\N	حسام	حسام	manual	15	\N	\N	f	\N	\N	\N	\N
193	101	35	assistant	فك دسكات خلفية وتبديلها + تبديل طقم كوليات خلفية	vw	PASSAT	241049	90	عبد الحفيظ	حكيم	\N	archived	\N	2025-09-21 16:25:46.957	\N	\N	\N	5400	t	2025-09-21 13:25:47.532	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-21 13:25:46.739669	\N	\N	99	دوزان	f	\N	\N	\N	حكيم	نواف	manual	90	\N	\N	f	\N	\N	\N	\N
201	109	35	assistant	اعادة تركيب واجهة+ حاملة	audi	A6	8698	90	علي	مصطفى	\N	archived	\N	2025-09-22 16:15:44.061	\N	\N	\N	5400	t	2025-09-22 13:15:44.632	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-22 13:15:43.844104	\N	\N	107	حدادة	f	\N	\N	\N	مصطفى	مصطفى	manual	90	أسود	\N	f	\N	\N	\N	\N
194	102	35	assistant	فك نصف وجهة وفك الضوء وارساله مع الزبون لتبديل البلورة واعادة التركيب بعد الصيانة	audi	Q7	6690	90	بدوي	حسام	\N	archived	\N	2025-09-22 16:06:19.599	\N	\N	\N	5400	t	2025-09-22 13:06:20.184	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-22 13:06:19.359903	\N	\N	100	حدادة	f	\N	\N	\N	حسام	حسام	manual	90	رمادي	\N	f	\N	\N	\N	\N
195	103	35	assistant	تبديل شبكة سفلية يمين	audi	Q7	6690	15	بدوي	حسام	\N	archived	\N	2025-09-22 16:07:59.337	\N	\N	\N	900	t	2025-09-22 13:07:59.917	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-22 13:07:59.117273	\N	\N	101	حدادة	f	\N	\N	\N	حسام	حسام	manual	15	رمادي	\N	f	\N	\N	\N	\N
208	116	35	assistant	تبديل فلتر هواء محرك+ تبديل طقم بواجي	porsche	Cayenne	1745	30	عبد الحفيظ	زياد	\N	archived	\N	2025-09-23 15:26:59.842	\N	\N	\N	1800	t	2025-09-23 12:27:00.414	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-23 12:26:59.622555	\N	\N	114	ميكانيك 1	f	\N	\N	\N	زياد	زياد	manual	30	أسود	\N	f	\N	\N	\N	\N
196	104	35	assistant	فك الضوء الخلفي السفلي اليمين واعادة تركيبه بسببعدم مطابقة الضوء المستلم من المستودع	audi	Q7	6690	15	بدوي	حسام	\N	archived	\N	2025-09-22 16:09:18.381	\N	\N	\N	900	t	2025-09-22 13:09:18.967	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-22 13:09:18.159824	\N	\N	102	كهربا 1	f	\N	\N	\N	حسام	حسام	manual	15	رمادي	\N	f	\N	\N	\N	\N
202	110	35	assistant	وضع حساسات طبون أمامي على الحاملة بدون تثبيت على الطبون ريثما يتم تأمين قواعد للحساسات	audi	A6	8698	15	علي	مصطفى	\N	archived	\N	2025-09-22 16:17:00.98	\N	\N	\N	900	t	2025-09-22 13:17:01.562	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-22 13:17:00.75616	\N	\N	108	كهربا 1	f	\N	\N	\N	مصطفى	مصطفى	manual	15	أسود	\N	f	\N	\N	\N	\N
197	105	35	assistant	فك طبون خلفي وتبديل 3 حساسات	audi	A6	8698	60	علي	محمد العلي	\N	archived	\N	2025-09-22 16:10:39.637	\N	\N	\N	3600	t	2025-09-22 13:10:40.222	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-22 13:10:39.416639	\N	\N	103	كهربا 1	f	\N	\N	\N	محمد العلي	محمد العلي	manual	60	أسود	\N	f	\N	\N	\N	\N
198	106	35	assistant	وضع معجونة حديد على صباب VVT واعادة تركيبه	audi	A6	8698	120	علي	حكيم	\N	archived	\N	2025-09-22 16:11:48.997	\N	\N	\N	7200	t	2025-09-22 13:11:49.573	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-22 13:11:48.778976	\N	\N	104	ميكانيك 1	f	\N	\N	\N	حكيم	حكيم	manual	120	أسود	\N	f	\N	\N	\N	\N
206	114	35	assistant	تبديل زيت علبة السرعة ديكسرون 6+ كمية 4 لتر	porsche	Cayenne	1745	30	عبد الحفيظ	زياد	\N	archived	\N	2025-09-23 15:24:57.421	\N	\N	\N	1800	t	2025-09-23 12:24:58.006	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-23 12:24:57.199476	\N	\N	112	ميكانيك 1	f	\N	\N	\N	زياد	زياد	manual	30	أسود	\N	f	\N	\N	\N	\N
199	107	35	assistant	تبديل كف حساسات PARKING ASST	audi	A6	8698	15	علي	محمد العلي	\N	archived	\N	2025-09-22 16:12:57.608	\N	\N	\N	900	t	2025-09-22 13:12:58.194	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-22 13:12:57.384634	\N	\N	105	كهربا 1	f	\N	\N	\N	محمد العلي	محمد العلي	manual	15	أسود	\N	f	\N	\N	\N	\N
203	111	35	assistant	تصفير سيرفس ومعايرته على 1000 كم	audi	A6	8698	15	علي	\N	\N	archived	\N	2025-09-22 16:17:40.386	\N	\N	\N	900	t	2025-09-22 13:17:40.963	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-22 13:17:40.166693	\N	\N	109	برمجة	f	\N	\N	\N	\N	\N	manual	15	أسود	\N	f	\N	\N	\N	\N
200	108	35	assistant	تبديل علبة فضال مياه	audi	A6	8698	15	علي	حسام	\N	archived	\N	2025-09-22 16:14:37.284	\N	\N	\N	900	t	2025-09-22 13:14:37.865	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-22 13:14:37.06237	\N	\N	106	ميكانيك 1	f	\N	\N	\N	حسام	حسام	manual	15	أسود	\N	f	\N	\N	\N	\N
204	112	35	assistant	تبديل لمبة كشاف أمامي يمين	audi	A6	8698	15	علي	حسام	\N	archived	\N	2025-09-22 16:25:57.199	\N	\N	\N	900	t	2025-09-22 13:25:57.767	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-22 13:25:56.984307	\N	\N	110	كهربا 1	f	\N	\N	\N	حسام	حسام	manual	15	أسود	\N	f	\N	\N	\N	\N
207	115	35	assistant	تبديل زيت محرك 40/5 موبيل كمية 9لتر	porsche	Cayenne	1745	30	عبد الحفيظ	زياد	\N	archived	\N	2025-09-23 15:26:03.069	\N	\N	\N	1800	t	2025-09-23 12:26:03.646	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-23 12:26:02.851712	\N	\N	113	تبديل زيت	f	\N	\N	\N	زياد	زياد	manual	30	أسود	\N	f	\N	\N	\N	\N
205	113	35	assistant	تبديل امتاصور غطاء محرك	porsche	Cayenne	1745	15	بدوي	\N	\N	archived	\N	2025-09-23 15:19:55.983	\N	\N	\N	900	t	2025-09-23 12:19:56.552	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-23 12:19:55.761166	\N	\N	111	ميكانيك 1	f	\N	\N	\N	\N	\N	manual	15	أسود	\N	f	\N	\N	\N	\N
209	117	35	assistant	إضافة زيت ديكسرون3 كمية 70مل	porsche	Cayenne	1745	30	عبد الحفيظ	زياد	\N	archived	\N	2025-09-23 15:28:12.266	\N	\N	\N	1800	t	2025-09-23 12:28:12.842	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-23 12:28:12.049021	\N	\N	115	ميكانيك 1	f	\N	\N	\N	زياد	زياد	manual	30	أسود	\N	f	\N	\N	\N	\N
210	118	35	assistant	تبديل فلتر مكيف	porsche	Cayenne	1745	15	عبد الحفيظ	حسام	\N	archived	\N	2025-09-23 15:28:52.435	\N	\N	\N	900	t	2025-09-23 12:28:53.013	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-23 12:28:52.218687	\N	\N	116	كهربا 1	f	\N	\N	\N	حسام	حسام	manual	15	أسود	\N	f	\N	\N	\N	\N
211	119	35	assistant	تبديل زيت دفرنسيه أمامي كمية 1لتر+ خلفي1 لتر	porsche	Cayenne	1745	30	عبد الحفيظ	زياد	\N	archived	\N	2025-09-23 15:31:19.437	\N	\N	\N	1800	t	2025-09-23 12:31:20.022	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-23 12:31:19.216286	\N	\N	117	ميكانيك 1	f	\N	\N	\N	زياد	زياد	manual	30	أسود	\N	f	\N	\N	\N	\N
212	120	35	assistant	تصفير سيرفس +تصفير  تغيير الزيت ومعايرته على 5000كم +تصفير غيار زيت علبة السرعة	porsche	Cayenne	1745	15	عبد الحفيظ	\N	\N	archived	\N	2025-09-23 15:32:45.244	\N	\N	\N	900	t	2025-09-23 12:32:45.832	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-23 12:32:45.022728	\N	\N	118	برمجة	f	\N	\N	\N	\N	\N	manual	15	أسود	\N	f	\N	\N	\N	\N
213	121	35	assistant	تبديل زيت فرامل كمية عبوتين ونصف +  تنفيس الدرة 	porsche	Cayenne	1745	60	عبد الحفيظ	حسام	\N	archived	\N	2025-09-23 15:35:10.466	\N	\N	\N	3600	t	2025-09-23 12:35:11.057	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-23 12:35:10.23882	\N	\N	119	ميكانيك 1	f	\N	\N	\N	حسام	حسام	manual	60	أسود	\N	f	\N	\N	\N	\N
221	129	35	assistant	فك سوبر تشارج +تبديل بخاخ رقم 6+4	audi	Q7	7432	90	علي	زياد	\N	archived	\N	2025-09-24 11:56:40.515	\N	\N	\N	5400	t	2025-09-24 08:56:41.096	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 08:56:40.298187	\N	\N	127	ميكانيك 1	f	\N	\N	\N	زياد	زياد	manual	90	أحمر	\N	f	\N	\N	\N	\N
214	122	35	assistant	تنفيخ +مسح أغطية البلاستيك	porsche	Cayenne	1745	15	عبد الحفيظ	زياد	\N	archived	\N	2025-09-23 15:36:07.396	\N	\N	\N	780	t	2025-09-23 12:36:07.975	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-23 12:36:07.177097	\N	\N	120	ميكانيك 1	f	\N	\N	\N	زياد	زياد	manual	13	أسود	\N	f	\N	\N	\N	\N
215	123	35	assistant	تنفيخ +مسح أغطية البلاستيك	porsche	Cayenne	1745	15	عبد الحفيظ	زياد	\N	archived	\N	2025-09-23 15:39:31.121	\N	\N	\N	780	t	2025-09-23 12:39:31.695	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-23 12:39:30.90411	\N	\N	121	ميكانيك 1	f	\N	\N	\N	زياد	زياد	manual	13	أسود	\N	f	\N	\N	\N	\N
216	124	35	assistant	تجريب السيارة في الخارج من أجل الميزانية لا يوجد مشكلة	audi	Q7	7432	15	بدوي	\N	\N	archived	\N	2025-09-24 11:50:23.221	\N	\N	\N	900	t	2025-09-24 08:50:23.807	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 08:50:22.975012	\N	\N	122	فحص وتشخيص	f	\N	\N	\N	\N	\N	manual	15	أحمر	\N	f	\N	\N	\N	\N
222	130	35	assistant	فحص بارد السيارة المتصل مع المحرك+ تبديل الشريط	audi	Q7	7432	30	علي	حسام	\N	archived	\N	2025-09-24 11:57:52.165	\N	\N	\N	1800	t	2025-09-24 08:57:52.736	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 08:57:51.951049	\N	\N	128	كهربا 1	f	\N	\N	\N	حسام	حسام	manual	30	أحمر	\N	f	\N	\N	\N	\N
217	125	35	assistant	فك سوبر تشارج +تبديل أغطية جنزير خلفية ووضع جوان مع معجونة 	audi	Q7	7432	300	علي	مصطفى	\N	archived	\N	2025-09-24 11:51:54.528	\N	\N	\N	18000	t	2025-09-24 08:51:55.096	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 08:51:54.314565	\N	\N	123	\N	f	\N	\N	\N	مصطفى	مصطفى	manual	300	أحمر	\N	f	\N	\N	\N	\N
218	126	35	assistant	تبديل مبخرة مع تنظيف	audi	Q7	7432	30	علي	مصطفى	\N	archived	\N	2025-09-24 11:52:53.115	\N	\N	\N	1800	t	2025-09-24 08:52:53.693	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 08:52:52.898324	\N	\N	124	ميكانيك 1	f	\N	\N	\N	مصطفى	مصطفى	manual	30	أحمر	\N	f	\N	\N	\N	\N
226	134	35	assistant	سحب محرك	audi	A5	29588	180	عبد الحفيظ	حكيم	\N	archived	\N	2025-09-24 12:03:15.447	\N	\N	\N	10800	t	2025-09-24 09:03:16.019	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 09:03:15.232788	\N	\N	132	ميكانيك 1	f	\N	\N	\N	حكيم	زياد	manual	180	\N	\N	f	\N	\N	\N	\N
219	127	35	assistant	تبديل ماسورة مياه على مدخل سوبر تشارج+ ماسورة مياه بين الكولاسين	audi	Q7	7432	30	علي	مصطفى	\N	archived	\N	2025-09-24 11:54:39.178	\N	\N	\N	1800	t	2025-09-24 08:54:39.761	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 08:54:38.958942	\N	\N	125	ميكانيك 1	f	\N	\N	\N	مصطفى	مصطفى	manual	30	أحمر	\N	f	\N	\N	\N	\N
223	131	35	assistant	تبديل زيت علبة السرعة ديكسرون 6 كمية 4 لتر ومعايرته	audi	Q7	7432	30	علي	زياد	\N	archived	\N	2025-09-24 11:59:45.472	\N	\N	\N	1800	t	2025-09-24 08:59:46.046	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 08:59:45.253636	\N	\N	129	تبديل زيت	f	\N	\N	\N	زياد	زياد	manual	30	أحمر	\N	f	\N	\N	\N	\N
220	128	35	assistant	تبديل بواجي + بوبين1+6+4	audi	Q7	7432	30	علي	مصطفى	\N	archived	\N	2025-09-24 11:55:35.07	\N	\N	\N	1800	t	2025-09-24 08:55:35.656	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 08:55:34.85046	\N	\N	126	ميكانيك 1	f	\N	\N	\N	مصطفى	مصطفى	manual	30	أحمر	\N	f	\N	\N	\N	\N
230	138	35	assistant	غسيل حجرة محرك+ غسيل محرك	audi	A5	29588	60	عبد الحفيظ	زياد	\N	archived	\N	2025-09-24 12:09:59.415	\N	\N	\N	3600	t	2025-09-24 09:09:59.987	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 09:09:59.201204	\N	\N	136	غسيل محرك السيارة	f	\N	\N	\N	زياد	زياد	manual	60	\N	\N	f	\N	\N	\N	\N
224	132	35	assistant	تجريب في الخارج : الأداء جيد ولا يوجد أعطال	audi	Q7	7432	15	علي	\N	\N	archived	\N	2025-09-24 12:00:44.332	\N	\N	\N	900	t	2025-09-24 09:00:44.991	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 09:00:44.116684	\N	\N	130	اختبار خارج الورشة	f	\N	\N	\N	\N	\N	manual	15	أحمر	\N	f	\N	\N	\N	\N
227	135	35	assistant	تبديل جوان غطاء جنازير+ جوان VVT	audi	A5	29588	60	عبد الحفيظ	زياد	\N	archived	\N	2025-09-24 12:04:18.828	\N	\N	\N	3600	t	2025-09-24 09:04:19.414	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 09:04:18.609126	\N	\N	133	ميكانيك 1	f	\N	\N	\N	زياد	زياد	manual	60	\N	\N	f	\N	\N	\N	\N
225	133	35	assistant	فك واجهة + حاملة	audi	A5	29588	90	عبد الحفيظ	حسام	\N	archived	\N	2025-09-24 12:02:15.318	\N	\N	\N	5400	t	2025-09-24 09:02:15.9	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 09:02:15.100534	\N	\N	131	حدادة	f	\N	\N	\N	حسام	خالد	manual	90	\N	\N	f	\N	\N	\N	\N
229	137	35	assistant	تبديل مانعة كرنك خلفية 	audi	A5	29588	15	عبد الحفيظ	مصطفى	\N	archived	\N	2025-09-24 12:09:18.543	\N	\N	\N	900	t	2025-09-24 09:09:19.116	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 09:09:18.325841	\N	\N	135	ميكانيك 1	f	\N	\N	\N	زياد	زياد	manual	15	\N	\N	f	\N	\N	\N	\N
228	136	35	assistant	تبديل جوان غطاء جنازير+ جوان VVT	audi	A5	29588	60	عبد الحفيظ	زياد	\N	archived	\N	2025-09-24 12:07:21.606	\N	\N	\N	3600	t	2025-09-24 09:07:22.366	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 09:07:21.389552	\N	\N	134	ميكانيك 1	f	\N	\N	\N	زياد	زياد	manual	60	\N	\N	f	\N	\N	\N	\N
231	139	35	assistant	(تثبيت خرطومين هواء + تجريب تبديل حساس AIRMASS+ تجريب تبديل حساس البيئة B1S1 + تجريب سد مكان صباب EVAP ) لمراقبة الصرف _ لا فائدة	audi	Q7	37166	60	عبد الحفيظ	حكيم	\N	archived	\N	2025-09-24 12:12:05.85	\N	\N	\N	3600	t	2025-09-24 09:12:06.425	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 09:12:05.634434	\N	\N	137	ميكانيك 1	f	\N	\N	\N	حكيم	حكيم	manual	60	أبيض	\N	f	\N	\N	\N	\N
232	140	35	assistant	تبديل ماسورة مياه داخلة للشوفاج+ ماسورة مياه T	vw	JETTA	1675	30	علي	حكيم	\N	archived	\N	2025-09-24 12:48:28.481	\N	\N	\N	1800	t	2025-09-24 09:48:29.058	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 09:48:28.263335	\N	\N	138	ميكانيك 1	f	\N	\N	\N	حكيم	حكيم	manual	30	أسود	\N	f	\N	\N	\N	\N
233	141	35	assistant	فك جسر خلفي من أجل تبديل الباغات الأربعة الخلفية + كواشيك صدمة واعادة تركيبه	vw	JETTA	1675	180	علي	حكيم	\N	archived	\N	2025-09-24 12:50:05.25	\N	\N	\N	10800	t	2025-09-24 09:50:05.844	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 09:50:05.02703	\N	\N	139	دوزان	f	\N	\N	\N	حكيم	حكيم	manual	180	أسود	\N	f	\N	\N	\N	\N
245	153	35	assistant	اصلاح فيش المرش ( زرع PIN مكان العاطل)	audi	Q7	37166	60	عبد الحفيظ	حسام	\N	archived	\N	2025-09-24 14:43:49.189	\N	\N	\N	3600	t	2025-09-24 11:43:49.771	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 11:43:48.95844	\N	\N	151	كهربا 1	f	\N	\N	\N	حسام	حسام	manual	60	أبيض	\N	f	\N	\N	\N	\N
234	142	35	assistant	فك ميزانية من الأمام من أجل تبديل بيضة دركسيون عدد2	vw	JETTA	1675	120	علي	حكيم	\N	archived	\N	2025-09-24 12:52:37.358	\N	\N	\N	7200	t	2025-09-24 09:52:37.936	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 09:52:37.144347	\N	\N	140	دوزان	f	\N	\N	\N	حكيم	حكيم	manual	120	أسود	\N	f	\N	\N	\N	\N
241	149	35	assistant	فك غطاء PCV VALVE تحت اذن المحرك + تبديل الجوان	audi	A5	29588	30	عبد الحفيظ	زياد	\N	archived	\N	2025-09-24 13:04:19.088	\N	\N	\N	1800	t	2025-09-24 10:04:19.674	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 10:04:18.868842	\N	\N	147	ميكانيك 1	f	\N	\N	\N	زياد	زياد	manual	30	\N	\N	f	\N	\N	\N	\N
235	143	35	assistant	فك فلقة أمامية يمين وتبديل الامتاصور مع تبديل رولمان الطبشة	vw	JETTA	1675	120	\N	حكيم	\N	archived	\N	2025-09-24 12:53:26.959	\N	\N	\N	7200	t	2025-09-24 09:53:27.532	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 09:53:26.746081	\N	\N	141	دوزان	f	\N	\N	\N	حكيم	حكيم	manual	120	أسود	\N	f	\N	\N	\N	\N
236	144	35	assistant	فك فلقة أمامية يسار وتبديل الامتاصور مع تبديل رولمان الطبشة	vw	JETTA	1675	120	علي	حكيم	\N	archived	\N	2025-09-24 12:54:06.626	\N	\N	\N	7200	t	2025-09-24 09:54:07.326	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 09:54:06.410844	\N	\N	142	دوزان	f	\N	\N	\N	حكيم	حكيم	manual	120	أسود	\N	f	\N	\N	\N	\N
237	145	35	assistant	تبديل امتاصورات خلفية 	vw	JETTA	1675	60	علي	حكيم	\N	archived	\N	2025-09-24 12:54:51.744	\N	\N	\N	3600	t	2025-09-24 09:54:52.321	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 09:54:51.527479	\N	\N	143	دوزان	f	\N	\N	\N	حكيم	حكيم	manual	60	أسود	\N	f	\N	\N	\N	\N
242	150	35	assistant	فك الكارتير وتنظيفه وسلكنته واعادة تركيبه	audi	A5	29588	90	عبد الحفيظ	زياد	\N	archived	\N	2025-09-24 13:04:58.459	\N	\N	\N	5400	t	2025-09-24 10:04:59.034	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 10:04:58.244005	\N	\N	148	ميكانيك 1	f	\N	\N	\N	زياد	زياد	manual	90	\N	\N	f	\N	\N	\N	\N
238	146	35	assistant	كبس 4 باغات للجسر الخلفي	vw	JETTA	1675	60	علي	\N	\N	archived	\N	2025-09-24 12:55:49.178	\N	\N	\N	3600	t	2025-09-24 09:55:49.769	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 09:55:48.958484	\N	\N	144	خدمات خارجية	f	\N	\N	\N	\N	\N	manual	60	أسود	\N	f	\N	\N	\N	\N
239	147	35	assistant	فحص بوابة التوربو إذا كان فيها خلوص _ عندتحريك البوابة قليلا وتم اخبار الزبون فيها	audi	A5	29588	15	عبد الحفيظ	حكيم	\N	archived	\N	2025-09-24 13:02:45.133	\N	\N	\N	900	t	2025-09-24 10:02:45.703	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 10:02:44.919603	\N	\N	145	فحص وتشخيص	f	\N	\N	\N	حكيم	حكيم	manual	15	\N	\N	f	\N	\N	\N	\N
240	148	35	assistant	تبديل سيلة طرمبة FSI	audi	A5	29588	30	عبد الحفيظ	زياد	\N	archived	\N	2025-09-24 13:03:26.653	\N	\N	\N	1800	t	2025-09-24 10:03:27.241	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 10:03:26.433326	\N	\N	146	ميكانيك 1	f	\N	\N	\N	زياد	زياد	manual	30	\N	\N	f	\N	\N	\N	\N
243	151	35	assistant	مد خط إشارة لحساس الكارتير + اصلاح خطوط بحالة سيئة	audi	A5	29588	60	عبد الحفيظ	حسام	\N	archived	\N	2025-09-24 13:05:44.5	\N	\N	\N	3600	t	2025-09-24 10:05:45.077	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 10:05:44.284332	\N	\N	149	كهربا 1	f	\N	\N	\N	حسام	حسام	manual	60	\N	\N	f	\N	\N	\N	\N
246	154	35	assistant	تجريب تبديل كف محرك + تجريب تبديل كف _ هناك نتيجة واضحة لكن غير نهائية	audi	Q7	37166	15	عبد الحفيظ	\N	\N	archived	\N	2025-09-24 14:44:33.395	\N	\N	\N	900	t	2025-09-24 11:44:33.972	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 11:44:33.180115	\N	\N	152	فحص وتشخيص	f	\N	\N	\N	\N	\N	manual	15	أبيض	\N	f	\N	\N	\N	\N
244	152	35	assistant	تبديل قواعد المحرك والمحرك في الخارج	audi	A5	29588	30	عبد الحفيظ	زياد	\N	archived	\N	2025-09-24 13:06:27.79	\N	\N	\N	1800	t	2025-09-24 10:06:28.365	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 10:06:27.574844	\N	\N	150	دوزان	f	\N	\N	\N	زياد	زياد	manual	30	\N	\N	f	\N	\N	\N	\N
249	157	35	assistant	تركيب محرك	audi	A5	29588	180	عبد الحفيظ	زياد	\N	archived	\N	2025-09-25 11:27:28.88	\N	\N	\N	10800	t	2025-09-25 08:27:29.466	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 08:27:28.633343	\N	\N	155	ميكانيك 1	f	\N	\N	\N	زياد	حكيم	manual	180	\N	\N	f	\N	\N	\N	\N
248	156	35	assistant	اصلاح حساس اغلاق الصندوق + تبديل لمبات عدد2 + تنظيف فياش عدد5	audi	Q7	37166	60	عبد الحفيظ	حسام	\N	archived	\N	2025-09-24 14:45:42.064	\N	\N	\N	3600	t	2025-09-24 11:45:42.723	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 11:45:41.851568	\N	\N	154	كهربا 1	f	\N	\N	\N	حسام	حسام	manual	60	أبيض	\N	f	\N	\N	\N	\N
247	155	35	assistant	تجريب تنزيل SOFT WARE مختلف على كف السيارة : لافائدة	audi	Q7	37166	15	عبد الحفيظ	\N	\N	archived	\N	2025-09-24 14:45:07.985	\N	\N	\N	900	t	2025-09-24 11:45:08.683	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-24 11:45:07.76823	\N	\N	153	فحص وتشخيص	f	\N	\N	\N	\N	\N	manual	15	أبيض	\N	f	\N	\N	\N	\N
250	158	35	assistant	تركيب حاملة + واجهة	audi	A5	29588	90	عبد الحفيظ	حسام	\N	archived	\N	2025-09-25 11:28:09.914	\N	\N	\N	5400	t	2025-09-25 08:28:10.502	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 08:28:09.695579	\N	\N	156	حدادة	f	\N	\N	\N	حسام	خالد	manual	90	أبيض	\N	f	\N	\N	\N	\N
251	159	35	assistant	تبديل زنود علوية + سفلية+ اصابع سيخ رجاج+ بيضات دركسيون + بيضات كف سفلي+ اصلاح رأس أكس من خلال تركيب سكمان وضبة كوشوكة رأس أكس أمامي يسار	audi	A5	29588	420	عبد الحفيظ	حكيم	\N	archived	\N	2025-09-25 11:29:27.083	\N	\N	\N	25200	t	2025-09-25 08:29:27.665	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 08:29:26.865838	\N	\N	157	دوزان	f	\N	\N	\N	زياد	زياد	manual	420	\N	\N	f	\N	\N	\N	\N
252	160	35	assistant	تبديل فيش حساس البيئة	audi	A5	29588	15	عبد الحفيظ	حسام	\N	archived	\N	2025-09-25 11:30:45.463	\N	\N	\N	900	t	2025-09-25 08:30:46.05	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 08:30:45.244219	\N	\N	158	كهربا 1	f	\N	\N	\N	حسام	حسام	manual	15	\N	\N	f	\N	\N	\N	\N
253	161	35	assistant	ضغط دارة المكيف والتأكد من عدم وجود تسريب + تعبئة غاز مكيف 600 غرام+ 50 غرام زيت ضاغط	audi	A5	29588	120	عبد الحفيظ	حسام	\N	archived	\N	2025-09-25 11:31:21.997	\N	\N	\N	7200	t	2025-09-25 08:31:22.585	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 08:31:21.778124	\N	\N	159	نعبئة غاز مكيف	f	\N	\N	\N	حسام	حسام	manual	120	\N	\N	f	\N	\N	\N	\N
254	162	35	assistant	اصلاح خط كهرباء ولحامه	audi	A5	29588	15	عبد الحفيظ	زياد	\N	archived	\N	2025-09-25 11:32:13.076	\N	\N	\N	900	t	2025-09-25 08:32:13.656	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 08:32:12.858248	\N	\N	160	كهربا 1	f	\N	\N	\N	زياد	زياد	manual	15	\N	\N	f	\N	\N	\N	\N
261	169	35	assistant	فحص+ تنظيف فلاتر الهواء	vw	PASSAT	6052	15	أنس	حسام	\N	archived	\N	2025-09-25 12:09:03.198	\N	\N	\N	900	t	2025-09-25 09:09:03.78	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 09:09:02.978224	\N	\N	167	ميكانيك 1	f	\N	\N	\N	حسام	خالد	manual	15	رمادي	\N	f	\N	\N	\N	\N
255	163	35	assistant	تعبئة زيت هيدروليك 500 مل	audi	A5	29588	15	عبد الحفيظ	زياد	\N	archived	\N	2025-09-25 11:35:14.404	\N	\N	\N	900	t	2025-09-25 08:35:14.985	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 08:35:14.171936	\N	\N	161	ميكانيك 1	f	\N	\N	\N	زياد	زياد	manual	15	\N	\N	f	\N	\N	\N	\N
256	164	35	assistant	تغيير قيم CENTRAL CONVENIENCE لالغاء عطل الأضواء	audi	A5	29588	15	عبد الحفيظ	\N	\N	archived	\N	2025-09-25 11:36:04.664	\N	\N	\N	900	t	2025-09-25 08:36:05.247	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 08:36:04.444397	\N	\N	162	برمجة	f	\N	\N	\N	\N	\N	manual	15	\N	\N	f	\N	\N	\N	\N
268	176	35	assistant	اختبار كفاءة دارة التبريد وعمل الثرموستات	vw	PASSAT	6052	15	أنس	\N	\N	archived	\N	2025-09-25 12:16:49.136	\N	\N	\N	900	t	2025-09-25 09:16:49.714	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 09:16:48.919044	\N	\N	174	اختبارات داخل الورشة	f	\N	\N	\N	\N	\N	manual	15	رمادي	\N	f	\N	\N	\N	\N
257	165	35	assistant	تغيير جوان صباب+ تنظيف البوبينات مع حجرة البواجي	vw	PASSAT	6052	\N	أنس	مصطفى	\N	archived	\N	2025-09-25 12:05:49.901	\N	\N	\N	0	t	2025-09-25 09:05:50.485	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 09:05:49.66992	\N	\N	163	ميكانيك 1	f	\N	\N	\N	مصطفى	مصطفى	manual	0	رمادي	\N	f	\N	\N	\N	\N
262	170	35	assistant	ضغط دارة المياه + فحص الدارة	vw	PASSAT	6052	15	أنس	مصطفى	\N	archived	\N	2025-09-25 12:10:30.114	\N	\N	\N	900	t	2025-09-25 09:10:30.69	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 09:10:29.895802	\N	\N	168	ميكانيك 1	f	\N	\N	\N	مصطفى	مصطفى	manual	15	رمادي	\N	f	\N	\N	\N	\N
258	166	35	assistant	فحص المبخرة + تبديل كوشوكة المبخرة مع النابض	vw	PASSAT	6052	15	أنس	مصطفى	\N	archived	\N	2025-09-25 12:06:20.105	\N	\N	\N	900	t	2025-09-25 09:06:20.686	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 09:06:19.883888	\N	\N	164	ميكانيك 1	f	\N	\N	\N	مصطفى	مصطفى	manual	15	رمادي	\N	f	\N	\N	\N	\N
266	174	35	assistant	فك كف المحرك واعادة تركيبه من أجل سوفت وير	vw	PASSAT	6052	30	أنس	زياد	\N	archived	\N	2025-09-25 12:15:37.687	\N	\N	\N	1800	t	2025-09-25 09:15:38.264	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 09:15:37.466118	\N	\N	172	ميكانيك 1	f	\N	\N	\N	زياد	زياد	manual	30	رمادي	\N	f	\N	\N	\N	\N
260	168	35	assistant	فك حساس الأوكسجين وتركيبة لفحص دبو البيئة	vw	PASSAT	6052	15	أنس	حسام	\N	archived	\N	2025-09-25 12:08:24.811	\N	\N	\N	900	t	2025-09-25 09:08:25.391	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 09:08:24.592864	\N	\N	166	ميكانيك 1	f	\N	\N	\N	حسام	حسام	manual	15	رمادي	\N	f	\N	\N	\N	\N
265	173	35	assistant	غسيل محرك من الأعلى والأسفل	vw	PASSAT	6052	60	أنس	مصطفى		archived	\N	2025-09-25 12:14:03.979	\N	\N	\N	3360	t	2025-09-25 09:14:04.561	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 09:14:03.75937			171	غسيل محرك	f	\N	\N	\N	{"{\\"مصطفى\\"}"}	{"{\\"مصطفى\\"}"}	manual	56	رمادي	\N	f	\N	\N	\N	\N
264	172	35	assistant	فحص ميزانية	vw	PASSAT	6052	15	أنس	حكيم	\N	archived	\N	2025-09-25 12:12:49.514	\N	\N	\N	900	t	2025-09-25 09:12:50.102	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 09:12:49.292394	\N	\N	170	فحص وتشخيص	f	\N	\N	\N	حكيم	حكيم	manual	15	رمادي	\N	f	\N	\N	\N	\N
267	175	35	assistant	برمجة كف المحرك	vw	PASSAT	6052	60	أنس	\N	\N	archived	\N	2025-09-25 12:16:16.954	\N	\N	\N	3600	t	2025-09-25 09:16:17.537	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 09:16:16.734713	\N	\N	173	برمجة	f	\N	\N	\N	\N	\N	manual	60	رمادي	\N	f	\N	\N	\N	\N
263	171	35	assistant	تنظيف مينفولد+ حساس ضغط الهواء (MAP)	vw	PASSAT	6052	30	أنس	مصطفى		archived	\N	2025-09-25 12:12:05.269	\N	\N	\N	1740	t	2025-09-25 09:12:05.851	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 09:12:05.047667			169	ميكانيك 1	f	\N	\N	\N	{"مصطفى"}	{"مصطفى"}	manual	29	رمادي	\N	f	\N	\N	\N	\N
269	177	35	assistant	اختبار خارج الورشة لا يوجد ملاحظات	vw	PASSAT	6052	15	أنس	\N	\N	archived	\N	2025-09-25 12:17:23.414	\N	\N	\N	900	t	2025-09-25 09:17:24.006	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 09:17:23.192774	\N	\N	175	اختبار خارج الورشة	f	\N	\N	\N	\N	\N	manual	15	رمادي	\N	f	\N	\N	\N	\N
259	167	35	assistant	فك مينفولد وتركيب ثرموستات ( ملغي سابقا)	vw	PASSAT	6052	90	أنس	مصطفى		archived	\N	2025-09-25 12:07:13.258	\N	\N	\N	900	t	2025-09-25 09:07:13.849	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 09:07:13.033288			165	ميكانيك 1	f	\N	\N	\N	{"{\\"مصطفى\\"}"}	{"{\\"مصطفى\\"}"}	manual	15	رمادي	\N	f	\N	\N	\N	\N
270	178	35	assistant	تبديل جوان غطاء صندوق الخلفي	audi	A5	241049	15	عبد الحفيظ	محمد العلي		archived	\N	2025-09-25 13:01:10.166	\N	\N	\N	900	t	2025-09-25 10:01:10.757	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 10:01:09.922245			176	حدادة	f	\N	\N	\N	{"محمد العلي"}	{"محمد العلي"}	manual	15		\N	f	\N	\N	\N	\N
271	179	35	assistant	ارسال السيارة الى مختص في صيانة فتحات السقف لأجل اصلاح حركتها	vw	PASSAT	241049	60	عبد الحفيظ	\N	\N	archived	\N	2025-09-25 13:01:54.817	\N	\N	\N	3600	t	2025-09-25 10:01:55.389	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-25 10:01:54.602219	\N	\N	177	خدمات خارجية	f	\N	\N	\N	\N	\N	manual	60	\N	\N	f	\N	\N	\N	\N
279	187	35	assistant	فحص زيت علبة السرعة : بحالة جيدة	vw	PASSAT	241049	15	عبد الحفيظ			archived	\N	2025-09-28 10:44:55.462	\N	\N	\N	900	t	2025-09-28 07:44:56.048	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-28 07:44:55.24262			183	فحص وتشخيص	f	\N	\N	\N	{}	{}	manual	15		\N	f	\N	\N	\N	2025-09-20
272	180	35	assistant	 فك فلاتة الدركسيون  وتنظيفها	audi	A6	9091	60	عبد الحفيظ	حسام		archived	2025-09-27 10:09:52	2025-09-27 11:25:02.854	\N	\N	\N	4510	t	2025-09-27 08:25:13.527	عبد الحفيظ		3	2025-09-27 07:09:52.293826			178	كهربا 1	f	\N	\N	\N	{"{\\"{\\\\\\"{\\\\\\\\\\\\\\"حسام\\\\\\\\\\\\\\"}\\\\\\"}\\"}"}	{"{\\"{\\\\\\"{\\\\\\\\\\\\\\"حسام\\\\\\\\\\\\\\"}\\\\\\"}\\"}"}	automatic	75	أبيض	\N	f	\N	\N	\N	2025-09-27
274	182	35	assistant	اعادة فك المبرد لاصلاح مكان برغي مكسور	audi	Q7	2283	30	عبد الحفيظ	مصطفى	\N	archived	\N	2025-09-27 15:21:49.333	\N	\N	\N	1800	t	2025-09-27 12:21:49.901	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-27 12:21:48.965857	\N	\N	179	ميكانيك 1	f	\N	\N	\N	مصطفى	مصطفى	manual	30	أسود	\N	f	\N	\N	\N	\N
273	181	35	assistant	فك مبرد زيت المحرك وتبديله	audi	Q7	2283	120	عبد الحفيظ	مصطفى	\N	archived	2025-09-27 10:58:32	2025-09-27 15:20:54.118	\N	\N	\N	8586	t	2025-09-27 12:23:11.709	عبد الحفيظ		2	2025-09-27 07:58:31.911559	\N	\N	180	ميكانيك 1	f	\N	\N	\N	مصطفى	مصطفى	automatic	143	أسود	\N	f	\N	\N	\N	\N
277	185	35	assistant	تبديل ردتير غاز مكيف	audi	A6	8698	60	علي	محمد العلي		archived	\N	2025-09-28 10:38:10.063	\N	\N	\N	3600	t	2025-09-28 07:38:10.649	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-28 07:38:09.843185			181	ميكانيك 1	f	\N	\N	\N	{"{\\"{\\\\\\"محمد العلي\\\\\\"}\\"}"}	{"{\\"{\\\\\\"محمد العلي\\\\\\"}\\"}"}	manual	60	أسود	\N	f	\N	\N	\N	2025-09-20
278	186	35	assistant	تبديل لمبة غماز أمامي يسار+ تثبيت بحزامات بسبب كسر السوكة+ تبديل لمبة الطقة الأولى	vw	PASSAT	241049	15	عبد الحفيظ	حسام		archived	\N	2025-09-28 10:44:08.914	\N	\N	\N	900	t	2025-09-28 07:44:09.498	نظام المؤقت اليدوي	تم أرشفة المهمة تلقائياً - مؤقت يدوي	\N	2025-09-28 07:44:08.694304			182	كهربا 1	f	\N	\N	\N	{"حسام"}	{"حسام"}	manual	15		\N	f	\N	\N	\N	2025-09-20
276	184	35	assistant	فك فرش باب المرافق + فحص خطوط الحامي  الواصلة الى الكف+ فحص القفل + اعادة تركيب الفرش	audi	Q7	1629	60	عبد الحفيظ	حسام		archived	2025-09-28 10:18:55	2025-09-28 10:53:06.203	2025-09-28 10:52:46.285	\N	\N	2031	t	2025-09-28 07:53:33.373	عبد الحفيظ		3	2025-09-28 07:18:54.960905	الخطوط سليمة + القفل سليم		185	كهربا 1	f	\N	\N	\N	{"حسام"}	{"خالد"}	automatic	34	أسود		f	\N	\N	\N	\N
275	183	35	assistant	فك كرتير للتأكد من عدم انسداد الغليون 	audi	Q7	2283	90	مصطفى	عبد الحفيظ	\N	completed	2025-09-27 15:47:37	2025-09-28 10:48:04.468	2025-09-27 16:05:25.517	\N	\N	433	f	\N	\N	\N	\N	2025-09-27 12:47:36.965286	\N	\N	\N	ميكانيك 1	t	00	2025-09-28 07:48:04.468	عبد االحفيظ	مصطفى	مصطفى	automatic	\N	أسود	\N	f	\N	\N	\N	\N
281	189	35	assistant	فحص خطوط الزمور + فك  PCM +مد خط خارجي الى الزمور	volkswagen	Jetta	259617	60	عبد الحفيظ	حسام	\N	active	2025-09-28 11:35:30	\N	\N	\N	\N	0	f	\N	\N	\N	\N	2025-09-28 08:35:30.140948	\N	\N	\N	كهربا 1	f	\N	\N	\N	حسام	خالد	automatic	\N	أبيض	\N	f	\N	\N	\N	\N
280	188	35	assistant	فك كف باب المرافق واصلاحه	audi	Q7	1629	60	عبد الحفيظ	حسام		archived	2025-09-28 10:51:01	2025-09-28 10:51:37.397	\N	\N	\N	3600	t	2025-09-28 07:51:49.083	عبد الحفيظ		3	2025-09-28 07:51:01.795315			184	كهربا 1	f	\N	\N	\N	{"حسام"}	{"حسام"}	manual	60	أسود		f	\N	\N	\N	\N
\.


--
-- Data for Name: time_entries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.time_entries (id, task_id, start_time, end_time, duration, entry_type, created_at) FROM stdin;
219	182	2025-09-21 15:50:50.728	2025-09-21 16:05:50.728	900	work	2025-09-21 13:05:50.800465
129	92	2025-09-13 10:51:51.653	2025-09-13 12:21:51.653	5400	work	2025-09-13 09:21:51.726945
130	93	2025-09-13 12:07:49.239	2025-09-13 12:22:49.239	900	work	2025-09-13 09:22:49.313258
131	94	2025-09-13 10:54:33.184	2025-09-13 12:24:33.184	5400	work	2025-09-13 09:24:33.256777
132	95	2025-09-13 12:11:03.487	2025-09-13 12:26:03.487	900	work	2025-09-13 09:26:03.561465
133	96	2025-09-13 11:43:18.112	2025-09-13 12:28:18.112	2700	work	2025-09-13 09:28:18.187915
134	97	2025-09-13 10:31:18.206	2025-09-13 12:31:18.206	7200	work	2025-09-13 09:31:18.28185
135	98	2025-09-13 12:02:21.477	2025-09-13 12:32:21.477	1800	work	2025-09-13 09:32:21.549856
136	99	2025-09-13 12:21:49.232	2025-09-13 12:36:49.232	900	work	2025-09-13 09:36:49.307067
137	100	2025-09-13 12:10:48.011	2025-09-13 12:40:48.011	1800	work	2025-09-13 09:40:48.088883
138	101	2025-09-13 12:11:25.102	2025-09-13 12:41:25.102	1800	work	2025-09-13 09:41:25.176343
139	102	2025-09-15 09:02:49.209	2025-09-15 10:32:49.209	5400	work	2025-09-15 07:32:49.282927
140	103	2025-09-15 10:06:07.366	2025-09-15 10:36:07.366	1800	work	2025-09-15 07:36:07.437502
141	104	2025-09-15 10:22:40.45	2025-09-15 10:37:40.45	900	work	2025-09-15 07:37:40.521682
142	105	2025-09-15 09:38:31.871	2025-09-15 10:38:31.871	3600	work	2025-09-15 07:38:31.943427
143	106	2025-09-15 10:59:14.063	2025-09-15 11:59:14.063	3600	work	2025-09-15 08:59:14.135289
144	107	2025-09-15 11:45:03.275	2025-09-15 12:00:03.275	900	work	2025-09-15 09:00:03.347291
145	108	2025-09-15 13:44:46.63	2025-09-15 14:12:46.63	1680	work	2025-09-15 11:12:46.701743
146	109	2025-09-16 09:33:01.325	2025-09-16 11:33:01.325	7200	work	2025-09-16 08:33:01.397048
147	110	2025-09-16 10:38:43.009	2025-09-16 11:38:43.009	3600	work	2025-09-16 08:38:43.081172
148	111	2025-09-16 11:09:35.039	2025-09-16 11:39:35.039	1800	work	2025-09-16 08:39:35.11234
149	112	2025-09-16 10:40:25.237	2025-09-16 11:40:25.237	3600	work	2025-09-16 08:40:25.309893
150	113	2025-09-16 11:26:24.927	2025-09-16 11:41:24.927	900	work	2025-09-16 08:41:24.9987
151	114	2025-09-16 11:27:18.757	2025-09-16 11:42:18.757	900	work	2025-09-16 08:42:18.827697
152	115	2025-09-16 11:14:07.577	2025-09-16 11:44:07.577	1800	work	2025-09-16 08:44:07.650467
153	116	2025-09-16 11:15:01.588	2025-09-16 11:45:01.588	1800	work	2025-09-16 08:45:01.660166
154	117	2025-09-16 11:16:06.552	2025-09-16 11:46:06.552	1800	work	2025-09-16 08:46:06.624638
155	118	2025-09-16 11:17:19.447	2025-09-16 11:47:19.447	1800	work	2025-09-16 08:47:19.519397
156	119	2025-09-16 11:33:27.168	2025-09-16 11:48:27.168	900	work	2025-09-16 08:48:27.240636
157	120	2025-09-16 10:50:06.778	2025-09-16 11:50:06.778	3600	work	2025-09-16 08:50:06.848959
158	121	2025-09-16 11:36:19.792	2025-09-16 11:51:19.792	900	work	2025-09-16 08:51:19.867335
160	123	2025-09-16 11:54:29.354	2025-09-16 12:24:29.354	1800	work	2025-09-16 09:24:29.425408
161	124	2025-09-16 12:10:00.022	2025-09-16 12:25:00.022	900	work	2025-09-16 09:25:00.091984
162	125	2025-09-16 12:24:03.514	2025-09-16 12:39:03.514	900	work	2025-09-16 09:39:03.587705
163	126	2025-09-16 12:09:54.908	2025-09-16 12:39:54.908	1800	work	2025-09-16 09:39:54.983079
164	127	2025-09-16 13:29:04.364	2025-09-16 14:29:04.364	3600	work	2025-09-16 11:29:04.43877
165	128	2025-09-17 08:13:59.658	2025-09-17 09:13:59.658	3600	work	2025-09-17 06:13:59.72813
166	129	2025-09-17 07:23:29.561	2025-09-17 09:23:29.561	7200	work	2025-09-17 06:23:29.633082
167	130	2025-09-17 08:56:12.144	2025-09-17 09:26:12.144	1800	work	2025-09-17 06:26:12.215929
169	132	2025-09-17 09:39:46.537	2025-09-17 09:41:49.485	122	work	2025-09-17 06:39:46.90086
170	133	2025-09-17 09:41:43.931	2025-09-17 13:26:58.544	13514	work	2025-09-17 06:41:44.289774
168	131	2025-09-17 09:39:00.295	2025-09-17 13:27:01.26	13680	work	2025-09-17 06:39:00.821035
171	134	2025-09-17 15:12:53.783	2025-09-17 16:12:53.783	3600	work	2025-09-17 13:12:53.857808
172	135	2025-09-17 15:58:45.213	2025-09-17 16:13:45.213	900	work	2025-09-17 13:13:45.286256
173	136	2025-09-17 15:29:35.077	2025-09-17 16:14:35.077	2700	work	2025-09-17 13:14:35.149215
174	137	2025-09-17 15:18:29.418	2025-09-17 16:18:29.418	3600	work	2025-09-17 13:18:29.48972
175	138	2025-09-17 15:49:27.097	2025-09-17 16:19:27.097	1800	work	2025-09-17 13:19:27.172909
176	139	2025-09-17 15:52:30.698	2025-09-17 16:22:30.698	1800	work	2025-09-17 13:22:30.770897
177	140	2025-09-17 16:09:21.407	2025-09-17 16:24:21.407	900	work	2025-09-17 13:24:21.478448
178	141	2025-09-17 16:10:41.422	2025-09-17 16:25:41.422	900	work	2025-09-17 13:25:41.495737
179	142	2025-09-18 09:48:08.394	2025-09-18 11:18:08.394	5400	work	2025-09-18 08:18:08.474359
180	143	2025-09-18 10:18:59.66	2025-09-18 11:18:59.66	3600	work	2025-09-18 08:18:59.730906
181	144	2025-09-18 10:20:02.97	2025-09-18 11:20:02.97	3600	work	2025-09-18 08:20:03.042126
182	145	2025-09-18 10:51:17.428	2025-09-18 11:21:17.428	1800	work	2025-09-18 08:21:17.501871
183	146	2025-09-18 11:07:31.767	2025-09-18 11:22:31.767	900	work	2025-09-18 08:22:31.840305
184	147	2025-09-18 11:08:37.544	2025-09-18 11:23:37.544	900	work	2025-09-18 08:23:37.618863
185	148	2025-09-18 09:24:35.954	2025-09-18 11:24:35.954	7200	work	2025-09-18 08:24:36.029583
186	149	2025-09-18 09:55:46.797	2025-09-18 11:25:46.797	5400	work	2025-09-18 08:25:46.871362
187	150	2025-09-18 10:27:13.889	2025-09-18 11:27:13.889	3600	work	2025-09-18 08:27:13.964043
188	151	2025-09-18 10:27:25.961	2025-09-18 11:27:25.961	3600	work	2025-09-18 08:27:26.035479
190	153	2025-09-18 10:20:16.153	2025-09-18 11:50:16.153	5400	work	2025-09-18 08:50:16.225096
191	154	2025-09-18 11:37:09.739	2025-09-18 11:52:09.739	900	work	2025-09-18 08:52:09.813034
192	155	2025-09-18 10:23:16.945	2025-09-18 11:53:16.945	5400	work	2025-09-18 08:53:17.019959
189	152	2025-09-18 11:45:36.764	2025-09-20 09:16:53.161	163876	work	2025-09-18 08:45:37.377435
193	156	2025-09-20 08:11:30.12	2025-09-20 09:41:30.12	5400	work	2025-09-20 06:41:30.188878
194	157	2025-09-20 09:27:33.937	2025-09-20 09:42:33.937	900	work	2025-09-20 06:42:34.004243
195	158	2025-09-20 09:15:32.788	2025-09-20 09:45:32.788	1800	work	2025-09-20 06:45:32.859131
196	159	2025-09-20 09:31:59.412	2025-09-20 09:46:59.412	900	work	2025-09-20 06:46:59.481974
197	160	2025-09-20 08:18:06.187	2025-09-20 09:48:06.187	5400	work	2025-09-20 06:48:06.25738
198	161	2025-09-20 06:53:06.415	2025-09-20 09:53:06.415	10800	work	2025-09-20 06:53:06.484438
199	162	2025-09-20 06:55:12.321	2025-09-20 09:55:12.321	10800	work	2025-09-20 06:55:12.393293
200	163	2025-09-20 05:57:34.946	2025-09-20 09:57:34.946	14400	work	2025-09-20 06:57:35.01767
201	164	2025-09-20 09:24:04.974	2025-09-20 10:54:04.974	5400	work	2025-09-20 07:54:05.048901
202	165	2025-09-20 07:54:53.613	2025-09-20 10:54:53.613	10800	work	2025-09-20 07:54:53.68743
203	166	2025-09-20 06:01:14.965	2025-09-20 11:01:14.965	18000	work	2025-09-20 08:01:15.03639
204	167	2025-09-20 09:03:11.035	2025-09-20 11:03:11.035	7200	work	2025-09-20 08:03:11.110122
205	168	2025-09-20 10:06:46.609	2025-09-20 11:06:46.609	3600	work	2025-09-20 08:06:46.684944
206	169	2025-09-20 10:38:02.07	2025-09-20 11:08:02.07	1800	work	2025-09-20 08:08:02.144078
207	170	2025-09-20 10:09:13.001	2025-09-20 11:09:13.001	3600	work	2025-09-20 08:09:13.077036
208	171	2025-09-20 08:40:14.46	2025-09-20 11:40:14.46	10800	work	2025-09-20 08:40:14.532419
209	172	2025-09-20 11:26:19.548	2025-09-20 11:41:19.548	900	work	2025-09-20 08:41:19.622979
210	173	2025-09-20 11:27:14.78	2025-09-20 11:42:14.78	900	work	2025-09-20 08:42:14.854018
211	174	2025-09-20 11:28:26.484	2025-09-20 11:43:26.484	900	work	2025-09-20 08:43:26.557817
212	175	2025-09-20 11:32:19.818	2025-09-20 11:47:19.818	900	work	2025-09-20 08:47:19.89136
213	176	2025-09-20 11:33:50.462	2025-09-20 11:48:50.462	900	work	2025-09-20 08:48:50.534991
214	177	2025-09-20 11:20:36.095	2025-09-20 11:50:36.095	1800	work	2025-09-20 08:50:36.168801
215	178	2025-09-20 11:36:43.947	2025-09-20 11:51:43.947	900	work	2025-09-20 08:51:44.021692
216	179	2025-09-20 09:53:06.069	2025-09-20 11:53:06.069	7200	work	2025-09-20 08:53:06.142962
217	180	2025-09-20 11:46:50.421	2025-09-20 12:16:50.421	1800	work	2025-09-20 09:16:50.496572
218	181	2025-09-21 15:33:48.781	2025-09-21 16:03:48.781	1800	work	2025-09-21 13:03:48.853007
220	183	2025-09-21 15:37:03.713	2025-09-21 16:07:03.713	1800	work	2025-09-21 13:07:03.784473
221	184	2025-09-21 14:38:14.548	2025-09-21 16:08:14.548	5400	work	2025-09-21 13:08:14.621052
222	185	2025-09-21 15:09:04.889	2025-09-21 16:09:04.889	3600	work	2025-09-21 13:09:04.96148
223	186	2025-09-21 16:07:04.773	2025-09-21 16:10:04.773	180	work	2025-09-21 13:10:04.845197
224	187	2025-09-21 15:14:40.614	2025-09-21 16:14:40.614	3600	work	2025-09-21 13:14:40.683902
225	188	2025-09-21 16:00:37.081	2025-09-21 16:15:37.081	900	work	2025-09-21 13:15:37.150232
226	189	2025-09-21 16:01:36.829	2025-09-21 16:16:36.829	900	work	2025-09-21 13:16:36.898068
227	190	2025-09-21 16:07:40.761	2025-09-21 16:22:40.761	900	work	2025-09-21 13:22:40.832971
228	191	2025-09-21 15:23:41.677	2025-09-21 16:23:41.677	3600	work	2025-09-21 13:23:41.749011
229	192	2025-09-21 16:09:52.705	2025-09-21 16:24:52.705	900	work	2025-09-21 13:24:52.77611
230	193	2025-09-21 14:55:46.814	2025-09-21 16:25:46.814	5400	work	2025-09-21 13:25:46.883682
231	194	2025-09-22 14:36:19.446	2025-09-22 16:06:19.446	5400	work	2025-09-22 13:06:19.519606
232	195	2025-09-22 15:52:59.193	2025-09-22 16:07:59.193	900	work	2025-09-22 13:07:59.262168
233	196	2025-09-22 15:54:18.234	2025-09-22 16:09:18.234	900	work	2025-09-22 13:09:18.306506
234	197	2025-09-22 15:10:39.491	2025-09-22 16:10:39.491	3600	work	2025-09-22 13:10:39.563298
235	198	2025-09-22 14:11:48.854	2025-09-22 16:11:48.854	7200	work	2025-09-22 13:11:48.923151
236	199	2025-09-22 15:57:57.461	2025-09-22 16:12:57.461	900	work	2025-09-22 13:12:57.534263
237	200	2025-09-22 15:59:37.138	2025-09-22 16:14:37.138	900	work	2025-09-22 13:14:37.209009
238	201	2025-09-22 14:45:43.917	2025-09-22 16:15:43.917	5400	work	2025-09-22 13:15:43.987896
239	202	2025-09-22 16:02:00.832	2025-09-22 16:17:00.832	900	work	2025-09-22 13:17:00.904397
240	203	2025-09-22 16:02:40.24	2025-09-22 16:17:40.24	900	work	2025-09-22 13:17:40.312586
241	204	2025-09-22 16:10:57.057	2025-09-22 16:25:57.057	900	work	2025-09-22 13:25:57.127534
242	205	2025-09-23 15:04:55.837	2025-09-23 15:19:55.837	900	work	2025-09-23 12:19:55.90865
243	206	2025-09-23 14:54:57.275	2025-09-23 15:24:57.275	1800	work	2025-09-23 12:24:57.347283
244	207	2025-09-23 14:56:02.925	2025-09-23 15:26:02.925	1800	work	2025-09-23 12:26:02.996695
245	208	2025-09-23 14:56:59.698	2025-09-23 15:26:59.698	1800	work	2025-09-23 12:26:59.769026
246	209	2025-09-23 14:58:12.122	2025-09-23 15:28:12.122	1800	work	2025-09-23 12:28:12.193674
247	210	2025-09-23 15:13:52.291	2025-09-23 15:28:52.291	900	work	2025-09-23 12:28:52.36236
248	211	2025-09-23 15:01:19.291	2025-09-23 15:31:19.291	1800	work	2025-09-23 12:31:19.363194
249	212	2025-09-23 15:17:45.097	2025-09-23 15:32:45.097	900	work	2025-09-23 12:32:45.169978
250	213	2025-09-23 14:35:10.32	2025-09-23 15:35:10.32	3600	work	2025-09-23 12:35:10.392622
251	214	2025-09-23 15:23:07.252	2025-09-23 15:36:07.252	780	work	2025-09-23 12:36:07.321899
252	215	2025-09-23 15:26:30.977	2025-09-23 15:39:30.977	780	work	2025-09-23 12:39:31.048832
253	216	2025-09-24 11:35:23.061	2025-09-24 11:50:23.061	900	work	2025-09-24 08:50:23.136369
254	217	2025-09-24 06:51:54.385	2025-09-24 11:51:54.385	18000	work	2025-09-24 08:51:54.45723
255	218	2025-09-24 11:22:52.969	2025-09-24 11:52:52.969	1800	work	2025-09-24 08:52:53.043315
256	219	2025-09-24 11:24:39.032	2025-09-24 11:54:39.032	1800	work	2025-09-24 08:54:39.106513
257	220	2025-09-24 11:25:34.923	2025-09-24 11:55:34.923	1800	work	2025-09-24 08:55:34.997746
258	221	2025-09-24 10:26:40.369	2025-09-24 11:56:40.369	5400	work	2025-09-24 08:56:40.444099
259	222	2025-09-24 11:27:52.023	2025-09-24 11:57:52.023	1800	work	2025-09-24 08:57:52.094726
260	223	2025-09-24 11:29:45.328	2025-09-24 11:59:45.328	1800	work	2025-09-24 08:59:45.400771
261	224	2025-09-24 11:45:44.187	2025-09-24 12:00:44.187	900	work	2025-09-24 09:00:44.260166
262	225	2025-09-24 10:32:15.173	2025-09-24 12:02:15.173	5400	work	2025-09-24 09:02:15.246247
263	226	2025-09-24 09:03:15.303	2025-09-24 12:03:15.303	10800	work	2025-09-24 09:03:15.375731
264	227	2025-09-24 11:04:18.682	2025-09-24 12:04:18.682	3600	work	2025-09-24 09:04:18.755393
265	228	2025-09-24 11:07:21.462	2025-09-24 12:07:21.462	3600	work	2025-09-24 09:07:21.533788
266	229	2025-09-24 11:54:18.398	2025-09-24 12:09:18.398	900	work	2025-09-24 09:09:18.470509
267	230	2025-09-24 11:09:59.273	2025-09-24 12:09:59.273	3600	work	2025-09-24 09:09:59.344083
268	231	2025-09-24 11:12:05.706	2025-09-24 12:12:05.706	3600	work	2025-09-24 09:12:05.779605
269	232	2025-09-24 12:18:28.336	2025-09-24 12:48:28.336	1800	work	2025-09-24 09:48:28.411255
270	233	2025-09-24 09:50:05.101	2025-09-24 12:50:05.101	10800	work	2025-09-24 09:50:05.177525
271	234	2025-09-24 10:52:37.214	2025-09-24 12:52:37.214	7200	work	2025-09-24 09:52:37.289266
272	235	2025-09-24 10:53:26.816	2025-09-24 12:53:26.816	7200	work	2025-09-24 09:53:26.890115
273	236	2025-09-24 10:54:06.481	2025-09-24 12:54:06.481	7200	work	2025-09-24 09:54:06.556363
274	237	2025-09-24 11:54:51.6	2025-09-24 12:54:51.6	3600	work	2025-09-24 09:54:51.672255
275	238	2025-09-24 11:55:49.031	2025-09-24 12:55:49.031	3600	work	2025-09-24 09:55:49.105297
276	239	2025-09-24 12:47:44.99	2025-09-24 13:02:44.99	900	work	2025-09-24 10:02:45.063197
277	240	2025-09-24 12:33:26.505	2025-09-24 13:03:26.505	1800	work	2025-09-24 10:03:26.581497
278	241	2025-09-24 12:34:18.941	2025-09-24 13:04:18.941	1800	work	2025-09-24 10:04:19.016469
279	242	2025-09-24 11:34:58.315	2025-09-24 13:04:58.315	5400	work	2025-09-24 10:04:58.38836
280	243	2025-09-24 12:05:44.355	2025-09-24 13:05:44.355	3600	work	2025-09-24 10:05:44.428717
281	244	2025-09-24 12:36:27.646	2025-09-24 13:06:27.646	1800	work	2025-09-24 10:06:27.718959
282	245	2025-09-24 13:43:49.04	2025-09-24 14:43:49.04	3600	work	2025-09-24 11:43:49.115937
283	246	2025-09-24 14:29:33.251	2025-09-24 14:44:33.251	900	work	2025-09-24 11:44:33.325736
284	247	2025-09-24 14:30:07.838	2025-09-24 14:45:07.838	900	work	2025-09-24 11:45:07.914759
285	248	2025-09-24 13:45:41.92	2025-09-24 14:45:41.92	3600	work	2025-09-24 11:45:41.996364
286	249	2025-09-25 08:27:28.718	2025-09-25 11:27:28.718	10800	work	2025-09-25 08:27:28.8029
287	250	2025-09-25 09:58:09.767	2025-09-25 11:28:09.767	5400	work	2025-09-25 08:28:09.842211
288	251	2025-09-25 04:29:26.937	2025-09-25 11:29:26.937	25200	work	2025-09-25 08:29:27.01216
289	252	2025-09-25 11:15:45.316	2025-09-25 11:30:45.316	900	work	2025-09-25 08:30:45.391198
290	253	2025-09-25 09:31:21.851	2025-09-25 11:31:21.851	7200	work	2025-09-25 08:31:21.925228
291	254	2025-09-25 11:17:12.93	2025-09-25 11:32:12.93	900	work	2025-09-25 08:32:13.002873
292	255	2025-09-25 11:20:14.257	2025-09-25 11:35:14.257	900	work	2025-09-25 08:35:14.327135
293	256	2025-09-25 11:21:04.518	2025-09-25 11:36:04.518	900	work	2025-09-25 08:36:04.591468
294	257	2025-09-25 12:05:49.75	2025-09-25 12:05:49.75	0	work	2025-09-25 09:05:49.822382
295	258	2025-09-25 11:51:19.959	2025-09-25 12:06:19.959	900	work	2025-09-25 09:06:20.029962
296	259	2025-09-25 11:52:13.11	2025-09-25 12:07:13.11	900	work	2025-09-25 09:07:13.182777
297	260	2025-09-25 11:53:24.667	2025-09-25 12:08:24.667	900	work	2025-09-25 09:08:24.737174
298	261	2025-09-25 11:54:03.051	2025-09-25 12:09:03.051	900	work	2025-09-25 09:09:03.124245
299	262	2025-09-25 11:55:29.971	2025-09-25 12:10:29.971	900	work	2025-09-25 09:10:30.039445
300	263	2025-09-25 11:43:05.122	2025-09-25 12:12:05.122	1740	work	2025-09-25 09:12:05.194541
301	264	2025-09-25 11:57:49.367	2025-09-25 12:12:49.367	900	work	2025-09-25 09:12:49.440046
302	265	2025-09-25 11:18:03.833	2025-09-25 12:14:03.833	3360	work	2025-09-25 09:14:03.905659
303	266	2025-09-25 11:45:37.54	2025-09-25 12:15:37.54	1800	work	2025-09-25 09:15:37.612599
304	267	2025-09-25 11:16:16.809	2025-09-25 12:16:16.809	3600	work	2025-09-25 09:16:16.879931
305	268	2025-09-25 12:01:48.993	2025-09-25 12:16:48.993	900	work	2025-09-25 09:16:49.062842
306	269	2025-09-25 12:02:23.269	2025-09-25 12:17:23.269	900	work	2025-09-25 09:17:23.339192
307	270	2025-09-25 12:46:10.016	2025-09-25 13:01:10.016	900	work	2025-09-25 10:01:10.089958
308	271	2025-09-25 12:01:54.673	2025-09-25 13:01:54.673	3600	work	2025-09-25 10:01:54.746091
309	272	2025-09-27 10:09:52.379	2025-09-27 11:25:02.854	4510	work	2025-09-27 07:09:52.846395
310	273	2025-09-27 10:58:32.001	2025-09-27 11:25:34.434	1622	work	2025-09-27 07:58:32.475668
311	273	2025-09-27 13:24:50.031	2025-09-27 15:20:54.118	6964	work	2025-09-27 10:24:50.54714
312	274	2025-09-27 14:51:49.088	2025-09-27 15:21:49.088	1800	work	2025-09-27 12:21:49.258646
313	275	2025-09-27 15:47:37.039	2025-09-27 15:47:42.124	5	work	2025-09-27 12:47:37.547945
314	275	2025-09-27 15:58:17.247	2025-09-27 16:05:25.517	428	work	2025-09-27 12:58:17.724844
316	277	2025-09-28 09:38:09.916	2025-09-28 10:38:09.916	3600	work	2025-09-28 07:38:09.990867
317	278	2025-09-28 10:29:08.767	2025-09-28 10:44:08.767	900	work	2025-09-28 07:44:08.84191
318	279	2025-09-28 10:29:55.315	2025-09-28 10:44:55.315	900	work	2025-09-28 07:44:55.389924
319	280	2025-09-28 10:51:01.866	2025-09-28 10:51:37.397	35	work	2025-09-28 07:51:02.227017
315	276	2025-09-28 10:18:55.035	2025-09-28 10:52:46.285	2031	work	2025-09-28 07:18:55.501134
320	281	2025-09-28 11:35:30.225	\N	\N	work	2025-09-28 08:35:30.590624
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, role, permissions, created_at, updated_at) FROM stdin;
5	روان	bd068ad9dd6872ecaf702f64a6e7e0c6beb61a7cd11b85716ae4832084d26dd97887001104e67cf71a58ba959d2dcd15e047d47336f98b3b8373155d262e4057.db9ce8e0b86c45255455cd1c4dbc6592	supervisor	{dashboard:read,timers:read,tasks:read,tasks:create,archive:read,customers:read,parts:read,parts:create}	2025-07-12 08:58:40.025489	2025-07-12 08:58:40.025489
7	الاستقبال	913a232c837f27898c31a0414a04ebf0a5e362b05e29e8ae28edc95fa0616caee900cd137e76df2037ddc0390fd4a66b0fb7544f9aec2587bcc1c2fee4982f59.171da1717145016ec3c2bc92ddff47ff	reception	{timers:read,tasks:read,parts:read,receipts:read,receipts:write,receipts:create,customers:read,customers:write,customers:create}	2025-07-23 06:56:53.200562	2025-07-23 06:56:53.200562
4	هبة	12c2ec64d784efbbe62529459bb0eb0708e2f6fd7fa3c856ab3bc77bd09b945d8eae095ac01961c97a10581d80de66a016a3230c6e3b5966cf0459c331c9507e.4c11a824da8a9688077b58a913c93bb8	viewer	{dashboard:read,timers:read,tasks:read,customers:read,parts:read,parts:approve,parts:reject}	2025-07-12 08:29:34.446517	2025-07-12 08:29:34.446517
3	بدوي	fc392475b3ea4dadc9870ea2e631d35f3cbf57ca377fa7d1df362d21d7918a8ea8673e6e1145d8bd650d58c266488cfb8211a2432b85e7fe57ad3ecb0354371b.e9380b56a263ab5f970d0fc77205bba7	operator	{dashboard:read,timers:read,timers:write,tasks:read,tasks:write,archive:read,customers:read,customers:write,parts:read,parts:create}	2025-07-12 08:23:12.129356	2025-07-12 08:23:12.129356
8	ملك	e1bdd5f91d1180490bbbfce1e40c54c2d029aac663b2f8f40b717fc57923ab5824faf5cc16b2a7d7e6dcd40a941f862c3cf301e5f1b84f35bdd312839b627a5f.575b03c0af0313b7b75651e3472c7c8e		{}	2025-09-02 10:57:05.75768	2025-09-02 10:57:05.75768
6	فارس	7cf30e38840d360085730077714fc1e8ab8f5b0418f16c047a6ffd3f953ca1263708b35978788bb6071d7f0f88eb0ea65dba8a5e6fd1a09833087dd78d5a2b00.72610d95f0a2963e6e5e95ea01e2e0c9	admin	{dashboard:read,dashboard:write,timers:read,timers:write,tasks:read,tasks:write,tasks:create,tasks:edit,tasks:delete,archive:read,archive:write,customers:read,customers:write,customers:create,customers:edit,customers:delete,parts:read,parts:write,parts:create,parts:approve,parts:reject,workers:read,workers:write,workers:create,workers:edit,workers:delete}	2025-07-23 06:44:49.030055	2025-07-23 06:44:49.030055
\.


--
-- Data for Name: workers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.workers (id, name, category, supervisor, assistant, engineer, national_id, phone_number, address, is_active, is_predefined, created_at) FROM stdin;
35	حسام	technician	\N	\N	\N	\N	\N	\N	t	f	2025-08-16 07:55:12.964004
37	محمد العلي	technician	\N	\N	\N	\N	\N	\N	t	f	2025-08-16 07:55:12.964004
40	زياد	technician	\N	\N	\N	\N	\N	\N	t	f	2025-08-16 07:55:12.964004
42	عبد الحفيظ	technician	\N	\N	\N	\N	\N	\N	t	f	2025-08-16 07:55:12.964004
43	مصطفى	technician	\N	\N	\N	\N	\N	\N	t	f	2025-08-16 07:55:12.964004
34	خالد	technician	\N	\N	\N	\N	\N	\N	t	f	2025-08-16 07:55:12.964004
36	حكيم	technician	\N	\N	\N	\N	\N	\N	t	f	2025-08-16 07:55:12.964004
39	عامر	technician	\N	\N	\N	\N	\N	\N	t	f	2025-08-16 07:55:12.964004
41	علي	technician	\N	\N	\N	\N	\N	\N	t	f	2025-08-16 07:55:12.964004
45	بدوي	technician	\N	\N	\N	\N	\N	\N	t	f	2025-09-01 12:44:07.20983
44	سليمان	technician	\N	\N	\N	\N	\N	\N	f	f	2025-08-20 10:35:20.045192
46	نواف	technician	\N	\N	\N	\N	\N	\N	t	f	2025-09-13 10:36:20.853407
47	أنس	technician	\N	\N	\N	\N	\N	\N	t	f	2025-09-25 08:48:25.451887
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: neondb_owner
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, false);


--
-- Name: car_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.car_status_id_seq', 31, true);


--
-- Name: customer_cars_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.customer_cars_id_seq', 3965, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.customers_id_seq', 3958, true);


--
-- Name: maintenance_guides_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.maintenance_guides_id_seq', 1, true);


--
-- Name: parts_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.parts_requests_id_seq', 154, true);


--
-- Name: reception_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.reception_entries_id_seq', 18, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.tasks_id_seq', 281, true);


--
-- Name: time_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.time_entries_id_seq', 320, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- Name: workers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.workers_id_seq', 47, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: neondb_owner
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


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
-- Name: maintenance_guides maintenance_guides_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maintenance_guides
    ADD CONSTRAINT maintenance_guides_pkey PRIMARY KEY (id);


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

