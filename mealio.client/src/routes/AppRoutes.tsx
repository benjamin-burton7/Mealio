import { Routes, Route } from "react-router-dom"
import Home from "../pages/Home"
import RestaurantMenu from "../pages/RestaurantMenu"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/restaurant/:id" element={<RestaurantMenu />} />
    </Routes>
  )
}