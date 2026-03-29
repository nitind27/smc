-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 29, 2026 at 04:36 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `smc_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` char(36) NOT NULL,
  `action` varchar(255) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` char(36) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bills`
--

CREATE TABLE `bills` (
  `id` char(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `submitted_by` char(36) NOT NULL,
  `approved_by` char(36) DEFAULT NULL,
  `department_id` char(36) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bills`
--

INSERT INTO `bills` (`id`, `title`, `amount`, `status`, `submitted_by`, `approved_by`, `department_id`, `description`, `created_at`, `updated_at`) VALUES
('08682ac7-10c7-4f1f-9ae4-eae27bc554e5', 'road repair materials', 56000.00, 'rejected', '2aeef2fe-a4f9-4b6a-9551-aab3b3257668', 'user-admin', NULL, 'hdfvksurg', '2026-03-13 09:27:36.843', '2026-03-17 05:16:45.324'),
('4119b361-6e25-436b-ab4a-2d168af0ea16', 'road repair material', 500.00, 'approved', '2aeef2fe-a4f9-4b6a-9551-aab3b3257668', NULL, NULL, ',jvblwjgkjhifvkjnr', '2026-03-12 11:00:12.641', '2026-03-12 12:02:39.861'),
('4e77050f-dcf2-451b-814d-3d1cd1afd95d', 'road repair', 450000.00, 'pending', 'user-admin', NULL, 'dept-1', 'jsdvhfayd hdvjyhage hvhjqe', '2026-03-17 05:17:15.179', '2026-03-17 05:17:15.179'),
('85b4863e-0601-40f1-a744-fe8f70dbc0f9', 'road repair', 4500000.00, 'approved', '2aeef2fe-a4f9-4b6a-9551-aab3b3257668', NULL, NULL, 'wdmbflqr', '2026-03-13 06:48:56.843', '2026-03-13 06:49:12.166'),
('e12c7d79-c924-4f4f-ac50-3c30dc5ec55d', 'road repair materials', 500.00, 'approved', '2aeef2fe-a4f9-4b6a-9551-aab3b3257668', NULL, NULL, 'cjhasdbgiugfc jsbfureh jbxjcjd jsbdjgu jhjohed oisduhed cvbbfh jcjh', '2026-03-12 11:21:26.275', '2026-03-12 12:02:35.881');

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `id` char(36) NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(100) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'submitted',
  `priority` varchar(20) NOT NULL DEFAULT 'medium',
  `submitted_by` varchar(255) NOT NULL,
  `assigned_to` char(36) DEFAULT NULL,
  `department_id` char(36) DEFAULT NULL,
  `location` varchar(500) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `public_id` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `complaints`
--

INSERT INTO `complaints` (`id`, `title`, `description`, `category`, `status`, `priority`, `submitted_by`, `assigned_to`, `department_id`, `location`, `created_at`, `updated_at`, `public_id`) VALUES
('085007c9-ae7a-4986-b0a1-a22415f874f5', 'mndbfrj jfk  ;kwr krhknkd  knfkwkr knfkjr knkr', 'cvhhfuj  jhbdvuhbr jjf djoirjin bgf hgfiqhikhkf i hfifb', 'Water', 'resolved', 'high', 'admin@municipal.gov', NULL, NULL, 'near central park', '2026-03-13 06:51:06.153', '2026-03-20 07:45:59.443', 'CEVZD31469'),
('1ec26a97-4b01-4be7-a827-6f39041d77c5', 'jhbvkgdf', 'kdjfnjr jnvknr dnj', 'Other', 'submitted', 'medium', 'pm9665846@gmail.com', NULL, NULL, 'block a main road', '2026-03-20 07:20:30.619', '2026-03-20 07:45:59.453', 'APYBF99969'),
('296182b2-0db2-4a69-a088-19f6316ff464', 'jgsfvujfdjbvj', 'nbdfvje bjsehf vbcjhb hbvjchbe hbvjbvr', 'Water', 'submitted', 'medium', 'pm9665846@gmail.com', NULL, NULL, 'black A main road', '2026-03-20 07:10:14.520', '2026-03-20 07:45:59.462', 'BCUTF65678'),
('31a67000-cb4d-42ed-8c6e-813251261442', ',menf ', 'mndfbke', 'Street Light', 'resolved', 'low', 'admin@municipal.gov', NULL, NULL, NULL, '2026-03-13 09:35:02.602', '2026-03-20 07:45:59.466', 'XOYRN71695'),
('3d2e15de-f338-4393-beda-d3a9b63e7d78', 'dfgdhh', 'chshgsr', 'Sanitation', 'resolved', 'medium', 'admin@municipal.gov', NULL, NULL, 'dzfgdfth', '2026-03-12 07:23:43.736', '2026-03-20 07:45:59.471', 'JJJGZ55199'),
('40a03616-68ba-4004-95bf-febf5c215977', '.mzdfnbvdsjlakfjblj ', 'jlahb sjbhcjkaer jdchaje', 'Other', 'submitted', 'medium', 'pm9665846@gmail.com', NULL, NULL, 'sjdbfr', '2026-03-20 07:43:39.985', '2026-03-20 07:45:59.479', 'RJRPY46479'),
('4b77c9ea-a7a0-4efd-951a-136a6dccae91', 'ksuhflua', 'khfglr', 'Other', 'submitted', 'medium', 'pm9665846@gmail.com', NULL, NULL, 'jrbfjer', '2026-03-20 09:09:17.287', '2026-03-20 09:09:17.287', NULL),
('4f728530-2411-4f9b-84de-15979dad8372', ',shdgfvmhbjah  ', 'ashbcdja', 'Other', 'submitted', 'medium', 'pm9665846@gmail.com', NULL, NULL, 'amnbvfjl', '2026-03-20 07:47:20.901', '2026-03-20 07:47:20.901', NULL),
('7c6ddc86-4d0a-4f42-aa79-1d1aa597436d', 'mnbfjehr', 'dmfjdhfjdbfd nbfefh jshbjr', 'Drainage', 'resolved', 'high', 'admin@municipal.gov', NULL, NULL, 'near central park', '2026-03-13 09:31:26.079', '2026-03-20 07:45:59.489', 'RHMKB60077'),
('a639c4ce-7a89-49f1-b9eb-2447df75b2df', 'jhdfbvskjh', 'jhfbgr', 'Other', 'submitted', 'medium', 'pm9665846@gmail.com', NULL, NULL, 'mvhbsjfh', '2026-03-20 09:15:37.548', '2026-03-20 09:15:37.548', NULL),
('a69f9a4b-fc24-4911-8864-bd12fb2aaeb5', 'cbsvdfhg', 'jdhgfjf hdfkjhfi jfhiwr', 'Sanitation', 'submitted', 'medium', 'citizen@email.com', NULL, NULL, 'near central park', '2026-03-16 07:14:36.234', '2026-03-20 07:45:59.496', 'FXGJO62892'),
('d26b9556-b1e8-42af-a793-71cf02be97da', 'md,hfbvksjdh', 'dhfbj nhbvkjar nbvkjgar', 'Water', 'submitted', 'medium', 'pm9665846@gmail.com', NULL, NULL, 'mhdfbvjdr', '2026-03-20 07:27:49.540', '2026-03-20 07:45:59.500', 'CAXKJ79022'),
('e83651a8-9cb9-44e0-8286-c722e9938804', 'jhdgfehf', 'jdhbfuef jgfuhefu jgdjhe', 'Water', 'submitted', 'high', 'admin@municipal.gov', NULL, NULL, 'near central park', '2026-03-16 05:15:14.942', '2026-03-20 07:45:59.504', 'HCHNB41507'),
('f7af74e5-bc8f-451e-bf2d-3f2ae6c9a25e', 'ktfyu', 'mnhgcfhtrdf', 'Sanitation', 'resolved', 'medium', 'admin@municipal.gov', NULL, NULL, 'near central park', '2026-03-12 07:23:24.541', '2026-03-20 07:45:59.509', 'UFNZG30919'),
('JLOTB78827', 'light', 'damage', 'Roads', 'submitted', 'medium', 'nitindube227@gmail.com', NULL, NULL, 'Majura Taluka,  Surat,  Gujarat', '2026-03-28 11:10:45.222', '2026-03-28 11:10:45.222', NULL),
('RMNGA54069', 'mxncbvljkfhfbr', 'xhbvjabd', 'Other', 'submitted', 'medium', 'pm9665846@gmail.com', NULL, NULL, 'dmfbvjl', '2026-03-20 09:17:12.814', '2026-03-20 09:17:12.814', NULL),
('SMGXG24848', 'road', 'damage', 'Other', 'resolved', 'medium', 'abdullahmalek555@gmail.com', NULL, NULL, 'surat', '2026-03-27 05:39:37.114', '2026-03-27 05:42:50.937', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `complaint_attachments`
--

CREATE TABLE `complaint_attachments` (
  `id` char(36) NOT NULL,
  `complaint_id` char(36) NOT NULL,
  `file_url` varchar(512) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `complaint_attachments`
--

INSERT INTO `complaint_attachments` (`id`, `complaint_id`, `file_url`, `file_name`, `created_at`) VALUES
('299b9ae4-4657-4194-8cef-9c624ad7f43a', 'SMGXG24848', '/uploads/1774589976669-578o5wqh2i.jpg', NULL, '2026-03-27 05:39:37.123'),
('b6d83178-9a5f-4422-80c2-bfc9dc347bdd', 'JLOTB78827', '/uploads/1774696244930-1d7vq25zs0e.jpeg', NULL, '2026-03-28 11:10:45.240');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `head_id` char(36) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `head_id`, `created_at`, `updated_at`) VALUES
('dept-1', 'Public Works', 'user-head-1', '2026-03-16 12:32:41.047', '2026-03-28 22:04:31.779'),
('dept-2', 'Sanitation', NULL, '2026-03-28 22:04:31.779', '2026-03-28 22:04:31.779'),
('dept-3', 'Water Supply', NULL, '2026-03-28 22:04:31.779', '2026-03-28 22:04:31.779'),
('dept-4', 'Housing', NULL, '2026-03-28 22:04:31.779', '2026-03-28 22:04:31.779'),
('dept-5', 'Street Lighting', NULL, '2026-03-28 22:04:31.779', '2026-03-28 22:04:31.779'),
('dept-6', 'Parks & Gardens', NULL, '2026-03-28 22:04:31.779', '2026-03-28 22:04:31.779');

-- --------------------------------------------------------

--
-- Table structure for table `discussions`
--

CREATE TABLE `discussions` (
  `id` char(36) NOT NULL,
  `meeting_id` char(36) NOT NULL,
  `topic` varchar(500) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'open',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discussion_posts`
--

CREATE TABLE `discussion_posts` (
  `id` char(36) NOT NULL,
  `discussion_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hero_slides`
--

CREATE TABLE `hero_slides` (
  `id` char(36) NOT NULL,
  `image_url` varchar(512) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` varchar(500) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hero_slides`
--

INSERT INTO `hero_slides` (`id`, `image_url`, `title`, `subtitle`, `link_url`, `order`, `active`, `created_at`, `updated_at`) VALUES
('08478072-4014-41ab-b87c-40728dd5d780', '/uploads/1774719364652-2igzdsv1ioo.jpg', NULL, NULL, NULL, 0, 1, '2026-03-28 17:36:04.709', '2026-03-28 17:36:04.709'),
('09c4427d-b061-4890-a208-3eee5cd88881', '/uploads/1774719347231-wno9ln9lg6l.jpg', NULL, NULL, NULL, 0, 1, '2026-03-28 17:35:47.248', '2026-03-28 17:35:47.248'),
('2e30c97a-0d04-4a38-aa99-4dea762d639b', '/uploads/1774719333255-qcy66225sih.jpg', NULL, NULL, NULL, 0, 1, '2026-03-28 17:35:33.277', '2026-03-28 17:35:33.277'),
('4cca603f-f6e1-4419-9be6-dd8ce33d4fef', '/uploads/1774719372224-p9lgrljqtal.jpg', NULL, NULL, NULL, 0, 1, '2026-03-28 17:36:12.248', '2026-03-28 17:36:12.248'),
('78a5c4a1-3e61-4843-823d-9a8fe161b9d3', '/uploads/1774719340147-8y8drixa2u5.jpg', NULL, NULL, NULL, 0, 1, '2026-03-28 17:35:40.170', '2026-03-28 17:35:40.170'),
('f25cbb79-31f3-4024-9ea4-ed2e762a64fd', '/uploads/1774719306716-uuejym3t63n.webp', 'smc', NULL, NULL, 0, 1, '2026-03-28 17:35:07.069', '2026-03-28 17:35:07.069'),
('fa21247a-0823-44e2-a215-e03b49c17f90', '/uploads/1774719356584-aa4pcr8ht9t.jpg', NULL, NULL, NULL, 0, 1, '2026-03-28 17:35:56.605', '2026-03-28 17:35:56.605');

-- --------------------------------------------------------

--
-- Table structure for table `meetings`
--

CREATE TABLE `meetings` (
  `id` char(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `agenda` text DEFAULT NULL,
  `meeting_date` date NOT NULL,
  `meeting_time` time NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'scheduled',
  `department_id` char(36) DEFAULT NULL,
  `complaint_id` char(10) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `meetings`
--

INSERT INTO `meetings` (`id`, `title`, `agenda`, `meeting_date`, `meeting_time`, `status`, `department_id`, `complaint_id`, `created_at`, `updated_at`) VALUES
('566046a4-4bb4-4ee0-9e4e-ed599b32598c', 'mn fjr', 'mndfjr', '2026-03-23', '03:30:00', 'scheduled', NULL, 'RMNGA54069', '2026-03-24 07:23:57.492', '2026-03-24 07:23:57.492'),
('d40e4fbe-afa8-4279-a046-4ea9895ac386', 'bmsvd cnbd', 'njbjhr', '2026-03-23', '03:30:00', 'scheduled', 'dept-1', NULL, '2026-03-24 07:26:13.258', '2026-03-24 07:26:13.258');

-- --------------------------------------------------------

--
-- Table structure for table `meeting_participants`
--

CREATE TABLE `meeting_participants` (
  `id` char(36) NOT NULL,
  `meeting_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `meeting_participants`
--

INSERT INTO `meeting_participants` (`id`, `meeting_id`, `user_id`, `created_at`) VALUES
('4e89ca99-e32c-458e-8e32-a0ae3acc122c', '566046a4-4bb4-4ee0-9e4e-ed599b32598c', '01416c33-fda8-4663-b007-ad5bd7c9e497', '2026-03-24 07:23:57.492'),
('aea5368f-2c3f-439a-886b-bfd2dff370b9', 'd40e4fbe-afa8-4279-a046-4ea9895ac386', 'user-staff-1', '2026-03-24 07:26:13.258');

-- --------------------------------------------------------

--
-- Table structure for table `notices`
--

CREATE TABLE `notices` (
  `id` char(36) NOT NULL,
  `title` varchar(500) NOT NULL,
  `body` text DEFAULT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'announcement',
  `published_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `pdf_url` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notices`
--

INSERT INTO `notices` (`id`, `title`, `body`, `type`, `published_at`, `created_at`, `updated_at`, `pdf_url`) VALUES
('4403a04e-1520-4552-a6ed-199730898afa', 'jdfjf', 'kjnvpjf', 'event', '2026-03-23 05:49:50.970', '2026-03-23 05:49:50.970', '2026-03-23 05:49:50.970', '/uploads/1774244990965-4l5grbqymm.pdf'),
('8ed40747-8527-4160-9b87-0da316eb9982', 'mxbnvc,jhdf', 's,nfvb,jsdfh', 'event', '2026-03-23 06:27:22.186', '2026-03-23 06:27:22.186', '2026-03-23 06:27:22.186', '/uploads/1774247242175-r1x2sjwc39d.pdf'),
('a0c8ec2d-d278-48a0-912c-49918fe88fc4', 'nbv,nj', ',nhvhfkhgj', 'event', '2026-03-23 06:03:07.658', '2026-03-23 06:03:07.658', '2026-03-23 06:03:07.658', '/uploads/1774245787651-g1qmsm0tzwg.pdf'),
('d3055207-75c7-4a21-9438-08a7f6c7991a', 'mn vkjfr', 'kjfnvljr  jnr kivni', 'other', '2026-03-23 05:49:31.798', '2026-03-23 05:49:31.798', '2026-03-23 05:49:31.798', '/uploads/1774244971788-uv1s0k2q62.pdf'),
('d8025441-bc50-42ec-ba50-fe158f45f753', 'mn vkjfr', NULL, 'announcement', '2026-03-27 05:45:32.945', '2026-03-27 05:45:32.945', '2026-03-27 05:45:32.945', '/uploads/1774590332938-0wt1grf3xvtg.pdf');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `title` varchar(500) NOT NULL,
  `body` text DEFAULT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'info',
  `read_at` datetime(3) DEFAULT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` char(36) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `otp_verifications`
--

CREATE TABLE `otp_verifications` (
  `id` char(36) NOT NULL,
  `phone_or_email` varchar(255) NOT NULL,
  `otp` varchar(10) NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `otp_verifications`
--

INSERT INTO `otp_verifications` (`id`, `phone_or_email`, `otp`, `expires_at`, `created_at`) VALUES
('0372c780-8ff4-4d44-89d7-1dcb7a8b8993', 'nitindube227@gmail.com', '970301', '2026-03-28 11:19:42.964', '2026-03-28 11:09:42.966'),
('313b3791-1b9c-43b2-bd87-0722013fd03a', 'admin@municipal.gov', '327633', '2026-03-23 07:03:01.549', '2026-03-23 06:53:01.553'),
('3985b8fc-216c-4206-8cfc-efca2da11ca7', '9512251585', '123456', '2026-03-20 07:15:17.200', '2026-03-20 07:05:17.206'),
('4e805a24-0a4f-499f-a14e-24f8a669094a', 'admin@municipal.gov', '241805', '2026-03-28 10:33:49.119', '2026-03-28 10:23:49.121'),
('59dc6881-dd8a-4959-8559-b2dcdefc6be8', 'pm9665846@gmail.com', '615896', '2026-03-20 09:18:01.362', '2026-03-20 09:08:01.364'),
('5a968635-cb6f-4fb1-ae13-4d950c777f80', 'pm9665846@gmail.com', '123456', '2026-03-20 07:16:32.434', '2026-03-20 07:06:32.436'),
('5c8abe03-9757-4ca6-8102-147467565007', 'abdullahmalek555@gmail.com', '176382', '2026-03-27 05:47:59.934', '2026-03-27 05:37:59.952'),
('6f16e69e-a24f-4c68-b7a4-63554a70a16a', 'pm9665846@gmail.com', '974791', '2026-03-20 07:36:47.604', '2026-03-20 07:26:47.606'),
('93a6a5e7-18d1-45c0-82fc-752a51877fa7', 'pm9665846@gmail.com', '227883', '2026-03-20 09:24:37.927', '2026-03-20 09:14:37.928'),
('ab25d78e-e394-4b00-82d7-d04d1e62146c', 'nitindube227@gmail.com', '812661', '2026-03-28 11:10:22.036', '2026-03-28 11:00:22.046'),
('abfc3a5b-a3bd-47a6-8b5c-1fd3bfb168d4', 'pm9665846@gmail.com', '123456', '2026-03-20 07:19:05.121', '2026-03-20 07:09:05.123'),
('b2b82b89-35b3-4b8b-b88b-66c182f80c4d', 'pm9665846@gmail.com', '396936', '2026-03-20 09:26:23.222', '2026-03-20 09:16:23.224'),
('b4f5a3fb-be0f-4393-8963-276aefceb7c0', 'pm9665846@gmail.com', '647864', '2026-03-20 07:29:09.568', '2026-03-20 07:19:09.569'),
('bc28cfbc-2c89-4889-9041-a36e05c80c5f', '9512251585', '461550', '2026-03-20 07:28:55.359', '2026-03-20 07:18:55.361'),
('bf4f159c-094e-4cf5-be68-cae4c29c142d', 'pm9665846@gmail.com', '538610', '2026-03-20 07:49:36.063', '2026-03-20 07:39:36.065'),
('c06c6ec3-4c98-49ff-98b1-3886f6d4b786', 'pm9665846@gmail.com', '725664', '2026-03-20 07:24:36.954', '2026-03-20 07:14:36.955'),
('d37ed5e9-27ce-43a5-b78e-94a6f9a8b234', 'pm9665846@gmail.com', '583267', '2026-03-20 07:43:19.701', '2026-03-20 07:33:19.703'),
('dc6bc426-f1d6-460e-a6fd-4411fc1b23cc', 'pm9665846@gmail.com', '215252', '2026-03-20 07:31:55.929', '2026-03-20 07:21:55.930'),
('e4016a06-d3ef-4890-b077-77da474b344f', 'pm9665846@gmail.com', '574704', '2026-03-20 07:44:40.503', '2026-03-20 07:34:40.505'),
('e6e0085a-222b-4083-998a-6f86c1af6e8c', '9512251585', '123456', '2026-03-20 07:21:14.222', '2026-03-20 07:11:14.225'),
('ea2f100b-7c9f-4803-8c44-958246bd6bff', 'pm9665846@gmail.com', '621154', '2026-03-20 07:56:31.044', '2026-03-20 07:46:31.046'),
('f83edb08-a871-4e6b-a348-34639dc89058', 'pm9665846@gmail.com', '557246', '2026-03-23 07:09:33.583', '2026-03-23 06:59:33.585'),
('fdf5f052-fb84-4897-a3a6-3d1ec7cf12c2', 'pm9665846@gmail.com', '391924', '2026-03-20 07:52:26.771', '2026-03-20 07:42:26.773');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` char(36) NOT NULL,
  `bill_id` char(36) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `reference` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `department_id` char(36) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `progress` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `department_id`, `status`, `progress`, `created_at`, `updated_at`) VALUES
('6afe8ab8-2143-4679-984c-2060c9feafbf', 'road repair', 'dept-1', 'completed', 66, '2026-03-23 07:30:11.021', '2026-03-23 07:30:11.021');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` char(36) NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'todo',
  `priority` varchar(20) NOT NULL DEFAULT 'medium',
  `assignee_id` char(36) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `project_id` char(36) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `description`, `status`, `priority`, `assignee_id`, `due_date`, `project_id`, `sort_order`, `created_at`, `updated_at`) VALUES
('fbefbb19-fb0b-4297-82ba-5d178a3d56ad', 'inspect drainege repair', NULL, 'todo', 'high', 'user-auditor', '2026-03-23', '6afe8ab8-2143-4679-984c-2060c9feafbf', 0, '2026-03-23 07:31:12.185', '2026-03-23 07:31:12.185');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'public',
  `department_id` char(36) DEFAULT NULL,
  `avatar` varchar(512) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `department_id`, `avatar`, `created_at`, `updated_at`) VALUES
('01416c33-fda8-4663-b007-ad5bd7c9e497', 'nitin dube', 'nitin@gmail.com', '$2b$10$LwP6MG1mTqeo2lfaGXzIlu.rIqS9TykaB/xsuxDFnJXiqqMCK/U.G', 'staff', 'dept-1', NULL, '2026-03-23 09:02:08.094', '2026-03-23 09:02:08.094'),
('2aeef2fe-a4f9-4b6a-9551-aab3b3257668', 'Prachi Mishra', 'nitindube227@gmail.com', '$2b$10$4OIyjQ1a3A/gj621j6MGku7TshAx7KdAL8vUqwpZhyWiLRHIzWPsa', 'staff', NULL, NULL, '2026-03-12 08:41:40.463', '2026-03-28 10:24:54.197'),
('70f4bfe6-4368-462f-b5ab-2f05874f5909', 'john doe', 'john1example@gmail.com', '$2b$10$qy5ZPm5rmZISBCvFlwAwmes0amTvmffECcGVt2ABY4v/zzwa9JOti', 'staff', NULL, NULL, '2026-03-13 06:50:10.358', '2026-03-16 12:09:45.413'),
('9308d399-b9a7-403a-a24e-513c72c90eef', 'mishra', 'mishra1234@gmail.com', '$2b$10$qy5ZPm5rmZISBCvFlwAwmes0amTvmffECcGVt2ABY4v/zzwa9JOti', 'staff', NULL, NULL, '2026-03-13 09:30:44.718', '2026-03-16 12:09:45.413'),
('fedc702f-7766-4bad-91fe-3e9d8d999f19', 'nitin dubey', 'nittin@gmail.com', '$2b$10$6teyIaRmXzKTG1M2WjkmG.XOthQ4NQAlRmUSEfrnq47s34UXAjsX.', 'staff', NULL, NULL, '2026-03-23 09:02:34.782', '2026-03-23 09:02:34.782'),
('user-admin', 'Municipal Admin', 'admin@municipal.gov', '$2b$10$qy5ZPm5rmZISBCvFlwAwmes0amTvmffECcGVt2ABY4v/zzwa9JOti', 'admin', NULL, NULL, '2026-03-16 12:32:41.140', '2026-03-28 22:04:31.819'),
('user-auditor', 'Auditor Sharma', 'auditor@municipal.gov', '$2b$10$qy5ZPm5rmZISBCvFlwAwmes0amTvmffECcGVt2ABY4v/zzwa9JOti', 'auditor', NULL, NULL, '2026-03-16 12:32:41.140', '2026-03-28 22:04:31.819'),
('user-collector', 'Collector Priya Mehta', 'collector@gov.in', '$2b$10$qy5ZPm5rmZISBCvFlwAwmes0amTvmffECcGVt2ABY4v/zzwa9JOti', 'collector', NULL, NULL, '2026-03-28 22:04:31.819', '2026-03-28 22:04:31.819'),
('user-dc', 'DC Rajesh Verma', 'dc@gov.in', '$2b$10$qy5ZPm5rmZISBCvFlwAwmes0amTvmffECcGVt2ABY4v/zzwa9JOti', 'dc', NULL, NULL, '2026-03-28 22:04:31.819', '2026-03-28 22:04:31.819'),
('user-head-1', 'Dept. Head Singh', 'head@municipal.gov', '$2b$10$qy5ZPm5rmZISBCvFlwAwmes0amTvmffECcGVt2ABY4v/zzwa9JOti', 'department_head', 'dept-1', NULL, '2026-03-16 12:32:41.140', '2026-03-28 22:04:31.819'),
('user-po', 'Ward Officer Patel', 'po@municipal.gov', '$2b$10$qy5ZPm5rmZISBCvFlwAwmes0amTvmffECcGVt2ABY4v/zzwa9JOti', 'po', NULL, NULL, '2026-03-28 22:04:31.819', '2026-03-28 22:04:31.819'),
('user-public-1', 'Citizen Rao', 'citizen@email.com', '$2b$10$qy5ZPm5rmZISBCvFlwAwmes0amTvmffECcGVt2ABY4v/zzwa9JOti', 'public', NULL, NULL, '2026-03-16 12:32:41.140', '2026-03-28 22:04:31.819'),
('user-staff-1', 'Staff Kumar', 'staff@municipal.gov', '$2b$10$qy5ZPm5rmZISBCvFlwAwmes0amTvmffECcGVt2ABY4v/zzwa9JOti', 'staff', 'dept-1', NULL, '2026-03-16 12:32:41.140', '2026-03-28 22:04:31.819');

-- --------------------------------------------------------

--
-- Table structure for table `worker_salaries`
--

CREATE TABLE `worker_salaries` (
  `id` char(36) NOT NULL,
  `worker_id` char(36) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `month` varchar(7) NOT NULL COMMENT 'Format: YYYY-MM',
  `note` varchar(500) DEFAULT NULL,
  `paid_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `worker_salaries`
--

INSERT INTO `worker_salaries` (`id`, `worker_id`, `amount`, `month`, `note`, `paid_at`, `created_at`) VALUES
('42d7ef26-790e-4441-8bac-030abb34746d', 'user-head-1', 50000.00, '2026-03', NULL, '2026-03-24 07:44:30.507', '2026-03-24 07:44:30.507'),
('4ac41192-f47c-4235-a577-94eea00d9276', 'fedc702f-7766-4bad-91fe-3e9d8d999f19', 35000.00, '2026-03', NULL, '2026-03-24 08:25:59.955', '2026-03-24 08:25:59.955'),
('50b7f91f-3f6e-48f9-9d19-46a1aa6d1be1', '01416c33-fda8-4663-b007-ad5bd7c9e497', 60000.00, '2026-03', NULL, '2026-03-24 07:44:12.457', '2026-03-24 07:44:12.457'),
('afb19761-f64f-46f1-a61b-83c471baa5ec', 'user-head-1', 70000.00, '2026-03', NULL, '2026-03-24 07:43:41.668', '2026-03-24 07:43:41.668'),
('b38dc624-586b-429d-922e-17820b3d3943', '9308d399-b9a7-403a-a24e-513c72c90eef', 50000.00, '2026-03', NULL, '2026-03-24 07:42:56.735', '2026-03-24 07:42:56.735'),
('b94ba325-43d3-4eda-b68c-3fa9fc4d1c2d', 'user-admin', 25000.00, '2026-03', NULL, '2026-03-23 09:24:08.079', '2026-03-23 09:24:08.079'),
('c861a714-d863-4010-b61c-404f71f9a378', '70f4bfe6-4368-462f-b5ab-2f05874f5909', 45000.00, '2026-03', NULL, '2026-03-24 07:43:22.874', '2026-03-24 07:43:22.874'),
('c986d672-66cc-4f3c-99f2-703d55e5d7d7', 'user-auditor', 30000.00, '2026-03', NULL, '2026-03-24 07:43:55.036', '2026-03-24 07:43:55.036');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bills`
--
ALTER TABLE `bills`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bills_department_id_idx` (`department_id`),
  ADD KEY `bills_submitted_by_idx` (`submitted_by`),
  ADD KEY `bills_approved_by_fkey` (`approved_by`);

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `complaints_public_id_key` (`public_id`),
  ADD KEY `complaints_department_id_idx` (`department_id`),
  ADD KEY `complaints_assigned_to_idx` (`assigned_to`);

--
-- Indexes for table `complaint_attachments`
--
ALTER TABLE `complaint_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `complaint_attachments_complaint_id_idx` (`complaint_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `departments_head_id_key` (`head_id`),
  ADD KEY `departments_head_id_idx` (`head_id`);

--
-- Indexes for table `discussions`
--
ALTER TABLE `discussions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `discussions_meeting_id_idx` (`meeting_id`);

--
-- Indexes for table `discussion_posts`
--
ALTER TABLE `discussion_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `discussion_posts_discussion_id_idx` (`discussion_id`),
  ADD KEY `discussion_posts_user_id_fkey` (`user_id`);

--
-- Indexes for table `hero_slides`
--
ALTER TABLE `hero_slides`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hero_slides_active_order_idx` (`active`,`order`);

--
-- Indexes for table `meetings`
--
ALTER TABLE `meetings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `meetings_department_id_idx` (`department_id`),
  ADD KEY `meetings_complaint_id_idx` (`complaint_id`);

--
-- Indexes for table `meeting_participants`
--
ALTER TABLE `meeting_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `meeting_participants_meeting_id_user_id_key` (`meeting_id`,`user_id`),
  ADD KEY `meeting_participants_user_id_idx` (`user_id`);

--
-- Indexes for table `notices`
--
ALTER TABLE `notices`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_idx` (`user_id`);

--
-- Indexes for table `otp_verifications`
--
ALTER TABLE `otp_verifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payments_bill_id_idx` (`bill_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `projects_department_id_idx` (`department_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tasks_assignee_id_idx` (`assignee_id`),
  ADD KEY `tasks_project_id_idx` (`project_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD KEY `users_department_id_idx` (`department_id`);

--
-- Indexes for table `worker_salaries`
--
ALTER TABLE `worker_salaries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `worker_salaries_worker_id_idx` (`worker_id`),
  ADD KEY `worker_salaries_month_idx` (`month`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bills`
--
ALTER TABLE `bills`
  ADD CONSTRAINT `bills_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bills_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bills_submitted_by_fkey` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `complaints_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `complaints_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `complaint_attachments`
--
ALTER TABLE `complaint_attachments`
  ADD CONSTRAINT `complaint_attachments_complaint_id_fkey` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `departments_head_id_fkey` FOREIGN KEY (`head_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `discussions`
--
ALTER TABLE `discussions`
  ADD CONSTRAINT `discussions_meeting_id_fkey` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `discussion_posts`
--
ALTER TABLE `discussion_posts`
  ADD CONSTRAINT `discussion_posts_discussion_id_fkey` FOREIGN KEY (`discussion_id`) REFERENCES `discussions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `discussion_posts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `meetings`
--
ALTER TABLE `meetings`
  ADD CONSTRAINT `meetings_complaint_id_fkey` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `meetings_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `meeting_participants`
--
ALTER TABLE `meeting_participants`
  ADD CONSTRAINT `meeting_participants_meeting_id_fkey` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `meeting_participants_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_bill_id_fkey` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_assignee_id_fkey` FOREIGN KEY (`assignee_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tasks_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `worker_salaries`
--
ALTER TABLE `worker_salaries`
  ADD CONSTRAINT `worker_salaries_worker_id_fkey` FOREIGN KEY (`worker_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
