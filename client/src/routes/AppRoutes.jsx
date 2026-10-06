import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Home = lazy(() => import('../pages/Home'))
const Login = lazy(() => import('../pages/Login'))
const Signup = lazy(() => import('../pages/Signup'))
const Onboarding = lazy(() => import('../pages/Onboarding'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Worlds = lazy(() => import('../pages/Worlds'))
const World = lazy(() => import('../pages/World'))
const Quest = lazy(() => import('../pages/Quest'))
const Mentor = lazy(() => import('../pages/Mentor'))
const Leaderboard = lazy(() => import('../pages/Leaderboard'))
const Profile = lazy(() => import('../pages/Profile'))

function Protected({children}){const {user,loading}=useAuth();const location=useLocation();if(loading)return <div className="loading-screen">Loading NEXORA…</div>;return user?children:<Navigate to="/login" replace state={{from:location}}/>}
export default function AppRoutes(){return <Suspense fallback={<div className="loading-screen">Loading NEXORA…</div>}><Routes><Route path="/" element={<Home/>}/><Route path="/login" element={<Login/>}/><Route path="/signup" element={<Signup/>}/><Route path="/onboarding" element={<Protected><Onboarding/></Protected>}/><Route path="/dashboard" element={<Protected><Dashboard/></Protected>}/><Route path="/worlds" element={<Protected><Worlds/></Protected>}/><Route path="/worlds/:id" element={<Protected><World/></Protected>}/><Route path="/quest" element={<Protected><Quest/></Protected>}/><Route path="/mentor" element={<Protected><Mentor/></Protected>}/><Route path="/leaderboard" element={<Protected><Leaderboard/></Protected>}/><Route path="/profile" element={<Protected><Profile/></Protected>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></Suspense>}
