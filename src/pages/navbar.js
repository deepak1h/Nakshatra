import React from 'react'
import Logo from "../images/logo-black.png"
import "./css/navbar.css";

const Navbar = () => {
  return (
    <div className='navbar-body'>
        <div className='navbar-logo'>
            <img src={Logo}></img>
            <span>Nakshatra</span>
        </div>
        <div className='navbar-menu'>
            <span>Kundali</span>
            <span>Rashifal</span>
            <span>shop</span>
        </div>
    </div>
  )
}

export default Navbar