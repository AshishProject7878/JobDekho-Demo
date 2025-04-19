import './App.css';
import Navbar from './Pages/Navbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import Signup from './Pages/SignUp';
import ProtectedRoute from './Components/ProtectedRoute';
import ProfilePage from './Pages/ProfilePage';
import PostForm from './Pages/PostForm';
import PostList from './Pages/PostList';
import EditPost from './Pages/EditPost';
import PublicPost from './Pages/PublicPost';
import JobDetail from './Pages/JobDetail';
import JobPostingForm from './Pages/JobPostingForm';
import ProfileForm from './Pages/ProfileForm';
import CompProfile from './Pages/CompProfile'; 
import CompanyForm from './Pages/CompanyForm';
import CompanyList from './Pages/CompanyList';
import CompanyDetail from './Pages/CompanyDetail';
import UserDashboard from './Pages/UserDashboard';
import CompanyEditForm from './Pages/CompanyEditForm';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<PublicPost />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/job/:id" element={<JobDetail />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />
        {/* <Route path="/public-posts" element={<PublicPost />} /> */}
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
        <Route path="/jobPostingForm" element={<JobPostingForm />}/>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/userDashboard" element={<UserDashboard />} />
          <Route path="/companyForm" element={<CompanyForm />} />
          <Route path="/companyList" element={<CompanyList />} />
          <Route path="/profileForm" element={<ProfileForm />} />
          <Route path="/post" element={<PostForm />} />
          <Route path="/edit-post/:id" element={<EditPost />} />
          <Route path="/CompanyEdit/:id" element={<CompanyEditForm />} />
          <Route path="/postList" element={<PostList />} />
          <Route path="/profileComp" element={<CompProfile />} />
        </Route>
  
        {/* Fallback route */}
        {/* <Route path="*" element={<Login />} /> */}
      </Routes>
    </Router>
  );
}

export default App;