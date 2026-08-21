import {
Routes,
Route
} from "react-router-dom";


import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";


export default function AppRoutes(){

return (

<Routes>


<Route path="/" element={<Home/>}/>


<Route 
path="/login"
element={<Login/>}
/>


<Route 
path="/register"
element={<Register/>}
/>


<Route
path="/dashboard"
element={<Dashboard/>}
/>


</Routes>

)

}