import WelcomePage from "./components/WelcomePage";

export default function TaskpaneApp() {
  const handleGetStarted = () => {
    console.log("Get Started clicked");
  };

  return <WelcomePage onGetStarted={handleGetStarted} />;
}
