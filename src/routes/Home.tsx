import { logOut } from "../lib/auth"
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
    await logOut();
    } catch (e) {
      console.error("Error: ", e)
    } finally {
      navigate("/")
    }
  }

  return (
    <div>
      Home
        <button onClick={handleSignOut} className="text-red-500">Log out</button>
    </div>
    
  )
}

export default Home