--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AuthorityType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AuthorityType" AS ENUM (
    'WEB',
    'MOBILE'
);


ALTER TYPE public."AuthorityType" OWNER TO postgres;

--
-- Name: InvoiceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InvoiceType" AS ENUM (
    'SALE',
    'RETURN',
    'EXCHANGE'
);


ALTER TYPE public."InvoiceType" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'CARD',
    'CREDIT'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: SalesmanStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SalesmanStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'BLOCKED'
);


ALTER TYPE public."SalesmanStatus" OWNER TO postgres;

--
-- Name: UnitType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UnitType" AS ENUM (
    'PIECE',
    'BOX',
    'CARTON'
);


ALTER TYPE public."UnitType" OWNER TO postgres;

--
-- Name: VisitStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VisitStatus" AS ENUM (
    'START',
    'END',
    'WAIT',
    'CANCEL'
);


ALTER TYPE public."VisitStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: InvoiceHeader; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InvoiceHeader" (
    "invId" text NOT NULL,
    "custId" integer NOT NULL,
    "salesId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    currency text NOT NULL,
    "disAmt" double precision NOT NULL,
    "invRef" text NOT NULL,
    "invType" public."InvoiceType" NOT NULL,
    "journeyId" integer NOT NULL,
    "netAmt" double precision NOT NULL,
    "paymentMethod" public."PaymentMethod" NOT NULL,
    "reasonId" integer,
    "taxAmt" double precision NOT NULL,
    "totalAmt" double precision NOT NULL,
    "visitId" integer NOT NULL
);


ALTER TABLE public."InvoiceHeader" OWNER TO postgres;

--
-- Name: InvoiceItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."InvoiceItem" (
    qty integer NOT NULL,
    "disAmt" double precision NOT NULL,
    "invoiceHeaderId" text NOT NULL,
    "netAmt" double precision NOT NULL,
    "productId" integer NOT NULL,
    "productUom" text NOT NULL,
    "reasonId" integer,
    "taxAmt" double precision NOT NULL,
    "totAmt" double precision NOT NULL,
    "invItem" integer NOT NULL
);


ALTER TABLE public."InvoiceItem" OWNER TO postgres;

--
-- Name: Journies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Journies" (
    "salesId" integer NOT NULL,
    "startJourney" timestamp(3) without time zone,
    "endJourney" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "journeyId" integer NOT NULL
);


ALTER TABLE public."Journies" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    name text NOT NULL,
    category text NOT NULL,
    stock integer NOT NULL,
    "nonSellableQty" integer NOT NULL,
    "baseUom" text NOT NULL,
    "prodId" integer NOT NULL,
    "basePrice" double precision NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: Product_prodId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Product_prodId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Product_prodId_seq" OWNER TO postgres;

--
-- Name: Product_prodId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Product_prodId_seq" OWNED BY public."Product"."prodId";


--
-- Name: Reasons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Reasons" (
    description text NOT NULL,
    sellable boolean NOT NULL,
    "isHeader" boolean NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "reasonId" integer NOT NULL
);


ALTER TABLE public."Reasons" OWNER TO postgres;

--
-- Name: Reasons_reasonId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Reasons_reasonId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Reasons_reasonId_seq" OWNER TO postgres;

--
-- Name: Reasons_reasonId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Reasons_reasonId_seq" OWNED BY public."Reasons"."reasonId";


--
-- Name: Salesman; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Salesman" (
    name text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    status public."SalesmanStatus" DEFAULT 'INACTIVE'::public."SalesmanStatus" NOT NULL,
    password text NOT NULL,
    "deviceId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isInitial" boolean DEFAULT true NOT NULL,
    available boolean DEFAULT true NOT NULL,
    "lastJourneyId" integer DEFAULT 0 NOT NULL,
    "salesId" integer NOT NULL
);


ALTER TABLE public."Salesman" OWNER TO postgres;

--
-- Name: Salesman_salesId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Salesman_salesId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Salesman_salesId_seq" OWNER TO postgres;

