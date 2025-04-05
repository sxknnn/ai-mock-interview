import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { PublicLayout } from "@/layouts/public-layout";
import AuthenticationLayout from "@/layouts/auth-layout";

import HomePage from "@/routes/home";
import { SignInPage } from "./routes/sign-in";
import { SignUpPage } from "./routes/sign-up";
import ProtectedRoutes from "./layouts/protected-routes";

import { MainLayout } from "@/layouts/main-layout";

const App = () => {
  return (
    <Router>
      <Routes>
        {/*publlic routes */}
        <Route element={<PublicLayout />}>
        <Route index element= {<HomePage />} />
        </Route>
        {/*Authentication*/}
        <Route element={<AuthenticationLayout />}>
        <Route path="/signin/*" element= {<SignInPage />} />
        <Route path="/signup/*" element= {<SignUpPage />} />
        </Route>
         {/*Protected Route*/}
         <Route element={<ProtectedRoutes><MainLayout/></ProtectedRoutes>}>
          
         </Route>
      </Routes>
    </Router>
  );
};

export default App;