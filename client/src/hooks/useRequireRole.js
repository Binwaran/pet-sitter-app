import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * @param {string|string[]} requiredRoles - role ที่ต้องการ เช่น "owner" หรือ ["owner", "admin"]
 * @returns {object} { user, loading, authorized }
 */
export function useRequireRole(requiredRoles) {
  const router = useRouter();
  const { user, loading } = useAuth();

  // แปลง requiredRoles เป็น array เสมอ
  const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  // เช็คว่าผู้ใช้มี role ที่ต้องการหรือไม่
  const authorized =
    user &&
    Array.isArray(user.roles)
      ? user.roles.some((role) => rolesArray.includes(role))
      : rolesArray.includes(user?.role);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!authorized) {
      router.push("/unauthorized");
    }
  }, [user, loading, authorized, router]);

  return { user, loading, authorized };
}