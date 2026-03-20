import Header from "./layout/Header";
import Footer from "./layout/Footer";
import ScrollToTop from "./layout/ScrollToTop";

import Button from "./common/Button";
import Input from "./common/Input";
import Modal from "./common/Modal";
import Loader from "./common/Loader";
import Select from "./common/Select";
import SelectOption from "./common/Select";

import Login from "./auth/Login";
import Logout from "./auth/Logout";

import DepartmentModal from "./forms/DepartmentModal";
import SemesterModal from "./forms/SemesterModal";
import CourseModal from "./forms/CourseModal";
import TimetableSlotModal from "./forms/TimeTableSlotModal";
import StudentModal from "./forms/StudentModal";
import EnrollModal from "./forms/EnrollModal";
import FaceModal from "./forms/FaceModal";
import TeacherModal from "./forms/TeacherModal";
import AssignModal from "./forms/AssignModal";
import AcademicYearModal from "./forms/AcademicYearModal";
import RecordsModal from "./forms/RecordModal";
import AttendanceModal from "./forms/AttendanceModal";

import RoleGuard from "./guards/RoleGuard";

import CourseCard from "./ui/CourseCard";
import StudentRow from "./ui/StudentRow";
import InfoRow from "./ui/InfoRow";
import StatCard from "./ui/StatCard";
import TimetableSlot from "./ui/TimetableSlot";
import TimetableDayGroup from "./ui/TimeTableGroup";
import SessionCard from "./ui/SessionCard";
import AttendanceRecords from "./ui/AttendanceRecord";
import AttendanceRow from "./ui/AttendanceRow";
import ProfileSkeleton from "./ui/ProfileSkeleton";

export {
    Header, Footer, ScrollToTop,
    Button, Input, Modal, Loader, Select, SelectOption,
    Login, Logout,
    DepartmentModal, SemesterModal, CourseModal, TimetableSlotModal, StudentModal, EnrollModal, FaceModal, TeacherModal, AssignModal, AcademicYearModal, RecordsModal, AttendanceModal,
    RoleGuard,
    CourseCard, StudentRow, InfoRow, StatCard, TimetableSlot, TimetableDayGroup, SessionCard, AttendanceRecords, AttendanceRow, ProfileSkeleton
};