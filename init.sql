USE LTJava;
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th1 19, 2026 lúc 09:08 AM
-- Phiên bản máy phục vụ: 9.1.0
-- Phiên bản PHP: 8.2.12
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `ltjava`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `courses`
--

CREATE TABLE `courses` (
  `id` bigint NOT NULL,
  `code` varchar(255) NOT NULL,
  `credits` int DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `lecturer_id` bigint NOT NULL,
  `lecturer_username` varchar(255) NOT NULL,
  `academic_year` varchar(255) DEFAULT NULL,
  `semester` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `courses`
--

INSERT INTO `courses` (`id`, `code`, `credits`, `department`, `name`, `lecturer_id`, `lecturer_username`, `academic_year`, `semester`) VALUES
(1, 'CS101', 3, 'CS', 'Intro to Programming', 0, '', NULL, NULL),
(4, 'CS103', 3, 'CS', 'Data Structures', 0, '', NULL, NULL),
(5, 'SE202', 4, 'Công nghệ phần mềm', 'Kỹ thuật phần mềm', 1, '', NULL, NULL),
(6, 'IT001', 3, 'CNTT', 'Lập trình Java', 9, '', NULL, NULL),
(7, 'IT002', 3, 'CNTT', 'Lập trình mạng', 9, '012345676633', NULL, NULL),
(8, 'IT003', 3, 'CNTT', 'Lập trình web', 9, '012345676633', NULL, NULL),
(9, 'HD001', 3, 'CNTT', 'Hệ điều hành', 9, '012345676633', '2026-2027', '1');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `course_parallel`
--

CREATE TABLE `course_parallel` (
  `course_id` bigint NOT NULL,
  `parallel_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `course_prerequisites`
--

CREATE TABLE `course_prerequisites` (
  `course_id` bigint NOT NULL,
  `prerequisite_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `course_supplementary`
--

CREATE TABLE `course_supplementary` (
  `course_id` bigint NOT NULL,
  `supplementary_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `is_read` bit(1) NOT NULL,
  `message` varchar(255) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `notifications`
--

INSERT INTO `notifications` (`id`, `created_at`, `is_read`, `message`, `user_id`) VALUES
(1, '2026-01-19 05:11:50.610100', b'0', 'Nóng! 🔥 HĐH vừa update content \'null\' siêu bí ẩn. Vô check xem đây là bug hay easter egg nhé! 🧐💻', 16),
(2, '2026-01-19 05:11:52.922397', b'0', 'Cập nhật HĐH mới toanh: nội dung \'null\' đã xuất hiện! 🤯 Vô xem sự hư vô này ngay, quan trọng lắm nha. 🚨', 16),
(3, '2026-01-19 05:40:18.805756', b'0', 'Giáo trình HĐH vừa update \'null\'. 💀 Ủa, học cái gì? Vô xem cái bug này lẹ! 😂', 16),
(4, '2026-01-19 06:30:17.601926', b'0', 'Yo! 🤯 OS plan 1-13 tuần đã lên sóng! Nhanh tay zô xem, không là miss kèo 😂. 🚀✨', 16),
(5, '2026-01-19 07:00:46.524775', b'1', 'O.S 👻 có deal hot! Giáo trình \'Kế hoạch 1 Tháng\' update siêu cấp vip pro. Vô check liền kẽo lỡ trend! 🚀📚✨', 16);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `id` bigint NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(4, 'AA'),
(5, 'HOD'),
(1, 'LECTURER'),
(6, 'PRINCIPAL'),
(7, 'STUDENT'),
(2, 'SYSTEM_ADMIN');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint NOT NULL,
  `course_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `course_id`, `user_id`) VALUES
(1, 9, 16);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `syllabus`
--

CREATE TABLE `syllabus` (
  `id` bigint NOT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(4000) DEFAULT NULL,
  `semester` varchar(20) DEFAULT NULL,
  `status` enum('AA_APPROVED','DRAFT','HOD_APPROVED','PRINCIPAL_APPROVED','PUBLISHED','REJECTED','REQUESTEDIT','SUBMITTED') NOT NULL,
  `title` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `version` int DEFAULT NULL,
  `course_id` bigint NOT NULL,
  `created_by` bigint DEFAULT NULL,
  `edit_note` text,
  `ai_summary` text,
  `keywords` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `syllabus`
--

INSERT INTO `syllabus` (`id`, `academic_year`, `created_at`, `description`, `semester`, `status`, `title`, `updated_at`, `version`, `course_id`, `created_by`, `edit_note`, `ai_summary`, `keywords`) VALUES
(1, '2025-2026', '2025-12-12 16:52:13.329467', 'Week 1-15 plan', 'HK1', 'PUBLISHED', 'Syllabus CS101', '2026-01-13 06:56:17.466111', 2, 1, 1, NULL, 'Chương trình giảng dạy 15 tuần của môn CS101 được thiết kế để cung cấp nền tảng vững chắc về tư duy thuật toán và logic lập trình cơ bản. Sinh viên sẽ tiến hành từ việc nắm vững các cấu trúc điều khiển và hàm đến việc áp dụng các khái niệm lập trình hướng đối tượng sơ cấp và xử lý dữ liệu cơ bản.', 'Thuật toán, Cấu trúc điều khiển, Lập trình hàm, Lập trình hướng đối tượng, Cấu trúc dữ liệu'),
(2, '2025-2026', '2025-12-15 06:45:30.133242', 'Week 1-15 plan', 'HK2', 'DRAFT', 'Syllabus CS102', '2025-12-15 06:45:30.133242', 1, 1, 1, NULL, NULL, NULL),
(3, '2025-2026', '2025-12-15 06:48:00.355526', 'Week 1-15 plan', 'HK1', 'REJECTED', 'Syllabus CS103', '2026-01-12 09:29:02.847054', 1, 1, 2, NULL, NULL, NULL),
(4, '2025-2026', '2026-01-11 13:28:04.325294', 'Week 1-15 plan', 'HK2', 'PUBLISHED', 'Syllabus CS104', '2026-01-17 08:07:54.782099', 5, 5, 1, NULL, 'Chương trình CS104 kéo dài 15 tuần tập trung vào việc xây dựng nền tảng lập trình vững chắc, từ các nguyên tắc cơ bản và quản lý bộ nhớ đến việc triển khai các cấu trúc dữ liệu phức tạp. Khóa học nhấn mạnh vào phân tích thuật toán và kỹ thuật tối ưu hóa nhằm đảm bảo sinh viên có khả năng phát triển các giải pháp phần mềm hiệu quả cao.', 'Cấu trúc dữ liệu, Thuật toán, Quản lý bộ nhớ, Hiệu năng hệ thống, Lập trình hướng đối tượng'),
(5, '2025-2026', '2026-01-17 06:25:34.600929', 'Week 1-15 plan', 'HK2', 'PUBLISHED', 'Syllabus CS105', '2026-01-17 08:08:10.964535', 2, 7, 9, NULL, 'Chương trình học CS105 kéo dài 15 tuần tập trung xây dựng nền tảng vững chắc về khoa học máy tính thông qua việc giới thiệu các nguyên tắc lập trình và tư duy thuật toán. Sinh viên sẽ được trang bị kỹ năng thiết yếu để giải quyết vấn đề và triển khai các cấu trúc dữ liệu cơ bản.', 'Lập trình, Thuật toán, Khoa học máy tính, Cấu trúc dữ liệu, Tư duy máy tính'),
(6, '2025-2026', '2026-01-17 07:35:53.164768', 'Week 1-15 plan', 'HK1', 'PRINCIPAL_APPROVED', 'Syllabus CS102', '2026-01-17 07:37:06.734935', 1, 7, 9, NULL, NULL, NULL),
(7, '2025-2026', '2026-01-17 08:21:44.709096', 'Week 1-15 plan', 'HK2', 'REJECTED', 'Syllabus CS103', '2026-01-18 12:19:47.036883', 1, 7, 9, 'haha vui quá', NULL, NULL),
(8, '2026-2027', '2026-01-17 09:25:17.162343', 'Week 1-15 plan', 'HK2', 'DRAFT', 'Syllabus CS108', '2026-01-17 09:56:21.054518', 1, 7, 9, NULL, NULL, NULL),
(9, '2026-2027', '2026-01-19 04:44:07.615580', 'Week 1-15 plan', 'HK1', 'PUBLISHED', 'Syllabus CS105', '2026-01-19 05:11:57.201192', 1, 9, 9, NULL, 'Kế hoạch học tập CS105 kéo dài 15 tuần tập trung vào việc xây dựng nền tảng vững chắc về khoa học máy tính, từ các khái niệm lập trình cơ bản đến cấu trúc dữ liệu và thiết kế thuật toán sơ cấp. Chương trình được thiết kế để trang bị cho sinh viên kỹ năng giải quyết vấn đề bằng phương pháp tính toán và chuẩn bị cho các môn học chuyên sâu hơn.', 'Lập trình, Cấu trúc dữ liệu, Thuật toán, Khái niệm cơ bản, Tính toán'),
(10, '2026-2027', '2026-01-19 05:39:36.396643', 'Week 1-15 plan', 'HK1', 'PUBLISHED', 'Syllabus CS108', '2026-01-19 05:40:23.107333', 1, 9, 9, NULL, 'Giáo trình CS108 phác thảo một lộ trình học tập toàn diện kéo dài 15 tuần, tập trung vào việc thiết lập tư duy tính toán nền tảng và năng lực lập trình cốt lõi. Khóa học tiến triển một cách hệ thống từ các cấu trúc mệnh lệnh và nguyên tắc thuật toán ban đầu đến các phương pháp luận hướng đối tượng nâng cao, thường kết thúc bằng một dự án ứng dụng thực tế quy mô lớn.', 'Tư duy Tính toán, Nguyên tắc Thuật toán, Năng lực Lập trình, Hướng Đối tượng, Lộ trình 15 Tuần'),
(11, '2026-2027', '2026-01-19 06:28:55.428208', 'kế hoạch trong 1-13 tuần', 'HK!', 'PUBLISHED', 'CN001', '2026-01-19 06:30:17.604972', 1, 9, 9, NULL, 'Kế hoạch 1-13 tuần đại diện cho giai đoạn hoạch định tác nghiệp, tập trung chi tiết hóa các mục tiêu chiến thuật thành chuỗi hành động cụ thể và có thể đo lường được. Trọng tâm của giai đoạn này là phân bổ nguồn lực chính xác, quản lý tiến độ vi mô, và thiết lập các cơ chế kiểm soát rủi ro tức thời để đạt được các kết quả ngắn hạn theo đúng ngân sách và thời gian quy định.', 'Kế hoạch tác nghiệp, Phân bổ nguồn lực, Quản lý tiến độ, Mục tiêu ngắn hạn, Kiểm soát vi mô'),
(12, '2026-2027', '2026-01-19 06:59:57.633838', 'kế hoạch 1 tháng', 'HK1', 'PUBLISHED', 'CN002', '2026-01-19 07:00:46.527762', 1, 9, 9, NULL, 'Kế hoạch một tháng là công cụ quản lý tác nghiệp ngắn hạn, có chức năng chuyển đổi mục tiêu chiến lược thành các nhiệm vụ cụ thể và khả thi. Việc lập kế hoạch này đảm bảo phân bổ tối ưu nguồn lực, giám sát tiến độ thường xuyên và cung cấp cơ sở dữ liệu định lượng để đánh giá hiệu suất.', 'Kế hoạch 1 tháng, Quản lý tác nghiệp, Phân bổ nguồn lực, Giám sát tiến độ, Đánh giá hiệu suất');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `syllabus_comments`
--

CREATE TABLE `syllabus_comments` (
  `id` bigint NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `status` enum('ACTIVE','DELETED') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `commenter_id` bigint NOT NULL,
  `syllabus_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `syllabus_comments`
--

INSERT INTO `syllabus_comments` (`id`, `content`, `created_at`, `status`, `updated_at`, `commenter_id`, `syllabus_id`) VALUES
(1, 'Mục CLO chưa rõ, đề xuất bổ sung rubric.', '2025-12-23 13:17:14.742917', 'ACTIVE', '2025-12-23 13:17:14.742917', 9, 3);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `syllabus_history`
--

CREATE TABLE `syllabus_history` (
  `id` bigint NOT NULL,
  `academic_year` varchar(255) DEFAULT NULL,
  `description` varchar(4000) DEFAULT NULL,
  `semester` varchar(255) DEFAULT NULL,
  `status` enum('AA_APPROVED','DRAFT','HOD_APPROVED','PRINCIPAL_APPROVED','PUBLISHED','REJECTED','REQUESTEDIT','SUBMITTED') NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `version` int DEFAULT NULL,
  `syllabus_id` bigint NOT NULL,
  `updated_by` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `syllabus_history`
--

INSERT INTO `syllabus_history` (`id`, `academic_year`, `description`, `semester`, `status`, `title`, `updated_at`, `version`, `syllabus_id`, `updated_by`) VALUES
(1, '2025-2026', 'Week 1-15 plan', 'HK1', 'AA_APPROVED', 'Syllabus CS101', '2026-01-13 06:56:06.578537', 1, 1, 1),
(2, '2025-2026', 'Week 1-15 plan', 'HK1', 'AA_APPROVED', 'Syllabus CS101', '2026-01-13 06:56:11.160399', 1, 1, 1),
(3, '2025-2026', 'Week 1-15 plan', 'HK2', 'DRAFT', 'Syllabus CS105', '2026-01-17 06:25:47.087890', 1, 5, 9),
(4, '2025-2026', 'Week 1-15 plan', 'HK1', 'DRAFT', 'Syllabus CS102', '2026-01-17 07:36:00.057574', 1, 6, 9),
(5, '2025-2026', 'Week 1-15 plan', 'HK2', 'PRINCIPAL_APPROVED', 'Syllabus CS104', '2026-01-17 08:07:43.718711', 4, 4, 1),
(6, '2025-2026', 'Week 1-15 plan', 'HK2', 'PRINCIPAL_APPROVED', 'Syllabus CS104', '2026-01-17 08:07:47.043954', 4, 4, 1),
(7, '2025-2026', 'Week 1-15 plan', 'HK2', 'PRINCIPAL_APPROVED', 'Syllabus CS105', '2026-01-17 08:08:05.272355', 1, 5, 9),
(8, '2025-2026', 'Week 1-15 plan', 'HK2', 'DRAFT', 'Syllabus CS103', '2026-01-17 08:21:48.794225', 1, 7, 9),
(9, '2026-2027', 'Week 1-15 plan', 'HK1', 'DRAFT', 'Syllabus CS105', '2026-01-19 05:10:36.322210', 1, 9, 9),
(10, '2026-2027', 'Week 1-15 plan', 'HK1', 'PRINCIPAL_APPROVED', 'Syllabus CS105', '2026-01-19 05:11:40.920190', 1, 9, 9),
(11, '2026-2027', 'Week 1-15 plan', 'HK1', 'PRINCIPAL_APPROVED', 'Syllabus CS105', '2026-01-19 05:11:47.061582', 1, 9, 9),
(12, '2026-2027', 'Week 1-15 plan', 'HK1', 'PRINCIPAL_APPROVED', 'Syllabus CS105', '2026-01-19 05:11:49.806244', 1, 9, 9),
(13, '2026-2027', 'Week 1-15 plan', 'HK1', 'PUBLISHED', 'Syllabus CS105', '2026-01-19 05:11:55.070116', 1, 9, 9),
(14, '2026-2027', 'Week 1-15 plan', 'HK1', 'PUBLISHED', 'Syllabus CS105', '2026-01-19 05:11:57.204793', 1, 9, 9),
(15, '2026-2027', 'Week 1-15 plan', 'HK1', 'DRAFT', 'Syllabus CS108', '2026-01-19 05:39:42.945728', 1, 10, 9),
(16, '2026-2027', 'Week 1-15 plan', 'HK1', 'PRINCIPAL_APPROVED', 'Syllabus CS108', '2026-01-19 05:40:08.921349', 1, 10, 9),
(17, '2026-2027', 'Week 1-15 plan', 'HK1', 'PRINCIPAL_APPROVED', 'Syllabus CS108', '2026-01-19 05:40:15.171851', 1, 10, 9),
(18, '2026-2027', 'Week 1-15 plan', 'HK1', 'PUBLISHED', 'Syllabus CS108', '2026-01-19 05:40:23.112662', 1, 10, 9),
(19, '2026-2027', 'kế hoạch trong 1-13 tuần', 'HK!', 'DRAFT', 'CN001', '2026-01-19 06:29:00.673645', 1, 11, 9),
(20, '2026-2027', 'kế hoạch trong 1-13 tuần', 'HK!', 'PRINCIPAL_APPROVED', 'CN001', '2026-01-19 06:30:04.782589', 1, 11, 9),
(21, '2026-2027', 'kế hoạch trong 1-13 tuần', 'HK!', 'PUBLISHED', 'CN001', '2026-01-19 06:30:17.610949', 1, 11, 9),
(22, '2026-2027', 'kế hoạch 1 tháng', 'HK1', 'DRAFT', 'CN002', '2026-01-19 07:00:03.710241', 1, 12, 9),
(23, '2026-2027', 'kế hoạch 1 tháng', 'HK1', 'PRINCIPAL_APPROVED', 'CN002', '2026-01-19 07:00:35.018759', 1, 12, 9),
(24, '2026-2027', 'kế hoạch 1 tháng', 'HK1', 'PUBLISHED', 'CN002', '2026-01-19 07:00:46.533501', 1, 12, 9);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` bigint NOT NULL,
  `active` bit(1) NOT NULL,
  `cccd` varchar(20) NOT NULL,
  `date_of_birth` date NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `username` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `active`, `cccd`, `date_of_birth`, `full_name`, `password`, `username`) VALUES
(1, b'1', '012345676668', '2005-01-01', 'Nguyen Van huy', '$2a$10$HgenvNK8Ykd09NGcU9C6YOWuAZl7R1x/TKPWQlIsFmXHegimdAGuq', '012345676668'),
(2, b'1', '012345676688', '2004-01-01', 'Nguyen Van dat', '$2a$10$ju/hLXeOMe0vrWWcIhAgnuA0Lreq0RgtKuWtzsrrodAkzUnDHOH1e', '012345676688'),
(7, b'1', '000000000000', '2000-01-01', 'System Admin', '$2a$10$G8eR5vb4mFWg4kKz52TVYOkToJacLsegIJoBw7pIAlDiBU9s2wdFK', '000000000000'),
(8, b'1', '012345676699', '2004-01-01', 'le van dat', '$2a$10$8LUMeJlqYBRbsFbqIOfzPO.TGztY4SqBy07fYVZhiqGd51pzWTSYq', '012345676699'),
(9, b'1', '012345676633', '2004-01-01', 'nguyen van dat', '$2a$10$8Nuw9UfCW/Dx/ZLlN0KNouFEcJ.oyc9/1Fcx1wqjmzD7Nk95a.Dbe', '012345676633'),
(10, b'1', '112345678901', '1999-08-15', 'Nguyễn Văn A', '$2a$10$0zU6v2be.U5wUlP1DO2/uuJ6LSYWvVjlrmQc2h1W4OHhmJfKPFHSu', '112345678901'),
(11, b'1', '112345678902', '1985-01-03', 'Trần Văn B', '$2a$10$1d6dtW2St5s0LID88lrvfepJpDOxkWKi4JqF7./4OwR3y.klMMFf2', '112345678902'),
(12, b'1', '112345678903', '2000-12-20', 'Lê Thị C', '$2a$10$1ZUsjSKyPPOWM1mD65daVej7xto4YRxyMINXawHptPz8mfDXCQlri', '112345678903'),
(13, b'1', '112345678911', '1999-08-15', 'Nguyễn Văn dat', '$2a$10$Q0/6swEFQbq0NKu8.9SaZOPKU.3YvBs5O0PbXaEH4euQtTeO5EIcK', '112345678911'),
(14, b'1', '112345678922', '1985-01-03', 'Trần Văn ho', '$2a$10$YX5JztK2PLE6jd8QqF6mrOzzWM2TrD7zi50kJczVwf5.rC62uR8he', '112345678922'),
(15, b'1', '112345678933', '2000-12-20', 'Lê Thị h', '$2a$10$4KMG.YajhH0sJUrwEC85aOKkPCkEmCBV8OSjMO7JmG4T1U01xMSRe', '112345678933'),
(16, b'1', '111111111111', '2000-01-01', 'Nguyen Van Teo', '$2a$10$73qHTWd9r5hlTDfBFng0n.NiYHwNlBFA3LMqPdDb7.DVtvncPBB8q', '111111111111');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_roles`
--

CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `user_roles`
--

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 1),
(9, 1),
(12, 1),
(13, 1),
(15, 1),
(2, 2),
(7, 2),
(8, 4),
(11, 5),
(14, 5),
(10, 6),
(16, 7);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK61og8rbqdd2y28rx2et5fdnxd` (`code`);

--
-- Chỉ mục cho bảng `course_parallel`
--
ALTER TABLE `course_parallel`
  ADD PRIMARY KEY (`course_id`,`parallel_id`),
  ADD KEY `FKf2k7oqkliid1ccayftxea4dyx` (`parallel_id`);

--
-- Chỉ mục cho bảng `course_prerequisites`
--
ALTER TABLE `course_prerequisites`
  ADD PRIMARY KEY (`course_id`,`prerequisite_id`),
  ADD KEY `FK2w3n61668a1jqt1y4w7we9pn0` (`prerequisite_id`);

--
-- Chỉ mục cho bảng `course_supplementary`
--
ALTER TABLE `course_supplementary`
  ADD PRIMARY KEY (`course_id`,`supplementary_id`),
  ADD KEY `FKsfv483l7p3ujvgqw5f6scikg6` (`supplementary_id`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK9y21adhxn0ayjhfocscqox7bh` (`user_id`);

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKofx66keruapi6vyqpv6f2or37` (`name`);

--
-- Chỉ mục cho bảng `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK9f5yugfr9ro4r0x5ltfr2pb0f` (`course_id`),
  ADD KEY `FKhro52ohfqfbay9774bev0qinr` (`user_id`);

--
-- Chỉ mục cho bảng `syllabus`
--
ALTER TABLE `syllabus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKjvcn63hkhub569g084rgb9hme` (`course_id`),
  ADD KEY `FKbmekouwi699j6ned9gv88g2dr` (`created_by`);

--
-- Chỉ mục cho bảng `syllabus_comments`
--
ALTER TABLE `syllabus_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKovpavo53uf1yt1gn9cjdbfqua` (`commenter_id`),
  ADD KEY `FKadjhehm3kde1tqud4ou106mjj` (`syllabus_id`);

--
-- Chỉ mục cho bảng `syllabus_history`
--
ALTER TABLE `syllabus_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK83n0ovsleh1tt5mcpplo42w7g` (`syllabus_id`),
  ADD KEY `FKg1osffa1pv89qx13iryjfh0y0` (`updated_by`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`),
  ADD UNIQUE KEY `UKc7y24p0ml4htprpuyyrk712uc` (`cccd`);

--
-- Chỉ mục cho bảng `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `FKh8ciramu9cc9q3qcqiv4ue8a6` (`role_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `courses`
--
ALTER TABLE `courses`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `syllabus`
--
ALTER TABLE `syllabus`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `syllabus_comments`
--
ALTER TABLE `syllabus_comments`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `syllabus_history`
--
ALTER TABLE `syllabus_history`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `course_parallel`
--
ALTER TABLE `course_parallel`
  ADD CONSTRAINT `FKf2k7oqkliid1ccayftxea4dyx` FOREIGN KEY (`parallel_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `FKkjog45mdal3asd9fgmu7ltl6a` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);

--
-- Các ràng buộc cho bảng `course_prerequisites`
--
ALTER TABLE `course_prerequisites`
  ADD CONSTRAINT `FK2w3n61668a1jqt1y4w7we9pn0` FOREIGN KEY (`prerequisite_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `FKhh4f1avebuvlv54m3j3l3pp36` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);

--
-- Các ràng buộc cho bảng `course_supplementary`
--
ALTER TABLE `course_supplementary`
  ADD CONSTRAINT `FKcc9qvctm2g99ar258b2bou9b` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `FKsfv483l7p3ujvgqw5f6scikg6` FOREIGN KEY (`supplementary_id`) REFERENCES `courses` (`id`);

--
-- Các ràng buộc cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `FK9f5yugfr9ro4r0x5ltfr2pb0f` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `FKhro52ohfqfbay9774bev0qinr` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `syllabus`
--
ALTER TABLE `syllabus`
  ADD CONSTRAINT `FKbmekouwi699j6ned9gv88g2dr` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKjvcn63hkhub569g084rgb9hme` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);

--
-- Các ràng buộc cho bảng `syllabus_comments`
--
ALTER TABLE `syllabus_comments`
  ADD CONSTRAINT `FKadjhehm3kde1tqud4ou106mjj` FOREIGN KEY (`syllabus_id`) REFERENCES `syllabus` (`id`),
  ADD CONSTRAINT `FKovpavo53uf1yt1gn9cjdbfqua` FOREIGN KEY (`commenter_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `syllabus_history`
--
ALTER TABLE `syllabus_history`
  ADD CONSTRAINT `FK83n0ovsleh1tt5mcpplo42w7g` FOREIGN KEY (`syllabus_id`) REFERENCES `syllabus` (`id`),
  ADD CONSTRAINT `FKg1osffa1pv89qx13iryjfh0y0` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `FKh8ciramu9cc9q3qcqiv4ue8a6` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `FKhfh9dx7w3ubf1co1vdev94g3f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
