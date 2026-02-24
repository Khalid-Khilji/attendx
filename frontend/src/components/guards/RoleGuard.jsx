import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../stores/auth'

const RoleGuard = ({ allowedRoles }) => {
    const { user, isAuthenticated } = useAuthStore()

    if (!isAuthenticated) {
        return <Navigate to="/" replace />
    }

    if (!allowedRoles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />
    }

    return <Outlet />
}

export default RoleGuard