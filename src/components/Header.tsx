import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Wallet, Plus, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createClient } from "../utils/supabase/client";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner";

interface HeaderProps {
  isLoggedIn: boolean;
  onLoginChange: (loggedIn: boolean) => void;
}

export function Header({ isLoggedIn, onLoginChange }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [isLoggedIn]);

  const checkSession = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      onLoginChange(true);
      if (session.user.user_metadata?.name) {
        setName(session.user.user_metadata.name);
      }
    }
  };

  const checkAdminStatus = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.email) {
        console.log('Admin check: No session or email');
        setIsAdmin(false);
        return;
      }

      console.log('Admin check: Checking for email', session.user.email);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/admin/manage`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      console.log('Admin check: Response status', response.status);

      if (response.ok) {
        const data = await response.json();
        const adminEmails = data.adminEmails || [];
        console.log('Admin check: Admin emails', adminEmails);
        const isUserAdmin = adminEmails.includes(session.user.email);
        console.log('Admin check: Is admin?', isUserAdmin);
        setIsAdmin(isUserAdmin);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('Admin check: Failed', response.status, errorData);
        // 临时解决方案：如果 API 返回 404（Edge Function 未部署），且用户是 admin@admin.com，则允许访问
        if (response.status === 404 && session.user.email === 'admin@admin.com') {
          console.log('Admin check: Using fallback for admin@admin.com');
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const handleEmailAuth = async () => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      if (isSignUp) {
        // Sign up via server
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-66f4da3b/auth/signup`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name }),
          }
        );

        if (response.ok) {
          // Now sign in
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            toast.error(error.message);
          } else {
            onLoginChange(true);
            setOpen(false);
            toast.success("Account created successfully!");
          }
        } else {
          const error = await response.json();
          toast.error(error.error || "Failed to create account");
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
        } else {
          onLoginChange(true);
          setOpen(false);
          toast.success("Logged in successfully!");
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error("Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectWallet = () => {
    // Simulate wallet connection
    setWalletAddress("0x742d...3a9f");
    onLoginChange(true);
    setOpen(false);
    toast.success("Wallet connected!");
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    onLoginChange(false);
    setWalletAddress("");
    toast.success("Logged out successfully");
  };

  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-8">
            <Link to="/jobs">
              <h1 className="cursor-pointer">web3jobs</h1>
            </Link>
            <nav className="flex items-center" style={{ gap: '40px' }}>
              <Link
                to="/jobs"
                className={`transition-colors ${
                  location.pathname === "/jobs" ? "text-black" : "text-gray-400 hover:text-[var(--brand)]"
                }`}
              >
                Jobs
              </Link>
              <Link
                to="/talents"
                className={`transition-colors ${
                  location.pathname === "/talents" ? "text-black" : "text-gray-400 hover:text-[var(--brand)]"
                }`}
              >
                Talents
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      审核面板
                    </Button>
                  </Link>
                )}
                <Link to="/create-job">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Post Job
                  </Button>
                </Link>
                <Link to="/create-profile">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Profile
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    Settings
                  </Button>
                </Link>
                {walletAddress && (
                  <div className="rounded-full border border-gray-200 px-3 py-1.5">
                    {walletAddress}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Connect to web3jobs</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="wallet" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="wallet">Wallet</TabsTrigger>
                      <TabsTrigger value="email">Email</TabsTrigger>
                    </TabsList>
                    <TabsContent value="wallet" className="space-y-4">
                      <p className="text-gray-600">
                        Connect your Web3 wallet to get started
                      </p>
                      <Button
                        onClick={handleConnectWallet}
                        className="w-full gap-2"
                      >
                        <Wallet className="h-4 w-4" />
                        Connect Wallet
                      </Button>
                    </TabsContent>
                    <TabsContent value="email" className="space-y-4">
                      {isSignUp && (
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleEmailAuth} 
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
                      </Button>
                      <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="w-full text-center text-gray-600 transition-colors hover:text-[var(--brand)]"
                      >
                        {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                      </button>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
