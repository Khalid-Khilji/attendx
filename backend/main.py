from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils.face import _get_face_app
from routes import (
    users_route, department_route, academic_year_route,
    semester_route, course_route, course_teacher_route,
    teacher_detail_route, student_detail_route,
    student_enrollment_route, timetable_route,
    attendance_session_route, attendance_record_route,
    activity_log_route, dashboard_route
)

@asynccontextmanager
async def lifespan(app):
    _get_face_app()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_route.router)
app.include_router(department_route.router)
app.include_router(academic_year_route.router)
app.include_router(semester_route.router)
app.include_router(course_route.router)
app.include_router(course_teacher_route.router)
app.include_router(teacher_detail_route.router)
app.include_router(student_detail_route.router)
app.include_router(student_enrollment_route.router)
app.include_router(timetable_route.router)
app.include_router(attendance_session_route.router)
app.include_router(attendance_record_route.router)
app.include_router(activity_log_route.router)
app.include_router(dashboard_route.router)