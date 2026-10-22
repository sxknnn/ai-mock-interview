import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { PublicLayout } from "@/layouts/public-layout";
import AuthenticationLayout from "@/layouts/auth-layout";

import HomePage from "@/routes/home";
import { SignInPage } from "./routes/sign-in";
import { SignUpPage } from "./routes/sign-up";
import ProtectedRoutes from "./layouts/protected-routes";

import { MainLayout } from "@/layouts/main-layout";
import GeneratePage from "@/routes/generate";
import InterviewPage from "@/routes/interview";
import FeedbackPage from "@/routes/feedback";
import AboutPage from "@/routes/about";
import ContactPage from "@/routes/contact";
import ServicesPage from "@/routes/services";
import { ScrollToTop } from "@/components/scroll-to-top";


const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/*publlic routes */}
        <Route element={<PublicLayout />}>
        <Route index element= {<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/services" element={<ServicesPage />} />
        </Route>
        {/*Authentication*/}
        <Route element={<AuthenticationLayout />}>
        <Route path="/signin/*" element= {<SignInPage />} />
        <Route path="/signup/*" element= {<SignUpPage />} />
        </Route>
         {/*Protected Route*/}
         <Route element={<ProtectedRoutes><MainLayout/></ProtectedRoutes>}>
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/interview/:sessionId" element={<InterviewPage />} />
          <Route path="/interview/:sessionId/feedback" element={<FeedbackPage />} />
         </Route>
      </Routes>
    </Router>
  );
};

export default App;