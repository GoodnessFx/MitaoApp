import { RouterProvider } from "react-router";
import { router } from "./app/routes";
import DemoBanner from "./components/DemoBanner";
import SplashScreen from "./components/SplashScreen";
import InstallPrompt from "./components/InstallPrompt";

export default function App() {
  return (
    <>
      <DemoBanner />
      <SplashScreen />
      <RouterProvider router={router} />
      <InstallPrompt />
    </>
  );
}
