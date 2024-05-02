import './App.css';
import Home from "./pages/home";
import Kundali from './pages/kundali';
import Navbar from "./pages/navbar"
function App() {
  return (
    <div className="App">
      <Navbar/>
      <Kundali/>
    </div>
  );
}


export default App;