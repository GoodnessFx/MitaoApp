import { RouterProvider } from "react-router";
import { router } from "./app/routes";
import SplashScreen from "./components/SplashScreen";

export default function App() {
  return (
    <>
      <SplashScreen />
      <RouterProvider router={router} />
    </>
  );
}
