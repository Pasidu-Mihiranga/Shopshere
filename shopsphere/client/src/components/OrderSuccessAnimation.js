import React, { useState, useEffect } from 'react';

const OrderSuccessAnimation = ({ orderNumber, onGoHome, onViewOrders, onComplete }) => {
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    const stages = [
      { delay: 0, stage: 1 },     // Start animation
      { delay: 500, stage: 2 },   // Show checkmark
      { delay: 1000, stage: 3 },  // Show success message
      { delay: 1500, stage: 4 },  // Show order details
      { delay: 2500, stage: 5 }   // Show buttons
    ];

    stages.forEach(({ delay, stage }) => {
      setTimeout(() => setAnimationStage(stage), delay);
    });

    // Call onComplete when animation finishes - MUCH LONGER TIME FOR BUTTONS
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 15000); // Extended from 3000ms to 15000ms (15 seconds)
  }, [onComplete]);

  return (
    <div className="order-success-overlay">
      <div className="order-success-modal">
        {/* Animated Background Circles */}
        <div className="success-bg-circle circle-1"></div>
        <div className="success-bg-circle circle-2"></div>
        <div className="success-bg-circle circle-3"></div>

        {/* Main Success Icon */}
        <div className={`success-icon-container ${animationStage >= 1 ? 'animate' : ''}`}>
          <div className={`success-circle ${animationStage >= 2 ? 'completed' : ''}`}>
            <div className={`checkmark ${animationStage >= 2 ? 'draw' : ''}`}>
              <svg viewBox="0 0 52 52">
                <circle 
                  className="checkmark-circle" 
                  cx="26" 
                  cy="26" 
                  r="25" 
                  fill="none"
                />
                <path 
                  className="checkmark-check" 
                  fill="none" 
                  d="m14.1 27.2l7.1 7.2 16.7-16.8"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className={`success-content ${animationStage >= 3 ? 'show' : ''}`}>
          <h1 className="success-title">Order Confirmed!</h1>
          <p className="success-subtitle">Thank you for your purchase</p>
        </div>

        {/* Order Details */}
        <div className={`order-details ${animationStage >= 4 ? 'show' : ''}`}>
          
          <div className="success-message">
            <p>Your order has been successfully placed and is being processed.</p>
            <p>You will receive a confirmation email shortly.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`success-actions ${animationStage >= 5 ? 'show' : ''}`}>
          <button 
            className="btn-primary btn-home"
            onClick={onGoHome}
          >
            Continue Shopping
          </button>
          
        </div>

        {/* Floating Particles */}
        <div className="success-particles">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className={`particle particle-${i + 1} ${animationStage >= 2 ? 'animate' : ''}`}
            ></div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .order-success-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(10px);
        }

        .order-success-modal {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border-radius: 24px;
          padding: 3rem;
          text-align: center;
          position: relative;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }

        /* Background Circles */
        .success-bg-circle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(45deg, #FF6B35, #FF8C42);
          opacity: 0.1;
        }

        .circle-1 {
          width: 200px;
          height: 200px;
          top: -100px;
          right: -100px;
          animation: float 6s ease-in-out infinite;
        }

        .circle-2 {
          width: 150px;
          height: 150px;
          bottom: -75px;
          left: -75px;
          animation: float 8s ease-in-out infinite reverse;
        }

        .circle-3 {
          width: 100px;
          height: 100px;
          top: 50%;
          left: -50px;
          animation: float 10s ease-in-out infinite;
        }

        /* Success Icon Animation */
        .success-icon-container {
          margin-bottom: 2rem;
          transform: scale(0);
          transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .success-icon-container.animate {
          transform: scale(1);
        }

        .success-circle {
          width: 120px;
          height: 120px;
          margin: 0 auto;
          position: relative;
          transform: scale(0.8);
          transition: transform 0.3s ease;
        }

        .success-circle.completed {
          transform: scale(1);
        }

        .checkmark {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: block;
          stroke-width: 3;
          stroke: #FF6B35;
          stroke-miterlimit: 10;
          margin: 0 auto;
          box-shadow: inset 0px 0px 0px #FF6B35;
          animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
          position: relative;
        }

        .checkmark-circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 3;
          stroke-miterlimit: 10;
          stroke: #FF6B35;
          fill: rgba(255, 107, 53, 0.1);
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }

        .checkmark-check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          stroke: #FF6B35;
          stroke-width: 4;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }

        /* Content Animations */
        .success-content, .order-details, .success-actions {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease;
        }

        .success-content.show, .order-details.show, .success-actions.show {
          opacity: 1;
          transform: translateY(0);
        }

        .success-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #FF6B35;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, #FF6B35, #FF8C42);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .success-subtitle {
          font-size: 1.2rem;
          color: #666;
          margin: 0 0 2rem 0;
        }

        .order-details {
          background: linear-gradient(135deg, #FFF4F0, #FFE8E0);
          border-radius: 16px;
          padding: 1.5rem;
          margin: 2rem 0;
          border: 2px solid rgba(255, 107, 53, 0.1);
        }

        .order-number {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 107, 53, 0.2);
        }

        .order-number .label {
          font-weight: 600;
          color: #333;
        }

        .order-number .value {
          font-weight: 700;
          color: #FF6B35;
          font-family: 'Courier New', monospace;
        }

        .success-message p {
          margin: 0.5rem 0;
          color: #555;
          line-height: 1.6;
        }

        /* Action Buttons */
        .success-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn-primary, .btn-secondary {
          flex: 1;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .btn-primary {
          background: linear-gradient(135deg, #FF6B35, #FF8C42);
          color: white;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
        }

        .btn-secondary {
          background: white;
          color: #FF6B35;
          border: 2px solid #FF6B35;
        }

        .btn-secondary:hover {
          background: #FF6B35;
          color: white;
          transform: translateY(-2px);
        }

        /* Floating Particles */
        .success-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #FF6B35;
          border-radius: 50%;
          opacity: 0;
        }

        .particle.animate {
          animation: particleFloat 3s ease-out forwards;
        }

        .particle-1 { left: 20%; animation-delay: 0.1s; }
        .particle-2 { left: 30%; animation-delay: 0.2s; }
        .particle-3 { left: 50%; animation-delay: 0.3s; }
        .particle-4 { left: 70%; animation-delay: 0.4s; }
        .particle-5 { left: 80%; animation-delay: 0.5s; }
        .particle-6 { right: 20%; animation-delay: 0.6s; }
        .particle-7 { right: 30%; animation-delay: 0.7s; }
        .particle-8 { right: 50%; animation-delay: 0.8s; }
        .particle-9 { left: 10%; animation-delay: 0.9s; }
        .particle-10 { left: 60%; animation-delay: 1s; }
        .particle-11 { right: 10%; animation-delay: 1.1s; }
        .particle-12 { right: 40%; animation-delay: 1.2s; }

        /* Keyframe Animations */
        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes scale {
          0%, 100% {
            transform: none;
          }
          50% {
            transform: scale3d(1.1, 1.1, 1);
          }
        }

        @keyframes fill {
          100% {
            box-shadow: inset 0px 0px 0px 60px rgba(255, 107, 53, 0.1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        @keyframes particleFloat {
          0% {
            opacity: 0;
            transform: translateY(100px) scale(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-50px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-200px) scale(0);
          }
        }

        /* Responsive Design */
        @media (max-width: 600px) {
          .order-success-modal {
            padding: 2rem 1.5rem;
            margin: 1rem;
          }

          .success-title {
            font-size: 2rem;
          }

          .success-actions {
            flex-direction: column;
          }

          .checkmark {
            width: 100px;
            height: 100px;
          }

          .success-circle {
            width: 100px;
            height: 100px;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderSuccessAnimation;