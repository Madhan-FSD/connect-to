import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { saveAuth } from "@/lib/auth";
import { Mail, Shield, User, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authApi } from "@/lib/api";

type LoginStep = "email" | "otp" | "child-select";

type ChildInfo = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
};

export const Login = () => {
  const [loginType, setLoginType] = useState<"parent" | "child">("parent");
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [children, setChildren] = useState<Array<ChildInfo>>([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authApi.loginEmailCheck(email);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
        return;
      }

      if (!result.hasAccount) {
        toast({
          variant: "destructive",
          title: "No Account Found",
          description: "Please sign up first.",
        });
        return;
      }

      if (loginType === "child" && result.hasChildren) {
        setChildren(result.children);
        setStep("child-select");
      } else if (loginType === "parent") {
        const otpResult = await authApi.sendOtp(email);
        if (otpResult.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: otpResult.error,
          });
        } else {
          toast({
            title: "OTP Sent",
            description: "Check your email for the login code",
          });
          setStep("otp");
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check email. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authApi.login(email, otp);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.error,
        });
      } else {
        saveAuth({
          userId: result.userId,
          email: email,
          name: result.name,
          role: result.role,
          token: result.token,
          children: result.children,
        });
        toast({
          title: "Welcome back!",
          description: "Login successful",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log in. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChildLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const child = children.find((c) => c.id === selectedChild);
      const childFullName = child
        ? `${child.firstName} ${child.lastName}`
        : "Child";

      // The selectedChild state holds the child's ID (the correct value).
      // This call correctly passes: (email, childId, accessCode)
      const result = await authApi.loginChild(email, selectedChild, accessCode);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.error,
        });
      } else {
        saveAuth({
          userId: result.child.id,
          email: email,
          name: `${result.child.firstName} ${result.child.lastName}`,
          role: result.role,
          token: result.token,
          parentId: result.parentId,
        });
        toast({
          title: `Welcome, ${childFullName}!`,
          description: "Login successful",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log in. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={loginType}
            onValueChange={(v) => {
              setLoginType(v as "parent" | "child");
              setStep("email");
              setEmail("");
            }}
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="parent">Parent/User</TabsTrigger>
              <TabsTrigger value="child">Child</TabsTrigger>
            </TabsList>

            <TabsContent value="parent">
              {step === "email" && (
                <form onSubmit={handleEmailCheck} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}

              {step === "otp" && (
                <form onSubmit={handleParentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">One-Time Password</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        className="pl-10"
                        maxLength={6}
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                        }
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    Sign In
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setStep("email")}
                  >
                    Back
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="child">
              {step === "email" && (
                <form onSubmit={handleEmailCheck} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="parent-email">Parent's Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="parent-email"
                        type="email"
                        placeholder="parent@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}

              {step === "child-select" && (
                <form onSubmit={handleChildLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="child-select">Select Your Name</Label>
                    <Select
                      value={selectedChild}
                      onValueChange={setSelectedChild}
                      required
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your name" />
                      </SelectTrigger>
                      <SelectContent>
                        {children.map((child) => (
                          <SelectItem key={child.id} value={child.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {/* Using firstName and lastName from the schema */}
                              {`${child.firstName} ${child.lastName}`} (
                              {child.age} years)
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="access-code">Access Code (PIN)</Label>
                    <Input
                      id="access-code"
                      type="password"
                      placeholder="Enter your access code (PIN)"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      required
                      disabled={loading}
                      maxLength={4} // Assuming a typical 4-digit PIN based on context
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading || !selectedChild || !accessCode.trim()}
                  >
                    Sign In as Child
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setStep("email");
                      setSelectedChild("");
                      setAccessCode("");
                    }}
                  >
                    Back to Email
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => navigate("/auth/signup")}
            >
              Sign up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
