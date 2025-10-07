import SignUp from "./SignUp";
import Login from "./Login";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function AuthTab() {
  return (
    <Tabs defaultValue="Signup" className="p-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="Login">LogIn</TabsTrigger>
        <TabsTrigger value="Signup">Create Account</TabsTrigger>
      </TabsList>
      <TabsContent value="Login">
        <Login />
      </TabsContent>
      <TabsContent value="Signup">
        <SignUp />
      </TabsContent>
    </Tabs>
  );
}

export default AuthTab;
