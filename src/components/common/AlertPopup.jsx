import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

const AlertPopup = ({ open, message, type = 'error', onClose, duration = 2500 }) => {
    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                onClose && onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [open, onClose, duration]);

    if (!open) return null;
    return ReactDOM.createPortal(
        <Fade in={open} timeout={400} unmountOnExit>
            <Box
                sx={{
                    position: 'fixed',
                    top: 32,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 3000,
                    minWidth: 320,
                    maxWidth: '80vw',
                }}
            >
                <Alert 
                    severity={type} 
                    sx={{ 
                        fontSize: 16, 
                        px: 3, 
                        py: 2, 
                        boxShadow: 2,
                        ...(type === 'success' && {
                            backgroundColor: '#eaf7ea', // nền xanh nhạt
                            color: '#388e3c', // chữ xanh đậm
                            border: '1px solid #388e3c',
                            '.MuiAlert-icon': { color: '#388e3c' },
                        })
                    }}
                >
                    {message}
                </Alert>
            </Box>
        </Fade>,
        document.body
    );
};

export default AlertPopup; 