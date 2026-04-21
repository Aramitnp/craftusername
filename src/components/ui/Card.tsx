import React from "react";
import styles from "./ui.module.css";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ hoverable = false, className = "", children, ...props }: CardProps) {
  return (
    <div 
      className={`${styles.card} ${hoverable ? styles.cardHoverable : ""} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
}
