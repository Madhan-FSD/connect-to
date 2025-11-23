import { ReactNode, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  User,
  LogOut,
  Plus,
  Bot,
  Sparkles,
  Users,
  Gamepad2,
  Newspaper,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuth, clearAuth } from "@/lib/auth";
import { AIChatbot } from "./AiChatBot";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAvatarUrl } from "./hooks/useAvatarUrl";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getAuth();
  const [showChatbot, setShowChatbot] = useState(false);
  const avatarUrl = useAvatarUrl(user);

  const handleLogout = () => {
    clearAuth();
    navigate("/auth/login");
  };

  if (!user) return <>{children}</>;

  const dashboardItem = [{ icon: Home, label: "Dashboard", path: "/" }];

  const coreItems = [
    { icon: Newspaper, label: "Feed", path: "/feeds" },
    { icon: Users, label: "Network", path: "/network" },
    { icon: MessageCircle, label: "Chat", path: "/chat" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Plus, label: "Channel", path: "/create-channel" },
    { icon: Sparkles, label: "AI Hub", path: "/ai-hub" },
  ];

  const aiGamesItem =
    user.role === "CHILD"
      ? [{ icon: Gamepad2, label: "AI Games", path: "/ai-games" }]
      : [];

  const navItems = [...dashboardItem, ...coreItems, ...aiGamesItem];

  const displayName = user.name || user.email?.split("@")[0] || "User";
  const userRoleDisplay = user.role.toLowerCase().replace("_", " ");

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary" />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                PeersPlus
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path === "/" && location.pathname === "/dashboard") ||
                  (item.path === "/profile" &&
                    location.pathname.startsWith("/profile")) ||
                  (item.path !== "/" &&
                    location.pathname.startsWith(`${item.path}/`));

                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer">
                    <Avatar className="h-9 w-9 border-2 border-primary/50 transition-all hover:ring-2 hover:ring-primary/80">
                      <AvatarImage
                        src={avatarUrl || undefined}
                        alt={displayName}
                      />
                      <AvatarFallback>
                        {displayName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-bold pb-0">
                    {displayName}
                  </DropdownMenuLabel>
                  <DropdownMenuLabel className="pt-0 text-xs text-muted-foreground capitalize">
                    {userRoleDisplay}
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="cursor-pointer"
                  >
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto">{children}</main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="w-full flex-col h-auto py-2 gap-1"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="fixed bottom-6 right-6 z-[100]">
        <Button
          variant="default"
          size="lg"
          className="rounded-full shadow-2xl p-3 h-14 w-14 transition-transform hover:scale-105"
          onClick={() => setShowChatbot(!showChatbot)}
          aria-label="Toggle AI Chatbot"
        >
          <Bot className="h-7 w-7" />
        </Button>
      </div>

      {showChatbot && <AIChatbot onClose={() => setShowChatbot(false)} />}
    </div>
  );
};
