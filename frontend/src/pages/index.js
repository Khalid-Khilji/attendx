import Home from "./guest/Home";
import About from "./guest/About";
import Contact from "./guest/Contact";

import AdminDashboard from "./admin/AdminDashboard";
import Academic from "./admin/Academic";
import Teacher from "./admin/Teacher";
import Student from "./admin/Student";
import AdminTimetable from "./admin/AdminTimetable";
import AdminAttendance from "./admin/AdminAttendance";
import AdminLog from "./admin/AdminLog";

import TeacherDashboard from "./teacher/TeacherDashboard";
import TeacherAttendance from "./teacher/TeacherAttendance";
import TeacherCourses from "./teacher/TeacherCourses";
import TeacherProfile from "./teacher/TeacherProfile";
import TeacherTimetable from "./teacher/TeacherTimetable";

import StudentDashboard from "./student/StudentDashboard";
import StudentProfile from "./student/Profile";
import StudentAttendance from "./student/Attendance";
import StudentTimetable from "./student/Timetable";

import Unauthorized from "./errors/Unauthorized";
import NotFound from "./errors/NotFound";

export {
    Home, About, Contact,
    AdminDashboard, Academic, Teacher, Student, AdminLog, AdminAttendance, AdminTimetable,
    TeacherDashboard, TeacherAttendance, TeacherCourses, TeacherProfile, TeacherTimetable,
    StudentDashboard, StudentProfile, StudentAttendance, StudentTimetable,
    Unauthorized, NotFound
};