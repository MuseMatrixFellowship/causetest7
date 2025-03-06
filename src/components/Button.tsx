import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="text-white underline hover:no-underline focus:outline-none"
    >
      {children}
    </button>
  );
};

export default Button;
