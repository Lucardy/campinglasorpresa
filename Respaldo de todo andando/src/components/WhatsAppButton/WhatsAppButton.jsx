import React, { useState, useRef, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import './WhatsAppButton.css';

const WhatsAppButton = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isChatVisible, setIsChatVisible] = useState(false);
    const chatRef = useRef(null);
    const buttonRef = useRef(null);
    const containerRef = useRef(null);
    const phoneNumber = '5492664639082';
    const location = useLocation();
    
    const handleClick = () => {
        const url = `https://api.whatsapp.com/send/?phone=${phoneNumber}`;
        window.open(url, '_blank');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsChatVisible(false);
                setIsHovered(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleMouseEnter = () => {
            setIsHovered(true);
            setIsChatVisible(true);
        };

        const handleMouseLeave = (e) => {
            if (buttonRef.current && chatRef.current) {
                const buttonRect = buttonRef.current.getBoundingClientRect();
                const chatRect = chatRef.current.getBoundingClientRect();
                
                const combinedArea = {
                    top: Math.min(buttonRect.top, chatRect.top) - 10,
                    right: Math.max(buttonRect.right, chatRect.right) + 10,
                    bottom: Math.max(buttonRect.bottom, chatRect.bottom) + 10,
                    left: Math.min(buttonRect.left, chatRect.left) - 10
                };
                
                if (
                    e.clientX >= combinedArea.left &&
                    e.clientX <= combinedArea.right &&
                    e.clientY >= combinedArea.top &&
                    e.clientY <= combinedArea.bottom
                ) {
                    return;
                }
            }
            
            setIsHovered(false);
            setTimeout(() => {
                if (!isHovered) {
                    setIsChatVisible(false);
                }
            }, 300);
        };

        const button = buttonRef.current;
        if (button) {
            button.addEventListener('mouseenter', handleMouseEnter);
            button.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            if (button) {
                button.removeEventListener('mouseenter', handleMouseEnter);
                button.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [isHovered]);

    // Verificar la ruta después de todos los hooks
    if (location.pathname === '/admin') {
        return null;
    }

    return (
        <div className="whatsapp-container" ref={containerRef}>
            {isChatVisible && (
                <div 
                    className="chat-bubble"
                    ref={chatRef}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => {
                        setIsHovered(false);
                        setTimeout(() => {
                            if (!isHovered) {
                                setIsChatVisible(false);
                            }
                        }, 300);
                    }}
                >
                    <div className="chat-header">
                        <div className="chat-avatar">
                            <FaWhatsapp className="icon" />
                        </div>
                        <div className="chat-info">
                            <h4>Camping La Sorpresa</h4>
                            <span className="chat-status">En línea</span>
                        </div>
                    </div>
                    <div className="chat-message">
                        <p>¡Hola! Somos Camping La Sorpresa. Estamos a tu disposición para cualquier consulta. ¡Contáctanos!</p>
                    </div>
                    <div className="chat-action">
                        <button onClick={handleClick}>
                            <FaWhatsapp className="icon" />
                            <span>Reservar Ahora</span>
                        </button>
                    </div>
                </div>
            )}
            <button 
                className="whatsapp-button"
                onClick={handleClick}
                aria-label="Contactar por WhatsApp"
                ref={buttonRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                    setIsHovered(false);
                    setTimeout(() => {
                        if (!isHovered) {
                            setIsChatVisible(false);
                        }
                    }, 300);
                }}
            >
                <div className="button-content">
                    <FaWhatsapp className="icon" />
                    <span className="button-text">Reservar Ahora</span>
                </div>
            </button>
        </div>
    );
};

export default WhatsAppButton; 