--
-- Name: Salesman_salesId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Salesman_salesId_seq" OWNED BY public."Salesman"."salesId";


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: action_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.action_details (
    id integer NOT NULL,
    "journeyId" integer NOT NULL,
    "visitId" integer NOT NULL,
    "salesId" integer NOT NULL,
    "actionId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.action_details OWNER TO postgres;

--
-- Name: actions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actions (
    "actionId" integer NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.actions OWNER TO postgres;

--
-- Name: actions_actionId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."actions_actionId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."actions_actionId_seq" OWNER TO postgres;

--
-- Name: actions_actionId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."actions_actionId_seq" OWNED BY public.actions."actionId";


--
-- Name: authorities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authorities (
    name text NOT NULL,
    type public."AuthorityType" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "authorityId" integer NOT NULL
);


ALTER TABLE public.authorities OWNER TO postgres;

--
-- Name: authorities_authorityId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."authorities_authorityId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."authorities_authorityId_seq" OWNER TO postgres;

--
-- Name: authorities_authorityId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."authorities_authorityId_seq" OWNED BY public.authorities."authorityId";


--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    name text NOT NULL,
    industry text,
    address text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    phone text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "customerId" integer NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: customers_customerId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."customers_customerId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."customers_customerId_seq" OWNER TO postgres;

--
-- Name: customers_customerId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."customers_customerId_seq" OWNED BY public.customers."customerId";


--
-- Name: prod_uom; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prod_uom (
    uom character varying(3) NOT NULL,
    "uomName" text NOT NULL,
    barcode text NOT NULL,
    num integer NOT NULL,
    denum integer NOT NULL,
    "prodId" integer NOT NULL
);


ALTER TABLE public.prod_uom OWNER TO postgres;

--
-- Name: salesman_authorities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salesman_authorities (
    id integer NOT NULL,
    "salesmanId" integer NOT NULL,
    "authorityId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    value boolean DEFAULT true NOT NULL
);


ALTER TABLE public.salesman_authorities OWNER TO postgres;

--
-- Name: salesman_authorities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.salesman_authorities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.salesman_authorities_id_seq OWNER TO postgres;

--
-- Name: salesman_authorities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salesman_authorities_id_seq OWNED BY public.salesman_authorities.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    "settingId" integer NOT NULL,
    name text NOT NULL,
    value boolean DEFAULT false NOT NULL,
    "textValue" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: settings_settingId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."settings_settingId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."settings_settingId_seq" OWNER TO postgres;

--
-- Name: settings_settingId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."settings_settingId_seq" OWNED BY public.settings."settingId";


--
-- Name: visits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visits (
    "custId" integer NOT NULL,
    "salesId" integer NOT NULL,
    "startTime" timestamp(3) without time zone,
    "endTime" timestamp(3) without time zone,
    "cancelTime" timestamp(3) without time zone,
    status public."VisitStatus" DEFAULT 'WAIT'::public."VisitStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "journeyId" integer NOT NULL,
    "visitId" integer NOT NULL
);


ALTER TABLE public.visits OWNER TO postgres;

--
-- Name: visits_visitId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."visits_visitId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."visits_visitId_seq" OWNER TO postgres;

--
-- Name: visits_visitId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."visits_visitId_seq" OWNED BY public.visits."visitId";


--
-- Name: Product prodId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product" ALTER COLUMN "prodId" SET DEFAULT nextval('public."Product_prodId_seq"'::regclass);


--
-- Name: Reasons reasonId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reasons" ALTER COLUMN "reasonId" SET DEFAULT nextval('public."Reasons_reasonId_seq"'::regclass);


--
-- Name: Salesman salesId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Salesman" ALTER COLUMN "salesId" SET DEFAULT nextval('public."Salesman_salesId_seq"'::regclass);


--
-- Name: actions actionId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actions ALTER COLUMN "actionId" SET DEFAULT nextval('public."actions_actionId_seq"'::regclass);


--
-- Name: authorities authorityId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authorities ALTER COLUMN "authorityId" SET DEFAULT nextval('public."authorities_authorityId_seq"'::regclass);


--
-- Name: customers customerId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN "customerId" SET DEFAULT nextval('public."customers_customerId_seq"'::regclass);


--
-- Name: salesman_authorities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salesman_authorities ALTER COLUMN id SET DEFAULT nextval('public.salesman_authorities_id_seq'::regclass);


--
-- Name: settings settingId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN "settingId" SET DEFAULT nextval('public."settings_settingId_seq"'::regclass);


--
-- Name: visits visitId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visits ALTER COLUMN "visitId" SET DEFAULT nextval('public."visits_visitId_seq"'::regclass);


--
-- Data for Name: InvoiceHeader; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InvoiceHeader" ("invId", "custId", "salesId", "createdAt", "updatedAt", currency, "disAmt", "invRef", "invType", "journeyId", "netAmt", "paymentMethod", "reasonId", "taxAmt", "totalAmt", "visitId") FROM stdin;
0000100004	3	1000001	2025-10-16 08:18:50.65	2025-10-16 07:18:50.519	EGP	0	0	SALE	1	1500	CASH	\N	0	1500	19
0000100005	3	1000001	2025-10-16 08:27:31.795	2025-10-16 07:27:31.671	EGP	0	0000100004	RETURN	1	1500	CASH	6	0	1500	19
0000100006	3	1000001	2025-10-16 08:41:16.163	2025-10-16 07:41:16.093	EGP	0	0000100001	RETURN	1	12	CASH	\N	0	12	19
0000100007	3	1000001	2025-10-16 09:08:15.737	2025-10-16 08:08:16.433	EGP	0	0	SALE	2	27	CASH	\N	0	27	22
0000100008	3	1000001	2025-10-16 09:08:39.569	2025-10-16 08:08:39.398	EGP	0	0000100007	RETURN	2	27	CASH	12	0	27	22
0000100009	2	1000001	2025-10-16 09:09:08.104	2025-10-16 08:09:07.879	EGP	0	0	SALE	2	18	CASH	\N	0	18	23
0000100010	2	1000001	2025-10-16 09:09:20.717	2025-10-16 08:09:20.575	EGP	0	0000100009	RETURN	2	18	CASH	\N	0	18	23
0000100011	3	1000001	2025-10-16 09:20:58.206	2025-10-16 08:20:58	EGP	0	0	SALE	3	39	CASH	\N	0	39	25
0000100012	2	1000001	2025-10-16 09:21:18.053	2025-10-16 08:21:19.867	EGP	0	0	SALE	3	12	CASH	\N	0	12	26
0000100013	2	1000001	2025-10-16 09:21:27.214	2025-10-16 08:21:27.979	EGP	0	0000100012	RETURN	3	12	CASH	12	0	12	26
0000100014	3	1000001	2025-10-16 09:25:16.823	2025-10-16 08:25:18.542	EGP	0	0	SALE	4	12	CASH	\N	0	12	28
0000100015	1	1000001	2025-10-16 09:27:41.469	2025-10-16 08:27:41.261	EGP	0	0	SALE	4	12	CASH	\N	0	12	30
0000100016	3	1000001	2025-10-16 09:29:50.619	2025-10-16 08:29:56.676	EGP	0	0	SALE	5	12	CASH	\N	0	12	31
0000100017	3	1000001	2025-10-16 09:30:39.396	2025-10-16 08:30:50.503	EGP	0	0	SALE	5	12	CASH	\N	0	12	31
0000100018	3	1000001	2025-10-16 09:37:36.969	2025-10-16 08:37:36.742	EGP	0	0	SALE	6	12	CASH	\N	0	12	34
0000100019	3	1000001	2025-10-16 09:38:08.569	2025-10-16 08:38:08.367	EGP	0	0	SALE	6	12	CASH	\N	0	12	34
0000100020	2	1000001	2025-10-16 09:38:33.278	2025-10-16 08:38:38.972	EGP	0	0	SALE	6	12	CASH	\N	0	12	35
0000100021	1	1000001	2025-10-16 09:40:05.239	2025-10-16 08:40:05.178	EGP	0	0	SALE	6	12	CASH	\N	0	12	36
0000100022	2	1000001	2025-10-16 09:50:23.003	2025-10-16 08:50:22.8	EGP	0	0	SALE	7	12	CASH	\N	0	12	38
0000100023	2	1000001	2025-10-16 09:50:40.041	2025-10-16 08:50:39.895	EGP	0	0000100022	RETURN	7	12	CASH	12	0	12	38
0000100024	1	1000001	2025-10-16 09:51:02.111	2025-10-16 08:51:01.832	EGP	0	0	SALE	7	37	CASH	\N	0	37	39
0000100025	3	1000001	2025-10-16 10:06:34.54	2025-10-16 09:06:36.31	EGP	0	0	SALE	7	12	CASH	\N	0	12	37
0000100026	3	1000001	2025-10-16 10:10:32.423	2025-10-16 09:10:32.113	EGP	0	0	SALE	8	12	CASH	\N	0	12	40
0000100027	3	1000001	2025-10-16 10:17:56.632	2025-10-16 09:17:56.329	EGP	0	0	SALE	9	12	CASH	\N	0	12	43
0000100028	3	1000001	2025-10-16 10:20:37.036	2025-10-16 09:20:36.708	EGP	0	0	SALE	10	24	CASH	\N	0	24	46
0000100029	3	1000001	2025-10-16 10:23:56.378	2025-10-16 09:23:58.457	EGP	0	0	SALE	11	12	CASH	\N	0	12	49
0000100030	3	1000001	2025-10-16 10:26:03.694	2025-10-16 09:26:10.882	EGP	0	0	SALE	12	27	CASH	\N	0	27	52
0000100031	3	1000001	2025-10-16 10:26:27.644	2025-10-16 09:26:32.793	EGP	0	0000100030	RETURN	12	27	CASH	12	0	27	52
0000100032	3	1000001	2025-10-16 11:58:08.765	2025-10-16 10:58:08.096	EGP	0	0	SALE	14	48	CASH	\N	0	48	58
0000100033	3	1000001	2025-10-16 11:58:30.086	2025-10-16 10:58:29.521	EGP	0	0000100032	RETURN	14	48	CASH	\N	0	48	58
0000100034	3	1000001	2025-10-16 11:59:08.034	2025-10-16 10:59:07.273	EGP	0	0	SALE	14	12	CASH	\N	0	12	58
0000300001	3	1000003	2025-10-16 12:03:49.405	2025-10-16 11:03:48.953	EGP	0	0	SALE	1	74	CASH	\N	0	74	61
0000300002	3	1000003	2025-10-16 12:04:17.69	2025-10-16 11:04:16.927	EGP	0	0000300001	RETURN	1	74	CASH	12	0	74	61
0000300003	1	1000003	2025-10-16 12:04:57.773	2025-10-16 11:04:57.012	EGP	0	0	SALE	1	27	CASH	\N	0	27	63
0000300004	1	1000003	2025-10-16 12:05:12.997	2025-10-16 11:05:12.236	EGP	0	0000300003	RETURN	1	15	CASH	\N	0	15	63
0000300005	3	1000003	2025-10-16 12:36:27	2025-10-16 11:37:59.126	EGP	0	0	SALE	2	12	CASH	\N	0	12	64
0000300006	3	1000003	2025-10-16 12:40:26.401	2025-10-16 11:40:24.782	EGP	0	0	SALE	3	12	CASH	\N	0	12	67
0000300007	3	1000003	2025-10-16 13:00:17.067	2025-10-16 12:00:15.413	EGP	0	0	SALE	3	27	CASH	\N	0	27	67
0000300008	3	1000003	2025-10-19 07:32:55.195	2025-10-19 06:32:55.858	EGP	0	0	SALE	6	48	CASH	\N	0	48	76
0000300009	3	1000003	2025-10-19 07:34:40.002	2025-10-19 06:34:41.503	EGP	0	0000300008	RETURN	6	48	CASH	10	0	48	76
0000300010	2	1000003	2025-10-19 07:35:21.277	2025-10-19 06:35:20.93	EGP	0	0	SALE	6	67	CASH	\N	0	67	77
0000300011	2	1000003	2025-10-19 07:35:42.676	2025-10-19 06:35:42.283	EGP	0	0000300010	RETURN	6	12	CASH	\N	0	12	77
0000200001	3	1000002	2025-10-19 07:43:31	2025-10-19 06:43:59.058	EGP	0	0	SALE	1	54	CASH	\N	0	54	79
0000200002	3	1000002	2025-10-19 07:45:27	2025-10-19 06:46:34.538	EGP	0	0000200001	RETURN	1	12	CASH	\N	0	12	79
0000200003	1	1000002	2025-10-19 08:06:15.672	2025-10-19 07:06:15.746	EGP	0	0	SALE	2	27	CASH	\N	0	27	87
0000200004	1	1000002	2025-10-19 08:06:30.496	2025-10-19 07:06:30.582	EGP	0	0000200003	RETURN	2	12	CASH	\N	0	12	87
0000300012	3	1000003	2025-10-19 08:53:40.448	2025-10-19 07:53:39.785	EGP	0	0	SALE	8	27	CASH	\N	0	27	88
0000300013	1	1000003	2025-10-19 08:54:20.767	2025-10-19 07:54:20.078	EGP	0	0	SALE	8	24	CASH	\N	0	24	90
0000300014	3	1000003	2025-10-19 08:55:31.112	2025-10-19 07:55:30.671	EGP	0	0	SALE	9	15	CASH	\N	0	15	91
0000300015	2	1000003	2025-10-19 08:56:00.183	2025-10-19 07:55:59.564	EGP	0	0	SALE	9	12	CASH	\N	0	12	92
0000300016	2	1000003	2025-10-19 08:56:10.058	2025-10-19 07:56:09.355	EGP	0	0000300015	RETURN	9	12	CASH	\N	0	12	92
0000200005	3	1000002	2025-10-19 09:53:53	2025-10-19 08:54:51.318	EGP	0	0	SALE	3	408	CASH	\N	0	408	94
0000200006	3	1000002	2025-10-19 09:54:32	2025-10-19 08:54:51.33	EGP	0	0	SALE	3	100	CASH	\N	0	100	94
0000200007	2	1000002	2025-10-19 10:04:25	2025-10-19 09:05:35.114	EGP	0	0	SALE	4	208	CASH	\N	0	208	98
0000200008	2	1000002	2025-10-19 10:04:48	2025-10-19 09:05:35.131	EGP	0	0000200007	RETURN	4	77	CASH	\N	0	77	98
0000200009	3	1000002	2025-10-19 10:07:46.033	2025-10-19 09:07:46.119	EGP	0	0	SALE	5	24	CASH	\N	0	24	100
0000200010	3	1000002	2025-10-19 10:08:07.664	2025-10-19 09:08:07.577	EGP	0	0000200009	RETURN	5	24	CASH	12	0	24	100
0000200011	1	1000002	2025-10-19 10:31:30.929	2025-10-19 09:31:30.868	EGP	0	0	SALE	7	1753.5	CASH	\N	0	1753.5	108
0000200012	1	1000002	2025-10-19 10:32:50.288	2025-10-19 09:32:50.376	EGP	0	0000200011	RETURN	7	25.5	CASH	\N	0	25.5	108
0000200013	1	1000002	2025-10-19 10:33:21.383	2025-10-19 09:33:21.234	EGP	0	0000200011	RETURN	7	576	CASH	\N	0	576	108
0000200014	3	1000002	2025-10-19 10:39:33.138	2025-10-19 09:39:32.962	EGP	0	0	SALE	8	24	CASH	\N	0	24	109
0000200015	3	1000002	2025-10-19 11:50:23.327	2025-10-19 10:50:23.205	EGP	0	0	SALE	10	24	CASH	\N	0	24	115
0000200016	1	1000002	2025-10-19 11:53:11.892	2025-10-19 10:53:12.116	EGP	0	0	SALE	10	54	CASH	\N	0	54	117
0000200017	1	1000002	2025-10-19 11:53:28.861	2025-10-19 10:53:28.764	EGP	0	0000200016	RETURN	10	12	CASH	\N	0	12	117
0000300017	15	1000003	2025-10-20 07:40:32.068	2025-10-20 06:40:32.449	EGP	0	0	SALE	11	48	CASH	\N	0	48	126
0000300018	18	1000003	2025-10-20 08:50:14.741	2025-10-20 07:50:14.731	EGP	0	0	SALE	14	54	CASH	\N	0	54	138
0000300019	18	1000003	2025-10-20 08:50:28.896	2025-10-20 07:50:28.513	EGP	0	0000300018	RETURN	14	15	CASH	\N	0	15	138
0000300020	14	1000003	2025-10-20 08:51:20.249	2025-10-20 07:51:19.853	EGP	0	0	SALE	14	798	CASH	\N	0	798	142
\.


--
-- Data for Name: InvoiceItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."InvoiceItem" (qty, "disAmt", "invoiceHeaderId", "netAmt", "productId", "productUom", "reasonId", "taxAmt", "totAmt", "invItem") FROM stdin;
1	0	0000000001	288	1	BOX	\N	0	288	1
1	0	0000000001	15	2	PCE	\N	0	15	2
1	0	0000000002	288	1	BOX	\N	0	288	1
1	0	0000000002	15	2	PCE	\N	0	15	2
1	0	0000000003	12	1	PCE	\N	0	12	1
1	0	0000000004	12	1	PCE	\N	0	12	1
5	0	0000100004	1500	5	CTN	\N	0	1500	1
5	0	0000100005	1500	5	CTN	\N	0	1500	1
1	0	0000100006	12	1	PCE	3	0	12	1
1	0	0000100007	12	1	PCE	\N	0	12	1
1	0	0000100007	15	2	PCE	\N	0	15	2
1	0	0000100008	12	1	PCE	\N	0	12	1
1	0	0000100008	15	2	PCE	\N	0	15	2
1	0	0000100009	18	9	BOX	\N	0	18	1
1	0	0000100010	18	9	BOX	5	0	18	1
2	0	0000100011	24	1	PCE	\N	0	24	1
1	0	0000100011	15	2	PCE	\N	0	15	2
1	0	0000100012	12	1	PCE	\N	0	12	1
1	0	0000100013	12	1	PCE	\N	0	12	1
1	0	0000100014	12	1	PCE	\N	0	12	1
1	0	0000100015	12	1	PCE	\N	0	12	1
1	0	0000100016	12	1	PCE	\N	0	12	1
1	0	0000100017	12	1	PCE	\N	0	12	1
1	0	0000100018	12	1	PCE	\N	0	12	1
1	0	0000100019	12	1	PCE	\N	0	12	1
1	0	0000100020	12	1	PCE	\N	0	12	1
1	0	0000100021	12	1	PCE	\N	0	12	1
1	0	0000100022	12	1	PCE	\N	0	12	1
1	0	0000100023	12	1	PCE	\N	0	12	1
1	0	0000100024	12	1	PCE	\N	0	12	1
1	0	0000100024	25	3	LTR	\N	0	25	2
1	0	0000100025	12	1	PCE	\N	0	12	1
1	0	0000100026	12	1	PCE	\N	0	12	1
1	0	0000100027	12	1	PCE	\N	0	12	1
2	0	0000100028	24	1	PCE	\N	0	24	1
1	0	0000100029	12	1	PCE	\N	0	12	1
1	0	0000100030	12	1	PCE	\N	0	12	1
1	0	0000100030	15	2	PCE	\N	0	15	2
1	0	0000100031	12	1	PCE	\N	0	12	1
1	0	0000100031	15	2	PCE	\N	0	15	2
1	0	0000100032	48	13	LTR	\N	0	48	1
1	0	0000100033	48	13	LTR	5	0	48	1
1	0	0000100034	12	1	PCE	\N	0	12	1
2	0	0000300001	24	1	PCE	\N	0	24	1
2	0	0000300001	50	3	LTR	\N	0	50	2
2	0	0000300002	24	1	PCE	\N	0	24	1
2	0	0000300002	50	3	LTR	\N	0	50	2
1	0	0000300003	12	1	PCE	\N	0	12	1
1	0	0000300003	15	2	PCE	\N	0	15	2
1	0	0000300004	15	2	PCE	5	0	15	2
1	0	0000300005	12	1	PCE	\N	0	12	1
1	0	0000300006	12	1	PCE	\N	0	12	1
1	0	0000300007	12	1	PCE	\N	0	12	1
1	0	0000300007	15	2	PCE	\N	0	15	2
4	0	0000300008	48	1	PCE	\N	0	48	1
4	0	0000300009	48	1	PCE	\N	0	48	1
1	0	0000300010	12	1	PCE	\N	0	12	1
2	0	0000300010	30	2	PCE	\N	0	30	2
1	0	0000300010	25	3	LTR	\N	0	25	3
1	0	0000300011	12	1	PCE	3	0	12	1
2	0	0000200001	24	1	PCE	\N	0	24	1
2	0	0000200001	30	2	PCE	\N	0	30	2
1	0	0000200002	12	1	PCE	3	0	12	1
1	0	0000200003	12	1	PCE	\N	0	12	1
1	0	0000200003	15	2	PCE	\N	0	15	2
1	0	0000200004	12	1	PCE	3	0	12	1
1	0	0000300012	12	1	PCE	\N	0	12	1
1	0	0000300012	15	2	PCE	\N	0	15	2
2	0	0000300013	24	1	PCE	\N	0	24	1
1	0	0000300014	15	2	PCE	\N	0	15	1
1	0	0000300015	12	1	PCE	\N	0	12	1
1	0	0000300016	12	1	PCE	7	0	12	1
4	0	0000200005	48	1	PCE	\N	0	48	1
2	0	0000200005	360	2	BOX	\N	0	360	2
4	0	0000200006	100	3	LTR	\N	0	100	1
4	0	0000200007	48	1	PCE	\N	0	48	1
4	0	0000200007	60	2	PCE	\N	0	60	2
4	0	0000200007	100	3	LTR	\N	0	100	3
1	0	0000200008	12	1	PCE	4	0	12	1
1	0	0000200008	15	2	PCE	2	0	15	2
2	0	0000200008	50	3	LTR	2	0	50	3
2	0	0000200009	24	1	PCE	\N	0	24	1
2	0	0000200010	24	1	PCE	\N	0	24	1
3	0	0000200011	1728	13	BOX	\N	0	1728	1
3	0	0000200011	25.5	14	LTR	\N	0	25.5	2
3	0	0000200012	25.5	14	LTR	2	0	25.5	2
1	0	0000200013	576	13	BOX	3	0	576	1
2	0	0000200014	24	1	PCE	\N	0	24	1
2	0	0000200015	24	1	PCE	\N	0	24	1
2	0	0000200016	24	1	PCE	\N	0	24	1
2	0	0000200016	30	2	PCE	\N	0	30	2
1	0	0000200017	12	1	PCE	3	0	12	1
4	0	0000300017	48	1	PCE	\N	0	48	1
2	0	0000300018	24	1	PCE	\N	0	24	1
2	0	0000300018	30	2	PCE	\N	0	30	2
1	0	0000300019	15	2	PCE	8	0	15	2
2	0	0000300020	600	5	CTN	\N	0	600	1
2	0	0000300020	96	13	LTR	\N	0	96	2
1	0	0000300020	102	14	BOX	\N	0	102	3
\.


--
-- Data for Name: Journies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Journies" ("salesId", "startJourney", "endJourney", "createdAt", "updatedAt", "journeyId") FROM stdin;
1000002	2025-10-19 07:03:22.914	2025-10-19 07:06:57.121	2025-10-19 09:03:10.218	2025-10-19 09:06:57.245	4
1000003	2025-10-16 10:06:11.551	2025-10-16 10:06:35.097	2025-10-16 11:38:53.241	2025-10-16 12:06:39.153	3
1000002	2025-10-19 07:07:36.121	2025-10-19 07:08:22.537	2025-10-19 09:07:32.099	2025-10-19 09:08:22.538	5
1000001	2025-10-16 07:06:04.997	2025-10-16 07:07:04.366	2025-10-16 08:45:28.726	2025-10-16 09:07:13.771	7
1000002	2025-10-19 07:23:24.439	2025-10-19 07:23:28.109	2025-10-19 09:18:28.138	2025-10-19 09:23:45.534	6
1000001	2025-10-16 07:10:20.219	2025-10-16 07:10:54.949	2025-10-16 09:09:34.078	2025-10-16 09:16:48.012	8
1000002	2025-10-19 07:28:56.688	2025-10-19 07:35:49.591	2025-10-19 09:28:18.834	2025-10-19 09:35:55.376	7
1000001	2025-10-16 07:17:42.754	2025-10-16 07:18:10.955	2025-10-16 09:17:33.681	2025-10-16 09:18:33.596	9
1000001	2025-10-16 07:20:22.918	2025-10-16 07:20:47.941	2025-10-16 09:20:09.515	2025-10-16 09:20:50.831	10
1000002	2025-10-19 07:38:38.496	2025-10-19 07:40:45.22	2025-10-19 09:38:16.23	2025-10-19 09:40:45.268	8
1000001	2025-10-16 07:23:43.874	2025-10-16 07:24:09.447	2025-10-16 09:22:56.869	2025-10-16 09:24:13.801	11
1000003	2025-10-16 10:08:00.694	2025-10-16 11:39:25.379	2025-10-16 12:07:45.361	2025-10-16 13:39:23.7	4
1000001	2025-10-16 05:02:17.693	2025-10-16 05:54:35.431	2025-10-16 07:00:18.853	2025-10-16 07:54:40.611	1
1000001	2025-10-16 07:25:50.769	2025-10-16 07:26:59.919	2025-10-16 09:25:32.963	2025-10-16 09:27:10.132	12
1000001	2025-10-16 06:07:37.326	2025-10-16 06:10:40.608	2025-10-16 08:06:00.773	2025-10-16 08:10:40.563	2
1000002	2025-10-19 08:06:59.661	2025-10-19 08:07:36.719	2025-10-19 10:06:11.38	2025-10-19 10:08:35.624	9
1000001	2025-10-16 07:29:16.372	2025-10-16 07:29:59.895	2025-10-16 09:28:51.627	2025-10-16 10:50:57.387	13
1000001	2025-10-16 06:20:38.626	2025-10-16 06:21:35.692	2025-10-16 08:20:26.564	2025-10-16 08:21:35.423	3
1000002	2025-10-19 08:47:50.255	2025-10-19 08:56:16.189	2025-10-19 10:46:51.019	2025-10-19 10:56:15.98	10
1000001	2025-10-16 08:52:12.586	2025-10-16 08:59:38.528	2025-10-16 10:51:52.159	2025-10-16 10:59:43.864	14
1000001	2025-10-16 06:25:00.121	2025-10-16 06:28:29.75	2025-10-16 08:24:38.909	2025-10-16 08:28:29.491	4
1000001	2025-10-16 06:29:23.058	2025-10-16 06:35:24.005	2025-10-16 08:29:03.113	2025-10-16 08:35:23.93	5
1000003	2025-10-16 09:03:33.474	2025-10-16 09:05:22.141	2025-10-16 11:02:34.543	2025-10-16 11:05:23.237	1
1000003	2025-10-19 11:06:13.933	2025-10-20 04:36:44.411	2025-10-19 13:05:55.182	2025-10-20 06:36:44.362	10
1000001	2025-10-16 06:36:15.537	2025-10-16 06:45:04.923	2025-10-16 08:35:53.342	2025-10-16 08:45:04.68	6
1000003	2025-10-16 09:26:50.796	2025-10-16 09:37:58.38	2025-10-16 11:19:00.933	2025-10-16 11:37:59.118	2
1000003	2025-10-20 04:39:52.799	2025-10-20 04:41:47.463	2025-10-20 06:37:10.316	2025-10-20 06:41:47.12	11
1000003	2025-10-20 05:47:38.695	2025-10-20 05:47:42.39	2025-10-20 06:48:52.795	2025-10-20 07:47:42.019	12
1000003	2025-10-20 05:49:19.598	2025-10-20 05:49:27.984	2025-10-20 07:48:03.556	2025-10-20 07:49:27.645	13
1000003	2025-10-20 05:49:54.954	2025-10-20 05:51:35.577	2025-10-20 07:49:41.768	2025-10-20 07:51:35.749	14
1000003	2025-10-16 11:41:25.312	2025-10-16 11:41:25.312	2025-10-16 13:39:55.983	2025-10-16 13:47:13.992	5
1000003	2025-10-19 04:32:10.69	2025-10-19 04:36:05.387	2025-10-19 06:17:31.919	2025-10-19 06:36:06.17	6
1000002	2025-10-19 04:42:58.355	2025-10-19 04:46:21.008	2025-10-19 06:18:06.517	2025-10-19 06:46:34.532	1
1000003	2025-10-19 04:55:13.331	2025-10-19 04:58:21.348	2025-10-19 06:54:12.761	2025-10-19 06:58:21.364	7
1000002	2025-10-19 05:04:38.351	2025-10-19 05:06:47.581	2025-10-19 07:01:07.655	2025-10-19 07:07:08.881	2
1000003	2025-10-19 05:53:05.374	2025-10-19 05:54:35.236	2025-10-19 07:52:08.915	2025-10-19 07:54:34.511	8
1000003	2025-10-19 05:55:14.602	2025-10-19 05:56:36.499	2025-10-19 07:55:05.963	2025-10-19 07:56:35.844	9
1000002	2025-10-19 06:51:37.602	2025-10-19 06:59:53.144	2025-10-19 08:51:04.496	2025-10-19 09:00:11.511	3
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (name, category, stock, "nonSellableQty", "baseUom", "prodId", "basePrice") FROM stdin;
Mineral Water 1.5L	Beverages	800	0	LTR	4	20
Cheese Slices 200g	Dairy	100	0	KGM	6	40
Yogurt 125g	Dairy	300	0	KGM	7	25
Potato Chips 150g	Snacks	250	0	KGM	8	5
Dish Soap 500ml	Cleaning	120	0	LTR	11	25
Laundry Detergent 1kg	Cleaning	80	0	KGM	12	5.5
Cookies 300g	Snacks	180	0	KGM	10	3
Orange Juice 1L	Beverages	190	2	LTR	3	25
Chocolate Bar 50g	Snacks	8000	0	KGM	9	15
Coca Cola 330ml	Beverages	448	2	PCE	1	12
Pepsi 500ml	Beverages	354	1	PCE	2	15
Fresh Milk 1L	Dairy	126	0	LTR	5	25
Shampoo 400ml	Personal Care	1343	0	LTR	13	120
Toothpaste 100ml	Personal Care	14958	0	LTR	14	85
\.


--
-- Data for Name: Reasons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Reasons" (description, sellable, "isHeader", "createdAt", "updatedAt", "reasonId") FROM stdin;
Damaged	f	f	2025-10-14 11:31:52.312	2025-10-14 11:31:52.312	1
Expired	f	f	2025-10-14 11:31:52.312	2025-10-14 11:31:52.312	2
Wrong Item	t	f	2025-10-14 11:31:52.312	2025-10-14 11:31:52.312	3
Defective	f	f	2025-10-14 11:31:52.312	2025-10-14 11:31:52.312	4
Customer Return	t	f	2025-10-14 11:31:52.312	2025-10-14 11:31:52.312	5
Overstock	t	t	2025-10-14 11:31:52.312	2025-10-14 11:31:52.312	6
Poor Quality	f	f	2025-10-14 11:31:52.312	2025-10-14 11:31:52.312	7
Wrong Size	t	f	2025-10-14 11:31:52.312	2025-10-14 11:31:52.312	8
Not Ordered	t	f	2025-10-14 11:31:52.312	2025-10-14 11:31:52.312	9
Late Delivery	t	t	2025-10-14 11:31:52.312	2025-10-14 11:31:52.312	10
Packaging Issue	f	f	2025-10-14 11:31:52.312	2025-10-14 11:31:52.312	11
Price Dispute	t	t	2025-10-14 11:31:52.312	2025-10-14 11:31:52.312	12
\.


--
-- Data for Name: Salesman; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Salesman" (name, phone, address, status, password, "deviceId", "createdAt", "isInitial", available, "lastJourneyId", "salesId") FROM stdin;
Mohamed Ehab	01215756433	32 Nasr City - Makram Ebeid	ACTIVE	010	TP1A.220624.014	2025-10-14 13:20:10.231	f	t	14	1000001
Ibrahim Meshref	4146165161515	32 Nasr City - Makram Ebeid	ACTIVE	010	TP1A.220624.014	2025-10-16 11:02:29.145	f	t	14	1000003
Omar Mohamed	14661651951	32 Nasr City - Makram Ebeid	ACTIVE	010	TP1A.220624.014	2025-10-14 11:29:34.68	f	f	4	1000000
Seif Mohamed	01215756436	32 Nasr City - Makram Ebeid	ACTIVE	010	SP1A.210812.016	2025-10-15 06:42:08.122	f	t	10	1000002
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
09bcc087-744d-423b-954f-9343516ae851	366630c5317a9d7788b40dd1dfa35d609bb8593716a03959797a4c7f8685bcbf	2025-10-02 15:23:51.711425+03	20250828115026_init_with_authorities	\N	\N	2025-10-02 15:23:51.660986+03	1
6318d0c8-8ff9-473f-84f6-02421eec8065	856edaf476f6a40abbdf1e731f0a2c415ed58207e325a5d3886436b9c56d97c7	2025-10-02 15:23:51.713797+03	20250923062612_change_loginstate_to_isinitial	\N	\N	2025-10-02 15:23:51.711799+03	1
20eea4c5-0f29-43bf-ac84-075cadffdbd9	21cf6d75c8bd6b7cee941c1741ce3df82cd51760bfb3cad0eab0b12f579894cd	2025-10-02 15:23:51.718135+03	20250923063354_reset_salesman_id_sequence	\N	\N	2025-10-02 15:23:51.714273+03	1
29d6343e-87ac-4126-97f0-e68949e8654d	02c115c4a01cf0ed5387b8376fb2ea962c8b609af6dd615ef2da2c3c73e89399	2025-10-02 15:23:51.720053+03	20250923103553_add_value_to_salesman_authorities	\N	\N	2025-10-02 15:23:51.718506+03	1
90b8a229-aa2a-4e4f-b23a-33cff492c084	33347265e89b8cd0385aad7e55bd3e129ea94e463667e91c42b5993ee0cc7217	2025-10-02 15:23:51.73655+03	20250924080458_added_visits_table	\N	\N	2025-10-02 15:23:51.720414+03	1
fc75378b-4d1f-457a-ac63-11af7e6551d2	c69d4160c66309fa4ff1b0852bc4dbca1dbf9e68b82f25c79c2a6a61a574a7d4	2025-10-02 15:23:51.771023+03	20250924125950_changed_database_tomatch_mobile	\N	\N	2025-10-02 15:23:51.737008+03	1
a8d7bac3-ca29-4b56-9919-69ce1510d671	cd34b638c1f599fcabb6f45466d706df6f28a68e1a8d34b4756eb5aa136089ff	2025-10-02 15:23:51.788449+03	20250928070612_fix_product_schema	\N	\N	2025-10-02 15:23:51.771473+03	1
7d3fb22a-e9d1-442c-af37-171d90f49151	8fba5927c912f1bb0ce5ccc4260da426060997dd3ad564cca92348bc2343e86d	2025-10-02 15:23:51.795747+03	20250928071333_fix_stock_decimal_to_int	\N	\N	2025-10-02 15:23:51.788883+03	1
494379ba-ff9a-4374-94b7-1d1338accbc6	d24c9f7548fb4b35108cde9b9d9fc3554787e55f0e33afc8033e1656d7ec39ad	2025-10-02 15:23:52.467102+03	20251002122352_init	\N	\N	2025-10-02 15:23:52.441288+03	1
\.


--
-- Data for Name: action_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.action_details (id, "journeyId", "visitId", "salesId", "actionId", "createdAt") FROM stdin;
1	14	58	1000001	1	2025-10-16 08:52:12
2	14	58	1000001	3	2025-10-16 08:57:49
3	14	58	1000001	6	2025-10-16 08:58:08
4	14	58	1000001	7	2025-10-16 08:58:30
5	14	58	1000001	4	2025-10-16 08:58:38
6	14	58	1000001	3	2025-10-16 08:58:45
7	14	58	1000001	6	2025-10-16 08:59:08
8	14	58	1000001	4	2025-10-16 08:59:11
9	14	59	1000001	3	2025-10-16 08:59:21
10	14	59	1000001	5	2025-10-16 08:59:23
11	14	60	1000001	5	2025-10-16 08:59:31
12	14	58	1000001	2	2025-10-16 08:59:38
1	1	62	1000003	1	2025-10-16 09:03:33
2	1	61	1000003	3	2025-10-16 09:03:39
3	1	61	1000003	6	2025-10-16 09:03:49
4	1	61	1000003	4	2025-10-16 09:04:03
5	1	61	1000003	3	2025-10-16 09:04:08
6	1	61	1000003	7	2025-10-16 09:04:17
7	1	62	1000003	5	2025-10-16 09:04:21
8	1	61	1000003	4	2025-10-16 09:04:36
9	1	63	1000003	3	2025-10-16 09:04:47
10	1	63	1000003	6	2025-10-16 09:04:57
11	1	63	1000003	7	2025-10-16 09:05:13
12	1	63	1000003	4	2025-10-16 09:05:17
13	1	62	1000003	2	2025-10-16 09:05:22
1	2	65	1000003	1	2025-10-16 09:26:50
2	2	64	1000003	3	2025-10-16 09:26:56
3	2	64	1000003	6	2025-10-16 09:36:28
4	2	65	1000003	5	2025-10-16 09:37:41
5	2	66	1000003	5	2025-10-16 09:37:45
6	2	64	1000003	4	2025-10-16 09:37:50
7	2	65	1000003	2	2025-10-16 09:37:58
1	3	68	1000003	1	2025-10-16 09:40:03
2	3	67	1000003	3	2025-10-16 09:40:12
3	3	67	1000003	6	2025-10-16 09:40:26
1	3	67	1000003	4	2025-10-16 09:58:32
2	3	68	1000003	1	2025-10-16 09:59:08
4	3	67	1000003	6	2025-10-16 10:00:17
3	3	68	1000003	5	2025-10-16 10:06:26
4	3	69	1000003	5	2025-10-16 10:06:30
5	3	67	1000003	2	2025-10-16 10:06:35
1	4	70	1000003	1	2025-10-16 10:08:00
1	4	71	1000003	1	2025-10-16 10:08:00
2	4	70	1000003	3	2025-10-16 10:08:25
3	4	70	1000003	4	2025-10-16 10:12:45
4	4	71	1000003	5	2025-10-16 11:39:20
5	4	72	1000003	5	2025-10-16 11:39:22
6	4	70	1000003	2	2025-10-16 11:39:25
1	6	76	1000003	1	2025-10-19 04:32:10
2	6	76	1000003	3	2025-10-19 04:32:29
3	6	76	1000003	6	2025-10-19 04:32:55
4	6	76	1000003	7	2025-10-19 04:34:40
5	6	76	1000003	4	2025-10-19 04:34:52
6	6	77	1000003	3	2025-10-19 04:35:05
7	6	77	1000003	6	2025-10-19 04:35:21
8	6	77	1000003	7	2025-10-19 04:35:42
9	6	77	1000003	4	2025-10-19 04:35:50
10	6	78	1000003	5	2025-10-19 04:35:55
11	6	76	1000003	2	2025-10-19 04:36:05
1	1	81	1000002	1	2025-10-19 04:42:58
2	1	79	1000002	3	2025-10-19 04:43:16
3	1	79	1000002	6	2025-10-19 04:43:31
4	1	79	1000002	7	2025-10-19 04:45:27
5	1	79	1000002	4	2025-10-19 04:45:39
6	1	80	1000002	5	2025-10-19 04:45:53
7	1	81	1000002	3	2025-10-19 04:46:00
8	1	81	1000002	5	2025-10-19 04:46:01
9	1	81	1000002	2	2025-10-19 04:46:21
1	7	82	1000003	1	2025-10-19 04:55:13
2	7	82	1000003	3	2025-10-19 04:57:52
3	7	82	1000003	4	2025-10-19 04:57:55
4	7	83	1000003	3	2025-10-19 04:58:01
5	7	83	1000003	5	2025-10-19 04:58:12
6	7	84	1000003	5	2025-10-19 04:58:18
7	7	82	1000003	2	2025-10-19 04:58:21
1	2	87	1000002	1	2025-10-19 05:04:38
2	2	85	1000002	3	2025-10-19 05:04:45
3	2	85	1000002	4	2025-10-19 05:05:00
4	2	85	1000002	3	2025-10-19 05:05:14
5	2	85	1000002	4	2025-10-19 05:05:32
6	2	85	1000002	5	2025-10-19 05:05:37
7	2	86	1000002	3	2025-10-19 05:05:47
8	2	86	1000002	5	2025-10-19 05:05:52
9	2	87	1000002	3	2025-10-19 05:06:09
10	2	87	1000002	6	2025-10-19 05:06:15
11	2	87	1000002	7	2025-10-19 05:06:30
12	2	87	1000002	4	2025-10-19 05:06:37
13	2	87	1000002	2	2025-10-19 05:06:47
1	8	88	1000003	1	2025-10-19 05:53:05
2	8	88	1000003	3	2025-10-19 05:53:13
3	8	88	1000003	6	2025-10-19 05:53:40
4	8	88	1000003	4	2025-10-19 05:53:47
5	8	90	1000003	3	2025-10-19 05:53:56
6	8	90	1000003	6	2025-10-19 05:54:20
7	8	90	1000003	4	2025-10-19 05:54:24
8	8	89	1000003	5	2025-10-19 05:54:28
9	8	88	1000003	2	2025-10-19 05:54:35
1	9	91	1000003	1	2025-10-19 05:55:14
2	9	91	1000003	3	2025-10-19 05:55:21
3	9	91	1000003	6	2025-10-19 05:55:31
4	9	91	1000003	4	2025-10-19 05:55:34
5	9	92	1000003	3	2025-10-19 05:55:43
6	9	92	1000003	6	2025-10-19 05:56:00
7	9	92	1000003	7	2025-10-19 05:56:10
8	9	92	1000003	4	2025-10-19 05:56:18
9	9	93	1000003	5	2025-10-19 05:56:21
10	9	91	1000003	2	2025-10-19 05:56:36
1	3	94	1000002	1	2025-10-19 06:51:37
2	3	94	1000002	3	2025-10-19 06:52:58
3	3	94	1000002	6	2025-10-19 06:53:53
4	3	94	1000002	6	2025-10-19 06:54:32
5	3	94	1000002	4	2025-10-19 06:54:46
6	3	95	1000002	5	2025-10-19 06:58:40
7	3	96	1000002	3	2025-10-19 06:59:28
8	3	96	1000002	4	2025-10-19 06:59:39
9	3	94	1000002	2	2025-10-19 06:59:53
1	4	97	1000002	1	2025-10-19 07:03:22
2	4	97	1000002	3	2025-10-19 07:03:30
3	4	97	1000002	5	2025-10-19 07:03:36
4	4	98	1000002	3	2025-10-19 07:04:12
5	4	98	1000002	6	2025-10-19 07:04:25
6	4	98	1000002	7	2025-10-19 07:04:48
7	4	98	1000002	4	2025-10-19 07:04:54
8	4	99	1000002	5	2025-10-19 07:04:58
9	4	97	1000002	2	2025-10-19 07:06:57
1	5	100	1000002	1	2025-10-19 07:07:36
2	5	100	1000002	3	2025-10-19 07:07:41
3	5	100	1000002	6	2025-10-19 07:07:46
4	5	100	1000002	4	2025-10-19 07:07:48
5	5	100	1000002	3	2025-10-19 07:07:56
6	5	100	1000002	7	2025-10-19 07:08:07
7	5	100	1000002	4	2025-10-19 07:08:10
8	5	101	1000002	5	2025-10-19 07:08:15
9	5	102	1000002	5	2025-10-19 07:08:18
10	5	100	1000002	2	2025-10-19 07:08:22
1	6	103	1000002	1	2025-10-19 07:23:24
2	6	103	1000002	2	2025-10-19 07:23:28
1	7	108	1000002	1	2025-10-19 07:28:56
2	7	107	1000002	5	2025-10-19 07:29:11
3	7	106	1000002	3	2025-10-19 07:29:23
4	7	106	1000002	4	2025-10-19 07:30:03
5	7	106	1000002	5	2025-10-19 07:30:06
6	7	108	1000002	3	2025-10-19 07:30:17
7	7	108	1000002	6	2025-10-19 07:31:30
8	7	108	1000002	7	2025-10-19 07:32:50
9	7	108	1000002	7	2025-10-19 07:33:21
10	7	108	1000002	4	2025-10-19 07:34:35
11	7	108	1000002	2	2025-10-19 07:35:49
1	8	109	1000002	1	2025-10-19 07:38:38
2	8	111	1000002	3	2025-10-19 07:38:48
3	8	111	1000002	4	2025-10-19 07:38:52
4	8	110	1000002	5	2025-10-19 07:38:56
5	8	109	1000002	3	2025-10-19 07:39:03
6	8	109	1000002	6	2025-10-19 07:39:33
7	8	109	1000002	4	2025-10-19 07:40:11
8	8	109	1000002	3	2025-10-19 07:40:20
9	8	109	1000002	4	2025-10-19 07:40:27
10	8	109	1000002	2	2025-10-19 07:40:45
1	9	112	1000002	1	2025-10-19 08:06:59
2	9	112	1000002	5	2025-10-19 08:07:36
3	9	113	1000002	5	2025-10-19 08:07:36
4	9	114	1000002	5	2025-10-19 08:07:36
5	9	112	1000002	2	2025-10-19 08:07:36
1	11	121	1000003	1	2025-10-20 04:39:52
2	11	126	1000003	3	2025-10-20 04:40:01
3	11	126	1000003	6	2025-10-20 04:40:32
4	11	126	1000003	4	2025-10-20 04:41:11
5	11	121	1000003	3	2025-10-20 04:41:30
6	11	121	1000003	4	2025-10-20 04:41:43
7	11	122	1000003	5	2025-10-20 04:41:47
8	11	123	1000003	5	2025-10-20 04:41:47
9	11	124	1000003	5	2025-10-20 04:41:47
10	11	125	1000003	5	2025-10-20 04:41:47
11	11	126	1000003	2	2025-10-20 04:41:47
1	12	126	1000003	1	2025-10-20 05:47:38
2	12	127	1000003	5	2025-10-20 05:47:42
3	12	128	1000003	5	2025-10-20 05:47:42
4	12	131	1000003	2	2025-10-20 05:47:42
1	13	129	1000003	1	2025-10-20 05:49:19
2	13	129	1000003	4	2025-10-20 05:49:24
3	13	130	1000003	5	2025-10-20 05:49:27
4	13	131	1000003	5	2025-10-20 05:49:27
5	13	132	1000003	5	2025-10-20 05:49:27
6	13	133	1000003	5	2025-10-20 05:49:27
7	13	134	1000003	5	2025-10-20 05:49:27
8	13	135	1000003	5	2025-10-20 05:49:27
9	13	136	1000003	5	2025-10-20 05:49:27
10	13	137	1000003	5	2025-10-20 05:49:27
11	13	129	1000003	2	2025-10-20 05:49:27
1	14	138	1000003	1	2025-10-20 05:49:54
2	14	138	1000003	3	2025-10-20 05:49:58
3	14	138	1000003	6	2025-10-20 05:50:14
4	14	138	1000003	7	2025-10-20 05:50:29
5	14	138	1000003	4	2025-10-20 05:50:31
6	14	139	1000003	5	2025-10-20 05:50:34
7	14	140	1000003	5	2025-10-20 05:50:41
8	14	141	1000003	5	2025-10-20 05:50:45
9	14	142	1000003	3	2025-10-20 05:50:49
10	14	142	1000003	6	2025-10-20 05:51:20
11	14	142	1000003	4	2025-10-20 05:51:25
12	14	143	1000003	5	2025-10-20 05:51:35
13	14	144	1000003	5	2025-10-20 05:51:35
14	14	145	1000003	5	2025-10-20 05:51:35
15	14	146	1000003	5	2025-10-20 05:51:35
16	14	146	1000003	2	2025-10-20 05:51:35
\.


--
-- Data for Name: actions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.actions ("actionId", name, "createdAt") FROM stdin;
1	startJourney	2025-10-14 15:49:10.899
2	endJourney	2025-10-14 15:50:33.864
3	startVisit	2025-10-14 15:50:46.529
4	endVisit	2025-10-14 15:50:57.705
5	cancelVisit	2025-10-14 15:51:02.023
6	createInvoice	2025-10-14 15:51:11.45
7	returnInvoice	2025-10-14 15:51:19.299
8	addVisit	2025-10-14 15:52:32.155
\.


--
-- Data for Name: authorities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.authorities (name, type, "createdAt", "updatedAt", "authorityId") FROM stdin;
createInvoice	MOBILE	2025-10-14 11:32:19.504	2025-10-14 11:32:19.504	1
returnInvoice	MOBILE	2025-10-14 11:32:19.509	2025-10-14 11:32:19.509	2
map	MOBILE	2025-10-14 11:32:19.511	2025-10-14 11:32:19.511	3
addVisit	MOBILE	2025-10-14 11:32:19.512	2025-10-14 11:32:19.512	4
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (name, industry, address, latitude, longitude, phone, "createdAt", "customerId") FROM stdin;
Enterprise Consultancy Services (ECS)	Hypermarket	Cairo business park, Second New Cairo, Cairo Governorate 12345	30.05128905449865	31.51315463819154	01213214123	2025-10-14 11:40:27.479	1
Coffee Lab	Grocery Store	Gardenia Hub, Suez Rd, Nasr City, Cairo Governorate 11111	30.05128905449865	31.51315463819154	01215756433	2025-10-14 11:44:04.755	3
Bakery Khan	Grocery Store	38FR+W6W، Kilany، Mohamed Kilany, Masaken Al Mohandesin, Nasr City, Cairo Governorate	30.05128905449865	31.51315463819154	01213214121	2025-10-14 11:43:17.887	2
alllo	Banking & Finance	3G27+J6H, Cairo Governorate, Egypt	30.051119	31.5130735	+204657676766	2025-10-20 06:21:25.763	13
omer state	Non-Profit Organizations	3G27+J6H, Cairo Governorate, Egypt	30.0511165	31.5130947	+208965656565	2025-10-20 06:34:57.041	14
ecs 3	Media & Entertainment	3G27+J6H, Cairo Governorate, Egypt	30.051117	31.5130671	+201558564455	2025-10-20 06:38:42.382	15
ECS	Other	3G27+J6H, Cairo Governorate, Egypt	30.0511312	31.5130641	+201111111111	2025-10-20 07:28:24.612	16
ECS 2	Education	3G27+J6H, Cairo Governorate, Egypt	30.0511841	31.513023	+201000665656	2025-10-20 07:29:13.034	17
ECS 3	Construction & Real Estate	3G27+J6H, Cairo Governorate, Egypt	30.051157	31.5130458	+201008585859	2025-10-20 07:29:48.6	18
\.


--
-- Data for Name: prod_uom; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prod_uom (uom, "uomName", barcode, num, denum, "prodId") FROM stdin;
PCE	Piece	CC330001	1	1	1
BOX	Box (24 pcs)	CC330024	24	1	1
PCE	Piece	PP500001	1	1	2
BOX	Box (12 pcs)	PP500012	12	1	2
LTR	Liter	OJ1000001	1	1	3
CTN	Carton (6 L)	OJ1000006	6	1	3
LTR	Liter	MW1500001	1	1	4
CTN	Carton (12 bottles)	MW1500012	18	1	4
LTR	Liter	FM1000001	1	1	5
CTN	Carton (12 L)	FM1000012	12	1	5
KGM	Kilogram	CS200001	1	5	6
BOX	Box (10 packs)	CS200010	2	1	6
KGM	Kilogram	YG125001	1	8	7
BOX	Box (8 cups)	YG125008	1	1	7
KGM	Kilogram	PC150001	3	20	8
BOX	Box (12 bags)	PC150012	9	5	8
KGM	Kilogram	CB050001	1	20	9
BOX	Box (24 bars)	CB050024	6	5	9
KGM	Kilogram	CK300001	3	10	10
BOX	Box (6 packs)	CK300006	9	5	10
LTR	Liter	DS500001	1	2	11
CTN	Carton (12 bottles)	DS500012	6	1	11
KGM	Kilogram	LD1000001	1	1	12
BOX	Box (6 packs)	LD1000006	6	1	12
LTR	Liter	SH400001	2	5	13
BOX	Box (12 bottles)	SH400012	24	5	13
LTR	Liter	TP100001	1	10	14
BOX	Box (12 tubes)	TP100012	6	5	14
\.


--
-- Data for Name: salesman_authorities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salesman_authorities (id, "salesmanId", "authorityId", "createdAt", value) FROM stdin;
1	1000000	1	2025-10-14 11:38:51.847	t
2	1000000	2	2025-10-14 11:38:51.863	t
3	1000000	3	2025-10-14 11:38:51.866	t
4	1000000	4	2025-10-14 11:38:51.871	t
5	1000001	1	2025-10-16 07:01:12.816	t
6	1000001	2	2025-10-16 07:01:12.83	t
7	1000001	3	2025-10-16 07:01:12.834	t
8	1000001	4	2025-10-16 07:01:12.839	t
9	1000003	1	2025-10-16 11:02:55.245	t
10	1000003	2	2025-10-16 11:02:55.258	t
11	1000003	3	2025-10-16 11:02:55.263	t
12	1000003	4	2025-10-16 11:02:55.268	t
13	1000002	1	2025-10-16 13:32:32.629	t
14	1000002	2	2025-10-16 13:32:32.636	t
15	1000002	3	2025-10-16 13:32:32.64	t
16	1000002	4	2025-10-16 13:32:32.644	t
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings ("settingId", name, value, "textValue", "createdAt", "updatedAt") FROM stdin;
1	customInvoice	f		2025-10-14 11:18:06.416	2025-10-19 10:06:29.917
2	visitSequence	t	\N	2025-10-14 11:18:06.416	2025-10-19 10:06:29.919
\.


--
-- Data for Name: visits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visits ("custId", "salesId", "startTime", "endTime", "cancelTime", status, "createdAt", "updatedAt", "journeyId", "visitId") FROM stdin;
2	1000001	\N	\N	\N	WAIT	2025-10-16 07:00:18.892	2025-10-16 07:00:18.892	1	20
1	1000001	\N	\N	\N	WAIT	2025-10-16 07:00:18.892	2025-10-16 07:00:18.892	1	21
1	1000002	2025-10-19 04:46:00	\N	2025-10-19 04:46:01	CANCEL	2025-10-19 06:18:06.527	2025-10-19 06:46:34.551	1	81
3	1000003	2025-10-18 23:32:28	2025-10-18 23:34:52	\N	END	2025-10-19 06:17:31.983	2025-10-19 06:53:58.827	6	76
2	1000003	2025-10-18 23:35:05	2025-10-18 23:35:50	\N	END	2025-10-19 06:17:31.983	2025-10-19 06:53:58.833	6	77
3	1000001	2025-10-16 07:17:47.523	2025-10-16 07:18:02.11	\N	END	2025-10-16 09:17:33.712	2025-10-16 09:18:01.858	9	43
2	1000001	\N	\N	2025-10-16 07:18:05.095	CANCEL	2025-10-16 09:17:33.712	2025-10-16 09:18:04.802	9	44
1	1000001	\N	\N	2025-10-16 07:18:07.313	CANCEL	2025-10-16 09:17:33.712	2025-10-16 09:18:07.024	9	45
2	1000003	\N	\N	2025-10-16 10:06:26.809	CANCEL	2025-10-16 11:38:53.267	2025-10-16 12:06:25.332	3	68
1	1000003	\N	\N	2025-10-16 10:06:30.3	CANCEL	2025-10-16 11:38:53.267	2025-10-16 12:06:28.683	3	69
1	1000003	\N	\N	2025-10-18 23:35:55	CANCEL	2025-10-19 06:17:31.983	2025-10-19 06:53:58.837	6	78
3	1000003	2025-10-16 04:59:52	2025-10-16 10:06:23	\N	END	2025-10-16 11:38:53.267	2025-10-16 12:06:39.158	3	67
3	1000001	2025-10-16 06:05:34.527	2025-10-16 05:54:31.4	\N	START	2025-10-16 07:00:18.892	2025-10-16 08:05:50.477	1	19
3	1000001	2025-10-16 07:20:26.711	2025-10-16 07:20:40.755	\N	END	2025-10-16 09:20:09.561	2025-10-16 09:20:43.605	10	46
2	1000001	\N	\N	2025-10-16 07:20:42.465	CANCEL	2025-10-16 09:20:09.561	2025-10-16 09:20:44.312	10	47
1	1000001	\N	\N	2025-10-16 07:20:45.883	CANCEL	2025-10-16 09:20:09.561	2025-10-16 09:20:46.117	10	48
2	1000001	2025-10-16 06:08:51.881	2025-10-16 06:09:26.18	\N	END	2025-10-16 08:06:00.818	2025-10-16 08:09:26.251	2	23
1	1000001	\N	\N	2025-10-16 06:09:31.164	CANCEL	2025-10-16 08:06:00.818	2025-10-16 08:09:31.06	2	24
3	1000001	2025-10-16 06:16:20.03	2025-10-16 06:16:30.693	\N	END	2025-10-16 08:06:00.818	2025-10-16 08:16:30.925	2	22
3	1000001	2025-10-16 07:23:48.06	2025-10-16 07:24:00.374	\N	END	2025-10-16 09:22:56.898	2025-10-16 09:24:00.549	11	49
2	1000001	\N	\N	2025-10-16 07:24:04.322	CANCEL	2025-10-16 09:22:56.898	2025-10-16 09:24:07.351	11	50
1	1000001	\N	\N	2025-10-16 07:24:07.304	CANCEL	2025-10-16 09:22:56.898	2025-10-16 09:24:09.815	11	51
3	1000003	2025-10-16 10:08:25.772	2025-10-16 10:12:45.597	\N	END	2025-10-16 12:07:45.388	2025-10-16 12:12:46.256	4	70
3	1000001	2025-10-16 06:20:43.832	2025-10-16 06:21:03.129	\N	END	2025-10-16 08:20:26.589	2025-10-16 08:21:04.866	3	25
2	1000001	2025-10-16 06:21:07.331	2025-10-16 06:21:30.007	\N	END	2025-10-16 08:20:26.589	2025-10-16 08:21:30.648	3	26
1	1000001	\N	\N	2025-10-16 06:21:32.324	CANCEL	2025-10-16 08:20:26.589	2025-10-16 08:21:32.28	3	27
2	1000003	\N	\N	2025-10-16 11:39:20	CANCEL	2025-10-16 12:07:45.388	2025-10-16 13:39:19.359	4	71
1	1000003	\N	\N	2025-10-16 11:39:22.192	CANCEL	2025-10-16 12:07:45.388	2025-10-16 13:39:20.482	4	72
3	1000003	\N	\N	\N	WAIT	2025-10-16 13:39:56.01	2025-10-16 13:39:56.01	5	73
2	1000003	\N	\N	\N	WAIT	2025-10-16 13:39:56.01	2025-10-16 13:39:56.01	5	74
3	1000001	2025-10-16 06:25:08.208	2025-10-16 06:26:28.07	\N	END	2025-10-16 08:24:38.94	2025-10-16 08:26:28.125	4	28
2	1000001	\N	\N	2025-10-16 07:26:36.484	CANCEL	2025-10-16 09:25:33.028	2025-10-16 09:26:46.407	12	53
2	1000001	2025-10-16 06:27:17.931	2025-10-16 06:27:21.49	\N	END	2025-10-16 08:24:38.94	2025-10-16 08:27:21.445	4	29
3	1000001	2025-10-16 07:26:12.371	2025-10-16 07:26:30.136	\N	END	2025-10-16 09:25:33.028	2025-10-16 09:26:47.082	12	52
1	1000001	2025-10-16 06:27:26.23	2025-10-16 06:28:28.452	\N	END	2025-10-16 08:24:38.94	2025-10-16 08:28:28.299	4	30
1	1000001	\N	\N	2025-10-16 07:26:41.861	CANCEL	2025-10-16 09:25:33.028	2025-10-16 09:26:51.625	12	54
2	1000001	\N	\N	\N	WAIT	2025-10-16 08:29:03.139	2025-10-16 08:29:03.139	5	32
1	1000001	\N	\N	\N	WAIT	2025-10-16 08:29:03.139	2025-10-16 08:29:03.139	5	33
1	1000003	\N	\N	\N	WAIT	2025-10-16 13:39:56.01	2025-10-16 13:39:56.01	5	75
3	1000001	2025-10-16 06:29:31.544	2025-10-16 06:35:17.777	\N	END	2025-10-16 08:29:03.139	2025-10-16 08:35:18.118	5	31
3	1000001	2025-10-16 07:29:21.586	\N	2025-10-16 07:29:24.282	CANCEL	2025-10-16 09:28:51.664	2025-10-16 09:29:23.965	13	55
3	1000001	2025-10-16 06:36:24.409	2025-10-16 06:38:17.824	\N	END	2025-10-16 08:35:53.376	2025-10-16 08:38:17.932	6	34
2	1000001	\N	\N	2025-10-16 07:29:31.193	CANCEL	2025-10-16 09:28:51.664	2025-10-16 09:29:32.345	13	56
2	1000001	2025-10-16 06:38:22.615	2025-10-16 06:39:44.572	\N	END	2025-10-16 08:35:53.376	2025-10-16 08:39:44.357	6	35
1	1000001	\N	\N	2025-10-16 07:29:33.224	CANCEL	2025-10-16 09:28:51.664	2025-10-16 09:29:33.629	13	57
1	1000001	2025-10-16 06:39:54.782	2025-10-16 06:45:03.702	\N	END	2025-10-16 08:35:53.376	2025-10-16 08:45:04.286	6	36
3	1000001	2025-10-16 08:58:45.243	2025-10-16 08:59:11.261	\N	END	2025-10-16 10:51:52.241	2025-10-16 10:59:10.701	14	58
2	1000001	2025-10-16 08:59:20.926	\N	2025-10-16 08:59:23.638	CANCEL	2025-10-16 10:51:52.241	2025-10-16 10:59:23.135	14	59
1	1000001	\N	\N	2025-10-16 08:59:31.431	CANCEL	2025-10-16 10:51:52.241	2025-10-16 10:59:30.819	14	60
3	1000001	2025-10-16 07:06:15.305	2025-10-16 07:07:01.045	\N	END	2025-10-16 08:45:28.764	2025-10-16 09:07:00.88	7	37
2	1000001	2025-10-16 01:50:11	2025-10-16 01:51:06	2025-10-16 07:06:44	CANCEL	2025-10-16 08:45:28.764	2025-10-16 09:07:13.789	7	38
1	1000001	2025-10-16 01:50:48	2025-10-16 01:51:05	2025-10-16 07:06:47	CANCEL	2025-10-16 08:45:28.764	2025-10-16 09:07:13.792	7	39
3	1000002	2025-10-19 04:43:16	2025-10-19 04:45:39	\N	END	2025-10-19 06:18:06.527	2025-10-19 06:46:34.543	1	79
2	1000002	\N	\N	2025-10-19 04:45:53	CANCEL	2025-10-19 06:18:06.527	2025-10-19 06:46:34.548	1	80
3	1000001	2025-10-16 07:10:25.417	2025-10-16 07:10:44.81	\N	END	2025-10-16 09:09:34.098	2025-10-16 09:10:44.549	8	40
2	1000001	\N	\N	2025-10-16 07:10:47.996	CANCEL	2025-10-16 09:09:34.098	2025-10-16 09:10:47.889	8	41
1	1000001	\N	\N	2025-10-16 07:10:50.823	CANCEL	2025-10-16 09:09:34.098	2025-10-16 09:10:50.722	8	42
2	1000003	\N	\N	2025-10-16 09:04:21.465	CANCEL	2025-10-16 11:02:34.56	2025-10-16 11:04:20.833	1	62
3	1000003	2025-10-16 09:04:08.742	2025-10-16 09:04:36.034	\N	END	2025-10-16 11:02:34.56	2025-10-16 11:04:35.345	1	61
1	1000003	2025-10-16 09:04:46.995	2025-10-16 09:05:17.071	\N	END	2025-10-16 11:02:34.56	2025-10-16 11:05:16.362	1	63
3	1000003	2025-10-19 04:57:51.644	2025-10-19 04:57:54.955	\N	END	2025-10-19 06:54:12.777	2025-10-19 06:57:54.726	7	82
2	1000003	\N	\N	2025-10-16 09:37:41.486	CANCEL	2025-10-16 11:19:00.975	2025-10-16 11:37:40.27	2	65
1	1000003	\N	\N	2025-10-16 09:37:45.029	CANCEL	2025-10-16 11:19:00.975	2025-10-16 11:37:43.479	2	66
3	1000003	2025-10-16 09:26:55.807	2025-10-16 09:37:50.428	\N	END	2025-10-16 11:19:00.975	2025-10-16 11:37:48.89	2	64
2	1000003	2025-10-19 04:58:01.276	\N	2025-10-19 04:58:12.059	CANCEL	2025-10-19 06:54:12.777	2025-10-19 06:58:11.804	7	83
1	1000003	\N	\N	2025-10-19 04:58:18.236	CANCEL	2025-10-19 06:54:12.777	2025-10-19 06:58:17.939	7	84
2	1000002	2025-10-19 05:05:47	\N	2025-10-19 05:05:52	CANCEL	2025-10-19 07:01:07.673	2025-10-19 07:06:07.547	2	86
3	1000002	2025-10-19 05:05:14	2025-10-19 05:05:32.769	2025-10-19 05:05:37.091	CANCEL	2025-10-19 07:01:07.673	2025-10-19 07:05:37.238	2	85
1	1000002	2025-10-19 05:06:09	2025-10-19 05:06:37	\N	END	2025-10-19 07:01:07.673	2025-10-19 07:07:08.902	2	87
3	1000003	2025-10-19 05:53:12	2025-10-19 05:53:47.02	\N	END	2025-10-19 07:52:08.945	2025-10-19 07:53:46.425	8	88
1	1000003	2025-10-19 05:53:56.028	2025-10-19 05:54:24.77	\N	END	2025-10-19 07:52:08.945	2025-10-19 07:54:24.145	8	90
2	1000003	\N	\N	2025-10-19 05:54:28.905	CANCEL	2025-10-19 07:52:08.945	2025-10-19 07:54:28.298	8	89
3	1000003	2025-10-19 00:55:20	2025-10-19 00:55:34	\N	END	2025-10-19 07:55:05.989	2025-10-19 08:18:58.412	9	91
2	1000003	2025-10-19 00:55:42	2025-10-19 00:56:18	\N	END	2025-10-19 07:55:05.989	2025-10-19 08:18:58.417	9	92
1	1000003	\N	\N	2025-10-19 00:56:21	CANCEL	2025-10-19 07:55:05.989	2025-10-19 08:18:58.421	9	93
3	1000002	2025-10-19 06:52:58	2025-10-19 06:54:46	\N	END	2025-10-19 08:51:04.521	2025-10-19 08:54:51.334	3	94
2	1000002	\N	\N	2025-10-19 06:58:40	CANCEL	2025-10-19 08:51:04.521	2025-10-19 08:59:13.067	3	95
3	1000002	2025-10-19 07:03:30	\N	2025-10-19 07:03:36	CANCEL	2025-10-19 09:03:10.254	2025-10-19 09:05:35.139	4	97
1	1000002	2025-10-19 06:59:28.823	2025-10-19 06:59:39.552	\N	END	2025-10-19 08:51:04.521	2025-10-19 08:59:39.477	3	96
2	1000002	2025-10-19 07:04:11	2025-10-19 07:04:54	\N	END	2025-10-19 09:03:10.254	2025-10-19 09:05:35.141	4	98
1	1000002	\N	\N	2025-10-19 07:04:58	CANCEL	2025-10-19 09:03:10.254	2025-10-19 09:05:35.143	4	99
3	1000002	2025-10-19 07:07:56.475	2025-10-19 07:08:10.506	\N	END	2025-10-19 09:07:32.116	2025-10-19 09:08:10.427	5	100
2	1000002	\N	\N	2025-10-19 07:08:15.745	CANCEL	2025-10-19 09:07:32.116	2025-10-19 09:08:15.814	5	101
1	1000002	\N	\N	2025-10-19 07:08:18.86	CANCEL	2025-10-19 09:07:32.116	2025-10-19 09:08:18.77	5	102
3	1000002	\N	\N	2025-10-19 02:23:28	CANCEL	2025-10-19 09:18:28.152	2025-10-19 09:24:52.497	6	103
2	1000002	\N	\N	2025-10-19 02:23:28	CANCEL	2025-10-19 09:18:28.152	2025-10-19 09:24:52.5	6	104
1	1000002	\N	\N	2025-10-19 02:23:28	CANCEL	2025-10-19 09:18:28.152	2025-10-19 09:24:52.502	6	105
1	1000002	2025-10-19 07:30:17	2025-10-19 07:34:34	\N	END	2025-10-19 09:28:18.86	2025-10-19 09:35:55.382	7	108
2	1000002	\N	\N	2025-10-19 07:29:11.116	CANCEL	2025-10-19 09:28:18.86	2025-10-19 09:29:11.218	7	107
3	1000002	2025-10-19 07:29:23.306	2025-10-19 07:30:03.522	2025-10-19 07:30:06.763	CANCEL	2025-10-19 09:28:18.86	2025-10-19 09:30:06.647	7	106
3	1000002	2025-10-19 02:40:20	2025-10-19 02:40:27	\N	END	2025-10-19 09:38:16.261	2025-10-19 09:41:50.906	8	109
2	1000002	\N	\N	2025-10-19 02:38:56	CANCEL	2025-10-19 09:38:16.261	2025-10-19 09:41:50.911	8	110
1	1000002	2025-10-19 02:38:48	2025-10-19 02:38:52	\N	END	2025-10-19 09:38:16.261	2025-10-19 09:41:50.915	8	111
3	1000002	\N	\N	2025-10-19 08:07:36	CANCEL	2025-10-19 10:06:11.395	2025-10-19 10:08:35.63	9	112
2	1000002	\N	\N	2025-10-19 08:07:36	CANCEL	2025-10-19 10:06:11.395	2025-10-19 10:08:35.635	9	113
1	1000002	\N	\N	2025-10-19 08:07:36	CANCEL	2025-10-19 10:06:11.395	2025-10-19 10:08:35.637	9	114
3	1000003	2025-10-20 00:20:05	2025-10-20 00:28:34	\N	END	2025-10-20 06:48:52.826	2025-10-20 07:44:33.87	12	126
16	1000003	\N	\N	2025-10-20 00:29:58	CANCEL	2025-10-20 07:28:24.616	2025-10-20 07:44:33.88	12	129
17	1000003	\N	\N	2025-10-20 00:30:02	CANCEL	2025-10-20 07:29:13.043	2025-10-20 07:44:33.883	12	130
18	1000003	\N	\N	2025-10-20 00:30:06	CANCEL	2025-10-20 07:29:48.609	2025-10-20 07:44:33.885	12	131
1	1000003	\N	\N	2025-10-20 05:47:42	CANCEL	2025-10-20 06:48:52.826	2025-10-20 07:47:44.151	12	127
2	1000003	\N	\N	2025-10-20 05:47:42	CANCEL	2025-10-20 06:48:52.826	2025-10-20 07:47:44.156	12	128
18	1000003	2025-10-20 00:48:25	2025-10-20 05:49:24.008	\N	END	2025-10-20 07:48:03.585	2025-10-20 07:49:23.774	13	129
17	1000003	\N	\N	2025-10-20 05:49:27	CANCEL	2025-10-20 07:48:03.585	2025-10-20 07:49:30.106	13	130
16	1000003	\N	\N	2025-10-20 05:49:27	CANCEL	2025-10-20 07:48:03.585	2025-10-20 07:49:30.108	13	131
15	1000003	\N	\N	2025-10-20 05:49:27	CANCEL	2025-10-20 07:48:03.585	2025-10-20 07:49:30.111	13	132
14	1000003	\N	\N	2025-10-20 05:49:27	CANCEL	2025-10-20 07:48:03.585	2025-10-20 07:49:30.114	13	133
13	1000003	\N	\N	2025-10-20 05:49:27	CANCEL	2025-10-20 07:48:03.585	2025-10-20 07:49:30.116	13	134
3	1000003	\N	\N	2025-10-20 05:49:27	CANCEL	2025-10-20 07:48:03.585	2025-10-20 07:49:30.118	13	135
2	1000003	\N	\N	2025-10-20 05:49:27	CANCEL	2025-10-20 07:48:03.585	2025-10-20 07:49:30.121	13	136
1	1000003	\N	\N	2025-10-20 05:49:27	CANCEL	2025-10-20 07:48:03.585	2025-10-20 07:49:30.125	13	137
3	1000002	2025-10-19 03:50:13	2025-10-19 03:51:10	\N	END	2025-10-19 10:46:51.051	2025-10-19 11:11:37.114	10	115
2	1000002	\N	\N	2025-10-19 03:52:47	CANCEL	2025-10-19 10:46:51.051	2025-10-19 11:11:37.12	10	116
1	1000002	2025-10-19 03:53:00	2025-10-19 03:55:47	\N	END	2025-10-19 10:46:51.051	2025-10-19 11:11:37.125	10	117
3	1000003	\N	\N	\N	WAIT	2025-10-19 13:05:55.228	2025-10-19 13:05:55.228	10	118
2	1000003	\N	\N	\N	WAIT	2025-10-19 13:05:55.228	2025-10-19 13:05:55.228	10	119
1	1000003	\N	\N	\N	WAIT	2025-10-19 13:05:55.228	2025-10-19 13:05:55.228	10	120
13	1000003	\N	\N	\N	WAIT	2025-10-20 06:21:25.791	2025-10-20 06:21:25.791	10	121
14	1000003	\N	\N	\N	WAIT	2025-10-20 06:34:57.054	2025-10-20 06:34:57.054	10	122
15	1000003	2025-10-20 04:40:01.573	2025-10-20 04:41:11.567	\N	END	2025-10-20 06:38:42.395	2025-10-20 06:41:11.288	11	126
14	1000003	2025-10-20 04:41:30.821	2025-10-20 04:41:43.539	\N	END	2025-10-20 06:37:10.349	2025-10-20 06:41:43.243	11	121
13	1000003	\N	\N	2025-10-20 04:41:47	CANCEL	2025-10-20 06:37:10.349	2025-10-20 06:41:56.604	11	122
3	1000003	\N	\N	2025-10-20 04:41:47	CANCEL	2025-10-20 06:37:10.349	2025-10-20 06:41:56.63	11	123
2	1000003	\N	\N	2025-10-20 04:41:47	CANCEL	2025-10-20 06:37:10.349	2025-10-20 06:41:56.636	11	124
1	1000003	\N	\N	2025-10-20 04:41:47	CANCEL	2025-10-20 06:37:10.349	2025-10-20 06:41:56.641	11	125
18	1000003	2025-10-18 08:49:58	2025-10-18 08:50:31	\N	END	2025-10-20 07:49:41.793	2025-10-20 08:29:14.177	14	138
17	1000003	\N	\N	2025-10-18 08:50:34	CANCEL	2025-10-20 07:49:41.793	2025-10-20 08:29:14.181	14	139
16	1000003	\N	\N	2025-10-18 08:50:41	CANCEL	2025-10-20 07:49:41.793	2025-10-20 08:29:14.189	14	140
15	1000003	\N	\N	2025-10-18 08:50:45	CANCEL	2025-10-20 07:49:41.793	2025-10-20 08:29:14.195	14	141
14	1000003	2025-10-18 08:50:49	2025-10-18 08:51:25	\N	END	2025-10-20 07:49:41.793	2025-10-20 08:29:14.201	14	142
13	1000003	\N	\N	2025-10-18 08:51:35	CANCEL	2025-10-20 07:49:41.793	2025-10-20 08:29:14.208	14	143
3	1000003	\N	\N	2025-10-18 08:51:35	CANCEL	2025-10-20 07:49:41.793	2025-10-20 08:29:14.214	14	144
2	1000003	\N	\N	2025-10-18 08:51:35	CANCEL	2025-10-20 07:49:41.793	2025-10-20 08:29:14.224	14	145
1	1000003	\N	\N	2025-10-18 08:51:35	CANCEL	2025-10-20 07:49:41.793	2025-10-20 08:29:14.232	14	146
\.


--
-- Name: Product_prodId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Product_prodId_seq"', 14, true);


--
-- Name: Reasons_reasonId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Reasons_reasonId_seq"', 12, true);


--
-- Name: Salesman_salesId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Salesman_salesId_seq"', 1000003, true);


--
-- Name: actions_actionId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."actions_actionId_seq"', 8, true);


--
-- Name: authorities_authorityId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."authorities_authorityId_seq"', 4, true);


--
-- Name: customers_customerId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."customers_customerId_seq"', 18, true);


--
-- Name: salesman_authorities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salesman_authorities_id_seq', 16, true);


--
-- Name: settings_settingId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."settings_settingId_seq"', 24, true);


--
-- Name: visits_visitId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."visits_visitId_seq"', 146, true);


--
-- Name: InvoiceHeader InvoiceHeader_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceHeader"
    ADD CONSTRAINT "InvoiceHeader_pkey" PRIMARY KEY ("invId", "salesId");


--
-- Name: Journies Journies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Journies"
    ADD CONSTRAINT "Journies_pkey" PRIMARY KEY ("journeyId", "salesId");


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("prodId");


--
-- Name: Reasons Reasons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reasons"
    ADD CONSTRAINT "Reasons_pkey" PRIMARY KEY ("reasonId");


--
-- Name: Salesman Salesman_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Salesman"
    ADD CONSTRAINT "Salesman_pkey" PRIMARY KEY ("salesId");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: action_details action_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_details
    ADD CONSTRAINT action_details_pkey PRIMARY KEY (id, "journeyId", "visitId");


--
-- Name: actions actions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT actions_pkey PRIMARY KEY ("actionId");


--
-- Name: authorities authorities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authorities
    ADD CONSTRAINT authorities_pkey PRIMARY KEY ("authorityId");


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY ("customerId");


--
-- Name: InvoiceItem invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY ("invoiceHeaderId", "invItem");


--
-- Name: prod_uom prod_uom_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prod_uom
    ADD CONSTRAINT prod_uom_pkey PRIMARY KEY ("prodId", uom);


--
-- Name: salesman_authorities salesman_authorities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salesman_authorities
    ADD CONSTRAINT salesman_authorities_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY ("settingId");


--
-- Name: visits visits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_pkey PRIMARY KEY ("visitId", "salesId", "journeyId");


--
-- Name: Product_baseUom_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_baseUom_idx" ON public."Product" USING btree ("baseUom");


--
-- Name: Product_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_category_idx" ON public."Product" USING btree (category);


--
-- Name: Salesman_phone_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Salesman_phone_key" ON public."Salesman" USING btree (phone);


--
-- Name: authorities_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "authorities_createdAt_idx" ON public.authorities USING btree ("createdAt");


--
-- Name: authorities_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authorities_name_idx ON public.authorities USING btree (name);


--
-- Name: authorities_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX authorities_name_key ON public.authorities USING btree (name);


--
-- Name: authorities_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authorities_type_idx ON public.authorities USING btree (type);


--
-- Name: customers_createdAt_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "customers_createdAt_customerId_idx" ON public.customers USING btree ("createdAt", "customerId");


--
-- Name: customers_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "customers_createdAt_idx" ON public.customers USING btree ("createdAt");


--
-- Name: customers_industry_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_industry_idx ON public.customers USING btree (industry);


--
-- Name: customers_latitude_longitude_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_latitude_longitude_idx ON public.customers USING btree (latitude, longitude);


--
-- Name: customers_name_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "customers_name_createdAt_idx" ON public.customers USING btree (name, "createdAt");


--
-- Name: customers_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_name_idx ON public.customers USING btree (name);


--
-- Name: customers_name_industry_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX customers_name_industry_idx ON public.customers USING btree (name, industry);


--
-- Name: prod_uom_barcode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX prod_uom_barcode_key ON public.prod_uom USING btree (barcode);


--
-- Name: salesman_authorities_authorityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "salesman_authorities_authorityId_idx" ON public.salesman_authorities USING btree ("authorityId");


--
-- Name: salesman_authorities_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "salesman_authorities_createdAt_idx" ON public.salesman_authorities USING btree ("createdAt");


--
-- Name: salesman_authorities_salesmanId_authorityId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "salesman_authorities_salesmanId_authorityId_key" ON public.salesman_authorities USING btree ("salesmanId", "authorityId");


--
-- Name: salesman_authorities_salesmanId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "salesman_authorities_salesmanId_idx" ON public.salesman_authorities USING btree ("salesmanId");


--
-- Name: settings_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX settings_name_key ON public.settings USING btree (name);


--
-- Name: visits_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "visits_createdAt_idx" ON public.visits USING btree ("createdAt");


--
-- Name: visits_custId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "visits_custId_idx" ON public.visits USING btree ("custId");


--
-- Name: visits_custId_salesId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "visits_custId_salesId_idx" ON public.visits USING btree ("custId", "salesId");


--
-- Name: visits_salesId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "visits_salesId_idx" ON public.visits USING btree ("salesId");


--
-- Name: visits_startTime_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "visits_startTime_idx" ON public.visits USING btree ("startTime");


--
-- Name: visits_status_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "visits_status_createdAt_idx" ON public.visits USING btree (status, "createdAt");


--
-- Name: visits_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX visits_status_idx ON public.visits USING btree (status);


--
-- Name: InvoiceHeader InvoiceHeader_custId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceHeader"
    ADD CONSTRAINT "InvoiceHeader_custId_fkey" FOREIGN KEY ("custId") REFERENCES public.customers("customerId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceHeader InvoiceHeader_journeyId_salesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceHeader"
    ADD CONSTRAINT "InvoiceHeader_journeyId_salesId_fkey" FOREIGN KEY ("journeyId", "salesId") REFERENCES public."Journies"("journeyId", "salesId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceHeader InvoiceHeader_reasonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceHeader"
    ADD CONSTRAINT "InvoiceHeader_reasonId_fkey" FOREIGN KEY ("reasonId") REFERENCES public."Reasons"("reasonId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceHeader InvoiceHeader_salesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceHeader"
    ADD CONSTRAINT "InvoiceHeader_salesId_fkey" FOREIGN KEY ("salesId") REFERENCES public."Salesman"("salesId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceHeader InvoiceHeader_visitId_salesId_journeyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceHeader"
    ADD CONSTRAINT "InvoiceHeader_visitId_salesId_journeyId_fkey" FOREIGN KEY ("visitId", "salesId", "journeyId") REFERENCES public.visits("visitId", "salesId", "journeyId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceItem InvoiceItem_reasonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_reasonId_fkey" FOREIGN KEY ("reasonId") REFERENCES public."Reasons"("reasonId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Journies Journies_salesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Journies"
    ADD CONSTRAINT "Journies_salesId_fkey" FOREIGN KEY ("salesId") REFERENCES public."Salesman"("salesId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: action_details action_details_actionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_details
    ADD CONSTRAINT "action_details_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES public.actions("actionId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: action_details action_details_visitId_salesId_journeyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_details
    ADD CONSTRAINT "action_details_visitId_salesId_journeyId_fkey" FOREIGN KEY ("visitId", "salesId", "journeyId") REFERENCES public.visits("visitId", "salesId", "journeyId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: prod_uom prod_uom_prodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prod_uom
    ADD CONSTRAINT "prod_uom_prodId_fkey" FOREIGN KEY ("prodId") REFERENCES public."Product"("prodId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: salesman_authorities salesman_authorities_authorityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salesman_authorities
    ADD CONSTRAINT "salesman_authorities_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES public.authorities("authorityId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: salesman_authorities salesman_authorities_salesmanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salesman_authorities
    ADD CONSTRAINT "salesman_authorities_salesmanId_fkey" FOREIGN KEY ("salesmanId") REFERENCES public."Salesman"("salesId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: visits visits_custId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT "visits_custId_fkey" FOREIGN KEY ("custId") REFERENCES public.customers("customerId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: visits visits_journeyId_salesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT "visits_journeyId_salesId_fkey" FOREIGN KEY ("journeyId", "salesId") REFERENCES public."Journies"("journeyId", "salesId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: visits visits_salesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT "visits_salesId_fkey" FOREIGN KEY ("salesId") REFERENCES public."Salesman"("salesId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

