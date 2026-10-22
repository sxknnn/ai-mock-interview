import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-react";
import { Container } from "./container";
import { LogoContainer } from "./logo-container";
import {NavigationRoutes}   from "./navigation-routes";
import { NavLink } from "react-router-dom";
import { ProfileContainer } from "./profile-container";
import { ToggleContainer } from "./toggle-container";
import { ThemeToggle } from "./theme-toggle";

const Header = () => {
  const { userId } = useAuth();

  return (
    <header
      className={cn("sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md duration-150 transition-all ease-in-out")}
    >
      <Container>
        <div className="flex items-center gap-4 w-full">
          {/* logo section */}
          <LogoContainer />

          {/* navigation section */}
          <nav className="hidden md:flex items-center gap-3">
            <NavigationRoutes />
            {userId && (
              <NavLink
                to={"/generate"}
                className={({ isActive }) =>
                  cn(
                    "text-base text-muted-foreground hover:text-foreground transition-colors",
                    isActive && "text-foreground font-semibold"
                  )
                }
              >
                Take An Interview
              </NavLink>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-3 md:gap-4">
            <ThemeToggle />

            {/* profile section */}
            <ProfileContainer />

            {/* mobile toggle section */}
            <ToggleContainer />
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;