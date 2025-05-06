'use client'
import { useRouter } from 'next/navigation'
import auth from '@/services/auth'



const MockNavbar = () => {
  const router = useRouter()

 

  const handleLogout = () => {
    auth.logout()
    alert("Logout successful")       //แสดงข้อความเมื่อ logout สำเร็จ
    router.push('/')    // Redirect ไปหน้า Home
  }

  return (
    <nav className="p-4 bg-gray-100 flex justify-between">
      <div>🐾 Pet Sitter</div>
      <button
        className="bg-red-500 text-white px-3 py-1 rounded"
        onClick={handleLogout}
      >
        Logout
      </button>
    </nav>
  )
}


export default MockNavbar
