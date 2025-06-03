import React from 'react';
import './FlashSaleAd.css';
import { NavLink } from "react-router-dom";

const FlashSaleAd = () => {
  return (
    <div className="flash-sale-container">
      <div className="flash-sale-content">
        <div className="flash-sale-text">
          <h1>Flash Sale: Limited Time Offers You Can't Resist!</h1>
          <p className='AP1'>
            Unlock amazing savings on top-rated items - hurry, these<br></br> deals won't last!
            Discover unbeatable prices on the hottest<br></br> products. Act now and save big!
          </p>
          <NavLink to="/flash-sale">
            <button className="shop-now-button">Shop now</button>
          </NavLink>
          
          
        </div>
        
        <div className="FlashSaleAdImg">
        <img src="/FlashSaleAdImages/FlashSaleAd.jpg" alt="Adimage" className="FlashSaleAdImage" />
        </div>
      </div>
    </div>
  );
};

export default FlashSaleAd;