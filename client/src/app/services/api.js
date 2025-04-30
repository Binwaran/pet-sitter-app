import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // ใส่ลิงก์ backend ที่จะเชื่อม
  withCredentials: true, // ถ้ามี auth ที่ใช้ cookie
});

export default API;

//เวลาใช้ก็เรียกแบบนี้ได้เลย:
//import API from '@/services/api';
//API.get('/pets')
//API.post('/login', { email, password })