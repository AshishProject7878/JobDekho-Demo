import './App.css';
import Navbar from './Pages/Navbar';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import AutoJobPrefs from './Pages/AutoJobPrefs';
import AutoAppliedJobs from './Pages/AutoAppliedJobs';
import HomePage from './Pages/HomePage';
import Footer from './Pages/Footer';
import Dashboard from './Pages/Dashboard';
import ProfileList from './Pages/ProfileList';
import PublicProfile from './Pages/PublicProfile';

// Create a wrapper component to handle conditional Footer rendering
function AppContent() {
  const location = useLocation();

  // Hide Footer on the Signup and Login pages
  const hideFooter = ['/signup', '/login'].includes(location.pathname);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dummyProfile" element={<PublicPost />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profileList" element={<ProfileList />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/companies/:id" element={<CompanyDetail />} />
          <Route path="/profiles/:id" element={<PublicProfile />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/jobPostingForm" element={<JobPostingForm />} />
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
          <Route path="/auto-job/prefs" element={<AutoJobPrefs />} /> 
          <Route path="/auto-job/applications" element={<AutoAppliedJobs />} /> 
          <Route path="/dashboard" element={<Dashboard />} /> 
        </Route>
      </Routes>
      {!hideFooter && <Footer />}
    </>
  );
}

function App() { 
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;