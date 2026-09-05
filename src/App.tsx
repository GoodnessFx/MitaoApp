import { RouterProvider } from "react-router";
import { router } from "./app/routes";
import SplashScreen from "./components/SplashScreen";
import InstallPrompt from "./components/InstallPrompt";

export default function App() {
  return (
    <>
      <SplashScreen />
      <RouterProvider router={router} />
      <InstallPrompt />
    </>
  );
}
