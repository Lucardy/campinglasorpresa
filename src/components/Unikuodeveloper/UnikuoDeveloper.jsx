import React from "react";
import './UnikuoDeveloper.css';
import { FaCode, FaHeart, FaArrowRight } from 'react-icons/fa';

const UnikuoDeveloper = () => {
    return (
        <footer className="developer-footer">
            <div className="developer-content">
                <div className="developer-text">
                    <span className="developer-label">Desarrollado con</span>
                    <FaHeart className="heart-icon" />
                    <span className="developer-label">por</span>
                    <a 
                        className="developer-link" 
                        href="https://www.unikuoweb.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        <div className="link-content">
                            <div className="link-left">
                                <FaCode className="code-icon" />
                                <span className="link-text">Unikuo</span>
                            </div>
                            <div className="link-right">
                                <span className="link-label">Web Development</span>
                                <FaArrowRight className="arrow-icon" />
                            </div>
                        </div>
                    </a>
                </div>
                <div className="developer-trademark">
                    <span className="tm-symbol">™</span>
                    <span className="tm-text">Unikuo Web Development</span>
                </div>
            </div>
        </footer>
    );
};

export default UnikuoDeveloper;