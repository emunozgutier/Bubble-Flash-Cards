import React from 'react';
import './PageBorder.css';

const PageBorder = ({ children }) => {
    return (
        <div className="page-border-container">
            <div className="page-border-content">
                {children}
            </div>
        </div>
    );
};

export default PageBorder;
