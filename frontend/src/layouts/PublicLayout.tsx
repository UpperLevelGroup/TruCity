import { Outlet } from "react-router-dom";
//import Navbar from "./Navbar";


export default function PublicLayout() {
  return (
    <div style={styles.page}>

     

      <main>
        <Outlet />
        
      </main>

    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100%",
  },
};