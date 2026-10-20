import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import Catalog from './pages/Catalog.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import MyOrders from './pages/MyOrders.jsx';
import Repair from './pages/Repair.jsx';
import MyRepairs from './pages/MyRepairs.jsx';
import MasterPanel from './pages/MasterPanel.jsx';
import SellerPanel from './pages/SellerPanel.jsx';
import AdminPanel from './pages/AdminPanel.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/product/:id" element={<Product />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/repair" element={<Repair />} />
      <Route path="/my-repairs" element={<MyRepairs />} />
      <Route path="/master" element={<MasterPanel />} />
      <Route path="/seller" element={<SellerPanel />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  );
}