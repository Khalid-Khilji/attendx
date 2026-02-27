from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.users_route import router as user_router
from routes.admin_log_route import router as admin_log_router
from routes.department_route import router as department_router
from routes.semester_route import router as semester_router

app = FastAPI()

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

app.include_router(user_router)
app.include_router(admin_log_router)
app.include_router(department_router)
app.include_router(semester_router)